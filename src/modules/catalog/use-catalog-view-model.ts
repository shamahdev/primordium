import React from 'react';

import { useAccountStore } from '@/modules/account/account-store';
import { useFavoriteStore } from '@/modules/favorite/favorite-store';
import { CatalogService } from './catalog-service';
import type { CatalogFilter, CatalogListItem, CatalogMode } from './catalog-type';
import { getCatalogSections } from './helpers/get-catalog-sections';
import { sortCatalogItems, sortFavoriteItems } from './helpers/sort-catalog-items';
import { toCatalogListItem } from './helpers/to-catalog-list-item';

let catalogMemoryMode: CatalogMode = 'all';
let catalogMemoryFilter: CatalogFilter = 'all';
let catalogMemorySearch = '';

export function useCatalogViewModel() {
  const account = useAccountStore((state) =>
    state.accounts.find((item) => item.id === state.activeAccountId),
  );
  const [items, setItems] = React.useState<CatalogListItem[]>([]);
  const [mode, setMode] = React.useState<CatalogMode>(catalogMemoryMode);
  const [filter, setFilter] = React.useState<CatalogFilter>(catalogMemoryFilter);
  const [search, setSearch] = React.useState(catalogMemorySearch);
  const deferredMode = React.useDeferredValue(mode);
  const deferredFilter = React.useDeferredValue(filter);
  const deferredSearch = React.useDeferredValue(search);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const favoritesById = useFavoriteStore((state) => state.favoritesById);

  const loadCatalog = React.useCallback(async (refresh = false, showLoading = true) => {
    if (showLoading) {
      setLoading(true);
      setError(null);
    }

    let nextError: string | null = null;
    let nextItems: CatalogListItem[] | null = null;

    try {
      const catalogItems = await CatalogService.getCatalogItems({ refresh });
      nextItems = sortCatalogItems(catalogItems.map(toCatalogListItem));
    } catch (loadError) {
      nextError = loadError instanceof Error ? loadError.message : 'Could not load cosmetic catalog.';
    }

    if (nextItems) {
      setItems(nextItems);
    }
    setError(nextError);
    setLoading(false);
  }, []);

  const retryCatalog = React.useCallback(() => {
    void loadCatalog(true);
  }, [loadCatalog]);

  React.useEffect(() => {
    let cancelled = false;

    void (async () => {
      let nextError: string | null = null;
      let nextItems: CatalogListItem[] | null = null;

      try {
        const catalogItems = await CatalogService.getCatalogItems({ refresh: false });
        nextItems = sortCatalogItems(catalogItems.map(toCatalogListItem));
      } catch (loadError) {
        nextError = loadError instanceof Error ? loadError.message : 'Could not load cosmetic catalog.';
      }

      if (cancelled) return;
      if (nextItems) {
        setItems(nextItems);
      }
      setError(nextError);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const itemsById = React.useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const favoriteItems = React.useMemo(
    () => sortFavoriteItems(Object.values(favoritesById).map((favorite) => ({
      ...(itemsById.get(favorite.id) ?? toCatalogListItem(favorite)),
      favoritedAt: favorite.favoritedAt,
    }))),
    [favoritesById, itemsById],
  );
  const visibleItems = deferredMode === 'favorites' ? favoriteItems : items;

  const sections = React.useMemo(
    () => getCatalogSections(visibleItems, deferredMode, deferredFilter, deferredSearch),
    [deferredFilter, deferredMode, deferredSearch, visibleItems],
  );
  const resultCount = React.useMemo(
    () => sections.reduce((total, section) => total + section.data.length, 0),
    [sections],
  );

  const handleSearchChange = React.useCallback((text: string) => {
    catalogMemorySearch = text;
    setSearch(text);
  }, []);
  const handleFilterChange = React.useCallback((type: CatalogFilter) => {
    catalogMemoryFilter = type;
    setFilter(type);
  }, []);
  const handleModeChange = React.useCallback((nextMode: CatalogMode) => {
    catalogMemoryMode = nextMode;
    setMode(nextMode);
  }, []);

  return {
    account,
    loading,
    error,
    retryCatalog,
    mode,
    filter,
    search,
    sections,
    resultCount,
    visibleItems,
    favoriteItems,
    favoritesById,
    handleSearchChange,
    handleFilterChange,
    handleModeChange,
  };
}
