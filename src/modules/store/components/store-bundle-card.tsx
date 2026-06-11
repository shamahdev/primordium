import { ThemedText } from '@/commons/components/themed-text';
import { Colors, Spacing } from '@/commons/constants/theme';
import { getCatalogStoreCurrencyIcon } from '@/modules/catalog/catalog-presentation';
import { type StoreCarouselCard } from '@/modules/store/store-type';
import { Image } from 'expo-image';
import { Pressable, View, StyleSheet } from 'react-native';

type StoreBundleCardProps = {
  card: StoreCarouselCard;
  onPress: (card: StoreCarouselCard) => void;
};

export function getStoreBundleCardWidth(windowWidth: number) {
  return Math.floor(windowWidth * 0.9);
}

export function StoreBundleCard({ card, onPress }: StoreBundleCardProps) {
  return (
    <Pressable
      onPress={() => onPress(card)}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <View style={styles.bundleCard}>
        {card.imageUrl ? (
          <Image source={card.imageUrl} contentFit="cover" style={styles.bundleImage} />
        ) : (
          <View style={styles.bundleImageFallback}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              BUNDLE
            </ThemedText>
          </View>
        )}
        <View style={styles.bundleTextOverlay}>
          <ThemedText type="smallBold" style={styles.bundleTitle} numberOfLines={2}>
            {card.title.toUpperCase()}
          </ThemedText>
          {card.price ? (
            <View style={styles.bundlePriceRow}>
              {card.price.discountPercent && card.price.discountPercent > 0 && card.price.originalAmount ? (
                <ThemedText type="xsmall" style={styles.bundleOriginalPrice}>
                  {card.price.originalAmount.toLocaleString()}
                </ThemedText>
              ) : null}
              <ThemedText type="smallBold" style={styles.bundlePrice}>
                {card.price.amount.toLocaleString()}
              </ThemedText>
              <Image
                source={getCatalogStoreCurrencyIcon(card.price.currency)}
                contentFit="contain"
                style={styles.bundleCurrencyIcon}
              />
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bundleCard: {
    height: 144,
    borderRadius: Spacing.one,
    overflow: 'hidden',
    backgroundColor: Colors.dark.backgroundElement,
  },
  bundleImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  bundleImageFallback: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bundleTextOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    gap: 2,
  },
  bundleTitle: {
    color: '#ffffff',
    fontWeight: '700',
  },
  bundlePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  bundlePrice: {
    color: '#ffffff',
    fontWeight: '700',
  },
  bundleOriginalPrice: {
    color: '#ffffff',
    opacity: 0.7,
    textDecorationLine: 'line-through',
  },
  bundleCurrencyIcon: {
    width: 16,
    height: 16,
  },
});
