import * as BackgroundTask from 'expo-background-task';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

import { getFavoriteStoreAlertDecision } from '@/lib/favorite-store-alert-core';
import { fetchStoreAlertOffersWithExistingTokens } from '@/lib/valorant-api';
import { useAccountStore } from '@/stores/account-store';
import { useFavoriteStore } from '@/stores/favorite-store';
import { useFavoriteStoreAlertStore } from '@/stores/favorite-store-alert-store';

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

    const decision = await getFavoriteStoreAlertDecision({
      offers,
      favoritesById,
      lastNotifiedResetKey: alertStore.lastNotifiedByAccountId[account.id],
    });
    if (!decision) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: decision.title,
        body: decision.body,
        data: { url: '/home' },
      },
      trigger: null,
    });
    alertStore.setLastNotified(account.id, decision.resetKey);
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
