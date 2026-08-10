import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/commons/components/themed-text";
import { Radius, Spacing } from "@/commons/constants/theme";
import { useTheme } from "@/commons/hooks/use-theme";
import { FILTER_LABELS, RARITY_LABELS } from "../catalog-constants";
import type { CatalogItemType, CatalogRarity } from "../catalog-type";
import type { OwnedStatus } from "../use-catalog-view-model";

type CatalogFilterToolbarProps = {
	expanded: boolean;
	typeFilter: CatalogItemType[];
	rarityFilter: CatalogRarity[];
	ownedStatus: OwnedStatus;
	favoritesOnly: boolean;
	resultCount: number;
	showResultCount: boolean;
	onToggleExpanded: () => void;
};

export const CatalogFilterToolbar = React.memo(function CatalogFilterToolbar({
	expanded,
	typeFilter,
	rarityFilter,
	ownedStatus,
	favoritesOnly,
	resultCount,
	showResultCount,
	onToggleExpanded,
}: CatalogFilterToolbarProps) {
	const theme = useTheme();

	const activeCount =
		typeFilter.length +
		rarityFilter.length +
		(ownedStatus !== "all" ? 1 : 0) +
		(favoritesOnly ? 1 : 0);

	const summary = React.useMemo(() => {
		const parts: string[] = [
			...typeFilter.map((type) => FILTER_LABELS[type]),
			...rarityFilter.map((rarity) => RARITY_LABELS[rarity]),
		];
		if (ownedStatus === "owned") parts.push("Owned");
		if (ownedStatus === "notOwned") parts.push("Not owned");
		if (favoritesOnly) parts.push("Favorites");
		return parts.join(" · ");
	}, [typeFilter, rarityFilter, ownedStatus, favoritesOnly]);

	return (
		<View style={styles.toolbar}>
			<View style={styles.toolbarRow}>
				<Pressable
					onPress={onToggleExpanded}
					accessibilityRole="button"
					accessibilityLabel="Filters"
					accessibilityState={{ expanded }}
					style={[
						styles.filtersButton,
						{
							backgroundColor: theme.backgroundElement,
							borderColor: theme.backgroundSelected,
						},
					]}
				>
					<Ionicons name="options-outline" size={18} color={theme.text} />
					<ThemedText type="xsmall" style={styles.filtersLabel}>
						Filters
					</ThemedText>
					{activeCount > 0 ? (
						<View style={[styles.badge, { backgroundColor: theme.primary }]}>
							<ThemedText
								type="xsmall"
								themeColor="primaryForeground"
								style={styles.badgeText}
							>
								{activeCount}
							</ThemedText>
						</View>
					) : null}
					<Ionicons
						name={expanded ? "chevron-up" : "chevron-down"}
						size={16}
						color={theme.textSecondary}
					/>
				</Pressable>
				{showResultCount ? (
					<ThemedText
						type="xsmall"
						themeColor="textSecondary"
						numberOfLines={1}
						style={styles.resultCount}
					>
						{resultCount.toLocaleString()}{" "}
						{favoritesOnly ? "favorites" : "items"}
					</ThemedText>
				) : null}
			</View>
			<ThemedText
				type="xsmall"
				themeColor="textSecondary"
				numberOfLines={1}
				style={styles.summary}
			>
				{activeCount > 0 ? summary : "No active filters"}
			</ThemedText>
		</View>
	);
});

const styles = StyleSheet.create({
	toolbar: {
		gap: Spacing.one,
	},
	toolbarRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Spacing.two,
	},
	filtersButton: {
		minHeight: 44,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.two,
		borderWidth: StyleSheet.hairlineWidth,
		borderRadius: Radius.small,
		paddingHorizontal: Spacing.three,
	},
	filtersLabel: {
		fontWeight: 600,
	},
	badge: {
		minWidth: 18,
		height: 18,
		borderRadius: 9,
		paddingHorizontal: 5,
		alignItems: "center",
		justifyContent: "center",
	},
	badgeText: {
		fontSize: 11,
		lineHeight: 14,
	},
	resultCount: {
		flexShrink: 1,
	},
	summary: {
		textAlign: "right",
	},
});
