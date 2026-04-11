/**
 * Home Screen – Noon-inspired main homepage.
 * Features: header, search bar, banner slider, categories, product sections.
 */
import React, { useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Dimensions, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import FastImage from 'react-native-fast-image';
import { HomeStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Typography, FontFamily } from '../../theme/typography';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { Shadows } from '../../theme/shadows';
import { HomeService } from '../../api/home.service';
import { Product, Banner } from '../../types';
import ProductCard from '../../components/cards/ProductCard';
import {
  BannerSkeleton, ProductCardSkeleton,
} from '../../components/feedback/Skeleton';
import { useCartStore } from '../../store/cartStore';
import { buildFastImageSource, resolveMediaUrl } from '../../utils/media';

const { width } = Dimensions.get('window');

type HomeNavProp = NativeStackNavigationProp<HomeStackParamList, 'HomeScreen'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const cartCount = useCartStore((s) => s.totalItems());

  const { data: apiData, isLoading } = useQuery({
    queryKey: ['home'],
    queryFn: HomeService.getHomeData,
    staleTime: 2 * 60 * 1000,
    refetchOnMount: false,
    retry: 2,
    placeholderData: (previousData) => previousData,
  });

  const homeData = apiData;

  useEffect(() => {
    if (!homeData) {
      return;
    }

    const preloadUrls = [
      ...(homeData.banners ?? []).slice(0, 2).map((banner) => resolveMediaUrl(banner.image)),
      ...(homeData.featured_products ?? []).slice(0, 8).map((product) => resolveMediaUrl(product.images?.[0]?.src)),
      ...(homeData.sale_products ?? []).slice(0, 4).map((product) => resolveMediaUrl(product.images?.[0]?.src)),
    ].filter(Boolean);

    if (preloadUrls.length > 0) {
      FastImage.preload(
        preloadUrls.map((uri) => ({
          uri,
          priority: FastImage.priority.normal,
          cache: FastImage.cacheControl.web,
        }))
      );
    }
  }, [homeData]);

  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id, productName: product.name });
  }, [navigation]);

  const handleSeeAll = useCallback((filter: 'featured' | 'sale' | 'best_sellers' | 'latest', title: string) => {
    navigation.navigate('ProductList', { filter, title });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* ─── Header ──────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>مرحباً 👋</Text>
            <Text style={styles.storeName}>متجر دكان</Text>
          </View>
          <TouchableOpacity style={styles.cartBtn}
            onPress={() => navigation.getParent()?.navigate('Cart')}>
            <Text style={styles.cartIcon}>🛒</Text>
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.9}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>ابحث عن منتج، ماركة، أو قسم...</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Content ─────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Banner Slider */}
        {isLoading ? (
          <BannerSkeleton />
        ) : homeData?.banners && homeData.banners.length > 0 ? (
          <BannerSlider banners={homeData.banners} />
        ) : null}

        {/* Featured Products */}
        <Section
          title="منتجات مميزة"
          onSeeAll={() => handleSeeAll('featured', 'منتجات مميزة')}
        >
          {isLoading ? (
            <HorizontalSkeletonList />
          ) : (
            <FlatList
              horizontal
              data={homeData?.featured_products ?? []}
              renderItem={({ item }) => (
                <ProductCard product={item} onPress={handleProductPress} horizontal />
              )}
              keyExtractor={(item) => String(item.id)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productList}
            />
          )}
        </Section>

        {/* Sale Products */}
        <SaleBanner onPress={() => handleSeeAll('sale', 'عروض اليوم')} />

        <Section
          title="عروض اليوم 🔥"
          onSeeAll={() => handleSeeAll('sale', 'عروض اليوم')}
        >
          {isLoading ? (
            <HorizontalSkeletonList />
          ) : (
            <FlatList
              horizontal
              data={homeData?.sale_products ?? []}
              renderItem={({ item }) => (
                <ProductCard product={item} onPress={handleProductPress} horizontal />
              )}
              keyExtractor={(item) => String(item.id)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productList}
            />
          )}
        </Section>

        {/* Best Sellers */}
        <Section
          title="الأكثر مبيعاً"
          onSeeAll={() => handleSeeAll('best_sellers', 'الأكثر مبيعاً')}
        >
          {isLoading ? (
            <HorizontalSkeletonList />
          ) : (
            <FlatList
              horizontal
              data={homeData?.best_sellers ?? []}
              renderItem={({ item }) => (
                <ProductCard product={item} onPress={handleProductPress} horizontal />
              )}
              keyExtractor={(item) => String(item.id)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productList}
            />
          )}
        </Section>

        {/* Latest Products – Grid */}
        <Section
          title="أحدث المنتجات"
          onSeeAll={() => handleSeeAll('latest', 'أحدث المنتجات')}
        >
          {isLoading ? (
            <View style={styles.grid}>
              {[1, 2, 3, 4].map((k) => (
                <ProductCardSkeleton key={k} />
              ))}
            </View>
          ) : (
            <View style={styles.grid}>
              {(homeData?.latest_products ?? []).slice(0, 6).map((item) => (
                <ProductCard key={item.id} product={item} onPress={handleProductPress} />
              ))}
            </View>
          )}
        </Section>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function BannerSlider({ banners }: { banners: Banner[] }) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <View style={styles.bannerContainer}>
      <FlatList
        horizontal
        pagingEnabled
        data={banners}
        renderItem={({ item }) => (
          <FastImage
            source={buildFastImageSource(item.image, 'high')}
            style={styles.bannerImage}
            resizeMode={FastImage.resizeMode.cover}
          />
        )}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
      />
      {/* Dots indicator */}
      <View style={styles.dotsRow}>
        {banners.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

interface SectionProps {
  title: string;
  onSeeAll?: () => void;
  children: React.ReactNode;
}

function Section({ title, onSeeAll, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAll}>عرض الكل</Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
}

function SaleBanner({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.saleBanner} onPress={onPress} activeOpacity={0.9}>
      <Text style={styles.saleBannerText}>🔥 عروض حصرية – وفّر حتى 70%</Text>
      <Text style={styles.saleBannerCta}>تسوّق الآن ←</Text>
    </TouchableOpacity>
  );
}

