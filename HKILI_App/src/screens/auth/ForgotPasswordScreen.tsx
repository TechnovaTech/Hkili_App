import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { theme } from '../../theme';
import { authService } from '../../services/authService';
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // Step 1 asks for the email; step 2 asks for the emailed code + new password.
  const [step, setStep] = useState<'email' | 'reset'>('email');

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert(t('common.error'), t('auth.errEnterEmail'));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert(t('common.error'), t('auth.errInvalidEmail'));
      return;
    }

    setLoading(true);
    try {
      const res = await authService.sendOtp(email.trim(), 'reset');
      if (res.success) {
        if (step === 'email') {
          setOtp('');
          setNewPassword('');
          setStep('reset');
        }
      } else {
        const msg = res.error || res.message || 'Could not send the reset code';
        // Resend throttle — the earlier code is still valid; let them enter it.
        if (msg.toLowerCase().includes('wait') && step === 'email') {
          setStep('reset');
          return;
        }
        Alert.alert(t('common.error'), msg);
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('common.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (otp.trim().length !== 6) {
      Alert.alert(t('common.error'), t('auth.errEnterCode'));
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert(t('common.error'), t('auth.errNewPasswordMin'));
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword(email.trim(), otp.trim(), newPassword);
      if (res.success) {
        Alert.alert(t('common.success'), t('auth.resetSuccess'), [
          { text: 'OK', onPress: () => router.replace('/auth/login') },
        ]);
      } else {
        Alert.alert(t('common.error'), res.error || res.message || t('auth.errResetPassword'));
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('common.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'reset') {
      setStep('email');
      return;
    }
    router.back();
  };

  return (
    <ScreenBackground>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('auth.forgotQ')}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {step === 'email' ? (
          <>
            <Text style={styles.title}>{t('auth.forgotTitle')}</Text>
            <Text style={styles.subtitle}>
              {t('auth.forgotSubtitle')}
            </Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('auth.emailLabel')}</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder={t('auth.emailPlaceholder')}
                placeholderTextColor="#64B5F6"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButtonWrapper, loading ? styles.disabledButtonWrapper : theme.shadows.glow]}
              onPress={handleSendCode}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <View style={[styles.submitButton, styles.disabledButton]}>
                  <ActivityIndicator color="#FFFFFF" />
                </View>
              ) : (
                <LinearGradient
                  colors={theme.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitButton}
                >
                  <Text style={styles.submitButtonText}>{t('auth.sendCode')}</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>{t('auth.checkEmail')}</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to {email}. Enter it below with your new password.
            </Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('auth.codeLabel')}</Text>
              <TextInput
                style={[styles.input, styles.otpInput]}
                value={otp}
                onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="000000"
                placeholderTextColor="#64B5F6"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('auth.newPasswordLabel')}</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
                placeholder={t('auth.newPasswordPlaceholder')}
                placeholderTextColor="#64B5F6"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButtonWrapper, loading ? styles.disabledButtonWrapper : theme.shadows.glow]}
              onPress={handleReset}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <View style={[styles.submitButton, styles.disabledButton]}>
                  <ActivityIndicator color="#FFFFFF" />
                </View>
              ) : (
                <LinearGradient
                  colors={theme.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitButton}
                >
                  <Text style={styles.submitButtonText}>{t('auth.resetPasswordBtn')}</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.resendContainer} onPress={handleSendCode} disabled={loading}>
              <Text style={styles.resendText}>{t('auth.noCodeResend')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(129, 199, 132, 0.15)',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#81C784',
    lineHeight: 20,
    marginBottom: 30,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(129, 199, 132, 0.18)',
    ...theme.shadows.md,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 12,
    fontWeight: '800',
  },
  submitButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  disabledButtonWrapper: {
    overflow: 'hidden',
  },
  submitButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
});
