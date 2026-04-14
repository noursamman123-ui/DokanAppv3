/**
 * Search Screen – Instant search with recent searches, suggestions, and results.
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, StatusBar, Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import FastImage from 'react-native-fast-image';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { HomeStackParamList } from '../../navigation/types';
import { ProductsService } from '../../api/products.service';
import { SearchHistory } from '../../utils/storage';
import { Product } from '../../types';
import { Colors } from '../../theme/colors';
import { Typography, FontFamily, FontSize } from '../../theme/typography';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { buildFastImageSource, resolveMediaUrl } from '../../utils/media';

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'Search'>;

export default function SearchScreen() {
  const navigation = useNavigation<NavProp>();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setRecentSearches(SearchHistory.get());
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => ProductsService.searchProducts(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
  });

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const handleSubmit = useCallback(() => {
    if (query.trim().length >= 2) {
      SearchHistory.add(query.trim());
      setRecentSearches(SearchHistory.get());
      Keyboard.dismiss();
    }
  }, [query]);

  const handleProductPress = useCallback((product: Product) => {
    SearchHistory.add(query.trim());
    navigation.navigate('ProductDetail', { productId: product.id, productName: product.name });
  }, [navigation, query]);

  const handleRecentPress = useCallback((term: string) => {
    setQuery(term);
  }, []);

  const renderProduct = ({ item }: { item: Product }) => {
    const imageUri = resolveMediaUrl(item.images[0]?.src);

    return (
      <TouchableOpacity style={styles.resultItem} onPress={() => handleProductPress(item)}>
        {imageUri ? (
          <FastImage
            source={buildFastImageSource(imageUri, 'normal')}
            style={styles.resultImage}
            resizeMode={FastImage.resizeMode.contain}
          />
        ) : (
          <View style={[styles.resultImage, styles.imageFallback]}>
            <MaterialCommunityIcons name="package-variant-closed" style={styles.imageFallbackText} />
          </View>
        )}
        <View style={styles.resultInfo}>
          <Text style={styles.resultName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.resultPrice}>
            {parseFloat(item.prices.sale_price || item.prices.price || '0').toLocaleString('ar-SY')} ل.س
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>رجوع</Text>
        </TouchableOpacity>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="ابحث عن منتجات..."
          placeholderTextColor={Colors.placeholder}
          value={query}
          onChangeText={handleSearch}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          textAlign="right"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <MaterialCommunityIcons name="close" style={styles.clearBtn} />
          </TouchableOpacity>
        )}
      </View>

      {/* Recent Searches */}
      {query.length < 2 && recentSearches.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>عمليات بحث سابقة</Text>
            <TouchableOpacity onPress={() => { SearchHistory.clear(); setRecentSearches([]); }}>
              <Text style={styles.clearAll}>مسح الكل</Text>
            </TouchableOpacity>
          </View>
          {recentSearches.map((term, i) => (
            <TouchableOpacity key={i} style={styles.recentRow} onPress={() => handleRecentPress(term)}>
              <MaterialCommunityIcons name="history" style={styles.recentIcon} />
              <Text style={styles.recentText}>{term}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Search Results */}
      {query.length >= 2 && (
        <FlatList
          data={results ?? []}
          renderItem={renderProduct}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.noResults}>
                <MaterialCommunityIcons name="magnify" style={styles.noResultsIcon} />
                <Text style={styles.noResultsText}>لا توجد نتائج لـ "{query}"</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface, paddingTop: Spacing[10], paddingBottom: Spacing[3],
    paddingHorizontal: Spacing[4], flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing[3],
  },
  backBtn: {},
  backIcon: { fontSize: 16, color: Colors.textPrimary },
  input: {
    flex: 1, backgroundColor: Colors.inputBackground, borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[2.5],
    fontSize: FontSize.base, color: Colors.textPrimary, fontFamily: FontFamily.arabicRegular,
    borderWidth: 1, borderColor: Colors.inputBorder,
  },
  clearBtn: { fontSize: 18, color: Colors.textTertiary, padding: Spacing[2] },
  recentSection: { padding: Spacing[5] },
  recentHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: Spacing[3] },
  recentTitle: { ...Typography.h4, color: Colors.textPrimary, fontFamily: FontFamily.arabicBold },
  clearAll: { ...Typography.label, color: Colors.primary },
  recentRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing[3], paddingVertical: Spacing[3], borderBottomWidth: 1, borderBottomColor: Colors.divider },
  recentIcon: { fontSize: 16, color: Colors.textTertiary },
  recentText: { ...Typography.body, color: Colors.textPrimary, fontFamily: FontFamily.arabicRegular },
  resultsList: { padding: Spacing[4] },
  resultItem: {
    flexDirection: 'row-reverse', backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg, padding: Spacing[3], gap: Spacing[3], marginBottom: Spacing[2],
  },
  resultImage: { width: 70, height: 70, borderRadius: BorderRadius.md, backgroundColor: Colors.surfaceSecondary },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  imageFallbackText: { fontSize: 24, color: Colors.textTertiary },
  resultInfo: { flex: 1, gap: Spacing[1] },
  resultName: { ...Typography.bodySmall, color: Colors.textPrimary, fontFamily: FontFamily.arabicMedium, textAlign: 'right' },
  resultPrice: { ...Typography.priceSmall, color: Colors.sale, fontFamily: FontFamily.arabicBold, textAlign: 'right' },
  noResults: { alignItems: 'center', paddingTop: Spacing[16] },
  noResultsIcon: { fontSize: 48, marginBottom: Spacing[4], color: Colors.textTertiary },
  noResultsText: { ...Typography.body, color: Colors.textSecondary, fontFamily: FontFamily.arabicMedium },
});
