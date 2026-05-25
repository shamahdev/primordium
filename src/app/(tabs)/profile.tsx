import { Redirect, router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet } from 'react-native';
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
  getSwitchAccountHref,
} from '@/lib/navigation';
import { fetchProfileSnapshot } from '@/lib/valorant-api';
import { useAccountStore } from '@/stores/account-store';

export default function ProfileScreen() {
  const theme = useTheme();
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

  const routeToAuthRecovery = React.useCallback((accountId: string) => {
    if (accounts.length > 1) {
      router.replace(getSwitchAccountHref({ reason: 'reauthFailed', accountId, returnTo: '/profile' }));
      return;
    }
    router.replace(getLoginHref({ mode: 'reauth', accountId, returnTo: '/profile' }));
  }, [accounts.length]);

  const refreshProfile = React.useCallback(async () => {
    const currentAccount = useAccountStore.getState().accounts.find((item) => item.id === activeAccountId);
    if (!currentAccount || currentAccount.status === 'needsReauth') {
      return;
    }

    setRefreshing(true);
    setError(null);
    try {
      const snapshot = await fetchProfileSnapshot(currentAccount);
      setProfileSnapshot(currentAccount.id, snapshot);
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
    } finally {
      setRefreshing(false);
    }
  }, [activeAccountId, routeToAuthRecovery, setProfileSnapshot]);

  React.useEffect(() => {
    void refreshProfile();
  }, [accountStatus, activeAccountId, refreshProfile]);

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

  const switchAccount = () => {
    router.push(getSwitchAccountHref({ reason: 'choose', returnTo: '/profile' }));
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.header}>
            <ThemedView style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <ThemedText type="subtitle" style={{ color: theme.primaryForeground }}>
                {account.gameName.slice(0, 2).toUpperCase()}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.headerText}>
              <ThemedText type="subtitle">{getAccountLabel(account)}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Region {account.shard.toUpperCase()}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {account.status === 'needsReauth' && (
            <ThemedView type="backgroundElement" style={styles.warningCard}>
              <ThemedText type="smallBold">Re-authentication required</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                This account remains saved, but its Riot token can no longer refresh profile data.
              </ThemedText>
              <PrimaryButton label="Sign in again" onPress={reauthenticate} />
            </ThemedView>
          )}

          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedView type="backgroundElement" style={styles.sectionHeader}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
                PROGRESS
              </ThemedText>
              {refreshing && <ActivityIndicator />}
            </ThemedView>
            <InfoRow label="Level" value={snapshot ? String(snapshot.level) : '--'} />
            <InfoRow label="XP" value={snapshot ? snapshot.xp.toLocaleString() : '--'} />
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.section}>
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
          </ThemedView>

          {error && (
            <ThemedView type="backgroundElement" style={styles.warningCard}>
              <ThemedText type="smallBold">Profile refresh failed</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {error}
              </ThemedText>
              {account.status !== 'needsReauth' && (
                <PrimaryButton label="Retry refresh" onPress={refreshProfile} disabled={refreshing} />
              )}
            </ThemedView>
          )}

          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
              ACCOUNT
            </ThemedText>
            <MenuButton label="Switch Account" onPress={switchAccount} />
            <MenuButton label="Logout" destructive onPress={confirmLogout} />
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );

}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <ThemedText>{label}</ThemedText>
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
      <ThemedText style={destructive ? { color: theme.primary } : undefined}>{label}</ThemedText>
    </Pressable>
  );
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: Spacing.one,
  },
  section: {
    borderRadius: Spacing.four,
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
  warningCard: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
