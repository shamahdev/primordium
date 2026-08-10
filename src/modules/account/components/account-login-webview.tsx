import React from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

import { PrimaryButton } from "@/commons/components/primary-button";
import { ThemedText } from "@/commons/components/themed-text";
import { ThemedView } from "@/commons/components/themed-view";
import { Radius, Spacing } from "@/commons/constants/theme";
import { ACCOUNT_RIOT_LOGIN_URL } from "@/modules/account/account-constants";
import { AccountService } from "@/modules/account/account-service";
import type {
	Account,
	AccountCookie,
	AccountShard,
	AccountTokens,
} from "@/modules/account/account-type";
import {
	captureAccountCookies,
	clearAccountCookies,
} from "@/modules/account/helpers/manage-account-cookies";
import { parseAccountRedirectToken } from "@/modules/account/helpers/parse-account-redirect-token";

type AccountLoginWebViewProps = {
	shard: AccountShard;
	onCancel: () => void;
	onAuthenticated: (result: {
		account: Account;
		tokens: AccountTokens;
		cookies: AccountCookie[];
		cookieCaptureFailed: boolean;
	}) => Promise<void>;
};

export function AccountLoginWebView({
	shard,
	onCancel,
	onAuthenticated,
}: AccountLoginWebViewProps) {
	const handledRedirectRef = React.useRef(false);
	const [loading, setLoading] = React.useState("Preparing secure login...");
	const [error, setError] = React.useState<string | null>(null);
	const [webViewKey, setWebViewKey] = React.useState(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <Intended behaviour>
	React.useEffect(() => {
		let mounted = true;
		void (async () => {
			await clearAccountCookies();
			if (mounted) {
				setLoading("");
			}
		})();
		return () => {
			mounted = false;
		};
	}, [webViewKey]);

	const handleUrl = async (url?: string) => {
		if (!url || handledRedirectRef.current || !url.includes("access_token=")) {
			return;
		}

		handledRedirectRef.current = true;
		setError(null);
		setLoading("Validating Riot account...");
		try {
			const accessToken = parseAccountRedirectToken(url);
			const result = await AccountService.authenticateLogin(accessToken, shard);
			let cookies: AccountCookie[] = [];
			let cookieCaptureFailed = false;
			try {
				cookies = await captureAccountCookies();
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
				await clearAccountCookies();
				handledRedirectRef.current = false;
				setLoading("");
				setError(getLoginErrorMessage(authError));
				return;
			}
			await clearAccountCookies();
		} catch (loginError) {
			handledRedirectRef.current = false;
			setLoading("");
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
					source={{ uri: ACCOUNT_RIOT_LOGIN_URL }}
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
			<Pressable
				onPress={onCancel}
				style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
			>
				<ThemedText type="small" themeColor="textSecondary">
					Cancel
				</ThemedText>
			</Pressable>
		</ThemedView>
	);
}

function getLoginErrorMessage(error: unknown) {
	const status =
		typeof error === "object" && error !== null && "status" in error
			? (error as any).status
			: undefined;
	if (status && status !== 401 && status !== 403) {
		return "The selected Region did not validate for this Riot account. Go back and choose the correct Region.";
	}
	return error instanceof Error
		? error.message
		: "Could not complete Riot login.";
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		gap: Spacing.three,
	},
	stateCard: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: Radius.small,
		gap: Spacing.two,
	},
	webViewShell: {
		flex: 1,
		overflow: "hidden",
		borderRadius: Radius.small,
	},
	webView: {
		flex: 1,
	},
	errorCard: {
		padding: Spacing.three,
		gap: Spacing.two,
		borderRadius: Radius.small,
	},
	cancel: {
		alignItems: "center",
		paddingVertical: Spacing.two,
	},
	pressed: {
		opacity: 0.7,
	},
});
