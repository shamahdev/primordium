import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

import { AccountLoginWebView } from '@/modules/account/components/account-login-webview';
import { ThemedText } from '@/commons/components/themed-text';
import { ThemedView } from '@/commons/components/themed-view';
import { MaxContentWidth, Spacing } from '@/commons/constants/theme';
import { useAccountLoginViewModel } from '@/modules/account/use-account-login-view-model';

export function AccountLoginView() {
  const {
    mode,
    shard,
    reauthAccount,
    isValid,
    webViewKey,
    cancel,
    handleAuthenticated,
  } = useAccountLoginViewModel();

  if (!isValid || !shard || (mode === 'reauth' && !reauthAccount)) {
    return null;
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">
            {mode === 'reauth' ? 'Re-authenticate' : 'Sign in with Riot'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {shard.toUpperCase()} Region
          </ThemedText>
        </ThemedView>
        <AccountLoginWebView
          key={webViewKey}
          shard={shard}
          onCancel={cancel}
          onAuthenticated={handleAuthenticated}
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
