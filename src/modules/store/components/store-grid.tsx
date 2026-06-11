import { FlatList, View, StyleSheet } from 'react-native';
import { StoreGridCard } from '@/modules/store/components/store-grid-card';
import { StoreItem } from '@/modules/store/store-type';
import { Spacing } from '@/commons/constants/theme';

type StoreGridProps = {
  items: StoreItem[];
  onBeforeNavigate?: () => void;
};

export function StoreGrid({ items }: StoreGridProps) {
  const renderStoreItem = ({ item }: { item: StoreItem }) => (
    <View style={styles.gridItem}>
      <StoreGridCard item={item} />
    </View>
  );

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
