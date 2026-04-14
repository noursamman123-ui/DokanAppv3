/**
 * Product Listing Screen – Grid with infinite scroll, sorting, and filtering.
 */
import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar, RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useInfiniteQuery } from '@tanstack/react-query';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { HomeStackParamList } from '../../../navigation/types';
import { ProductsService } from '../../../api/products.service';
import { Product, ProductFilters } from '../../../types';
import ProductCard from '../../../components/cards/ProductCard';
import { ProductCardSkeleton } from '../../../components/feedback/Skeleton';
import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Shadows } from '../../../theme/shadows';

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'ProductList'>;
type RoutePropType = RouteProp<HomeStackParamList, 'ProductList'>;

const SORT_OPTIONS: { label: string; orderby: ProductFilters['orderby']; order: ProductFilters['order'] }[] = [
  { label: 'الأحدث', orderby: 'date', order: 'desc' },
  { label: 'الأقل سعراً', orderby: 'price', order: 'asc' },
  { label: 'الأعلى سعراً', orderby: 'price', order: 'desc' },
  { label: 'الأعلى تقييماً', orderby: 'rating', order: 'desc' },
  { label: 'الأكثر مبيعاً', orderby: 'popularity', order: 'desc' },
];

export default function ProductListScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { categoryId, categoryName, title, filter } = route.params ?? {};

  const [sortIndex, setSortIndex] = useState(0);
  const sort = SORT_OPTIONS[sortIndex];

  const buildFilters = useCallback(
    (page: number): ProductFilters => ({
      page,
      per_page: 50, // Increased for better initial fill
      category: categoryId,
      orderby: sort.orderby,
      order: sort.order,
      on_sale: filter === 'sale' ? true : undefined,
      featured: filter === 'featured' ? true : undefined,
    }),
    [categoryId, sort, filter],
  );

  const {
    data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch,
  } = useInfiniteQuery({
    queryKey: ['products', categoryId, filter, sort.orderby, sort.order],
    queryFn: ({ pageParam = 1 }) => ProductsService.getProducts(buildFilters(pageParam)),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length >= 50 ? allPages.length + 1 : undefined,
    initialPageParam: 1,
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const apiProducts = data?.pages.flat() ?? [];

  // Use mock data if API is empty or loading failed
  const allProducts = apiProducts;
  // Previously: falling back to mock data if empty. Removed to avoid showing incorrect products.

  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id, productName: product.name });
  }, [navigation]);

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => (
      <View style={styles.cardWrapper}>
        <ProductCard product={item} onPress={handleProductPress} />
      </View>
    ),
    [handleProductPress],
  );

  const screentTitle = title ?? categoryName ?? 'المنتجات';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>رجوع</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{screentTitle}</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Sort Bar */}
      <View style={styles.sortBar}>
        {SORT_OPTIONS.map((opt, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.sortChip, i === sortIndex && styles.sortChipActive]}
            onPress={() => setSortIndex(i)}
          >
            <Text style={[styles.sortText, i === sortIndex && styles.sortTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Product Grid */}
      {isLoading ? (
        <View style={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlashList
          data={allProducts}
          numColumns={2}
          renderItem={renderProduct}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator style={styles.loader} color={Colors.primary} size="small" />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="package-variant-closed" style={styles.emptyIcon} />
              <Text style={styles.emptyText}>لا توجد منتجات حالياً</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface,
    paddingTop: Spacing[10],
    paddingBottom: Spacing[3],
    paddingHorizontal: Spacing[4],
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.sm,
  },
  backBtn: { width: 40, alignItems: 'center' },
  backIcon: { fontSize: 16, color: Colors.textPrimary },
  headerTitle: {
    ...Typography.h4, color: Colors.textPrimary,
    fontFamily: FontFamily.arabicBold, flex: 1, textAlign: 'center',
  },
  sortBar: {
    backgroundColor: Colors.surface,
    flexDirection: 'row-reverse',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    gap: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sortChip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
  },
  sortChipActive: { backgroundColor: Colors.primary },
  sortText: { ...Typography.labelSmall, color: Colors.textSecondary, fontFamily: FontFamily.arabicMedium },
  sortTextActive: { color: Colors.textInverse },
  listContent: { padding: Spacing[3] },
  cardWrapper: { flex: 1, padding: Spacing[1.5] },
  skeletonGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
    padding: Spacing[5],
  },
  loader: { paddingVertical: Spacing[6] },
  empty: { alignItems: 'center', paddingTop: Spacing[16] },
  emptyIcon: { fontSize: 48, marginBottom: Spacing[4] },
  emptyText: { ...Typography.bodyLarge, color: Colors.textSecondary, fontFamily: FontFamily.arabicMedium },
});
