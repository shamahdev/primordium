export type CatalogFilter = 'all' | CosmeticCatalogItem['itemType'];
export type CatalogMode = 'all' | 'favorites';

export type CatalogSection = {
  key: CatalogFilter;
  title: string;
  data: CatalogListItem[];
};

export type CatalogListItem = CosmeticCatalogItem & {
  searchText: string;
  favoritedAt?: string;
};

export type StoreAsset = {
  title: string;
  imageUrl?: string;
  largeImageUrl?: string;
  wideImageUrl?: string;
  animationUrl?: string;
  rarity?: 'select' | 'deluxe' | 'premium' | 'exclusive' | 'ultra';
};

export type CosmeticCatalogItem = StoreAsset & {
  id: string;
  itemType: 'skin' | 'buddy' | 'spray' | 'card' | 'title' | 'flex';
};

export type SkinDetailChroma = {
  uuid: string;
  displayName: string;
  displayIcon?: string;
  fullRender?: string;
  swatch?: string;
};

export type SkinDetailLevel = {
  uuid: string;
  displayName: string;
  displayIcon?: string;
  streamedVideo?: string;
  levelItem?: string;
};

export type SkinDetailAsset = {
  uuid: string;
  title: string;
  displayIcon?: string;
  rarity?: StoreAsset['rarity'];
  chromas: SkinDetailChroma[];
  levels: SkinDetailLevel[];
};

export type BundleAsset = {
  uuid: string;
  displayName: string;
  displayIcon?: string | null;
  displayIcon2?: string | null;
  verticalPromoImage?: string | null;
};

export type SkinAsset = {
  uuid: string;
  displayName: string;
  contentTierUuid?: string | null;
  displayIcon?: string | null;
  chromas: {
    uuid: string;
    displayName: string;
    displayIcon?: string | null;
    fullRender?: string | null;
    swatch?: string | null;
  }[];
  levels: {
    uuid: string;
    displayName: string;
    displayIcon?: string | null;
    streamedVideo?: string | null;
    levelItem?: string | null;
  }[];
};

export type BuddyAsset = {
  uuid: string;
  displayName: string;
  displayIcon?: string | null;
  levels: {
    uuid: string;
    displayIcon?: string | null;
  }[];
};

export type PlayerCardAsset = {
  uuid: string;
  displayName: string;
  displayIcon?: string | null;
  largeArt?: string | null;
  wideArt?: string | null;
};

export type SprayAsset = {
  uuid: string;
  displayName: string;
  displayIcon?: string | null;
  fullIcon?: string | null;
  fullTransparentIcon?: string | null;
  animationGif?: string | null;
};

export type PlayerTitleAsset = {
  uuid: string;
  displayName?: string | null;
  titleText?: string | null;
};

export type ValorantApiResponse<T> = {
  data?: T[];
};

export type ItemAssetCatalog = {
  items: Map<string, StoreAsset>;
  skinDetails: Map<string, SkinDetailAsset>;
  catalog: CosmeticCatalogItem[];
  canonicalItems: Map<string, CosmeticCatalogItem>;
};
