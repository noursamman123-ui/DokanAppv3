/**
 * ProductCard – Noon-inspired professional product card.
 * Displays image, name, price, discount badge, and action buttons.
 */
import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { Product, getDiscountPercent } from '../../types';
import { Colors } from '../../theme/colors';
import { Typography, FontFamily, FontSize } from '../../theme/typography';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { Shadows } from '../../theme/shadows';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { buildFastImageSource, resolveMediaUrl } from '../../utils/media';
import AddToCartSuccessModal from '../feedback/AddToCartSuccessModal';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing[5] * 2 - Spacing[3]) / 2;

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  horizontal?: boolean; // For horizontal lists
}

function ProductCard({ product, onPress, horizontal = false }: ProductCardProps) {
  const navigation = useNavigation<any>();
  const addToCart = useCartStore((s) => s.addItem);
  const wishlisted = useWishlistStore((s) =>
    s.items.some((item) => item.product_id === product.id)
  );
  const addToWishlist = useWishlistStore((s) => s.addItem);
  const removeFromWishlist = useWishlistStore((s) => s.removeItem);
  const legacyProduct = product as Product & {
    price?: string;
    regular_price?: string;
    sale_price?: string;
  };

  const discountPercent = getDiscountPercent(product);
  const isOutOfStock = product.stock_status === 'outofstock';
  const imageUrl = resolveMediaUrl(product.images[0]?.src);
  const [showAddSuccessModal, setShowAddSuccessModal] = useState(false);
  
  // Clean price string: handle both numbers and strings, keep decimal point
  const cleanPrice = (val: any) => {
    if (val === undefined || val === null || val === '') return '0';
    const str = String(val);
    // Keep only digits and the FIRST dot/comma as decimal separator
    const cleaned = str.replace(/[^\d.,]/g, '').replace(',', '.');
    return cleaned || '0';
  };

  const price = cleanPrice(product.prices?.price ?? legacyProduct.sale_price ?? legacyProduct.price);
  const regularPrice = cleanPrice(product.prices?.regular_price ?? legacyProduct.regular_price ?? legacyProduct.price);
  const salePrice = cleanPrice(product.prices?.sale_price ?? legacyProduct.sale_price ?? legacyProduct.price);

  const handleAddToCart = useCallback(() => {
    if (isOutOfStock) return;
    if (product.type === 'variable') {
      onPress(product);
      return;
    }
    addToCart({
      product_id: product.id,
      variation_id: 0,
      quantity: 1,
      name: product.name,
      image: imageUrl,
      price: price,
      regular_price: regularPrice,
      on_sale: product.on_sale,
      variation: {},
    });
    setShowAddSuccessModal(true);
  }, [addToCart, onPress, product, price, regularPrice, imageUrl, isOutOfStock]);

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

    navigation.navigate('Cart');
  }, [navigation]);

  const handleWishlistToggle = useCallback(() => {
    if (wishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        product_id: product.id,
        name: product.name,
        image: imageUrl,
        price: price,
        regular_price: regularPrice,
        sale_price: salePrice,
        on_sale: product.on_sale,
        in_stock: !isOutOfStock,
        slug: product.slug,
        added_at: new Date().toISOString(),
      });
    }
  }, [wishlisted, product, price, regularPrice, salePrice, imageUrl, isOutOfStock, addToWishlist, removeFromWishlist]);

  const cardStyle = horizontal
    ? [styles.card, styles.cardHorizontal]
    : [styles.card, { width: CARD_WIDTH }];

  return (
    <>
      <TouchableOpacity
        style={cardStyle}
        onPress={() => onPress(product)}
        activeOpacity={0.9}
      >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <FastImage
            source={buildFastImageSource(imageUrl, horizontal ? 'high' : 'normal')}
            style={horizontal ? styles.imageHorizontal : styles.image}
            resizeMode={FastImage.resizeMode.contain}
          />
        ) : (
          <View style={[horizontal ? styles.imageHorizontal : styles.image, styles.imageFallbackContainer]}>
            <Text style={styles.imageFallbackText}>📦</Text>
          </View>
        )}

        {/* Discount Badge */}
        {discountPercent && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercent}%</Text>
          </View>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>نفذت الكمية</Text>
          </View>
        )}

        {/* Wishlist Button */}
        <TouchableOpacity style={styles.wishlistBtn} onPress={handleWishlistToggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.wishlistIcon, wishlisted && styles.wishlistActive]}>
            {wishlisted ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        {/* Rating */}
        {parseFloat(product.average_rating) > 0 && (
          <View style={styles.ratingRow}>
            <Text style={styles.ratingStar}>⭐</Text>
            <Text style={styles.ratingText}>{parseFloat(product.average_rating).toFixed(1)}</Text>
            {product.rating_count > 0 && (
              <Text style={styles.ratingCount}>({product.rating_count})</Text>
            )}
          </View>
        )}

        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {parseFloat(price) > 0 
              ? (parseFloat(price) || 0).toLocaleString('ar-SY') 
              : '0'} ل.س
          </Text>
          {product.on_sale && regularPrice && parseFloat(regularPrice) > 0 && parseFloat(regularPrice) > parseFloat(price) && (
            <Text style={styles.regularPrice}>
              {(parseFloat(regularPrice) || 0).toLocaleString('ar-SY')}
            </Text>
          )}
        </View>

        {/* Add to Cart */}
        <TouchableOpacity
          style={[styles.cartBtn, isOutOfStock && styles.cartBtnDisabled]}
          onPress={handleAddToCart}
          disabled={isOutOfStock}
        >
          <Text style={styles.cartBtnText}>
            {isOutOfStock ? 'نفذت الكمية' : product.type === 'variable' ? 'عرض الخيارات' : 'إضافة للسلة'}
          </Text>
        </TouchableOpacity>
      </View>
      </TouchableOpacity>

      <AddToCartSuccessModal
        visible={showAddSuccessModal}
        onContinueShopping={() => setShowAddSuccessModal(false)}
        onGoToCart={handleGoToCart}
      />
    </>
  );
}

