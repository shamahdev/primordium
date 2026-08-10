import { Redirect } from "expo-router";
import React from "react";
import {
	ActivityIndicator,
	Platform,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Switch,
	View,
} from "react-native";

import { ErrorBanner } from "@/commons/components/error-banner";
import { SectionHeader } from "@/commons/components/section-header";
import { ThemedText } from "@/commons/components/themed-text";
import { ThemedView } from "@/commons/components/themed-view";
import { MaxContentWidth, Radius, Spacing, StatusColors } from "@/commons/constants/theme";
import { useTheme } from "@/commons/hooks/use-theme";
import { useAccountProfileViewModel } from "@/modules/account/use-account-profile-view-model";
import { MatchCarousel } from "@/modules/companion/components/match-carousel";
import { requestIgnoreBatteryOptimizations } from "@/modules/favorite/adapters/favorite-battery-optimization.adapter";

export function AccountProfileView() {
	const theme = useTheme();
	const {
		redirect,
		account,
		snapshot,
		refreshing,
		error,
		ignoringBatteryOptimizations,
		updatingAlerts,
		favoriteStoreAlertsEnabled,
		favoriteStoreAlertsLastCheckedAt,
		favoritesCount,
		latestVersion,
		currentVersion,
		rank,
		rankLoading,
		rankError,
		matches,
		matchesLoading,
		matchesError,
		confirmLogout,
		reauthenticate,
		openRelease,
		toggleFavoriteStoreAlerts,
		switchAccount,
		refreshProfile,
		refreshMatches,
	} = useAccountProfileViewModel();

	if (redirect) {
		return <Redirect href="/" />;
	}

	if (!account) {
		return null;
	}

	if (!snapshot && refreshing) {
		return (
			<ThemedView style={styles.screen}>
				<View style={styles.centered}>
					<ActivityIndicator />
					<ThemedText themeColor="textSecondary">Loading profile...</ThemedText>
				</View>
			</ThemedView>
		);
	}

	return (
		<ThemedView style={styles.screen}>
			{account.status === "needsReauth" && (
				<ErrorBanner
					message="Session expired. Sign in again to refresh profile."
					actionLabel="Sign in"
					onPress={reauthenticate}
				/>
			)}

			{error && account.status !== "needsReauth" && (
				<ErrorBanner message={error} actionLabel="Retry" onPress={refreshProfile} />
			)}

			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
				contentInsetAdjustmentBehavior="never"
				refreshControl={
					<RefreshControl
						refreshing={refreshing || rankLoading || matchesLoading}
						onRefresh={refreshProfile}
						tintColor={theme.primary}
					/>
				}
			>
				{/* Competitive Rank */}
				<ThemedView type="backgroundElement" style={styles.section}>
					<SectionHeader
						title="Competitive Rank"
						trailing={rankLoading ? <ActivityIndicator size="small" /> : null}
					/>
					{rankError ? (
						<ThemedText type="small" themeColor="textSecondary" style={styles.rankError}>
							{rankError}
						</ThemedText>
					) : rank?.rank ? (
						<View style={styles.rankBlock}>
							<View style={styles.rankMainRow}>
								<View
									style={[
										styles.rankDotLarge,
										{ backgroundColor: `#${rank.rank.color.slice(0, 6)}` },
									]}
								/>
								<View style={styles.rankTextCol}>
									<ThemedText type="smallBold">
										{rank.rank.tierShortName} · {rank.rank.rankedRating} RR
									</ThemedText>
									<ThemedText type="xsmall" themeColor="textSecondary">
										{rank.rank.wins}W · {rank.rank.games} games · {rank.rank.tierName}
									</ThemedText>
								</View>
								{typeof rank.latestUpdate?.rankedRatingEarned === "number" ? (
									<View
										style={[
											styles.rankDeltaBadge,
											{
												backgroundColor:
													rank.latestUpdate.rankedRatingEarned >= 0
														? "rgba(106,226,175,0.14)"
														: "rgba(226,97,106,0.14)",
											},
										]}
									>
										<ThemedText
											type="smallBold"
											style={{
												color:
													rank.latestUpdate.rankedRatingEarned >= 0
														? StatusColors.success
														: StatusColors.danger,
											}}
										>
											{rank.latestUpdate.rankedRatingEarned >= 0 ? "+" : ""}
											{rank.latestUpdate.rankedRatingEarned} RR
										</ThemedText>
									</View>
								) : null}
							</View>
							{rank.fetchedAt ? (
								<ThemedText type="xsmall" themeColor="textSecondary">
									Updated {new Date(rank.fetchedAt).toLocaleString()}
								</ThemedText>
							) : null}
						</View>
					) : (
						<View style={styles.rankEmpty}>
							<ThemedText type="small" themeColor="textSecondary">
								No competitive rank yet.
							</ThemedText>
							<ThemedText type="xsmall" themeColor="textSecondary">
								Play ranked to see your RR here.
							</ThemedText>
						</View>
					)}
				</ThemedView>

				<ThemedView type="backgroundElement" style={styles.section}>
					<SectionHeader title="Progress" trailing={refreshing ? <ActivityIndicator size="small" /> : null} />
					<InfoRow label="Level" value={snapshot ? String(snapshot.level) : "--"} />
					<InfoRow label="XP" value={snapshot ? snapshot.xp.toLocaleString() : "--"} />
				</ThemedView>

				<ThemedView type="backgroundElement" style={styles.matchesSection}>
					<View style={styles.sectionInnerPad}>
						<SectionHeader title="Recent Matches" />
					</View>
					<MatchCarousel matches={matches} loading={matchesLoading} error={matchesError} onRetry={refreshMatches} />
				</ThemedView>

				<ThemedView type="backgroundElement" style={styles.section}>
					<SectionHeader title="Account" />
					<MenuButton label="Switch Account" onPress={switchAccount} />
					<MenuButton label="Logout" destructive onPress={confirmLogout} />
				</ThemedView>

				<ThemedView type="backgroundElement" style={styles.section}>
					<SectionHeader title="Notifications" />
					<AlertToggleRow
						enabled={favoriteStoreAlertsEnabled}
						disabled={updatingAlerts}
						onValueChange={toggleFavoriteStoreAlerts}
						favoritesCount={favoritesCount}
						lastCheckedAt={favoriteStoreAlertsLastCheckedAt}
					/>
					{favoriteStoreAlertsEnabled && Platform.OS === "android" && !ignoringBatteryOptimizations ? (
						<BatteryOptimizationCard onPress={() => void requestIgnoreBatteryOptimizations()} />
					) : null}
				</ThemedView>

				<ThemedView type="backgroundElement" style={styles.section}>
					<SectionHeader title="About" />
					<VersionRow currentVersion={currentVersion} latestVersion={latestVersion} onPressLatest={openRelease} />
				</ThemedView>
			</ScrollView>
		</ThemedView>
	);
}

