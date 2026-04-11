/**
 * Cart Screen – Full cart management with coupon and checkout flow.
 */
import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FastImage from 'react-native-fast-image';
import { CartStackParamList } from '../../navigation/types';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../theme/colors';
import { Typography, FontFamily, FontSize } from '../../theme/typography';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { Shadows } from '../../theme/shadows';
import { LocalCartItem } from '../../types';

type NavProp = NativeStackNavigationProp<CartStackParamList, 'CartScreen'>;

export default function CartScreen() {
  const navigation = useNavigation<NavProp>();
  const { items, couponCode, applyCoupon, clearCoupon, removeItem, updateQuantity, totalPrice } = useCartStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [couponInput, setCouponInput] = React.useState('');

  const total = totalPrice();
  const isEmpty = items.length === 0;

  const handleCheckout = useCallback(() => {
    if (!isAuthenticated) {
      // Navigate to auth flow
      navigation.getParent()?.getParent()?.navigate('Auth', { screen: 'Login', params: { redirect: 'Checkout' } });
      return;
    }
    navigation.navigate('Checkout');
  }, [isAuthenticated, navigation]);

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    applyCoupon(couponInput.trim());
    setCouponInput('');
  };

  const renderCartItem = (item: LocalCartItem) => (
    <View key={`${item.product_id}_${item.variation_id}`} style={styles.cartItem}>
      <FastImage source={{ uri: item.image }} style={styles.itemImage} resizeMode={FastImage.resizeMode.contain} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.itemPriceRow}>
          <Text style={styles.itemPrice}>
            {parseFloat(item.price).toLocaleString('ar-SY')} ل.س
          </Text>
          {item.on_sale && item.regular_price && (
            <Text style={styles.itemOldPrice}>
              {parseFloat(item.regular_price).toLocaleString('ar-SY')}
            </Text>
          )}
        </View>
        <View style={styles.itemActions}>
          <View style={styles.qtyControls}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => updateQuantity(item.product_id, item.variation_id, item.quantity - 1)}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => updateQuantity(item.product_id, item.variation_id, item.quantity + 1)}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => removeItem(item.product_id, item.variation_id)}>
            <Text style={styles.removeText}>حذف</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>سلة التسوق</Text>
        <Text style={styles.itemCount}>{items.length} منتج</Text>
      </View>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>سلتك فارغة</Text>
          <Text style={styles.emptySubtitle}>ابدأ بإضافة المنتجات إلى سلة التسوق</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.getParent()?.navigate('Home')}
          >
            <Text style={styles.shopBtnText}>تسوّق الآن</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Cart Items */}
            <View style={styles.itemsContainer}>
              {items.map(renderCartItem)}
            </View>

            {/* Coupon Section */}
            <View style={styles.couponSection}>
              <Text style={styles.couponLabel}>كود الخصم</Text>
              {couponCode ? (
                <View style={styles.couponApplied}>
                  <Text style={styles.couponCodeText}>{couponCode}</Text>
                  <TouchableOpacity onPress={clearCoupon}>
                    <Text style={styles.couponRemove}>إزالة</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.couponInputRow}>
                  <TextInput
                    style={styles.couponInput}
                    placeholder="أدخل كود الخصم"
                    placeholderTextColor={Colors.placeholder}
                    value={couponInput}
                    onChangeText={setCouponInput}
                    textAlign="right"
                  />
                  <TouchableOpacity style={styles.couponApplyBtn} onPress={handleApplyCoupon}>
                    <Text style={styles.couponApplyText}>تطبيق</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={{ height: 200 }} />
          </ScrollView>

          {/* Bottom Summary */}
          <View style={styles.bottomBar}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>المجموع</Text>
              <Text style={styles.summaryValue}>{total.toLocaleString('ar-SY')} ل.س</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
              <Text style={styles.checkoutText}>متابعة الشراء</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface, paddingTop: Spacing[10], paddingBottom: Spacing[4],
    paddingHorizontal: Spacing[5], flexDirection: 'row-reverse', justifyContent: 'space-between',
    alignItems: 'baseline', ...Shadows.sm,
  },
  title: { ...Typography.h2, color: Colors.textPrimary, fontFamily: FontFamily.arabicBold },
  itemCount: { ...Typography.label, color: Colors.textSecondary },
  scrollView: { flex: 1 },

  // Empty State
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing[8] },
  emptyIcon: { fontSize: 64, marginBottom: Spacing[4] },
  emptyTitle: { ...Typography.h3, color: Colors.textPrimary, fontFamily: FontFamily.arabicBold, marginBottom: Spacing[2] },
  emptySubtitle: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing[6] },
  shopBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.xl, paddingHorizontal: Spacing[8], paddingVertical: Spacing[3] },
  shopBtnText: { ...Typography.button, color: Colors.textInverse, fontFamily: FontFamily.arabicBold },

  // Cart Items
  itemsContainer: { padding: Spacing[4], gap: Spacing[3] },
  cartItem: {
    flexDirection: 'row-reverse', backgroundColor: Colors.card, borderRadius: BorderRadius.lg,
    padding: Spacing[3], gap: Spacing[3], ...Shadows.card,
  },
  itemImage: { width: 90, height: 90, borderRadius: BorderRadius.md, backgroundColor: Colors.surfaceSecondary },
  itemInfo: { flex: 1, gap: Spacing[1.5] },
  itemName: { ...Typography.bodySmall, color: Colors.textPrimary, fontFamily: FontFamily.arabicMedium, textAlign: 'right' },
  itemPriceRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing[2] },
  itemPrice: { ...Typography.priceSmall, color: Colors.sale, fontFamily: FontFamily.arabicBold },
  itemOldPrice: { ...Typography.caption, color: Colors.textTertiary, textDecorationLine: 'line-through' },
  itemActions: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing[1] },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, paddingHorizontal: Spacing[1] },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 16, color: Colors.textPrimary, fontWeight: '600' },
  qtyValue: { ...Typography.label, color: Colors.textPrimary, minWidth: 20, textAlign: 'center' },
  removeText: { ...Typography.labelSmall, color: Colors.error },

  // Coupon
  couponSection: {
    backgroundColor: Colors.surface, marginHorizontal: Spacing[4], marginTop: Spacing[2],
    borderRadius: BorderRadius.lg, padding: Spacing[4], ...Shadows.card,
  },
  couponLabel: { ...Typography.labelLarge, color: Colors.textPrimary, fontFamily: FontFamily.arabicMedium, textAlign: 'right', marginBottom: Spacing[2] },
  couponInputRow: { flexDirection: 'row-reverse', gap: Spacing[2] },
  couponInput: {
    flex: 1, backgroundColor: Colors.inputBackground, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.inputBorder, paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2], fontSize: FontSize.base, color: Colors.textPrimary,
  },
  couponApplyBtn: { backgroundColor: Colors.secondary, borderRadius: BorderRadius.md, paddingHorizontal: Spacing[4], justifyContent: 'center' },
  couponApplyText: { ...Typography.buttonSmall, color: Colors.textInverse },
  couponApplied: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.successLight, borderRadius: BorderRadius.md, padding: Spacing[3],
  },
  couponCodeText: { ...Typography.labelLarge, color: Colors.success, fontFamily: FontFamily.bold },
  couponRemove: { ...Typography.labelSmall, color: Colors.error },

  // Bottom Bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, padding: Spacing[5], paddingBottom: Spacing[8],
    ...Shadows.xl, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  summaryRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: Spacing[3] },
  summaryLabel: { ...Typography.bodyLarge, color: Colors.textPrimary, fontFamily: FontFamily.arabicMedium },
  summaryValue: { ...Typography.priceLarge, color: Colors.textPrimary, fontFamily: FontFamily.arabicBold },
  checkoutBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.xl,
    paddingVertical: Spacing[4], alignItems: 'center',
  },
  checkoutText: { ...Typography.button, color: Colors.textInverse, fontFamily: FontFamily.arabicBold },
});
