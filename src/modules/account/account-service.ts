import { buildRiotAuthorizedHeaders, riotFetch } from '@/commons/lib/http';
import {
  type Account,
  type AccountProfile,
  type AccountRecoveryAction,
  type AccountTokens,
  isAccountRecoveryError,
} from '@/modules/account/account-type';
import { deleteAuthMaterial } from '@/modules/account/adapters/account-secure-storage.adapter';
import {
  getLoginHref,
  getSwitchAccountHref,
  type AccountReturnToRoute,
} from '@/modules/account/helpers/get-account-navigation-href';
import { authenticateLogin } from '@/modules/account/utils/account-authentication';
import { StoredRiotSession } from '@/modules/account/utils/stored-riot-session';

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

export const AccountService = {
  authenticateLogin,

  async ensureSession(account: Account) {
    await StoredRiotSession.ensure(account);
  },

  fetchProfile(account: Account): Promise<AccountProfile> {
    return StoredRiotSession.request(account, (tokens) => fetchProfileWithTokens(account, tokens));
  },

  request: StoredRiotSession.request,

  deleteAuthMaterial,

  getAccountRecoveryAction(error: unknown): AccountRecoveryAction {
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
    const action = AccountService.getAccountRecoveryAction(error);
    if (action.kind === 'temporaryError') {
      return action;
    }
    if (action.kind === 'unknownError') {
      return { kind: 'unknownError', message: action.message || fallbackMessage };
    }
    return {
      kind: 'reauth',
      href:
        reauthMode === 'switchAccountWhenMultiple' && accountCount > 1
          ? getSwitchAccountHref({ reason: 'reauthFailed', accountId, returnTo })
          : getLoginHref({ mode: 'reauth', accountId, returnTo }),
    };
  },
};
