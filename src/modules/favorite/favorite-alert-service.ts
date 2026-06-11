import * as BackgroundTask from 'expo-background-task';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

import { useAccountStore } from '@/modules/account/account-store';
import { useFavoriteStore } from '@/modules/favorite/favorite-store';
import { useFavoriteAlertStore } from '@/modules/favorite/favorite-alert-store';
import { StoreService } from '@/modules/store/store-service';
import { getFavoriteAlertDecision } from '@/modules/favorite/helpers/get-favorite-alert-decision';
import { type Account } from '@/modules/account/account-type';
import { type FavoriteSnapshot } from '@/modules/favorite/favorite-type';
import { type StoreAlertOfferSnapshot } from '@/modules/store/store-type';
import {
  FAVORITE_ALERT_TASK,
  FAVORITE_ALERT_CHANNEL,
  FAVORITE_ALERT_CHECK_INTERVAL_MINUTES,
} from '@/modules/favorite/favorite-alert-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

TaskManager.defineTask(FAVORITE_ALERT_TASK, async () => {
  await FavoriteAlertService.runCheck();
  return BackgroundTask.BackgroundTaskResult.Success;
});

export const FavoriteAlertService = {
  registerTask,
  unregisterTask,
  ensureChannel,
  requestPermission,
  syncTaskRegistration,
  runCheck,
};

async function registerTask() {
  await ensureChannel();
  const registered = await TaskManager.isTaskRegisteredAsync(FAVORITE_ALERT_TASK);
  if (!registered) {
    await BackgroundTask.registerTaskAsync(FAVORITE_ALERT_TASK, {
      minimumInterval: FAVORITE_ALERT_CHECK_INTERVAL_MINUTES,
    });
  }
}

async function unregisterTask() {
  const registered = await TaskManager.isTaskRegisteredAsync(FAVORITE_ALERT_TASK);
  if (registered) {
    await BackgroundTask.unregisterTaskAsync(FAVORITE_ALERT_TASK);
  }
}

async function ensureChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(FAVORITE_ALERT_CHANNEL, {
    name: 'Favorite store alerts',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

async function requestPermission() {
  await ensureChannel();
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

async function syncTaskRegistration() {
  const enabled = useFavoriteAlertStore.getState().enabled;
  if (enabled) {
    await registerTask();
  } else {
    await unregisterTask();
  }
}

async function runCheck() {
  try {
    await hydrateStores();
    const alertStore = useFavoriteAlertStore.getState();
    const accountState = useAccountStore.getState();
    const favoriteStore = useFavoriteStore.getState();
    const activeAccount = accountState.accounts.find((item) => item.id === accountState.activeAccountId);

    await runAlertOrchestration({
      alertEnabled: alertStore.enabled,
      activeAccount,
      favoritesById: favoriteStore.favoritesById,
      lastNotifiedByAccountId: alertStore.lastNotifiedByAccountId,
      fetchStoreAlert: StoreService.fetchStoreAlert,
      onAlert: async (accountId, resetKey, title, body) => {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: { url: '/home' },
          },
          trigger: null,
        });
        alertStore.setLastNotified(accountId, resetKey);
      },
    });
  } catch {
    // Favorite Store Alerts are best-effort. Background failures stay silent.
  }
}

async function runAlertOrchestration(input: {
  alertEnabled: boolean;
  activeAccount: Account | undefined;
  favoritesById: Record<string, FavoriteSnapshot>;
  lastNotifiedByAccountId: Record<string, string>;
  fetchStoreAlert: (account: Account) => Promise<StoreAlertOfferSnapshot>;
  onAlert: (accountId: string, resetKey: string, title: string, body: string) => Promise<void>;
}) {
  if (!input.alertEnabled) return;
  if (!input.activeAccount) return;

  const { activeAccount, favoritesById, lastNotifiedByAccountId, fetchStoreAlert, onAlert } = input;
  if (Object.keys(favoritesById).length === 0) return;

  const offers = await fetchStoreAlert(activeAccount);
  const decision = await getFavoriteAlertDecision({
    offers,
    favoritesById,
    lastNotifiedResetKey: lastNotifiedByAccountId[activeAccount.id],
  });
  if (!decision) return;

  await onAlert(activeAccount.id, decision.resetKey, decision.title, decision.body);
}

function allowsNotifications(status: Notifications.NotificationPermissionsStatus) {
  return status.granted || status.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

async function hydrateStores() {
  await Promise.allSettled([
    useAccountStore.persist.rehydrate(),
    useFavoriteStore.persist.rehydrate(),
    useFavoriteAlertStore.persist.rehydrate(),
  ]);
}
