import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
// import { Card, TextInput, Button, Title, Paragraph } from 'react-native-paper';
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
    <ScrollView style={ModernStyles.container}>
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
            <Image 
              source={require('../assets/smc-logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
              onError={(error) => console.log('Logo load error:', error)}
            />
          </View>
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
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
    </ScrollView>
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
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ModernTheme.spacing.lg,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: ModernTheme.spacing.sm,
    color: ModernTheme.colors.text,
  },
  welcomeSubtitle: {
    textAlign: 'center',
    color: ModernTheme.colors.textMuted,
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
    marginTop: ModernTheme.spacing.lg,
  },
  footerText: {
    ...ModernTheme.typography.caption,
    marginRight: ModernTheme.spacing.sm,
    color: ModernTheme.colors.textMuted,
  },
  signUpText: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.accent,
    fontWeight: '600',
  },
});

export default ModernLoginScreen;
