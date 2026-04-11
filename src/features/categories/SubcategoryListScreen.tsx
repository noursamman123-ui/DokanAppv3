/**
 * SubcategoryListScreen – Displays subcategories for a parent category.
 * If no subcategories are found, it can redirect to ProductList or show a message.
 */
import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, StatusBar, RefreshControl, Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import FastImage from 'react-native-fast-image';
import { CategoriesStackParamList } from '../../navigation/types';
import { CategoriesService } from '../../api/categories.service';
import { Category } from '../../types';
import { Colors } from '../../theme/colors';
import { Typography, FontFamily } from '../../theme/typography';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { Shadows } from '../../theme/shadows';
import { buildFastImageSource, resolveMediaUrl } from '../../utils/media';

type NavProp = NativeStackNavigationProp<CategoriesStackParamList, 'SubcategoryList'>;
type RoutePropType = RouteProp<CategoriesStackParamList, 'SubcategoryList'>;

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - Spacing[4] * 2 - Spacing[3]) / 2;

export default function SubcategoryListScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { categoryId, categoryName } = route.params;

  const [refreshing, setRefreshing] = useState(false);

  const { data: subcategories, isLoading, refetch } = useQuery({
    queryKey: ['subcategories', categoryId],
    queryFn: () => CategoriesService.getSubcategories(categoryId),
    staleTime: 60 * 1000,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  React.useEffect(() => {
    const preloadSources = (subcategories ?? [])
      .map((category) => resolveMediaUrl(category.image?.src))
      .filter(Boolean)
      .slice(0, 12)
      .map((uri) => ({
        uri,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.web,
      }));

    if (preloadSources.length > 0) {
      FastImage.preload(preloadSources);
    }
  }, [subcategories]);

  const handleCategoryPress = (cat: Category) => {
    // Check if this subcategory itself has children? 
    // For now, we go to ProductList directly from subcategories to avoid infinite recursion unless needed.
    navigation.navigate('ProductList', {
      categoryId: cat.id,
      categoryName: cat.name,
    });
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {item.image?.src ? (
          <FastImage
            source={buildFastImageSource(item.image.src, 'normal')}
            style={styles.image}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📦</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.count}>{item.count} منتج</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>رجوع</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryName}</Text>
        <TouchableOpacity 
          style={styles.viewAllBtn}
          onPress={() => navigation.navigate('ProductList', { categoryId, categoryName })}
        >
          <Text style={styles.viewAllText}>كل المنتجات</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={subcategories}
          renderItem={renderCategory}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>لا توجد أقسام فرعية</Text>
              <TouchableOpacity 
                style={styles.bigBtn}
                onPress={() => navigation.navigate('ProductList', { categoryId, categoryName })}
              >
                <Text style={styles.bigBtnText}>عرض جميع المنتجات في {categoryName}</Text>
              </TouchableOpacity>
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
  backIcon: { fontSize: 22, color: Colors.textPrimary },
  headerTitle: {
    ...Typography.h4, color: Colors.textPrimary,
    fontFamily: FontFamily.arabicBold, flex: 1, textAlign: 'center',
  },
  viewAllBtn: { paddingHorizontal: Spacing[2] },
  viewAllText: { ...Typography.labelSmall, color: Colors.primary, fontFamily: FontFamily.arabicBold },
  
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: Spacing[4] },
  
  card: {
    width: ITEM_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing[4],
    marginHorizontal: Spacing[2],
    ...Shadows.card,
    overflow: 'hidden',
  },
  imageContainer: { width: '100%', height: ITEM_WIDTH * 0.8, backgroundColor: Colors.surfaceSecondary },
  image: { width: '100%', height: '100%' },
  placeholderImage: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 40 },
  info: { padding: Spacing[3], alignItems: 'center' },
  name: { ...Typography.label, color: Colors.textPrimary, fontFamily: FontFamily.arabicSemiBold, textAlign: 'center' },
  count: { ...Typography.caption, color: Colors.textTertiary, marginTop: 2 },
  
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing[20] },
  emptyText: { ...Typography.bodyLarge, color: Colors.textSecondary, fontFamily: FontFamily.arabicMedium, marginBottom: Spacing[6] },
  bigBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing[6], paddingVertical: Spacing[3], borderRadius: BorderRadius.full },
  bigBtnText: { ...Typography.buttonSmall, color: Colors.textInverse, fontFamily: FontFamily.arabicBold },
});
