/**
 * Categories Screen – Grid layout with main categories and subcategory drill-down.
 */
import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
import { CategoryChipSkeleton } from '../../components/feedback/Skeleton';
import { buildFastImageSource, resolveMediaUrl } from '../../utils/media';

type NavProp = NativeStackNavigationProp<CategoriesStackParamList, 'CategoriesScreen'>;

export default function CategoriesScreen() {
  const navigation = useNavigation<NavProp>();

  const { data: apiCategories, isLoading, refetch } = useQuery({
    queryKey: ['categories', 0],
    queryFn: () => CategoriesService.getCategories(0),
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const categories = apiCategories ?? [];

  React.useEffect(() => {
    const preloadSources = categories
      .map((category) => resolveMediaUrl(category.image?.src))
      .filter(Boolean)
      .slice(0, 18)
      .map((uri) => ({
        uri,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.web,
      }));

    if (preloadSources.length > 0) {
      FastImage.preload(preloadSources);
    }
  }, [categories]);

  const handleCategoryPress = (cat: Category) => {
    navigation.navigate('SubcategoryList', {
      categoryId: cat.id,
      categoryName: cat.name,
    });
  };

  const renderCategory = ({ item }: { item: Category }) => {
    const imageUri = resolveMediaUrl(item.image?.src);

    return (
      <TouchableOpacity style={styles.card} onPress={() => handleCategoryPress(item)} activeOpacity={0.85}>
        <View style={styles.imageWrapper}>
          {imageUri ? (
            <FastImage
              source={buildFastImageSource(imageUri, 'normal')}
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderEmoji}>🛍️</Text>
            </View>
          )}
        </View>
        <Text style={styles.categoryName} numberOfLines={2}>{item.name}</Text>
        {item.count > 0 && (
          <Text style={styles.count}>{item.count} منتج</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>الأقسام</Text>
      </View>

      {isLoading ? (
        <View style={styles.skeletonGrid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <CategoryChipSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={categories ?? []}
          numColumns={3}
          renderItem={renderCategory}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.placeholderEmoji}>📂</Text>
              <Text style={styles.count}>لا توجد أقسام متاحة حالياً</Text>
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
    paddingBottom: Spacing[4],
    paddingHorizontal: Spacing[5],
    ...Shadows.sm,
  },
  title: { ...Typography.h2, color: Colors.textPrimary, fontFamily: FontFamily.arabicBold, textAlign: 'right' },
  grid: { padding: Spacing[4], paddingBottom: 100 },
  row: { justifyContent: 'space-between', marginBottom: Spacing[4] },
  card: {
    width: '31%',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[2],
    ...Shadows.card,
  },
  imageWrapper: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    backgroundColor: Colors.primarySurface,
    marginBottom: Spacing[2],
  },
  image: { width: 64, height: 64 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderEmoji: { fontSize: 28 },
  categoryName: {
    ...Typography.labelSmall, color: Colors.textPrimary,
    fontFamily: FontFamily.arabicMedium, textAlign: 'center',
  },
  count: { ...Typography.caption, color: Colors.textTertiary, marginTop: 2 },
  skeletonGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around',
    padding: Spacing[5], gap: Spacing[5],
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing[12],
  },
});
