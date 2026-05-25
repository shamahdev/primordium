import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getAccountLabel } from '@/lib/account';
import { isAuthRecoveryRequired } from '@/lib/auth-recovery';
import {
  getLoginHref,
  getOnboardingHref,
  getReturnToHref,
  sanitizeReturnToRoute,
  type SwitchReason,
} from '@/lib/navigation';
import { ensureAccountSession } from '@/lib/valorant-api';
import { useAccountStore } from '@/stores/account-store';

export default function SwitchAccountScreen() {
  const params = useLocalSearchParams<{ returnTo?: string; reason?: SwitchReason; accountId?: string }>();
  const theme = useTheme();
  const accounts = useAccountStore((state) => state.accounts);
  const activeAccountId = useAccountStore((state) => state.activeAccountId);
  const switchAccount = useAccountStore((state) => state.switchAccount);
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
        return;
      }
      await ensureAccountSession(account);
      switchAccount(account.id);
      router.replace('/profile');
    } catch (selectionError) {
      if (isAuthRecoveryRequired(selectionError)) {
        if (selectionError.recoveryKind === 'interactiveLoginRequired') {
          routeToReauth(account.id);
          return;
        }
        setError(selectionError.message);
      } else {
        setError(selectionError instanceof Error ? selectionError.message : 'Could not switch account.');
      }
    } finally {
      setBusyAccountId(null);
    }
  };

  const cancel = () => {
    router.replace(getReturnToHref(returnTo));
  };

  const addAccount = () => {
    router.push(getOnboardingHref());
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.header}>
            <ThemedText type="title">Switch Account</ThemedText>
            <ThemedText themeColor="textSecondary">{getReasonCopy(params.reason)}</ThemedText>
          </ThemedView>

          {params.reason === 'reauthFailed' && failedAccount && (
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">Sign in again as {getAccountLabel(failedAccount)}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Riot needs a fresh login for this Stored Riot Account.
              </ThemedText>
              <PrimaryButton label="Sign in again" onPress={() => routeToReauth(failedAccount.id)} />
            </ThemedView>
          )}

          {error && (
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">Could not switch</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {error}
              </ThemedText>
            </ThemedView>
          )}

          <ThemedView style={styles.accounts}>
            {accounts.map((account) => {
              const active = account.id === activeAccountId;
              const busy = account.id === busyAccountId;
              return (
                <Pressable
                  key={account.id}
                  disabled={!!busyAccountId}
                  onPress={() => void chooseAccount(account.id)}
                  style={({ pressed }) => [
                    styles.accountRow,
                    {
                      backgroundColor: active ? theme.backgroundSelected : theme.backgroundElement,
                      opacity: pressed ? 0.75 : busyAccountId ? 0.55 : 1,
                    },
                  ]}>
                  <ThemedView style={[styles.accountAvatar, { backgroundColor: theme.primary }]}> 
                    <ThemedText type="smallBold" style={{ color: theme.primaryForeground }}>
                      {account.gameName.slice(0, 2).toUpperCase()}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.accountText}>
                    <ThemedText type="smallBold">{getAccountLabel(account)}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {account.shard.toUpperCase()} · {account.status === 'needsReauth' ? 'Sign in required' : 'Ready'}
                    </ThemedText>
                  </ThemedView>
                  {busy ? <ActivityIndicator /> : active && <ThemedText type="small" themeColor="primary">Active</ThemedText>}
                </Pressable>
              );
            })}
          </ThemedView>

          <PrimaryButton label="Add account" onPress={addAccount} />
          <Pressable onPress={cancel} style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}>
            <ThemedText type="small" themeColor="textSecondary">Cancel</ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );

  function routeToReauth(accountId: string) {
    router.replace(getLoginHref({ mode: 'reauth', accountId, returnTo }));
  }
}

function getReasonCopy(reason?: SwitchReason) {
  if (reason === 'reauthFailed') {
    return 'Choose another Stored Riot Account or sign in again.';
  }
  if (reason === 'afterRemoval') {
    return 'Choose which Stored Riot Account to use next.';
  }
  return 'Choose a Stored Riot Account for this device.';
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.four,
  },
  accounts: {
    gap: Spacing.two,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  accountAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountText: {
    flex: 1,
    backgroundColor: 'transparent',
    gap: Spacing.half,
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
