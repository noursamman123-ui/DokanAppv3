/**
 * Wishlist Screen – Saved items with move-to-cart and remove actions.
 */
import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { WishlistItem } from '../../types';
import { Colors } from '../../theme/colors';
import { Typography, FontFamily } from '../../theme/typography';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { Shadows } from '../../theme/shadows';

export default function WishlistScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { items, removeItem } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);

  const handleMoveToCart = useCallback((item: WishlistItem) => {
    addToCart({
      product_id: item.product_id,
      variation_id: 0,
      quantity: 1,
      name: item.name,
      image: item.image,
      price: item.on_sale ? item.sale_price : item.price,
      regular_price: item.regular_price,
      on_sale: item.on_sale,
      variation: {},
    });
    removeItem(item.product_id);
  }, [addToCart, removeItem]);

  const renderItem = ({ item }: { item: WishlistItem }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => (navigation as any).navigate('ProductDetail', { productId: item.product_id })}
        style={styles.cardInner}
      >
        <FastImage source={{ uri: item.image }} style={styles.image} resizeMode={FastImage.resizeMode.contain} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{parseFloat(item.on_sale ? item.sale_price : item.price).toLocaleString('ar-SY')} ل.س</Text>
            {item.on_sale && (
              <Text style={styles.oldPrice}>{parseFloat(item.regular_price).toLocaleString('ar-SY')}</Text>
            )}
          </View>
          <Text style={[styles.stock, !item.in_stock && styles.outOfStock]}>
            {item.in_stock ? 'متوفر' : 'غير متوفر'}
          </Text>
        </View>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.moveBtn} onPress={() => handleMoveToCart(item)}>
          <Text style={styles.moveBtnText}>نقل للسلة 🛒</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => removeItem(item.product_id)}>
          <Text style={styles.removeText}>إزالة</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
      <View style={styles.header}>
        <Text style={styles.title}>المفضلة</Text>
        <Text style={styles.count}>{items.length} منتج</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>♡</Text>
          <Text style={styles.emptyTitle}>قائمة المفضلة فارغة</Text>
          <Text style={styles.emptySubtitle}>أضف منتجاتك المفضلة هنا لتتمكن من الوصول إليها بسهولة</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.product_id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
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
  count: { ...Typography.label, color: Colors.textSecondary },
  list: { padding: Spacing[4], paddingBottom: 100 },
  card: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, marginBottom: Spacing[3], ...Shadows.card, overflow: 'hidden' },
  cardInner: { flexDirection: 'row-reverse', padding: Spacing[3], gap: Spacing[3] },
  image: { width: 90, height: 90, borderRadius: BorderRadius.md, backgroundColor: Colors.surfaceSecondary },
  info: { flex: 1, gap: Spacing[1] },
  name: { ...Typography.bodySmall, color: Colors.textPrimary, fontFamily: FontFamily.arabicMedium, textAlign: 'right' },
  priceRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing[2] },
  price: { ...Typography.priceSmall, color: Colors.sale, fontFamily: FontFamily.arabicBold },
  oldPrice: { ...Typography.caption, color: Colors.textTertiary, textDecorationLine: 'line-through' },
  stock: { ...Typography.caption, color: Colors.success, textAlign: 'right' },
  outOfStock: { color: Colors.error },
  actions: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: Colors.divider, paddingHorizontal: Spacing[3], paddingVertical: Spacing[2],
  },
  moveBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: Spacing[4], paddingVertical: Spacing[2] },
  moveBtnText: { ...Typography.buttonSmall, color: Colors.textInverse, fontFamily: FontFamily.arabicBold },
  removeText: { ...Typography.labelSmall, color: Colors.error },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing[8] },
  emptyIcon: { fontSize: 64, marginBottom: Spacing[4], color: Colors.textTertiary },
  emptyTitle: { ...Typography.h3, color: Colors.textPrimary, fontFamily: FontFamily.arabicBold, marginBottom: Spacing[2] },
  emptySubtitle: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center' },
});
