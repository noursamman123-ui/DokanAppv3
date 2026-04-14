import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../theme/colors';
import { Typography, FontFamily } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Shadows } from '../../theme/shadows';

export default function NotificationsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>رجوع</Text>
        </TouchableOpacity>
        <Text style={styles.title}>الإشعارات</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.empty}>
        <MaterialCommunityIcons name="bell-outline" style={styles.emptyIcon} />
        <Text style={styles.emptyText}>قريبًا</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.surface, paddingTop: Spacing[10], paddingBottom: Spacing[3], paddingHorizontal: Spacing[4], flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', ...Shadows.sm },
  backIcon: { fontSize: 16, color: Colors.textPrimary },
  title: { ...Typography.h4, color: Colors.textPrimary, fontFamily: FontFamily.arabicBold },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: Spacing[4] },
  emptyText: { ...Typography.h3, color: Colors.textSecondary, fontFamily: FontFamily.arabicBold },
});
