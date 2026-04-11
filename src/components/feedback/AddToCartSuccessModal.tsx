import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography, FontFamily } from '../../theme/typography';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { Shadows } from '../../theme/shadows';

interface AddToCartSuccessModalProps {
  visible: boolean;
  onContinueShopping: () => void;
  onGoToCart: () => void;
}

export default function AddToCartSuccessModal({
  visible,
  onContinueShopping,
  onGoToCart,
}: AddToCartSuccessModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onContinueShopping}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>

          <Text style={styles.title}>تمت الإضافة إلى السلة بنجاح</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onContinueShopping}>
              <Text style={styles.secondaryBtnText}>متابعة التسوق</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtn} onPress={onGoToCart}>
              <Text style={styles.primaryBtnText}>الذهاب إلى العربة</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[6],
    alignItems: 'center',
    ...Shadows.xl,
  },
  checkCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[4],
  },
  checkIcon: {
    fontSize: 42,
    color: Colors.success,
    fontFamily: FontFamily.bold,
    lineHeight: 46,
  },
  title: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontFamily: FontFamily.arabicBold,
    textAlign: 'center',
    marginBottom: Spacing[5],
  },
  actions: {
    width: '100%',
    gap: Spacing[3],
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing[3],
    alignItems: 'center',
  },
  primaryBtnText: {
    ...Typography.button,
    color: Colors.textInverse,
    fontFamily: FontFamily.arabicBold,
  },
  secondaryBtn: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing[3],
    alignItems: 'center',
  },
  secondaryBtnText: {
    ...Typography.button,
    color: Colors.textPrimary,
    fontFamily: FontFamily.arabicMedium,
  },
});
