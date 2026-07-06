export type StoreCurrency = "vp" | "kingdomCredits" | "unknown";

export type StoreItemRarity =
	| "select"
	| "deluxe"
	| "premium"
	| "exclusive"
	| "ultra";

export type StorePrice = {
	currency: StoreCurrency;
	amount: number;
	originalAmount?: number;
	discountPercent?: number;
};

export type StoreItem = {
	id: string;
	title: string;
	imageUrl?: string | number;
	itemType: "skin" | "buddy" | "spray" | "card" | "title" | "flex" | "unknown";
	rarity?: StoreItemRarity;
	price: StorePrice;
	itemAssetId?: string;
	favoriteTargetId?: string;
};

export type StoreCarouselCard = {
	id: string;
	title: string;
	subtitle: string;
	imageUrl?: string | number;
	section: "featuredBundle" | "nightMarket";
	expiresAt: string;
	items: StoreItem[];
	price?: StorePrice;
};

export type StoreSnapshot = {
	cards: StoreCarouselCard[];
	dailyOffers: StoreItem[];
	dailyResetAt: string;
	accessoryOffers: StoreItem[];
	accessoryResetAt: string;
	fetchedAt: string;
};

export type StoreReward = {
	ItemTypeID: string;
	ItemID: string;
	Quantity: number;
};

export type StoreOffer = {
	OfferID: string;
	Cost: Record<string, number>;
	Rewards: StoreReward[];
};

export type StoreAPIResponse = {
	FeaturedBundle: {
		Bundle: StoreBundle;
		Bundles: StoreBundle[];
		BundleRemainingDurationInSeconds: number;
	};
	SkinsPanelLayout: {
		SingleItemOffers: string[];
		SingleItemStoreOffers: StoreOffer[];
		SingleItemOffersRemainingDurationInSeconds: number;
	};
	UpgradeCurrencyStore: {
		UpgradeCurrencyOffers: {
			OfferID: string;
			StorefrontItemID: string;
			Offer: StoreOffer;
			DiscountedPercent: number;
		}[];
	};
	AccessoryStore: {
		AccessoryStoreOffers: {
			Offer: StoreOffer;
			ContractID: string;
		}[];
		AccessoryStoreRemainingDurationInSeconds: number;
		StorefrontID: string;
	};
	BonusStore?: {
		BonusStoreOffers: {
			BonusOfferID: string;
			Offer: StoreOffer;
			DiscountPercent: number;
			DiscountCosts: Record<string, number>;
			IsSeen: boolean;
		}[];
		BonusStoreRemainingDurationInSeconds: number;
	};
};

export type StoreBundle = {
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
	ItemOffers:
		| {
				BundleItemOfferID: string;
				Offer: StoreOffer;
				DiscountPercent: number;
				DiscountedCost: Record<string, number>;
		  }[]
		| null;
	TotalBaseCost: Record<string, number> | null;
	TotalDiscountedCost: Record<string, number> | null;
	TotalDiscountPercent: number;
	DurationRemainingInSeconds: number;
	WholesaleOnly: boolean;
};

export type StoreAlertOfferSnapshot = Pick<
	StoreSnapshot,
	"dailyOffers" | "dailyResetAt" | "accessoryOffers" | "accessoryResetAt"
>;

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
	favoriteTarget:
		| import("@/modules/catalog/catalog-type").CosmeticCatalogItem
		| null;
};
