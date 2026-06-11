import CookieManager from '@preeternal/react-native-cookie-manager';
import { Platform } from 'react-native';

import { ACCOUNT_RIOT_AUTH_COOKIE_URLS, ACCOUNT_RIOT_AUTH_DOMAINS } from '@/modules/account/account-constants';
import type { AccountCookie } from '@/modules/account/account-type';

type NativeCookie = Partial<AccountCookie> & {
  name?: string;
  value?: string;
};

export async function clearAccountCookies() {
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
    // Auth flows use the native cookie jar as scratch space; clearing is a best-effort guardrail.
  }
}

export async function captureAccountCookies() {
  const results = await Promise.all(
    ACCOUNT_RIOT_AUTH_COOKIE_URLS.map(async (url) => {
      const hostname = new URL(url).hostname;
      return { hostname, jars: await getCookieJars(url) };
    }),
  );
  const cookies = new Map<string, AccountCookie>();
  for (const { hostname, jars } of results) {
    for (const jar of jars) {
      for (const [fallbackName, cookie] of Object.entries(jar)) {
        const normalized = normalizeCookie(cookie, fallbackName, hostname);
        if (!normalized || !isRiotAuthDomain(normalized.domain)) {
          continue;
        }
        cookies.set(`${normalized.domain}|${normalized.path ?? '/'}|${normalized.name}`, normalized);
      }
    }
  }
  return [...cookies.values()];
}

export async function injectAccountCookies(cookies: AccountCookie[]) {
  const tasks: Promise<void>[] = [];
  for (const cookie of cookies) {
    if (isRiotAuthDomain(cookie.domain)) {
      tasks.push(setCookie(getCookieUrl(cookie), cookie));
    }
  }
  await Promise.all(tasks);
  if (Platform.OS === 'android') {
    await CookieManager.flush();
  }
}

function normalizeCookie(cookie: NativeCookie, fallbackName: string, fallbackDomain: string): AccountCookie | null {
  const name = cookie.name ?? fallbackName;
  const value = cookie.value;
  const domain = cookie.domain ?? fallbackDomain;
  if (!name || !value || !domain) {
    return null;
  }
  return {
    name,
    value,
    domain,
    path: cookie.path ?? '/',
    expires: cookie.expires,
    secure: cookie.secure,
    httpOnly: cookie.httpOnly,
  };
}

function isRiotAuthDomain(domain: string) {
  const normalized = domain.toLowerCase();
  return ACCOUNT_RIOT_AUTH_DOMAINS.some((allowed) =>
    normalized === allowed || normalized.endsWith(`.${allowed.replace(/^\./, '')}`),
  );
}

function getCookieUrl(cookie: AccountCookie) {
  return `https://${cookie.domain.replace(/^\./, '')}`;
}

async function getCookieJars(url: string) {
  if (Platform.OS === 'ios') {
    const results = await Promise.allSettled([CookieManager.get(url, false), CookieManager.get(url, true)]);
    return results.flatMap((result) => (result.status === 'fulfilled' ? [result.value as Record<string, NativeCookie>] : []));
  }
  return [(await CookieManager.get(url)) as Record<string, NativeCookie>];
}

async function setCookie(url: string, cookie: AccountCookie) {
  const nativeCookie = {
    name: cookie.name,
    value: cookie.value,
    domain: cookie.domain,
    path: cookie.path ?? '/',
    expires: cookie.expires,
    secure: cookie.secure,
    httpOnly: cookie.httpOnly,
  };
  if (Platform.OS === 'ios') {
    await Promise.allSettled([CookieManager.set(url, nativeCookie, false), CookieManager.set(url, nativeCookie, true)]);
    return;
  }
  await CookieManager.set(url, nativeCookie);
}
