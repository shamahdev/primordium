import { buildRiotAuthorizedHeaders, riotFetch } from '@/commons/lib/http';
import { AccountService } from '@/modules/account/account-service';
import { type Account, type AccountTokens } from '@/modules/account/account-type';
import { CatalogService } from '@/modules/catalog/catalog-service';
import type { CosmeticCatalogItem } from '@/modules/catalog/catalog-type';
import { FavoriteService } from '@/modules/favorite/favorite-service';
import { buildBundlePrice, buildStorePrice, getPrimaryStoreCostAmount } from '@/modules/store/helpers/get-store-currency';
import { getStoreFallbackItemTitle } from '@/modules/store/helpers/get-store-fallback-item-title';
import { getStoreItemTypeFromReward } from '@/modules/store/helpers/get-store-item-type';
import type {
  StoreAPIResponse,
  StoreAlertOfferSnapshot,
  StoreBundle,
  StoreCarouselCard,
  StoreItem,
  StoreItemDetailModel,
  StoreItemDetailPrice,
  StoreItemDetailRequest,
  StoreReward,
  StoreSnapshot,
} from '@/modules/store/store-type';

export const StoreService = {
  async buildStoreSnapshot(storefront: StoreAPIResponse): Promise<StoreSnapshot> {
    const bundleCards = await Promise.all(
      storefront.FeaturedBundle.Bundles.map((bundle) => buildFeaturedBundleCard(bundle)),
    );
    const nightMarketCard = storefront.BonusStore
      ? await buildNightMarketCard(storefront.BonusStore)
      : null;
    const [dailyOffers, accessoryOffers] = await Promise.all([
      buildDailyOffers(storefront),
      buildAccessoryOffers(storefront),
    ]);

    return {
      cards: [...bundleCards, nightMarketCard].filter((card): card is StoreCarouselCard => card !== null),
      dailyOffers,
      dailyResetAt: getExpiresAt(storefront.SkinsPanelLayout.SingleItemOffersRemainingDurationInSeconds),
      accessoryOffers,
      accessoryResetAt: getExpiresAt(storefront.AccessoryStore.AccessoryStoreRemainingDurationInSeconds),
      fetchedAt: new Date().toISOString(),
    };
  },

  async buildStoreAlertOffers(storefront: StoreAPIResponse): Promise<StoreAlertOfferSnapshot> {
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
  },

  async fetchStore(account: Account) {
    const storefront = await AccountService.request(account, (tokens) => fetchStorefront(account, tokens));
    return StoreService.buildStoreSnapshot(storefront);
  },

  async fetchStoreAlert(account: Account): Promise<StoreAlertOfferSnapshot> {
    const storefront = await AccountService.request(account, (tokens) => fetchStorefront(account, tokens));
    return StoreService.buildStoreAlertOffers(storefront);
  },

  async getItemDetail(request: StoreItemDetailRequest): Promise<StoreItemDetailModel> {
    const [asset, favoriteTarget] = await Promise.all([
      CatalogService.getStoreItemAsset(request.itemAssetId),
      FavoriteService.resolveFavoriteTarget({
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
      favoriteTarget: (favoriteTarget as CosmeticCatalogItem | null),
    };
  },
};

async function fetchStorefront(account: Account, tokens: AccountTokens) {
  const headers = await buildRiotAuthorizedHeaders(tokens);
  return riotFetch<StoreAPIResponse>(`https://pd.${account.shard}.a.pvp.net/store/v3/storefront/${account.puuid}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  });
}

// --------------------------------------------------

function buildDailyOffers(storefront: StoreAPIResponse) {
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

function buildAccessoryOffers(storefront: StoreAPIResponse) {
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

async function buildFeaturedBundleCard(bundle: StoreBundle): Promise<StoreCarouselCard> {
  const [bundleAsset, items] = await Promise.all([
    CatalogService.getBundleAsset(bundle.DataAssetID || bundle.ID, { refreshOnMiss: true }),
    Promise.all(
      bundle.Items.map((item, index) =>
        buildStoreItem({
          id: `${bundle.ID}.${index}`,
          reward: { ItemID: item.Item.ItemID, ItemTypeID: item.Item.ItemTypeID, Quantity: item.Item.Amount },
          cost: { [item.CurrencyID]: item.BasePrice },
          originalAmount: item.BasePrice,
        }),
      ),
    ),
  ]);

  const price = buildBundlePrice(bundle);
  return {
    id: bundle.ID,
    title: bundleAsset?.title ? `${bundleAsset.title} Bundle` : 'Featured Bundle',
    subtitle: price ? '' : `${items.length} item${items.length === 1 ? '' : 's'}`,
    imageUrl: bundleAsset?.imageUrl ?? items[0]?.imageUrl,
    section: 'featuredBundle',
    expiresAt: getExpiresAt(bundle.DurationRemainingInSeconds),
    items,
    price,
  };
}

async function buildNightMarketCard(bonusStore: NonNullable<StoreAPIResponse['BonusStore']>) {
  const items = await Promise.all(
    bonusStore.BonusStoreOffers.map((offer) =>
      buildStoreItem({
        id: offer.BonusOfferID,
        reward: offer.Offer.Rewards[0],
        cost: offer.DiscountCosts,
        originalAmount: getPrimaryStoreCostAmount(offer.Offer.Cost),
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
  const resolvedItemType = params.itemType ?? getStoreItemTypeFromReward(params.reward);
  const asset = params.reward ? await CatalogService.getStoreItemAsset(params.reward.ItemID, { refreshOnMiss: true }) : undefined;
  const title = asset?.title ?? getStoreFallbackItemTitle(resolvedItemType);
  const favoriteTargetId = params.reward
    ? await FavoriteService.getFavoriteTargetId({
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


function getExpiresAt(durationSeconds: number) {
  return new Date(Date.now() + durationSeconds * 1000).toISOString();
}

function getStoreItemDetailPrice(request: StoreItemDetailRequest): StoreItemDetailPrice | undefined {
  if (request.source === 'catalog' || !request.priceAmount || !request.priceCurrency) {
    return undefined;
  }

  return {
    amount: request.priceAmount,
    currency: toStoreCurrency(request.priceCurrency),
    rarity: request.rarity as import('@/modules/store/store-type').StoreItemRarity | undefined,
  };
}

function toStoreCurrency(currency: string): import('@/modules/store/store-type').StoreCurrency {
  if (currency === 'vp' || currency === 'kingdomCredits') {
    return currency;
  }

  return 'unknown';
}
