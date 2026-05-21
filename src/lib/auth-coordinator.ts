import type { StoredRiotAccount, StoredRiotCookie } from '@/lib/account';

export type AuthRecoveryReason =
  | 'missingTokens'
  | 'missingCookies'
  | 'cookieReauthFailed'
  | 'identityMismatch'
  | 'providerUnavailable'
  | 'networkUnavailable';

export type AuthRecoveryKind = 'interactiveLoginRequired' | 'temporaryAuthUnavailable';

export type SilentReauthResult = {
  accessToken: string;
  cookies: StoredRiotCookie[];
};

type SilentReauthRunner = (account: StoredRiotAccount) => Promise<SilentReauthResult>;

const RUNNER_WAIT_MS = 2000;

let runner: SilentReauthRunner | null = null;
let runnerWaiters: ((runner: SilentReauthRunner | null) => void)[] = [];
let globalQueue: Promise<unknown> = Promise.resolve();
const flights = new Map<string, Promise<SilentReauthResult>>();

export class AuthRecoveryRequired extends Error {
  constructor(
    readonly accountId: string,
    readonly reason: AuthRecoveryReason,
    readonly recoveryKind: AuthRecoveryKind,
    message = 'Authentication recovery is required.',
  ) {
    super(message);
  }
}

export function registerSilentReauthRunner(nextRunner: SilentReauthRunner) {
  runner = nextRunner;
  const waiters = runnerWaiters;
  runnerWaiters = [];
  waiters.forEach((resolve) => resolve(nextRunner));
  return () => {
    if (runner === nextRunner) {
      runner = null;
    }
  };
}

export async function requestSilentReauth(account: StoredRiotAccount) {
  const existing = flights.get(account.id);
  if (existing) {
    return existing;
  }

  const flight = runQueuedSilentReauth(account).finally(() => {
    flights.delete(account.id);
  });
  flights.set(account.id, flight);
  return flight;
}

export function isAuthRecoveryRequired(error: unknown): error is AuthRecoveryRequired {
  return error instanceof AuthRecoveryRequired;
}

async function runQueuedSilentReauth(account: StoredRiotAccount) {
  const nextRunner = await waitForRunner(account.id);
  const queued = globalQueue.then(() => nextRunner(account));
  globalQueue = queued.catch(() => undefined);
  return queued;
}

async function waitForRunner(accountId: string) {
  if (runner) {
    return runner;
  }

  const nextRunner = await new Promise<SilentReauthRunner | null>((resolve) => {
    const timeout = setTimeout(() => {
      runnerWaiters = runnerWaiters.filter((waiter) => waiter !== resolve);
      resolve(null);
    }, RUNNER_WAIT_MS);
    runnerWaiters.push((value) => {
      clearTimeout(timeout);
      resolve(value);
    });
  });

  if (!nextRunner) {
    if (__DEV__) {
      throw new Error('Silent reauth provider did not register within 2 seconds.');
    }
    throw new AuthRecoveryRequired(
      accountId,
      'providerUnavailable',
      'temporaryAuthUnavailable',
      'Session refresh is temporarily unavailable.',
    );
  }

  return nextRunner;
}
