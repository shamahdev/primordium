import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "expo-router/react-navigation";
import React from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AccountSessionRefreshWebView } from "@/modules/account/components/account-session-refresh-webview";
import { FavoriteAlertRuntime } from "@/modules/favorite/components/favorite-alert-runtime";

export default function RootLayout() {
	const colorScheme = useColorScheme();
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
				<BottomSheetModalProvider>
					<AccountSessionRefreshWebView />
					<FavoriteAlertRuntime />
					<NotificationRouter />
					<Stack screenOptions={{ headerShown: false }}>
						<Stack.Screen name="index" />
						<Stack.Screen name="onboarding" />
						<Stack.Screen name="login" />
						<Stack.Screen name="switch-account" />
						<Stack.Screen
							name="store-item"
							options={{ presentation: "fullScreenModal" }}
						/>
						<Stack.Screen name="(tabs)" />
					</Stack>
				</BottomSheetModalProvider>
			</ThemeProvider>
		</GestureHandlerRootView>
	);
}

function NotificationRouter() {
	React.useEffect(() => {
		const redirect = (notification: Notifications.Notification) => {
			const url = notification.request.content.data?.url;
			if (url === "/home") {
				router.push("/home");
			}
		};

		const response = Notifications.getLastNotificationResponse();
		if (response?.notification) {
			redirect(response.notification);
		}

		const subscription = Notifications.addNotificationResponseReceivedListener(
			(nextResponse) => {
				redirect(nextResponse.notification);
			},
		);

		return () => subscription.remove();
	}, []);

	return null;
}
