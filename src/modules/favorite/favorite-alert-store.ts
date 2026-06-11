import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type FavoriteAlertStore = {
  enabled: boolean;
  lastNotifiedByAccountId: Record<string, string>;
  setEnabled: (enabled: boolean) => void;
  setLastNotified: (accountId: string, resetKey: string) => void;
};

export const useFavoriteAlertStore = create<FavoriteAlertStore>()(
  persist(
    (set) => ({
      enabled: false,
      lastNotifiedByAccountId: {},
      setEnabled: (enabled) => set({ enabled }),
      setLastNotified: (accountId, resetKey) =>
        set((state) => ({
          lastNotifiedByAccountId: {
            ...state.lastNotifiedByAccountId,
            [accountId]: resetKey,
          },
        })),
    }),
    {
      name: 'primordium.favoriteStoreAlerts',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
