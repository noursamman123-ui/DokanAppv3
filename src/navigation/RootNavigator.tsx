/**
 * Dokan App – Root Navigator
 * Entry point of the navigation tree. Handles Splash → Auth/Main routing.
 */
import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { Colors } from '../theme/colors';

// Screens
import SplashScreen from '../features/auth/screens/SplashScreen';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Custom navigation theme matching Dokan design system
const DokanNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.textPrimary,
    border: Colors.border,
    primary: Colors.primary,
    notification: Colors.primary,
  },
};

export default function RootNavigator() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const hydrateAuth = useAuthStore((s) => s.hydrateFromStorage);
  const hydrateCart = useCartStore((s) => s.hydrateFromStorage);
  const hydrateWishlist = useWishlistStore((s) => s.hydrateFromStorage);
 
  // Hydrate persisted state on app launch
  useEffect(() => {
    hydrateAuth();
    hydrateCart();
    hydrateWishlist();
 
    // Register global session expiry handler
    (globalThis as any).__onSessionExpired = () => {
      useAuthStore.getState().logout();
    };
  }, [hydrateAuth, hydrateCart, hydrateWishlist]);

  if (!isHydrated) {
    return null; // Or a dedicated InitializingScreen
  }

  return (
    <NavigationContainer theme={DokanNavTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
