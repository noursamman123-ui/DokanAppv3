/**
 * Dokan App – Color System
 * Inspired by Noon's clean commercial aesthetic with a warm yellow brand accent.
 */

export const Colors = {
  // ─── Brand ────────────────────────────────────────────────────────────────
  primary: '#F6A623',        // Warm amber / noon-like brand yellow
  primaryDark: '#D4891A',
  primaryLight: '#FDE8BC',
  primarySurface: '#FFF8EE',

  // ─── Secondary ────────────────────────────────────────────────────────────
  secondary: '#1A1A2E',      // Deep navy for contrast
  secondaryLight: '#2D2D44',

  // ─── UI Backgrounds ───────────────────────────────────────────────────────
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceSecondary: '#FAFAFA',
  card: '#FFFFFF',

  // ─── Text ─────────────────────────────────────────────────────────────────
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',

  // ─── Semantic ─────────────────────────────────────────────────────────────
  success: '#27AE60',
  successLight: '#E8F8F0',
  error: '#E74C3C',
  errorLight: '#FDECEB',
  warning: '#F39C12',
  warningLight: '#FEF9E7',
  info: '#2980B9',
  infoLight: '#EBF5FB',

  // ─── Discount / Sale ──────────────────────────────────────────────────────
  sale: '#E74C3C',
  saleBg: '#FDECEB',

  // ─── Rating ───────────────────────────────────────────────────────────────
  rating: '#F6A623',

  // ─── Borders & Dividers ───────────────────────────────────────────────────
  border: '#E8E8E8',
  borderLight: '#F0F0F0',
  divider: '#EEEEEE',

  // ─── Overlay ──────────────────────────────────────────────────────────────
  overlay: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(0,0,0,0.15)',
  overlayWhite: 'rgba(255,255,255,0.9)',

  // ─── Input ────────────────────────────────────────────────────────────────
  inputBackground: '#F7F7F7',
  inputBorder: '#E0E0E0',
  inputFocusBorder: '#F6A623',
  placeholder: '#BBBBBB',

  // ─── Skeleton ─────────────────────────────────────────────────────────────
  skeletonBase: '#E0E0E0',
  skeletonHighlight: '#F5F5F5',

  // ─── Navigation ───────────────────────────────────────────────────────────
  tabActive: '#F6A623',
  tabInactive: '#AAAAAA',
  navBackground: '#FFFFFF',

  // ─── Transparent ──────────────────────────────────────────────────────────
  transparent: 'transparent',
} as const;

export type ColorKeys = keyof typeof Colors;
