import Feather from "@expo/vector-icons/Feather";
import { withLayoutContext } from "expo-router";
import {
	createMaterialTopTabNavigator,
	type MaterialTopTabNavigationEventMap,
	type MaterialTopTabNavigationOptions,
} from "expo-router/js-top-tabs";
import type {
	ParamListBase,
	TabNavigationState,
} from "expo-router/react-navigation";
import React from "react";
import {
	InteractionManager,
	StyleSheet,
	useWindowDimensions,
} from "react-native";
import {
	SafeAreaView,
	useSafeAreaInsets,
} from "react-native-safe-area-context";
import { UpdateBanner } from "@/commons/components/update-banner";
import { Colors, Spacing } from "@/commons/constants/theme";
import { useUpdateCheck } from "@/commons/hooks/use-update-check";
import { AccountTopHeader } from "@/modules/account/components/account-top-header";
import { CatalogService } from "@/modules/catalog/catalog-service";

const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
	MaterialTopTabNavigationOptions,
	typeof Navigator,
	TabNavigationState<ParamListBase>,
	MaterialTopTabNavigationEventMap
>(Navigator);

export default function AuthenticatedTabsLayout() {
	const colors = Colors.dark;
	const layout = useWindowDimensions();
	const insets = useSafeAreaInsets();
	const { showBanner, latestVersion, releaseUrl, dismissBanner } =
		useUpdateCheck();

	React.useEffect(() => {
		let cancelled = false;

		const task = InteractionManager.runAfterInteractions(() => {
			if (!cancelled) {
				CatalogService.prewarmCatalogItems();
			}
		});

		return () => {
			cancelled = true;
			task.cancel();
		};
	}, []);

	return (
		<SafeAreaView
			style={[styles.screen, { backgroundColor: Colors.dark.background }]}
			edges={["top"]}
		>
			<AccountTopHeader />
			{showBanner && latestVersion && releaseUrl && (
				<UpdateBanner
					version={latestVersion}
					releaseUrl={releaseUrl}
					onDismiss={dismissBanner}
				/>
			)}
			<MaterialTopTabs
				initialRouteName="home"
				initialLayout={{ width: layout.width }}
				backBehavior="none"
				tabBarPosition="bottom"
				screenOptions={{
					lazy: true,
					swipeEnabled: true,
					tabBarShowIcon: true,
					tabBarActiveTintColor: colors.primary,
					tabBarInactiveTintColor: colors.textSecondary,
					tabBarPressColor: colors.backgroundSelected,
					tabBarIndicatorStyle: {
						backgroundColor: "transparent",
						height: 0,
					},
					tabBarStyle: {
						paddingBottom: insets.bottom,
					},
					tabBarItemStyle: styles.item,
					tabBarLabelStyle: styles.label,
				}}
			>
				<MaterialTopTabs.Screen
					name="home"
					options={{
						title: "Store",
						tabBarIcon: ({ color }) => (
							<Feather name="shopping-cart" size={22} color={color} />
						),
					}}
				/>
				<MaterialTopTabs.Screen
					name="catalog"
					options={{
						title: "Catalog",
						tabBarIcon: ({ color }) => (
							<Feather name="grid" size={22} color={color} />
						),
					}}
				/>
				<MaterialTopTabs.Screen
					name="profile"
					options={{
						title: "Account",
						tabBarIcon: ({ color }) => (
							<Feather name="user" size={22} color={color} />
						),
					}}
				/>
			</MaterialTopTabs>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	label: {
		fontSize: 11,
		fontWeight: "600",
		textTransform: "none",
	},
	item: {
		paddingVertical: Spacing.one,
	},
});
