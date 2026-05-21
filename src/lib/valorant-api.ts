import { jwtDecode } from 'jwt-decode';

import { getAccountId, type ProfileSnapshot, type StoredAuthTokens, type StoredRiotAccount, type ValorantShard } from '@/lib/account';

export const RIOT_LOGIN_URL =
  'https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1&scope=account%20openid';

const RIOT_CLIENT_PLATFORM =
  'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9';
const FALLBACK_CLIENT_VERSION = '43.0.1.4195386.4190634';
const CURRENCY_IDS = {
  vp: '85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741',
  radianite: 'e59aa87c-4cbf-517a-5983-6e81511be9b7',
  kingdomCredits: '85ca954a-41f2-ce94-9b45-8ca3dd39a00d',
} as const;

let clientVersion: string | null = null;

type EntitlementResponse = {
  entitlements_token: string;
};

type JwtPayload = {
  sub: string;
  exp?: number;
};

type NameServiceResponse = {
  DisplayName?: string;
  Subject: string;
  GameName: string;
  TagLine: string;
}[];

type AccountXPResponse = {
  Progress: {
    Level: number;
    XP: number;
  };
};

type WalletResponse = {
  Balances: Record<string, number>;
};

export class ValorantApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

export function getAccessTokenFromUri(uri: string) {
  const match = uri.match(/access_token=([^&#]+)/);
  if (!match) {
    throw new ValorantApiError('Could not read Riot access token from redirect.');
  }
  return decodeURIComponent(match[1]);
}

export function isAuthFailure(error: unknown) {
  return error instanceof ValorantApiError && (error.status === 401 || error.status === 403);
}

export async function authenticateRiotLogin(accessToken: string, shard: ValorantShard) {
  const decoded = jwtDecode<JwtPayload>(accessToken);
  if (!decoded.sub) {
    throw new ValorantApiError('Riot token did not include a player id.');
  }

  const entitlementsToken = await getEntitlementsToken(accessToken);
  const name = await getPlayerName(accessToken, entitlementsToken, decoded.sub, shard);
  const now = new Date().toISOString();
  const account: StoredRiotAccount = {
    id: getAccountId(decoded.sub, shard),
    puuid: decoded.sub,
    gameName: name.GameName || name.DisplayName || '?',
    tagLine: name.TagLine || '',
    displayName: name.DisplayName || `${name.GameName}#${name.TagLine}`,
    shard,
    status: 'ready',
    createdAt: now,
    updatedAt: now,
  };

  const tokens: StoredAuthTokens = {
    accessToken,
    entitlementsToken,
    savedAt: now,
    expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : undefined,
  };

  return { account, tokens };
}

export async function fetchProfileSnapshot(account: StoredRiotAccount, tokens: StoredAuthTokens): Promise<ProfileSnapshot> {
  const headers = await getAuthorizedHeaders(tokens);
  const [xp, wallet] = await Promise.all([
    riotFetch<AccountXPResponse>(`https://pd.${account.shard}.a.pvp.net/account-xp/v1/players/${account.puuid}`, {
      headers,
    }),
    riotFetch<WalletResponse>(`https://pd.${account.shard}.a.pvp.net/store/v1/wallet/${account.puuid}`, {
      headers,
    }),
  ]);

  return {
    level: xp.Progress.Level,
    xp: xp.Progress.XP,
    balances: {
      vp: wallet.Balances[CURRENCY_IDS.vp] ?? 0,
      radianite: wallet.Balances[CURRENCY_IDS.radianite] ?? 0,
      kingdomCredits: wallet.Balances[CURRENCY_IDS.kingdomCredits] ?? 0,
    },
    fetchedAt: new Date().toISOString(),
  };
}

async function getEntitlementsToken(accessToken: string) {
  const response = await riotFetch<EntitlementResponse>('https://entitlements.auth.riotgames.com/api/token/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({}),
  });
  return response.entitlements_token;
}

async function getPlayerName(accessToken: string, entitlementsToken: string, puuid: string, shard: ValorantShard) {
  const response = await riotFetch<NameServiceResponse>(`https://pd.${shard}.a.pvp.net/name-service/v2/players`, {
    method: 'PUT',
    headers: await getAuthorizedHeaders({ accessToken, entitlementsToken }),
    body: JSON.stringify([puuid]),
  });

  const player = response[0];
  if (!player) {
    throw new ValorantApiError('Riot account did not resolve in the selected Region. Check the Region and try again.');
  }
  return player;
}

async function getAuthorizedHeaders(tokens: Pick<StoredAuthTokens, 'accessToken' | 'entitlementsToken'>) {
  return {
    'Content-Type': 'application/json',
    'X-Riot-ClientPlatform': RIOT_CLIENT_PLATFORM,
    'X-Riot-ClientVersion': await getClientVersion(),
    'X-Riot-Entitlements-JWT': tokens.entitlementsToken,
    Authorization: `Bearer ${tokens.accessToken}`,
  };
}

async function getClientVersion() {
  if (clientVersion) {
    return clientVersion;
  }

  try {
    const response = await fetch('https://valorant-api.com/v1/version');
    if (!response.ok) {
      return FALLBACK_CLIENT_VERSION;
    }
    const data = (await response.json()) as { data?: { riotClientVersion?: string } };
    clientVersion = data.data?.riotClientVersion ?? FALLBACK_CLIENT_VERSION;
    return clientVersion;
  } catch {
    return FALLBACK_CLIENT_VERSION;
  }
}

async function riotFetch<T>(url: string, init: RequestInit) {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    throw new ValorantApiError(error instanceof Error ? error.message : 'Network request failed.');
  }

  if (!response.ok) {
    throw new ValorantApiError(`Riot API request failed (${response.status}).`, response.status);
  }

  return (await response.json()) as T;
}
