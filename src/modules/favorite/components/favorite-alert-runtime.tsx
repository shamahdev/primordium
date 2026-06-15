import React from 'react';
import { AppState } from 'react-native';

import { useAccountStore } from '@/modules/account/account-store';
import { FavoriteAlertService } from '@/modules/favorite/favorite-alert-service';
import { useFavoriteAlertStore } from '@/modules/favorite/favorite-alert-store';
import { useFavoriteStore } from '@/modules/favorite/favorite-store';

export function FavoriteAlertRuntime() {
  const enabled = useFavoriteAlertStore((state) => state.enabled);
  const activeAccountId = useAccountStore((state) => state.activeAccountId);
  const hasHydrated = useAccountStore((state) => state.hasHydrated);
  const favoriteCount = useFavoriteStore((state) => Object.keys(state.favoritesById).length);

  React.useEffect(() => {
    if (!hasHydrated) return;
    void FavoriteAlertService.syncTaskRegistration();
    if (enabled) {
      void FavoriteAlertService.runCheck();
    }
  }, [activeAccountId, enabled, favoriteCount, hasHydrated]);

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void FavoriteAlertService.runCheck();
      }
    });

    return () => subscription.remove();
  }, []);

  return null;
}
