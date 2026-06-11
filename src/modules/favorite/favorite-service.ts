import { CatalogService } from '@/modules/catalog/catalog-service';
import type {
  FavoriteOffer,
  FavoriteOfferMatch,
  FavoriteSnapshot,
  FavoriteTargetSource,
} from '@/modules/favorite/favorite-type';
import {
  getFallbackFavoriteTarget,
  getRawFavoriteTargetId,
} from '@/modules/favorite/helpers/get-favorite-target-id';

export async function resolveFavoriteTarget(source: FavoriteTargetSource | string) {
  const rawId = typeof source === 'string' ? source : getRawFavoriteTargetId(source);
  const canonicalItem = await CatalogService.getCanonicalItem(rawId);
  if (canonicalItem) {
    return canonicalItem;
  }

  return typeof source === 'string' ? null : getFallbackFavoriteTarget(source);
}

export async function getFavoriteTargetId(source: FavoriteTargetSource | string) {
  const rawId = typeof source === 'string' ? source : getRawFavoriteTargetId(source);
  const canonicalItem = await CatalogService.getCanonicalItem(rawId);
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

export const FavoriteService = {
  resolveFavoriteTarget,
  getFavoriteTargetId,
  getFavoriteOfferMatches,
};
