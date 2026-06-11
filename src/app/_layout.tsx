import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router/react-navigation";
import React from 'react';
import { AppState, useColorScheme } from 'react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AccountSessionRefreshWebView } from '@/modules/account/components/account-session-refresh-webview';
import { FavoriteAlertService } from '@/modules/favorite/favorite-alert-service';
import { useAccountStore } from '@/modules/account/account-store';
import { useFavoriteStore } from '@/modules/favorite/favorite-store';
import { useFavoriteAlertStore } from '@/modules/favorite/favorite-alert-store';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <BottomSheetModalProvider>
          <AccountSessionRefreshWebView />
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
  const enabled = useFavoriteAlertStore((state) => state.enabled);
  const activeAccountId = useAccountStore((state) => state.activeAccountId);
  const hasHydrated = useAccountStore((state) => state.hasHydrated);
  const favoriteCount = useFavoriteStore((state) => Object.keys(state.favoritesById).length);

  React.useEffect(() => {
    if (!hasHydrated) return;
    void FavoriteAlertService.syncTaskRegistration();
    if (enabled) {
      void FavoriteAlertService.runCheck();
    }
  }, [activeAccountId, enabled, favoriteCount, hasHydrated]);

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void FavoriteAlertService.runCheck();
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
