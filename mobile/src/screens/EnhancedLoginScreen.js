import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
import { ModernTheme } from '../styles/ModernTheme';
import { ModernButton, ModernInput } from '../components/ModernComponents';
import axios from 'axios';
import { buildApiUrl, getEndpoint } from '../config/api';

const { width, height } = Dimensions.get('window');

const EnhancedLoginScreen = ({ onLogin, onNavigate, onBack }) => {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleLogin = async () => {
    // Clear previous errors
    setErrors({});

    // Validation
    const newErrors = {};
    if (!idNumber) {
      newErrors.idNumber = 'ID Number is required';
    } else if (!/^[A-Z]\d{2}-\d{4}$/.test(idNumber)) {
      newErrors.idNumber = 'ID Number must be in format XXX-XXXX (e.g., C22-0044)';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(buildApiUrl(getEndpoint('AUTH', 'USER_LOGIN')), {
        idNumber,
        password,
      });

      if (response.data.success) {
        onLogin(response.data.user);
      }
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'An error occurred during login'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoWrapper}>
                <Icon name="library" size={40} color={ModernTheme.colors.primary} />
              </View>
            </View>
            
            <Text style={styles.title}>
              Welcome Back!
            </Text>
            
            <Text style={styles.subtitle}>
              Sign in to your account
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <ModernInput
              label="ID Number"
              placeholder="Enter your ID Number (e.g., C22-0044)"
              value={idNumber}
              onChangeText={setIdNumber}
              error={errors.idNumber}
              leftIcon="person-outline"
              autoCapitalize="characters"
              style={styles.input}
            />

            <ModernInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              leftIcon="lock-closed-outline"
              secureTextEntry
              style={styles.input}
            />

            <View style={styles.forgotPasswordContainer}>
              <ModernButton
                title="Forgot Password?"
                onPress={() => onNavigate('forgotPassword')}
                variant="outline"
                size="small"
                style={styles.forgotPasswordButton}
              />
            </View>

            <View style={styles.loginButtonContainer}>
              <ModernButton
                title={loading ? "Signing In..." : "Sign In"}
                onPress={handleLogin}
                variant="primary"
                size="large"
                loading={loading}
                disabled={loading}
                icon="log-in-outline"
                style={styles.loginButton}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <ModernButton
              title="Create Account"
              onPress={() => onNavigate('register')}
              variant="outline"
              size="small"
              style={styles.registerButton}
            />
          </View>

          {/* Back Button */}
          <View style={styles.backButtonContainer}>
            <ModernButton
              title="←"
              onPress={onBack}
              variant="secondary"
              size="small"
              style={styles.backButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ModernTheme.colors.background,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: ModernTheme.colors.backgroundGradient[0],
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: ModernTheme.spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: ModernTheme.spacing.xxl,
  },
  logoContainer: {
    marginBottom: ModernTheme.spacing.lg,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ModernTheme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    ...ModernTheme.shadows.card,
  },
  title: {
    ...ModernTheme.typography.h1,
    textAlign: 'center',
    marginBottom: ModernTheme.spacing.sm,
    color: ModernTheme.colors.textPrimary,
  },
  subtitle: {
    ...ModernTheme.typography.body,
    textAlign: 'center',
    color: ModernTheme.colors.textSecondary,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    marginBottom: ModernTheme.spacing.lg,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: ModernTheme.spacing.xl,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
  },
  loginButtonContainer: {
    marginBottom: ModernTheme.spacing.xl,
  },
  loginButton: {
    ...ModernTheme.shadows.elevated,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ModernTheme.spacing.lg,
  },
  footerText: {
    ...ModernTheme.typography.body,
    color: ModernTheme.colors.textSecondary,
  },
  registerButton: {
    marginLeft: ModernTheme.spacing.sm,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 60,
    left: ModernTheme.spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 0,
    backgroundColor: ModernTheme.colors.surface,
    borderWidth: 1,
    borderColor: ModernTheme.colors.border,
    ...ModernTheme.shadows.button,
  },
});

export default EnhancedLoginScreen;
