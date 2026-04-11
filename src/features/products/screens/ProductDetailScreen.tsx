/**
 * Product Detail Screen – Full product view with images, price, variations,
 * add to cart, wishlist, and related products.
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import FastImage from 'react-native-fast-image';
import { HomeStackParamList } from '../../../navigation/types';
import { ProductsService } from '../../../api/products.service';
import { Product, getDiscountPercent } from '../../../types';
import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Shadows } from '../../../theme/shadows';
import { useCartStore } from '../../../store/cartStore';
import { useWishlistStore } from '../../../store/wishlistStore';
import ProductCard from '../../../components/cards/ProductCard';
import { buildFastImageSource, resolveMediaUrl } from '../../../utils/media';
import AddToCartSuccessModal from '../../../components/feedback/AddToCartSuccessModal';

const { width } = Dimensions.get('window');

type RoutePropType = RouteProp<HomeStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RoutePropType>();
  const { productId } = route.params;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [selectedVariationId, setSelectedVariationId] = useState<number | null>(null);
  const [showAddSuccessModal, setShowAddSuccessModal] = useState(false);

  const addToCart = useCartStore((s) => s.addItem);
  const wishlisted = useWishlistStore((s) =>
    s.items.some((item) => item.product_id === productId)
  );
  const addToWishlist = useWishlistStore((s) => s.addItem);
  const removeFromWishlist = useWishlistStore((s) => s.removeItem);
  
  const cleanPrice = (val: any) => {
    if (val === undefined || val === null || val === '') return '0';
    const str = String(val);
    const cleaned = str.replace(/[^\d.,]/g, '').replace(',', '.');
    return cleaned || '0';
  };

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => ProductsService.getProduct(productId),
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['related', productId],
    queryFn: () => ProductsService.getRelated(productId),
    enabled: !!product,
  });

  const { data: variations = [] } = useQuery({
    queryKey: ['product-variations', productId],
    queryFn: () => ProductsService.getVariations(productId),
    enabled: product?.type === 'variable',
  });

  const discountPercent = product ? getDiscountPercent(product) : null;
  const isOutOfStock = product?.stock_status === 'outofstock';
  const selectedVariation = variations.find((variation) => variation.id === selectedVariationId) ?? variations[0];

  React.useEffect(() => {
    if (product?.type === 'variable' && variations.length > 0 && !selectedVariationId) {
      setSelectedVariationId(variations[0].id);
    }
  }, [product?.type, selectedVariationId, variations]);

  const parseVariationParams = (permalink?: string) => {
    if (!permalink) {
      return {};
    }

    const query = permalink.split('?')[1];
    if (!query) {
      return {};
    }

    return Object.fromEntries(
      query
        .split('&')
        .map((entry) => entry.split('='))
        .filter(([key, value]) => key?.startsWith('attribute_') && value)
        .map(([key, value]) => [decodeURIComponent(key), decodeURIComponent(value)])
    );
  };

  const getAttributeValueText = (attr: Product['attributes'][number]) => {
    if (Array.isArray(attr.options) && attr.options.length > 0) {
      return attr.options.join('، ');
    }

    if (Array.isArray(attr.terms) && attr.terms.length > 0) {
      return attr.terms
        .map((term) => term?.name)
        .filter(Boolean)
        .join('، ');
    }

    if (typeof attr.value === 'string' && attr.value.trim()) {
      return attr.value;
    }

    return 'غير متوفر';
  };

  const handleAddToCart = useCallback(() => {
    if (!product || isOutOfStock) return;
    const activeProduct = product.type === 'variable' ? selectedVariation : product;

    if (!activeProduct) {
      Alert.alert('تنبيه', 'يرجى اختيار المقاس أو اللون قبل إضافة المنتج إلى السلة');
      return;
    }

    const priceVal = cleanPrice(activeProduct.prices.price);
    const regPriceVal = cleanPrice(activeProduct.prices.regular_price);
    addToCart({
      product_id: product.id,
      variation_id: product.type === 'variable' ? activeProduct.id : 0,
      quantity,
      name: product.type === 'variable' && activeProduct.variation
        ? `${product.name} - ${activeProduct.variation}`
        : product.name,
      image: resolveMediaUrl(activeProduct.images[0]?.src ?? product.images[0]?.src ?? ''),
      price: priceVal,
      regular_price: regPriceVal,
      on_sale: activeProduct.on_sale,
      variation: product.type === 'variable' ? parseVariationParams(activeProduct.permalink) : {},
    });
    setShowAddSuccessModal(true);
  }, [addToCart, product, quantity, isOutOfStock, selectedVariation]);

  const handleGoToCart = useCallback(() => {
    setShowAddSuccessModal(false);

    const parent = navigation.getParent?.();
    const grandParent = parent?.getParent?.();

    if (parent?.getState?.()?.routeNames?.includes('Cart')) {
      parent.navigate('Cart');
      return;
    }

    if (grandParent?.getState?.()?.routeNames?.includes('Cart')) {
      grandParent.navigate('Cart');
      return;
    }

    (navigation as any).navigate('Cart');
  }, [navigation]);

  const handleWishlistToggle = useCallback(() => {
    if (!product) return;
    if (wishlisted) {
      removeFromWishlist(product.id);
    } else {
      const priceVal = cleanPrice(product.prices.price);
      const regPriceVal = cleanPrice(product.prices.regular_price);
      const salePriceVal = cleanPrice(product.prices.sale_price);

      addToWishlist({
        product_id: product.id,
        name: product.name,
        image: resolveMediaUrl(product.images[0]?.src ?? ''),
        price: priceVal,
        regular_price: regPriceVal,
        sale_price: salePriceVal,
        on_sale: product.on_sale,
        in_stock: !isOutOfStock,
        slug: product.slug,
        added_at: new Date().toISOString(),
      });
    }
  }, [product, wishlisted, addToWishlist, removeFromWishlist, isOutOfStock]);

  const handleProductPress = useCallback((p: Product) => {
    (navigation as any).navigate('ProductDetail', { productId: p.id, productName: p.name });
  }, [navigation]);

  if (isLoading || !product) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const activeDisplayProduct = product.type === 'variable' && selectedVariation ? selectedVariation : product;
  const price = activeDisplayProduct.prices.price;
  const mainImageUri = resolveMediaUrl(product.images[selectedImageIndex]?.src);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Text style={styles.headerBtnIcon}>رجوع</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleWishlistToggle} style={styles.headerBtn}>
          <Text style={[styles.headerBtnIcon, styles.wishlistHeaderIcon, wishlisted && styles.wishlistHeaderIconActive]}>
            {wishlisted ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Image Gallery */}
        <View style={styles.imageSection}>
          {mainImageUri ? (
            <FastImage
              source={buildFastImageSource(mainImageUri, 'high')}
              style={styles.mainImage}
              resizeMode={FastImage.resizeMode.contain}
            />
          ) : (
            <View style={[styles.mainImage, styles.mainImageFallback]}>
              <Text style={styles.mainImageFallbackText}>📦</Text>
            </View>
          )}

          {discountPercent && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercent}%</Text>
            </View>
          )}

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailRow}>
              {product.images.map((img, i) => {
                const thumbnailUri = resolveMediaUrl(img.src);
                return (
                <TouchableOpacity
                  key={`img-${String(img.id ?? 'na')}-${i}`}
                  onPress={() => setSelectedImageIndex(i)}
                  style={[styles.thumbnail, i === selectedImageIndex && styles.thumbnailActive]}
                >
                  {thumbnailUri ? (
                    <FastImage
                      source={buildFastImageSource(thumbnailUri, 'normal')}
                      style={styles.thumbnailImage}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                  ) : (
                    <View style={[styles.thumbnailImage, styles.mainImageFallback]}>
                      <Text style={styles.thumbnailFallbackText}>📦</Text>
                    </View>
                  )}
                </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating */}
          {parseFloat(product.average_rating) > 0 && (
            <View style={styles.ratingRow}>
              <Text style={styles.ratingStar}>⭐</Text>
              <Text style={styles.ratingText}>{parseFloat(product.average_rating).toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({product.rating_count} تقييم)</Text>
            </View>
          )}

          {/* Price */}
          <View style={styles.priceSection}>
            <Text style={styles.currentPrice}>
              {(parseFloat(cleanPrice(price)) || 0).toLocaleString('ar-SY')} ل.س
            </Text>
            {product.on_sale && product.prices.regular_price && (
              <View style={styles.priceOldRow}>
                <Text style={styles.oldPrice}>
                  {(parseFloat(cleanPrice(product.prices.regular_price)) || 0).toLocaleString('ar-SY')} ل.س
                </Text>
                <View style={styles.saveBadge}>
                  <Text style={styles.saveText}>وفّر {discountPercent}%</Text>
                </View>
              </View>
            )}
          </View>

          {/* Stock Status */}
          <View style={[styles.stockBadge, isOutOfStock && styles.stockBadgeOut]}>
            <Text style={[styles.stockText, isOutOfStock && styles.stockTextOut]}>
              {isOutOfStock ? 'غير متوفر' : 'متوفر'}
            </Text>
          </View>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <View style={styles.quantityRow}>
              <Text style={styles.quantityLabel}>الكمية:</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {product.type === 'variable' && variations.length > 0 && (
            <View style={styles.descSection}>
              <Text style={styles.descTitle}>الخيارات المتاحة</Text>
              <View style={styles.variationList}>
                {variations.map((variation, index) => (
                  <TouchableOpacity
                    key={`variation-${String(variation.id ?? 'na')}-${index}`}
                    style={[
                      styles.variationChip,
                      selectedVariation?.id === variation.id && styles.variationChipActive,
                    ]}
                    onPress={() => setSelectedVariationId(variation.id)}
                  >
                    <Text
                      style={[
                        styles.variationChipText,
                        selectedVariation?.id === variation.id && styles.variationChipTextActive,
                      ]}
                    >
                      {variation.variation || variation.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Short Description */}
          {product.short_description ? (
            <View style={styles.descSection}>
              <Text style={styles.descTitle}>وصف مختصر</Text>
              <Text style={styles.descText}>
                {product.short_description.replace(/<[^>]*>/g, '')}
              </Text>
            </View>
          ) : null}

          {/* Full Description */}
          {product.description ? (
            <View style={styles.descSection}>
              <Text style={styles.descTitle}>تفاصيل المنتج</Text>
              <Text style={styles.descText} numberOfLines={showFullDesc ? undefined : 4}>
                {product.description.replace(/<[^>]*>/g, '')}
              </Text>
              <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)}>
                <Text style={styles.readMore}>{showFullDesc ? 'أقل' : 'قراءة المزيد'}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Attributes */}
          {product.attributes.length > 0 && (
            <View style={styles.descSection}>
              <Text style={styles.descTitle}>المواصفات</Text>
              {product.attributes.map((attr, index) => (
                <View key={`attr-${String(attr.id ?? 'na')}-${attr.name}-${index}`} style={styles.attrRow}>
                  <Text style={styles.attrName}>{attr.name}:</Text>
                  <Text style={styles.attrValue}>{getAttributeValueText(attr)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>منتجات ذات صلة</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {relatedProducts.map((rp, index) => (
                <ProductCard key={`related-${String(rp.id ?? 'na')}-${index}`} product={rp} onPress={handleProductPress} horizontal />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.addToCartBtn, isOutOfStock && styles.btnDisabled]}
          onPress={handleAddToCart}
          disabled={isOutOfStock}
        >
          <Text style={styles.addToCartText}>
            {isOutOfStock ? 'غير متوفر' : 'إضافة للسلة'}
          </Text>
          {!isOutOfStock && (
            <Text style={styles.addToCartPrice}>
              {(parseFloat(cleanPrice(price)) * quantity).toLocaleString('ar-SY')} ل.س
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <AddToCartSuccessModal
        visible={showAddSuccessModal}
        onContinueShopping={() => setShowAddSuccessModal(false)}
        onGoToCart={handleGoToCart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },

  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    paddingTop: Spacing[10], paddingHorizontal: Spacing[4],
    flexDirection: 'row-reverse', justifyContent: 'space-between',
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: BorderRadius.full,
    backgroundColor: Colors.overlayWhite, alignItems: 'center', justifyContent: 'center',
  },
  headerBtnIcon: { fontSize: 20 },
  wishlistHeaderIcon: { color: Colors.textSecondary, lineHeight: 22 },
  wishlistHeaderIconActive: { color: '#E02020' },

  scrollContent: {},

  imageSection: {
    backgroundColor: Colors.surface, paddingTop: Spacing[16], paddingBottom: Spacing[4],
  },
  mainImage: { width: width, height: width * 0.75 },
  mainImageFallback: { alignItems: 'center', justifyContent: 'center' },
  mainImageFallbackText: { ...Typography.h2, color: Colors.textTertiary },
  discountBadge: {
    position: 'absolute', top: Spacing[16], left: Spacing[4],
    backgroundColor: Colors.sale, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing[2], paddingVertical: Spacing[1],
  },
  discountText: { ...Typography.label, color: Colors.textInverse, fontFamily: FontFamily.bold },
  thumbnailRow: { paddingHorizontal: Spacing[4], marginTop: Spacing[3] },
  thumbnail: {
    width: 64, height: 64, borderRadius: BorderRadius.md, borderWidth: 2,
    borderColor: Colors.border, marginRight: Spacing[2], overflow: 'hidden',
  },
  thumbnailActive: { borderColor: Colors.primary },
  thumbnailImage: { width: '100%', height: '100%' },
  thumbnailFallbackText: { ...Typography.caption, color: Colors.textTertiary },

  infoSection: { backgroundColor: Colors.surface, marginTop: Spacing[2], padding: Spacing[5] },
  productName: { ...Typography.h3, color: Colors.textPrimary, fontFamily: FontFamily.arabicBold, textAlign: 'right', marginBottom: Spacing[2] },
  ratingRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, marginBottom: Spacing[3] },
  ratingStar: { fontSize: 14 },
  ratingText: { ...Typography.label, color: Colors.rating, fontFamily: FontFamily.bold },
  ratingCount: { ...Typography.caption, color: Colors.textTertiary },

  priceSection: { marginBottom: Spacing[3] },
  currentPrice: { ...Typography.priceLarge, color: Colors.sale, fontFamily: FontFamily.arabicBold, textAlign: 'right' },
  priceOldRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing[2], marginTop: Spacing[1] },
  oldPrice: { ...Typography.body, color: Colors.textTertiary, textDecorationLine: 'line-through', textAlign: 'right' },
  saveBadge: { backgroundColor: Colors.successLight, paddingHorizontal: Spacing[2], paddingVertical: 2, borderRadius: BorderRadius.sm },
  saveText: { ...Typography.caption, color: Colors.success, fontFamily: FontFamily.arabicBold },

  stockBadge: { alignSelf: 'flex-end', backgroundColor: Colors.successLight, paddingHorizontal: Spacing[3], paddingVertical: Spacing[1], borderRadius: BorderRadius.full, marginBottom: Spacing[4] },
  stockBadgeOut: { backgroundColor: Colors.errorLight },
  stockText: { ...Typography.labelSmall, color: Colors.success, fontFamily: FontFamily.arabicMedium },
  stockTextOut: { color: Colors.error },

  quantityRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing[5] },
  quantityLabel: { ...Typography.labelLarge, color: Colors.textPrimary, fontFamily: FontFamily.arabicMedium },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing[2], paddingVertical: Spacing[1] },
  qtyBtn: { width: 36, height: 36, borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 20, color: Colors.textPrimary, fontWeight: '600' },
  qtyValue: { ...Typography.h4, color: Colors.textPrimary, minWidth: 32, textAlign: 'center' },

  descSection: { borderTopWidth: 1, borderTopColor: Colors.divider, paddingTop: Spacing[4], marginTop: Spacing[4] },
  descTitle: { ...Typography.h4, color: Colors.textPrimary, fontFamily: FontFamily.arabicBold, textAlign: 'right', marginBottom: Spacing[2] },
  descText: { ...Typography.body, color: Colors.textSecondary, textAlign: 'right', lineHeight: 22 },
  readMore: { ...Typography.labelLarge, color: Colors.primary, textAlign: 'right', marginTop: Spacing[1] },
  variationList: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: Spacing[2] },
  variationChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    backgroundColor: Colors.surfaceSecondary,
  },
  variationChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySurface,
  },
  variationChipText: {
    ...Typography.label,
    color: Colors.textPrimary,
    fontFamily: FontFamily.arabicMedium,
  },
  variationChipTextActive: {
    color: Colors.primary,
  },

  attrRow: { flexDirection: 'row-reverse', gap: Spacing[2], marginBottom: Spacing[1] },
  attrName: { ...Typography.label, color: Colors.textPrimary, fontFamily: FontFamily.arabicMedium },
  attrValue: { ...Typography.body, color: Colors.textSecondary },

  relatedSection: { backgroundColor: Colors.surface, marginTop: Spacing[2], padding: Spacing[5] },
  relatedTitle: { ...Typography.h4, color: Colors.textPrimary, fontFamily: FontFamily.arabicBold, textAlign: 'right', marginBottom: Spacing[4] },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, padding: Spacing[4],
    paddingBottom: Spacing[8], ...Shadows.xl, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  addToCartBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.xl,
    paddingVertical: Spacing[4], flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: Spacing[3],
  },
  btnDisabled: { backgroundColor: Colors.border },
  addToCartText: { ...Typography.button, color: Colors.textInverse, fontFamily: FontFamily.arabicBold },
  addToCartPrice: { ...Typography.label, color: 'rgba(255,255,255,0.9)' },
});
