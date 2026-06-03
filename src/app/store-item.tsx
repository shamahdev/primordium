import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { StoreItemRarity } from '@/lib/account';
import {
  getCanonicalCosmeticCatalogItem,
  getSkinDetailAsset,
  getStoreItemAsset,
  type CosmeticCatalogItem,
  type SkinDetailAsset,
  type SkinDetailChroma,
  type SkinDetailLevel,
} from '@/lib/valorant-store-assets';
import { useFavoriteStore } from '@/stores/favorite-store';
import { SafeAreaView } from 'react-native-safe-area-context';

type StoreItemParams = {
  itemAssetId: string;
  itemType: string;
  title: string;
  priceAmount?: string;
  priceCurrency?: string;
  rarity?: string;
  source?: string;
};

const FavoriteStarColor = '#FAD663';

export default function StoreItemScreen() {
  const params = useLocalSearchParams<StoreItemParams>();
  // const theme = useTheme();

  if (params.itemType === 'skin') {
    return <SkinDetailView params={params} />;
  }

  return <SimpleDetailView params={params} />;
}

function SkinDetailView({ params }: { params: StoreItemParams }) {
  const theme = useTheme();
  const favoriteItem = useResolvedFavoriteItem(params);
  const [skinDetail, setSkinDetail] = React.useState<SkinDetailAsset | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedChromaIndex, setSelectedChromaIndex] = React.useState(0);
  const [activeVideoUrl, setActiveVideoUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const detail = await getSkinDetailAsset(params.itemAssetId);
      if (!cancelled) {
        setSkinDetail(detail ?? null);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [params.itemAssetId]);

  const selectedChroma = skinDetail?.chromas[selectedChromaIndex];
  const heroImageUrl = selectedChroma?.fullRender ?? selectedChroma?.displayIcon ?? skinDetail?.displayIcon;
  const showPrice = shouldShowPrice(params);

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
          <Header title={params.title} favoriteItem={favoriteItem} />
          <View style={styles.centered}>
            <ThemedText themeColor="textSecondary">Skin detail unavailable</ThemedText>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const renderChromaItem = ({ item: chroma, index }: { item: SkinDetailChroma; index: number }) => (
    <Pressable
      onPress={() => handleChromaSelect(index)}
      style={[
        styles.chromaSwatch,
        { borderColor: index === selectedChromaIndex ? theme.primary : theme.backgroundSelected },
      ]}
    >
      {chroma.swatch ? (
        <Image source={chroma.swatch} contentFit="cover" style={styles.chromaSwatchImage} />
      ) : (
        <ThemedView type="backgroundElement" style={styles.chromaSwatchImage} />
      )}
    </Pressable>
  );

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>

      <Header title={params.title} favoriteItem={favoriteItem} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.heroContainer}>
          {activeVideoUrl ? (
            <SkinVideoPlayer url={activeVideoUrl} onDismiss={() => setActiveVideoUrl(null)} />
          ) : heroImageUrl ? (
            <Image source={heroImageUrl} contentFit="contain" style={styles.heroImage} />
          ) : (
            <ThemedView type="backgroundElement" style={[styles.heroImage, styles.heroFallback]}>
              <ThemedText themeColor="textSecondary">No preview</ThemedText>
            </ThemedView>
          )}
        </View>

        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <ThemedText type="subtitle" numberOfLines={2}>{skinDetail.title}</ThemedText>
            {showPrice ? (
              <PriceDisplay
                amount={params.priceAmount!}
                currency={params.priceCurrency!}
                rarity={params.rarity as StoreItemRarity | undefined}
              />
            ) : null}
          </View>
        </View>

        {skinDetail.chromas.length > 1 && (
          <View style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>CHROMAS</ThemedText>
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
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>LEVELS</ThemedText>
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
      </SafeAreaView>
    </ThemedView>
  );
}

type DetailState = {
  imageUrl?: string;
  largeImageUrl?: string;
  wideImageUrl?: string;
  animationUrl?: string;
  loading: boolean;
};

