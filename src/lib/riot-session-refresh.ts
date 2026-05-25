import type { StoredRiotAccount, StoredRiotCookie } from '@/lib/account';
import { RIOT_LOGIN_URL } from '@/constants/riot';
import { AuthRecoveryRequired } from '@/lib/auth-recovery';
import { captureRiotAuthCookies, clearRiotCookies, injectRiotAuthCookies } from '@/lib/riot-cookies';
import { readRiotAccessTokenFromRedirectUri } from '@/lib/riot-login';
import { getAuthCookies } from '@/lib/secure-auth-store';

export type RiotSessionRefreshResult = {
  accessToken: string;
  cookies: StoredRiotCookie[];
};

type RiotSessionRefreshWebViewRequest = {
  sourceUri: string;
};

export type RiotSessionRefreshWebViewResult =
  | { kind: 'redirect'; uri: string }
  | { kind: 'loginRequired' }
  | { kind: 'networkUnavailable'; message: string };

type RiotSessionRefreshWebViewAdapter = (
  request: RiotSessionRefreshWebViewRequest,
) => Promise<RiotSessionRefreshWebViewResult>;

const ADAPTER_WAIT_MS = 2000;

let adapter: RiotSessionRefreshWebViewAdapter | null = null;
let adapterWaiters: ((adapter: RiotSessionRefreshWebViewAdapter | null) => void)[] = [];
let globalQueue: Promise<unknown> = Promise.resolve();
const flights = new Map<string, Promise<RiotSessionRefreshResult>>();

export function registerRiotSessionRefreshWebView(nextAdapter: RiotSessionRefreshWebViewAdapter) {
  adapter = nextAdapter;
  const waiters = adapterWaiters;
  adapterWaiters = [];
  waiters.forEach((resolve) => resolve(nextAdapter));
  return () => {
    if (adapter === nextAdapter) {
      adapter = null;
    }
  };
}

export async function refreshStoredRiotSession(account: StoredRiotAccount) {
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

async function runQueuedSessionRefresh(account: StoredRiotAccount) {
  const nextAdapter = await waitForAdapter(account.id);
  const queued = globalQueue.then(() => runSessionRefresh(account, nextAdapter));
  globalQueue = queued.catch(() => undefined);
  return queued;
}

async function runSessionRefresh(account: StoredRiotAccount, nextAdapter: RiotSessionRefreshWebViewAdapter) {
  const cookies = await getAuthCookies(account.id);
  if (!cookies?.length) {
    throw new AuthRecoveryRequired(account.id, 'missingCookies', 'interactiveLoginRequired', 'Saved Riot sign-in has expired.');
  }

  await clearRiotCookies();
  try {
    await injectRiotAuthCookies(cookies);
    const result = await nextAdapter({ sourceUri: RIOT_LOGIN_URL });
    if (result.kind === 'loginRequired') {
      throw new AuthRecoveryRequired(account.id, 'cookieReauthFailed', 'interactiveLoginRequired', 'Riot requires sign-in again.');
    }
    if (result.kind === 'networkUnavailable') {
      throw new AuthRecoveryRequired(account.id, 'networkUnavailable', 'temporaryAuthUnavailable', result.message);
    }
    return {
      accessToken: readRiotAccessTokenFromRedirectUri(result.uri),
      cookies: await captureRiotAuthCookies(),
    };
  } finally {
    await clearRiotCookies();
  }
}

async function waitForAdapter(accountId: string) {
  if (adapter) {
    return adapter;
  }

  const nextAdapter = await new Promise<RiotSessionRefreshWebViewAdapter | null>((resolve) => {
    const timeout = setTimeout(() => {
      adapterWaiters = adapterWaiters.filter((waiter) => waiter !== resolve);
      resolve(null);
    }, ADAPTER_WAIT_MS);
    adapterWaiters.push((value) => {
      clearTimeout(timeout);
      resolve(value);
    });
  });

  if (!nextAdapter) {
    if (__DEV__) {
      throw new Error('Riot session refresh WebView did not register within 2 seconds.');
    }
    throw new AuthRecoveryRequired(
      accountId,
      'providerUnavailable',
      'temporaryAuthUnavailable',
      'Session refresh is temporarily unavailable.',
    );
  }

  return nextAdapter;
}
