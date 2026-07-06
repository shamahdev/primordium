import { Image } from "expo-image";
import { Platform, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/commons/components/primary-button";
import { ThemedText } from "@/commons/components/themed-text";
import { ThemedView } from "@/commons/components/themed-view";
import { MaxContentWidth, Spacing } from "@/commons/constants/theme";
import { useTheme } from "@/commons/hooks/use-theme";
import { ACCOUNT_SHARDS } from "@/modules/account/account-type";
import { useAccountOnboardingViewModel } from "@/modules/account/use-account-onboarding-view-model";

export function AccountOnboardingView() {
	const theme = useTheme();
	const insets = useSafeAreaInsets();
	const {
		accounts,
		selectedShard,
		setSelectedShard,
		startLogin,
		switchAccount,
	} = useAccountOnboardingViewModel();

	return (
		<ThemedView style={styles.screen}>
			<ScrollView
				style={styles.safeArea}
				contentInsetAdjustmentBehavior="automatic"
				contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
				showsVerticalScrollIndicator={false}
			>
				<ThemedView style={styles.hero}>
					<Image
						source={require("@/assets/images/icon.png")}
						style={styles.icon}
					/>
					<ThemedText type="title" style={styles.title}>
						Primordium
					</ThemedText>
				</ThemedView>

				<ThemedView style={styles.section}>
					<ThemedText type="small" themeColor="textSecondary">
						Pick Region:
					</ThemedText>
					<ThemedView style={styles.regionGrid}>
						{ACCOUNT_SHARDS.map((shard) => {
							const selected = shard.id === selectedShard;
							return (
								<Pressable
									key={shard.id}
									onPress={() => setSelectedShard(shard.id)}
									style={({ pressed }) => [
										styles.regionButton,
										{
											borderColor: selected
												? theme.primary
												: theme.backgroundSelected,
											backgroundColor: selected
												? theme.primary
												: theme.backgroundElement,
											opacity: pressed ? 0.75 : 1,
										},
									]}
								>
									<ThemedText
										type="smallBold"
										style={{
											color: selected ? theme.primaryForeground : theme.text,
										}}
									>
										{shard.label}
									</ThemedText>
								</Pressable>
							);
						})}
					</ThemedView>
				</ThemedView>

				{Platform.OS === "web" ? (
					<ThemedView type="backgroundElement" style={styles.card}>
						<ThemedText type="smallBold">Native app required</ThemedText>
						<ThemedText type="small" themeColor="textSecondary">
							WebView authentication is only supported for iOS and Android.
						</ThemedText>
					</ThemedView>
				) : (
					<PrimaryButton label="Login" onPress={startLogin} />
				)}

				{accounts.length > 0 && (
					<Pressable
						onPress={switchAccount}
						style={({ pressed }) => [
							styles.switchAccount,
							pressed && styles.pressed,
						]}
					>
						<ThemedText type="small" themeColor="textSecondary">
							Switch Account
						</ThemedText>
					</Pressable>
				)}

				<ThemedView type="backgroundElement" style={styles.card}>
					<ThemedText type="smallBold">Security note</ThemedText>
					<ThemedText type="small" themeColor="textSecondary">
						We do not collect or store your account credentials. When you log in
						via the official Riot Games portal, our app securely receives an
						authorization token. This token is used solely to authenticate
						official API requests directly from Riot.
					</ThemedText>
				</ThemedView>
			</ScrollView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
	},
	content: {
		maxWidth: MaxContentWidth,
		paddingHorizontal: Spacing.four,
		paddingVertical: Spacing.five,
		gap: Spacing.four,
	},
	hero: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.three,
	},
	icon: {
		width: 32,
		height: 32,
		borderRadius: Spacing.one,
	},
	title: {
		maxWidth: 620,
	},
	card: {
		gap: Spacing.two,
		padding: Spacing.three,
		borderRadius: Spacing.one,
	},
	section: {
		gap: Spacing.three,
	},
	regionGrid: {
		flexDirection: "column",
		gap: Spacing.two,
	},
	regionButton: {
		minWidth: 130,
		flex: 1,
		borderWidth: 1,
		borderRadius: Spacing.one,
		padding: Spacing.three,
		gap: Spacing.one,
	},
	switchAccount: {
		alignItems: "center",
	},
	pressed: {
		opacity: 0.7,
	},
});
