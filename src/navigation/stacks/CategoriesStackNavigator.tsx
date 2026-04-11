import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CategoriesStackParamList } from '../types';
import CategoriesScreen from '../../features/categories/CategoriesScreen';
import SubcategoryListScreen from '../../features/categories/SubcategoryListScreen';
import ProductListScreen from '../../features/products/screens/ProductListScreen';
import ProductDetailScreen from '../../features/products/screens/ProductDetailScreen';

const Stack = createNativeStackNavigator<CategoriesStackParamList>();

export default function CategoriesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CategoriesScreen" component={CategoriesScreen} />
      <Stack.Screen name="SubcategoryList" component={SubcategoryListScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}