function SimpleDetailView({ params }: { params: StoreItemParams }) {
  const favoriteItem = useResolvedFavoriteItem(params);
  const [state, setState] = React.useReducer(
    (prev: DetailState, next: Partial<DetailState>) => ({ ...prev, ...next }),
    { loading: true },
  );

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const asset = await getStoreItemAsset(params.itemAssetId);
      if (!cancelled) {
        setState({
          imageUrl: asset?.imageUrl,
          largeImageUrl: asset?.largeImageUrl,
          wideImageUrl: asset?.wideImageUrl,
          animationUrl: asset?.animationUrl,
          loading: false,
        });
      }
    })();
    return () => { cancelled = true; };
  }, [params.itemAssetId]);

  const isCard = params.itemType === 'card';
  const isTitle = params.itemType === 'title';
  const heroSource = state.animationUrl ?? state.largeImageUrl ?? state.imageUrl;
  const showPrice = shouldShowPrice(params);

  return (
    <ThemedView style={styles.screen}>
      <Header title={params.title} favoriteItem={favoriteItem} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {state.loading ? (
          <View style={styles.heroContainer}>
            <ActivityIndicator />
          </View>
        ) : isTitle ? (
          <TitlePreview title={params.title} />
        ) : isCard && state.imageUrl && state.wideImageUrl && state.largeImageUrl ? (
          <CardArtGrid displayIcon={state.imageUrl} wideArt={state.wideImageUrl} largeArt={state.largeImageUrl} />
        ) : heroSource ? (
          <View style={styles.heroContainer}>
            <Image source={heroSource} contentFit="contain" style={styles.heroImage} autoplay={true} />
          </View>
        ) : (
          <View style={styles.heroContainer}>
            <ThemedView type="backgroundElement" style={[styles.heroImage, styles.heroFallback]}>
              <ThemedText themeColor="textSecondary">No preview</ThemedText>
            </ThemedView>
          </View>
        )}
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <ThemedText type="subtitle" numberOfLines={2}>{params.title}</ThemedText>
            {isTitle ? <ThemedText themeColor="textSecondary">Player Title</ThemedText> : null}
            {showPrice ? (
              <PriceDisplay
                amount={params.priceAmount!}
                currency={params.priceCurrency!}
                rarity={params.rarity as StoreItemRarity | undefined}
              />
            ) : null}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function TitlePreview({ title }: { title: string }) {
  return (
    <ThemedView type="backgroundElement" style={[styles.heroContainer, styles.titlePreview]}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
        PLAYER TITLE
      </ThemedText>
      <ThemedText type="subtitle" style={styles.titlePreviewText}>
        {title}
      </ThemedText>
    </ThemedView>
  );
}

function CardArtGrid({ displayIcon, wideArt, largeArt }: { displayIcon: string; wideArt: string; largeArt: string }) {
  return (
    <View style={styles.cardGrid}>
      <View style={styles.cardGridLeft}>
        <ThemedView type="backgroundElement" style={styles.cardGridCell}>
          <Image source={displayIcon} contentFit="contain" style={styles.cardGridImage} />
        </ThemedView>
        <ThemedView type="backgroundElement" style={styles.cardGridCell}>
          <Image source={wideArt} contentFit="contain" style={styles.cardGridImage} />
        </ThemedView>
      </View>
      <ThemedView type="backgroundElement" style={styles.cardGridLargeCell}>
        <Image source={largeArt} contentFit="contain" style={styles.cardGridImage} />
      </ThemedView>
    </View>
  );
}

function Header({ title, favoriteItem }: { title: string; favoriteItem?: CosmeticCatalogItem | null }) {
  const theme = useTheme();
  const favoritesById = useFavoriteStore((state) => state.favoritesById);
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);
  const isFavorite = favoriteItem ? !!favoritesById[favoriteItem.id] : false;

  const handleFavoritePress = () => {
    if (favoriteItem) {
      toggleFavorite(favoriteItem);
    }
  };

  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }} />
      {favoriteItem ? (
        <Pressable
          onPress={handleFavoritePress}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Remove favorite' : 'Add favorite'}
          style={styles.headerButton}>
          <Ionicons
            name={isFavorite ? 'star' : 'star-outline'}
            size={22}
            color={isFavorite ? FavoriteStarColor : theme.text}
          />
        </Pressable>
      ) : null}
      <Pressable onPress={() => router.back()} hitSlop={12} style={styles.closeButton}>
        <ThemedText type="default" style={{ color: theme.text, fontSize: 20 }}>✕</ThemedText>
      </Pressable>
    </View>
  );
}

