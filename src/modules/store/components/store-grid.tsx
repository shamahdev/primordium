import { FlatList, StyleSheet, View } from "react-native";
import { Spacing } from "@/commons/constants/theme";
import { StoreGridCardVisual } from "@/modules/store/components/store-grid-card-visual";
import type { StoreItem } from "@/modules/store/store-type";

type StoreGridProps = {
	items: StoreItem[];
	favoriteMatchesById?: Record<string, boolean>;
};

export function StoreGrid({ items, favoriteMatchesById }: StoreGridProps) {
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
			data={items}
			keyExtractor={(item) => item.id}
			numColumns={2}
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
		justifyContent: "space-between",
	},
	gridItem: {
		width: "49%",
	},
});
