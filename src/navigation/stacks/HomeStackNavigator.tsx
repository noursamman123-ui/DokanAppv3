import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../types';
import HomeScreen from '../../features/home/HomeScreen';
import SubcategoryListScreen from '../../features/categories/SubcategoryListScreen';
import ProductDetailScreen from '../../features/products/screens/ProductDetailScreen';
import ProductListScreen from '../../features/products/screens/ProductListScreen';
import SearchScreen from '../../features/search/SearchScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="SubcategoryList" component={SubcategoryListScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  );
}
