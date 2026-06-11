import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CosmeticCatalogItem } from '@/modules/catalog/catalog-type';

export type FavoriteItem = Pick<
  CosmeticCatalogItem,
  'id' | 'itemType' | 'title' | 'imageUrl' | 'rarity'
> & {
  favoritedAt: string;
};

type FavoriteStore = {
  favoritesById: Record<string, FavoriteItem>;
  addFavorite: (item: CosmeticCatalogItem) => void;
  removeFavorite: (itemId: string) => void;
  toggleFavorite: (item: CosmeticCatalogItem) => void;
};

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set) => ({
      favoritesById: {},
      addFavorite: (item) => {
        set((state) => ({
          favoritesById: {
            ...state.favoritesById,
            [item.id]: toFavoriteItem(item),
          },
        }));
      },
      removeFavorite: (itemId) => {
        set((state) => {
          const { [itemId]: _removed, ...favoritesById } = state.favoritesById;
          return { favoritesById };
        });
      },
      toggleFavorite: (item) => {
        set((state) => {
          if (state.favoritesById[item.id]) {
            const { [item.id]: _removed, ...favoritesById } = state.favoritesById;
            return { favoritesById };
          }

          return {
            favoritesById: {
              ...state.favoritesById,
              [item.id]: toFavoriteItem(item),
            },
          };
        });
      },
    }),
    {
      name: 'primordium.favorites',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

function toFavoriteItem(item: CosmeticCatalogItem): FavoriteItem {
  return {
    id: item.id,
    itemType: item.itemType,
    title: item.title,
    imageUrl: item.imageUrl,
    rarity: item.rarity,
    favoritedAt: new Date().toISOString(),
  };
}
