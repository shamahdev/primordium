import { jwtDecode } from 'jwt-decode';

import {
  buildRiotAuthorizedHeaders,
  fetchRiotEntitlementsToken,
  isRiotHttpAuthFailure,
  riotFetch,
  RiotHttpError,
} from '@/commons/lib/http';
import { log } from '@/commons/lib/logger';
import { getLoginHref, getSwitchAccountHref, type AccountReturnToRoute } from '@/modules/account/helpers/get-account-navigation-href';
import {
  ACCOUNT_RIOT_LOGIN_URL,
  ACCOUNT_TOKEN_REFRESH_WINDOW_MS,
} from '@/modules/account/account-constants';
import { useAccountStore } from '@/modules/account/account-store';
import {
  type Account,
  type AccountProfile,
  type AccountRecoveryAction,
  AccountRecoveryError,
  type AccountSession,
  type AccountShard,
  type AccountTokens,
  getAccountId,
  isAccountRecoveryError,
} from '@/modules/account/account-type';
import {
  deleteAuthMaterial,
  deleteCookies,
  getCookies,
  getTokens,
} from '@/modules/account/adapters/account-secure-storage.adapter';
import { waitForWebViewRefreshAdapter } from '@/modules/account/adapters/account-webview-refresh.adapter';
import {
  captureAccountCookies,
  clearAccountCookies,
  injectAccountCookies,
} from '@/modules/account/helpers/manage-account-cookies';
import { parseAccountRedirectToken } from '@/modules/account/helpers/parse-account-redirect-token';

// ===== Domain Response Types =====

type NameServiceResponse = {
  DisplayName?: string;
  Subject: string;
  GameName: string;
  TagLine: string;
}[];

type AccountXPResponse = {
  Progress: {
    Level: number;
    XP: number;
  };
};

type WalletResponse = {
  Balances: Record<string, number>;
};

const CURRENCY_IDS = {
  vp: '85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741',
  radianite: 'e59aa87c-4cbf-517a-5983-6e81511be9b7',
  kingdomCredits: '85ca954a-41f2-ce94-9b45-8ca3dd39a00d',
} as const;

// ===== Internal Helpers =====

async function getPlayerName(accessToken: string, entitlementsToken: string, puuid: string, shard: AccountShard) {
  const response = await riotFetch<NameServiceResponse>(`https://pd.${shard}.a.pvp.net/name-service/v2/players`, {
    method: 'PUT',
    headers: await buildRiotAuthorizedHeaders({ accessToken, entitlementsToken }),
    body: JSON.stringify([puuid]),
  });

  const player = response[0];
  if (!player) {
    throw new RiotHttpError('Riot account did not resolve in the selected Region. Check the Region and try again.');
  }
  return player;
}

async function fetchProfileWithTokens(account: Account, tokens: AccountTokens): Promise<AccountProfile> {
  const headers = await buildRiotAuthorizedHeaders(tokens);
  const [xp, wallet] = await Promise.all([
    riotFetch<AccountXPResponse>(`https://pd.${account.shard}.a.pvp.net/account-xp/v1/players/${account.puuid}`, {
      headers,
    }),
    riotFetch<WalletResponse>(`https://pd.${account.shard}.a.pvp.net/store/v1/wallet/${account.puuid}`, {
      headers,
    }),
  ]);

  return {
    level: xp.Progress.Level,
    xp: xp.Progress.XP,
    balances: {
      vp: wallet.Balances[CURRENCY_IDS.vp] ?? 0,
      radianite: wallet.Balances[CURRENCY_IDS.radianite] ?? 0,
      kingdomCredits: wallet.Balances[CURRENCY_IDS.kingdomCredits] ?? 0,
    },
    fetchedAt: new Date().toISOString(),
  };
}

