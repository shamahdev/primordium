export const VALORANT_SHARDS = [
  { id: 'eu', label: 'Europe' },
  { id: 'na', label: 'North America' },
  { id: 'ap', label: 'Asia Pacific' },
  { id: 'kr', label: 'Korea' },
] as const;

export type ValorantShard = (typeof VALORANT_SHARDS)[number]['id'];

export type AccountStatus = 'ready' | 'needsReauth';

export type ProfileSnapshot = {
  level: number;
  xp: number;
  balances: {
    vp: number;
    radianite: number;
    kingdomCredits: number;
  };
  fetchedAt: string;
};

export type StoreCurrency = 'vp' | 'kingdomCredits' | 'unknown';

export type StoreItemRarity = 'select' | 'deluxe' | 'premium' | 'exclusive' | 'ultra';

export type StorePrice = {
  currency: StoreCurrency;
  amount: number;
  originalAmount?: number;
  discountPercent?: number;
};

export type StoreItem = {
  id: string;
  title: string;
  imageUrl?: string | number;
  itemType: 'skin' | 'buddy' | 'spray' | 'card' | 'title' | 'flex' | 'unknown';
  rarity?: StoreItemRarity;
  price: StorePrice;
  itemAssetId?: string;
};

export type StoreCarouselCard = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl?: string | number;
  section: 'featuredBundle' | 'nightMarket';
  expiresAt: string;
  items: StoreItem[];
};

export type StoreSnapshot = {
  cards: StoreCarouselCard[];
  dailyOffers: StoreItem[];
  dailyResetAt: string;
  accessoryOffers: StoreItem[];
  accessoryResetAt: string;
  fetchedAt: string;
};

export type StoredRiotAccount = {
  id: string;
  puuid: string;
  gameName: string;
  tagLine: string;
  displayName: string;
  shard: ValorantShard;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
  profileSnapshot?: ProfileSnapshot;
  storeSnapshot?: StoreSnapshot;
};

export type StoredAuthTokens = {
  accessToken: string;
  entitlementsToken: string;
  savedAt: string;
  expiresAt?: string;
};

export type StoredRiotCookie = {
  name: string;
  value: string;
  domain: string;
  path?: string;
  expires?: string;
  secure?: boolean;
  httpOnly?: boolean;
};

export function isValorantShard(value: unknown): value is ValorantShard {
  return typeof value === 'string' && VALORANT_SHARDS.some((shard) => shard.id === value);
}

export function getAccountId(puuid: string, shard: ValorantShard) {
  return `${puuid}.${shard}`;
}

export function getAccountLabel(account: Pick<StoredRiotAccount, 'displayName' | 'gameName' | 'tagLine' | 'puuid'>) {
  if (account.gameName && account.tagLine) {
    return `${account.gameName}#${account.tagLine}`;
  }
  if (account.displayName) {
    return account.displayName;
  }
  return account.puuid.slice(0, 8);
}
