import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { ModernTheme, ModernStyles } from '../styles/ModernTheme';

const ModernLoginScreen = ({ onLogin, onNavigate, onBack }) => {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!idNumber.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://10.0.2.2:5000/api/auth/user/login', {
        idNumber,
        password,
      });

      if (response.data.success) {
        onLogin(response.data.user);
        setIdNumber('');
        setPassword('');
      } else {
        Alert.alert('Login Failed', response.data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={ModernStyles.container}>
      {/* Header */}
      <View style={ModernStyles.header}>
        <TouchableOpacity style={ModernStyles.headerButton} onPress={onBack}>
          <Text style={ModernStyles.buttonText}>←</Text>
        </TouchableOpacity>
        <Text style={ModernStyles.headerTitle}>Welcome Back</Text>
        <View style={ModernStyles.headerButton} />
      </View>

      <View style={styles.content}>
        {/* Logo/Icon Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>📚</Text>
          </View>
          <Text style={styles.welcomeTitle}>Library Management</Text>
          <Text style={styles.welcomeSubtitle}>Sign in to your account</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Student ID Number</Text>
            <TextInput
              style={[ModernStyles.input, styles.input]}
              placeholder="Enter your ID number"
              placeholderTextColor={ModernTheme.colors.textMuted}
              value={idNumber}
              onChangeText={setIdNumber}
              autoCapitalize="none"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={[ModernStyles.input, styles.input]}
              placeholder="Enter your password"
              placeholderTextColor={ModernTheme.colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[ModernStyles.primaryButton, styles.loginButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={ModernStyles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.forgotPasswordButton}
            onPress={() => onNavigate('forgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => onNavigate('register')}>
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: ModernTheme.spacing.lg,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: ModernTheme.spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ModernTheme.colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ModernTheme.spacing.lg,
  },
  logoIcon: {
    fontSize: 40,
  },
  welcomeTitle: {
    ...ModernTheme.typography.h1,
    textAlign: 'center',
    marginBottom: ModernTheme.spacing.sm,
  },
  welcomeSubtitle: {
    ...ModernTheme.typography.caption,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: ModernTheme.spacing.xl,
  },
  inputGroup: {
    marginBottom: ModernTheme.spacing.lg,
  },
  inputLabel: {
    ...ModernTheme.typography.caption,
    marginBottom: ModernTheme.spacing.sm,
    fontWeight: '600',
  },
  input: {
    fontSize: 16,
  },
  loginButton: {
    marginTop: ModernTheme.spacing.md,
    marginBottom: ModernTheme.spacing.lg,
  },
  forgotPasswordButton: {
    alignItems: 'center',
  },
  forgotPasswordText: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.accent,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    ...ModernTheme.typography.caption,
    marginRight: ModernTheme.spacing.sm,
  },
  signUpText: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.accent,
    fontWeight: '600',
  },
});

export default ModernLoginScreen;
