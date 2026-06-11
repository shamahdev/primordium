import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ErrorBanner } from '@/commons/components/error-banner';
import { PrimaryButton } from '@/commons/components/primary-button';
import { ThemedText } from '@/commons/components/themed-text';
import { ThemedView } from '@/commons/components/themed-view';
import { Spacing } from '@/commons/constants/theme';
import { useTheme } from '@/commons/hooks/use-theme';
import { CatalogFilterChip } from '../components/catalog-filter-chip';
import { CatalogModeButton } from '../components/catalog-mode-button';
import { CatalogRow } from '../components/catalog-row';
import { CatalogSectionHeader } from '../components/catalog-section-header';

import type { CatalogFilter, CatalogListItem, CatalogMode } from '../catalog-type';

type CatalogViewProps = {
  error: string | null;
  retryCatalog: () => void;
  mode: CatalogMode;
  filter: CatalogFilter;
  search: string;
  sections: { key: CatalogFilter; title: string; data: CatalogListItem[] }[];
  resultCount: number;
  loading: boolean;
  favoriteItems: CatalogListItem[];
  favoritesById: Record<string, unknown>;
  handleSearchChange: (text: string) => void;
  handleFilterChange: (type: CatalogFilter) => void;
  handleModeChange: (nextMode: CatalogMode) => void;
};

export function CatalogView({
  error,
  retryCatalog,
  mode,
  filter,
  search,
  sections,
  resultCount,
  loading,
  favoriteItems,
  favoritesById,
  handleSearchChange,
  handleFilterChange,
  handleModeChange,
}: CatalogViewProps) {
  const theme = useTheme();

  const renderItem = React.useCallback(
    ({ item }: { item: CatalogListItem }) => (
      <CatalogRow item={item} isFavorite={!!favoritesById[item.id]} />
    ),
    [favoritesById],
  );
  const renderSectionHeader = React.useCallback(
    ({ section }: { section: { title: string } }) => <CatalogSectionHeader title={section.title} />,
    [],
  );

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
              <CatalogModeButton label="All Items" mode="all" selected={mode === 'all'} onPress={handleModeChange} />
              <CatalogModeButton label="Favorites" mode="favorites" selected={mode === 'favorites'} onPress={handleModeChange} />
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
              {(['all', 'skin', 'buddy', 'spray', 'card', 'title', 'flex'] as CatalogFilter[]).map((type) => (
                <CatalogFilterChip
                  key={type}
                  label={type === 'all' ? 'All' : type}
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
  modeSwitch: {
    flexDirection: 'row',
    borderRadius: Spacing.one,
    padding: Spacing.one,
  },
  sectionHeader: {
    letterSpacing: 1.4,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.one,
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
