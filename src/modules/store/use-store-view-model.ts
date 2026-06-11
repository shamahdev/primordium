import { log } from '@/commons/lib/logger';
import { AccountService } from '@/modules/account/account-service';
import { StoreService } from '@/modules/store/store-service';
import { type StoreCarouselCard } from '@/modules/store/store-type';
import { useAccountStore } from '@/modules/account/account-store';
import { type BottomSheetModal } from '@gorhom/bottom-sheet';
import { router, useFocusEffect } from 'expo-router';
import React from 'react';

export function useStoreViewModel() {
  const account = useAccountStore((state) =>
    state.accounts.find((item) => item.id === state.activeAccountId),
  );
  const accountCount = useAccountStore((state) => state.accounts.length);
  const setStoreSnapshot = useAccountStore((state) => state.setStoreSnapshot);
  const setProfileSnapshot = useAccountStore((state) => state.setProfileSnapshot);

  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedSection, setSelectedSection] = React.useState<StoreCarouselCard | null>(null);

  const sheetRef = React.useRef<BottomSheetModal>(null);
  const navigatingFromSheet = React.useRef(false);

  const refreshStore = React.useCallback(async () => {
    const currentAccount = useAccountStore.getState().accounts.find(
      (item) => item.id === useAccountStore.getState().activeAccountId,
    );
    if (!currentAccount || currentAccount.status === 'needsReauth') {
      log.store.warn('refreshStore skipped — no account or needsReauth');
      return;
    }

    setRefreshing(true);
    setError(null);
    try {
      const snapshot = await StoreService.fetchStore(currentAccount);
      setStoreSnapshot(currentAccount.id, snapshot);
      log.store.info('fetchStoreSnapshot OK', snapshot);
      
      if (!currentAccount.profileSnapshot) {
        try {
          const profile = await AccountService.fetchProfile(currentAccount);
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
      });
      const recoveryAction = AccountService.getStoredRiotSessionRecoveryAction({
        error: refreshError,
        accountId: currentAccount.id,
        accountCount,
        returnTo: '/home',
        fallbackMessage: 'Could not refresh store.',
      });
      if (recoveryAction.kind === 'reauth') {
        router.replace(recoveryAction.href);
      } else {
        setError(recoveryAction.message);
      }
      setRefreshing(false);
    }
  }, [accountCount, setStoreSnapshot, setProfileSnapshot]);

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

  const snapshot = account?.storeSnapshot;
  const carouselCards = [...(snapshot?.cards ?? [])].sort((left, right) => {
    if (left.section === right.section) return 0;
    return left.section === 'nightMarket' ? -1 : 1;
  });
  const hasBundleCarousel = carouselCards.length > 1;

  const handleBundleCardPress = (card: StoreCarouselCard) => {
    setSelectedSection(card);
    sheetRef.current?.present();
  };

  const handleSheetDismiss = () => {
    if (!navigatingFromSheet.current) {
      setSelectedSection(null);
    }
  };

  const handleSheetBeforeNavigate = () => {
    navigatingFromSheet.current = true;
    sheetRef.current?.dismiss();
  };

  return {
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
  };
}
