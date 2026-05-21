import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAccountStore } from '@/stores/account-store';

export default function HomeScreen() {
  const hasHydrated = useAccountStore((state) => state.hasHydrated);
  const accounts = useAccountStore((state) => state.accounts);
  const ensureActiveAccount = useAccountStore((state) => state.ensureActiveAccount);

  React.useEffect(() => {
    if (hasHydrated) {
      ensureActiveAccount();
    }
  }, [ensureActiveAccount, hasHydrated]);

  if (!hasHydrated) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ActivityIndicator />
          <ThemedText themeColor="textSecondary">Loading saved accounts...</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (accounts.length === 0) {
    return <Redirect href={'/onboarding' as never} />;
  }

  return <Redirect href={'/(tabs)/home' as never} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
  },
});
