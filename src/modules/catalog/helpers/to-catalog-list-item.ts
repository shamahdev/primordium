import { FILTER_LABELS } from "../catalog-constants";
import type { CatalogListItem, CosmeticCatalogItem } from "../catalog-type";

export function toCatalogListItem(item: CosmeticCatalogItem): CatalogListItem {
	return {
		...item,
		searchText:
			`${item.title} ${item.itemType} ${FILTER_LABELS[item.itemType]}`.toLowerCase(),
	};
}
