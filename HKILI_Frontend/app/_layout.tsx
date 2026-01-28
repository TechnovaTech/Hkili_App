import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import i18n from '../src/i18n';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  React.useEffect(() => {
    // Hide splash screen after i18n is initialized
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };
    
    if (i18n.isInitialized) {
      hideSplash();
    } else {
      i18n.on('initialized', hideSplash);
    }
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#0f0f0f" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#2D1B3D' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="character" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="story" />
          <Stack.Screen name="settings" />
        </Stack>
      </SafeAreaProvider>
    </I18nextProvider>
  );
}