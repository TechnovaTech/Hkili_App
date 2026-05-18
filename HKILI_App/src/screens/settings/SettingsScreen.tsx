import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';
import { useRTL } from '../../hooks/useRTL';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SettingsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { isRTL, textAlign, flexDirection } = useRTL();
  const [showLanguages, setShowLanguages] = useState(false);

  const languages = [
    { code: 'en', label: t('settings.english'), icon: '🇺🇸' },
    { code: 'ar', label: t('settings.arabic'), icon: '🇸🇦' },
    { code: 'fr', label: t('settings.french'), icon: '🇫🇷' },
  ];

  const toggleLanguages = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowLanguages(!showLanguages);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setShowLanguages(false);
  };

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.replace('/auth/login');
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
        <Text style={[styles.title, { textAlign }]}>{t('settings.title')}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.settingItem, { flexDirection }]} 
            onPress={toggleLanguages}
          >
            <Ionicons name="language-outline" size={24} color="#4CAF50" />
            <View style={[styles.settingContent, { 
              marginLeft: isRTL ? 0 : 16, 
              marginRight: isRTL ? 16 : 0,
              alignItems: isRTL ? 'flex-end' : 'flex-start'
            }]}>
              <Text style={[styles.settingTitle, { textAlign }]}>{t('settings.language')}</Text>
              <Text style={[styles.settingSubtitle, { textAlign }]}>{currentLanguage.label}</Text>
            </View>
            <Ionicons 
              name={showLanguages ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#81C784" 
            />
          </TouchableOpacity>

          {showLanguages && (
            <View style={styles.languageList}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageItem,
                    { flexDirection },
                    i18n.language === lang.code && styles.activeLanguageItem
                  ]}
                  onPress={() => changeLanguage(lang.code)}
                >
                  <Text style={[styles.languageIcon, { 
                    marginRight: isRTL ? 0 : 12,
                    marginLeft: isRTL ? 12 : 0
                  }]}>{lang.icon}</Text>
                  <Text style={[
                    styles.languageLabel,
                    { textAlign },
                    i18n.language === lang.code && styles.activeLanguageLabel
                  ]}>
                    {lang.label}
                  </Text>
                  {i18n.language === lang.code && (
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.settingItem, { flexDirection }]} 
          onPress={() => router.push('/faq')}
        >
          <Ionicons name="help-circle-outline" size={24} color="#4CAF50" />
          <View style={[styles.settingContent, { 
            marginLeft: isRTL ? 0 : 16, 
            marginRight: isRTL ? 16 : 0,
            alignItems: isRTL ? 'flex-end' : 'flex-start'
          }]}>
            <Text style={[styles.settingTitle, { textAlign }]}>{t('settings.faq')}</Text>
            <Text style={[styles.settingSubtitle, { textAlign }]}>{t('settings.faqSubtitle')}</Text>
          </View>
          <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color="#81C784" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, { flexDirection }]}>
          <Ionicons name="information-circle-outline" size={24} color="#4CAF50" />
          <View style={[styles.settingContent, { 
            marginLeft: isRTL ? 0 : 16, 
            marginRight: isRTL ? 16 : 0,
            alignItems: isRTL ? 'flex-end' : 'flex-start'
          }]}>
            <Text style={[styles.settingTitle, { textAlign }]}>{t('settings.about')}</Text>
            <Text style={[styles.settingSubtitle, { textAlign }]}>Version 1.0.0</Text>
          </View>
          <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color="#81C784" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.logoutButton, { flexDirection }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#F44336" />
          <Text style={[styles.logoutText, { 
            marginLeft: isRTL ? 0 : 16, 
            marginRight: isRTL ? 16 : 0 
          }]}>{t('auth.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1929',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingContent: {
    flex: 1,
    marginLeft: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#81C784',
  },
  languageList: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeLanguageItem: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  languageIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  languageLabel: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  activeLanguageLabel: {
    color: '#81C784',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  logoutText: {
    fontSize: 16,
    color: '#F44336',
    marginLeft: 16,
    fontWeight: '600',
  },
});