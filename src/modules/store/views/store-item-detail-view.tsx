import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React from "react";
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from "react-native";
import {
	SafeAreaView,
	useSafeAreaInsets,
} from "react-native-safe-area-context";
import { SectionHeader } from "@/commons/components/section-header";
import { ThemedText } from "@/commons/components/themed-text";
import { ThemedView } from "@/commons/components/themed-view";
import { MaxContentWidth, Radius, Spacing } from "@/commons/constants/theme";
import { useTheme } from "@/commons/hooks/use-theme";
import { FavoriteStarColor } from "@/modules/catalog/catalog-constants";
import {
	getCatalogRarityIcon,
	getCatalogStoreCurrencyIcon,
} from "@/modules/catalog/catalog-presentation";
import { CatalogService } from "@/modules/catalog/catalog-service";
import type {
	CosmeticCatalogItem,
	SkinDetailAsset,
	SkinDetailChroma,
	SkinDetailLevel,
} from "@/modules/catalog/catalog-type";
import { useFavoriteStore } from "@/modules/favorite/favorite-store";
import { StoreService } from "@/modules/store/store-service";
import type {
	StoreCurrency,
	StoreItemDetailModel,
	StoreItemRarity,
} from "@/modules/store/store-type";

type StoreItemDetailViewProps = {
	itemAssetId: string;
	itemType: string;
	title: string;
	priceAmount?: string;
	priceCurrency?: string;
	rarity?: string;
	source?: string;
};

export function StoreItemDetailView(props: StoreItemDetailViewProps) {
	if (props.itemType === "skin") {
		return <SkinDetailView {...props} />;
	}

	return <SimpleDetailView {...props} />;
}

