import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground } from '../../components/ui/ScreenBackground';
import { theme } from '../../theme';
import { authService } from '../../services/authService';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  // Two-step flow: 'form' collects email/password, 'otp' verifies the emailed code.
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState('');

  const handleBack = () => {
    if (step === 'otp') {
      setStep('form');
      setOtp('');
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/auth/login');
    }
  };

  // Create the account (with the code when the server requires one).
  const doRegister = async (otpCode?: string) => {
    setLoading(true);
    try {
      const response = await authService.register({ email, password, otp: otpCode });
      if (response.success) {
        router.replace('/character/add');
      } else {
        const msg = response.error || 'Something went wrong';
        if (step === 'otp') {
          Alert.alert('Verification Failed', msg);
        } else if (msg.toLowerCase().includes('email')) {
          setEmailError(msg);
        } else {
          Alert.alert('Registration Failed', msg);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: validate, then email a verification code.
  const handleSignUp = async () => {
    setEmailError('');
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (!acceptTerms) {
      Alert.alert('Error', 'Please accept the terms of service');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.sendOtp(email.trim(), 'register');
      if (!res.success) {
        const msg = res.error || res.message || 'Could not send the verification code';
        // Resend throttle (a code was sent <60s ago) — the earlier code is still
        // valid, so let the user proceed to enter it instead of dead-ending.
        if (msg.toLowerCase().includes('wait')) {
          setOtp('');
          setStep('otp');
          return;
        }
        if (msg.toLowerCase().includes('email')) setEmailError(msg);
        else Alert.alert('Error', msg);
        return;
      }
      if (res.otpRequired === false) {
        // Server has no mail service configured — register directly.
        await doRegister();
        return;
      }
      setOtp('');
      setStep('otp');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify the code and create the account.
  const handleVerify = () => {
    if (otp.trim().length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code from your email');
      return;
    }
    doRegister(otp.trim());
  };

  const handleResend = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await authService.sendOtp(email.trim(), 'register');
      Alert.alert(
        'Verification code',
        res.success ? 'A new code was sent to your email.' : res.error || 'Could not resend the code'
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{step === 'otp' ? 'Verify Email' : 'Sign Up'}</Text>
      </View>

      {/* Scrollable Content */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'form' ? (
            <>
              {/* Email Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Email*</Text>
                <TextInput
                  style={[styles.input, emailError ? styles.inputError : null]}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError('');
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor="#64B5F6"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>

              {/* Password Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Password*</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#64B5F6"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {/* Terms Checkbox */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAcceptTerms(!acceptTerms)}
              >
                <View style={[styles.checkbox, acceptTerms && styles.checkedCheckbox]}>
                  {acceptTerms && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.checkboxText}>
                  I accept the{' '}
                  <Text style={styles.linkText}>terms of service</Text>
                  {' & '}
                  <Text style={styles.linkText}>privacy policy</Text>
                </Text>
              </TouchableOpacity>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={[styles.signUpButtonWrapper, (!acceptTerms || loading) ? styles.disabledButtonWrapper : theme.shadows.glow]}
                onPress={handleSignUp}
                disabled={!acceptTerms || loading}
                activeOpacity={0.85}
              >
                {(!acceptTerms || loading) ? (
                  <View style={[styles.signUpButton, styles.disabledButton]}>
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.signUpButtonText, styles.disabledButtonText]}>Sign Up</Text>
                    )}
                  </View>
                ) : (
                  <LinearGradient
                    colors={theme.gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.signUpButton}
                  >
                    <Text style={styles.signUpButtonText}>Sign Up</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>
                  Already have an account? <Text style={styles.loginLink} onPress={handleLogin}>Login</Text>
                </Text>
              </View>
            </>
          ) : (
            <>
              {/* OTP verification step */}
              <Text style={styles.otpInfo}>
                We sent a 6-digit code to{'\n'}
                <Text style={styles.otpEmail}>{email}</Text>
              </Text>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Verification code*</Text>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  value={otp}
                  onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="000000"
                  placeholderTextColor="#64B5F6"
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={[styles.signUpButtonWrapper, (otp.length !== 6 || loading) ? styles.disabledButtonWrapper : theme.shadows.glow]}
                onPress={handleVerify}
                disabled={otp.length !== 6 || loading}
                activeOpacity={0.85}
              >
                {(otp.length !== 6 || loading) ? (
                  <View style={[styles.signUpButton, styles.disabledButton]}>
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.signUpButtonText, styles.disabledButtonText]}>Verify & Create Account</Text>
                    )}
                  </View>
                ) : (
                  <LinearGradient
                    colors={theme.gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.signUpButton}
                  >
                    <Text style={styles.signUpButtonText}>Verify & Create Account</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>

              {/* Resend */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>
                  Didn't get the code? <Text style={styles.loginLink} onPress={handleResend}>Resend</Text>
                </Text>
              </View>
            </>
          )}

          {/* Bottom Spacing for mobile date/time */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1929',
  },
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
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  fieldContainer: {
    marginBottom: 20,
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
  inputError: {
    borderColor: '#FF5252',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingRight: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#81C784',
    borderRadius: 3,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCheckbox: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkboxText: {
    fontSize: 14,
    color: '#81C784',
    flex: 1,
    lineHeight: 20,
  },
  linkText: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  signUpButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  disabledButtonWrapper: {
    overflow: 'hidden',
  },
  signUpButton: {
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
  disabledButtonText: {
    color: '#64B5F6',
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  googleButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 30,
  },
  googleButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loginText: {
    color: '#81C784',
    fontSize: 14,
  },
  loginLink: {
    color: '#2196F3',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
  otpInfo: {
    color: '#81C784',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  otpEmail: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 12,
    fontWeight: '800',
  },
});
