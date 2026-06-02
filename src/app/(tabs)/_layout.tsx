import { MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions, createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { Image } from 'expo-image';
import { withLayoutContext } from 'expo-router';
import React from 'react';
import { StyleSheet, useColorScheme, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TabHeader } from '@/components/tab-header';
import { Colors, Spacing } from '@/constants/theme';

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

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <TabHeader />
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
          tabBarItemStyle: styles.item,
          tabBarLabelStyle: styles.label,
        }}>
        <MaterialTopTabs.Screen
          name="home"
          options={{
            title: 'Store',
            tabBarIcon: ({ color }) => (
              <Image
                source={require('@/assets/images/tabIcons/home.png')}
                style={styles.icon}
                tintColor={color}
              />
            ),
          }}
        />
        <MaterialTopTabs.Screen
          name="profile"
          options={{
            title: 'Accounts',
            tabBarIcon: ({ color }) => (
              <Image
                source={require('@/assets/images/tabIcons/explore.png')}
                style={styles.icon}
                tintColor={color}
              />
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
  icon: {
    width: 20,
    height: 20,
  },
});
