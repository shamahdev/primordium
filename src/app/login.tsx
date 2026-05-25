import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RiotLoginWebView } from '@/components/riot-login-webview';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getAccountLabel, isValorantShard, type StoredAuthTokens, type StoredRiotAccount, type StoredRiotCookie, type ValorantShard } from '@/lib/account';
import {
  getOnboardingHref,
  getReturnToHref,
  getSwitchAccountHref,
  sanitizeReturnToRoute,
  type LoginMode,
} from '@/lib/navigation';
import { useAccountStore } from '@/stores/account-store';

export default function LoginScreen() {
  const params = useLocalSearchParams<{ mode?: LoginMode; shard?: string; accountId?: string; returnTo?: string }>();
  const accounts = useAccountStore((state) => state.accounts);
  const saveAuthenticatedAccount = useAccountStore((state) => state.saveAuthenticatedAccount);
  const mode = params.mode ?? 'add';
  const reauthAccount = accounts.find((account) => account.id === params.accountId);
  const shard = mode === 'reauth' ? reauthAccount?.shard : isValorantShard(params.shard) ? params.shard : undefined;
  const returnTo = sanitizeReturnToRoute(params.returnTo);
  const [webViewKey, setWebViewKey] = React.useState(0);

  React.useEffect(() => {
    if (!shard || (mode === 'reauth' && !reauthAccount)) {
      router.replace(getOnboardingHref());
    }
  }, [mode, reauthAccount, shard]);

  if (!shard || (mode === 'reauth' && !reauthAccount)) {
    return null;
  }

  const cancel = () => {
    if (mode === 'reauth' && accounts.length > 1) {
      router.replace(getSwitchAccountHref({ reason: 'choose', returnTo }));
      return;
    }
    if (mode === 'reauth') {
      router.replace(getOnboardingHref());
      return;
    }
    router.replace(accounts.length > 0 ? getReturnToHref(returnTo) : getOnboardingHref());
  };

  const handleAuthenticated = async (result: {
    account: StoredRiotAccount;
    tokens: StoredAuthTokens;
    cookies: StoredRiotCookie[];
    cookieCaptureFailed: boolean;
  }) => {
    if (mode === 'reauth' && reauthAccount && result.account.puuid !== reauthAccount.puuid) {
      await handleReauthMismatch(result);
      return;
    }

    if (mode === 'add' && accounts.some((account) => account.puuid === result.account.puuid && account.shard !== result.account.shard)) {
      const confirmed = await confirmDifferentRegion(result.account);
      if (!confirmed) {
        setWebViewKey((value) => value + 1);
        return;
      }
    }

    await saveAndContinue(result);
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">Riot Login</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {mode === 'reauth' && reauthAccount
              ? `Sign in again as ${getAccountLabel(reauthAccount)} · Region ${shard.toUpperCase()}`
              : `Region: ${shard.toUpperCase()}`}
          </ThemedText>
        </ThemedView>
        <RiotLoginWebView
          key={webViewKey}
          shard={shard as ValorantShard}
          onCancel={cancel}
          onAuthenticated={handleAuthenticated}
        />
      </SafeAreaView>
    </ThemedView>
  );

  async function saveAndContinue(result: {
    account: StoredRiotAccount;
    tokens: StoredAuthTokens;
    cookies: StoredRiotCookie[];
    cookieCaptureFailed: boolean;
  }) {
    await saveAuthenticatedAccount(result.account, result.tokens, result.cookies);
    if (result.cookieCaptureFailed || result.cookies.length === 0) {
      Alert.alert('Login saved', 'Future silent sign-in may require another Riot login because cookies could not be saved.');
    }
    router.replace(getReturnToHref(returnTo));
  }

  async function handleReauthMismatch(result: {
    account: StoredRiotAccount;
    tokens: StoredAuthTokens;
    cookies: StoredRiotCookie[];
    cookieCaptureFailed: boolean;
  }) {
    await new Promise<void>((resolve) => {
      Alert.alert('Different Riot identity', 'This login is not the selected Stored Riot Account.', [
        {
          text: 'Add and switch',
          onPress: () => {
            void saveAndContinue(result).finally(resolve);
          },
        },
        {
          text: 'Try again',
          onPress: () => {
            setWebViewKey((value) => value + 1);
            resolve();
          },
        },
        { text: 'Cancel', style: 'cancel', onPress: () => { cancel(); resolve(); } },
      ]);
    });
  }

  async function confirmDifferentRegion(account: StoredRiotAccount) {
    return new Promise<boolean>((resolve) => {
      Alert.alert(
        'Add another Region?',
        `${getAccountLabel(account)} is already saved for another Region. Add it for ${account.shard.toUpperCase()} too?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Add Region', onPress: () => resolve(true) },
        ],
      );
    });
  }
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
