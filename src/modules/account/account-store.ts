import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
	Account,
	AccountCookie,
	AccountProfile,
	AccountTokens,
} from "@/modules/account/account-type";
import {
	deleteAuthMaterial,
	saveCookies,
	saveTokens,
} from "@/modules/account/adapters/account-secure-storage.adapter";
import type { CompanionRank } from "@/modules/companion/companion-type";
import type { StoreSnapshot } from "@/modules/store/store-type";

type AccountStoreState = {
	accounts: Account[];
	activeAccountId: string | null;
	hasHydrated: boolean;
	setHasHydrated: (hasHydrated: boolean) => void;
	ensureActiveAccount: () => void;
	switchAccount: (accountId: string) => void;
	saveAuthenticatedAccount: (
		account: Account,
		tokens: AccountTokens,
		cookies?: AccountCookie[],
	) => Promise<void>;
	setProfileSnapshot: (accountId: string, snapshot: AccountProfile) => void;
	setRankSnapshot: (accountId: string, snapshot: CompanionRank) => void;
	setStoreSnapshot: (accountId: string, snapshot: StoreSnapshot) => void;
	markNeedsReauth: (accountId: string) => void;
	removeAccount: (accountId: string) => Promise<string | null>;
};

export const useAccountStore = create<AccountStoreState>()(
	persist(
		(set, get) => ({
			accounts: [],
			activeAccountId: null,
			hasHydrated: false,
			setHasHydrated: (hasHydrated) => set({ hasHydrated }),
			ensureActiveAccount: () => {
				const { accounts, activeAccountId } = get();
				if (accounts.length === 0) {
					set({ activeAccountId: null });
					return;
				}
				if (!accounts.some((account) => account.id === activeAccountId)) {
					set({ activeAccountId: accounts[0].id });
				}
			},
			switchAccount: (accountId) => {
				if (get().accounts.some((account) => account.id === accountId)) {
					set({ activeAccountId: accountId });
				}
			},
			saveAuthenticatedAccount: async (account, tokens, cookies) => {
				await saveTokens(account.id, tokens);
				if (cookies?.length) {
					await saveCookies(account.id, cookies);
				}
				set((state) => {
					const existing = state.accounts.find(
						(item) => item.id === account.id,
					);
					const nextAccount: Account = {
						...account,
						createdAt: existing?.createdAt ?? account.createdAt,
						profileSnapshot: existing?.profileSnapshot,
						rankSnapshot: existing?.rankSnapshot,
						storeSnapshot: existing?.storeSnapshot,
						status: "ready",
						updatedAt: new Date().toISOString(),
					};
					const accounts = existing
						? state.accounts.map((item) =>
								item.id === account.id ? nextAccount : item,
							)
						: [...state.accounts, nextAccount];

					return { accounts, activeAccountId: account.id };
				});
			},
			setProfileSnapshot: (accountId, snapshot) => {
				set((state) => ({
					accounts: state.accounts.map((account) =>
						account.id === accountId
							? {
									...account,
									profileSnapshot: snapshot,
									updatedAt: new Date().toISOString(),
								}
							: account,
					),
				}));
			},
			setRankSnapshot: (accountId, snapshot) => {
				set((state) => ({
					accounts: state.accounts.map((account) =>
						account.id === accountId
							? {
									...account,
									rankSnapshot: snapshot,
									updatedAt: new Date().toISOString(),
								}
							: account,
					),
				}));
			},
			setStoreSnapshot: (accountId, snapshot) => {
				set((state) => ({
					accounts: state.accounts.map((account) =>
						account.id === accountId
							? {
									...account,
									storeSnapshot: snapshot,
									updatedAt: new Date().toISOString(),
								}
							: account,
					),
				}));
			},
			markNeedsReauth: (accountId) => {
				set((state) => ({
					accounts: state.accounts.map((account) =>
						account.id === accountId
							? {
									...account,
									status: "needsReauth",
									updatedAt: new Date().toISOString(),
								}
							: account,
					),
				}));
			},
			removeAccount: async (accountId) => {
				await deleteAuthMaterial(accountId);
				let nextActiveAccountId: string | null = null;
				set((state) => {
					const accounts = state.accounts.filter(
						(account) => account.id !== accountId,
					);
					nextActiveAccountId = accounts[0]?.id ?? null;
					return {
						accounts,
						activeAccountId:
							state.activeAccountId === accountId
								? null
								: state.activeAccountId,
					};
				});
				return nextActiveAccountId;
			},
		}),
		{
			name: "primordium.accounts",
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({
				accounts: state.accounts,
				activeAccountId: state.activeAccountId,
			}),
			onRehydrateStorage: () => (state) => {
				state?.setHasHydrated(true);
				state?.ensureActiveAccount();
			},
		},
	),
);
