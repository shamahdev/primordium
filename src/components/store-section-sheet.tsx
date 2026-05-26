import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StoreItemCard } from '@/components/store-item-card';
import { StoreResetTimer } from '@/components/store-reset-timer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { StoreCarouselCard } from '@/lib/account';

type StoreSectionSheetProps = {
  section: StoreCarouselCard | null;
  visible: boolean;
  onClose: () => void;
};

export function StoreSectionSheet({ section, visible, onClose }: StoreSectionSheetProps) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ThemedView style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: theme.background }]}> 
          <ThemedView style={[styles.handle, { backgroundColor: theme.textSecondary }]} />
          {section ? (
            <>
              <ThemedText type="subtitle">{section.title}</ThemedText>
              <ThemedText themeColor="textSecondary">{section.subtitle}</ThemedText>
              <StoreResetTimer expiresAt={section.expiresAt} />
              <FlatList
                data={section.items}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.content}
                columnWrapperStyle={styles.gridRow}
                renderItem={({ item }) => (
                  <View style={styles.gridItem}>
                    <StoreItemCard item={item} />
                  </View>
                )}
                showsVerticalScrollIndicator={false}
              />
            </>
          ) : null}
        </SafeAreaView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    maxHeight: '82%',
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    opacity: 0.4,
    marginBottom: Spacing.two,
  },
  content: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: Spacing.three,
  },
});
