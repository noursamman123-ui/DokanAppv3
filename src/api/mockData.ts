import { HomeData, Category, Product, Banner } from '../types';

/**
 * Mock Home Data
 * High-quality placeholder data for the Dokan App when the API is empty.
 * Features: curated categories, professional product images, and engaging banners.
 */

const MOCK_CATEGORIES: Category[] = [
  {
    id: 11,
    name: 'أزياء نسائية',
    slug: 'women-fashion',
    description: 'أحدث صيحات الموضة النسائية',
    parent: 0,
    count: 45,
    image: { id: 101, src: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=400', name: '', alt: '' },
    display: 'default',
  },
  {
    id: 12,
    name: 'عطور ومكياج',
    slug: 'beauty',
    description: 'عالم الجمال والعناية',
    parent: 0,
    count: 32,
    image: { id: 102, src: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=400', name: '', alt: '' },
    display: 'default',
  },
  {
    id: 13,
    name: 'أدوات منزلية',
    slug: 'home-appliances',
    description: 'كل ما يحتاجه منزلك',
    parent: 0,
    count: 28,
    image: { id: 103, src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400', name: '', alt: '' },
    display: 'default',
  },
  {
    id: 14,
    name: 'موبايلات',
    slug: 'phones',
    description: 'أحدث الهواتف الذكية والإكسسوارات',
    parent: 0,
    count: 15,
    image: { id: 104, src: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400', name: '', alt: '' },
    display: 'default',
  },
  {
    id: 15,
    name: 'ساعات يد',
    slug: 'watches',
    description: 'ساعات أنيقة لكل المناسبات',
    parent: 0,
    count: 10,
    image: { id: 105, src: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=400', name: '', alt: '' },
    display: 'default',
  },
  {
    id: 16,
    name: 'نظارات شمسية',
    slug: 'sunglasses',
    description: 'إطلالة عصرية وحماية',
    parent: 0,
    count: 18,
    image: { id: 106, src: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=400', name: '', alt: '' },
    display: 'default',
  },
];

const createMockProduct = (id: number, name: string, price: string, regularPrice: string, imageUrl: string, rating: string, catId: number = 11): Product => ({
  id,
  name,
  slug: `product-${id}`,
  type: 'simple',
  status: 'publish',
  description: 'هذا منتج تجريبي عالي الجودة متوفر حصرياً في متجر دكان.',
  short_description: 'منتج ممتاز بأفضل سعر.',
  sku: `SKU-${id}`,
  prices: {
    price,
    regular_price: regularPrice,
    sale_price: price,
    currency_code: 'SYP',
    currency_symbol: 'ل.س',
    currency_minor_unit: 0,
    currency_decimal_separator: '.',
    currency_thousand_separator: ',',
    currency_prefix: '',
    currency_suffix: ' ل.س',
  },
  on_sale: price !== regularPrice,
  purchasable: true,
  stock_status: 'instock',
  stock_quantity: 10,
  manage_stock: true,
  featured: true,
  categories: [{ id: catId, name: MOCK_CATEGORIES.find(c => c.id === catId)?.name || 'عام', slug: 'category' }],
  images: [{ id: id * 10, src: imageUrl, name: '', alt: '' }],
  attributes: [],
  variations: [],
  rating_count: 5,
  average_rating: rating,
  related_ids: [],
  upsell_ids: [],
  cross_sell_ids: [],
  weight: '',
  dimensions: { length: '', width: '', height: '' },
  date_created: new Date().toISOString(),
  date_modified: new Date().toISOString(),
});

const MOCK_PRODUCTS: Product[] = [
  createMockProduct(201, 'ساعة يد كلاسيك - فاخرة', '150000', '210000', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400', '4.8', 15),
  createMockProduct(202, 'عطر رجالي - بلو شانيل', '450000', '450000', 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=400', '4.9', 12),
  createMockProduct(203, 'سماعات بلوتوث لاسلكية', '85000', '120000', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400', '4.5', 14),
  createMockProduct(204, 'حقيبة ظهر رياضية - أسود', '65000', '65000', 'https://images.unsplash.com/photo-1553062407-98eeb94c6a62?auto=format&fit=crop&q=80&w=400', '4.2', 11),
  createMockProduct(205, 'نظارات شمسية - موديل 2024', '110000', '160000', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=400', '4.7', 16),
  createMockProduct(206, 'فستان صيفي مشجر', '125000', '125000', 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=400', '4.6', 11),
  createMockProduct(207, 'مجموعة مكياج متكاملة', '210000', '210000', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400', '4.9', 12),
  createMockProduct(208, 'طقم أواني طهي سيراميك', '380000', '450000', 'https://images.unsplash.com/photo-1584990344619-391e0fe84821?auto=format&fit=crop&q=80&w=400', '4.7', 13),
  createMockProduct(209, 'آيفون 15 برو ماكس - 256 جيجا', '18500000', '18500000', 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=400', '5.0', 14),
];

const MOCK_BANNERS: Banner[] = [
  {
    id: 1,
    title: 'أزياء نسائية راقية',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200',
    url: '',
    type: 'external',
  },
  {
    id: 2,
    title: 'أجمل العطور العالمية',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1200',
    url: '',
    type: 'external',
  },
];

export const MOCK_HOME_DATA: HomeData = {
  banners: MOCK_BANNERS,
  featured_categories: MOCK_CATEGORIES,
  featured_products: MOCK_PRODUCTS,
  latest_products: MOCK_PRODUCTS.slice().reverse(),
  sale_products: MOCK_PRODUCTS.filter(p => p.on_sale),
  best_sellers: MOCK_PRODUCTS.slice(0, 4),
};

export const MOCK_DATA = {
  categories: MOCK_CATEGORIES,
  products: MOCK_PRODUCTS,
};
