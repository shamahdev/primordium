import React from 'react';

import { useAccountStore } from '@/modules/account/account-store';
import { useFavoriteStore } from '@/modules/favorite/favorite-store';
import { CatalogService } from './catalog-service';
import type { CatalogItemType, CatalogListItem, CatalogRarity } from './catalog-type';
import { getCatalogSections } from './helpers/get-catalog-sections';
import { sortFavoriteItems } from './helpers/sort-catalog-items';
import { toCatalogListItem } from './helpers/to-catalog-list-item';
import { OwnedItemsService } from './owned-items-service';

let catalogMemoryFavoritesOnly = false;
let catalogMemoryTypeFilter: CatalogItemType[] = [];
let catalogMemoryRarityFilter: CatalogRarity[] = [];
let catalogMemoryOwnedStatus: OwnedStatus = 'all';
let catalogMemorySearch = '';

export type OwnedStatus = 'all' | 'owned' | 'notOwned';

export function useCatalogViewModel() {
  const account = useAccountStore((state) =>
    state.accounts.find((item) => item.id === state.activeAccountId),
  );
  const [items, setItems] = React.useState<CatalogListItem[]>([]);
  const [favoritesOnly, setFavoritesOnly] = React.useState(catalogMemoryFavoritesOnly);
  const [typeFilter, setTypeFilter] = React.useState<CatalogItemType[]>(catalogMemoryTypeFilter);
  const [rarityFilter, setRarityFilter] = React.useState<CatalogRarity[]>(catalogMemoryRarityFilter);
  const [ownedStatus, setOwnedStatus] = React.useState<OwnedStatus>(catalogMemoryOwnedStatus);
  const [ownedItemIds, setOwnedItemIds] = React.useState<Set<string>>(new Set());
  const [search, setSearch] = React.useState(catalogMemorySearch);
  const deferredFavoritesOnly = React.useDeferredValue(favoritesOnly);
  const deferredTypeFilter = React.useDeferredValue(typeFilter);
  const deferredRarityFilter = React.useDeferredValue(rarityFilter);
  const deferredOwnedStatus = React.useDeferredValue(ownedStatus);
  const deferredSearch = React.useDeferredValue(search);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const favoritesById = useFavoriteStore((state) => state.favoritesById);

  React.useEffect(() => {
    const currentAccount = useAccountStore.getState().accounts.find((item) => item.id === account?.id);
    if (!currentAccount || currentAccount.status === 'needsReauth') {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const owned = await OwnedItemsService.fetchOwnedItemIds(currentAccount);
        if (!cancelled) {
          setOwnedItemIds(owned);
        }
      } catch {
        // Owned set unavailable; badges silently absent.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [account?.id, account?.status]);

  const loadCatalog = React.useCallback(async (refresh = false, showLoading = true) => {
    if (showLoading) {
      setLoading(true);
      setError(null);
    }

    let nextError: string | null = null;
    let nextItems: CatalogListItem[] | null = null;

    try {
      nextItems = await CatalogService.getPreparedCatalogItems({ refresh });
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
        nextItems = await CatalogService.getPreparedCatalogItems({ refresh: false });
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
  const visibleItems = deferredFavoritesOnly ? favoriteItems : items;

  const sections = React.useMemo(
    () => getCatalogSections(visibleItems, {
      favoritesOnly: deferredFavoritesOnly,
      typeFilter: deferredTypeFilter,
      rarityFilter: deferredRarityFilter,
      ownedStatus: deferredOwnedStatus,
      ownedItemIds,
      search: deferredSearch,
    }),
    [deferredFavoritesOnly, deferredTypeFilter, deferredRarityFilter, deferredOwnedStatus, ownedItemIds, deferredSearch, visibleItems],
  );
  const resultCount = React.useMemo(
    () => sections.reduce((total, section) => total + section.data.length, 0),
    [sections],
  );

  const handleSearchChange = React.useCallback((text: string) => {
    catalogMemorySearch = text;
    setSearch(text);
  }, []);
  const handleToggleType = React.useCallback((type: CatalogItemType) => {
    setTypeFilter((prev) => {
      const next = prev.includes(type) ? prev.filter((value) => value !== type) : [...prev, type];
      catalogMemoryTypeFilter = next;
      return next;
    });
  }, []);
  const handleClearTypes = React.useCallback(() => {
    catalogMemoryTypeFilter = [];
    setTypeFilter([]);
  }, []);
  const handleToggleRarity = React.useCallback((rarity: CatalogRarity) => {
    setRarityFilter((prev) => {
      const next = prev.includes(rarity) ? prev.filter((value) => value !== rarity) : [...prev, rarity];
      catalogMemoryRarityFilter = next;
      return next;
    });
  }, []);
  const handleClearRarities = React.useCallback(() => {
    catalogMemoryRarityFilter = [];
    setRarityFilter([]);
  }, []);
  const handleToggleFavoritesOnly = React.useCallback(() => {
    setFavoritesOnly((prev) => {
      const next = !prev;
      catalogMemoryFavoritesOnly = next;
      return next;
    });
  }, []);
  const handleSetOwnedStatus = React.useCallback((status: OwnedStatus) => {
    catalogMemoryOwnedStatus = status;
    setOwnedStatus(status);
  }, []);

  return {
    account,
    loading,
    error,
    retryCatalog,
    favoritesOnly,
    typeFilter,
    rarityFilter,
    ownedStatus,
    ownedItemIds,
    search,
    sections,
    resultCount,
    visibleItems,
    favoriteItems,
    favoritesById,
    handleSearchChange,
    handleToggleType,
    handleClearTypes,
    handleToggleRarity,
    handleClearRarities,
    handleToggleFavoritesOnly,
    handleSetOwnedStatus,
  };
}
