import * as SecureStore from 'expo-secure-store';

import type { StoredAuthTokens } from '@/lib/account';

const keyForAccount = (accountId: string) => `primordium.auth.${accountId}`;

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
