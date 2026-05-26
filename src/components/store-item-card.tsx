import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { StoreItem } from '@/lib/account';

type StoreItemCardProps = {
  item: StoreItem;
};

export function StoreItemCard({ item }: StoreItemCardProps) {
  const theme = useTheme();
  const currencyIcon = getCurrencyIcon(item.price.currency);
  const rarityIcon = item.rarity ? getRarityIcon(item.rarity) : null;

  return (
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
