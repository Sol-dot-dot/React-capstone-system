import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
import { EnhancedTheme } from '../styles/EnhancedTheme';
import { EnhancedButton, EnhancedInput, EnhancedCard } from '../components/EnhancedComponents';
import axios from 'axios';
import { buildApiUrl, getEndpoint } from '../config/api';

const { width, height } = Dimensions.get('window');

const EnhancedLoginScreen = ({ onLogin, onNavigate, onBack }) => {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const animationSequence = Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    animationSequence.start(() => {
      setIsLoaded(true);
    });
  }, []);

  const handleLogin = async () => {
    // Clear previous errors
    setErrors({});

    // Enhanced validation with better error messages
    const newErrors = {};
    if (!idNumber.trim()) {
      newErrors.idNumber = 'ID Number is required';
    } else if (!/^[A-Z]\d{2}-\d{4}$/.test(idNumber.trim())) {
      newErrors.idNumber = 'Please enter a valid ID Number (e.g., C22-0044)';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(buildApiUrl(getEndpoint('AUTH', 'USER_LOGIN')), {
        idNumber: idNumber.trim(),
        password,
      });

      if (response.data.success) {
        onLogin(response.data.user);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred during login';
      Alert.alert(
        'Login Failed',
        errorMessage,
        [
          {
            text: 'Try Again',
            style: 'default',
          },
          {
            text: 'Forgot Password?',
            style: 'default',
            onPress: () => onNavigate('forgotPassword'),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Enhanced Background */}
      <View style={styles.backgroundGradient} />
      <View style={styles.backgroundPattern} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Enhanced Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoWrapper}>
                <Image 
                  source={require('../assets/smc-logo.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <View style={styles.logoGlow} />
              </View>
            </View>
            
            <Text style={styles.title}>
              Welcome Back!
            </Text>
            
            <Text style={styles.subtitle}>
              Sign in to access your library account
            </Text>
          </Animated.View>

          {/* Enhanced Form */}
          {isLoaded && (
            <Animatable.View
              animation="fadeInUp"
              duration={600}
              delay={200}
              style={styles.form}
            >
              <EnhancedCard style={styles.formCard}>
                <EnhancedInput
                  label="ID Number"
                  placeholder="Enter your ID Number (e.g., C22-0044)"
                  value={idNumber}
                  onChangeText={setIdNumber}
                  error={errors.idNumber}
                  leftIcon="person-outline"
                  autoCapitalize="characters"
                  style={styles.input}
                  accessibilityLabel="ID Number input field"
                  accessibilityHint="Enter your student ID number in the format XXX-XXXX"
                />

                <EnhancedInput
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  error={errors.password}
                  leftIcon="lock-closed-outline"
                  rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                  onRightIconPress={togglePasswordVisibility}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  accessibilityLabel="Password input field"
                  accessibilityHint="Enter your account password"
                />

                <View style={styles.forgotPasswordContainer}>
                  <TouchableOpacity
                    onPress={() => onNavigate('forgotPassword')}
                    style={styles.forgotPasswordButton}
                    accessibilityLabel="Forgot password"
                    accessibilityHint="Double tap to reset your password"
                  >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    <Icon name="arrow-forward" size={16} color={EnhancedTheme.colors.primary} />
                  </TouchableOpacity>
                </View>

                <EnhancedButton
                  title={loading ? "Signing In..." : "Sign In"}
                  onPress={handleLogin}
                  variant="primary"
                  size="large"
                  loading={loading}
                  disabled={loading}
                  icon="log-in-outline"
                  style={styles.loginButton}
                  accessibilityLabel="Sign in button"
                  accessibilityHint="Double tap to sign in to your account"
                />
              </EnhancedCard>
            </Animatable.View>
          )}

          {/* Enhanced Footer */}
          {isLoaded && (
            <Animatable.View
              animation="fadeInUp"
              duration={600}
              delay={400}
              style={styles.footer}
            >
              <View style={styles.footerContent}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity
                  onPress={() => onNavigate('register')}
                  style={styles.registerButton}
                  accessibilityLabel="Create account"
                  accessibilityHint="Double tap to create a new account"
                >
                  <Text style={styles.registerButtonText}>Create Account</Text>
                  <Icon name="arrow-forward" size={16} color={EnhancedTheme.colors.primary} />
                </TouchableOpacity>
              </View>
            </Animatable.View>
          )}

          {/* Enhanced Back Button */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={onBack}
            accessibilityLabel="Go back"
            accessibilityHint="Double tap to go back to the previous screen"
          >
            <Icon name="arrow-back" size={24} color={EnhancedTheme.colors.textPrimary} />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EnhancedTheme.colors.background,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: EnhancedTheme.colors.backgroundGradient[0],
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.02,
    backgroundColor: 'transparent',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: EnhancedTheme.spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: EnhancedTheme.spacing.xxl,
  },
  logoContainer: {
    marginBottom: EnhancedTheme.spacing.lg,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    ...EnhancedTheme.shadows.md,
  },
  logoGlow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: EnhancedTheme.colors.primary + '15',
    top: 5,
    left: 5,
  },
  title: {
    ...EnhancedTheme.typography.h1,
    textAlign: 'center',
    marginBottom: EnhancedTheme.spacing.sm,
    color: EnhancedTheme.colors.textPrimary,
    fontWeight: '800',
  },
  subtitle: {
    ...EnhancedTheme.typography.bodyLarge,
    textAlign: 'center',
    color: EnhancedTheme.colors.textSecondary,
    maxWidth: 280,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  formCard: {
    padding: EnhancedTheme.spacing.xl,
    ...EnhancedTheme.shadows.lg,
  },
  input: {
    marginBottom: EnhancedTheme.spacing.lg,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: EnhancedTheme.spacing.xl,
  },
  forgotPasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: EnhancedTheme.spacing.sm,
    paddingHorizontal: EnhancedTheme.spacing.sm,
  },
  forgotPasswordText: {
    ...EnhancedTheme.typography.bodyMedium,
    color: EnhancedTheme.colors.primary,
    fontWeight: '600',
    marginRight: EnhancedTheme.spacing.xs,
  },
  loginButton: {
    ...EnhancedTheme.shadows.lg,
  },
  footer: {
    marginTop: EnhancedTheme.spacing.xl,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    ...EnhancedTheme.typography.body,
    color: EnhancedTheme.colors.textSecondary,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: EnhancedTheme.spacing.sm,
    paddingHorizontal: EnhancedTheme.spacing.sm,
  },
  registerButtonText: {
    ...EnhancedTheme.typography.bodyMedium,
    color: EnhancedTheme.colors.primary,
    fontWeight: '600',
    marginRight: EnhancedTheme.spacing.xs,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: EnhancedTheme.colors.surface,
    borderRadius: 22,
    ...EnhancedTheme.shadows.md,
  },
});

export default EnhancedLoginScreen;