function VersionRow({
	currentVersion,
	latestVersion,
	onPressLatest,
}: {
	currentVersion: string;
	latestVersion: string | null;
	onPressLatest: () => void;
}) {
	const theme = useTheme();
	return (
		<ThemedView type="backgroundElement" style={styles.row}>
			<ThemedText type="small">Version</ThemedText>
			<ThemedView type="backgroundElement" style={styles.versionValue}>
				<ThemedText type="small" themeColor="textSecondary">
					v{currentVersion}
				</ThemedText>
				{latestVersion ? (
					<Pressable
						onPress={onPressLatest}
						hitSlop={8}
						accessibilityRole="button"
						accessibilityLabel={`Update available, version ${latestVersion}`}
					>
						<ThemedText type="small" style={{ color: theme.primary }}>
							{`(v${latestVersion} available)`}
						</ThemedText>
					</Pressable>
				) : null}
			</ThemedView>
		</ThemedView>
	);
}

function InfoRow({ label, value }: { label: string; value: string }) {
	return (
		<ThemedView type="backgroundElement" style={styles.row}>
			<ThemedText type="small">{label}</ThemedText>
			<ThemedText type="small" themeColor="textSecondary" style={styles.rowValue} numberOfLines={1}>
				{value}
			</ThemedText>
		</ThemedView>
	);
}

