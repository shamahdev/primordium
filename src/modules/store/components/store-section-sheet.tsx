import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ResetTimerLabel } from '@/commons/components/reset-timer-label';
import { ThemedText } from '@/commons/components/themed-text';
import { StoreGridCard } from '@/modules/store/components/store-grid-card';
import { Spacing } from '@/commons/constants/theme';
import { useTheme } from '@/commons/hooks/use-theme';
import type { StoreCarouselCard } from '@/modules/store/store-type';

type StoreSectionSheetProps = {
  section: StoreCarouselCard | null;
  onDismiss: () => void;
  onBeforeNavigate?: () => void;
  ref?: React.Ref<BottomSheetModal>;
};

function renderBackdrop(props: BottomSheetBackdropProps) {
  return <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior="close" />;
}

export function StoreSectionSheet({ section, onDismiss, onBeforeNavigate, ref }: StoreSectionSheetProps) {
  const theme = useTheme();

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={['82%']}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onDismiss={onDismiss}
      backgroundStyle={{ backgroundColor: theme.background }}
      handleIndicatorStyle={{ backgroundColor: theme.textSecondary, opacity: 0.4 }}>
      {section ? (
        <View style={styles.header}>
          <ThemedText type="subtitle">{section.title.toUpperCase()}</ThemedText>
          <ResetTimerLabel expiresAt={section.expiresAt} prefix="Leave in" />
        </View>
      ) : null}
      <BottomSheetFlatList
        data={section?.items ?? []}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.content}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <StoreGridCard item={item} onBeforeNavigate={onBeforeNavigate} />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    gap: Spacing.two,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '49%',
  },
});
