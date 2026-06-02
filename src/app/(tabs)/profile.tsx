import { Redirect, router, useFocusEffect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet } from 'react-native';

import { ErrorBanner } from '@/components/error-banner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getAccountLabel } from '@/lib/account';
import { isAuthRecoveryRequired } from '@/lib/auth-recovery';
import {
  getLoginHref,
  getOnboardingHref,
  getSwitchAccountHref,
} from '@/lib/navigation';
import { fetchProfileSnapshot } from '@/lib/valorant-api';
import { useAccountStore } from '@/stores/account-store';

function switchAccount() {
  router.push(getSwitchAccountHref({ reason: 'choose', returnTo: '/profile' }));
}

export default function ProfileScreen() {
  const activeAccountId = useAccountStore((state) => state.activeAccountId);
  const account = useAccountStore((state) =>
    state.accounts.find((item) => item.id === state.activeAccountId),
  );
  const accounts = useAccountStore((state) => state.accounts);
  const accountStatus = account?.status;
  const setProfileSnapshot = useAccountStore((state) => state.setProfileSnapshot);
  const removeAccount = useAccountStore((state) => state.removeAccount);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const routeToAuthRecovery = (accountId: string) => {
    if (accounts.length > 1) {
      router.replace(getSwitchAccountHref({ reason: 'reauthFailed', accountId, returnTo: '/profile' }));
      return;
    }
    router.replace(getLoginHref({ mode: 'reauth', accountId, returnTo: '/profile' }));
  };

  const refreshProfile = async () => {
    const currentAccount = useAccountStore.getState().accounts.find((item) => item.id === activeAccountId);
    if (!currentAccount || currentAccount.status === 'needsReauth') {
      return;
    }

    setRefreshing(true);
    setError(null);
    try {
      const snapshot = await fetchProfileSnapshot(currentAccount);
      setProfileSnapshot(currentAccount.id, snapshot);
      setRefreshing(false);
    } catch (refreshError) {
      if (isAuthRecoveryRequired(refreshError)) {
        if (refreshError.recoveryKind === 'temporaryAuthUnavailable') {
          setError(refreshError.message);
        } else {
          routeToAuthRecovery(currentAccount.id);
        }
      } else {
        setError(refreshError instanceof Error ? refreshError.message : 'Could not refresh profile.');
      }
      setRefreshing(false);
    }
  };

  useFocusEffect(() => {
    void refreshProfile();
  });

  if (!account) {
    return <Redirect href="/" />;
  }

  const snapshot = account.profileSnapshot;

  const confirmLogout = () => {
    Alert.alert('Logout current account?', `${getAccountLabel(account)} will be removed from this device.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            const nextActiveAccountId = await removeAccount(account.id);
            if (!nextActiveAccountId) {
              router.replace(getOnboardingHref());
            } else {
              router.replace(getSwitchAccountHref({ reason: 'afterRemoval', returnTo: '/profile' }));
            }
          })();
        },
      },
    ]);
  };

  const reauthenticate = () => {
    router.push(getLoginHref({ mode: 'reauth', accountId: account.id, returnTo: '/profile' }));
  };

  return (
    <ThemedView style={styles.screen}>
      {account.status === 'needsReauth' && (
        <ErrorBanner
          message="Session expired. Sign in again to refresh profile."
          actionLabel="Sign in"
          onPress={reauthenticate}
        />
      )}

      {error && account.status !== 'needsReauth' && (
        <ErrorBanner message={error} actionLabel="Retry" onPress={refreshProfile} />
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedView type="backgroundElement" style={styles.sectionHeader}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
                PROGRESS
              </ThemedText>
              {refreshing && <ActivityIndicator />}
            </ThemedView>
            <InfoRow label="Level" value={snapshot ? String(snapshot.level) : '--'} />
            <InfoRow label="XP" value={snapshot ? snapshot.xp.toLocaleString() : '--'} />
          </ThemedView>

          {/* <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
              BALANCES
            </ThemedText>
            <InfoRow label="VP" value={snapshot ? snapshot.balances.vp.toLocaleString() : '--'} />
            <InfoRow
              label="Radianite"
              value={snapshot ? snapshot.balances.radianite.toLocaleString() : '--'}
            />
            <InfoRow
              label="Kingdom Credits"
              value={snapshot ? snapshot.balances.kingdomCredits.toLocaleString() : '--'}
            />
          </ThemedView> */}

          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
              ACCOUNT
            </ThemedText>
            <MenuButton label="Switch Account" onPress={switchAccount} />
            <MenuButton label="Logout" destructive onPress={confirmLogout} />
          </ThemedView>
        </ScrollView>
    </ThemedView>
  );

}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <ThemedText type="small">{label}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.rowValue} numberOfLines={1}>
        {value}
      </ThemedText>
    </ThemedView>
  );
}

function MenuButton({ label, destructive, onPress }: { label: string; destructive?: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}>
      <ThemedText type='small' style={destructive ? { color: theme.primary } : undefined}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
  },
  section: {
    borderRadius: Spacing.one,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    letterSpacing: 1.4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  rowValue: {
    flex: 1,
    textAlign: 'right',
  },
  menuButton: {
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
