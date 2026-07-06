import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Alert } from "react-native";
import { log } from "@/commons/lib/logger";
import { useAccountStore } from "@/modules/account/account-store";
import type {
	Account,
	AccountCookie,
	AccountTokens,
} from "@/modules/account/account-type";
import {
	getAccountLabel,
	isAccountShard,
} from "@/modules/account/account-type";
import {
	type AccountLoginMode,
	getOnboardingHref,
	getReturnToHref,
	sanitizeReturnToRoute,
} from "@/modules/account/helpers/get-account-navigation-href";

export type LoginAuthenticatedResult = {
	account: Account;
	tokens: AccountTokens;
	cookies: AccountCookie[];
	cookieCaptureFailed: boolean;
};

export function useAccountLoginViewModel() {
	const params = useLocalSearchParams<{
		mode?: AccountLoginMode;
		shard?: string;
		accountId?: string;
		returnTo?: string;
	}>();
	const accounts = useAccountStore((state) => state.accounts);
	const saveAuthenticatedAccount = useAccountStore(
		(state) => state.saveAuthenticatedAccount,
	);
	const mode = params.mode ?? "add";
	const reauthAccount = accounts.find(
		(account) => account.id === params.accountId,
	);
	const shard =
		mode === "reauth"
			? reauthAccount?.shard
			: isAccountShard(params.shard)
				? params.shard
				: undefined;
	const returnTo = sanitizeReturnToRoute(params.returnTo);
	const [webViewKey, setWebViewKey] = React.useState(0);
	const [isSaving, setIsSaving] = React.useState(false);
	const [saveError, setSaveError] = React.useState<string | null>(null);

	const isValid = Boolean(shard && (mode !== "reauth" || reauthAccount));

	React.useEffect(() => {
		if (!isValid) {
			router.replace(getOnboardingHref());
		}
	}, [isValid]);

	const cancel = () => {
		if (router.canGoBack()) {
			log.nav.debug("login cancel: back", { mode, returnTo });
			router.back();
			return;
		}
		const fallback =
			accounts.length > 0 ? getReturnToHref(returnTo) : getOnboardingHref();
		log.nav.debug("login cancel: replace fallback", {
			mode,
			returnTo,
			fallback,
		});
		router.replace(fallback);
	};

	const saveAndContinue = async (result: LoginAuthenticatedResult) => {
		setIsSaving(true);
		setSaveError(null);
		try {
			await saveAuthenticatedAccount(
				result.account,
				result.tokens,
				result.cookies,
			);
			if (result.cookieCaptureFailed || result.cookies.length === 0) {
				Alert.alert(
					"Login saved",
					"Future silent sign-in may require another Riot login because cookies could not be saved.",
				);
			}
			const target = getReturnToHref(returnTo);
			log.nav.debug("login success: dismissAll + replace", {
				returnTo,
				target,
			});
			router.dismissAll();
			router.replace(target);
		} catch (error) {
			setSaveError(
				error instanceof Error ? error.message : "Failed to save login.",
			);
		} finally {
			setIsSaving(false);
		}
	};

	const handleReauthMismatch = async (result: LoginAuthenticatedResult) => {
		await new Promise<void>((resolve) => {
			Alert.alert(
				"Different Riot identity",
				"This login is not the selected Stored Riot Account.",
				[
					{
						text: "Add and switch",
						onPress: () => {
							void saveAndContinue(result).finally(resolve);
						},
					},
					{
						text: "Try again",
						onPress: () => {
							setWebViewKey((prev) => prev + 1);
							resolve();
						},
					},
					{
						text: "Cancel",
						style: "cancel",
						onPress: () => {
							cancel();
							resolve();
						},
					},
				],
			);
		});
	};

	const confirmDifferentRegion = async (account: Account) => {
		return new Promise<boolean>((resolve) => {
			Alert.alert(
				"Add another Region?",
				`${getAccountLabel(account)} is already saved for another Region. Add it for ${account.shard.toUpperCase()} too?`,
				[
					{ text: "Cancel", style: "cancel", onPress: () => resolve(false) },
					{ text: "Add Region", onPress: () => resolve(true) },
				],
			);
		});
	};

	const handleAuthenticated = async (result: LoginAuthenticatedResult) => {
		if (
			mode === "reauth" &&
			reauthAccount &&
			result.account.puuid !== reauthAccount.puuid
		) {
			await handleReauthMismatch(result);
			return;
		}

		if (
			mode === "add" &&
			accounts.some(
				(account) =>
					account.puuid === result.account.puuid &&
					account.shard !== result.account.shard,
			)
		) {
			const confirmed = await confirmDifferentRegion(result.account);
			if (!confirmed) {
				setWebViewKey((prev) => prev + 1);
				return;
			}
		}

		await saveAndContinue(result);
	};

	const resetWebView = () => {
		setWebViewKey((prev) => prev + 1);
		setSaveError(null);
	};

	return {
		mode,
		shard,
		reauthAccount,
		returnTo,
		isValid,
		webViewKey,
		isSaving,
		saveError,
		cancel,
		handleAuthenticated,
		resetWebView,
	};
}
