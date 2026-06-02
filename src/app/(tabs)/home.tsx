import { type BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { Redirect, router, useFocusEffect } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { ErrorBanner } from '@/components/error-banner';
import { PrimaryButton } from '@/components/primary-button';
import { StoreItemCard } from '@/components/store-item-card';
import { StoreResetTimer } from '@/components/store-reset-timer';
import { StoreSectionSheet } from '@/components/store-section-sheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { type StoreCarouselCard, type StoreItem } from '@/lib/account';
import { isAuthRecoveryRequired } from '@/lib/auth-recovery';
import { log } from '@/lib/logger';
import { getLoginHref, getSwitchAccountHref } from '@/lib/navigation';
import { fetchProfileSnapshot, fetchStoreSnapshot } from '@/lib/valorant-api';
import { useAccountStore } from '@/stores/account-store';

export default function AuthenticatedHomeScreen() {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const activeAccountId = useAccountStore((state) => state.activeAccountId);
  const account = useAccountStore((state) =>
    state.accounts.find((item) => item.id === state.activeAccountId),
  );
  const accounts = useAccountStore((state) => state.accounts);
  const setStoreSnapshot = useAccountStore((state) => state.setStoreSnapshot);
  const setProfileSnapshot = useAccountStore((state) => state.setProfileSnapshot);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedSection, setSelectedSection] = React.useState<StoreCarouselCard | null>(null);
  const sheetRef = React.useRef<BottomSheetModal>(null);
  const navigatingFromSheet = React.useRef(false);

  const routeToAuthRecovery = (accountId: string) => {
    if (accounts.length > 1) {
      router.replace(getSwitchAccountHref({ reason: 'reauthFailed', accountId, returnTo: '/home' }));
      return;
    }
    router.replace(getLoginHref({ mode: 'reauth', accountId, returnTo: '/home' }));
  };

  const refreshStore = async () => {
    const currentAccount = useAccountStore.getState().accounts.find(
      (item) => item.id === activeAccountId,
    );
    log.store.debug('refreshStore called', {
      activeAccountId,
      hasAccount: !!currentAccount,
      status: currentAccount?.status,
    });
    if (!currentAccount || currentAccount.status === 'needsReauth') {
      log.store.warn('refreshStore skipped — no account or needsReauth');
      return;
    }

    setRefreshing(true);
    setError(null);
    try {
      log.store.info('fetchStoreSnapshot starting', {
        puuid: currentAccount.puuid,
        shard: currentAccount.shard,
      });
      const snapshot = await fetchStoreSnapshot(currentAccount);
      log.store.info('fetchStoreSnapshot OK', {
        cards: snapshot.cards.length,
        daily: snapshot.dailyOffers.length,
        accessories: snapshot.accessoryOffers.length,
      });
      setStoreSnapshot(currentAccount.id, snapshot);
      if (!currentAccount.profileSnapshot) {
        try {
          const profile = await fetchProfileSnapshot(currentAccount);
          setProfileSnapshot(currentAccount.id, profile);
        } catch (profileError) {
          log.store.warn('fetchProfileSnapshot on home failed', {
            message: profileError instanceof Error ? profileError.message : String(profileError),
          });
        }
      }
      setRefreshing(false);
    } catch (refreshError) {
      log.store.error('fetchStoreSnapshot FAILED', {
        name: refreshError instanceof Error ? refreshError.name : typeof refreshError,
        message: refreshError instanceof Error ? refreshError.message : String(refreshError),
        isAuthRecovery: isAuthRecoveryRequired(refreshError),
        recoveryKind: isAuthRecoveryRequired(refreshError) ? refreshError.recoveryKind : undefined,
        reason: isAuthRecoveryRequired(refreshError) ? refreshError.reason : undefined,
      });
      if (isAuthRecoveryRequired(refreshError)) {
        if (refreshError.recoveryKind === 'temporaryAuthUnavailable') {
          setError(refreshError.message);
        } else {
          routeToAuthRecovery(currentAccount.id);
        }
      } else {
        setError(refreshError instanceof Error ? refreshError.message : 'Could not refresh store.');
      }
      setRefreshing(false);
    }
  };

  useFocusEffect(() => {
    void refreshStore();
  });

  useFocusEffect(() => {
    if (navigatingFromSheet.current && selectedSection) {
      navigatingFromSheet.current = false;
      sheetRef.current?.present();
    }
  });
  if (!account) {
    return <Redirect href="/" />;
  }

  const snapshot = account.storeSnapshot;
  const carouselCards = [...(snapshot?.cards ?? [])].sort((left, right) => {
    if (left.section === right.section) return 0;
    return left.section === 'nightMarket' ? -1 : 1;
  });

  const handleBundleCardPress = (card: StoreCarouselCard) => {
    setSelectedSection(card);
    sheetRef.current?.present();
  };

  const carouselItemWidth = bundleCardWidth(windowWidth);
  const carouselItemStyle = { width: carouselItemWidth };

  const renderBundleCardItem = ({ item }: { item: StoreCarouselCard }) => (
    <View style={carouselItemStyle}>
      <BundleCarouselCard card={item} onPress={handleBundleCardPress} />
    </View>
  );

  if (!snapshot && refreshing) {
    return (
      <ThemedView style={styles.screen}>
        <View style={[styles.safeArea, styles.centered]}>
          <ActivityIndicator />
          <ThemedText themeColor="textSecondary">Loading current store\u2026</ThemedText>
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
                <FlatList
                  horizontal
                  data={carouselCards}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.carouselContent}
                  snapToInterval={bundleCardWidth(windowWidth) + Spacing.two}
                  decelerationRate="fast"
                  renderItem={renderBundleCardItem}
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View style={{ width: Spacing.two }} />}
                />
              </View>
            )}

            {/* Daily Store */}
            {snapshot.dailyOffers.length > 0 && (
              <View style={styles.section}>
                <SectionLabel title="Daily Store" expiresAt={snapshot.dailyResetAt} />
                <StoreGrid items={snapshot.dailyOffers} />
              </View>
            )}

            {/* Accessories */}
            {snapshot.accessoryOffers.length > 0 && (
              <View style={styles.section}>
                <SectionLabel title="Accessories" expiresAt={snapshot.accessoryResetAt} />
                <StoreGrid items={snapshot.accessoryOffers} />
              </View>
            )}


          </ScrollView>
      </ThemedView>
      <StoreSectionSheet
        ref={sheetRef}
        section={selectedSection}
        onDismiss={() => {
          if (!navigatingFromSheet.current) {
            setSelectedSection(null);
          }
        }}
        onBeforeNavigate={() => {
          navigatingFromSheet.current = true;
          sheetRef.current?.dismiss();
        }}
      />
    </>
  );
}

