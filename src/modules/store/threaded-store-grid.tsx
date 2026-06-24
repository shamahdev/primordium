import { Spacing } from '@/commons/constants/theme';
import { StoreGrid } from '@/modules/store/components/store-grid';
import { StoreGridCardHitbox } from '@/modules/store/components/store-grid-card';
import { type StoreItem } from '@/modules/store/store-type';
import { OnRuntime } from '@react-native-runtimes/core';
import { FlatList, StyleSheet, View } from 'react-native';

type ThreadedStoreGridProps = {
  items: StoreItem[];
  favoriteMatchesById: Record<string, boolean>;
};

export function StoreGridRuntimeSurface(props: ThreadedStoreGridProps) {
  return <StoreGrid {...props} />;
}

export function ThreadedStoreGrid(props: ThreadedStoreGridProps) {
  return (
    <View>
      <OnRuntime name="store-runtime">
        <StoreGridRuntimeSurface {...props} />
      </OnRuntime>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <StoreGridInteractionOverlay {...props} />
      </View>
    </View>
  );
}

function StoreGridInteractionOverlay({ items }: ThreadedStoreGridProps) {
  const renderStoreItem = ({ item }: { item: StoreItem }) => {
    return (
      <View style={styles.gridItem}>
        <StoreGridCardHitbox item={item} />
      </View>
    );
  };

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      numColumns={2}
      scrollEnabled={false}
      contentContainerStyle={styles.gridList}
      columnWrapperStyle={styles.gridRow}
      renderItem={renderStoreItem}
    />
  );
}

const styles = StyleSheet.create({
  gridList: {
    gap: Spacing.two,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '49%',
  },
});
