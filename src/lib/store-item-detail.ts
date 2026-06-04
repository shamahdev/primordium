import type { StoreCurrency, StoreItemRarity } from '@/lib/account';
import { resolveFavoriteTarget } from '@/lib/favorite-target';
import {
  getStoreItemAsset,
  type CosmeticCatalogItem,
} from '@/lib/valorant-store-assets';

export type StoreItemDetailRequest = {
  itemAssetId: string;
  itemType: string;
  title: string;
  priceAmount?: string;
  priceCurrency?: string;
  rarity?: string;
  source?: string;
};

export type StoreItemDetailPrice = {
  amount: string;
  currency: StoreCurrency;
  rarity?: StoreItemRarity;
};

export type StoreItemDetailModel = {
  title: string;
  itemType: string;
  isCard: boolean;
  isSkin: boolean;
  isTitle: boolean;
  imageUrl?: string;
  largeImageUrl?: string;
  wideImageUrl?: string;
  animationUrl?: string;
  heroSource?: string;
  price?: StoreItemDetailPrice;
  favoriteTarget: CosmeticCatalogItem | null;
};

export async function getStoreItemDetail(request: StoreItemDetailRequest): Promise<StoreItemDetailModel> {
  const [asset, favoriteTarget] = await Promise.all([
    getStoreItemAsset(request.itemAssetId),
    resolveFavoriteTarget({
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
    price: getStoreItemDetailPrice(request),
    favoriteTarget,
  };
}

function getStoreItemDetailPrice(request: StoreItemDetailRequest): StoreItemDetailPrice | undefined {
  if (request.source === 'catalog' || !request.priceAmount || !request.priceCurrency) {
    return undefined;
  }

  return {
    amount: request.priceAmount,
    currency: toStoreCurrency(request.priceCurrency),
    rarity: request.rarity as StoreItemRarity | undefined,
  };
}

function toStoreCurrency(currency: string): StoreCurrency {
  if (currency === 'vp' || currency === 'kingdomCredits') {
    return currency;
  }

  return 'unknown';
}