export default React.memo(ProductCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.card,
    marginBottom: Spacing[3],
  },
  cardHorizontal: {
    width: 180,
    marginRight: Spacing[3],
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: Colors.surfaceSecondary,
  },
  image: {
    width: '100%',
    height: CARD_WIDTH - 16,
    backgroundColor: Colors.surfaceSecondary,
  },
  imageHorizontal: {
    width: 180,
    height: 160,
    backgroundColor: Colors.surfaceSecondary,
  },
  imageFallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFallbackText: {
    ...Typography.bodyLarge,
    color: Colors.textTertiary,
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing[2],
    left: Spacing[2],
    backgroundColor: '#FF3B30', // Vibrant Red
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing[1.5],
    paddingVertical: 2,
    zIndex: 10,
  },
  discountText: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontFamily: FontFamily.bold,
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    ...Typography.label,
    color: Colors.textSecondary,
    fontFamily: FontFamily.arabicSemiBold,
  },
  wishlistBtn: {
    position: 'absolute',
    top: Spacing[2],
    right: Spacing[2],
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.overlayWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistIcon: {
    fontSize: 20,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  wishlistActive: {
    color: '#E02020',
  },

  content: {
    padding: Spacing[3],
    gap: Spacing[1.5],
  },
  name: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontFamily: FontFamily.arabicMedium,
    textAlign: 'right',
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 3,
  },
  ratingStar: { fontSize: 10 },
  ratingText: {
    ...Typography.labelSmall,
    color: Colors.rating,
    fontFamily: FontFamily.bold,
  },
  ratingCount: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  priceRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: Spacing[2],
  },
  price: {
    ...Typography.priceSmall,
    color: '#E02020', // Explicit Red for price
    fontFamily: FontFamily.arabicBold,
  },
  regularPrice: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  cartBtn: {
    backgroundColor: '#FF9500', // Vibrant Orange matching the user image
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing[2.5],
    alignItems: 'center',
    marginTop: Spacing[1],
  },
  cartBtnDisabled: {
    backgroundColor: Colors.border,
  },
  cartBtnText: {
    fontSize: FontSize.xs,
    color: Colors.textInverse,
    fontFamily: FontFamily.arabicBold,
    fontWeight: '700',
  },
});
