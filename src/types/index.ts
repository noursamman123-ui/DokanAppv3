/**
 * Dokan App – TypeScript Type Definitions
 * All API response and app model types.
 */

// ─── Generic API Response ─────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

export interface ApiError {
  code: string;
  message: string;
  data?: Record<string, unknown>;
}

// ─── Category ─────────────────────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number;
  count: number;
  image: {
    id: number;
    src: string;
    name: string;
    alt: string;
  } | null;
  display: string;
}

export interface CategoryTreeNode extends Category {
  children: Category[];
}

// ─── Product ──────────────────────────────────────────────────────────────
export interface ProductImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

export interface ProductAttribute {
  id: number;
  name: string;
  slug: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options?: string[];
  terms?: Array<{
    id?: number;
    name?: string;
    slug?: string;
  }>;
  value?: string;
}

export interface ProductVariation {
  id: number;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  stock_quantity: number | null;
  variations: Record<string, string>; // e.g. { "pa_color": "red", "pa_size": "M" }
  image: ProductImage | null;
}

export interface ProductDimensions {
  length: string;
  width: string;
  height: string;
}

export interface ProductRating {
  rating: string;
  count: number | null;
}

export interface ProductPrices {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
  currency_prefix: string;
  currency_suffix: string;
}

export interface Product {
  id: number;
  parent?: number;
  name: string;
  slug: string;
  type: 'simple' | 'variable' | 'grouped' | 'external';
  variation?: string;
  status: string;
  permalink?: string;
  description: string;
  short_description: string;
  sku: string;
  prices: ProductPrices; // WC Store API uses nested prices
  on_sale: boolean;
  purchasable: boolean;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  stock_quantity: number | null;
  manage_stock: boolean;
  featured: boolean;
  categories: Pick<Category, 'id' | 'name' | 'slug'>[];
  images: ProductImage[];
  attributes: ProductAttribute[];
  variations: number[];
  rating_count: number;
  average_rating: string;
  related_ids: number[];
  upsell_ids: number[];
  cross_sell_ids: number[];
  weight: string;
  dimensions: ProductDimensions;
  date_created: string;
  date_modified: string;
}

// Computed discount percentage
export const getDiscountPercent = (product: Product): number | null => {
  if (!product.on_sale) return null;
  const legacyProduct = product as Product & {
    price?: string;
    regular_price?: string;
    sale_price?: string;
  };
  const regularSource = product.prices?.regular_price ?? legacyProduct.regular_price ?? legacyProduct.price ?? '0';
  const saleSource = product.prices?.price ?? legacyProduct.sale_price ?? legacyProduct.price ?? '0';
  const regular = parseFloat(String(regularSource).replace(/[^\d.]/g, ''));
  const sale = parseFloat(String(saleSource).replace(/[^\d.]/g, ''));
  
  if (isNaN(regular) || regular <= 0) return null;
  if (isNaN(sale) || sale >= regular) return null;
  
  return Math.round(((regular - sale) / regular) * 100);
};

// ─── Cart ─────────────────────────────────────────────────────────────────
export interface CartItem {
  key: string;           // WooCommerce cart item key
  product_id: number;
  variation_id: number;
  quantity: number;
  name: string;
  sku: string;
  image: string;
  price: string;
  regular_price: string;
  on_sale: boolean;
  totals: {
    line_subtotal: string;
    line_subtotal_tax: string;
    line_total: string;
    line_total_tax: string;
  };
  variation: Array<{
    attribute: string;
    value: string;
  }> | Record<string, string>;
  stock_quantity: number | null;
  in_stock: boolean;
}

export interface CartCoupon {
  code: string;
  discount_type: string;
  amount: string;
  totals: {
    total_discount: string;
    total_discount_tax: string;
  };
}

export interface CartTotals {
  subtotal: string;
  subtotal_tax: string;
  shipping_total: string;
  shipping_tax: string;
  discount_total: string;
  discount_tax: string;
  total_tax: string;
  total: string;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
}

export interface Cart {
  items: CartItem[];
  coupons: CartCoupon[];
  fees: unknown[];
  totals: CartTotals;
  shipping_address?: UserAddress;
  billing_address?: UserAddress;
  needs_shipping: boolean;
  has_calculated_shipping?: boolean;
  items_count: number;
  items_weight: number;
  shipping_rates?: ShippingPackage[];
  payment_methods?: string[];
}

// Local cart item (used in Zustand store before syncing)
export interface LocalCartItem {
  product_id: number;
  variation_id: number;
  quantity: number;
  name: string;
  image: string;
  price: string;
  regular_price: string;
  on_sale: boolean;
  variation: Record<string, string>;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────
export interface WishlistItem {
  product_id: number;
  name: string;
  image: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  in_stock: boolean;
  slug: string;
  added_at: string; // ISO date
}

// ─── User & Auth ─────────────────────────────────────────────────────────
export interface UserAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  username: string;
  display_name: string;
  avatar_url: string;
  billing: UserAddress;
  shipping: UserAddress;
  date_registered: string;
}

