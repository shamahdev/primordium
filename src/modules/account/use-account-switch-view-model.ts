import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';


import { AccountService } from '@/modules/account/account-service';
import { useAccountStore } from '@/modules/account/account-store';
import {
  getLoginHref,
  getOnboardingHref,
  getReturnToHref,
  getSwitchAccountHref,
  sanitizeReturnToRoute,
  type AccountSwitchReason,
} from '@/modules/account/helpers/get-account-navigation-href';
import { log } from '@/commons/lib/logger';

export function useAccountSwitchViewModel() {
  const params = useLocalSearchParams<{ returnTo?: string; reason?: AccountSwitchReason; accountId?: string }>();
  const accounts = useAccountStore((state) => state.accounts);
  const activeAccountId = useAccountStore((state) => state.activeAccountId);
  const switchAccount = useAccountStore((state) => state.switchAccount);
  const removeAccount = useAccountStore((state) => state.removeAccount);
  const [busyAccountId, setBusyAccountId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const returnTo = sanitizeReturnToRoute(params.returnTo);
  const failedAccount = accounts.find((account) => account.id === params.accountId);

  const chooseAccount = async (accountId: string) => {
    const account = useAccountStore.getState().accounts.find((item) => item.id === accountId);
    if (!account) {
      return;
    }

    setBusyAccountId(account.id);
    setError(null);
    try {
      if (account.status === 'needsReauth') {
        routeToReauth(account.id);
        setBusyAccountId(null);
        return;
      }
      await AccountService.ensureSession(account);
      switchAccount(account.id);
      setBusyAccountId(null);
      const target = getReturnToHref(returnTo);
      log.nav.debug('switch-account choose: dismissAll + replace returnTo', { accountId, returnTo, target });
      router.dismissAll();
      router.replace(target);
    } catch (selectionError) {
      const recoveryAction = AccountService.getStoredRiotSessionRecoveryAction({
        error: selectionError,
        accountId: account.id,
        accountCount: accounts.length,
        returnTo,
        fallbackMessage: 'Could not switch account.',
        reauthMode: 'login',
      });
      if (recoveryAction.kind === 'reauth') {
        router.replace(recoveryAction.href);
      } else {
        setError(recoveryAction.message);
      }
      setBusyAccountId(null);
    }
  };

  const cancel = () => {
    if (router.canGoBack()) {
      log.nav.debug('switch-account cancel: back', { returnTo });
      router.back();
      return;
    }
    const fallback = getReturnToHref(returnTo);
    log.nav.debug('switch-account cancel: replace fallback', { returnTo, fallback });
    router.replace(fallback);
  };

  const routeToReauth = (accountId: string) => {
    router.replace(getLoginHref({ mode: 'reauth', accountId, returnTo }));
  };

  const addAccount = () => {
    router.push(getOnboardingHref());
  };

  const handleRemoveAccount = async (accountId: string) => {
    const nextActiveId = await removeAccount(accountId);
    if (nextActiveId) {
      router.replace(getSwitchAccountHref({ reason: 'afterRemoval', returnTo }));
    } else {
      router.replace(getOnboardingHref());
    }
  };

  const getReasonCopy = (reason?: AccountSwitchReason) => {
    if (reason === 'reauthFailed') {
      return 'Choose another Stored Riot Account or sign in again.';
    }
    if (reason === 'afterRemoval') {
      return 'Choose which Stored Riot Account to use next.';
    }
    return 'Choose a Stored Riot Account for this device.';
  };

  return {
    accounts,
    activeAccountId,
    busyAccountId,
    error,
    returnTo,
    reason: params.reason,
    failedAccount,
    chooseAccount,
    cancel,
    routeToReauth,
    addAccount,
    removeAccount: handleRemoveAccount,
    getReasonCopy,
  };
}
