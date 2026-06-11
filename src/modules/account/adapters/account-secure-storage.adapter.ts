import * as SecureStore from 'expo-secure-store';

import type { AccountCookie, AccountTokens } from '@/modules/account/account-type';

const keyForAccount = (accountId: string) => `primordium.auth.${accountId}`;
const cookieKeyForAccount = (accountId: string) => `primordium.auth.cookies.${accountId}`;

export async function saveTokens(accountId: string, tokens: AccountTokens) {
  await SecureStore.setItemAsync(keyForAccount(accountId), JSON.stringify(tokens), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
}

export async function getTokens(accountId: string) {
  const value = await SecureStore.getItemAsync(keyForAccount(accountId));
  if (!value) {
    return null;
  }
  return JSON.parse(value) as AccountTokens;
}

export async function deleteTokens(accountId: string) {
  await SecureStore.deleteItemAsync(keyForAccount(accountId));
}

export async function saveCookies(accountId: string, cookies: AccountCookie[]) {
  await SecureStore.setItemAsync(cookieKeyForAccount(accountId), JSON.stringify(cookies), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
}

export async function getCookies(accountId: string) {
  const value = await SecureStore.getItemAsync(cookieKeyForAccount(accountId));
  if (!value) {
    return null;
  }
  return JSON.parse(value) as AccountCookie[];
}

export async function deleteCookies(accountId: string) {
  await SecureStore.deleteItemAsync(cookieKeyForAccount(accountId));
}

export async function deleteAuthMaterial(accountId: string) {
  await Promise.allSettled([deleteTokens(accountId), deleteCookies(accountId)]);
}
