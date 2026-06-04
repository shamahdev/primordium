import type { Href } from 'expo-router';

import { isAuthRecoveryRequired } from '@/lib/auth-recovery';
import { getLoginHref, getSwitchAccountHref, type ReturnToRoute } from '@/lib/navigation';

type StoredRiotSessionRecoveryInput = {
  error: unknown;
  accountId: string;
  accountCount: number;
  returnTo: ReturnToRoute;
  fallbackMessage: string;
  reauthMode?: 'switchAccountWhenMultiple' | 'login';
};

export type StoredRiotSessionRecoveryAction =
  | { kind: 'temporaryError'; message: string }
  | { kind: 'reauth'; href: Href }
  | { kind: 'unknownError'; message: string };

export function getStoredRiotSessionRecoveryAction({
  error,
  accountId,
  accountCount,
  returnTo,
  fallbackMessage,
  reauthMode = 'switchAccountWhenMultiple',
}: StoredRiotSessionRecoveryInput): StoredRiotSessionRecoveryAction {
  if (!isAuthRecoveryRequired(error)) {
    return {
      kind: 'unknownError',
      message: error instanceof Error ? error.message : fallbackMessage,
    };
  }

  if (error.recoveryKind === 'temporaryAuthUnavailable') {
    return { kind: 'temporaryError', message: error.message };
  }

  return {
    kind: 'reauth',
    href: reauthMode === 'switchAccountWhenMultiple' && accountCount > 1
      ? getSwitchAccountHref({ reason: 'reauthFailed', accountId, returnTo })
      : getLoginHref({ mode: 'reauth', accountId, returnTo }),
  };
}
