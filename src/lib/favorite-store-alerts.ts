import * as BackgroundTask from 'expo-background-task';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

import { getCanonicalCosmeticCatalogItem } from '@/lib/valorant-store-assets';
import { fetchStoreAlertOffersWithExistingTokens } from '@/lib/valorant-api';
import { useAccountStore } from '@/stores/account-store';
import { useFavoriteStoreAlertStore } from '@/stores/favorite-store-alert-store';
import { useFavoriteStore } from '@/stores/favorite-store';

export const FAVORITE_STORE_ALERT_TASK = 'primordium.favorite-store-alert';
const FAVORITE_STORE_ALERT_CHANNEL = 'favorite-store-alerts';
const CHECK_INTERVAL_MINUTES = 24 * 60;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

TaskManager.defineTask(FAVORITE_STORE_ALERT_TASK, async () => {
  await runFavoriteStoreAlertCheck();
  return BackgroundTask.BackgroundTaskResult.Success;
});

export async function registerFavoriteStoreAlertTask() {
  await ensureFavoriteStoreAlertChannel();
  const registered = await TaskManager.isTaskRegisteredAsync(FAVORITE_STORE_ALERT_TASK);
  if (!registered) {
    await BackgroundTask.registerTaskAsync(FAVORITE_STORE_ALERT_TASK, {
      minimumInterval: CHECK_INTERVAL_MINUTES,
    });
  }
}

export async function unregisterFavoriteStoreAlertTask() {
  const registered = await TaskManager.isTaskRegisteredAsync(FAVORITE_STORE_ALERT_TASK);
  if (registered) {
    await BackgroundTask.unregisterTaskAsync(FAVORITE_STORE_ALERT_TASK);
  }
}

export async function ensureFavoriteStoreAlertChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(FAVORITE_STORE_ALERT_CHANNEL, {
    name: 'Favorite store alerts',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function requestFavoriteStoreAlertPermission() {
  await ensureFavoriteStoreAlertChannel();
  const existing = await Notifications.getPermissionsAsync();
  if (allowsNotifications(existing)) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: false,
    },
  });
  return allowsNotifications(requested);
}

export async function syncFavoriteStoreAlertTaskRegistration() {
  const enabled = useFavoriteStoreAlertStore.getState().enabled;
  if (enabled) {
    await registerFavoriteStoreAlertTask();
  } else {
    await unregisterFavoriteStoreAlertTask();
  }
}

export async function runFavoriteStoreAlertCheck() {
  try {
    await hydrateStores();
    const alertStore = useFavoriteStoreAlertStore.getState();
    if (!alertStore.enabled) return;

    const accountState = useAccountStore.getState();
    const account = accountState.accounts.find((item) => item.id === accountState.activeAccountId);
    if (!account) return;

    const favoritesById = useFavoriteStore.getState().favoritesById;
    if (Object.keys(favoritesById).length === 0) return;

    const offers = await fetchStoreAlertOffersWithExistingTokens(account);
    if (!offers) return;

    const resetKey = `${getResetPeriodKey(offers.dailyResetAt)}.${getResetPeriodKey(offers.accessoryResetAt)}`;
    if (alertStore.lastNotifiedByAccountId[account.id] === resetKey) return;

    const matches = await getFavoriteOfferNames(
      [...offers.dailyOffers, ...offers.accessoryOffers],
      favoritesById,
    );
    if (matches.length === 0) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: matches.length === 1 ? 'Favorite item in Store' : 'Favorite items in Store',
        body: formatFavoriteStoreAlertBody(matches),
        data: { url: '/home' },
      },
      trigger: null,
    });
    alertStore.setLastNotified(account.id, resetKey);
  } catch {
    // Favorite Store Alerts are best-effort. Background failures stay silent.
  }
}

function allowsNotifications(status: Notifications.NotificationPermissionsStatus) {
  return status.granted || status.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

async function hydrateStores() {
  await Promise.allSettled([
    useAccountStore.persist.rehydrate(),
    useFavoriteStore.persist.rehydrate(),
    useFavoriteStoreAlertStore.persist.rehydrate(),
  ]);
}

async function getFavoriteOfferNames(
  offers: { title: string; itemAssetId?: string }[],
  favoritesById: Record<string, { title: string }>,
) {
  const names: string[] = [];
  const seen = new Set<string>();

  for (const offer of offers) {
    if (!offer.itemAssetId) continue;
    const catalogItem = await getCanonicalCosmeticCatalogItem(offer.itemAssetId);
    const favorite = catalogItem ? favoritesById[catalogItem.id] : favoritesById[offer.itemAssetId];
    if (!favorite || seen.has(favorite.title)) continue;

    seen.add(favorite.title);
    names.push(favorite.title);
  }

  return names;
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

function getResetPeriodKey(resetAt: string) {
  return new Date(resetAt).toISOString().slice(0, 13);
}
