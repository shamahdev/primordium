import Ionicons from "@expo/vector-icons/Ionicons";
import { LegendList } from "@legendapp/list/react-native";
import React from "react";
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	TextInput,
	View,
} from "react-native";

import { ErrorBanner } from "@/commons/components/error-banner";
import { PrimaryButton } from "@/commons/components/primary-button";
import { ThemedText } from "@/commons/components/themed-text";
import { ThemedView } from "@/commons/components/themed-view";
import { Spacing } from "@/commons/constants/theme";
import { useTheme } from "@/commons/hooks/use-theme";
import {
	ALL_RARITIES_LABEL,
	CATALOG_TYPE_ORDER,
	FILTER_LABELS,
	RARITY_LABELS,
	RARITY_ORDER,
} from "../catalog-constants";
import { getCatalogRarityColor } from "../catalog-presentation";
import type {
	CatalogItemType,
	CatalogListItem,
	CatalogRarity,
	CatalogRenderItem,
	CatalogSection,
} from "../catalog-type";
import { CatalogFavoriteToggleFab } from "../components/catalog-favorite-toggle-fab";
import { CatalogFilterChip } from "../components/catalog-filter-chip";
import { CatalogRow } from "../components/catalog-row";
import { CatalogSectionHeader } from "../components/catalog-section-header";
import type { OwnedStatus } from "../use-catalog-view-model";

type CatalogViewProps = {
	error: string | null;
	retryCatalog: () => void;
	favoritesOnly: boolean;
	typeFilter: CatalogItemType[];
	rarityFilter: CatalogRarity[];
	ownedStatus: OwnedStatus;
	ownedItemIds: Set<string>;
	search: string;
	sections: CatalogSection[];
	resultCount: number;
	loading: boolean;
	favoriteItems: CatalogListItem[];
	favoritesById: Record<string, unknown>;
	handleSearchChange: (text: string) => void;
	handleToggleType: (type: CatalogItemType) => void;
	handleClearTypes: () => void;
	handleToggleRarity: (rarity: CatalogRarity) => void;
	handleClearRarities: () => void;
	handleToggleFavoritesOnly: () => void;
	handleSetOwnedStatus: (status: OwnedStatus) => void;
};

