import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { StoreItem } from '@/lib/account';

type StoreItemCardProps = {
  item: StoreItem;
  onBeforeNavigate?: () => void;
};

const NON_TAPPABLE_TYPES: StoreItem['itemType'][] = ['title', 'unknown'];

export function StoreItemCard({ item, onBeforeNavigate }: StoreItemCardProps) {
  const theme = useTheme();
  const currencyIcon = getCurrencyIcon(item.price.currency);
  const rarityIcon = item.rarity ? getRarityIcon(item.rarity) : null;
  const isTappable = !NON_TAPPABLE_TYPES.includes(item.itemType) && !!item.itemAssetId;

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
    <ThemedView type="backgroundElement" style={styles.card}>
      {rarityIcon ? <Image source={rarityIcon} contentFit="contain" style={styles.rarityIcon} /> : null}
      {item.imageUrl ? (
        <Image source={item.imageUrl} contentFit="contain" style={styles.image} />
      ) : (
        <ThemedView type="backgroundSelected" style={styles.imageFallback}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {item.itemType.toUpperCase()}
          </ThemedText>
        </ThemedView>
      )}
      <View style={styles.textBlock}>
        <ThemedText numberOfLines={2} style={styles.title}>
          {item.title}
        </ThemedText>
        <View style={styles.priceRow}>
          {item.price.originalAmount ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.originalPrice}>
              {item.price.originalAmount.toLocaleString()}
            </ThemedText>
          ) : null}
          <ThemedText type="smallBold">{item.price.amount.toLocaleString()}</ThemedText>
          {currencyIcon ? <Image source={currencyIcon} contentFit="contain" style={styles.currencyIcon} /> : null}
        </View>
        {item.price.discountPercent ? (
          <ThemedText type="small" style={{ color: theme.primary }}>
            -{item.price.discountPercent}%
          </ThemedText>
        ) : null}
      </View>
    </ThemedView>
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

function getRarityIcon(rarity: NonNullable<StoreItem['rarity']>) {
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
    borderRadius: Spacing.four,
    padding: Spacing.two,
    gap: Spacing.two,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 96,
  },
  imageFallback: {
    width: '100%',
    height: 96,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    gap: Spacing.half,
    backgroundColor: 'transparent',
  },
  title: {
    minHeight: 48,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  currencyIcon: {
    width: 14,
    height: 14,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
  },
  rarityIcon: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    width: 18,
    height: 18,
    zIndex: 1,
  },
});
