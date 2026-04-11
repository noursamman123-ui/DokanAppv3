import apiClient from './client';
import { Endpoints } from './endpoints';
import { Order, CheckoutData, LocalCartItem } from '../types';
import { TokenStorage } from '../utils/storage';
import { CartService } from './cart.service';

const normalizeVariation = (
  variation?: Record<string, string> | Array<{ attribute: string; value: string }>
) => {
  if (!variation) {
    return '';
  }

  const entries = Array.isArray(variation)
    ? variation.map(({ attribute, value }) => [attribute, value] as const)
    : Object.entries(variation);

  return entries
    .filter(([, value]) => Boolean(value))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([attribute, value]) => `${attribute}:${value}`)
    .join('|');
};

const getRemoteCartItemKey = (item: {
  product_id: number;
  variation_id?: number;
  variation?: Record<string, string> | Array<{ attribute: string; value: string }>;
}) => `${item.product_id}_${item.variation_id ?? 0}_${normalizeVariation(item.variation)}`;

const getLocalCartItemKey = (item: LocalCartItem) =>
  `${item.product_id}_${item.variation_id ?? 0}_${normalizeVariation(item.variation)}`;

export const OrdersService = {
  getOrders: async (page = 1): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>(Endpoints.account.orders, {
      params: {
        page,
      },
    });

    const orders = Array.isArray(response.data) ? response.data : [];
    const groupedByRoot = new Map<number, Order>();

    for (const order of orders) {
      const parentId = Number(order.parent_id ?? 0);
      const rootId = parentId > 0 ? parentId : order.id;
      const existing = groupedByRoot.get(rootId);

      if (!existing) {
        groupedByRoot.set(rootId, order);
        continue;
      }

      const existingParentId = Number(existing.parent_id ?? 0);
      const existingIsParent = existingParentId === 0;
      const currentIsParent = parentId === 0;

      if (currentIsParent && !existingIsParent) {
        groupedByRoot.set(rootId, order);
      }
    }

    return Array.from(groupedByRoot.values()).sort(
      (first, second) =>
        new Date(second.date_created).getTime() - new Date(first.date_created).getTime()
    );
  },

  getOrder: async (id: number): Promise<Order> => {
    const response = await apiClient.get<Order>(Endpoints.account.orderDetail(id));
    return response.data;
  },

  placeOrder: async (
    checkoutData: CheckoutData,
    localItems: LocalCartItem[],
    otpProofToken?: string
  ): Promise<Order> => {
    try {
      await CartService.getCart();
    } catch {
      TokenStorage.clearCartNonce();
      TokenStorage.clearCartToken();
      await CartService.getCart();
    }

    const remoteCart = await CartService.getCart();
    const localMap = new Map(localItems.map((item) => [getLocalCartItemKey(item), item]));
    const remoteMap = new Map(remoteCart.items.map((item) => [getRemoteCartItemKey(item), item]));

    for (const [key, remoteItem] of remoteMap.entries()) {
      if (!localMap.has(key)) {
        await CartService.removeItem(remoteItem.key);
      }
    }

    for (const localItem of localItems) {
      if (localItem.product_id >= 200 && localItem.product_id <= 210) {
        continue;
      }

      const itemKey = getLocalCartItemKey(localItem);
      const remoteItem = remoteMap.get(itemKey);

      if (!remoteItem) {
        await CartService.addItem(
          localItem.product_id,
          localItem.quantity,
          localItem.variation_id || undefined,
          localItem.variation
        );
        continue;
      }

      if (remoteItem.quantity !== localItem.quantity) {
        await CartService.updateItem(remoteItem.key, localItem.quantity);
      }
    }

    let syncedCart = await CartService.updateCustomer({
      billing_address: checkoutData.billing_address,
      shipping_address: checkoutData.shipping_address,
    });

    if (syncedCart.needs_shipping) {
      const packages = syncedCart.shipping_rates ?? [];

      if (packages.length === 0) {
        throw new Error('يرجى إضافة عنوان شحن صالح أو اختيار عنوان محفوظ لعرض خيارات الشحن.');
      }

      for (const shippingPackage of packages) {
        const selectedRate =
          shippingPackage.shipping_rates.find((rate) => rate.selected) ??
          shippingPackage.shipping_rates[0];

        if (!selectedRate) {
          throw new Error('لا توجد طريقة شحن متاحة لهذا العنوان. جرّب تعديل الدولة أو المدينة أو المنطقة أو الرمز البريدي.');
        }

        syncedCart = await CartService.selectShippingRate(
          shippingPackage.package_id,
          selectedRate.rate_id
        );
      }
    }

    const desiredCoupon = checkoutData.coupon_code?.trim();

    for (const coupon of syncedCart.coupons) {
      if (!desiredCoupon || coupon.code.toLowerCase() !== desiredCoupon.toLowerCase()) {
        await CartService.removeCoupon(coupon.code);
      }
    }

    if (
      desiredCoupon &&
      !syncedCart.coupons.some((coupon) => coupon.code.toLowerCase() === desiredCoupon.toLowerCase())
    ) {
      await CartService.applyCoupon(desiredCoupon);
    }

    const serverCart = await CartService.getCart();
    if (serverCart.items.length === 0 && localItems.length > 0) {
      throw new Error('تعذر مزامنة المنتجات مع الخادم. يرجى محاولة إضافة المنتجات مرة أخرى.');
    }

    const response = await apiClient.post<Order>(Endpoints.storeCheckout.order, checkoutData, {
      headers: otpProofToken
        ? {
            'X-Dokan-OTP-Proof': otpProofToken,
          }
        : undefined,
    });
    return response.data;
  },
};
