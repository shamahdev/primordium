import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ErrorBanner } from '@/components/error-banner';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  getCosmeticCatalogItems,
  type CosmeticCatalogItem,
} from '@/lib/valorant-store-assets';
import {
  getValorantCosmeticRarityIcon,
  getValorantCosmeticRarityLabel,
  getValorantCosmeticTypeLabel,
  getValorantCosmeticTypePluralLabel,
  VALORANT_COSMETIC_TYPE_ORDER,
} from '@/lib/valorant-cosmetic-presentation';
import { useAccountStore } from '@/stores/account-store';
import { type FavoriteItem, useFavoriteStore } from '@/stores/favorite-store';

type CatalogFilter = 'all' | CosmeticCatalogItem['itemType'];
type CatalogMode = 'all' | 'favorites';

type CatalogSection = {
  key: CatalogFilter;
  title: string;
  data: CatalogListItem[];
};

type CatalogListItem = CosmeticCatalogItem & {
  searchText: string;
  favoritedAt?: string;
};

const TYPE_ORDER = VALORANT_COSMETIC_TYPE_ORDER;

const FILTER_LABELS: Record<CatalogFilter, string> = {
  all: 'All',
  skin: getValorantCosmeticTypePluralLabel('skin'),
  buddy: getValorantCosmeticTypePluralLabel('buddy'),
  spray: getValorantCosmeticTypePluralLabel('spray'),
  card: getValorantCosmeticTypePluralLabel('card'),
  title: getValorantCosmeticTypePluralLabel('title'),
  flex: getValorantCosmeticTypePluralLabel('flex'),
};

const FavoriteStarColor = '#FAD663';

let catalogMemoryMode: CatalogMode = 'all';
let catalogMemoryFilter: CatalogFilter = 'all';
let catalogMemorySearch = '';

export default function CatalogScreen() {
  const theme = useTheme();
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
      const catalogItems = await getCosmeticCatalogItems({ refresh });
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
        const catalogItems = await getCosmeticCatalogItems({ refresh: false });
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

  const renderItem = React.useCallback(
    ({ item }: { item: CatalogListItem }) => (
      <CatalogRow item={item} isFavorite={!!favoritesById[item.id]} />
    ),
    [favoritesById],
  );
  const renderSectionHeader = React.useCallback(
    ({ section }: { section: CatalogSection }) => <SectionHeader title={section.title} />,
    [],
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

  if (!account) {
    return <Redirect href="/" />;
  }

  return (
    <ThemedView style={styles.screen}>
      {error ? <ErrorBanner message={error} actionLabel="Retry" onPress={retryCatalog} /> : null}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={[styles.modeSwitch, { backgroundColor: theme.backgroundElement }]}>
              <ModeButton label="All Items" mode="all" selected={mode === 'all'} onPress={handleModeChange} />
              <ModeButton label="Favorites" mode="favorites" selected={mode === 'favorites'} onPress={handleModeChange} />
            </View>
            <View style={styles.searchRow}>
              <TextInput
                value={search}
                onChangeText={handleSearchChange}
                placeholder="Search items or types"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  styles.searchInput,
                  {
                    color: theme.text,
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.backgroundSelected,
                  },
                ]}
              />
              {search.length > 0 ? (
                <Pressable
                  onPress={() => handleSearchChange('')}
                  style={styles.searchClear}
                >
                  <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
                </Pressable>
              ) : null}
            </View>
            <View style={styles.chipRow}>
              {(Object.keys(FILTER_LABELS) as CatalogFilter[]).map((type) => (
                <FilterChip
                  key={type}
                  label={FILTER_LABELS[type]}
                  selected={filter === type}
                  type={type}
                  onPress={handleFilterChange}
                />
              ))}
            </View>
            {!loading && !error ? (
              <ThemedText type="small" themeColor="textSecondary">
                {resultCount.toLocaleString()} {mode === 'favorites' ? 'favorites' : 'items'}
              </ThemedText>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {loading && mode === 'all' ? (
              <>
                <ActivityIndicator />
                <ThemedText themeColor="textSecondary">Loading catalog...</ThemedText>
              </>
            ) : error ? (
              <PrimaryButton label="Retry" onPress={retryCatalog} />
            ) : mode === 'favorites' && favoriteItems.length === 0 ? (
              <View style={styles.emptyStateText}>
                <ThemedText type="smallBold">No favorites yet</ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.emptyStateHint}>
                  Open an item and tap the star.
                </ThemedText>
              </View>
            ) : mode === 'favorites' ? (
              <ThemedText themeColor="textSecondary">No favorites match your search.</ThemedText>
            ) : (
              <ThemedText themeColor="textSecondary">No items match your search.</ThemedText>
            )}
          </View>
        }
        contentContainerStyle={styles.content}
        stickySectionHeadersEnabled={false}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        updateCellsBatchingPeriod={32}
        windowSize={7}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      />
    </ThemedView>
  );
}

