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
};

export type StoredAuthTokens = {
  accessToken: string;
  entitlementsToken: string;
  savedAt: string;
  expiresAt?: string;
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