export interface AuthTokens {
  token: string;            // JWT access token
  refresh_token?: string;
  expires_in?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ─── Order ────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'on-hold'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'failed'
  | 'trash';

export interface OrderLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  sku: string;
  price: number;
  subtotal: string;
  total: string;
  image: {
    id: number;
    src: string;
  };
  meta_data: Array<{
    id: number;
    key: string;
    value: string;
    display_key: string;
    display_value: string;
  }>;
}

export interface OrderShippingLine {
  id: number;
  method_title: string;
  method_id: string;
  instance_id: string;
  total: string;
  total_tax: string;
  delivery_time?: string;
  meta_data?: Array<{
    id?: number;
    key?: string;
    value?: string;
    display_key?: string;
    display_value?: string;
  }>;
}

export interface Order {
  id: number;
  parent_id?: number;
  number: string;
  status: OrderStatus;
  date_created: string;
  date_modified: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_duration?: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  currency: string;
  currency_symbol: string;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  customer_note: string;
  billing: UserAddress;
  shipping: UserAddress;
  line_items: OrderLineItem[];
  shipping_lines: OrderShippingLine[];
  coupon_lines: Array<{ code: string; discount: string }>;
}

// ─── Checkout ─────────────────────────────────────────────────────────────
export interface ShippingRate {
  rate_id: string;
  name: string;
  description: string;
  delivery_time: string;
  price: string;
  taxes: string;
  instance_id: number;
  method_id: string;
  meta_data: unknown[];
  selected: boolean;
  currency_code: string;
  currency_symbol: string;
}

export interface ShippingPackage {
  package_id: number;
  name: string;
  destination: {
    address_1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  items: Array<{ key: string; name: string; quantity: number }>;
  shipping_rates: ShippingRate[];
}

export interface PaymentMethod {
  id: string;
  title: string;
  description: string;
  order_button_text: string;
  supports: string[];
}

export interface PaymentGateway {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface BootstrapData {
  store: {
    name: string;
    description: string;
    url: string;
    logo: string;
  };
  currency: {
    code: string;
    symbol: string;
    position: string;
    thousand_separator: string;
    decimal_separator: string;
    decimals: number;
  };
  payment_gateways: PaymentGateway[];
  shipping_zones: Array<{
    id: number;
    name: string;
    methods: Array<{
      id: string;
      title: string;
      cost: string;
    }>;
  }>;
  tax: {
    enabled: boolean;
    prices_include: boolean;
    display_in: string;
  };
  config: {
    min_app_version: string;
    maintenance_mode: boolean;
    registration_open: boolean;
    api_version: string;
  };
}

export interface CheckoutData {
  billing_address: UserAddress;
  shipping_address: UserAddress;
  customer_note: string;
  create_account: boolean;
  payment_method: string;
  payment_data: unknown[];
  shipping_rate_id?: string;
  coupon_code?: string;
}

export interface CheckoutOtpSendPayload {
  first_name: string;
  last_name: string;
  city: string;
  address_1: string;
  phone: string;
  phone_country?: string;
  cart_token?: string;
}

export interface OtpSendResponse {
  otp_session_id: string;
  expires_in: number;
  resend_after: number;
  masked_phone: string;
}

export interface OtpVerifyResponse {
  otp_proof_token: string;
  expires_in: number;
}

export interface ContactInfo {
  source_url: string;
  title: string;
  description: string;
  phones: string[];
  emails: string[];
  whatsapp_links: string[];
}

export interface PrivacyPolicyContent {
  source_url: string;
  title: string;
  body: string;
}

// ─── Home / Banner ────────────────────────────────────────────────────────
export interface Banner {
  id: number;
  title: string;
  image: string;
  url: string;
  type: 'product' | 'category' | 'external' | 'none';
  target_id?: number;
}

export interface HomeData {
  banners: Banner[];
  featured_categories: Category[];
  featured_products: Product[];
  latest_products: Product[];
  sale_products: Product[];
  best_sellers: Product[];
}

// ─── Search ───────────────────────────────────────────────────────────────
export interface SearchResult {
  id: number;
  type: 'product' | 'category';
  name: string;
  slug: string;
  image?: string;
  price?: string;
}

// ─── Notification ─────────────────────────────────────────────────────────
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'order' | 'promotion' | 'system';
  read: boolean;
  data?: Record<string, string>;
  created_at: string;
}

// ─── Filters ─────────────────────────────────────────────────────────────
export interface ProductFilters {
  category?: number;
  min_price?: number;
  max_price?: number;
  orderby?: 'date' | 'price' | 'rating' | 'popularity';
  order?: 'asc' | 'desc';
  on_sale?: boolean;
  featured?: boolean;
  search?: string;
  per_page?: number;
  page?: number;
}
