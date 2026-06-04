import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions, createMaterialTopTabNavigator } from "expo-router/js-top-tabs";
import { ParamListBase, TabNavigationState } from "expo-router/react-navigation";
import { withLayoutContext } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, useColorScheme, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabHeader } from '@/components/tab-header';
import { UpdateBanner } from '@/components/update-banner';
import { Colors, Spacing } from '@/constants/theme';
import { useUpdateCheck } from '@/hooks/use-update-check';

const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function AuthenticatedTabsLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const layout = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { showBanner, latestVersion, releaseUrl, dismissBanner } = useUpdateCheck();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <TabHeader />
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
            backgroundColor: 'transparent',
            height: 0,
          },
             tabBarStyle: {                                                                                                                                                                   
     paddingBottom: Platform.OS === 'android' ? insets.bottom : 0,                                                                                                                  
   },
          tabBarItemStyle: styles.item,
          tabBarLabelStyle: styles.label,
        }}>
        <MaterialTopTabs.Screen
          name="home"
          options={{
            title: 'Store',
            tabBarIcon: ({ color }) => (
              <Ionicons name="storefront-outline" size={22} color={color} />
            ),
          }}
        />
        <MaterialTopTabs.Screen
          name="catalog"
          options={{
            title: 'Catalog',
            tabBarIcon: ({ color }) => (
              <Ionicons name="grid-outline" size={22} color={color} />
            ),
          }}
        />
        <MaterialTopTabs.Screen
          name="profile"
          options={{
            title: 'Accounts',
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-outline" size={22} color={color} />
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
    fontWeight: '600',
    textTransform: 'none',
  },
  item: {
    paddingVertical: Spacing.one,
  },
});
