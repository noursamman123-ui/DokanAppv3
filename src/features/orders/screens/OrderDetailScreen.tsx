import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import FastImage from 'react-native-fast-image';
import { AccountStackParamList } from '../../../navigation/types';
import { OrdersService } from '../../../api/orders.service';
import { Order } from '../../../types';
import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Shadows } from '../../../theme/shadows';
import { formatPrice } from '../../../utils/formatters';

type RoutePropType = RouteProp<AccountStackParamList, 'OrderDetail'>;

export default function OrderDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RoutePropType>();
  const { orderId } = route.params;

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => OrdersService.getOrder(orderId),
  });

  if (isLoading || !order) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  const displayOrderNumber = order.number?.trim() || String(order.id);
  const getShippingDuration = (targetOrder: Order) => {
    if (targetOrder.shipping_duration?.trim()) {
      return targetOrder.shipping_duration.trim();
    }

    const directDuration = targetOrder.shipping_lines?.find((line) => line.delivery_time?.trim())?.delivery_time;
    if (directDuration?.trim()) {
      return directDuration.trim();
    }

    for (const line of targetOrder.shipping_lines ?? []) {
      for (const meta of line.meta_data ?? []) {
        const key = (meta.key ?? '').toLowerCase().trim();
        const value = (meta.value ?? '').trim();
        if (value && ['delivery_time', '_delivery_time', 'shipping_duration', '_shipping_duration', 'estimated_delivery', '_estimated_delivery'].includes(key)) {
          return value;
        }
      }
    }

    return 'غير محددة';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>رجوع</Text>
        </TouchableOpacity>
        <Text style={styles.title}>طلب #{displayOrderNumber}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المنتجات</Text>
          {order.line_items.map((item) => (
            <View key={item.id} style={styles.lineItem}>
              <FastImage source={{ uri: item.image?.src ?? '' }} style={styles.itemImage} resizeMode={FastImage.resizeMode.contain} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemQty}>الكمية: {item.quantity}</Text>
                <Text style={styles.itemTotal}>{formatPrice(item.total, order.currency_symbol)}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>العنوان</Text>
          <Text style={styles.address}>{order.shipping.first_name} {order.shipping.last_name}</Text>
          <Text style={styles.address}>{order.shipping.address_1}, {order.shipping.city}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ملخص</Text>
          <InfoRow label="طريقة الدفع" value={order.payment_method_title} />
          <InfoRow label="الحالة" value={order.status} />
          <InfoRow label="الشحن" value={formatPrice(order.shipping_total ?? '0', order.currency_symbol)} />
          <InfoRow label="مدة الشحن" value={getShippingDuration(order)} />
          <InfoRow label="الإجمالي" value={formatPrice(order.total, order.currency_symbol)} bold />
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, bold && styles.infoValueBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: Colors.surface, paddingTop: Spacing[10], paddingBottom: Spacing[3],
    paddingHorizontal: Spacing[4], flexDirection: 'row-reverse', alignItems: 'center',
    justifyContent: 'space-between', ...Shadows.sm,
  },
  backIcon: { fontSize: 16, color: Colors.textPrimary },
  title: { ...Typography.h4, color: Colors.textPrimary, fontFamily: FontFamily.arabicBold },
  content: { padding: Spacing[4], gap: Spacing[3] },
  section: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing[4], ...Shadows.card },
  sectionTitle: { ...Typography.h4, color: Colors.textPrimary, fontFamily: FontFamily.arabicBold, textAlign: 'right', marginBottom: Spacing[3] },
  lineItem: { flexDirection: 'row-reverse', gap: Spacing[3], paddingVertical: Spacing[3], borderBottomWidth: 1, borderBottomColor: Colors.divider },
  itemImage: { width: 60, height: 60, borderRadius: BorderRadius.md, backgroundColor: Colors.surfaceSecondary },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { ...Typography.bodySmall, color: Colors.textPrimary, fontFamily: FontFamily.arabicMedium, textAlign: 'right' },
  itemQty: { ...Typography.caption, color: Colors.textSecondary, textAlign: 'right' },
  itemTotal: { ...Typography.priceSmall, color: Colors.sale, fontFamily: FontFamily.arabicBold, textAlign: 'right' },
  address: { ...Typography.body, color: Colors.textSecondary, textAlign: 'right', lineHeight: 22 },
  infoRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: Spacing[1.5] },
  infoLabel: { ...Typography.body, color: Colors.textSecondary },
  infoValue: { ...Typography.body, color: Colors.textPrimary, fontFamily: FontFamily.arabicMedium },
  infoValueBold: { ...Typography.priceLarge, color: Colors.sale, fontFamily: FontFamily.arabicBold },
});
