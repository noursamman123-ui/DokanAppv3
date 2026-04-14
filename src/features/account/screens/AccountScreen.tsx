/**
 * Account Screen – User profile hub with navigation to sub-screens.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AccountStackParamList } from '../../../navigation/types';
import { useAuthStore } from '../../../store/authStore';
import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { Shadows } from '../../../theme/shadows';

type NavProp = NativeStackNavigationProp<AccountStackParamList, 'AccountScreen'>;

export default function AccountScreen() {
  const navigation = useNavigation<NavProp>();
  const { user, isAuthenticated, logout } = useAuthStore();

  const menuItems = [
    { icon: 'package-variant-closed', label: 'طلباتي', screen: 'Orders' as const, requireAuth: true },
    { icon: 'account-edit-outline', label: 'تعديل الملف الشخصي', screen: 'EditProfile' as const, requireAuth: true },
    { icon: 'map-marker-outline', label: 'عناويني', screen: 'Addresses' as const, requireAuth: true },
    { icon: 'bell-outline', label: 'الإشعارات', screen: 'Notifications' as const, requireAuth: false },
    { icon: 'shield-lock-outline', label: 'سياسة الخصوصية', screen: 'PrivacyPolicy' as const, requireAuth: false },
    { icon: 'file-document-outline', label: 'الشروط والأحكام', screen: 'Terms' as const, requireAuth: false },
    { icon: 'phone-outline', label: 'تواصل معنا', screen: 'ContactUs' as const, requireAuth: false },
  ];

  const handleMenuPress = (item: typeof menuItems[0]) => {
    if (item.requireAuth && !isAuthenticated) {
      navigation.getParent()?.getParent()?.navigate('Auth', { screen: 'Login' });
      return;
    }
    (navigation as any).navigate(item.screen);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      <View style={styles.header}>
        <Text style={styles.title}>حسابي</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        {isAuthenticated && user ? (
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.first_name?.charAt(0) ?? user.email.charAt(0)}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.first_name} {user.last_name}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.loginCard}
            onPress={() => navigation.getParent()?.getParent()?.navigate('Auth', { screen: 'Login' })}
          >
            <View style={styles.loginIcon}>
              <MaterialCommunityIcons name="account" style={styles.loginIconText} />
            </View>
            <View>
              <Text style={styles.loginTitle}>سجّل دخولك</Text>
              <Text style={styles.loginSubtitle}>لإدارة طلباتك وعناوينك</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item)}
            >
              <View style={styles.menuRow}>
                <MaterialCommunityIcons name={item.icon as any} style={styles.menuIcon} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-left" style={styles.menuArrow} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        {isAuthenticated && (
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>تسجيل الخروج</Text>
          </TouchableOpacity>
        )}

        {/* App Version */}
        <Text style={styles.version}>الإصدار 1.0.0</Text>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface, paddingTop: Spacing[10], paddingBottom: Spacing[4],
    paddingHorizontal: Spacing[5], ...Shadows.sm,
  },
  title: { ...Typography.h2, color: Colors.textPrimary, fontFamily: FontFamily.arabicBold, textAlign: 'right' },
  scrollContent: { padding: Spacing[4] },

  profileCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing[5],
    flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing[4], marginBottom: Spacing[4], ...Shadows.card,
  },
  avatar: {
    width: 56, height: 56, borderRadius: BorderRadius.full, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: Colors.secondary },
  profileInfo: { flex: 1 },
  profileName: { ...Typography.h4, color: Colors.textPrimary, fontFamily: FontFamily.arabicBold, textAlign: 'right' },
  profileEmail: { ...Typography.bodySmall, color: Colors.textSecondary, textAlign: 'right' },

  loginCard: {
    backgroundColor: Colors.primarySurface, borderRadius: BorderRadius.xl, padding: Spacing[5],
    flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing[4], marginBottom: Spacing[4],
    borderWidth: 1, borderColor: Colors.primary, borderStyle: 'dashed',
  },
  loginIcon: { width: 50, height: 50, borderRadius: BorderRadius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  loginIconText: { fontSize: 24, color: Colors.textInverse },
  loginTitle: { ...Typography.h4, color: Colors.textPrimary, fontFamily: FontFamily.arabicBold, textAlign: 'right' },
  loginSubtitle: { ...Typography.bodySmall, color: Colors.textSecondary, textAlign: 'right' },

  menuContainer: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadows.card,
  },
  menuItem: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing[4], paddingHorizontal: Spacing[5],
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  menuRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: Spacing[3] },
  menuIcon: { fontSize: 18, color: Colors.textSecondary },
  menuLabel: { ...Typography.body, color: Colors.textPrimary, fontFamily: FontFamily.arabicMedium },
  menuArrow: { fontSize: 16, color: Colors.textTertiary },

  logoutBtn: {
    marginTop: Spacing[4], backgroundColor: Colors.errorLight, borderRadius: BorderRadius.xl,
    paddingVertical: Spacing[4], alignItems: 'center',
  },
  logoutText: { ...Typography.button, color: Colors.error, fontFamily: FontFamily.arabicBold },
  version: { ...Typography.caption, color: Colors.textTertiary, textAlign: 'center', marginTop: Spacing[6] },
});
