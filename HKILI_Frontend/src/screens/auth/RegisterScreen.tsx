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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSignUp = () => {
    console.log('Sign up:', { email, password, acceptTerms });
    router.push('/character/add');
  };

  const handleGoogleSignIn = () => {
    console.log('Google sign in');
    router.push('/character/add');
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1929" />
      
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign Up</Text>
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
          {/* Email Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email*</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#64B5F6"
              keyboardType="email-address"
              autoCapitalize="none"
            />
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
            style={[styles.signUpButton, !acceptTerms && styles.disabledButton]}
            onPress={handleSignUp}
            disabled={!acceptTerms}
          >
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>

          {/* Google Sign In Button */}
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
            <Text style={styles.googleButtonText}>🔍 Sign in with Google</Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginLink} onPress={handleLogin}>Login</Text>
            </Text>
          </View>

          {/* Bottom Spacing for mobile date/time */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
    backgroundColor: '#0A1929',
    borderBottomWidth: 0,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
  signUpButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 30,
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
});