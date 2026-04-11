import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../../../navigation/types';
import { Colors } from '../../../theme/colors';
import { Typography, FontFamily } from '../../../theme/typography';
import { Spacing } from '../../../theme/spacing';
import { Shadows } from '../../../theme/shadows';

type NavProp = NativeStackNavigationProp<AccountStackParamList, 'Terms'>;

export default function TermsScreen() {
  const navigation = useNavigation<NavProp>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('AccountScreen')}>
          <Text style={styles.backText}>رجوع</Text>
        </TouchableOpacity>
        <Text style={styles.title}>الشروط والأحكام</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyText}>قريبًا</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface,
    paddingTop: Spacing[10],
    paddingBottom: Spacing[3],
    paddingHorizontal: Spacing[4],
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.sm,
  },
  backText: {
    ...Typography.labelLarge,
    color: Colors.textPrimary,
    fontFamily: FontFamily.arabicBold,
  },
  title: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontFamily: FontFamily.arabicBold,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: Spacing[4] },
  emptyText: { ...Typography.h3, color: Colors.textSecondary, fontFamily: FontFamily.arabicBold },
});
