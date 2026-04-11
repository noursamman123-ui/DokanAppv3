/**
 * Splash Screen – 4 second duration with store logo and branded background.
 * Navigates to Main (Home) after splash completes without requiring login.
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { Colors } from '../../../theme/colors';
import { FontFamily, FontSize } from '../../../theme/typography';
import { useAuthStore } from '../../../store/authStore'; // Assuming this path for useAuthStore

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const launchStartedAt = useRef(Date.now());
  const logoAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;

  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    // Animate logo in
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(taglineAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Show loader dot
      Animated.timing(dotAnim, {
        toValue: 1,
        duration: 300,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate as soon as hydration is ready, with only a tiny minimum splash time.
    if (isHydrated) {
      const elapsed = Date.now() - launchStartedAt.current;
      const minSplashDuration = 700;
      const remainingDelay = Math.max(0, minSplashDuration - elapsed);

      const timer = setTimeout(() => {
        if (isAuthenticated) {
          navigation.replace('Main', { screen: 'Home' } as any);
        } else {
          // You could force Auth here or still go to Main for guest mode
          navigation.replace('Main', { screen: 'Home' } as any);
        }
      }, remainingDelay);

      return () => clearTimeout(timer);
    }
  }, [navigation, logoAnim, taglineAnim, dotAnim, isHydrated, isAuthenticated, launchStartedAt]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Logo Area */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoAnim,
            transform: [
              {
                translateY: logoAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Brand Logo Placeholder – replace with actual Image */}
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>D</Text>
        </View>
        <Text style={styles.brandName}>دكان</Text>
        <Text style={styles.brandNameEn}>DOKAN</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.Text
        style={[
          styles.tagline,
          {
            opacity: taglineAnim,
          },
        ]}
      >
        تسوّق بلا حدود
      </Animated.Text>

      {/* Loading Indicator */}
      <Animated.View style={[styles.loaderContainer, { opacity: dotAnim }]}>
        <LoadingDots />
      </Animated.View>

      {/* Bottom Wave */}
      <View style={styles.bottomAccent} />
    </View>
  );
}

function LoadingDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]),
      );

    Animated.parallel([animate(dot1, 0), animate(dot2, 200), animate(dot3, 400)]).start();
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.dotsRow}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 90,
    height: 90,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.secondary,
    fontFamily: FontFamily.extraBold,
  },
  brandName: {
    fontSize: FontSize['2xl'],
    color: Colors.textInverse,
    fontFamily: FontFamily.arabicBold,
    fontWeight: '700',
    letterSpacing: 2,
  },
  brandNameEn: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontFamily: FontFamily.bold,
    letterSpacing: 6,
    marginTop: 4,
  },
  tagline: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: FontFamily.arabicRegular,
    marginTop: 8,
    letterSpacing: 1,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 80,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginHorizontal: 4,
  },
  bottomAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.primary,
  },
});
