import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RIOT_LOGIN_URL } from '@/constants/riot';
import { Spacing } from '@/constants/theme';
import type { StoredAuthTokens, StoredRiotAccount, StoredRiotCookie, ValorantShard } from '@/lib/account';
import { captureRiotAuthCookies, clearRiotCookies } from '@/lib/riot-cookies';
import { readRiotAccessTokenFromRedirectUri } from '@/lib/riot-login';
import { authenticateRiotLogin, type ValorantApiError } from '@/lib/valorant-api';

type RiotLoginWebViewProps = {
  shard: ValorantShard;
  onCancel: () => void;
  onAuthenticated: (result: {
    account: StoredRiotAccount;
    tokens: StoredAuthTokens;
    cookies: StoredRiotCookie[];
    cookieCaptureFailed: boolean;
  }) => Promise<void>;
};

export function RiotLoginWebView({ shard, onCancel, onAuthenticated }: RiotLoginWebViewProps) {
  const handledRedirectRef = React.useRef(false);
  const [loading, setLoading] = React.useState('Preparing secure login...');
  const [error, setError] = React.useState<string | null>(null);
  const [webViewKey, setWebViewKey] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;
    void (async () => {
      await clearRiotCookies();
      if (mounted) {
        setLoading('');
      }
    })();
    return () => {
      mounted = false;
    };
  }, [webViewKey]);

  const handleUrl = async (url?: string) => {
    if (!url || handledRedirectRef.current || !url.includes('access_token=')) {
      return;
    }

    handledRedirectRef.current = true;
    setError(null);
    setLoading('Validating Riot account...');
    try {
      const accessToken = readRiotAccessTokenFromRedirectUri(url);
      const result = await authenticateRiotLogin(accessToken, shard);
      let cookies: StoredRiotCookie[] = [];
      let cookieCaptureFailed = false;
      try {
        cookies = await captureRiotAuthCookies();
      } catch {
        cookieCaptureFailed = true;
      }
      let authError: unknown;
      try {
        await onAuthenticated({ ...result, cookies, cookieCaptureFailed });
      } catch (error) {
        authError = error;
      }
      if (authError) {
        await clearRiotCookies();
        handledRedirectRef.current = false;
        setLoading('');
        setError(getLoginErrorMessage(authError));
        return;
      }
      await clearRiotCookies();
    } catch (loginError) {
      handledRedirectRef.current = false;
      setLoading('');
      setError(getLoginErrorMessage(loginError));
    }
  };

  if (loading) {
    return (
      <ThemedView type="backgroundElement" style={styles.stateCard}>
        <ActivityIndicator />
        <ThemedText type="small" themeColor="textSecondary">
          {loading}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {error && (
        <ThemedView type="backgroundElement" style={styles.errorCard}>
          <ThemedText type="smallBold">Login failed</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {error}
          </ThemedText>
          <PrimaryButton
            label="Try again"
            onPress={() => {
              handledRedirectRef.current = false;
              setError(null);
              setWebViewKey((value) => value + 1);
            }}
          />
        </ThemedView>
      )}
      <ThemedView type="backgroundElement" style={styles.webViewShell}>
        <WebView
          key={webViewKey}
          cacheEnabled={false}
          sharedCookiesEnabled
          thirdPartyCookiesEnabled={false}
          source={{ uri: RIOT_LOGIN_URL }}
          userAgent="Mozilla/5.0 (Linux; Android) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36"
          onNavigationStateChange={(event) => void handleUrl(event.url)}
          onShouldStartLoadWithRequest={(request) => {
            void handleUrl(request.url);
            return true;
          }}
          injectedJavaScriptBeforeContentLoaded={`(function() {
            const deleteCookieBanner = () => {
              const banner = document.getElementsByClassName('osano-cm-window')[0];
              if (banner) banner.style = 'display:none;';
              else setTimeout(deleteCookieBanner, 10);
            };
            deleteCookieBanner();
          })();`}
          style={styles.webView}
        />
      </ThemedView>
      <Pressable onPress={onCancel} style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}>
        <ThemedText type="small" themeColor="textSecondary">
          Cancel
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

function getLoginErrorMessage(error: unknown) {
  const status = (error as ValorantApiError | undefined)?.status;
  if (status && status !== 401 && status !== 403) {
    return 'The selected Region did not validate for this Riot account. Go back and choose the correct Region.';
  }
  return error instanceof Error ? error.message : 'Could not complete Riot login.';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.three,
  },
  stateCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.one,
    gap: Spacing.two,
  },
  webViewShell: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: Spacing.one,
  },
  webView: {
    flex: 1,
  },
  errorCard: {
    padding: Spacing.three,
    gap: Spacing.two,
    borderRadius: Spacing.one,
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
