import type { StoreAlertOfferSnapshot } from '@/modules/store/store-type';
import { FavoriteService } from '@/modules/favorite/favorite-service';
import type { FavoriteSnapshot } from '@/modules/favorite/favorite-type';

type FavoriteAlertDecisionInput = {
  offers: StoreAlertOfferSnapshot;
  favoritesById: Record<string, FavoriteSnapshot>;
  lastNotifiedResetKey?: string;
};

export type FavoriteAlertDecision = {
  resetKey: string;
  title: string;
  body: string;
};

export async function getFavoriteAlertDecision({
  offers,
  favoritesById,
  lastNotifiedResetKey,
}: FavoriteAlertDecisionInput): Promise<FavoriteAlertDecision | null> {
  const resetKey = getStoreAlertResetKey(offers);
  if (lastNotifiedResetKey === resetKey) {
    return null;
  }

  const matches = await FavoriteService.getFavoriteOfferMatches(
    [...offers.dailyOffers, ...offers.accessoryOffers],
    favoritesById,
  );
  if (matches.length === 0) {
    return null;
  }

  return {
    resetKey,
    title: matches.length === 1 ? 'Favorite item in Store' : 'Favorite items in Store',
    body: formatAlertBody(matches.map((match) => match.title)),
  };
}

function getStoreAlertResetKey(offers: StoreAlertOfferSnapshot) {
  return `${getResetPeriodKey(offers.dailyResetAt)}.${getResetPeriodKey(offers.accessoryResetAt)}`;
}

function getResetPeriodKey(resetAt: string) {
  return new Date(resetAt).toISOString().slice(0, 13);
}

function formatAlertBody(names: string[]) {
  if (names.length === 1) {
    return `${names[0]} is in your Store.`;
  }

  const [first, second] = names;
  if (names.length === 2) {
    return `${first} and ${second} are in your Store.`;
  }

  return `${first}, ${second} +${names.length - 2} more are in your Store.`;
}
