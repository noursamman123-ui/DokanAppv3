/**
 * Orders Screen – List of past orders with status badges.
 */
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { AccountStackParamList } from '../../../navigation/types';
import { OrdersService } from '../../../api/orders.service';
import { useAuthStore } from '../../../store/authStore';
import { ApiError, Order, OrderStatus } from '../../../types';
import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Shadows } from '../../../theme/shadows';
import { formatPrice } from '../../../utils/formatters';

type NavProp = NativeStackNavigationProp<AccountStackParamList, 'Orders'>;

const statusLabels: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'قيد الانتظار', color: Colors.warning, bg: Colors.warningLight },
  processing: { label: 'قيد التجهيز', color: Colors.info, bg: Colors.infoLight },
  'on-hold': { label: 'معلّق', color: Colors.warning, bg: Colors.warningLight },
  completed: { label: 'مكتمل', color: Colors.success, bg: Colors.successLight },
  cancelled: { label: 'ملغي', color: Colors.error, bg: Colors.errorLight },
  refunded: { label: 'مسترجع', color: Colors.textSecondary, bg: Colors.surfaceSecondary },
  failed: { label: 'فشل', color: Colors.error, bg: Colors.errorLight },
  trash: { label: 'محذوف', color: Colors.textTertiary, bg: Colors.surfaceSecondary },
};

export default function OrdersScreen() {
  const navigation = useNavigation<NavProp>();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const handleBackToAccount = () => {
    navigation.navigate('AccountScreen');
  };

  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ['orders', user?.id ?? 'guest'],
    queryFn: () => OrdersService.getOrders(),
    enabled: isHydrated && isAuthenticated,
    retry: 1,
    refetchOnMount: 'always',
  });

  const getErrorMessage = (queryError: unknown) => {
    const apiError = queryError as Partial<ApiError> | null;

    if (apiError?.message && apiError.code !== 'NETWORK_ERROR') {
      return apiError.message;
    }

    if (apiError?.code === 'NETWORK_ERROR') {
      return 'تعذر الاتصال بالخادم أو لم تُرسل الجلسة بشكل صحيح.';
    }

    return 'فشل الاتصال بالخادم. حاول مرة أخرى بعد قليل.';
  };

  const getShippingDuration = (order: Order) => {
    if (order.shipping_duration?.trim()) {
      return order.shipping_duration.trim();
    }

    const directDuration = order.shipping_lines?.find((line) => line.delivery_time?.trim())?.delivery_time;
    if (directDuration?.trim()) {
      return directDuration.trim();
    }

    for (const line of order.shipping_lines ?? []) {
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

  const renderOrder = ({ item }: { item: Order }) => {
    const status = statusLabels[item.status] ?? statusLabels.pending;
    const displayOrderNumber = item.number?.trim() || String(item.id);
    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderNum}>طلب #{displayOrderNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>التاريخ</Text>
            <Text style={styles.infoValue}>{new Date(item.date_created).toLocaleDateString('ar-SY')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>المنتجات</Text>
            <Text style={styles.infoValue}>{item.line_items.length} منتج</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>الشحن</Text>
            <Text style={styles.infoValue}>{formatPrice(item.shipping_total ?? '0', item.currency_symbol)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>مدة الشحن</Text>
            <Text style={styles.infoValue}>{getShippingDuration(item)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>الإجمالي</Text>
            <Text style={styles.totalValue}>{formatPrice(item.total, item.currency_symbol)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToAccount}>
          <Text style={styles.backIcon}>رجوع</Text>
        </TouchableOpacity>
        <Text style={styles.title}>طلباتي</Text>
        <View style={{ width: 40 }} />
      </View>

      {!isHydrated || isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color={Colors.primary} />
      ) : !isAuthenticated ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔐</Text>
          <Text style={styles.emptyText}>يرجى تسجيل الدخول لعرض طلباتك السابقة</Text>
        </View>
      ) : error ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyText}>حدث خطأ أثناء جلب الطلبات</Text>
          <Text style={styles.errorDetail}>{getErrorMessage(error)}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders ?? []}
          renderItem={renderOrder}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>لا توجد طلبات سابقة</Text>
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
    backgroundColor: Colors.surface, paddingTop: Spacing[10], paddingBottom: Spacing[3],
    paddingHorizontal: Spacing[4], flexDirection: 'row-reverse', alignItems: 'center',
    justifyContent: 'space-between', ...Shadows.sm,
  },
  backIcon: { fontSize: 22, color: Colors.textPrimary },
  title: { ...Typography.h4, color: Colors.textPrimary, fontFamily: FontFamily.arabicBold },
  list: { padding: Spacing[4], paddingBottom: 100 },
  loader: { flex: 1, justifyContent: 'center' },
  card: { backgroundColor: Colors.card, borderRadius: BorderRadius.lg, padding: Spacing[4], marginBottom: Spacing[3], ...Shadows.card },
  cardHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: Spacing[3] },
  orderNum: { ...Typography.labelLarge, color: Colors.textPrimary, fontFamily: FontFamily.arabicBold },
  statusBadge: { paddingHorizontal: Spacing[3], paddingVertical: 3, borderRadius: BorderRadius.full },
  statusText: { ...Typography.labelSmall, fontFamily: FontFamily.arabicMedium },
  cardBody: { gap: Spacing[1.5] },
  infoRow: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  infoLabel: { ...Typography.bodySmall, color: Colors.textSecondary },
  infoValue: { ...Typography.bodySmall, color: Colors.textPrimary, fontFamily: FontFamily.arabicMedium },
  totalValue: { ...Typography.priceSmall, color: Colors.sale, fontFamily: FontFamily.arabicBold },
  empty: { alignItems: 'center', paddingTop: Spacing[16] },
  emptyIcon: { fontSize: 48, marginBottom: Spacing[4] },
  emptyText: { ...Typography.body, color: Colors.textSecondary },
  errorDetail: { ...Typography.caption, color: Colors.error, marginTop: Spacing[2], paddingHorizontal: Spacing[10], textAlign: 'center' },
  retryBtn: { marginTop: Spacing[4], paddingHorizontal: Spacing[6], paddingVertical: Spacing[2], backgroundColor: Colors.primary, borderRadius: BorderRadius.md },
  retryText: { ...Typography.button, color: Colors.textInverse },
});
