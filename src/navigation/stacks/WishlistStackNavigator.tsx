import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WishlistStackParamList } from '../types';
import WishlistScreen from '../../features/wishlist/WishlistScreen';

const Stack = createNativeStackNavigator<WishlistStackParamList>();

export default function WishlistStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WishlistScreen" component={WishlistScreen} />
    </Stack.Navigator>
  );
}
