import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
// import { LinearGradient } from 'expo-linear-gradient';
import { ModernTheme, ModernStyles } from '../styles/ModernTheme';

const UltraModernLoginScreen = ({ onLogin, onNavigate, onBack }) => {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!idNumber || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate ID Number format
    const idNumberRegex = /^[A-Z]\d{2}-\d{3,4}$/;
    if (!idNumberRegex.test(idNumber)) {
      Alert.alert('Error', 'ID Number must be in format XXX-XXX or XXX-XXXX (e.g., C22-004)');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting login with:', { idNumber, password: '***' });
      
      const response = await axios.post('http://10.0.2.2:5000/api/auth/user/login', {
        idNumber,
        password,
      });

      console.log('Login response:', response.data);

      if (response.data.success) {
        onLogin(response.data.user);
      } else {
        Alert.alert('Login Failed', response.data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Invalid credentials. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.map(err => err.msg).join(', ');
      }
      
      Alert.alert('Login Failed', errorMessage);
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
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={ModernStyles.backButton} onPress={onBack}>
              <Icon name="arrow-back" size={20} color={ModernTheme.colors.textPrimary} />
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <View style={styles.logoImageWrapper}>
                <Image 
                  source={require('../assets/smc-logo.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>
            
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ID Number</Text>
              <TextInput
                style={styles.input}
                value={idNumber}
                onChangeText={setIdNumber}
                placeholder="Enter your ID Number (e.g., C22-0044)"
                placeholderTextColor={ModernTheme.colors.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={ModernTheme.colors.textMuted}
                secureTextEntry
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => onNavigate('forgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => onNavigate('register')}>
              <Text style={styles.footerLink}>Create Account</Text>
            </TouchableOpacity>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: ModernTheme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: ModernTheme.spacing.xl,
  },
  logoContainer: {
    marginBottom: ModernTheme.spacing.lg,
  },
  logoImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    shadowColor: ModernTheme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  title: {
    ...ModernTheme.typography.h2,
    textAlign: 'center',
    marginBottom: ModernTheme.spacing.sm,
  },
  subtitle: {
    ...ModernTheme.typography.body,
    textAlign: 'center',
    color: ModernTheme.colors.textSecondary,
  },
  form: {
    backgroundColor: ModernTheme.colors.surfaceElevated,
    borderRadius: ModernTheme.borderRadius.xl,
    padding: ModernTheme.spacing.xl,
    marginBottom: ModernTheme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: ModernTheme.spacing.lg,
  },
  label: {
    ...ModernTheme.typography.captionMedium,
    color: ModernTheme.colors.textPrimary,
    marginBottom: ModernTheme.spacing.sm,
  },
  input: {
    backgroundColor: ModernTheme.colors.background,
    borderRadius: ModernTheme.borderRadius.lg,
    paddingHorizontal: ModernTheme.spacing.lg,
    paddingVertical: ModernTheme.spacing.md,
    ...ModernTheme.typography.body,
    borderWidth: 1,
    borderColor: ModernTheme.colors.border,
    color: ModernTheme.colors.textPrimary,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: ModernTheme.spacing.xl,
  },
  forgotPasswordText: {
    ...ModernTheme.typography.captionMedium,
    color: ModernTheme.colors.primary,
  },
  loginButton: {
    backgroundColor: ModernTheme.colors.primary,
    borderRadius: ModernTheme.borderRadius.lg,
    paddingVertical: ModernTheme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ModernTheme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: ModernTheme.colors.gray[400],
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    ...ModernTheme.typography.bodyMedium,
    color: ModernTheme.colors.textInverse,
    fontSize: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ModernTheme.spacing.xl,
  },
  footerText: {
    ...ModernTheme.typography.body,
    color: ModernTheme.colors.textSecondary,
  },
  footerLink: {
    ...ModernTheme.typography.bodyMedium,
    color: ModernTheme.colors.primary,
  },
});

export default UltraModernLoginScreen;