import { getFavoriteOfferMatches } from '@/lib/favorite-target';
import type { StoreAlertOfferSnapshot } from '@/lib/riot-storefront';

type FavoriteSnapshot = {
  title: string;
};

type FavoriteStoreAlertDecisionInput = {
  offers: StoreAlertOfferSnapshot;
  favoritesById: Record<string, FavoriteSnapshot>;
  lastNotifiedResetKey?: string;
};

export type FavoriteStoreAlertDecision = {
  resetKey: string;
  title: string;
  body: string;
};

export async function getFavoriteStoreAlertDecision({
  offers,
  favoritesById,
  lastNotifiedResetKey,
}: FavoriteStoreAlertDecisionInput): Promise<FavoriteStoreAlertDecision | null> {
  const resetKey = getStoreAlertResetKey(offers);
  if (lastNotifiedResetKey === resetKey) {
    return null;
  }

  const matches = await getFavoriteOfferMatches(
    [...offers.dailyOffers, ...offers.accessoryOffers],
    favoritesById,
  );
  if (matches.length === 0) {
    return null;
  }

  return {
    resetKey,
    title: matches.length === 1 ? 'Favorite item in Store' : 'Favorite items in Store',
    body: formatFavoriteStoreAlertBody(matches.map((match) => match.title)),
  };
}

function getStoreAlertResetKey(offers: StoreAlertOfferSnapshot) {
  return `${getResetPeriodKey(offers.dailyResetAt)}.${getResetPeriodKey(offers.accessoryResetAt)}`;
}

function getResetPeriodKey(resetAt: string) {
  return new Date(resetAt).toISOString().slice(0, 13);
}

function formatFavoriteStoreAlertBody(names: string[]) {
  if (names.length === 1) {
    return `${names[0]} is in your Store.`;
  }

  const [first, second] = names;
  if (names.length === 2) {
    return `${first} and ${second} are in your Store.`;
  }

  return `${first}, ${second} +${names.length - 2} more are in your Store.`;
}
