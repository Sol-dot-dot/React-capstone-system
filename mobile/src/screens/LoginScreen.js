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
  Image,
  TouchableOpacity,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
import { ModernTheme } from '../styles/ModernTheme';
import {
  ModernButton,
  ModernInput
} from '../components/ui/ModernComponents';
import axios from 'axios';
import { buildApiUrl, getEndpoint } from '../config/api';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ onLogin, onNavigate, onBack }) => {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginStep, setLoginStep] = useState('idle'); // 'idle', 'validating', 'authenticating', 'success'

  const handleLogin = async () => {
    // Clear previous errors
    setErrors({});

    // Step 1: Validation
    setLoginStep('validating');
    
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
      setLoginStep('idle');
      return;
    }

    // Step 2: Authentication
    setLoginStep('authenticating');
    setLoading(true);
    
    try {
      const response = await axios.post(buildApiUrl(getEndpoint('AUTH', 'USER_LOGIN')), {
        idNumber,
        password,
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.data.success) {
        setLoginStep('success');
        // Small delay for better UX
        setTimeout(() => {
          // Pass both user data and token to onLogin
          onLogin(response.data.user, response.data.token);
        }, 300);
      }
    } catch (error) {
      setLoginStep('idle');
      
      let errorMessage = 'An error occurred during login';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. Please check your internet connection and try again.';
      } else if (error.response?.status === 401) {
        errorMessage = error.response.data.message || 'Invalid credentials. Please check your ID and password.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Account not verified. Please check your email and verify your account.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again in a few moments.';
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getLoginButtonText = () => {
    switch (loginStep) {
      case 'validating':
        return 'Validating...';
      case 'authenticating':
        return 'Signing In...';
      case 'success':
        return 'Success!';
      default:
        return 'Sign In';
    }
  };

  const getLoginButtonIcon = () => {
    switch (loginStep) {
      case 'validating':
        return <Icon name="checkmark-circle-outline" size={20} color="#ffffff" />;
      case 'authenticating':
        return <Icon name="log-in-outline" size={20} color="#ffffff" />;
      case 'success':
        return <Icon name="checkmark-circle" size={20} color="#ffffff" />;
      default:
        return <Icon name="log-in-outline" size={20} color="#ffffff" />;
    }
  };

  const getProgressWidth = () => {
    switch (loginStep) {
      case 'validating':
        return '33%';
      case 'authenticating':
        return '66%';
      case 'success':
        return '100%';
      default:
        return '0%';
    }
  };

  const getProgressText = () => {
    switch (loginStep) {
      case 'validating':
        return 'Validating credentials...';
      case 'authenticating':
        return 'Authenticating with server...';
      case 'success':
        return 'Login successful! Redirecting...';
      default:
        return '';
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
                <Image 
                  source={require('../assets/smc-logo.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                  onError={(error) => console.log('Logo load error:', error)}
                />
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
                title={getLoginButtonText()}
                onPress={handleLogin}
                variant="primary"
                size="large"
                loading={loading}
                disabled={loading || loginStep === 'validating'}
                icon={getLoginButtonIcon()}
                style={[styles.loginButton, loginStep === 'success' && styles.successButton]}
              />
            </View>
            
            {/* Loading Progress Indicator */}
            {loginStep !== 'idle' && (
              <Animatable.View 
                animation="fadeInUp" 
                duration={300}
                style={styles.progressContainer}
              >
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: getProgressWidth() }]} />
                </View>
                <Text style={styles.progressText}>{getProgressText()}</Text>
              </Animatable.View>
            )}
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
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Icon name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
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
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 50,
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Loading Progress Styles
  progressContainer: {
    marginTop: ModernTheme.spacing.lg,
    paddingHorizontal: ModernTheme.spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: ModernTheme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: ModernTheme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: ModernTheme.colors.primary,
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
  progressText: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
    textAlign: 'center',
    fontSize: 12,
  },
  successButton: {
    backgroundColor: ModernTheme.colors.success,
  },
});

export default LoginScreen;
