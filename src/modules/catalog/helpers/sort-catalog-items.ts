import { CATALOG_TYPE_ORDER } from '../catalog-constants';
import type { CatalogListItem } from '../catalog-type';

export function sortCatalogItems(items: CatalogListItem[]) {
  return [...items].sort((left, right) => {
    const typeDelta = CATALOG_TYPE_ORDER.indexOf(left.itemType) - CATALOG_TYPE_ORDER.indexOf(right.itemType);
    if (typeDelta !== 0) return typeDelta;
    return left.title.localeCompare(right.title);
  });
}

export function sortFavoriteItems(items: CatalogListItem[]) {
  return [...items].sort((left, right) => {
    const leftDate = left.favoritedAt ? Date.parse(left.favoritedAt) : 0;
    const rightDate = right.favoritedAt ? Date.parse(right.favoritedAt) : 0;
    return rightDate - leftDate;
  });
}
