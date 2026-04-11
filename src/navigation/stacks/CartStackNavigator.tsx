import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CartStackParamList } from '../types';
import CartScreen from '../../features/cart/CartScreen';
import CheckoutScreen from '../../features/checkout/screens/CheckoutScreen';
import OrderSuccessScreen from '../../features/checkout/screens/OrderSuccessScreen';

const Stack = createNativeStackNavigator<CartStackParamList>();

export default function CartStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
    </Stack.Navigator>
  );
}
