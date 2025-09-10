import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { buildApiUrl, getEndpoint } from '../config/api';

const { width, height } = Dimensions.get('window');

const SimpleLoginScreen = ({ onLogin, onNavigate, onBack }) => {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!idNumber.trim() || !password.trim()) {
      setErrors({
        idNumber: !idNumber.trim() ? 'ID Number is required' : '',
        password: !password.trim() ? 'Password is required' : '',
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post(buildApiUrl(getEndpoint('AUTH', 'USER_LOGIN')), {
        idNumber: idNumber.trim(),
        password: password.trim(),
      });

      if (response.data.success) {
        onLogin(response.data.user);
      } else {
        setErrors({ general: response.data.message || 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: error.response?.data?.message || 'Network error. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f1f5f9" />
      
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />
      
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <MaterialIcons name="library-books" size={80} color="#ffffff" />
        </View>
        <Text style={styles.title}>Library System</Text>
        <Text style={styles.subtitle}>
          Sign in to access your account
        </Text>
      </Animated.View>

      {/* Login Form */}
      <Animated.View
        style={[
          styles.formContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <View style={styles.loginCard}>
          <Text style={styles.formTitle}>Welcome Back</Text>
          
          {errors.general && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <MaterialIcons name="account-circle" size={24} color="#6366f1" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="ID Number"
              value={idNumber}
              onChangeText={setIdNumber}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#9ca3af"
            />
          </View>
          {errors.idNumber && (
            <Text style={styles.fieldError}>{errors.idNumber}</Text>
          )}

          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={24} color="#6366f1" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <MaterialIcons
                name={showPassword ? 'visibility-off' : 'visibility'}
                size={24}
                color="#9ca3af"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.fieldError}>{errors.password}</Text>
          )}

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.loginButtonText}>Signing In...</Text>
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.footerLinks}>
            <TouchableOpacity
              onPress={() => onNavigate('forgotPassword')}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>Forgot Password?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => onNavigate('register')}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
      >
        <MaterialIcons name="arrow-back" size={24} color="#6366f1" />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: '#6366f1',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loginCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 24,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  eyeIcon: {
    padding: 4,
  },
  fieldError: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 4,
  },
  loginButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkButton: {
    padding: 8,
  },
  linkText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default SimpleLoginScreen;
