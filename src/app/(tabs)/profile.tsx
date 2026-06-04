import Constants from 'expo-constants';
import { Redirect, router, useFocusEffect } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import React from 'react';
import { ActivityIndicator, Alert, AppState, Platform, Pressable, ScrollView, StyleSheet, Switch } from 'react-native';

import { ErrorBanner } from '@/components/error-banner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useUpdateCheck } from '@/hooks/use-update-check';
import { getAccountLabel } from '@/lib/account';
import { getBatteryOptimizationStatus, requestIgnoreBatteryOptimizations } from '@/lib/android-battery-optimization';
import {
  registerFavoriteStoreAlertTask,
  requestFavoriteStoreAlertPermission,
  unregisterFavoriteStoreAlertTask,
} from '@/lib/favorite-store-alerts';
import { log } from '@/lib/logger';
import { getLoginHref, getOnboardingHref, getSwitchAccountHref } from '@/lib/navigation';
import { getStoredRiotSessionRecoveryAction } from '@/lib/stored-riot-session';
import { fetchProfileSnapshot } from '@/lib/valorant-api';
import { useAccountStore } from '@/stores/account-store';
import { useFavoriteStoreAlertStore } from '@/stores/favorite-store-alert-store';


function switchAccount() {
  router.push(getSwitchAccountHref({ reason: 'choose', returnTo: '/profile' }));
}

export default function ProfileScreen() {
  const activeAccountId = useAccountStore((state) => state.activeAccountId);
  const account = useAccountStore((state) =>
    state.accounts.find((item) => item.id === state.activeAccountId),
  );
  const accounts = useAccountStore((state) => state.accounts);
  // const accountStatus = account?.status;
  const setProfileSnapshot = useAccountStore((state) => state.setProfileSnapshot);
  const removeAccount = useAccountStore((state) => state.removeAccount);
  const { latestVersion, releaseUrl } = useUpdateCheck();
  const favoriteStoreAlertsEnabled = useFavoriteStoreAlertStore((state) => state.enabled);
  const setFavoriteStoreAlertsEnabled = useFavoriteStoreAlertStore((state) => state.setEnabled);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ignoringBatteryOptimizations, setIgnoringBatteryOptimizations] = React.useState(true);
  const [updatingAlerts, setUpdatingAlerts] = React.useState(false);

  const checkBatteryOptimizationStatus = React.useCallback(async () => {
    const ignoring = await getBatteryOptimizationStatus();
    setIgnoringBatteryOptimizations(ignoring);
  }, []);

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
      setRefreshing(false);
    } catch (refreshError) {
      const recoveryAction = getStoredRiotSessionRecoveryAction({
        error: refreshError,
        accountId: currentAccount.id,
        accountCount: accounts.length,
        returnTo: '/profile',
        fallbackMessage: 'Could not refresh profile.',
      });
      if (recoveryAction.kind === 'reauth') {
        router.replace(recoveryAction.href);
      } else {
        setError(recoveryAction.message);
      }
      setRefreshing(false);
    }
  }, [accounts.length, activeAccountId, setProfileSnapshot]);

  useFocusEffect(
    React.useCallback(() => {
      void checkBatteryOptimizationStatus();
    }, [checkBatteryOptimizationStatus]),
  );

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void checkBatteryOptimizationStatus();
      }
    });
    return () => subscription.remove();
  }, [checkBatteryOptimizationStatus]);

  useFocusEffect(
    React.useCallback(() => {
      void refreshProfile();
    }, [refreshProfile]),
  );

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
              const target = getOnboardingHref();
              log.nav.debug('profile logout: dismissAll + replace onboarding', { target });
              router.dismissAll();
              router.replace(target);
            } else {
              const target = getSwitchAccountHref({ reason: 'afterRemoval', returnTo: '/profile' });
              log.nav.debug('profile logout: dismissAll + replace switch-account', { target, nextActiveAccountId });
              router.dismissAll();
              router.replace(target);
            }
          })();
        },
      },
    ]);
  };

  const reauthenticate = () => {
    router.push(getLoginHref({ mode: 'reauth', accountId: account.id, returnTo: '/profile' }));
  };

  const openRelease = () => {
    if (!releaseUrl) return;
    void openBrowserAsync(releaseUrl, {
      presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
    });
  };

  const toggleFavoriteStoreAlerts = async (enabled: boolean) => {
    setUpdatingAlerts(true);
    try {
      if (enabled) {
        const allowed = await requestFavoriteStoreAlertPermission();
        if (!allowed) {
          Alert.alert('Notifications unavailable', 'Allow notifications to enable Favorite store alerts.');
          return;
        }
        setFavoriteStoreAlertsEnabled(true);
        await registerFavoriteStoreAlertTask();
        return;
      }

      setFavoriteStoreAlertsEnabled(false);
      await unregisterFavoriteStoreAlertTask();
    } catch (alertError) {
      Alert.alert(
        'Could not update alerts',
        alertError instanceof Error ? alertError.message : 'Try again later.',
      );
    } finally {
      setUpdatingAlerts(false);
    }
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

          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
              NOTIFICATIONS
            </ThemedText>
            <AlertToggleRow
              enabled={favoriteStoreAlertsEnabled}
              disabled={updatingAlerts}
              onValueChange={toggleFavoriteStoreAlerts}
            />
            {favoriteStoreAlertsEnabled && Platform.OS === 'android' && !ignoringBatteryOptimizations ? (
              <BatteryOptimizationCard onPress={() => { void requestIgnoreBatteryOptimizations(); }} />
            ) : null}
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
              ABOUT
            </ThemedText>
            <VersionRow
              currentVersion={Constants.expoConfig?.version ?? '0.0.0'}
              latestVersion={latestVersion}
              onPressLatest={openRelease}
            />
          </ThemedView>
        </ScrollView>
    </ThemedView>
  );

}

