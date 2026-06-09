import type { StoreCarouselCard, StoreItem, StorePrice, StoreSnapshot } from '@/lib/account';
import { getFavoriteTargetId } from '@/lib/favorite-target';
import { getBundleAsset, getStoreItemAsset } from '@/lib/valorant-store-assets';

const STORE_CURRENCY_IDS = {
  vp: '85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741',
  kingdomCredits: '85ca954a-41f2-ce94-9b45-8ca3dd39a00d',
} as const;

const ITEM_TYPE_IDS = {
  skinLevel: 'e7c63390-eda7-46e0-bb7a-a6abdacd2433',
  skinChroma: '3ad1b2b2-acdb-4524-852f-954a76ddae0a',
  buddy: 'dd3bf334-87f3-40bd-b043-682a57a8dc3a',
  spray: 'd5f120f8-ff8c-4aac-92ea-f2b5acbe9475',
  playerCard: '3f296c07-64c3-494c-923b-fe692a4fa1bd',
  playerTitle: 'de7caa6b-adf7-4588-bbd1-143831e786c6',
  flex: '03a572de-4234-31ed-d344-ababa488f981',
} as const;

type StoreReward = {
  ItemTypeID: string;
  ItemID: string;
  Quantity: number;
};

type StoreOffer = {
  OfferID: string;
  Cost: Record<string, number>;
  Rewards: StoreReward[];
};

export type RiotStorefrontResponse = {
  FeaturedBundle: {
    Bundle: {
      ID: string;
      DataAssetID: string;
      CurrencyID: string;
      Items: {
        Item: {
          ItemTypeID: string;
          ItemID: string;
          Amount: number;
        };
        BasePrice: number;
        CurrencyID: string;
        DiscountPercent: number;
        DiscountedPrice: number;
        IsPromoItem: boolean;
      }[];
      TotalBaseCost: Record<string, number> | null;
      TotalDiscountedCost: Record<string, number> | null;
      TotalDiscountPercent: number;
      WholesaleOnly: boolean;
    };
    BundleRemainingDurationInSeconds: number;
  };
  SkinsPanelLayout: {
    SingleItemStoreOffers: StoreOffer[];
    SingleItemOffersRemainingDurationInSeconds: number;
  };
  AccessoryStore: {
    AccessoryStoreOffers: {
      Offer: StoreOffer;
    }[];
    AccessoryStoreRemainingDurationInSeconds: number;
  };
  BonusStore?: {
    BonusStoreOffers: {
      BonusOfferID: string;
      Offer: StoreOffer;
      DiscountPercent: number;
      DiscountCosts: Record<string, number>;
    }[];
    BonusStoreRemainingDurationInSeconds: number;
  };
};

export type StoreAlertOfferSnapshot = Pick<StoreSnapshot, 'dailyOffers' | 'dailyResetAt' | 'accessoryOffers' | 'accessoryResetAt'>;

export async function buildRiotStoreSnapshot(storefront: RiotStorefrontResponse): Promise<StoreSnapshot> {
  const [featuredBundleCard, nightMarketCard, dailyOffers, accessoryOffers] = await Promise.all([
    buildFeaturedBundleCard(storefront.FeaturedBundle),
    storefront.BonusStore ? buildNightMarketCard(storefront.BonusStore) : Promise.resolve<StoreCarouselCard | null>(null),
    buildDailyOffers(storefront),
    buildAccessoryOffers(storefront),
  ]);

  return {
    cards: [featuredBundleCard, nightMarketCard].filter((card): card is StoreCarouselCard => card !== null),
    dailyOffers,
    dailyResetAt: getExpiresAt(storefront.SkinsPanelLayout.SingleItemOffersRemainingDurationInSeconds),
    accessoryOffers,
    accessoryResetAt: getExpiresAt(storefront.AccessoryStore.AccessoryStoreRemainingDurationInSeconds),
    fetchedAt: new Date().toISOString(),
  };
}

export async function buildRiotStoreAlertOffers(storefront: RiotStorefrontResponse): Promise<StoreAlertOfferSnapshot> {
  const [dailyOffers, accessoryOffers] = await Promise.all([
    buildDailyOffers(storefront),
    buildAccessoryOffers(storefront),
  ]);

  return {
    dailyOffers,
    dailyResetAt: getExpiresAt(storefront.SkinsPanelLayout.SingleItemOffersRemainingDurationInSeconds),
    accessoryOffers,
    accessoryResetAt: getExpiresAt(storefront.AccessoryStore.AccessoryStoreRemainingDurationInSeconds),
  };
}

function buildDailyOffers(storefront: RiotStorefrontResponse) {
  return Promise.all(
    storefront.SkinsPanelLayout.SingleItemStoreOffers.map((offer) =>
      buildStoreItem({
        id: offer.OfferID,
        reward: offer.Rewards[0],
        cost: offer.Cost,
        itemType: 'skin',
      }),
    ),
  );
}

function buildAccessoryOffers(storefront: RiotStorefrontResponse) {
  return Promise.all(
    storefront.AccessoryStore.AccessoryStoreOffers.map(({ Offer: offer }) =>
      buildStoreItem({
        id: offer.OfferID,
        reward: offer.Rewards[0],
        cost: offer.Cost,
      }),
    ),
  );
}

