import { jwtDecode } from 'jwt-decode';

import { getAccountId, type ProfileSnapshot, type StoreCarouselCard, type StoreItem, type StorePrice, type StoreSnapshot, type StoredAuthTokens, type StoredRiotAccount, type ValorantShard } from '@/lib/account';
import { AuthRecoveryRequired, isAuthRecoveryRequired } from '@/lib/auth-recovery';
import { log } from '@/lib/logger';
import { refreshStoredRiotSession } from '@/lib/riot-session-refresh';
import { deleteAuthCookies, deleteAuthMaterial, getAuthTokens } from '@/lib/secure-auth-store';
import { getBundleAsset, getStoreItemAsset } from '@/lib/valorant-store-assets';
import { useAccountStore } from '@/stores/account-store';

const RIOT_CLIENT_PLATFORM =
  'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9';
const FALLBACK_CLIENT_VERSION = '43.0.1.4195386.4190634';
const TOKEN_REFRESH_WINDOW_MS = 5 * 60 * 1000;
const CURRENCY_IDS = {
  vp: '85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741',
  radianite: 'e59aa87c-4cbf-517a-5983-6e81511be9b7',
  kingdomCredits: '85ca954a-41f2-ce94-9b45-8ca3dd39a00d',
} as const;

const ITEM_TYPE_IDS = {
  skinLevel: 'e7c63390-eda7-46e0-bb7a-a6abdacd2433',
  skinChroma: '3ad1b2b2-acdb-4524-852f-954a76ddae0a',
  buddy: 'dd3bf334-87f3-40bd-b043-682a57a8dc3a',
  spray: 'd5f120f8-ff8c-4aac-92ea-f2b5acbe9475',
  playerCard: '3f296c07-64c3-494c-923b-fe692a4fa1bd',
  playerTitle: 'de7caa6b-adf7-4588-bbd1-143831e786c6',
  flex: '03a572de-4234-31ed-d344-ababa488f981',
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

type StoreReward = {
  ItemTypeID: string;
  ItemID: string;
  Quantity: number;
};

type StoreOffer = {
  OfferID: string;
  Cost: Record<string, number>;
  Rewards: StoreReward[];
};

type StorefrontResponse = {
  FeaturedBundle: {
    Bundle: {
      ID: string;
      DataAssetID: string;
      Items: {
        Item: {
          ItemTypeID: string;
          ItemID: string;
          Amount: number;
        };
        BasePrice: number;
        CurrencyID: string;
        DiscountPercent: number;
        DiscountedPrice: number;
      }[];
    };
    BundleRemainingDurationInSeconds: number;
  };
  SkinsPanelLayout: {
    SingleItemStoreOffers: StoreOffer[];
    SingleItemOffersRemainingDurationInSeconds: number;
  };
  AccessoryStore: {
    AccessoryStoreOffers: {
      Offer: StoreOffer;
    }[];
    AccessoryStoreRemainingDurationInSeconds: number;
  };
  BonusStore?: {
    BonusStoreOffers: {
      BonusOfferID: string;
      Offer: StoreOffer;
      DiscountPercent: number;
      DiscountCosts: Record<string, number>;
    }[];
    BonusStoreRemainingDurationInSeconds: number;
  };
};

export class ValorantApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
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

export async function fetchProfileSnapshot(account: StoredRiotAccount): Promise<ProfileSnapshot> {
  return withAuthorizedTokens(account, (tokens) => fetchProfileSnapshotWithTokens(account, tokens));
}

export async function fetchStoreSnapshot(account: StoredRiotAccount): Promise<StoreSnapshot> {
  return withAuthorizedTokens(account, (tokens) => fetchStoreSnapshotWithTokens(account, tokens));
}

export async function ensureAccountSession(account: StoredRiotAccount) {
  await getValidAuthTokens(account);
}

async function fetchProfileSnapshotWithTokens(
  account: StoredRiotAccount,
  tokens: StoredAuthTokens,
): Promise<ProfileSnapshot> {
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

async function fetchStoreSnapshotWithTokens(
  account: StoredRiotAccount,
  tokens: StoredAuthTokens,
): Promise<StoreSnapshot> {
  const headers = await getAuthorizedHeaders(tokens);
  const storefront = await riotFetch<StorefrontResponse>(
    `https://pd.${account.shard}.a.pvp.net/store/v3/storefront/${account.puuid}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    },
  );

  const [featuredBundleCard, nightMarketCard, dailyOffers, accessoryOffers] = await Promise.all([
    buildFeaturedBundleCard(storefront.FeaturedBundle),
    storefront.BonusStore ? buildNightMarketCard(storefront.BonusStore) : Promise.resolve<StoreCarouselCard | null>(null),
    Promise.all(
      storefront.SkinsPanelLayout.SingleItemStoreOffers.map((offer) =>
        buildStoreItem({
          id: offer.OfferID,
          reward: offer.Rewards[0],
          cost: offer.Cost,
          itemType: 'skin',
        }),
      ),
    ),
    Promise.all(
      storefront.AccessoryStore.AccessoryStoreOffers.map(({ Offer: offer }) =>
        buildStoreItem({
          id: offer.OfferID,
          reward: offer.Rewards[0],
          cost: offer.Cost,
        }),
      ),
    ),
  ]);

  return {
    cards: [featuredBundleCard, nightMarketCard].filter((card): card is StoreCarouselCard => card !== null),
    dailyOffers,
    dailyResetAt: getExpiresAt(storefront.SkinsPanelLayout.SingleItemOffersRemainingDurationInSeconds),
    accessoryOffers,
    accessoryResetAt: getExpiresAt(storefront.AccessoryStore.AccessoryStoreRemainingDurationInSeconds),
    fetchedAt: new Date().toISOString(),
  };
}

async function withAuthorizedTokens<T>(
  account: StoredRiotAccount,
  request: (tokens: StoredAuthTokens) => Promise<T>,
): Promise<T> {
  log.api.debug('withAuthorizedTokens: getting tokens', { accountId: account.id });
  const tokens = await getValidAuthTokens(account);
  try {
    return await request(tokens);
  } catch (error) {
    if (!isAuthFailure(error)) {
      throw error;
    }
    log.api.warn('withAuthorizedTokens: first attempt auth failure, refreshing', { accountId: account.id });
  }

  const refreshedTokens = await refreshAuthTokens(account, true);
  try {
    return await request(refreshedTokens);
  } catch (error) {
    if (isAuthFailure(error)) {
      log.api.error('withAuthorizedTokens: second attempt auth failure, rejecting', { accountId: account.id });
      await rejectStoredAuth(account.id, 'cookieReauthFailed');
    }
    throw error;
  }
}

async function getValidAuthTokens(account: StoredRiotAccount) {
  if (account.status === 'needsReauth') {
    throw new AuthRecoveryRequired(account.id, 'missingTokens', 'interactiveLoginRequired', 'Sign in again.');
  }

  const tokens = await getAuthTokens(account.id);
  if (!tokens) {
    return refreshAuthTokens(account, false);
  }

  if (shouldRefreshTokens(tokens)) {
    return refreshAuthTokens(account, false);
  }

  return tokens;
}

async function refreshAuthTokens(account: StoredRiotAccount, force: boolean) {
  log.auth.info('refreshAuthTokens: starting', { accountId: account.id, force });
  try {
    const result = await refreshStoredRiotSession(account);
    log.auth.info('refreshAuthTokens: session refreshed OK');
    const authenticated = await authenticateRiotLogin(result.accessToken, account.shard);
    if (authenticated.account.puuid !== account.puuid) {
      log.auth.error('refreshAuthTokens: identity mismatch!', { expected: account.puuid, got: authenticated.account.puuid });
      await rejectStoredAuth(account.id, 'identityMismatch');
    }
    await useAccountStore.getState().saveAuthenticatedAccount(authenticated.account, authenticated.tokens, result.cookies);
    log.auth.info('refreshAuthTokens: account saved');
    return authenticated.tokens;
  } catch (error) {
    log.auth.error('refreshAuthTokens: FAILED', {
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      isAuthRecovery: isAuthRecoveryRequired(error),
    });
    if (isAuthRecoveryRequired(error)) {
      if (error.recoveryKind === 'interactiveLoginRequired') {
        if (error.reason === 'cookieReauthFailed' || error.reason === 'missingCookies') {
          await deleteAuthCookies(account.id);
        }
        useAccountStore.getState().markNeedsReauth(account.id);
      }
      throw error;
    }
    if (isAuthFailure(error)) {
      await rejectStoredAuth(account.id, 'cookieReauthFailed');
    }
    if (!force && error instanceof TypeError) {
      throw new AuthRecoveryRequired(
        account.id,
        'networkUnavailable',
        'temporaryAuthUnavailable',
        'Network unavailable. Try again.',
      );
    }
    throw error;
  }
}

function shouldRefreshTokens(tokens: StoredAuthTokens) {
  if (!tokens.expiresAt) {
    return false;
  }
  return new Date(tokens.expiresAt).getTime() - Date.now() <= TOKEN_REFRESH_WINDOW_MS;
}

async function rejectStoredAuth(accountId: string, reason: 'cookieReauthFailed' | 'identityMismatch') {
  await deleteAuthMaterial(accountId);
  useAccountStore.getState().markNeedsReauth(accountId);
  throw new AuthRecoveryRequired(accountId, reason, 'interactiveLoginRequired', 'Sign in again.');
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

async function buildFeaturedBundleCard(featuredBundle: StorefrontResponse['FeaturedBundle']): Promise<StoreCarouselCard> {
  const bundleAsset = await getBundleAsset(featuredBundle.Bundle.DataAssetID || featuredBundle.Bundle.ID);
  const items = await Promise.all(
    featuredBundle.Bundle.Items.map((item, index) =>
      buildStoreItem({
        id: `${featuredBundle.Bundle.ID}.${index}`,
        reward: { ItemID: item.Item.ItemID, ItemTypeID: item.Item.ItemTypeID, Quantity: item.Item.Amount },
        cost: { [item.CurrencyID]: item.DiscountedPrice },
        originalAmount: item.BasePrice,
        discountPercent: item.DiscountPercent,
      }),
    ),
  );

  return {
    id: featuredBundle.Bundle.ID,
    title: bundleAsset?.title ?? 'Featured Bundle',
    subtitle: `${items.length} item${items.length === 1 ? '' : 's'}`,
    imageUrl: bundleAsset?.imageUrl ?? items[0]?.imageUrl,
    section: 'featuredBundle',
    expiresAt: getExpiresAt(featuredBundle.BundleRemainingDurationInSeconds),
    items,
  };
}

async function buildNightMarketCard(bonusStore: NonNullable<StorefrontResponse['BonusStore']>) {
  const items = await Promise.all(
    bonusStore.BonusStoreOffers.map((offer) =>
      buildStoreItem({
        id: offer.BonusOfferID,
        reward: offer.Offer.Rewards[0],
        cost: offer.DiscountCosts,
        originalAmount: getPrimaryCostAmount(offer.Offer.Cost),
        discountPercent: offer.DiscountPercent,
        itemType: 'skin',
      }),
    ),
  );

  return {
    id: 'night-market',
    title: 'Night Market',
    subtitle: `${items.length} offer${items.length === 1 ? '' : 's'}`,
    section: 'nightMarket' as const,
    expiresAt: getExpiresAt(bonusStore.BonusStoreRemainingDurationInSeconds),
    items,
  };
}

async function buildStoreItem(params: {
  id: string;
  reward?: StoreReward;
  cost: Record<string, number>;
  originalAmount?: number;
  discountPercent?: number;
  itemType?: StoreItem['itemType'];
}): Promise<StoreItem> {
  const resolvedItemType = params.itemType ?? getItemTypeFromReward(params.reward);

  const asset = params.reward ? await getStoreItemAsset(params.reward.ItemID) : undefined;

  return {
    id: params.id,
    title: asset?.title ?? getFallbackItemTitle(resolvedItemType),
    imageUrl: asset?.imageUrl,
    itemType: resolvedItemType,
    rarity: asset?.rarity,
    price: buildStorePrice(params.cost, params.originalAmount, params.discountPercent),
    itemAssetId: params.reward?.ItemID,
  };
}

function getItemTypeFromReward(reward?: StoreReward): StoreItem['itemType'] {
  if (!reward) {
    return 'unknown';
  }

  if (reward.ItemTypeID === ITEM_TYPE_IDS.skinLevel || reward.ItemTypeID === ITEM_TYPE_IDS.skinChroma) {
    return 'skin';
  }
  if (reward.ItemTypeID === ITEM_TYPE_IDS.buddy) {
    return 'buddy';
  }
  if (reward.ItemTypeID === ITEM_TYPE_IDS.spray) {
    return 'spray';
  }
  if (reward.ItemTypeID === ITEM_TYPE_IDS.playerCard) {
    return 'card';
  }
  if (reward.ItemTypeID === ITEM_TYPE_IDS.playerTitle) {
    return 'title';
  }
  if (reward.ItemTypeID === ITEM_TYPE_IDS.flex) {
    return 'flex';
  }

  return 'unknown';
}

function getFallbackItemTitle(itemType: StoreItem['itemType']) {
  const labels: Record<StoreItem['itemType'], string> = {
    skin: 'Unknown skin',
    buddy: 'Unknown buddy',
    spray: 'Unknown spray',
    card: 'Unknown card',
    title: 'Unknown title',
    flex: 'Unknown flex',
    unknown: 'Unknown item',
  };

  return labels[itemType];
}

function buildStorePrice(
  cost: Record<string, number>,
  originalAmount?: number,
  discountPercent?: number,
): StorePrice {
  const [currencyId, amount] = Object.entries(cost)[0] ?? [undefined, 0];

  return {
    currency: getStoreCurrency(currencyId),
    amount,
    originalAmount: originalAmount && originalAmount > amount ? originalAmount : undefined,
    discountPercent: discountPercent && discountPercent > 0 ? discountPercent : undefined,
  };
}

function getPrimaryCostAmount(cost: Record<string, number>) {
  return Object.values(cost)[0];
}

function getStoreCurrency(currencyId?: string): StorePrice['currency'] {
  if (currencyId === CURRENCY_IDS.vp) {
    return 'vp';
  }

  if (currencyId === CURRENCY_IDS.kingdomCredits) {
    return 'kingdomCredits';
  }

  return 'unknown';
}

function getExpiresAt(durationSeconds: number) {
  return new Date(Date.now() + durationSeconds * 1000).toISOString();
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
