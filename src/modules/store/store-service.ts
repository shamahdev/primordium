import { buildRiotAuthorizedHeaders, riotFetch } from "@/commons/lib/http";
import { AccountService } from "@/modules/account/account-service";
import type { Account, AccountTokens } from "@/modules/account/account-type";
import { CatalogService } from "@/modules/catalog/catalog-service";
import {
	buildBundlePrice,
	getPrimaryStoreCostAmount,
} from "@/modules/store/helpers/get-store-currency";
import type {
	StoreAlertOfferSnapshot,
	StoreAPIResponse,
	StoreBundle,
	StoreCarouselCard,
	StoreItemDetailModel,
	StoreItemDetailPrice,
	StoreItemDetailRequest,
	StoreSnapshot,
} from "@/modules/store/store-type";
import { StoreItemResolver } from "@/modules/store/utils/store-item-resolver";

export const StoreService = {
	async buildStoreSnapshot(
		storefront: StoreAPIResponse,
	): Promise<StoreSnapshot> {
		const bundleCards = await Promise.all(
			storefront.FeaturedBundle.Bundles.map((bundle) =>
				buildFeaturedBundleCard(bundle),
			),
		);
		const nightMarketCard = storefront.BonusStore
			? await buildNightMarketCard(storefront.BonusStore)
			: null;
		const [dailyOffers, accessoryOffers] = await Promise.all([
			buildDailyOffers(storefront),
			buildAccessoryOffers(storefront),
		]);

		return {
			cards: [...bundleCards, nightMarketCard].filter(
				(card): card is StoreCarouselCard => card !== null,
			),
			dailyOffers,
			dailyResetAt: getExpiresAt(
				storefront.SkinsPanelLayout.SingleItemOffersRemainingDurationInSeconds,
			),
			accessoryOffers,
			accessoryResetAt: getExpiresAt(
				storefront.AccessoryStore.AccessoryStoreRemainingDurationInSeconds,
			),
			fetchedAt: new Date().toISOString(),
		};
	},

	async buildStoreAlertOffers(
		storefront: StoreAPIResponse,
	): Promise<StoreAlertOfferSnapshot> {
		const [dailyOffers, accessoryOffers] = await Promise.all([
			buildDailyOffers(storefront),
			buildAccessoryOffers(storefront),
		]);

		return {
			dailyOffers,
			dailyResetAt: getExpiresAt(
				storefront.SkinsPanelLayout.SingleItemOffersRemainingDurationInSeconds,
			),
			accessoryOffers,
			accessoryResetAt: getExpiresAt(
				storefront.AccessoryStore.AccessoryStoreRemainingDurationInSeconds,
			),
		};
	},

	async fetchStore(account: Account) {
		const storefront = await AccountService.request(account, (tokens) =>
			fetchStorefront(account, tokens),
		);
		return StoreService.buildStoreSnapshot(storefront);
	},

	async fetchStoreAlert(account: Account): Promise<StoreAlertOfferSnapshot> {
		const storefront = await AccountService.request(account, (tokens) =>
			fetchStorefront(account, tokens),
		);
		return StoreService.buildStoreAlertOffers(storefront);
	},

	async getItemDetail(
		request: StoreItemDetailRequest,
	): Promise<StoreItemDetailModel> {
		const identity = await StoreItemResolver.resolveItemDetailIdentity(request);
		return {
			...identity,
			price: getStoreItemDetailPrice(request),
		};
	},
};

async function fetchStorefront(account: Account, tokens: AccountTokens) {
	const headers = await buildRiotAuthorizedHeaders(tokens);
	return riotFetch<StoreAPIResponse>(
		`https://pd.${account.shard}.a.pvp.net/store/v3/storefront/${account.puuid}`,
		{
			method: "POST",
			headers,
			body: JSON.stringify({}),
		},
	);
}

function buildDailyOffers(storefront: StoreAPIResponse) {
	return Promise.all(
		storefront.SkinsPanelLayout.SingleItemStoreOffers.map((offer) =>
			StoreItemResolver.resolveStoreItem({
				id: offer.OfferID,
				reward: offer.Rewards[0],
				cost: offer.Cost,
				itemType: "skin",
			}),
		),
	);
}

function buildAccessoryOffers(storefront: StoreAPIResponse) {
	return Promise.all(
		storefront.AccessoryStore.AccessoryStoreOffers.map(({ Offer: offer }) =>
			StoreItemResolver.resolveStoreItem({
				id: offer.OfferID,
				reward: offer.Rewards[0],
				cost: offer.Cost,
			}),
		),
	);
}

async function buildFeaturedBundleCard(
	bundle: StoreBundle,
): Promise<StoreCarouselCard> {
	const [bundleAsset, items] = await Promise.all([
		CatalogService.getBundleAsset(bundle.DataAssetID || bundle.ID, {
			refreshOnMiss: true,
		}),
		Promise.all(
			bundle.Items.map((item, index) =>
				StoreItemResolver.resolveStoreItem({
					id: `${bundle.ID}.${index}`,
					reward: {
						ItemID: item.Item.ItemID,
						ItemTypeID: item.Item.ItemTypeID,
						Quantity: item.Item.Amount,
					},
					cost: { [item.CurrencyID]: item.BasePrice },
					originalAmount: item.BasePrice,
				}),
			),
		),
	]);

	const price = buildBundlePrice(bundle);
	return {
		id: bundle.ID,
		title: bundleAsset?.title
			? `${bundleAsset.title} Bundle`
			: "Featured Bundle",
		subtitle: price
			? ""
			: `${items.length} item${items.length === 1 ? "" : "s"}`,
		imageUrl: bundleAsset?.imageUrl ?? items[0]?.imageUrl,
		section: "featuredBundle",
		expiresAt: getExpiresAt(bundle.DurationRemainingInSeconds),
		items,
		price,
	};
}

async function buildNightMarketCard(
	bonusStore: NonNullable<StoreAPIResponse["BonusStore"]>,
) {
	const items = await Promise.all(
		bonusStore.BonusStoreOffers.map((offer) =>
			StoreItemResolver.resolveStoreItem({
				id: offer.BonusOfferID,
				reward: offer.Offer.Rewards[0],
				cost: offer.DiscountCosts,
				originalAmount: getPrimaryStoreCostAmount(offer.Offer.Cost),
				discountPercent: offer.DiscountPercent,
				itemType: "skin",
			}),
		),
	);

	return {
		id: "night-market",
		title: "Night Market",
		subtitle: `${items.length} offer${items.length === 1 ? "" : "s"}`,
		section: "nightMarket" as const,
		expiresAt: getExpiresAt(bonusStore.BonusStoreRemainingDurationInSeconds),
		items,
	};
}

function getExpiresAt(durationSeconds: number) {
	return new Date(Date.now() + durationSeconds * 1000).toISOString();
}

function getStoreItemDetailPrice(
	request: StoreItemDetailRequest,
): StoreItemDetailPrice | undefined {
	if (
		request.source === "catalog" ||
		!request.priceAmount ||
		!request.priceCurrency
	) {
		return undefined;
	}

	return {
		amount: request.priceAmount,
		currency: toStoreCurrency(request.priceCurrency),
		rarity: request.rarity as
			| import("@/modules/store/store-type").StoreItemRarity
			| undefined,
	};
}

function toStoreCurrency(
	currency: string,
): import("@/modules/store/store-type").StoreCurrency {
	if (currency === "vp" || currency === "kingdomCredits") {
		return currency;
	}

	return "unknown";
}