export function CatalogView({
	error,
	retryCatalog,
	favoritesOnly,
	typeFilter,
	rarityFilter,
	ownedStatus,
	ownedItemIds,
	search,
	sections,
	resultCount,
	loading,
	favoriteItems,
	favoritesById,
	handleSearchChange,
	handleToggleType,
	handleClearTypes,
	handleToggleRarity,
	handleClearRarities,
	handleToggleFavoritesOnly,
	handleSetOwnedStatus,
}: CatalogViewProps) {
	const theme = useTheme();

	const flatData = React.useMemo<CatalogRenderItem[]>(() => {
		const rows: CatalogRenderItem[] = [];
		for (const section of sections) {
			if (section.data.length === 0) continue;
			rows.push({
				kind: "header",
				key: `section-${section.key}`,
				title: section.title,
			});
			for (const item of section.data) {
				rows.push({ kind: "item", key: item.id, item });
			}
		}
		return rows;
	}, [sections]);

	const renderItem = React.useCallback(
		({ item }: { item: CatalogRenderItem }) => {
			if (item.kind === "header") {
				return <CatalogSectionHeader title={item.title} />;
			}

			return (
				<CatalogRow
					item={item.item}
					isFavorite={!!favoritesById[item.item.id]}
					isOwned={ownedItemIds.has(item.item.id)}
				/>
			);
		},
		[favoritesById, ownedItemIds],
	);

	const getItemType = React.useCallback(
		(item: CatalogRenderItem) => item.kind,
		[],
	);

	const keyExtractor = React.useCallback(
		(item: CatalogRenderItem) => item.key,
		[],
	);

	return (
		<ThemedView style={styles.screen}>
			{error ? (
				<ErrorBanner
					message={error}
					actionLabel="Retry"
					onPress={retryCatalog}
				/>
			) : null}
			<LegendList
				data={flatData}
				keyExtractor={keyExtractor}
				renderItem={renderItem}
				getItemType={getItemType}
				recycleItems
				estimatedItemSize={72}
				ListHeaderComponent={
					<View style={styles.headerContent}>
						<View style={styles.searchRow}>
							<TextInput
								value={search}
								onChangeText={handleSearchChange}
								placeholder="Search items or types"
								placeholderTextColor={theme.textSecondary}
								autoCapitalize="none"
								autoCorrect={false}
								style={[
									styles.searchInput,
									{
										color: theme.text,
										backgroundColor: theme.backgroundElement,
										borderColor: theme.backgroundSelected,
									},
								]}
							/>
							{search.length > 0 ? (
								<Pressable
									onPress={() => handleSearchChange("")}
									style={styles.searchClear}
								>
									<Ionicons
										name="close-circle"
										size={18}
										color={theme.textSecondary}
									/>
								</Pressable>
							) : null}
						</View>
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
						{!loading && !error ? (
							<ThemedText type="xsmall" themeColor="textSecondary">
								{resultCount.toLocaleString()}{" "}
								{favoritesOnly ? "favorites" : "items"}
							</ThemedText>
						) : null}
					</View>
				}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						{loading && !favoritesOnly ? (
							<>
								<ActivityIndicator />
								<ThemedText themeColor="textSecondary">
									Loading catalog...
								</ThemedText>
							</>
						) : error ? (
							<PrimaryButton label="Retry" onPress={retryCatalog} />
						) : rarityFilter.length > 0 ? (
							<View style={styles.emptyStateText}>
								<ThemedText type="smallBold">
									No items match the selected rarities
								</ThemedText>
								<ThemedText
									themeColor="textSecondary"
									style={styles.emptyStateHint}
								>
									Rarity only applies to skins. Clear rarities or pick Skins.
								</ThemedText>
							</View>
						) : favoritesOnly && favoriteItems.length === 0 ? (
							<View style={styles.emptyStateText}>
								<ThemedText type="smallBold">No favorites yet</ThemedText>
								<ThemedText
									themeColor="textSecondary"
									style={styles.emptyStateHint}
								>
									Open an item and tap the star.
								</ThemedText>
							</View>
						) : favoritesOnly ? (
							<ThemedText themeColor="textSecondary">
								No favorites match your filters.
							</ThemedText>
						) : (
							<ThemedText themeColor="textSecondary">
								No items match your filters.
							</ThemedText>
						)}
					</View>
				}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
				contentInsetAdjustmentBehavior="automatic"
			/>
			<CatalogFavoriteToggleFab
				active={favoritesOnly}
				onPress={handleToggleFavoritesOnly}
			/>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		alignItems: "center",
	},
	content: {
		padding: Spacing.four,
		paddingBottom: 96,
		gap: Spacing.two,
	},
	headerContent: {
		gap: Spacing.three,
		paddingBottom: Spacing.three,
	},
	searchRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	searchInput: {
		flex: 1,
		borderWidth: StyleSheet.hairlineWidth,
		borderRadius: Spacing.one,
		paddingHorizontal: Spacing.three,
		paddingVertical: Spacing.two,
		fontSize: 16,
	},
	searchClear: {
		position: "absolute",
		right: Spacing.two,
	},
	chipRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Spacing.two,
	},
	sectionHeader: {
		letterSpacing: 1.4,
		paddingTop: Spacing.three,
		paddingBottom: Spacing.one,
	},
	emptyState: {
		minHeight: 240,
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.three,
	},
	emptyStateText: {
		alignItems: "center",
		gap: Spacing.one,
	},
	emptyStateHint: {
		textAlign: "center",
	},
});
