import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorBanner } from "@/commons/components/error-banner";
import { PrimaryButton } from "@/commons/components/primary-button";
import { ThemedText } from "@/commons/components/themed-text";
import { ThemedView } from "@/commons/components/themed-view";
import { MaxContentWidth, Radius, Spacing } from "@/commons/constants/theme";
import { useTheme } from "@/commons/hooks/use-theme";
import { getAccountLabel } from "@/modules/account/account-type";
import { useAccountSwitchViewModel } from "@/modules/account/use-account-switch-view-model";

export function AccountSwitchView() {
	const theme = useTheme();
	const insets = useSafeAreaInsets();
	const {
		accounts,
		activeAccountId,
		busyAccountId,
		error,
		reason,
		failedAccount,
		chooseAccount,
		cancel,
		routeToReauth,
		addAccount,
		getReasonCopy,
	} = useAccountSwitchViewModel();

	return (
		<ThemedView style={styles.screen}>
			{reason === "reauthFailed" && failedAccount && (
				<ErrorBanner
					message={`Sign in again as ${getAccountLabel(failedAccount)}.`}
					actionLabel="Sign in"
					onPress={() => routeToReauth(failedAccount.id)}
				/>
			)}

			{error && <ErrorBanner message={error} />}

			<ScrollView
				contentContainerStyle={[
					styles.content,
					{
						paddingTop: insets.top + Spacing.four,
						paddingBottom: insets.bottom + Spacing.four,
					},
				]}
				showsVerticalScrollIndicator={false}
			>
				<ThemedView style={styles.header}>
					<ThemedText type="title">Switch Account</ThemedText>
					<ThemedText themeColor="textSecondary">
						{getReasonCopy(reason)}
					</ThemedText>
				</ThemedView>

				<ThemedView style={styles.accounts}>
					{accounts.map((account) => {
						const active = account.id === activeAccountId;
						const busy = account.id === busyAccountId;
						return (
							<Pressable
								key={account.id}
								disabled={!!busyAccountId}
								onPress={() => void chooseAccount(account.id)}
								accessibilityRole="button"
								accessibilityLabel={`${getAccountLabel(account)}, ${account.shard.toUpperCase()}, ${account.status === "needsReauth" ? "Sign in required" : "Ready"}`}
								accessibilityState={{
									selected: active,
									disabled: !!busyAccountId,
								}}
								style={({ pressed }) => [
									styles.accountRow,
									{
										backgroundColor: active
											? theme.backgroundSelected
											: theme.backgroundElement,
										opacity: pressed ? 0.75 : busyAccountId ? 0.55 : 1,
									},
								]}
							>
								<ThemedView
									style={[
										styles.accountAvatar,
										{ backgroundColor: theme.primary },
									]}
								>
									<ThemedText
										type="smallBold"
										style={{ color: theme.primaryForeground }}
									>
										{account.gameName.slice(0, 2).toUpperCase()}
									</ThemedText>
								</ThemedView>
								<ThemedView style={styles.accountText}>
									<ThemedText type="smallBold">
										{getAccountLabel(account)}
									</ThemedText>
									<ThemedText type="small" themeColor="textSecondary">
										{account.shard.toUpperCase()} ·{" "}
										{account.status === "needsReauth"
											? "Sign in required"
											: "Ready"}
									</ThemedText>
								</ThemedView>
								{busy ? (
									<ActivityIndicator />
								) : (
									active && (
										<ThemedText type="small" themeColor="primary">
											Active
										</ThemedText>
									)
								)}
							</Pressable>
						);
					})}
				</ThemedView>

				<PrimaryButton label="Add account" onPress={addAccount} />
				<Pressable
					onPress={cancel}
					accessibilityRole="button"
					style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
				>
					<ThemedText type="small" themeColor="textSecondary">
						Cancel
					</ThemedText>
				</Pressable>
			</ScrollView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		alignItems: "center",
	},
	content: {
		width: "100%",
		maxWidth: MaxContentWidth,
		alignSelf: "center",
		padding: Spacing.four,
		gap: Spacing.three,
	},
	header: {
		gap: Spacing.two,
		paddingVertical: Spacing.three,
	},
	accounts: {
		gap: Spacing.two,
	},
	accountRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.three,
		borderRadius: Radius.large,
		padding: Spacing.three,
	},
	accountAvatar: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: "center",
		justifyContent: "center",
	},
	accountText: {
		flex: 1,
		gap: Spacing.one,
		backgroundColor: "transparent",
	},
	cancel: {
		alignItems: "center",
	},
	pressed: {
		opacity: 0.7,
	},
});
