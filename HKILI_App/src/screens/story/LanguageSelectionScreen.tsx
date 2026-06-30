import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { theme } from '@/theme';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { playClickSound } from '@/utils/soundUtils';

const languages = [
  { id: 'en', name: 'English', nativeName: 'English', icon: '🇺🇸' },
  { id: 'ar', name: 'Arabic', nativeName: 'العربية', icon: '🇸🇦' },
  { id: 'fr', name: 'French', nativeName: 'Français', icon: '🇫🇷' },
];

export default function LanguageSelectionScreen() {
  const params = useLocalSearchParams();

  const handleLanguageSelect = async (languageId: string) => {
    await playClickSound();
    router.push({
      pathname: '/story/mode-selection',
      params: { 
        ...params,
        language: languageId.toUpperCase() 
      }
    });
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Story Language</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.subtitle}>In which language should the story be written?</Text>

          <View style={styles.languageList}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.id}
                style={styles.languageCard}
                onPress={() => handleLanguageSelect(lang.id)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={theme.gradients.card}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.languageIconContainer}
                >
                  <Text style={styles.languageIcon}>{lang.icon}</Text>
                </LinearGradient>
                <View style={styles.languageInfo}>
                  <Text style={styles.languageName}>{lang.name}</Text>
                  <Text style={styles.nativeName}>{lang.nativeName}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.accent} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(129, 199, 132, 0.15)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 30,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  languageList: {
    gap: 16,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(129, 199, 132, 0.18)',
    ...theme.shadows.md,
  },
  languageIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(129, 199, 132, 0.25)',
  },
  languageIcon: {
    fontSize: 24,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  nativeName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});
