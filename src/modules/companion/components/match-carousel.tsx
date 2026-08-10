import { Image } from "expo-image";
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	StyleSheet,
	View,
} from "react-native";

import { ThemedText } from "@/commons/components/themed-text";
import { Radius, Spacing, StatusColors } from "@/commons/constants/theme";
import { useTheme } from "@/commons/hooks/use-theme";
import type { MatchCard } from "../companion-type";

type MatchCarouselProps = {
	matches: MatchCard[];
	loading: boolean;
	error?: string | null;
	onRetry?: () => void;
};

export function MatchCarousel({
	matches,
	loading,
	error,
	onRetry,
}: MatchCarouselProps) {
	if (loading && matches.length === 0) {
		return (
			<View style={styles.stateContainer}>
				<ActivityIndicator size="small" />
				<ThemedText type="small" themeColor="textSecondary">
					Loading recent matches…
				</ThemedText>
			</View>
		);
	}

	if (error && matches.length === 0) {
		return (
			<View style={styles.stateContainer}>
				<ThemedText
					type="small"
					themeColor="textSecondary"
					style={styles.stateText}
				>
					{error}
				</ThemedText>
				{onRetry ? (
					<Pressable
						onPress={onRetry}
						accessibilityRole="button"
						style={({ pressed }) => [styles.retryButton, pressed && { opacity: 0.7 }]}
					>
						<ThemedText type="smallBold" style={{ color: "#fff" }}>
							Retry
						</ThemedText>
					</Pressable>
				) : null}
			</View>
		);
	}

	if (matches.length === 0) {
		return (
			<View style={styles.stateContainer}>
				<ThemedText type="small" themeColor="textSecondary" style={styles.stateText}>
					No recent matches found.
				</ThemedText>
				<ThemedText type="xsmall" themeColor="textSecondary">
					Play a match and pull to refresh.
				</ThemedText>
			</View>
		);
	}

	return (
		<FlatList
			horizontal
			data={matches}
			keyExtractor={(item) => item.matchId}
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={styles.carouselContent}
			ItemSeparatorComponent={() => <View style={{ width: Spacing.three }} />}
			renderItem={({ item }) => <MatchCardView card={item} />}
		/>
	);
}

function formatMatchDate(iso: string) {
	try {
		const d = new Date(iso);
		const now = Date.now();
		const diff = now - d.getTime();
		const hours = diff / (1000 * 60 * 60);
		if (hours < 24) {
			return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
		}
		return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
	} catch {
		return "";
	}
}

function MatchCardView({ card }: { card: MatchCard }) {
	const theme = useTheme();
	const winLabel = card.won === null ? "—" : card.won ? "WIN" : "LOSS";
	const winColor =
		card.won === null
			? theme.textSecondary
			: card.won
				? StatusColors.success
				: StatusColors.danger;
	const borderLeftColor = card.won === null ? theme.backgroundSelected : winColor;

	return (
		<View
			style={[
				styles.card,
				{
					backgroundColor: theme.backgroundElement,
					borderLeftColor,
				},
			]}
		>
			{card.mapSplash ? (
				<View style={styles.mapSplashWrap}>
					<Image source={card.mapSplash} style={styles.mapSplash} contentFit="cover" />
					<View style={styles.mapOverlay} />
					<View style={styles.mapLabel}>
						<ThemedText
							type="xsmall"
							numberOfLines={1}
							style={styles.mapName}
						>
							{card.mapName.toUpperCase()}
						</ThemedText>
						<ThemedText type="xsmall" style={styles.mapDate}>
							{formatMatchDate(card.gameStartTime)}
						</ThemedText>
					</View>
				</View>
			) : null}
			<View style={styles.cardBody}>
				<View style={styles.cardHeader}>
					<ThemedText
						type="xsmall"
						themeColor="textSecondary"
						style={styles.queueLabel}
					>
						{card.queueType.toUpperCase()}
					</ThemedText>
					<View style={[styles.winBadge, { backgroundColor: `${winColor}18` }]}>
						<ThemedText type="xsmall" style={{ color: winColor, fontWeight: "700" }}>
							{winLabel}
						</ThemedText>
					</View>
				</View>
				<View style={styles.agentRow}>
					{card.agentIcon ? (
						<Image source={card.agentIcon} style={styles.agentIcon} contentFit="contain" />
					) : null}
					<ThemedText type="small" numberOfLines={1} style={{ flex: 1 }}>
						{card.agentName}
					</ThemedText>
					<ThemedText type="smallBold">{card.teamScore}</ThemedText>
				</View>
				<View style={styles.statRow}>
					<ThemedText type="small" themeColor="textSecondary">
						{card.kills}/{card.deaths}/{card.assists}
					</ThemedText>
					{typeof card.rankedRatingEarned === "number" ? (
						<View
							style={[
								styles.rrBadge,
								{
									backgroundColor:
										card.rankedRatingEarned >= 0 ? "rgba(106,226,175,0.12)" : "rgba(226,97,106,0.12)",
								},
							]}
						>
							<ThemedText
								type="xsmall"
								style={{
									color:
										card.rankedRatingEarned >= 0 ? StatusColors.success : StatusColors.danger,
									fontWeight: "700",
								}}
							>
								{card.rankedRatingEarned >= 0 ? "+" : ""}
								{card.rankedRatingEarned} RR
							</ThemedText>
						</View>
					) : null}
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	stateContainer: {
		paddingVertical: Spacing.four,
		paddingHorizontal: Spacing.three,
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.two,
	},
	stateText: {
		textAlign: "center",
	},
	retryButton: {
		marginTop: Spacing.one,
		paddingHorizontal: Spacing.three,
		paddingVertical: Spacing.one,
		borderRadius: Radius.small,
		backgroundColor: "#E6112E",
	},
	carouselContent: {
		paddingHorizontal: Spacing.three,
		paddingVertical: Spacing.one,
	},
	card: {
		width: 188,
		borderRadius: Radius.small,
		overflow: "hidden",
		borderLeftWidth: 3,
	},
	mapSplashWrap: {
		width: "100%",
		height: 72,
		overflow: "hidden",
	},
	mapSplash: {
		width: "100%",
		height: "100%",
	},
	mapOverlay: {
		...StyleSheet.absoluteFill,
		backgroundColor: "rgba(0,0,0,0.35)",
	},
	mapLabel: {
		position: "absolute",
		bottom: 6,
		left: 8,
		right: 8,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		gap: Spacing.one,
	},
	mapName: {
		color: "#fff",
		fontWeight: "700",
		letterSpacing: 0.8,
		flex: 1,
	},
	mapDate: {
		color: "rgba(255,255,255,0.85)",
	},
	cardBody: {
		padding: Spacing.two,
		gap: Spacing.two,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	queueLabel: {
		letterSpacing: 1,
		flex: 1,
	},
	winBadge: {
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 99,
	},
	agentRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.one,
	},
	agentIcon: {
		width: 22,
		height: 22,
		borderRadius: 11,
		backgroundColor: "rgba(255,255,255,0.06)",
	},
	statRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	rrBadge: {
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 99,
	},
});
