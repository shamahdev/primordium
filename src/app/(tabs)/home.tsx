import { Redirect } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getAccountLabel } from '@/lib/account';
import { useAccountStore } from '@/stores/account-store';

export default function AuthenticatedHomeScreen() {
  const account = useAccountStore((state) =>
    state.accounts.find((item) => item.id === state.activeAccountId),
  );

  if (!account) {
    return <Redirect href="/" />;
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="code" themeColor="primary" style={styles.eyebrow}>
            HOME
          </ThemedText>
          <ThemedText type="subtitle">Dashboard coming soon</ThemedText>
          <ThemedText themeColor="textSecondary">
            {getAccountLabel(account)} is active. This tab is reserved for the companion dashboard;
            account management lives in Profile.
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
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
    justifyContent: 'center',
    padding: Spacing.four,
  },
  card: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  eyebrow: {
    letterSpacing: 2,
  },
});
