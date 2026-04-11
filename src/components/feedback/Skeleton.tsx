/**
 * Skeleton loading components – smooth animated placeholders.
 * Using standard React Native Animated API (no extra library needed).
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../theme/colors';
import { BorderRadius } from '../../theme/spacing';

const { width } = Dimensions.get('window');

interface SkeletonBoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

function SkeletonBox({ width: w = '100%', height = 16, borderRadius = BorderRadius.sm, style }: SkeletonBoxProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [shimmer]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });

  return (
    <Animated.View
      style={[
        {
          width: w as number,
          height,
          borderRadius,
          backgroundColor: Colors.skeletonBase,
          opacity,
        },
        style,
      ]}
    />
  );
}

// Product card skeleton
export function ProductCardSkeleton() {
  const CARD_W = (width - 48) / 2;
  return (
    <View style={[styles.card, { width: CARD_W }]}>
      <SkeletonBox height={CARD_W} borderRadius={0} />
      <View style={styles.content}>
        <SkeletonBox height={12} width="90%" />
        <SkeletonBox height={12} width="60%" />
        <SkeletonBox height={16} width="50%" />
        <SkeletonBox height={32} borderRadius={BorderRadius.md} />
      </View>
    </View>
  );
}

// Banner skeleton
export function BannerSkeleton() {
  return <SkeletonBox height={180} borderRadius={BorderRadius.xl} style={{ marginHorizontal: 16 }} />;
}

// Section title skeleton
export function SectionTitleSkeleton() {
  return (
    <View style={styles.sectionTitle}>
      <SkeletonBox width={120} height={18} />
      <SkeletonBox width={50} height={14} />
    </View>
  );
}

// Category chip skeleton
export function CategoryChipSkeleton() {
  return (
    <View style={styles.catChip}>
      <SkeletonBox width={60} height={60} borderRadius={BorderRadius.full} />
      <SkeletonBox width={50} height={10} style={{ marginTop: 6 }} />
    </View>
  );
}

// List item skeleton (for orders, etc.)
export function ListItemSkeleton() {
  return (
    <View style={styles.listItem}>
      <SkeletonBox width={60} height={60} borderRadius={BorderRadius.md} />
      <View style={styles.listItemContent}>
        <SkeletonBox height={14} width="70%" />
        <SkeletonBox height={12} width="40%" />
        <SkeletonBox height={12} width="30%" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: 12,
  },
  content: {
    padding: 12,
    gap: 8,
  },
  sectionTitle: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  catChip: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  listItem: {
    flexDirection: 'row-reverse',
    padding: 16,
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    marginBottom: 8,
  },
  listItemContent: {
    flex: 1,
    gap: 8,
  },
});