function VersionRow({
  currentVersion,
  latestVersion,
  onPressLatest,
}: {
  currentVersion: string;
  latestVersion: string | null;
  onPressLatest: () => void;
}) {
  const theme = useTheme();
  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <ThemedText type="small">Version</ThemedText>
      <ThemedView type="backgroundElement" style={styles.versionValue}>
        <ThemedText type="small" themeColor="textSecondary">
          v{currentVersion}
        </ThemedText>
        {latestVersion ? (
          <Pressable onPress={onPressLatest} hitSlop={8}>
            <ThemedText type="small" style={{ color: theme.primary }}>
              {`(v${latestVersion} Available)`}
            </ThemedText>
          </Pressable>
        ) : null}
      </ThemedView>
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

function AlertToggleRow({
  enabled,
  disabled,
  onValueChange,
}: {
  enabled: boolean;
  disabled: boolean;
  onValueChange: (enabled: boolean) => void;
}) {
  const theme = useTheme();
  return (
    <ThemedView type="backgroundElement" style={styles.alertRow}>
      <ThemedView type="backgroundElement" style={styles.alertCopy}>
        <ThemedText type="small">Favorite store alerts</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Notify when a favorite appears in your daily or accessory store.
        </ThemedText>
      </ThemedView>
      <Switch
        value={enabled}
        disabled={disabled}
        onValueChange={(value) => void onValueChange(value)}
        trackColor={{ false: theme.backgroundSelected, true: theme.primary }}
        thumbColor={theme.primaryForeground}
      />
    </ThemedView>
  );
}

function BatteryOptimizationCard({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  return (
    <ThemedView
      type="backgroundSelected"
      style={[styles.batteryCard, { borderColor: theme.backgroundSelected }]}
    >
      <ThemedText type="small" themeColor="textSecondary">
        Background checks may be delayed if Android restricts Primordium in the background.
        Allow unrestricted battery usage for more reliable alerts.
      </ThemedText>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.batteryButton, pressed && styles.pressed]}>
        <ThemedText type="small" style={{ color: theme.primary }}>
          Allow unrestricted battery
        </ThemedText>
      </Pressable>
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
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  alertCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  batteryCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.one,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  batteryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  batteryButton: {
    paddingVertical: Spacing.one,
  },
  versionValue: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.one,
  },
  menuButton: {
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
