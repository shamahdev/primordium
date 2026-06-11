import type { CosmeticCatalogItem } from '@/modules/catalog/catalog-type';
import type { FavoriteTargetSource } from '@/modules/favorite/favorite-type';

export function getRawFavoriteTargetId(source: FavoriteTargetSource) {
  return 'itemAssetId' in source ? source.itemAssetId : source.id;
}

export function getFallbackFavoriteTarget(source: FavoriteTargetSource) {
  if (!('itemAssetId' in source) || !isCosmeticCatalogItemType(source.itemType)) {
    return null;
  }

  return {
    id: source.itemAssetId,
    itemType: source.itemType,
    title: source.title,
    imageUrl: source.imageUrl,
    rarity: source.rarity as CosmeticCatalogItem['rarity'],
  } satisfies CosmeticCatalogItem;
}

export function isCosmeticCatalogItemType(value: string): value is CosmeticCatalogItem['itemType'] {
  return ['skin', 'buddy', 'spray', 'card', 'title', 'flex'].includes(value);
}
