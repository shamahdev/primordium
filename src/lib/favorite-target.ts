import {
  getCanonicalCosmeticCatalogItem,
  type CosmeticCatalogItem,
} from '@/lib/valorant-store-assets';

type FavoriteTargetSource = CosmeticCatalogItem | {
  itemAssetId: string;
  itemType: string;
  title: string;
  imageUrl?: string;
  rarity?: string;
};

type FavoriteOffer = {
  title: string;
  itemAssetId?: string;
};

type FavoriteSnapshot = {
  title: string;
};

export type FavoriteOfferMatch = {
  id: string;
  title: string;
};

export async function resolveFavoriteTarget(source: FavoriteTargetSource | string) {
  const rawId = typeof source === 'string' ? source : getRawFavoriteTargetId(source);
  const canonicalItem = await getCanonicalCosmeticCatalogItem(rawId);
  if (canonicalItem) {
    return canonicalItem;
  }

  return typeof source === 'string' ? null : getFallbackFavoriteTarget(source);
}

export async function getFavoriteTargetId(source: FavoriteTargetSource | string) {
  const rawId = typeof source === 'string' ? source : getRawFavoriteTargetId(source);
  const canonicalItem = await getCanonicalCosmeticCatalogItem(rawId);
  return canonicalItem?.id ?? rawId;
}

export async function getFavoriteOfferMatches(
  offers: FavoriteOffer[],
  favoritesById: Record<string, FavoriteSnapshot>,
) {
  const matches: FavoriteOfferMatch[] = [];
  const seen = new Set<string>();

  for (const offer of offers) {
    if (!offer.itemAssetId) continue;

    const favoriteTargetId = await getFavoriteTargetId(offer.itemAssetId);
    const favorite = favoritesById[favoriteTargetId];
    if (!favorite || seen.has(favoriteTargetId)) continue;

    seen.add(favoriteTargetId);
    matches.push({ id: favoriteTargetId, title: favorite.title });
  }

  return matches;
}

function getRawFavoriteTargetId(source: FavoriteTargetSource) {
  return 'itemAssetId' in source ? source.itemAssetId : source.id;
}

function getFallbackFavoriteTarget(source: FavoriteTargetSource) {
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

function isCosmeticCatalogItemType(value: string): value is CosmeticCatalogItem['itemType'] {
  return ['skin', 'buddy', 'spray', 'card', 'title', 'flex'].includes(value);
}