function SectionLabel({ title, expiresAt }: { title: string; expiresAt?: string }) {
  return (
    <View style={styles.sectionLabel}>
      <ThemedText type="default" style={styles.sectionTitle}>{title}</ThemedText>
      {expiresAt ? <StoreResetTimer expiresAt={expiresAt} /> : null}
    </View>
  );
}

function renderStoreItem({ item }: { item: StoreItem }) {
  return (
    <View style={styles.gridItem}>
      <StoreItemCard item={item} />
    </View>
  );
}

function StoreGrid({ items }: { items: StoreItem[] }) {
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

function bundleCardWidth(windowWidth: number) {
  return Math.floor(windowWidth * 0.9);
}

function BundleCarouselCard({
  card,
  onPress,
}: {
  card: StoreCarouselCard;
  onPress: (card: StoreCarouselCard) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(card)}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <View style={styles.bundleCard}>
        {card.imageUrl ? (
          <Image source={card.imageUrl} contentFit="cover" style={styles.bundleImage} />
        ) : (
          <View style={styles.bundleImageFallback}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              BUNDLE
            </ThemedText>
          </View>
        )}
        <View style={styles.bundleTextOverlay}>
          <ThemedText type="smallBold" style={styles.bundleTitle} numberOfLines={2}>
            {card.title.toUpperCase()}
          </ThemedText>
          <StoreResetTimer expiresAt={card.expiresAt} prefix="Leave in" />
        </View>
      </View>
    </Pressable>
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
  bundleCard: {
    height: 144,
    borderRadius: Spacing.one,
    overflow: 'hidden',
    backgroundColor: Colors.dark.backgroundElement,
  },
  bundleImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  bundleImageFallback: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bundleTextOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    gap: 2,
  },
  bundleTitle: {
    color: '#ffffff',
    fontWeight: '700',
  },
  bundleTextBlock: {
    padding: Spacing.two,
    gap: Spacing.half,
  },
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
