import type { CosmeticCatalogItem } from "@/modules/catalog/catalog-type";
import type { StoreAlertOfferSnapshot } from "@/modules/store/store-type";

export type FavoriteItem = Pick<
	CosmeticCatalogItem,
	"id" | "itemType" | "title" | "imageUrl" | "rarity"
> & {
	favoritedAt: string;
};

export type FavoriteTargetSource =
	| CosmeticCatalogItem
	| {
			itemAssetId: string;
			itemType: string;
			title: string;
			imageUrl?: string;
			rarity?: string;
	  };

export type FavoriteOffer = {
	title: string;
	itemAssetId?: string;
};

export type FavoriteSnapshot = {
	title: string;
};

export type FavoriteOfferMatch = {
	id: string;
	title: string;
};

export type FavoriteAlertStore = {
	enabled: boolean;
	lastNotifiedByAccountId: Record<string, string>;
	setEnabled: (enabled: boolean) => void;
	setLastNotified: (accountId: string, resetKey: string) => void;
};

export type FavoriteAlertDecisionInput = {
	offers: StoreAlertOfferSnapshot;
	favoritesById: Record<string, FavoriteSnapshot>;
	lastNotifiedResetKey?: string;
};

export type FavoriteAlertDecision = {
	resetKey: string;
	title: string;
	body: string;
};
