import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, RarityColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { StoreItem, StoreItemRarity } from '@/lib/account';
import { getCanonicalCosmeticCatalogItem } from '@/lib/valorant-store-assets';
import { useFavoriteStore } from '@/stores/favorite-store';

type StoreItemCardProps = {
  item: StoreItem;
  onBeforeNavigate?: () => void;
};

const NON_TAPPABLE_TYPES: StoreItem['itemType'][] = ['unknown'];
const ACCESSORY_TYPES: StoreItem['itemType'][] = ['buddy', 'spray', 'card', 'title', 'flex'];
const FavoriteStarColor = '#FAD663';

export function StoreItemCard({ item, onBeforeNavigate }: StoreItemCardProps) {
  const theme = useTheme();
  const favoritesById = useFavoriteStore((state) => state.favoritesById);
  const [favoriteItemId, setFavoriteItemId] = React.useState<string | null>(null);
  const currencyIcon = getCurrencyIcon(item.price.currency);
  const rarityIcon = item.rarity ? getRarityIcon(item.rarity) : null;
  const rarityColor = item.rarity ? RarityColors[item.rarity] : null;
  const isTappable = !NON_TAPPABLE_TYPES.includes(item.itemType) && !!item.itemAssetId;
  const isAccessory = ACCESSORY_TYPES.includes(item.itemType);
  const isFavorite = favoriteItemId ? !!favoritesById[favoriteItemId] : false;

  React.useEffect(() => {
    let cancelled = false;
    setFavoriteItemId(null);

    if (!item.itemAssetId) return;

    void (async () => {
      const catalogItem = await getCanonicalCosmeticCatalogItem(item.itemAssetId!);
      if (!cancelled) {
        setFavoriteItemId(catalogItem?.id ?? item.itemAssetId ?? null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [item.itemAssetId]);

  const handlePress = () => {
    if (!isTappable) return;
    onBeforeNavigate?.();
    router.push({
      pathname: '/store-item',
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

  const card = (
    <View style={styles.card}>
      {item.imageUrl ? (
        <>
          {rarityIcon && (
            <Image source={rarityIcon} contentFit="contain" style={styles.rarityWatermark} />
          )}
          <Image source={item.imageUrl} contentFit="contain" style={styles.image} />
        </>
      ) : (
        <View style={styles.fallbackBackground}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {item.itemType.toUpperCase()}
          </ThemedText>
        </View>
      )}

      {rarityColor && (
        <LinearGradient
          colors={['transparent', `${rarityColor}99`]}
          locations={[0.4, 1]}
          style={styles.gradientOverlay}
        />
      )}

      {(item.price.discountPercent ?? 0) > 0 && (
        <View style={[styles.discountBadge, { backgroundColor: theme.primary }]}>
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
        <View style={[styles.accessoryBadge, isFavorite && styles.accessoryBadgeWithFavorite]}>
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
          {currencyIcon && <Image source={currencyIcon} contentFit="contain" style={styles.currencyIcon} />}
          <ThemedText type="xsmall" style={styles.price}>
            {item.price.amount.toLocaleString()}
          </ThemedText>
        </View>
      </View>
    </View>
  );

  if (!isTappable) return card;

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      {card}
    </Pressable>
  );
}

function getCurrencyIcon(currency: StoreItem['price']['currency']) {
  if (currency === 'vp') {
    return require('@/assets/images/valorant/vp.png');
  }

  if (currency === 'kingdomCredits') {
    return require('@/assets/images/valorant/kc.png');
  }

  return null;
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
  card: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: Spacing.one,
    overflow: 'hidden',
    backgroundColor: Colors.dark.backgroundElement,
  },
  image: {
    ...StyleSheet.absoluteFill,
    paddingHorizontal: Spacing.two,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  rarityWatermark: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    opacity: 0.1,
    tintColor: '#ffffff',
  },
  fallbackBackground: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    zIndex: 2,
    gap: 2,
  },
  title: {
    color: '#ffffff',
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  price: {
    color: '#ffffff',
    fontWeight: '700',
  },
  currencyIcon: {
    width: 16,
    height: 16,
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.one,
    left: Spacing.one,
    paddingHorizontal: Spacing.one + 2,
    paddingVertical: 2,
    borderRadius: Spacing.half,
    zIndex: 2,
  },
  discountText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  accessoryBadge: {
    position: 'absolute',
    top: Spacing.one,
    right: Spacing.one,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: Spacing.one + 2,
    paddingVertical: 2,
    borderRadius: Spacing.half,
    zIndex: 2,
  },
  accessoryBadgeWithFavorite: {
    top: Spacing.one + 24,
  },
  accessoryBadgeText: {
    color: '#ffffff',
  },
  favoriteBadge: {
    position: 'absolute',
    top: Spacing.one,
    right: Spacing.one,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
});