function useResolvedFavoriteItem(params: StoreItemParams) {
  const [favoriteItem, setFavoriteItem] = React.useState<CosmeticCatalogItem | null>(null);
  const { itemAssetId, itemType, rarity, title } = params;

  React.useEffect(() => {
    let cancelled = false;
    setFavoriteItem(null);

    void (async () => {
      const item = await getCanonicalCosmeticCatalogItem(itemAssetId);
      if (!cancelled) {
        setFavoriteItem(item ?? getFallbackFavoriteItem({ itemAssetId, itemType, rarity, title }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [itemAssetId, itemType, rarity, title]);

  return favoriteItem;
}

function getFallbackFavoriteItem(params: StoreItemParams): CosmeticCatalogItem | null {
  if (!isCosmeticCatalogItemType(params.itemType)) return null;

  return {
    id: params.itemAssetId,
    itemType: params.itemType,
    title: params.title,
    rarity: params.rarity as CosmeticCatalogItem['rarity'],
  };
}

function isCosmeticCatalogItemType(value: string): value is CosmeticCatalogItem['itemType'] {
  return ['skin', 'buddy', 'spray', 'card', 'title', 'flex'].includes(value);
}

function PriceDisplay({ amount, currency, rarity }: { amount: string; currency: string; rarity?: StoreItemRarity }) {
  const currencyIcon = currency === 'vp'
    ? require('@/assets/images/valorant/vp.png')
    : currency === 'kingdomCredits'
      ? require('@/assets/images/valorant/kc.png')
      : null;

  const rarityIcon = rarity ? getRarityIcon(rarity) : null;

  return (
    <View style={styles.priceRow}>
      <ThemedText type="default">{Number(amount).toLocaleString()}</ThemedText>
      {currencyIcon ? <Image source={currencyIcon} contentFit="contain" style={styles.currencyIcon} /> : null}
      {rarityIcon ? <Image source={rarityIcon} contentFit="contain" style={styles.rarityBadge} /> : null}
    </View>
  );
}

function shouldShowPrice(params: StoreItemParams) {
  return params.source !== 'catalog' && !!params.priceAmount && !!params.priceCurrency;
}

function LevelRow({ level, index, isActive, onPlay }: { level: SkinDetailLevel; index: number; isActive: boolean; onPlay: () => void }) {
  const theme = useTheme();
  const levelLabel = getLevelLabel(level, index);

  return (
    <View style={[styles.levelRow, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.levelInfo}>
        <ThemedText type="smallBold">Level {index + 1}</ThemedText>
        {levelLabel && <ThemedText type="small" themeColor="textSecondary">{levelLabel}</ThemedText>}
      </View>
      {level.streamedVideo ? (
        <Pressable onPress={onPlay} hitSlop={8} style={[styles.playButton, { backgroundColor: isActive ? theme.primary : theme.backgroundSelected }]}>
          <ThemedText type="smallBold" style={{ color: isActive ? theme.primaryForeground : theme.text }}>▶</ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

function SkinVideoPlayer({ url, onDismiss }: { url: string; onDismiss: () => void }) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = true;
    p.play();
  });

  return (
    <Pressable onLongPress={onDismiss} style={styles.videoContainer}>
      <VideoView player={player} style={styles.heroImage} contentFit="contain" nativeControls={false} />
    </Pressable>
  );
}

function getLevelLabel(level: SkinDetailLevel, index: number) {
  if (level.levelItem) {
    const parts = level.levelItem.split('::');
    const item = parts[parts.length - 1];
    if (item) {
      return item.replace(/([A-Z])/g, ' $1').trim();
    }
  }
  if (index === 0) return 'Base';
  return undefined;
}

function getRarityIcon(rarity: StoreItemRarity) {
  const icons = {
    select: require('@/assets/images/valorant/skin-rarity/select.png'),
    deluxe: require('@/assets/images/valorant/skin-rarity/deluxe.png'),
    premium: require('@/assets/images/valorant/skin-rarity/premium.png'),
    exclusive: require('@/assets/images/valorant/skin-rarity/exclusive.png'),
    ultra: require('@/assets/images/valorant/skin-rarity/ultra.png'),
  } as const;
  return icons[rarity];
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  heroContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroFallback: {
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  titleBlock: {
    flex: 1,
    gap: Spacing.one,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  levelInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
    width: '100%',
    aspectRatio: 1,
  },
  cardGridLeft: {
    flex: 1,
    gap: Spacing.two,
  },
  cardGridCell: {
    flex: 1,
    borderRadius: Spacing.three,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardGridLargeCell: {
    flex: 1,
    borderRadius: Spacing.three,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardGridImage: {
    width: '100%',
    height: '100%',
  },
  titlePreview: {
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  titlePreviewText: {
    textAlign: 'center',
  },
});