function AlertToggleRow({
	enabled,
	disabled,
	onValueChange,
	favoritesCount,
	lastCheckedAt,
}: {
	enabled: boolean;
	disabled: boolean;
	onValueChange: (enabled: boolean) => void;
	favoritesCount: number;
	lastCheckedAt: string | null;
}) {
	const theme = useTheme();
	const metadata = React.useMemo(() => {
		const favoriteLabel = `${favoritesCount} Favorite${favoritesCount === 1 ? "" : "s"}`;
		if (!enabled) return `${favoriteLabel} • Enable alerts to check in background`;
		if (favoritesCount === 0) return `${favoriteLabel} • Add favorites to enable useful alerts`;
		if (!lastCheckedAt) return `${favoriteLabel} • Not checked yet`;
		return `${favoriteLabel} • Last checked ${formatRelativeTime(lastCheckedAt)}`;
	}, [enabled, favoritesCount, lastCheckedAt]);

	return (
		<ThemedView type="backgroundElement" style={styles.alertRow}>
			<ThemedView type="backgroundElement" style={styles.alertCopy}>
				<ThemedText type="small">Favorite store alerts</ThemedText>
				<ThemedText type="xsmall" themeColor="textSecondary">
					{metadata}
				</ThemedText>
			</ThemedView>
			<Switch
				value={enabled}
				disabled={disabled}
				onValueChange={(value) => void onValueChange(value)}
				accessibilityLabel="Favorite store alerts"
				trackColor={{ false: theme.backgroundSelected, true: theme.primary }}
				thumbColor={theme.primaryForeground}
			/>
		</ThemedView>
	);
}

function formatRelativeTime(isoDate: string): string {
	const now = Date.now();
	const then = new Date(isoDate).getTime();
	const diff = now - then;
	const seconds = Math.floor(diff / 1000);
	if (seconds < 60) return "Just now";
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes} min ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} h ago`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days} d ago`;
	return new Date(then).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function BatteryOptimizationCard({ onPress }: { onPress: () => void }) {
	const theme = useTheme();
	return (
		<ThemedView type="backgroundSelected" style={[styles.batteryCard, { borderColor: theme.backgroundSelected }]}>
			<ThemedText type="xsmall" themeColor="textSecondary">
				Background checks may be delayed if Android restricts Primordium in the background. Allow unrestricted battery
				usage for more reliable alerts.
			</ThemedText>
			<Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.batteryButton, pressed && styles.pressed]}>
				<ThemedText type="small" style={{ color: theme.primary }}>
					Allow unrestricted battery
				</ThemedText>
			</Pressable>
		</ThemedView>
	);
}

function MenuButton({ label, destructive, onPress }: { label: string; destructive?: boolean; onPress: () => void }) {
	const theme = useTheme();
	return (
		<Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}>
			<ThemedText type="small" style={destructive ? { color: theme.primary } : undefined}>
				{label}
			</ThemedText>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	scroll: {
		flex: 1,
		width: "100%",
	},
	centered: {
		flex: 1,
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		padding: Spacing.four,
		gap: Spacing.three,
	},
	content: {
		width: "100%",
		maxWidth: MaxContentWidth,
		alignSelf: "center",
		padding: Spacing.four,
		gap: Spacing.three,
		paddingBottom: Spacing.six,
	},
	section: {
		borderRadius: Radius.small,
		padding: Spacing.three,
		gap: Spacing.two,
	},
	matchesSection: {
		borderRadius: Radius.small,
		paddingVertical: Spacing.three,
		gap: Spacing.two,
		overflow: "hidden",
	},
	sectionInnerPad: {
		paddingHorizontal: Spacing.three,
	},
	rankBlock: {
		gap: Spacing.two,
	},
	rankMainRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.two,
	},
	rankDotLarge: {
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	rankTextCol: {
		flex: 1,
		gap: 2,
	},
	rankDeltaBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 99,
	},
	rankError: {
		paddingVertical: Spacing.one,
	},
	rankEmpty: {
		gap: Spacing.one,
		paddingVertical: Spacing.one,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Spacing.three,
	},
	rowValue: {
		flex: 1,
		textAlign: "right",
	},
	alertRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Spacing.three,
	},
	alertCopy: {
		flex: 1,
		gap: Spacing.one,
	},
	batteryCard: {
		borderWidth: StyleSheet.hairlineWidth,
		borderRadius: Radius.small,
		padding: Spacing.three,
		gap: Spacing.two,
	},
	batteryButton: {
		paddingVertical: Spacing.one,
	},
	versionValue: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: Spacing.one,
	},
	menuButton: {
		paddingVertical: Spacing.two,
	},
	pressed: {
		opacity: 0.7,
	},
});
