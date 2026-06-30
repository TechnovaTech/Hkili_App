import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';
import { useRTL } from '../../hooks/useRTL';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { theme } from '../../theme';
import { User } from '@/types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SettingsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { isRTL, textAlign, flexDirection } = useRTL();
  const [showLanguages, setShowLanguages] = useState(false);

  // Profile state
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Edit-profile modal state
  const [editVisible, setEditVisible] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const languages = [
    { code: 'en', label: t('settings.english'), icon: '🇺🇸' },
    { code: 'ar', label: t('settings.arabic'), icon: '🇸🇦' },
    { code: 'fr', label: t('settings.french'), icon: '🇫🇷' },
  ];

  const loadUser = useCallback(async () => {
    try {
      const res = await authService.getCurrentUser();
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

  const toggleLanguages = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowLanguages(!showLanguages);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setShowLanguages(false);
  };

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  const isGuest = !user || user.isGuest;

  const displayName =
    user?.name?.trim() ||
    (isGuest ? t('profile.guest') : '') ||
    user?.email?.split('@')[0] ||
    '';

  const avatarInitial = (user?.name?.trim()?.[0] || user?.email?.[0] || '?').toUpperCase();

  const openEdit = () => {
    if (isGuest) {
      Alert.alert(t('profile.title'), t('profile.guestEditNotice'));
      return;
    }
    setNameInput(user?.name || '');
    setCurrentPassword('');
    setNewPassword('');
    setEditVisible(true);
  };

  const handleSaveProfile = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const payload: { name?: string; currentPassword?: string; newPassword?: string } = {
        name: nameInput.trim(),
      };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      const res = await authService.updateProfile(payload);
      if (res.success && res.data) {
        setUser(res.data);
        setEditVisible(false);
        Alert.alert(t('profile.title'), t('profile.updateSuccess'));
      } else {
        Alert.alert(t('profile.title'), res.message || res.error || t('profile.updateError'));
      }
    } catch {
      Alert.alert(t('profile.title'), t('profile.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const performDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await authService.deleteAccount();
      if (res.success) {
        router.replace('/auth/login');
      } else {
        Alert.alert(t('profile.deleteConfirmTitle'), res.message || res.error || t('profile.deleteError'));
      }
    } catch {
      Alert.alert(t('profile.deleteConfirmTitle'), t('profile.deleteError'));
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAccount = () => {
    if (isGuest) {
      Alert.alert(t('profile.title'), t('profile.guestEditNotice'));
      return;
    }
    Alert.alert(
      t('profile.deleteConfirmTitle'),
      t('profile.deleteConfirmMessage'),
      [
        { text: t('profile.cancel'), style: 'cancel' },
        { text: t('profile.deleteConfirmButton'), style: 'destructive', onPress: performDelete },
      ],
      { cancelable: true }
    );
  };

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
    <ScreenBackground>
      <View style={[styles.header, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
        <Text style={[styles.title, { textAlign }]}>{t('settings.title')}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile card */}
        <TouchableOpacity style={[styles.profileCard, { flexDirection }]} onPress={openEdit} activeOpacity={0.8}>
          <View style={styles.avatar}>
            {loadingUser ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.avatarText}>{avatarInitial}</Text>
            )}
          </View>
          <View style={[styles.profileInfo, {
            marginLeft: isRTL ? 0 : 16,
            marginRight: isRTL ? 16 : 0,
            alignItems: isRTL ? 'flex-end' : 'flex-start',
          }]}>
            <Text style={[styles.profileName, { textAlign }]} numberOfLines={1}>
              {displayName || t('profile.noName')}
            </Text>
            <Text style={[styles.profileEmail, { textAlign }]} numberOfLines={1}>
              {isGuest ? t('profile.guest') : user?.email}
            </Text>
          </View>
          {!isGuest && (
            <Ionicons name="create-outline" size={22} color="#81C784" />
          )}
        </TouchableOpacity>

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

        {!isGuest && (
          <TouchableOpacity
            style={[styles.settingItem, { flexDirection }]}
            onPress={() => router.push('/voice/my-voice' as any)}
          >
            <Ionicons name="mic-outline" size={24} color="#4CAF50" />
            <View style={[styles.settingContent, {
              marginLeft: isRTL ? 0 : 16,
              marginRight: isRTL ? 16 : 0,
              alignItems: isRTL ? 'flex-end' : 'flex-start'
            }]}>
              <Text style={[styles.settingTitle, { textAlign }]}>{t('voice.title')}</Text>
              <Text style={[styles.settingSubtitle, { textAlign }]}>{t('voice.settingsSubtitle')}</Text>
            </View>
            <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color="#81C784" />
          </TouchableOpacity>
        )}

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

        {/* Delete account */}
        {!isGuest && (
          <TouchableOpacity
            style={[styles.deleteButton, { flexDirection }]}
            onPress={handleDeleteAccount}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color="#F44336" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={22} color="#F44336" />
                <Text style={[styles.deleteText, {
                  marginLeft: isRTL ? 0 : 16,
                  marginRight: isRTL ? 16 : 0,
                }]}>{t('profile.deleteAccount')}</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit profile modal */}
      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={[styles.modalHeader, { flexDirection }]}>
              <Text style={[styles.modalTitle, { textAlign }]}>{t('profile.editTitle')}</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Ionicons name="close" size={24} color="#B0B0B0" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { textAlign }]}>{t('profile.name')}</Text>
            <TextInput
              style={[styles.input, { textAlign }]}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder={t('profile.namePlaceholder')}
              placeholderTextColor="#6B7280"
            />

            <Text style={[styles.inputLabel, { textAlign }]}>{t('profile.email')}</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled, { textAlign }]}
              value={user?.email || ''}
              editable={false}
            />

            <Text style={[styles.sectionLabel, { textAlign }]}>{t('profile.changePassword')}</Text>
            <TextInput
              style={[styles.input, { textAlign }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder={t('profile.currentPassword')}
              placeholderTextColor="#6B7280"
              secureTextEntry
            />
            <TextInput
              style={[styles.input, { textAlign }]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t('profile.newPassword')}
              placeholderTextColor="#6B7280"
              secureTextEntry
            />

            <View style={[styles.modalActions, { flexDirection }]}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setEditVisible(false)}
                disabled={saving}
              >
                <Text style={styles.cancelBtnText}>{t('profile.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtnWrapper]}
                onPress={handleSaveProfile}
                disabled={saving}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={theme.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveBtn}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>{t('profile.save')}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // Profile
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(129, 199, 132, 0.30)',
    ...theme.shadows.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#81C784',
  },
  section: {
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(129, 199, 132, 0.18)',
    ...theme.shadows.md,
  },
  settingContent: {
    flex: 1,
    marginLeft: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
    fontWeight: '700',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#81C784',
  },
  languageList: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    marginTop: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(129, 199, 132, 0.18)',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeLanguageItem: {
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
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
    backgroundColor: 'rgba(244, 67, 54, 0.12)',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.40)',
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#F44336',
    marginLeft: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  deleteText: {
    fontSize: 16,
    color: '#F44336',
    marginLeft: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#102A43',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    color: '#81C784',
    marginBottom: 6,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 13,
    color: '#B0B0B0',
    marginBottom: 8,
    marginTop: 18,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputDisabled: {
    opacity: 0.6,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cancelBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtnWrapper: {
    padding: 0,
    overflow: 'hidden',
    ...theme.shadows.glow,
  },
  saveBtn: {
    flex: 1,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