async function withAuthorizedTokens<T>(
  account: Account,
  request: (tokens: AccountTokens) => Promise<T>,
): Promise<T> {
  log.api.debug('withAuthorizedTokens: getting tokens', { accountId: account.id });
  const tokens = await getValidTokens(account);
  try {
    return await request(tokens);
  } catch (error) {
    if (!isRiotHttpAuthFailure(error)) {
      throw error;
    }
    log.api.warn('withAuthorizedTokens: first attempt auth failure, refreshing', { accountId: account.id });
  }

  const refreshedTokens = await refreshTokens(account, true);
  try {
    return await request(refreshedTokens);
  } catch (error) {
    if (isRiotHttpAuthFailure(error)) {
      log.api.error('withAuthorizedTokens: second attempt auth failure, rejecting', { accountId: account.id });
      await rejectAuth(account.id, 'cookieReauthFailed');
    }
    throw error;
  }
}

async function getValidTokens(account: Account) {
  if (account.status === 'needsReauth') {
    throw new AccountRecoveryError(account.id, 'missingTokens', 'interactiveLoginRequired', 'Sign in again.');
  }

  const tokens = await getTokens(account.id);
  if (!tokens) {
    return refreshTokens(account, false);
  }

  if (shouldRefreshTokens(tokens)) {
    return refreshTokens(account, false);
  }

  return tokens;
}

function shouldRefreshTokens(tokens: AccountTokens) {
  if (!tokens.expiresAt) {
    return false;
  }
  return new Date(tokens.expiresAt).getTime() - Date.now() <= ACCOUNT_TOKEN_REFRESH_WINDOW_MS;
}

let globalQueue: Promise<unknown> = Promise.resolve();
const flights = new Map<string, Promise<AccountSession>>();

async function refreshTokens(account: Account, force: boolean) {
  log.auth.info('refreshTokens: starting', { accountId: account.id, force });
  try {
    const result = await runSessionRefresh(account);
    log.auth.info('refreshTokens: session refreshed OK');
    const authenticated = await AccountService.authenticateLogin(result.accessToken, account.shard);
    if (authenticated.account.puuid !== account.puuid) {
      log.auth.error('refreshTokens: identity mismatch!', { expected: account.puuid, got: authenticated.account.puuid });
      await rejectAuth(account.id, 'identityMismatch');
    }
    await useAccountStore.getState().saveAuthenticatedAccount(authenticated.account, authenticated.tokens, result.cookies);
    log.auth.info('refreshTokens: account saved');
    return authenticated.tokens;
  } catch (error) {
    log.auth.error('refreshTokens: FAILED', {
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      isAuthRecovery: isAccountRecoveryError(error),
    });
    if (isAccountRecoveryError(error)) {
      if (error.recoveryKind === 'interactiveLoginRequired') {
        if (error.reason === 'cookieReauthFailed' || error.reason === 'missingCookies') {
          await deleteCookies(account.id);
        }
        useAccountStore.getState().markNeedsReauth(account.id);
      }
      throw error;
    }
    if (isRiotHttpAuthFailure(error)) {
      await rejectAuth(account.id, 'cookieReauthFailed');
    }
    if (!force && error instanceof TypeError) {
      throw new AccountRecoveryError(
        account.id,
        'networkUnavailable',
        'temporaryAuthUnavailable',
        'Network unavailable. Try again.',
      );
    }
    throw error;
  }
}

async function runSessionRefresh(account: Account) {
  const existing = flights.get(account.id);
  if (existing) {
    return existing;
  }

  const flight = runQueuedSessionRefresh(account).finally(() => {
    flights.delete(account.id);
  });
  flights.set(account.id, flight);
  return flight;
}

async function runQueuedSessionRefresh(account: Account) {
  const nextAdapter = await waitForWebViewRefreshAdapter();
  const queued = globalQueue.then(() => runRefreshWithAdapter(account, nextAdapter));
  globalQueue = queued.catch(() => undefined);
  return queued;
}

