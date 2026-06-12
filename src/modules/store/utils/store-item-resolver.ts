import { CatalogService } from '@/modules/catalog/catalog-service';
import type { CosmeticCatalogItem } from '@/modules/catalog/catalog-type';
import {
  getFallbackFavoriteTarget,
  getRawFavoriteTargetId,
} from '@/modules/favorite/helpers/get-favorite-target-id';
import type {
  FavoriteOffer,
  FavoriteOfferMatch,
  FavoriteSnapshot,
  FavoriteTargetSource,
} from '@/modules/favorite/favorite-type';
import { buildStorePrice } from '@/modules/store/helpers/get-store-currency';
import { getStoreFallbackItemTitle } from '@/modules/store/helpers/get-store-fallback-item-title';
import { getStoreItemTypeFromReward } from '@/modules/store/helpers/get-store-item-type';
import type {
  StoreItem,
  StoreItemDetailModel,
  StoreItemDetailRequest,
  StoreReward,
} from '@/modules/store/store-type';

type ResolveStoreItemParams = {
  id: string;
  reward?: StoreReward;
  cost: Record<string, number>;
  originalAmount?: number;
  discountPercent?: number;
  itemType?: StoreItem['itemType'];
};

export const StoreItemResolver = {
  async resolveStoreItem(params: ResolveStoreItemParams): Promise<StoreItem> {
    const resolvedItemType = params.itemType ?? getStoreItemTypeFromReward(params.reward);
    const asset = params.reward
      ? await CatalogService.getStoreItemAsset(params.reward.ItemID, { refreshOnMiss: true })
      : undefined;
    const title = asset?.title ?? getStoreFallbackItemTitle(resolvedItemType);

    const favoriteTargetId = params.reward
      ? await StoreItemResolver.resolveFavoriteTargetId({
          itemAssetId: params.reward.ItemID,
          itemType: resolvedItemType,
          title,
          imageUrl: typeof asset?.imageUrl === 'string' ? asset.imageUrl : undefined,
          rarity: asset?.rarity,
        })
      : undefined;

    return {
      id: params.id,
      title,
      imageUrl: asset?.imageUrl,
      itemType: resolvedItemType,
      rarity: asset?.rarity,
      price: buildStorePrice(params.cost, params.originalAmount, params.discountPercent),
      itemAssetId: params.reward?.ItemID,
      favoriteTargetId,
    };
  },

  async resolveItemDetailIdentity(
    request: StoreItemDetailRequest,
  ): Promise<Omit<StoreItemDetailModel, 'price'>> {
    const [asset, favoriteTarget] = await Promise.all([
      CatalogService.getStoreItemAsset(request.itemAssetId),
      StoreItemResolver.resolveFavoriteTarget({
        itemAssetId: request.itemAssetId,
        itemType: request.itemType,
        title: request.title,
        rarity: request.rarity,
      }),
    ]);
    const heroSource = asset?.animationUrl ?? asset?.largeImageUrl ?? asset?.imageUrl;

    return {
      title: request.title,
      itemType: request.itemType,
      isCard: request.itemType === 'card',
      isSkin: request.itemType === 'skin',
      isTitle: request.itemType === 'title',
      imageUrl: asset?.imageUrl,
      largeImageUrl: asset?.largeImageUrl,
      wideImageUrl: asset?.wideImageUrl,
      animationUrl: asset?.animationUrl,
      heroSource,
      favoriteTarget: (favoriteTarget as CosmeticCatalogItem | null),
    };
  },

  async resolveFavoriteTarget(
    source: string | FavoriteTargetSource,
  ): Promise<CosmeticCatalogItem | null> {
    const rawId = typeof source === 'string' ? source : getRawFavoriteTargetId(source);
    const canonicalItem = await CatalogService.getCanonicalItem(rawId);
    if (canonicalItem) {
      return canonicalItem;
    }
    return typeof source === 'string' ? null : getFallbackFavoriteTarget(source);
  },

  async resolveFavoriteTargetId(source: string | FavoriteTargetSource): Promise<string> {
    const target = await StoreItemResolver.resolveFavoriteTarget(source);
    return target?.id ?? (typeof source === 'string' ? source : getRawFavoriteTargetId(source));
  },

  async resolveFavoriteOfferMatches(
    offers: FavoriteOffer[],
    favoritesById: Record<string, FavoriteSnapshot>,
  ): Promise<FavoriteOfferMatch[]> {
    const matches: FavoriteOfferMatch[] = [];
    const seen = new Set<string>();

    for (const offer of offers) {
      if (!offer.itemAssetId) continue;
      const favoriteTargetId = await StoreItemResolver.resolveFavoriteTargetId(offer.itemAssetId);
      const favorite = favoritesById[favoriteTargetId];
      if (!favorite || seen.has(favoriteTargetId)) continue;
      seen.add(favoriteTargetId);
      matches.push({ id: favoriteTargetId, title: favorite.title });
    }

    return matches;
  },
};
