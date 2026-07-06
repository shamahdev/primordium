import { router } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { useFavoriteStore } from "@/modules/favorite/favorite-store";
import { StoreGridCardVisual } from "@/modules/store/components/store-grid-card-visual";
import type { StoreItem } from "@/modules/store/store-type";

type StoreGridCardProps = {
	item: StoreItem;
	onBeforeNavigate?: () => void;
};

const NON_TAPPABLE_TYPES: StoreItem["itemType"][] = ["unknown"];

export function StoreGridCard({ item, onBeforeNavigate }: StoreGridCardProps) {
	const favoritesById = useFavoriteStore((state) => state.favoritesById);
	const favoriteLookupId = item.favoriteTargetId ?? item.itemAssetId;

	return (
		<StoreGridCardPressable
			item={item}
			isFavorite={favoriteLookupId ? !!favoritesById[favoriteLookupId] : false}
			onBeforeNavigate={onBeforeNavigate}
		/>
	);
}

export function StoreGridCardPressable({
	item,
	onBeforeNavigate,
	isFavorite,
}: StoreGridCardProps & { isFavorite: boolean }) {
	const isTappable =
		!NON_TAPPABLE_TYPES.includes(item.itemType) && !!item.itemAssetId;

	const handlePress = () => {
		if (!isTappable) return;
		onBeforeNavigate?.();
		router.push({
			pathname: "/store-item",
			params: {
				itemAssetId: item.itemAssetId!,
				itemType: item.itemType,
				title: item.title,
				priceAmount: String(item.price.amount),
				priceCurrency: item.price.currency,
				...(item.rarity ? { rarity: item.rarity } : {}),
			},
		});
	};

	const card = <StoreGridCardVisual item={item} isFavorite={isFavorite} />;

	if (!isTappable) return card;

	return (
		<Pressable
			onPress={handlePress}
			style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
		>
			{card}
		</Pressable>
	);
}

export function StoreGridCardHitbox({
	item,
	onBeforeNavigate,
}: StoreGridCardProps) {
	const isTappable =
		!NON_TAPPABLE_TYPES.includes(item.itemType) && !!item.itemAssetId;

	const handlePress = () => {
		if (!isTappable) return;
		onBeforeNavigate?.();
		router.push({
			pathname: "/store-item",
			params: {
				itemAssetId: item.itemAssetId!,
				itemType: item.itemType,
				title: item.title,
				priceAmount: String(item.price.amount),
				priceCurrency: item.price.currency,
				...(item.rarity ? { rarity: item.rarity } : {}),
			},
		});
	};

	if (!isTappable) return null;

	return <Pressable onPress={handlePress} style={styles.hitbox} />;
}

const styles = StyleSheet.create({
	hitbox: {
		width: "100%",
		aspectRatio: 3 / 4,
	},
});
