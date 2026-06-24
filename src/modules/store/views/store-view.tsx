import { ErrorBanner } from '@/commons/components/error-banner';
import { PrimaryButton } from '@/commons/components/primary-button';
import { ResetTimerLabel } from '@/commons/components/reset-timer-label';
import { ThemedText } from '@/commons/components/themed-text';
import { ThemedView } from '@/commons/components/themed-view';
import { MaxContentWidth, Spacing } from '@/commons/constants/theme';
import { useTheme } from '@/commons/hooks/use-theme';
import { type Account } from '@/modules/account/account-type';
import { getLoginHref } from '@/modules/account/helpers/get-account-navigation-href';
import { StoreBundleCard, getStoreBundleCardWidth } from '@/modules/store/components/store-bundle-card';
import { StoreSectionSheet } from '@/modules/store/components/store-section-sheet';
import { ThreadedStoreGrid } from '@/modules/store/threaded-store-grid';
import {
  type StoreCarouselCard,
  type StoreSnapshot,
} from '@/modules/store/store-type';
import { type BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { type RefObject } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

type StoreViewProps = {
  account: Account;
  snapshot: StoreSnapshot | undefined;
  refreshing: boolean;
  error: string | null;
  refreshStore: () => Promise<void>;
  selectedSection: StoreCarouselCard | null;
  sheetRef: RefObject<BottomSheetModal | null>;
  handleBundleCardPress: (card: StoreCarouselCard) => void;
  handleSheetDismiss: () => void;
  handleSheetBeforeNavigate: () => void;
  carouselCards: StoreCarouselCard[];
  hasBundleCarousel: boolean;
  favoriteMatchesById: Record<string, boolean>;
};

export type { StoreViewProps };

export function StoreView({
  account,
  snapshot,
  refreshing,
  error,
  refreshStore,
  selectedSection,
  sheetRef,
  handleBundleCardPress,
  handleSheetDismiss,
  handleSheetBeforeNavigate,
  carouselCards,
  hasBundleCarousel,
  favoriteMatchesById,
}: StoreViewProps) {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const carouselItemWidth = getStoreBundleCardWidth(windowWidth);
  const carouselItemStyle = { width: carouselItemWidth };

  const renderBundleCardItem = ({ item }: { item: StoreCarouselCard }) => (
    <View style={carouselItemStyle}>
      <StoreBundleCard card={item} onPress={handleBundleCardPress} />
    </View>
  );

  if (!snapshot && refreshing) {
    return (
      <ThemedView style={styles.screen}>
        <View style={[styles.safeArea, styles.centered]}>
          <ActivityIndicator />
          <ThemedText themeColor="textSecondary">Loading current store...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!snapshot) {
    return (
      <ThemedView style={styles.screen}>
        <View style={styles.safeArea}>
          <ErrorBanner
            message={error ?? 'We could not load the current store yet.'}
            actionLabel="Retry"
            onPress={refreshStore}
          />
          <View style={styles.centered}>
            <ThemedText type="smallBold">Store unavailable</ThemedText>
            <PrimaryButton label="Retry" onPress={refreshStore} disabled={refreshing} />
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <>
      <ThemedView style={styles.screen}>
        {account.status === 'needsReauth' && (
          <ErrorBanner
            message="Session expired. Sign in again to refresh store."
            actionLabel="Sign in"
            onPress={() =>
              router.push(getLoginHref({ mode: 'reauth', accountId: account.id, returnTo: '/home' }))
            }
          />
        )}

        {error && account.status !== 'needsReauth' && (
          <ErrorBanner message={error} actionLabel="Retry" onPress={refreshStore} />
        )}

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshStore}
              tintColor={theme.primary}
            />
          }>
          {/* Bundles & Night Market */}
          {carouselCards.length > 0 && (
            <View style={styles.section}>
              {hasBundleCarousel ? (
                <FlatList
                  horizontal
                  data={carouselCards}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.carouselContent}
                  snapToInterval={getStoreBundleCardWidth(windowWidth) + Spacing.two}
                  decelerationRate="fast"
                  renderItem={renderBundleCardItem}
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View style={{ width: Spacing.one }} />}
                />
              ) : (
                <StoreBundleCard card={carouselCards[0]} onPress={handleBundleCardPress} />
              )}
            </View>
          )}

          {/* Daily Store */}
          {snapshot.dailyOffers.length > 0 && (
            <View style={styles.section}>
              <SectionLabel title="Daily Store" expiresAt={snapshot.dailyResetAt} />
              <ThreadedStoreGrid items={snapshot.dailyOffers} favoriteMatchesById={favoriteMatchesById} />
            </View>
          )}

          {/* Accessories */}
          {snapshot.accessoryOffers.length > 0 && (
            <View style={styles.section}>
              <SectionLabel title="Accessories" expiresAt={snapshot.accessoryResetAt} />
              <ThreadedStoreGrid items={snapshot.accessoryOffers} favoriteMatchesById={favoriteMatchesById} />
            </View>
          )}
        </ScrollView>
      </ThemedView>
      <StoreSectionSheet
        ref={sheetRef}
        section={selectedSection}
        onDismiss={handleSheetDismiss}
        onBeforeNavigate={handleSheetBeforeNavigate}
      />
    </>
  );
}

function SectionLabel({ title, expiresAt }: { title: string; expiresAt?: string }) {
  return (
    <View style={styles.sectionLabel}>
      <ThemedText type="default" style={styles.sectionTitle}>{title}</ThemedText>
      {expiresAt ? <ResetTimerLabel expiresAt={expiresAt} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  section: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  sectionLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.3)',
  },
  sectionTitle: {
    fontWeight: '700',
  },
  chipRow: {
    gap: Spacing.two,
  },
  carouselContent: {
    paddingHorizontal: 0,
  },
});