function HorizontalSkeletonList() {
  return (
    <FlatList
      horizontal
      data={[1, 2, 3]}
      renderItem={() => (
        <View style={{ width: 180, marginRight: 12 }}>
          <ProductCardSkeleton />
        </View>
      )}
      keyExtractor={(item) => String(item)}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16 }}
    />
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    backgroundColor: Colors.surface,
    paddingTop: Spacing[10],
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
    ...Shadows.sm,
  },
  headerTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[3] },
  greeting: { ...Typography.caption, color: Colors.textSecondary, textAlign: 'right' },
  storeName: { ...Typography.h3, color: Colors.textPrimary, fontFamily: FontFamily.arabicBold, textAlign: 'right' },
  cartBtn: { position: 'relative', padding: Spacing[2] },
  cartIcon: { fontSize: 24 },
  cartBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: Colors.error, borderRadius: BorderRadius.full,
    width: 18, height: 18, alignItems: 'center', justifyContent: 'center',
  },
  cartBadgeText: { fontSize: 9, color: Colors.textInverse, fontWeight: '700' },
  searchBar: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: { fontSize: 16 },
  searchPlaceholder: { ...Typography.body, color: Colors.placeholder, fontFamily: FontFamily.arabicRegular, flex: 1 },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingTop: Spacing[4] },

  // Banner
  bannerContainer: { marginHorizontal: Spacing[5], borderRadius: BorderRadius.xl, overflow: 'hidden', marginBottom: Spacing[2] },
  bannerImage: { width: width - Spacing[5] * 2, height: 180 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 5, paddingVertical: Spacing[2] },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primary, width: 18 },

  // Sections
  section: { marginTop: Spacing[5] },
  sectionHeader: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing[5], marginBottom: Spacing[3],
  },
  sectionTitle: { ...Typography.h4, color: Colors.textPrimary, fontFamily: FontFamily.arabicBold },
  seeAll: { ...Typography.label, color: Colors.primary, fontFamily: FontFamily.arabicMedium },

  // Product horizontal list
  productList: { paddingHorizontal: Spacing[5] },

  // Sale Banner
  saleBanner: {
    marginHorizontal: Spacing[5], marginTop: Spacing[5],
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.xl, padding: Spacing[5],
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
  },
  saleBannerText: { ...Typography.bodySmall, color: Colors.textInverse, fontFamily: FontFamily.arabicBold, flex: 1 },
  saleBannerCta: { ...Typography.labelLarge, color: Colors.primary, fontFamily: FontFamily.arabicBold },

  // Grid
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
    paddingHorizontal: Spacing[5], gap: Spacing[3],
  },

  bottomPadding: { height: 100 },
});
