/**
 * Dokan App – Spacing & Layout System
 * 4px base grid system.
 */

export const Spacing = {
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
} as const;

export const BorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

export const Layout = {
  // Screen horizontal padding
  screenPadding: 16,
  screenPaddingLg: 20,

  // Card internal padding
  cardPadding: 12,
  cardPaddingLg: 16,

  // Bottom navigation height (plus safe area)
  bottomNavHeight: 60,

  // Header height
  headerHeight: 56,
  headerHeightWithSearch: 110,

  // Grid columns
  productGridCols: 2,
  categoryGridCols: 4,

  // Product card
  productCardWidth: '48%',
} as const;
