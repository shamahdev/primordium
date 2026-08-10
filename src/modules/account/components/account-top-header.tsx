import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/commons/components/themed-text";
import { ThemedView } from "@/commons/components/themed-view";
import {
	Colors,
	MaxContentWidth,
	Spacing,
	StatusColors,
} from "@/commons/constants/theme";
import { useAccountStore } from "@/modules/account/account-store";
import { getAccountLabel } from "@/modules/account/account-type";

export function AccountTopHeader() {
	const account = useAccountStore((state) =>
		state.accounts.find((item) => item.id === state.activeAccountId),
	);

	if (!account) {
		return null;
	}

	const balances = account.profileSnapshot?.balances;
	const rank = account.rankSnapshot?.rank;

	return (
		<ThemedView style={styles.outer}>
			<View style={styles.inner}>
				<Pressable
					onPress={() => router.push("/switch-account")}
					accessibilityRole="button"
					accessibilityLabel={`Switch account. Current account: ${getAccountLabel(account)}`}
					accessibilityHint="Opens the account switcher"
					style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
				>
					<View style={styles.identityRow}>
						<View style={styles.identity}>
							<ThemedText
								type="smallBold"
								numberOfLines={1}
								style={{ color: Colors.dark.text }}
							>
								{getAccountLabel(account)}
							</ThemedText>
							{rank ? (
								<RankPill
									rank={rank}
									update={account.rankSnapshot?.latestUpdate ?? null}
								/>
							) : null}
						</View>
						<Ionicons
							name="chevron-forward"
							size={14}
							color={Colors.dark.textSecondary}
						/>
					</View>
				</Pressable>
				<View style={styles.balances}>
					<BalancePill
						icon={require("@/assets/images/valorant/vp.png")}
						value={balances?.vp}
					/>
					<BalancePill
						icon={require("@/assets/images/valorant/radianite.png")}
						value={balances?.radianite}
					/>
					<BalancePill
						icon={require("@/assets/images/valorant/kc.png")}
						value={balances?.kingdomCredits}
					/>
				</View>
			</View>
		</ThemedView>
	);
}

function toRankHex(color: string) {
	const hex = color.replace(/^#/, "").slice(0, 6);
	return hex.length === 6 ? `#${hex}` : `#${hex.padEnd(6, "0")}`;
}

function RankPill({
	rank,
	update,
}: {
	rank: { tierShortName: string; color: string; rankedRating: number };
	update: { rankedRatingEarned: number } | null;
}) {
	const delta = update?.rankedRatingEarned;
	const hasDelta = typeof delta === "number";
	const deltaColor =
		hasDelta && delta >= 0 ? StatusColors.success : StatusColors.danger;
	return (
		<View style={styles.rankPill}>
			<View style={[styles.rankDot, { backgroundColor: toRankHex(rank.color) }]} />
			<ThemedText
				type="xsmall"
				numberOfLines={1}
				style={{ color: Colors.dark.text, flexShrink: 1 }}
			>
				{rank.tierShortName} · {rank.rankedRating} RR
			</ThemedText>
			{hasDelta ? (
				<View style={styles.rankDelta}>
					<Ionicons
						name={delta >= 0 ? "arrow-up" : "arrow-down"}
						size={10}
						color={deltaColor}
					/>
					<ThemedText type="xsmall" style={{ color: deltaColor }}>
						{delta >= 0 ? "+" : "-"}
						{Math.abs(delta)}
					</ThemedText>
				</View>
			) : null}
		</View>
	);
}

function BalancePill({ icon, value }: { icon: number; value?: number }) {
	return (
		<View style={styles.balancePill}>
			<Image source={icon} style={styles.currencyIcon} />
			<ThemedText
				type="smallBold"
				numberOfLines={1}
				style={{ color: Colors.dark.text }}
			>
				{typeof value === "number" ? value.toLocaleString() : "--"}
			</ThemedText>
		</View>
	);
}

const styles = StyleSheet.create({
	outer: {
		alignItems: "center",
		paddingHorizontal: Spacing.four,
		paddingVertical: Spacing.three,
		backgroundColor: Colors.dark.background,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "rgba(255,255,255,0.06)",
	},
	inner: {
		width: "100%",
		maxWidth: MaxContentWidth,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Spacing.three,
	},
	identity: {
		flex: 1,
		gap: 4,
		minWidth: 0,
	},
	identityRow: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.two,
		minWidth: 0,
	},
	rankPill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		flexWrap: "wrap",
	},
	rankDelta: {
		flexDirection: "row",
		alignItems: "center",
		gap: 2,
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 99,
		backgroundColor: "rgba(255,255,255,0.06)",
	},
	rankDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	balances: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.three,
		flexShrink: 0,
	},
	balancePill: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.one,
	},
	currencyIcon: {
		width: 16,
		height: 16,
	},
});
