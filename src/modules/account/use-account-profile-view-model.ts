import Constants from "expo-constants";
import { router, useFocusEffect } from "expo-router";
import {
	openBrowserAsync,
	WebBrowserPresentationStyle,
} from "expo-web-browser";
import React from "react";
import { Alert, AppState } from "react-native";
import { useUpdateCheck } from "@/commons/hooks/use-update-check";
import { log } from "@/commons/lib/logger";
import { AccountService } from "@/modules/account/account-service";
import { useAccountStore } from "@/modules/account/account-store";
import { getAccountLabel } from "@/modules/account/account-type";
import {
	getLoginHref,
	getOnboardingHref,
	getSwitchAccountHref,
} from "@/modules/account/helpers/get-account-navigation-href";
import { useCompanionViewModel } from "@/modules/companion/use-companion-view-model";
import { getBatteryOptimizationStatus } from "@/modules/favorite/adapters/favorite-battery-optimization.adapter";
import { FavoriteAlertController } from "@/modules/favorite/favorite-alert-controller";
import { useFavoriteAlertStore } from "@/modules/favorite/favorite-alert-store";
import { useFavoriteStore } from "@/modules/favorite/favorite-store";

export function useAccountProfileViewModel() {
	const activeAccountId = useAccountStore((state) => state.activeAccountId);
	const account = useAccountStore((state) =>
		state.accounts.find((item) => item.id === state.activeAccountId),
	);
	const accounts = useAccountStore((state) => state.accounts);
	const setProfileSnapshot = useAccountStore(
		(state) => state.setProfileSnapshot,
	);
	const removeAccount = useAccountStore((state) => state.removeAccount);
	const { latestVersion, releaseUrl } = useUpdateCheck();
	const favoriteStoreAlertsEnabled = useFavoriteAlertStore(
		(state) => state.enabled,
	);
	const favoritesCount = useFavoriteStore(
		(state) => Object.keys(state.favoritesById).length,
	);
	const favoriteStoreAlertsLastCheckedAt = useFavoriteAlertStore(
		(state) => state.lastCheckedByAccountId[activeAccountId ?? ""] ?? null,
	);
	const [refreshing, setRefreshing] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [ignoringBatteryOptimizations, setIgnoringBatteryOptimizations] =
		React.useState(true);
	const [updatingAlerts, setUpdatingAlerts] = React.useState(false);
	const companion = useCompanionViewModel();

	const checkBatteryOptimizationStatus = React.useCallback(async () => {
		const ignoring = await getBatteryOptimizationStatus();
		setIgnoringBatteryOptimizations(ignoring);
	}, []);

	const refreshProfile = React.useCallback(async () => {
		const currentAccount = useAccountStore
			.getState()
			.accounts.find((item) => item.id === activeAccountId);
		if (!currentAccount || currentAccount.status === "needsReauth") {
			return;
		}

		setRefreshing(true);
		setError(null);
		try {
			const snapshot = await AccountService.fetchProfile(currentAccount);
			setProfileSnapshot(currentAccount.id, snapshot);
			setRefreshing(false);
		} catch (refreshError) {
			const recoveryAction = AccountService.getStoredRiotSessionRecoveryAction({
				error: refreshError,
				accountId: currentAccount.id,
				accountCount: accounts.length,
				returnTo: "/profile",
				fallbackMessage: "Could not refresh profile.",
			});
			if (recoveryAction.kind === "reauth") {
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
		const subscription = AppState.addEventListener("change", (nextState) => {
			if (nextState === "active") {
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

	const confirmLogout = () => {
		if (!account) return;
		Alert.alert(
			"Logout current account?",
			`${getAccountLabel(account)} will be removed from this device.`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Logout",
					style: "destructive",
					onPress: () => {
						void (async () => {
							const nextActiveAccountId = await removeAccount(account.id);
							if (!nextActiveAccountId) {
								const target = getOnboardingHref();
								log.nav.debug(
									"profile logout: dismissAll + replace onboarding",
									{ target },
								);
								router.dismissAll();
								router.replace(target);
							} else {
								const target = getSwitchAccountHref({
									reason: "afterRemoval",
									returnTo: "/profile",
								});
								log.nav.debug(
									"profile logout: dismissAll + replace switch-account",
									{ target, nextActiveAccountId },
								);
								router.dismissAll();
								router.replace(target);
							}
						})();
					},
				},
			],
		);
	};

	const reauthenticate = () => {
		if (!account) return;
		router.push(
			getLoginHref({
				mode: "reauth",
				accountId: account.id,
				returnTo: "/profile",
			}),
		);
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
			const result = await FavoriteAlertController.setEnabled(enabled);
			if (!result.ok) {
				Alert.alert(
					"Notifications unavailable",
					"Allow notifications to enable Favorite store alerts.",
				);
			}
		} catch (alertError) {
			Alert.alert(
				"Could not update alerts",
				alertError instanceof Error ? alertError.message : "Try again later.",
			);
		} finally {
			setUpdatingAlerts(false);
		}
	};

	const switchAccount = () => {
		router.push(
			getSwitchAccountHref({ reason: "choose", returnTo: "/profile" }),
		);
	};

	if (!account) {
		return {
			redirect: true,
			account: null,
			snapshot: null,
			refreshing: false,
			error: null,
			ignoringBatteryOptimizations: false,
			updatingAlerts: false,
			favoriteStoreAlertsEnabled: false,
			favoriteStoreAlertsLastCheckedAt: null,
			favoritesCount: 0,
			latestVersion: null,
			currentVersion: "0.0.0",
			rank: null,
			matches: [],
			matchesLoading: false,
			confirmLogout: () => {},
			reauthenticate: () => {},
			openRelease: () => {},
			toggleFavoriteStoreAlerts: () => {},
			switchAccount: () => {},
			refreshProfile: () => {},
		};
	}

	return {
		redirect: false,
		account,
		snapshot: account.profileSnapshot,
		refreshing,
		error,
		ignoringBatteryOptimizations,
		updatingAlerts,
		favoriteStoreAlertsEnabled,
		favoriteStoreAlertsLastCheckedAt,
		favoritesCount,
		latestVersion,
		currentVersion: Constants.expoConfig?.version ?? "0.0.0",
		rank: companion.rank,
		matches: companion.matches,
		matchesLoading: companion.matchesLoading,
		confirmLogout,
		reauthenticate,
		openRelease,
		toggleFavoriteStoreAlerts,
		switchAccount,
		refreshProfile,
	};
}