async function runRefreshWithAdapter(account: Account, nextAdapter: any) {
  const cookies = await getCookies(account.id);
  log.auth.debug('runSessionRefresh: cookies loaded', { accountId: account.id, cookieCount: cookies?.length ?? 0 });
  if (!cookies?.length) {
    log.auth.warn('runSessionRefresh: no cookies, throwing missingCookies');
    throw new AccountRecoveryError(account.id, 'missingCookies', 'interactiveLoginRequired', 'Saved Riot sign-in has expired.');
  }

  await clearAccountCookies();
  try {
    await injectAccountCookies(cookies);
    log.auth.debug('runSessionRefresh: cookies injected, calling adapter');
    const result = await nextAdapter({ sourceUri: ACCOUNT_RIOT_LOGIN_URL });
    log.auth.info('runSessionRefresh: adapter result', { kind: result.kind });
    if (result.kind === 'loginRequired') {
      throw new AccountRecoveryError(account.id, 'cookieReauthFailed', 'interactiveLoginRequired', 'Riot requires sign-in again.');
    }
    if (result.kind === 'networkUnavailable') {
      throw new AccountRecoveryError(account.id, 'networkUnavailable', 'temporaryAuthUnavailable', result.message);
    }
    return {
      accessToken: parseAccountRedirectToken(result.uri),
      cookies: await captureAccountCookies(),
    };
  } finally {
    await clearAccountCookies();
  }
}

async function rejectAuth(accountId: string, reason: 'cookieReauthFailed' | 'identityMismatch') {
  await deleteAuthMaterial(accountId);
  useAccountStore.getState().markNeedsReauth(accountId);
  throw new AccountRecoveryError(accountId, reason, 'interactiveLoginRequired', 'Sign in again.');
}

// ===== Public Factory =====

export const AccountService = {
  async authenticateLogin(accessToken: string, shard: AccountShard) {
    const decoded = jwtDecode<{
      sub: string;
      exp?: number;
    }>(accessToken);
    if (!decoded.sub) {
      throw new RiotHttpError('Riot token did not include a player id.');
    }

    const entitlementsToken = await fetchRiotEntitlementsToken(accessToken);
    const name = await getPlayerName(accessToken, entitlementsToken, decoded.sub, shard);
    const now = new Date().toISOString();
    const account: Account = {
      id: getAccountId(decoded.sub, shard),
      puuid: decoded.sub,
      gameName: name.GameName || name.DisplayName || '?',
      tagLine: name.TagLine || '',
      displayName: name.DisplayName || `${name.GameName}#${name.TagLine}`,
      shard,
      status: 'ready',
      createdAt: now,
      updatedAt: now,
    };

    const tokens: AccountTokens = {
      accessToken,
      entitlementsToken,
      savedAt: now,
      expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : undefined,
    };

    return { account, tokens };
  },

  refreshSession(account: Account) {
    return runSessionRefresh(account);
  },

  async ensureSession(account: Account) {
    await getValidTokens(account);
  },

  fetchProfile(account: Account): Promise<AccountProfile> {
    return withAuthorizedTokens(account, (tokens) => fetchProfileWithTokens(account, tokens));
  },

  request: withAuthorizedTokens,

  deleteAuthMaterial,

  getAccountRecoveryAction(error: unknown, accountId: string): AccountRecoveryAction {
    if (!isAccountRecoveryError(error)) {
      return {
        kind: 'unknownError',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    if (error.recoveryKind === 'temporaryAuthUnavailable') {
      return { kind: 'temporaryError', message: error.message };
    }

    return {
      kind: 'reauth',
      href: '/login',
    };
  },

  getStoredRiotSessionRecoveryAction({
    error,
    accountId,
    accountCount,
    returnTo,
    fallbackMessage,
    reauthMode = 'switchAccountWhenMultiple',
  }: {
    error: unknown;
    accountId: string;
    accountCount: number;
    returnTo: AccountReturnToRoute;
    fallbackMessage: string;
    reauthMode?: 'switchAccountWhenMultiple' | 'login';
  }): AccountRecoveryAction {
    const action = AccountService.getAccountRecoveryAction(error, accountId);
    if (action.kind === 'temporaryError') {
      return action;
    }
    if (action.kind === 'unknownError') {
      return { kind: 'unknownError', message: action.message || fallbackMessage };
    }
    return {
      kind: 'reauth',
      href: reauthMode === 'switchAccountWhenMultiple' && accountCount > 1
        ? getSwitchAccountHref({ reason: 'reauthFailed', accountId, returnTo })
        : getLoginHref({ mode: 'reauth', accountId, returnTo }),
    };
  },
};
