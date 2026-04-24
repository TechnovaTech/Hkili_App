import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '../src/services/authService';
import * as SecureStore from 'expo-secure-store';

const ONBOARDING_KEY = 'onboarding_completed';

export default function IndexPage() {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    const bootstrap = async () => {
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        router.replace('/(tabs)/home');
        return;
      }
      const onboardingDone = await SecureStore.getItemAsync(ONBOARDING_KEY);
      if (onboardingDone) {
        router.replace('/auth/login');
      } else {
        router.replace('/onboarding');
      }
    };

    const timer = setTimeout(bootstrap, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logo}>
          <Text style={styles.logoText}>🦊</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1929',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  logoText: {
    fontSize: 60,
  },
});