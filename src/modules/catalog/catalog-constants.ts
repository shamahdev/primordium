import {
	getCatalogRarityLabel,
	getCatalogTypePluralLabel,
} from "./catalog-presentation";
import type { CatalogRarity } from "./catalog-type";

export const CATALOG_TYPE_ORDER = [
	"skin",
	"buddy",
	"spray",
	"card",
	"title",
	"flex",
] as const;

export const FILTER_LABELS: Record<string, string> = {
	all: "All",
	skin: getCatalogTypePluralLabel("skin"),
	buddy: getCatalogTypePluralLabel("buddy"),
	spray: getCatalogTypePluralLabel("spray"),
	card: getCatalogTypePluralLabel("card"),
	title: getCatalogTypePluralLabel("title"),
	flex: getCatalogTypePluralLabel("flex"),
};

export const RARITY_ORDER: CatalogRarity[] = [
	"select",
	"deluxe",
	"premium",
	"exclusive",
	"ultra",
];

export const RARITY_LABELS: Record<CatalogRarity, string> = {
	select: getCatalogRarityLabel("select"),
	deluxe: getCatalogRarityLabel("deluxe"),
	premium: getCatalogRarityLabel("premium"),
	exclusive: getCatalogRarityLabel("exclusive"),
	ultra: getCatalogRarityLabel("ultra"),
};

export const ALL_RARITIES_LABEL = "All rarities";

export const FavoriteStarColor = "#FAD663";
