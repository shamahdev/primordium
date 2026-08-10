import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native";
import { MaxContentWidth, Spacing } from "@/commons/constants/theme";
import { StoreGridCardVisual } from "@/modules/store/components/store-grid-card-visual";
import type { StoreItem } from "@/modules/store/store-type";

type StoreGridProps = {
	items: StoreItem[];
	favoriteMatchesById?: Record<string, boolean>;
};

/** Two columns on phones, up to three on wide/tablet content areas. */
export function getStoreGridColumnCount(windowWidth: number) {
	const contentWidth = Math.min(windowWidth, MaxContentWidth);
	return Math.max(2, Math.floor(contentWidth / 240));
}

export function StoreGrid({ items, favoriteMatchesById }: StoreGridProps) {
	const { width: windowWidth } = useWindowDimensions();
	const columns = getStoreGridColumnCount(windowWidth);

	const renderStoreItem = ({ item }: { item: StoreItem }) => {
		const favoriteLookupId = item.favoriteTargetId ?? item.itemAssetId;

		return (
			<View style={styles.gridItem}>
				<StoreGridCardVisual
					item={item}
					isFavorite={
						favoriteLookupId ? !!favoriteMatchesById?.[favoriteLookupId] : false
					}
				/>
			</View>
		);
	};

	return (
		<FlatList
			key={columns}
			data={items}
			keyExtractor={(item) => item.id}
			numColumns={columns}
			scrollEnabled={false}
			contentContainerStyle={styles.gridList}
			columnWrapperStyle={styles.gridRow}
			renderItem={renderStoreItem}
		/>
	);
}

const styles = StyleSheet.create({
	gridList: {
		gap: Spacing.two,
	},
	gridRow: {
		gap: Spacing.two,
	},
	gridItem: {
		flex: 1,
	},
});
