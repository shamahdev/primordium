export type AuthRecoveryReason =
  | 'missingTokens'
  | 'missingCookies'
  | 'cookieReauthFailed'
  | 'identityMismatch'
  | 'providerUnavailable'
  | 'networkUnavailable';

export type AuthRecoveryKind = 'interactiveLoginRequired' | 'temporaryAuthUnavailable';

export class AuthRecoveryRequired extends Error {
  constructor(
    readonly accountId: string,
    readonly reason: AuthRecoveryReason,
    readonly recoveryKind: AuthRecoveryKind,
    message = 'Authentication recovery is required.',
  ) {
    super(message);
    this.name = 'AuthRecoveryRequired';
  }
}

export function isAuthRecoveryRequired(error: unknown): error is AuthRecoveryRequired {
  return error instanceof AuthRecoveryRequired;
}
