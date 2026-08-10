import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import type { ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/commons/components/themed-text";
import { Colors, Radius, Spacing } from "@/commons/constants/theme";
import { useTheme } from "@/commons/hooks/use-theme";
import {
	getCatalogRarityColor,
	getCatalogRarityIcon,
	getCatalogStoreCurrencyIcon,
} from "@/modules/catalog/catalog-presentation";
import type { StoreItem } from "@/modules/store/store-type";

type StoreGridCardVisualProps = {
	item: StoreItem;
	isFavorite: boolean;
};

const ACCESSORY_TYPES: StoreItem["itemType"][] = [
	"buddy",
	"spray",
	"card",
	"title",
	"flex",
];
const FavoriteStarColor = "#FAD663";

const getRarityGradientStyle = (color: string) =>
	({
		experimental_backgroundImage: `linear-gradient(180deg, transparent 0%, ${color}99 100%)`,
	}) as unknown as ViewStyle;

export function StoreGridCardVisual({
	item,
	isFavorite,
}: StoreGridCardVisualProps) {
	const theme = useTheme();
	const currencyIcon = getCatalogStoreCurrencyIcon(item.price.currency);
	const rarityIcon = item.rarity ? getCatalogRarityIcon(item.rarity) : null;
	const rarityColor = item.rarity ? getCatalogRarityColor(item.rarity) : null;
	const isAccessory = ACCESSORY_TYPES.includes(item.itemType);

	return (
		<View style={styles.card}>
			{item.imageUrl ? (
				<>
					{rarityIcon && (
						<Image
							source={rarityIcon}
							contentFit="contain"
							style={styles.rarityWatermark}
						/>
					)}
					<Image
						source={item.imageUrl}
						contentFit="contain"
						style={styles.image}
					/>
				</>
			) : (
				<View style={styles.fallbackBackground}>
					<ThemedText type="smallBold" themeColor="textSecondary">
						{item.itemType.toUpperCase()}
					</ThemedText>
				</View>
			)}

			{rarityColor && (
				<View
					style={[styles.rarityOverlay, getRarityGradientStyle(rarityColor)]}
				/>
			)}

			{(item.price.discountPercent ?? 0) > 0 && (
				<View
					style={[styles.discountBadge, { backgroundColor: theme.primary }]}
				>
					<ThemedText type="xsmall" style={styles.discountText}>
						-{item.price.discountPercent}%
					</ThemedText>
				</View>
			)}

			{isFavorite ? (
				<View style={styles.favoriteBadge}>
					<Ionicons name="star" size={14} color={FavoriteStarColor} />
				</View>
			) : null}

			{isAccessory && (
				<View
					style={[
						styles.accessoryBadge,
						isFavorite && styles.accessoryBadgeWithFavorite,
					]}
				>
					<ThemedText type="xsmall" style={styles.accessoryBadgeText}>
						{item.itemType.toUpperCase()}
					</ThemedText>
				</View>
			)}

			<View style={styles.textOverlay}>
				<ThemedText type="smallBold" style={styles.title} numberOfLines={1}>
					{item.title.toUpperCase()}
				</ThemedText>
				<View style={styles.priceRow}>
					{currencyIcon && (
						<Image
							source={currencyIcon}
							contentFit="contain"
							style={styles.currencyIcon}
						/>
					)}
					<ThemedText type="xsmall" style={styles.price}>
						{item.price.amount.toLocaleString()}
					</ThemedText>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		width: "100%",
		aspectRatio: 3 / 4,
		borderRadius: Radius.small,
		overflow: "hidden",
		backgroundColor: Colors.dark.backgroundElement,
	},
	image: {
		...StyleSheet.absoluteFill,
		paddingHorizontal: Spacing.two,
		width: "100%",
		height: "100%",
		zIndex: 1,
	},
	rarityWatermark: {
		...StyleSheet.absoluteFill,
		width: "100%",
		height: "100%",
		alignSelf: "center",
		opacity: 0.1,
		tintColor: "#ffffff",
	},
	fallbackBackground: {
		...StyleSheet.absoluteFill,
		alignItems: "center",
		justifyContent: "center",
	},
	rarityOverlay: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		height: "55%",
	},
	textOverlay: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: "rgba(0, 0, 0, 0.75)",
		paddingHorizontal: Spacing.two,
		paddingVertical: Spacing.two,
		zIndex: 2,
		gap: 2,
	},
	title: {
		color: "#ffffff",
		fontWeight: "700",
	},
	priceRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.one,
	},
	price: {
		color: "#ffffff",
		fontWeight: "700",
	},
	currencyIcon: {
		width: 16,
		height: 16,
	},
	discountBadge: {
		position: "absolute",
		top: Spacing.one,
		left: Spacing.one,
		paddingHorizontal: Spacing.one + 2,
		paddingVertical: 2,
		borderRadius: Radius.small,
		zIndex: 2,
	},
	discountText: {
		color: "#ffffff",
		fontWeight: "700",
	},
	accessoryBadge: {
		position: "absolute",
		top: Spacing.one,
		right: Spacing.one,
		backgroundColor: "rgba(0, 0, 0, 0.6)",
		paddingHorizontal: Spacing.one + 2,
		paddingVertical: 2,
		borderRadius: Radius.small,
		zIndex: 2,
	},
	accessoryBadgeWithFavorite: {
		top: Spacing.one + 24,
	},
	accessoryBadgeText: {
		color: "#ffffff",
	},
	favoriteBadge: {
		position: "absolute",
		top: Spacing.one,
		right: Spacing.one,
		width: 22,
		height: 22,
		borderRadius: 11,
		backgroundColor: "rgba(0, 0, 0, 0.6)",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 3,
	},
});
