import { FavoriteAlertService } from '@/modules/favorite/favorite-alert-service';
import { useFavoriteAlertStore } from '@/modules/favorite/favorite-alert-store';

export type SetFavoriteAlertsResult =
  | { ok: true; enabled: true }
  | { ok: true; enabled: false }
  | { ok: false; reason: 'permissionDenied' };

export const FavoriteAlertController = {
  async setEnabled(enabled: boolean): Promise<SetFavoriteAlertsResult> {
    if (enabled) {
      const allowed = await FavoriteAlertService.requestPermission();
      if (!allowed) {
        return { ok: false, reason: 'permissionDenied' };
      }

      useFavoriteAlertStore.getState().setEnabled(true);
      await FavoriteAlertService.registerTask();
      return { ok: true, enabled: true };
    }

    useFavoriteAlertStore.getState().setEnabled(false);
    await FavoriteAlertService.unregisterTask();
    return { ok: true, enabled: false };
  },

  async runCheck(): Promise<void> {
    const enabled = useFavoriteAlertStore.getState().enabled;
    if (!enabled) {
      return;
    }
    await FavoriteAlertService.runCheck();
  },

  async syncTaskRegistration(): Promise<void> {
    await FavoriteAlertService.syncTaskRegistration();
  },
};
