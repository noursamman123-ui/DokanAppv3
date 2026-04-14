/**
 * Dokan App – Main Tab Navigator
 * Bottom navigation: Home | Categories | Cart | Wishlist | Account
 * Noon-inspired design with badge support on Cart.
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainTabParamList } from './types';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { useCartStore } from '../store/cartStore';

// Tab screens (we use stacks inside each tab for deeper navigation)
import HomeStackNavigator from './stacks/HomeStackNavigator';
import CategoriesStackNavigator from './stacks/CategoriesStackNavigator';
import CartStackNavigator from './stacks/CartStackNavigator';
import WishlistStackNavigator from './stacks/WishlistStackNavigator';
import AccountStackNavigator from './stacks/AccountStackNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcons: Record<string, { active: string; inactive: string }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Categories: { active: 'view-grid', inactive: 'view-grid-outline' },
  Cart: { active: 'cart', inactive: 'cart-outline' },
  Wishlist: { active: 'heart', inactive: 'heart-outline' },
  Account: { active: 'account', inactive: 'account-outline' },
};

interface TabIconProps {
  name: string;
  focused: boolean;
  badgeCount?: number;
}

function TabIcon({ name, focused, badgeCount }: TabIconProps) {
  return (
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons
        name={focused ? TabIcons[name].active : TabIcons[name].inactive}
        size={22}
        color={focused ? Colors.tabActive : Colors.tabInactive}
      />
      {badgeCount !== undefined && badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function MainTabNavigator() {
  const cartCount = useCartStore((s) => s.totalItems());

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarLabelStyle: styles.tabLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'الرئيسية',
          tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesStackNavigator}
        options={{
          tabBarLabel: 'الأقسام',
          tabBarIcon: ({ focused }) => <TabIcon name="Categories" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartStackNavigator}
        options={{
          tabBarLabel: 'السلة',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="Cart" focused={focused} badgeCount={cartCount} />
          ),
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistStackNavigator}
        options={{
          tabBarLabel: 'المفضلة',
          tabBarIcon: ({ focused }) => <TabIcon name="Wishlist" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountStackNavigator}
        options={{
          tabBarLabel: 'حسابي',
          tabBarIcon: ({ focused }) => <TabIcon name="Account" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.navBackground,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: Platform.select({ ios: 84, android: 64 }),
    paddingBottom: Platform.select({ ios: 24, android: 8 }),
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  tabLabel: {
    fontFamily: FontFamily.arabicMedium,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.textInverse,
    fontSize: 9,
    fontWeight: '700',
    fontFamily: FontFamily.bold,
  },
});