async function buildFeaturedBundleCard(featuredBundle: RiotStorefrontResponse['FeaturedBundle']): Promise<StoreCarouselCard> {
  const [bundleAsset, items] = await Promise.all([
    getBundleAsset(featuredBundle.Bundle.DataAssetID || featuredBundle.Bundle.ID),
    Promise.all(
      featuredBundle.Bundle.Items.map((item, index) =>
        buildStoreItem({
          id: `${featuredBundle.Bundle.ID}.${index}`,
          reward: { ItemID: item.Item.ItemID, ItemTypeID: item.Item.ItemTypeID, Quantity: item.Item.Amount },
          cost: { [item.CurrencyID]: item.BasePrice },
          originalAmount: item.BasePrice,
        }),
      ),
    ),
  ]);

  const price = buildBundlePrice(featuredBundle.Bundle);

  return {
    id: featuredBundle.Bundle.ID,
    title: bundleAsset?.title ? `${bundleAsset.title} Bundle` : 'Featured Bundle',
    subtitle: price ? '' : `${items.length} item${items.length === 1 ? '' : 's'}`,
    imageUrl: bundleAsset?.imageUrl ?? items[0]?.imageUrl,
    section: 'featuredBundle',
    expiresAt: getExpiresAt(featuredBundle.BundleRemainingDurationInSeconds),
    items,
    price,
  };
}

async function buildNightMarketCard(bonusStore: NonNullable<RiotStorefrontResponse['BonusStore']>) {
  const items = await Promise.all(
    bonusStore.BonusStoreOffers.map((offer) =>
      buildStoreItem({
        id: offer.BonusOfferID,
        reward: offer.Offer.Rewards[0],
        cost: offer.DiscountCosts,
        originalAmount: getPrimaryCostAmount(offer.Offer.Cost),
        discountPercent: offer.DiscountPercent,
        itemType: 'skin',
      }),
    ),
  );

  return {
    id: 'night-market',
    title: 'Night Market',
    subtitle: `${items.length} offer${items.length === 1 ? '' : 's'}`,
    section: 'nightMarket' as const,
    expiresAt: getExpiresAt(bonusStore.BonusStoreRemainingDurationInSeconds),
    items,
  };
}

async function buildStoreItem(params: {
  id: string;
  reward?: StoreReward;
  cost: Record<string, number>;
  originalAmount?: number;
  discountPercent?: number;
  itemType?: StoreItem['itemType'];
}): Promise<StoreItem> {
  const resolvedItemType = params.itemType ?? getItemTypeFromReward(params.reward);
  const asset = params.reward ? await getStoreItemAsset(params.reward.ItemID) : undefined;
  const title = asset?.title ?? getFallbackItemTitle(resolvedItemType);
  const favoriteTargetId = params.reward
    ? await getFavoriteTargetId({
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
}

function getItemTypeFromReward(reward?: StoreReward): StoreItem['itemType'] {
  if (!reward) {
    return 'unknown';
  }

  if (reward.ItemTypeID === ITEM_TYPE_IDS.skinLevel || reward.ItemTypeID === ITEM_TYPE_IDS.skinChroma) {
    return 'skin';
  }
  if (reward.ItemTypeID === ITEM_TYPE_IDS.buddy) {
    return 'buddy';
  }
  if (reward.ItemTypeID === ITEM_TYPE_IDS.spray) {
    return 'spray';
  }
  if (reward.ItemTypeID === ITEM_TYPE_IDS.playerCard) {
    return 'card';
  }
  if (reward.ItemTypeID === ITEM_TYPE_IDS.playerTitle) {
    return 'title';
  }
  if (reward.ItemTypeID === ITEM_TYPE_IDS.flex) {
    return 'flex';
  }

  return 'unknown';
}

function getFallbackItemTitle(itemType: StoreItem['itemType']) {
  const labels: Record<StoreItem['itemType'], string> = {
    skin: 'Unknown skin',
    buddy: 'Unknown buddy',
    spray: 'Unknown spray',
    card: 'Unknown card',
    title: 'Unknown title',
    flex: 'Unknown flex',
    unknown: 'Unknown item',
  };

  return labels[itemType];
}

function buildStorePrice(
  cost: Record<string, number>,
  originalAmount?: number,
  discountPercent?: number,
): StorePrice {
  const [currencyId, amount] = Object.entries(cost)[0] ?? [undefined, 0];

  return {
    currency: getStoreCurrency(currencyId),
    amount,
    originalAmount: originalAmount && originalAmount > amount ? originalAmount : undefined,
    discountPercent: discountPercent && discountPercent > 0 ? discountPercent : undefined,
  };
}

function getPrimaryCostAmount(cost: Record<string, number>) {
  return Object.values(cost)[0];
}

function getStoreCurrency(currencyId?: string): StorePrice['currency'] {
  if (currencyId === STORE_CURRENCY_IDS.vp) {
    return 'vp';
  }

  if (currencyId === STORE_CURRENCY_IDS.kingdomCredits) {
    return 'kingdomCredits';
  }

  return 'unknown';
}

function buildBundlePrice(
  bundle: RiotStorefrontResponse['FeaturedBundle']['Bundle'],
): StorePrice | undefined {
  if (!bundle.TotalDiscountedCost || !bundle.TotalBaseCost) {
    return undefined;
  }

  const [currencyId, amount] = Object.entries(bundle.TotalDiscountedCost)[0] ?? [undefined, 0];
  const [, originalAmount] = Object.entries(bundle.TotalBaseCost)[0] ?? [undefined, 0];

  return {
    currency: getStoreCurrency(currencyId),
    amount,
    originalAmount: originalAmount > amount ? originalAmount : undefined,
    discountPercent: bundle.TotalDiscountPercent > 0 ? bundle.TotalDiscountPercent : undefined,
  };
}

function getExpiresAt(durationSeconds: number) {
  return new Date(Date.now() + durationSeconds * 1000).toISOString();
}
