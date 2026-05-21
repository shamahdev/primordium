import * as SecureStore from 'expo-secure-store';

import type { StoredAuthTokens, StoredRiotCookie } from '@/lib/account';

const keyForAccount = (accountId: string) => `primordium.auth.${accountId}`;
const cookieKeyForAccount = (accountId: string) => `primordium.auth.cookies.${accountId}`;

export async function saveAuthTokens(accountId: string, tokens: StoredAuthTokens) {
  await SecureStore.setItemAsync(keyForAccount(accountId), JSON.stringify(tokens), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
}

export async function getAuthTokens(accountId: string) {
  const value = await SecureStore.getItemAsync(keyForAccount(accountId));
  if (!value) {
    return null;
  }
  return JSON.parse(value) as StoredAuthTokens;
}

export async function deleteAuthTokens(accountId: string) {
  await SecureStore.deleteItemAsync(keyForAccount(accountId));
}

export async function saveAuthCookies(accountId: string, cookies: StoredRiotCookie[]) {
  await SecureStore.setItemAsync(cookieKeyForAccount(accountId), JSON.stringify(cookies), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
}

export async function getAuthCookies(accountId: string) {
  const value = await SecureStore.getItemAsync(cookieKeyForAccount(accountId));
  if (!value) {
    return null;
  }
  return JSON.parse(value) as StoredRiotCookie[];
}

export async function deleteAuthCookies(accountId: string) {
  await SecureStore.deleteItemAsync(cookieKeyForAccount(accountId));
}

export async function deleteAuthMaterial(accountId: string) {
  await Promise.allSettled([deleteAuthTokens(accountId), deleteAuthCookies(accountId)]);
}
