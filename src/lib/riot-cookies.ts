import CookieManager from '@preeternal/react-native-cookie-manager';
import { Platform } from 'react-native';

export async function clearRiotCookies() {
  try {
    if (Platform.OS === 'ios') {
      await Promise.allSettled([CookieManager.clearAll(false), CookieManager.clearAll(true)]);
      return;
    }

    await CookieManager.clearAll();
    if (Platform.OS === 'android') {
      await CookieManager.removeSessionCookies();
      await CookieManager.flush();
    }
  } catch {
    // Login also uses incognito WebView; cookie clearing is a best-effort guardrail.
  }
}
