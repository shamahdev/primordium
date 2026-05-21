import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginWebView } from '@/components/login-webview';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { isValorantShard, type ValorantShard } from '@/lib/account';
import { useAccountStore } from '@/stores/account-store';

export default function LoginScreen() {
  const params = useLocalSearchParams<{ shard?: string }>();
  const accounts = useAccountStore((state) => state.accounts);
  const saveAuthenticatedAccount = useAccountStore((state) => state.saveAuthenticatedAccount);
  const shard = isValorantShard(params.shard) ? params.shard : undefined;

  React.useEffect(() => {
    if (!shard) {
      router.replace('/onboarding' as never);
    }
  }, [shard]);

  if (!shard) {
    return null;
  }

  const cancel = () => {
    router.replace((accounts.length > 0 ? '/(tabs)/profile' : '/onboarding') as never);
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">Riot Login</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Region: {shard.toUpperCase()}
          </ThemedText>
        </ThemedView>
        <LoginWebView
          shard={shard as ValorantShard}
          onCancel={cancel}
          onAuthenticated={async ({ account, tokens }) => {
            await saveAuthenticatedAccount(account, tokens);
            router.replace('/(tabs)/profile' as never);
          }}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    maxWidth: MaxContentWidth,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.one,
  },
});
