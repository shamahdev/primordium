import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Switch } from 'react-native';

import { ErrorBanner } from '@/commons/components/error-banner';
import { ThemedText } from '@/commons/components/themed-text';
import { ThemedView } from '@/commons/components/themed-view';
import { MaxContentWidth, Spacing } from '@/commons/constants/theme';
import { useTheme } from '@/commons/hooks/use-theme';
import { useAccountProfileViewModel } from '@/modules/account/use-account-profile-view-model';
import { requestIgnoreBatteryOptimizations } from '@/modules/favorite/adapters/favorite-battery-optimization.adapter';

export function AccountProfileView() {
  const {
    redirect,
    account,
    snapshot,
    refreshing,
    error,
    ignoringBatteryOptimizations,
    updatingAlerts,
    favoriteStoreAlertsEnabled,
    favoriteStoreAlertsLastCheckedAt,
    favoritesCount,
    latestVersion,
    currentVersion,
    confirmLogout,
    reauthenticate,
    openRelease,
    toggleFavoriteStoreAlerts,
    switchAccount,
    refreshProfile,
  } = useAccountProfileViewModel();

  if (redirect) {
    return <Redirect href="/" />;
  }

  if (!account) {
    return null;
  }

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
            favoritesCount={favoritesCount}
            lastCheckedAt={favoriteStoreAlertsLastCheckedAt}
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
            currentVersion={currentVersion}
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
  favoritesCount,
  lastCheckedAt,
}: {
  enabled: boolean;
  disabled: boolean;
  onValueChange: (enabled: boolean) => void;
  favoritesCount: number;
  lastCheckedAt: string | null;
}) {
  const theme = useTheme();
  const metadata = React.useMemo(() => {
    const favoriteLabel = `${favoritesCount} Favorite${favoritesCount === 1 ? '' : 's'}`;
    if (!enabled) {
      return `${favoriteLabel} • Enable alerts to check in background`;
    }
    if (favoritesCount === 0) {
      return `${favoriteLabel} • Add favorites to enable useful alerts`;
    }
    if (!lastCheckedAt) {
      return `${favoriteLabel} • Not checked yet`;
    }
    return `${favoriteLabel} • Last checked ${formatRelativeTime(lastCheckedAt)}`;
  }, [enabled, favoritesCount, lastCheckedAt]);

  return (
    <ThemedView type="backgroundElement" style={styles.alertRow}>
      <ThemedView type="backgroundElement" style={styles.alertCopy}>
        <ThemedText type="small">Favorite store alerts</ThemedText>
        <ThemedText type="xsmall" themeColor="textSecondary">
          {metadata}
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

function formatRelativeTime(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d ago`;
  return new Date(then).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function BatteryOptimizationCard({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  return (
    <ThemedView
      type="backgroundSelected"
      style={[styles.batteryCard, { borderColor: theme.backgroundSelected }]}
    >
      <ThemedText type="xsmall" themeColor="textSecondary">
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
      <ThemedText type="small" style={destructive ? { color: theme.primary } : undefined}>{label}</ThemedText>
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
