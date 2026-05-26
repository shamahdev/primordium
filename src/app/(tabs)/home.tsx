import { type BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { Redirect, router, useFocusEffect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorBanner } from '@/components/error-banner';
import { PrimaryButton } from '@/components/primary-button';
import { StoreItemCard } from '@/components/store-item-card';
import { StoreResetTimer } from '@/components/store-reset-timer';
import { StoreSectionSheet } from '@/components/store-section-sheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { type StoreCarouselCard, type StoreItem } from '@/lib/account';
import { isAuthRecoveryRequired } from '@/lib/auth-recovery';
import { log } from '@/lib/logger';
import { getLoginHref, getSwitchAccountHref } from '@/lib/navigation';
import { fetchStoreSnapshot } from '@/lib/valorant-api';
import { useAccountStore } from '@/stores/account-store';

export default function AuthenticatedHomeScreen() {
  const theme = useTheme();
  const layout = useWindowDimensions();
  const activeAccountId = useAccountStore((state) => state.activeAccountId);
  const account = useAccountStore((state) =>
    state.accounts.find((item) => item.id === state.activeAccountId),
  );
  const accounts = useAccountStore((state) => state.accounts);
  const setStoreSnapshot = useAccountStore((state) => state.setStoreSnapshot);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedSection, setSelectedSection] = React.useState<StoreCarouselCard | null>(null);
  const sheetRef = React.useRef<BottomSheetModal>(null);
  const navigatingFromSheet = React.useRef(false);

  const routeToAuthRecovery = React.useCallback((accountId: string) => {
    if (accounts.length > 1) {
      router.replace(getSwitchAccountHref({ reason: 'reauthFailed', accountId, returnTo: '/home' }));
      return;
    }

    router.replace(getLoginHref({ mode: 'reauth', accountId, returnTo: '/home' }));
  }, [accounts.length]);

  const refreshStore = React.useCallback(async () => {
    const currentAccount = useAccountStore.getState().accounts.find((item) => item.id === activeAccountId);
    log.store.debug('refreshStore called', { activeAccountId, hasAccount: !!currentAccount, status: currentAccount?.status });
    if (!currentAccount || currentAccount.status === 'needsReauth') {
      log.store.warn('refreshStore skipped — no account or needsReauth');
      return;
    }

    setRefreshing(true);
    setError(null);
    try {
      log.store.info('fetchStoreSnapshot starting', { puuid: currentAccount.puuid, shard: currentAccount.shard });
      const snapshot = await fetchStoreSnapshot(currentAccount);
      log.store.info('fetchStoreSnapshot OK', { cards: snapshot.cards.length, daily: snapshot.dailyOffers.length, accessories: snapshot.accessoryOffers.length });
      setStoreSnapshot(currentAccount.id, snapshot);
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
    } finally {
      setRefreshing(false);
    }
  }, [activeAccountId, routeToAuthRecovery, setStoreSnapshot]);

  useFocusEffect(
    React.useCallback(() => {
      void refreshStore();
    }, [refreshStore]),
  );

  useFocusEffect(
    React.useCallback(() => {
      if (navigatingFromSheet.current && selectedSection) {
        navigatingFromSheet.current = false;
        sheetRef.current?.present();
      }
    }, [selectedSection]),
  );

  if (!account) {
    return <Redirect href="/" />;
  }

  const snapshot = account.storeSnapshot;
  const carouselCards = [...snapshot?.cards ?? []].sort((left, right) => {
    if (left.section === right.section) {
      return 0;
    }

    return left.section === 'nightMarket' ? -1 : 1;
  });

  if (!snapshot && refreshing) {
    return (
      <ThemedView style={styles.screen}>
        <SafeAreaView edges={['left', 'right']} style={[styles.safeArea, styles.centered]}>
          <ActivityIndicator />
          <ThemedText themeColor="textSecondary">Loading current store...</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!snapshot) {
    return (
      <ThemedView style={styles.screen}>
        <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
          <ErrorBanner
            message={error ?? 'We could not load the current store yet.'}
            actionLabel="Retry"
            onPress={refreshStore}
          />
          <View style={styles.centered}>
            <ThemedText type="smallBold">Store unavailable</ThemedText>
            <PrimaryButton label="Retry" onPress={refreshStore} disabled={refreshing} />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <>
      <ThemedView style={styles.screen}>
        <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
          {account.status === 'needsReauth' && (
            <ErrorBanner
              message="Session expired. Sign in again to refresh store."
              actionLabel="Sign in"
              onPress={() => router.push(getLoginHref({ mode: 'reauth', accountId: account.id, returnTo: '/home' }))}
            />
          )}

          {error && account.status !== 'needsReauth' && (
            <ErrorBanner message={error} actionLabel="Retry" onPress={refreshStore} />
          )}

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {carouselCards.length > 0 && (
              <ThemedView style={styles.section}>
                <FlatList
                  horizontal
                  data={carouselCards}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.carousel}
                  renderItem={({ item }) => {
                    const cardImage = item.imageUrl ?? getCarouselFallbackImage(item.section);
                    return (
                      <Pressable
                        onPress={() => {
                          setSelectedSection(item);
                          sheetRef.current?.present();
                        }}
                        style={({ pressed }) => [
                          styles.carouselCard,
                          {
                            width: Math.min(layout.width - Spacing.five * 3, 312),
                            backgroundColor: theme.backgroundElement,
                            opacity: pressed ? 0.92 : 1,
                          },
                        ]}>
                        {cardImage ? <Image source={cardImage} contentFit="cover" style={styles.carouselImage} /> : null}
                        <View style={styles.carouselOverlay}>
                          <ThemedText type="smallBold">{item.title}</ThemedText>
                          <ThemedText type="small" themeColor="textSecondary">
                            {item.subtitle}
                          </ThemedText>
                          <StoreResetTimer expiresAt={item.expiresAt} />
                        </View>
                      </Pressable>
                    );
                  }}
                  showsHorizontalScrollIndicator={false}
                />
              </ThemedView>
            )}

            <ThemedView style={styles.section}>
              <SectionHeader title="Daily Store" expiresAt={snapshot.dailyResetAt} />
              <StoreGrid items={snapshot.dailyOffers} />
            </ThemedView>

            <ThemedView style={styles.section}>
              <SectionHeader title="Weekly Accessories" expiresAt={snapshot.accessoryResetAt} />
              <StoreGrid items={snapshot.accessoryOffers} />
            </ThemedView>
          </ScrollView>
        </SafeAreaView>
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

function SectionHeader({ title, expiresAt }: { title: string; expiresAt: string }) {
  return (
    <View style={styles.sectionHeader}>
      <ThemedText type="smallBold">{title}</ThemedText>
      <StoreResetTimer expiresAt={expiresAt} />
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
      renderItem={({ item }) => (
        <View style={styles.gridItem}>
          <StoreItemCard item={item} />
        </View>
      )}
    />
  );
}

function getCarouselFallbackImage(section: StoreCarouselCard['section']) {
  if (section === 'nightMarket') {
    return require('@/assets/images/valorant/placeholder/night-market.png');
  }
  return null;
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
    padding: Spacing.four,
    gap: Spacing.four,
  },
  eyebrow: {
    letterSpacing: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  headerText: {
    flex: 1,
    gap: Spacing.one,
    backgroundColor: 'transparent',
  },
  section: {
    gap: Spacing.three,
  },
  sectionTitle: {
    letterSpacing: 1.4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
  },
  carousel: {
    gap: Spacing.two,
    paddingRight: Spacing.four,
  },
  carouselCard: {
    borderRadius: Spacing.four,
    overflow: 'hidden',
    minHeight: 180,
    justifyContent: 'flex-end',
  },
  carouselImage: {
    ...StyleSheet.absoluteFill,
  },
  carouselOverlay: {
    padding: Spacing.three,
    gap: Spacing.one,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  gridList: {
    gap: Spacing.two,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
  },
});
