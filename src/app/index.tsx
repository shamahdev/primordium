import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/commons/components/themed-text";
import { ThemedView } from "@/commons/components/themed-view";
import { MaxContentWidth, Spacing } from "@/commons/constants/theme";
import { useAccountStore } from "@/modules/account/account-store";

export default function HomeScreen() {
	const hasHydrated = useAccountStore((state) => state.hasHydrated);
	const accounts = useAccountStore((state) => state.accounts);
	const ensureActiveAccount = useAccountStore(
		(state) => state.ensureActiveAccount,
	);

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
					<ThemedText themeColor="textSecondary">
						Loading saved accounts...
					</ThemedText>
				</SafeAreaView>
			</ThemedView>
		);
	}

	if (accounts.length === 0) {
		return <Redirect href="/onboarding" />;
	}

	return <Redirect href="/home" />;
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		flexDirection: "row",
	},
	safeArea: {
		flex: 1,
		paddingHorizontal: Spacing.four,
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.three,
		maxWidth: MaxContentWidth,
	},
});
