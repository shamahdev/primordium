import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import React from 'react';
import { AppState, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { RiotSessionRefreshWebView } from '@/components/riot-session-refresh-webview';
import {
  runFavoriteStoreAlertCheck,
  syncFavoriteStoreAlertTaskRegistration,
} from '@/lib/favorite-store-alerts';
import { useAccountStore } from '@/stores/account-store';
import { useFavoriteStoreAlertStore } from '@/stores/favorite-store-alert-store';
import { useFavoriteStore } from '@/stores/favorite-store';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <BottomSheetModalProvider>
          <RiotSessionRefreshWebView />
          <FavoriteStoreAlertRuntime />
          <NotificationRouter />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="login" />
            <Stack.Screen name="switch-account" />
            <Stack.Screen name="store-item" options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </BottomSheetModalProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function FavoriteStoreAlertRuntime() {
  const enabled = useFavoriteStoreAlertStore((state) => state.enabled);
  const activeAccountId = useAccountStore((state) => state.activeAccountId);
  const hasHydrated = useAccountStore((state) => state.hasHydrated);
  const favoriteCount = useFavoriteStore((state) => Object.keys(state.favoritesById).length);

  React.useEffect(() => {
    if (!hasHydrated) return;
    void syncFavoriteStoreAlertTaskRegistration();
    if (enabled) {
      void runFavoriteStoreAlertCheck();
    }
  }, [activeAccountId, enabled, favoriteCount, hasHydrated]);

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void runFavoriteStoreAlertCheck();
      }
    });

    return () => subscription.remove();
  }, []);

  return null;
}

function NotificationRouter() {
  React.useEffect(() => {
    const redirect = (notification: Notifications.Notification) => {
      const url = notification.request.content.data?.url;
      if (url === '/home') {
        router.push('/home');
      }
    };

    const response = Notifications.getLastNotificationResponse();
    if (response?.notification) {
      redirect(response.notification);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((nextResponse) => {
      redirect(nextResponse.notification);
    });

    return () => subscription.remove();
  }, []);

  return null;
}