const CatalogRow = React.memo(function CatalogRow({
  item,
  isFavorite,
}: {
  item: CatalogListItem;
  isFavorite: boolean;
}) {
  const theme = useTheme();
  const typeLabel = getValorantCosmeticTypeLabel(item.itemType);
  const rarityLabel = item.rarity ? getValorantCosmeticRarityLabel(item.rarity) : null;
  const rarityIcon = item.rarity ? getValorantCosmeticRarityIcon(item.rarity) : null;

  const openItem = React.useCallback(() => {
    router.push({
      pathname: '/store-item',
      params: {
        itemAssetId: item.id,
        itemType: item.itemType,
        title: item.title,
        source: 'catalog',
        ...(item.rarity ? { rarity: item.rarity } : {}),
      },
    });
  }, [item.id, item.itemType, item.rarity, item.title]);

  return (
    <Pressable onPress={openItem} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <ThemedView type="backgroundElement" style={styles.thumbnail}>
        {item.imageUrl ? (
          <Image source={item.imageUrl} contentFit="contain" style={styles.thumbnailImage} />
        ) : (
          <ThemedText type="xsmall" themeColor="textSecondary" style={styles.thumbnailFallback}>
            {item.itemType.toUpperCase()}
          </ThemedText>
        )}
      </ThemedView>
      <View style={styles.rowText}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {item.title}
        </ThemedText>
        <View style={styles.metadataRow}>
          <ThemedText type="small" themeColor="textSecondary">
            {typeLabel}
          </ThemedText>
          {rarityIcon ? (
            <Image
              source={rarityIcon}
              contentFit="contain"
              style={styles.rarityIcon}
              accessibilityLabel={rarityLabel ?? undefined}
            />
          ) : null}
        </View>
      </View>
      {isFavorite ? <Ionicons name="star" size={16} color={FavoriteStarColor} /> : null}
      <ThemedText style={{ color: theme.textSecondary }}>{'>'}</ThemedText>
    </Pressable>
  );
});

const ModeButton = React.memo(function ModeButton({
  label,
  mode,
  selected,
  onPress,
}: {
  label: string;
  mode: CatalogMode;
  selected: boolean;
  onPress: (mode: CatalogMode) => void;
}) {
  const theme = useTheme();
  const handlePress = React.useCallback(() => onPress(mode), [mode, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.modeButton,
        { backgroundColor: selected ? theme.primary : 'transparent' },
      ]}>
      <ThemedText type="smallBold" style={{ color: selected ? theme.primaryForeground : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
});

const FilterChip = React.memo(function FilterChip({
  label,
  selected,
  type,
  onPress,
}: {
  label: string;
  selected: boolean;
  type: CatalogFilter;
  onPress: (type: CatalogFilter) => void;
}) {
  const theme = useTheme();
  const handlePress = React.useCallback(() => onPress(type), [onPress, type]);
  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.primary : theme.backgroundElement,
          borderColor: selected ? theme.primary : theme.backgroundSelected,
        },
      ]}>
      <ThemedText type="xsmall" style={{ color: selected ? theme.primaryForeground : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
});

const SectionHeader = React.memo(function SectionHeader({ title }: { title: string }) {
  return (
    <ThemedText type="small" themeColor="textSecondary" style={styles.sectionHeader}>
      {title.toUpperCase()}
    </ThemedText>
  );
});

function getCatalogSections(
  items: CatalogListItem[],
  mode: CatalogMode,
  filter: CatalogFilter,
  search: string,
): CatalogSection[] {
  const normalizedSearch = search.trim().toLowerCase();
  const sectionsByType = new Map<CosmeticCatalogItem['itemType'], CatalogListItem[]>(
    TYPE_ORDER.map((type) => [type, []]),
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

  return TYPE_ORDER.map((type) => ({
    key: type,
    title: FILTER_LABELS[type],
    data: sectionsByType.get(type) ?? [],
  })).filter((section) => section.data.length > 0);
}

function sortCatalogItems(items: CatalogListItem[]) {
  return [...items].sort((left, right) => {
    const typeDelta = TYPE_ORDER.indexOf(left.itemType) - TYPE_ORDER.indexOf(right.itemType);
    if (typeDelta !== 0) return typeDelta;
    return left.title.localeCompare(right.title);
  });
}

function sortFavoriteItems(items: CatalogListItem[]) {
  return [...items].sort((left, right) => {
    const leftDate = left.favoritedAt ? Date.parse(left.favoritedAt) : 0;
    const rightDate = right.favoritedAt ? Date.parse(right.favoritedAt) : 0;
    return rightDate - leftDate;
  });
}

function toCatalogListItem(item: CosmeticCatalogItem | FavoriteItem): CatalogListItem {
  return {
    ...item,
    searchText: `${item.title} ${item.itemType} ${FILTER_LABELS[item.itemType]}`.toLowerCase(),
  };
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  headerContent: {
    gap: Spacing.three,
    paddingBottom: Spacing.three,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  searchClear: {
    position: 'absolute',
    right: Spacing.two,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  modeSwitch: {
    flexDirection: 'row',
    borderRadius: Spacing.one,
    padding: Spacing.one,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: Spacing.one,
    paddingVertical: Spacing.two,
  },
  sectionHeader: {
    letterSpacing: 1.4,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.75,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailFallback: {
    letterSpacing: 1,
  },
  rowText: {
    flex: 1,
    gap: Spacing.one,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rarityIcon: {
    width: 18,
    height: 18,
  },
  emptyState: {
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  emptyStateText: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  emptyStateHint: {
    textAlign: 'center',
  },
});
