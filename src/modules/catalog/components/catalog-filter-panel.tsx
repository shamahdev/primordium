import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { SectionHeader } from "@/commons/components/section-header";
import { ThemedText } from "@/commons/components/themed-text";
import { Radius, Spacing } from "@/commons/constants/theme";
import { useTheme } from "@/commons/hooks/use-theme";
import {
	ALL_RARITIES_LABEL,
	CATALOG_TYPE_ORDER,
	FavoriteStarColor,
	FILTER_LABELS,
	RARITY_LABELS,
	RARITY_ORDER,
} from "../catalog-constants";
import { getCatalogRarityColor } from "../catalog-presentation";
import type { CatalogItemType, CatalogRarity } from "../catalog-type";
import type { OwnedStatus } from "../use-catalog-view-model";
import { CatalogFilterChip } from "./catalog-filter-chip";

type CatalogFilterPanelProps = {
	typeFilter: CatalogItemType[];
	rarityFilter: CatalogRarity[];
	ownedStatus: OwnedStatus;
	favoritesOnly: boolean;
	handleToggleType: (type: CatalogItemType) => void;
	handleClearTypes: () => void;
	handleToggleRarity: (rarity: CatalogRarity) => void;
	handleClearRarities: () => void;
	handleSetOwnedStatus: (status: OwnedStatus) => void;
	handleToggleFavoritesOnly: () => void;
};

export const CatalogFilterPanel = React.memo(function CatalogFilterPanel({
	typeFilter,
	rarityFilter,
	ownedStatus,
	favoritesOnly,
	handleToggleType,
	handleClearTypes,
	handleToggleRarity,
	handleClearRarities,
	handleSetOwnedStatus,
	handleToggleFavoritesOnly,
}: CatalogFilterPanelProps) {
	const theme = useTheme();

	const handleResetFilters = () => {
		handleClearTypes();
		handleClearRarities();
		handleSetOwnedStatus("all");
		if (favoritesOnly) handleToggleFavoritesOnly();
	};

	return (
		<View style={[styles.panel, { backgroundColor: theme.backgroundSelected }]}>
			<SectionHeader
				title="Filters"
				trailing={
					<Pressable
						onPress={handleResetFilters}
						accessibilityRole="button"
						accessibilityLabel="Reset filters"
						style={styles.resetButton}
					>
						<ThemedText type="xsmall" themeColor="textSecondary">
							Reset filters
						</ThemedText>
					</Pressable>
				}
			/>
			<SectionHeader title="Type" />
			<View style={styles.chipRow}>
				<CatalogFilterChip
					label={FILTER_LABELS.all}
					selected={typeFilter.length === 0}
					onPress={handleClearTypes}
				/>
				{CATALOG_TYPE_ORDER.map((type) => (
					<CatalogFilterChip
						key={type}
						label={FILTER_LABELS[type]}
						selected={typeFilter.includes(type)}
						onPress={() => handleToggleType(type)}
					/>
				))}
			</View>
			<SectionHeader title="Rarity" />
			<View style={styles.chipRow}>
				<CatalogFilterChip
					label={ALL_RARITIES_LABEL}
					selected={rarityFilter.length === 0}
					onPress={handleClearRarities}
				/>
				{RARITY_ORDER.map((rarity) => (
					<CatalogFilterChip
						key={rarity}
						label={RARITY_LABELS[rarity]}
						selected={rarityFilter.includes(rarity)}
						color={getCatalogRarityColor(rarity)}
						onPress={() => handleToggleRarity(rarity)}
					/>
				))}
			</View>
			<SectionHeader title="Ownership" />
			<View style={styles.chipRow}>
				<CatalogFilterChip
					label="All"
					selected={ownedStatus === "all"}
					onPress={() => handleSetOwnedStatus("all")}
				/>
				<CatalogFilterChip
					label="Owned"
					selected={ownedStatus === "owned"}
					onPress={() => handleSetOwnedStatus("owned")}
				/>
				<CatalogFilterChip
					label="Not owned"
					selected={ownedStatus === "notOwned"}
					onPress={() => handleSetOwnedStatus("notOwned")}
				/>
			</View>
			<SectionHeader title="Favorites" />
			<Pressable
				onPress={handleToggleFavoritesOnly}
				accessibilityRole="checkbox"
				accessibilityLabel="Favorites only"
				accessibilityState={{ checked: favoritesOnly }}
				style={[
					styles.favoritesRow,
					{ backgroundColor: theme.backgroundElement },
				]}
			>
				<Ionicons
					name={favoritesOnly ? "star" : "star-outline"}
					size={20}
					color={favoritesOnly ? FavoriteStarColor : theme.textSecondary}
				/>
				<ThemedText type="small" style={styles.favoritesLabel}>
					Favorites only
				</ThemedText>
				<Ionicons
					name={favoritesOnly ? "checkmark-circle" : "ellipse-outline"}
					size={20}
					color={favoritesOnly ? theme.primary : theme.textSecondary}
				/>
			</Pressable>
		</View>
	);
});

const styles = StyleSheet.create({
	panel: {
		borderRadius: Radius.small,
		padding: Spacing.three,
		gap: Spacing.two,
	},
	resetButton: {
		minHeight: 44,
		justifyContent: "center",
	},
	chipRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Spacing.two,
	},
	favoritesRow: {
		minHeight: 44,
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.two,
		borderRadius: Radius.small,
		paddingHorizontal: Spacing.three,
	},
	favoritesLabel: {
		flex: 1,
	},
});
