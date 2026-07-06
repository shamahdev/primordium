import { CATALOG_TYPE_ORDER, FILTER_LABELS } from '../catalog-constants';
import type { CatalogItemType, CatalogListItem, CatalogRarity, CatalogSection, CosmeticCatalogItem } from '../catalog-type';

export type CatalogSectionInput = {
  favoritesOnly: boolean;
  typeFilter: CatalogItemType[];
  rarityFilter: CatalogRarity[];
  ownedStatus: 'all' | 'owned' | 'notOwned';
  ownedItemIds: Set<string>;
  search: string;
};

export function getCatalogSections(
  items: CatalogListItem[],
  input: CatalogSectionInput,
): CatalogSection[] {
  const { favoritesOnly, typeFilter, rarityFilter, ownedStatus, ownedItemIds, search } = input;
  const normalizedSearch = search.trim().toLowerCase();
  const typeSet = new Set(typeFilter);
  const raritySet = new Set(rarityFilter);

  const sectionsByType = new Map<CosmeticCatalogItem['itemType'], CatalogListItem[]>(
    CATALOG_TYPE_ORDER.map((type) => [type, []]),
  );
  const filteredItems: CatalogListItem[] = [];

  for (const item of items) {
    if (typeSet.size > 0 && !typeSet.has(item.itemType)) continue;
    if (raritySet.size > 0) {
      const rarity = item.rarity;
      if (!rarity || !raritySet.has(rarity)) continue;
    }
    if (ownedStatus !== 'all') {
      const isOwned = ownedItemIds.has(item.id);
      if (ownedStatus === 'owned' && !isOwned) continue;
      if (ownedStatus === 'notOwned' && isOwned) continue;
    }
    if (normalizedSearch && !item.searchText.includes(normalizedSearch)) continue;

    filteredItems.push(item);
    sectionsByType.get(item.itemType)?.push(item);
  }

  if (favoritesOnly && typeSet.size === 0) {
    return filteredItems.length > 0
      ? [{ key: 'favorites', title: 'Favorites', data: filteredItems }]
      : [];
  }

  if (typeSet.size > 0) {
    return CATALOG_TYPE_ORDER
      .filter((type) => typeSet.has(type))
      .map((type) => ({ key: type, title: FILTER_LABELS[type], data: sectionsByType.get(type) ?? [] }))
      .filter((section) => section.data.length > 0);
  }

  return CATALOG_TYPE_ORDER
    .map((type) => ({ key: type, title: FILTER_LABELS[type], data: sectionsByType.get(type) ?? [] }))
    .filter((section) => section.data.length > 0);
}
