import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type FavoriteAlertStore = {
	enabled: boolean;
	lastNotifiedByAccountId: Record<string, string>;
	lastCheckedByAccountId: Record<string, string>;
	setEnabled: (enabled: boolean) => void;
	setLastNotified: (accountId: string, resetKey: string) => void;
	setLastChecked: (accountId: string, checkedAt: string) => void;
};

export const useFavoriteAlertStore = create<FavoriteAlertStore>()(
	persist(
		(set) => ({
			enabled: false,
			lastNotifiedByAccountId: {},
			lastCheckedByAccountId: {},
			setEnabled: (enabled) => set({ enabled }),
			setLastNotified: (accountId, resetKey) =>
				set((state) => ({
					lastNotifiedByAccountId: {
						...state.lastNotifiedByAccountId,
						[accountId]: resetKey,
					},
				})),
			setLastChecked: (accountId, checkedAt) =>
				set((state) => ({
					lastCheckedByAccountId: {
						...state.lastCheckedByAccountId,
						[accountId]: checkedAt,
					},
				})),
		}),
		{
			name: "primordium.favoriteStoreAlerts",
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
