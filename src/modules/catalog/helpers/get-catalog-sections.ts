import { CATALOG_TYPE_ORDER, FILTER_LABELS } from '../catalog-constants';
import type { CatalogFilter, CatalogMode, CatalogSection, CatalogListItem, CosmeticCatalogItem } from '../catalog-type';

export function getCatalogSections(
  items: CatalogListItem[],
  mode: CatalogMode,
  filter: CatalogFilter,
  search: string,
): CatalogSection[] {
  const normalizedSearch = search.trim().toLowerCase();
  const sectionsByType = new Map<CosmeticCatalogItem['itemType'], CatalogListItem[]>(
    CATALOG_TYPE_ORDER.map((type) => [type, []]),
  );
  const filteredItems: CatalogListItem[] = [];

  for (const item of items) {
    if (filter !== 'all' && item.itemType !== filter) continue;
    if (normalizedSearch && !item.searchText.includes(normalizedSearch)) continue;

    filteredItems.push(item);
    sectionsByType.get(item.itemType)?.push(item);
  }

  if (mode === 'favorites') {
    return filteredItems.length > 0 ? [{ key: filter, title: 'Favorites', data: filteredItems }] : [];
  }

  if (filter !== 'all') {
    const data = sectionsByType.get(filter) ?? [];
    return data.length > 0 ? [{ key: filter, title: FILTER_LABELS[filter], data }] : [];
  }

  return CATALOG_TYPE_ORDER.map((type) => ({
    key: type,
    title: FILTER_LABELS[type],
    data: sectionsByType.get(type) ?? [],
  })).filter((section) => section.data.length > 0);
}
