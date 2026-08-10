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
import { MaxContentWidth, Radius, Spacing } from "@/commons/constants/theme";
import { useTheme } from "@/commons/hooks/use-theme";
import type {
	CatalogItemType,
	CatalogListItem,
	CatalogRarity,
	CatalogRenderItem,
	CatalogSection,
} from "../catalog-type";
import { CatalogFilterPanel } from "../components/catalog-filter-panel";
import { CatalogFilterToolbar } from "../components/catalog-filter-toolbar";
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
	const [filtersExpanded, setFiltersExpanded] = React.useState(false);

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
								accessibilityLabel="Search catalog"
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
									hitSlop={8}
									accessibilityRole="button"
									accessibilityLabel="Clear search"
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
						<CatalogFilterToolbar
							expanded={filtersExpanded}
							typeFilter={typeFilter}
							rarityFilter={rarityFilter}
							ownedStatus={ownedStatus}
							favoritesOnly={favoritesOnly}
							resultCount={resultCount}
							showResultCount={!loading && !error}
							onToggleExpanded={() =>
								setFiltersExpanded((expanded) => !expanded)
							}
						/>
						{filtersExpanded ? (
							<CatalogFilterPanel
								typeFilter={typeFilter}
								rarityFilter={rarityFilter}
								ownedStatus={ownedStatus}
								favoritesOnly={favoritesOnly}
								handleToggleType={handleToggleType}
								handleClearTypes={handleClearTypes}
								handleToggleRarity={handleToggleRarity}
								handleClearRarities={handleClearRarities}
								handleSetOwnedStatus={handleSetOwnedStatus}
								handleToggleFavoritesOnly={handleToggleFavoritesOnly}
							/>
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
		paddingBottom: Spacing.four,
		gap: Spacing.two,
		maxWidth: MaxContentWidth,
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
		borderRadius: Radius.small,
		paddingHorizontal: Spacing.three,
		paddingRight: Spacing.five,
		paddingVertical: Spacing.two,
		fontSize: 16,
	},
	searchClear: {
		position: "absolute",
		right: Spacing.two,
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