function SkinDetailView(props: StoreItemDetailViewProps) {
	const theme = useTheme();
	const detailRequest = useStoreItemDetailRequest(props);
	const [detailModel, setDetailModel] =
		React.useState<StoreItemDetailModel | null>(null);
	const [skinDetail, setSkinDetail] = React.useState<SkinDetailAsset | null>(
		null,
	);
	const [loading, setLoading] = React.useState(true);
	const [selectedChromaIndex, setSelectedChromaIndex] = React.useState(0);
	const [activeVideoUrl, setActiveVideoUrl] = React.useState<string | null>(
		null,
	);

	React.useEffect(() => {
		let cancelled = false;
		(async () => {
			const [detail, model] = await Promise.all([
				CatalogService.getSkinDetailAsset(props.itemAssetId),
				StoreService.getItemDetail(detailRequest),
			]);
			if (!cancelled) {
				setSkinDetail(detail ?? null);
				setDetailModel(model);
				setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [detailRequest, props.itemAssetId]);

	const selectedChroma = skinDetail?.chromas[selectedChromaIndex];
	const heroImageUrl =
		selectedChroma?.fullRender ??
		selectedChroma?.displayIcon ??
		skinDetail?.displayIcon;

	const handleChromaSelect = (index: number) => {
		setSelectedChromaIndex(index);
		setActiveVideoUrl(null);
	};

	const handleLevelPlay = (level: SkinDetailLevel) => {
		if (level.streamedVideo) {
			setActiveVideoUrl(level.streamedVideo);
		}
	};

	if (loading) {
		return (
			<ThemedView style={styles.screen}>
				<SafeAreaView style={[styles.safeArea, styles.centered]}>
					<ActivityIndicator />
				</SafeAreaView>
			</ThemedView>
		);
	}

	if (!skinDetail) {
		return (
			<ThemedView style={styles.screen}>
				<SafeAreaView style={styles.safeArea}>
					<Header />
					<View style={styles.centered}>
						<ThemedText themeColor="textSecondary">
							Skin detail unavailable
						</ThemedText>
					</View>
				</SafeAreaView>
			</ThemedView>
		);
	}

	const renderChromaItem = ({
		item: chroma,
		index,
	}: {
		item: SkinDetailChroma;
		index: number;
	}) => (
		<Pressable
			onPress={() => handleChromaSelect(index)}
			hitSlop={4}
			accessibilityRole="button"
			accessibilityLabel={`Chroma ${index + 1}`}
			accessibilityState={{ selected: index === selectedChromaIndex }}
			style={[
				styles.chromaSwatch,
				{
					borderColor:
						index === selectedChromaIndex
							? theme.primary
							: theme.backgroundSelected,
				},
			]}
		>
			{chroma.swatch ? (
				<Image
					source={chroma.swatch}
					contentFit="cover"
					style={styles.chromaSwatchImage}
				/>
			) : (
				<ThemedView type="backgroundElement" style={styles.chromaSwatchImage} />
			)}
		</Pressable>
	);

	return (
		<ThemedView style={styles.screen}>
			<SafeAreaView style={styles.safeArea}>
				<Header />
				<ScrollView
					contentContainerStyle={styles.contentContainer}
					showsVerticalScrollIndicator={false}
					contentInsetAdjustmentBehavior="automatic"
				>
					<View style={styles.heroContainer}>
						{activeVideoUrl ? (
							<SkinVideoPlayer
								url={activeVideoUrl}
								onDismiss={() => setActiveVideoUrl(null)}
							/>
						) : heroImageUrl ? (
							<Image
								source={heroImageUrl}
								contentFit="contain"
								style={styles.heroImage}
							/>
						) : (
							<ThemedView
								type="backgroundElement"
								style={[styles.heroImage, styles.heroFallback]}
							>
								<ThemedText themeColor="textSecondary">No preview</ThemedText>
							</ThemedView>
						)}
					</View>

					<View style={styles.titleRow}>
						<View style={styles.titleBlock}>
							<ThemedText type="subtitle" numberOfLines={2}>
								{skinDetail.title}
							</ThemedText>
							{detailModel?.price ? (
								<PriceDisplay
									amount={detailModel.price.amount}
									currency={detailModel.price.currency}
									rarity={detailModel.price.rarity}
								/>
							) : null}
						</View>
					</View>

					{skinDetail.chromas.length > 1 && (
						<View style={styles.section}>
							<SectionHeader title="Chromas" />
							<FlatList
								horizontal
								data={skinDetail.chromas}
								keyExtractor={(chroma) => chroma.uuid}
								contentContainerStyle={styles.chromaRow}
								showsHorizontalScrollIndicator={false}
								renderItem={renderChromaItem}
							/>
						</View>
					)}

					{skinDetail.levels.length > 1 && (
						<View style={styles.section}>
							<SectionHeader title="Levels" />
							<View style={styles.levelsList}>
								{skinDetail.levels.map((level, index) => (
									<LevelRow
										key={level.uuid}
										level={level}
										index={index}
										isActive={activeVideoUrl === level.streamedVideo}
										onPlay={() => handleLevelPlay(level)}
									/>
								))}
							</View>
						</View>
					)}
				</ScrollView>
				<FavoriteFab favoriteItem={detailModel?.favoriteTarget} />
			</SafeAreaView>
		</ThemedView>
	);
}

function SimpleDetailView(props: StoreItemDetailViewProps) {
	const detailRequest = useStoreItemDetailRequest(props);
	const [detailModel, setDetailModel] =
		React.useState<StoreItemDetailModel | null>(null);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		let cancelled = false;
		(async () => {
			const model = await StoreService.getItemDetail(detailRequest);
			if (!cancelled) {
				setDetailModel(model);
				setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [detailRequest]);

	const title = detailModel?.title ?? props.title;

	return (
		<ThemedView style={styles.screen}>
			<SafeAreaView style={styles.safeArea}>
				<Header />
				<ScrollView
					contentContainerStyle={styles.contentContainer}
					showsVerticalScrollIndicator={false}
					contentInsetAdjustmentBehavior="automatic"
				>
					{loading ? (
						<View style={styles.heroContainer}>
							<ActivityIndicator />
						</View>
					) : detailModel?.isTitle ? (
						<TitlePreview title={title} />
					) : detailModel?.isCard &&
						detailModel.imageUrl &&
						detailModel.wideImageUrl &&
						detailModel.largeImageUrl ? (
						<CardArtGrid
							displayIcon={detailModel.imageUrl}
							wideArt={detailModel.wideImageUrl}
							largeArt={detailModel.largeImageUrl}
						/>
					) : detailModel?.heroSource ? (
						<View style={styles.heroContainer}>
							<Image
								source={detailModel.heroSource}
								contentFit="contain"
								style={styles.heroImage}
								autoplay={true}
							/>
						</View>
					) : (
						<View style={styles.heroContainer}>
							<ThemedView
								type="backgroundElement"
								style={[styles.heroImage, styles.heroFallback]}
							>
								<ThemedText themeColor="textSecondary">No preview</ThemedText>
							</ThemedView>
						</View>
					)}
					<View style={styles.titleRow}>
						<View style={styles.titleBlock}>
							<ThemedText type="subtitle" numberOfLines={2}>
								{title}
							</ThemedText>
							{detailModel?.isTitle ? (
								<ThemedText themeColor="textSecondary">Player Title</ThemedText>
							) : null}
							{detailModel?.price ? (
								<PriceDisplay
									amount={detailModel.price.amount}
									currency={detailModel.price.currency}
									rarity={detailModel.price.rarity}
								/>
							) : null}
						</View>
					</View>
				</ScrollView>
				<FavoriteFab favoriteItem={detailModel?.favoriteTarget} />
			</SafeAreaView>
		</ThemedView>
	);
}

function TitlePreview({ title }: { title: string }) {
	return (
		<ThemedView
			type="backgroundElement"
			style={[styles.heroContainer, styles.titlePreview]}
		>
			<ThemedText
				type="small"
				themeColor="textSecondary"
				style={styles.sectionLabel}
			>
				PLAYER TITLE
			</ThemedText>
			<ThemedText type="subtitle" style={styles.titlePreviewText}>
				{title}
			</ThemedText>
		</ThemedView>
	);
}

function CardArtGrid({
	displayIcon,
	wideArt,
	largeArt,
}: {
	displayIcon: string;
	wideArt: string;
	largeArt: string;
}) {
	return (
		<View style={styles.cardGrid}>
			<View style={styles.cardGridLeft}>
				<ThemedView type="backgroundElement" style={styles.cardGridCell}>
					<Image
						source={displayIcon}
						contentFit="contain"
						style={styles.cardGridImage}
					/>
				</ThemedView>
				<ThemedView type="backgroundElement" style={styles.cardGridCell}>
					<Image
						source={wideArt}
						contentFit="contain"
						style={styles.cardGridImage}
					/>
				</ThemedView>
			</View>
			<ThemedView type="backgroundElement" style={styles.cardGridLargeCell}>
				<Image
					source={largeArt}
					contentFit="contain"
					style={styles.cardGridImage}
				/>
			</ThemedView>
		</View>
	);
}

function Header() {
	const theme = useTheme();

	return (
		<View style={styles.header}>
			<View style={{ flex: 1 }} />
			<Pressable
				onPress={() => router.back()}
				hitSlop={12}
				style={styles.closeButton}
				accessibilityRole="button"
				accessibilityLabel="Close"
			>
				<Ionicons name="close" size={22} color={theme.text} />
			</Pressable>
		</View>
	);
}

function FavoriteFab({
	favoriteItem,
}: {
	favoriteItem?: CosmeticCatalogItem | null;
}) {
	const theme = useTheme();
	const insets = useSafeAreaInsets();
	const favoritesById = useFavoriteStore((state) => state.favoritesById);
	const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);

	if (!favoriteItem) return null;

	const isFavorite = !!favoritesById[favoriteItem.id];

	return (
		<Pressable
			onPress={() => toggleFavorite(favoriteItem)}
			style={[
				styles.fab,
				{
					bottom: (insets.bottom || 24) + 24,
					backgroundColor: theme.backgroundElement,
				},
			]}
			accessibilityRole="button"
			accessibilityLabel={isFavorite ? "Remove favorite" : "Add favorite"}
		>
			<Ionicons
				name={isFavorite ? "star" : "star-outline"}
				size={24}
				color={isFavorite ? FavoriteStarColor : theme.text}
			/>
		</Pressable>
	);
}

function useStoreItemDetailRequest(props: StoreItemDetailViewProps) {
	const {
		itemAssetId,
		itemType,
		title,
		priceAmount,
		priceCurrency,
		rarity,
		source,
	} = props;
	return React.useMemo(
		() => ({
			itemAssetId,
			itemType,
			title,
			priceAmount,
			priceCurrency,
			rarity,
			source,
		}),
		[itemAssetId, itemType, priceAmount, priceCurrency, rarity, source, title],
	);
}

function PriceDisplay({
	amount,
	currency,
	rarity,
}: {
	amount: string;
	currency: StoreCurrency;
	rarity?: StoreItemRarity;
}) {
	const currencyIcon = getCatalogStoreCurrencyIcon(currency);
	const rarityIcon = rarity ? getCatalogRarityIcon(rarity) : null;

	return (
		<View style={styles.priceRow}>
			<ThemedText type="default">{Number(amount).toLocaleString()}</ThemedText>
			{currencyIcon ? (
				<Image
					source={currencyIcon}
					contentFit="contain"
					style={styles.currencyIcon}
				/>
			) : null}
			{rarityIcon ? (
				<Image
					source={rarityIcon}
					contentFit="contain"
					style={styles.rarityBadge}
				/>
			) : null}
		</View>
	);
}

function LevelRow({
	level,
	index,
	isActive,
	onPlay,
}: {
	level: SkinDetailLevel;
	index: number;
	isActive: boolean;
	onPlay: () => void;
}) {
	const theme = useTheme();
	const levelLabel = getLevelLabel(level, index);
	const hasVideo = !!level.streamedVideo;

	const content = (
		<>
			<View
				style={[
					styles.playButton,
					{
						backgroundColor: isActive
							? theme.primary
							: hasVideo
								? theme.backgroundSelected
								: "transparent",
					},
				]}
			>
				{hasVideo ? (
					<Ionicons
						name="play"
						size={14}
						color={isActive ? theme.primaryForeground : theme.text}
					/>
				) : null}
			</View>
			<View style={styles.levelInfo}>
				<ThemedText type="smallBold">Level {index + 1}</ThemedText>
				{levelLabel && (
					<ThemedText type="small" themeColor="textSecondary">
						{levelLabel}
					</ThemedText>
				)}
			</View>
		</>
	);

	if (!hasVideo) {
		return (
			<View
				style={[styles.levelRow, { backgroundColor: theme.backgroundElement }]}
			>
				{content}
			</View>
		);
	}

	return (
		<Pressable
			onPress={onPlay}
			style={({ pressed }) => [
				styles.levelRow,
				{
					backgroundColor: pressed
						? theme.backgroundSelected
						: theme.backgroundElement,
				},
			]}
			accessibilityRole="button"
			accessibilityLabel={`Play preview for level ${index + 1}${levelLabel ? `: ${levelLabel}` : ""}`}
		>
			{content}
		</Pressable>
	);
}

function SkinVideoPlayer({
	url,
	onDismiss,
}: {
	url: string;
	onDismiss: () => void;
}) {
	const player = useVideoPlayer(url, (p) => {
		p.loop = true;
		p.play();
	});

	return (
		<View style={styles.videoContainer}>
			<VideoView
				player={player}
				style={styles.heroImage}
				contentFit="contain"
				nativeControls={false}
			/>
			<Pressable
				onPress={onDismiss}
				hitSlop={8}
				style={styles.videoCloseButton}
				accessibilityRole="button"
				accessibilityLabel="Close video"
			>
				<Ionicons name="close" size={18} color="#ffffff" />
			</Pressable>
		</View>
	);
}

function getLevelLabel(level: SkinDetailLevel, index: number) {
	if (level.levelItem) {
		const parts = level.levelItem.split("::");
		const item = parts[parts.length - 1];
		if (item) {
			return item.replace(/([A-Z])/g, " $1").trim();
		}
	}
	if (index === 0) return "Base";
	return undefined;
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		alignItems: "center",
	},
	safeArea: {
		flex: 1,
		width: "100%",
		maxWidth: MaxContentWidth,
	},
	centered: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: Spacing.four,
		paddingVertical: Spacing.two,
	},
	closeButton: {
		width: 32,
		height: 32,
		alignItems: "center",
		justifyContent: "center",
	},
	contentContainer: {
		padding: Spacing.four,
		gap: Spacing.four,
		paddingBottom: 80,
	},
	heroContainer: {
		width: "100%",
		aspectRatio: 16 / 9,
		justifyContent: "center",
		alignItems: "center",
	},
	heroImage: {
		width: "100%",
		height: "100%",
	},
	heroFallback: {
		borderRadius: Radius.large,
		alignItems: "center",
		justifyContent: "center",
	},
	videoContainer: {
		width: "100%",
		height: "100%",
	},
	videoCloseButton: {
		position: "absolute",
		top: Spacing.two,
		right: Spacing.two,
		width: 32,
		height: 32,
		borderRadius: Radius.large,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(0, 0, 0, 0.6)",
	},
	titleRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: Spacing.three,
	},
	titleBlock: {
		flex: 1,
		gap: Spacing.one,
	},
	priceRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.one,
	},
	currencyIcon: {
		width: 16,
		height: 16,
	},
	rarityBadge: {
		width: 20,
		height: 20,
		marginLeft: Spacing.one,
	},
	section: {
		gap: Spacing.two,
	},
	sectionLabel: {
		letterSpacing: 1.4,
	},
	chromaRow: {
		gap: Spacing.two,
		paddingVertical: Spacing.one,
	},
	chromaSwatch: {
		width: 40,
		height: 40,
		borderRadius: 20,
		borderWidth: 2,
		overflow: "hidden",
		alignItems: "center",
		justifyContent: "center",
	},
	chromaSwatchImage: {
		width: 36,
		height: 36,
		borderRadius: 18,
	},
	levelsList: {
		gap: Spacing.two,
	},
	levelRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.three,
		paddingHorizontal: Spacing.three,
		paddingVertical: Spacing.two,
		borderRadius: Radius.large,
	},
	levelInfo: {
		flex: 1,
		gap: Spacing.half,
	},
	playButton: {
		width: 32,
		height: 32,
		borderRadius: Radius.large,
		alignItems: "center",
		justifyContent: "center",
	},
	cardGrid: {
		flexDirection: "row",
		gap: Spacing.two,
		width: "100%",
		aspectRatio: 1,
	},
	cardGridLeft: {
		flex: 1,
		gap: Spacing.two,
	},
	cardGridCell: {
		flex: 1,
		borderRadius: Radius.large,
		overflow: "hidden",
		alignItems: "center",
		justifyContent: "center",
	},
	cardGridLargeCell: {
		flex: 1,
		borderRadius: Radius.large,
		overflow: "hidden",
		alignItems: "center",
		justifyContent: "center",
	},
	cardGridImage: {
		width: "100%",
		height: "100%",
	},
	titlePreview: {
		borderRadius: Radius.large,
		gap: Spacing.two,
	},
	titlePreviewText: {
		textAlign: "center",
	},
	fab: {
		position: "absolute",
		right: 24,
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 6,
	},
});
