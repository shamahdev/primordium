import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/commons/components/themed-text';
import { ThemedView } from '@/commons/components/themed-view';
import { OwnedAccent, Spacing } from '@/commons/constants/theme';
import { useTheme } from '@/commons/hooks/use-theme';
import { FavoriteStarColor } from '../catalog-constants';
import { getCatalogTypeLabel, getCatalogRarityLabel, getCatalogRarityIcon } from '../catalog-presentation';
import type { CatalogListItem } from '../catalog-type';

export const CatalogRow = React.memo(function CatalogRow({
  item,
  isFavorite,
  isOwned,
}: {
  item: CatalogListItem;
  isFavorite: boolean;
  isOwned: boolean;
}) {
  const theme = useTheme();
  const typeLabel = getCatalogTypeLabel(item.itemType);
  const rarityLabel = item.rarity ? getCatalogRarityLabel(item.rarity) : null;
  const rarityIcon = item.rarity ? getCatalogRarityIcon(item.rarity) : null;

  const openItem = React.useCallback(() => {
    router.push({
      pathname: '/store-item',
      params: {
        itemAssetId: item.id,
        itemType: item.itemType,
        title: item.title,
        source: 'catalog',
        ...(item.rarity ? { rarity: item.rarity } : {}),
      },
    });
  }, [item.id, item.itemType, item.rarity, item.title]);

  return (
    <Pressable onPress={openItem} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {isOwned ? <View style={styles.ownedStripe} /> : null}
      <ThemedView type="backgroundElement" style={styles.thumbnail}>
        {item.imageUrl ? (
          <Image source={item.imageUrl} contentFit="contain" style={styles.thumbnailImage} />
        ) : (
          <ThemedText type="xsmall" themeColor="textSecondary" style={styles.thumbnailFallback}>
            {item.itemType.toUpperCase()}
          </ThemedText>
        )}
      </ThemedView>
      <View style={styles.rowText}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {item.title}
        </ThemedText>
        <View style={styles.metadataRow}>
          <ThemedText type="small" themeColor="textSecondary">
            {typeLabel}
          </ThemedText>
          {rarityIcon ? (
            <Image
              source={rarityIcon}
              contentFit="contain"
              style={styles.rarityIcon}
              accessibilityLabel={rarityLabel ?? undefined}
            />
          ) : null}
        </View>
      </View>
      {isFavorite ? <Ionicons name="star" size={16} color={FavoriteStarColor} /> : null}
      <ThemedText style={{ color: theme.textSecondary }}>{'>'}</ThemedText>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.75,
  },
  ownedStripe: {
    position: 'absolute',
    left: 0,
    top: Spacing.one,
    bottom: Spacing.one,
    width: 3,
    borderRadius: 2,
    backgroundColor: OwnedAccent,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailFallback: {
    letterSpacing: 1,
  },
  rowText: {
    flex: 1,
    gap: Spacing.one,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rarityIcon: {
    width: 18,
    height: 18,
  },
});
