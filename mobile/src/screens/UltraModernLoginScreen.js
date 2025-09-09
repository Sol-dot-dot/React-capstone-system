import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import {
  Card,
  TextInput,
  Button,
  Title,
  Paragraph,
  Surface,
  Avatar,
  Divider,
  HelperText,
  ActivityIndicator,
} from 'react-native-paper';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { Animated } from 'react-native';
import {
  MaterialIcons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const UltraModernLoginScreen = ({ onLogin, onNavigate, onBack }) => {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const scaleAnim = useSharedValue(0.9);
  const logoAnim = useSharedValue(0);
  const formAnim = useSharedValue(0);

  React.useEffect(() => {
    // Start animations
    fadeAnim.value = withTiming(1, { duration: 1000 });
    slideAnim.value = withSpring(0, { damping: 15, stiffness: 150 });
    scaleAnim.value = withSpring(1, { damping: 12, stiffness: 100 });
    logoAnim.value = withDelay(200, withSpring(1, { damping: 10 }));
    formAnim.value = withDelay(400, withSpring(1, { damping: 12 }));
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
      const response = await axios.post('http://10.0.2.2:5000/api/auth/user/login', {
        idNumber,
        password,
      });

      if (response.data.success) {
        onLogin(response.data.user);
        setIdNumber('');
        setPassword('');
      } else {
        setErrors({ general: response.data.message || 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [
        { translateY: slideAnim.value },
        { scale: scaleAnim.value },
      ],
    };
  });

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      opacity: logoAnim.value,
      transform: [
        {
          scale: interpolate(logoAnim.value, [0, 1], [0.5, 1], Extrapolate.CLAMP),
        },
        {
          rotate: interpolate(logoAnim.value, [0, 1], [180, 0], Extrapolate.CLAMP),
        },
      ],
    };
  });

  const animatedFormStyle = useAnimatedStyle(() => {
    return {
      opacity: formAnim.value,
      transform: [
        {
          translateY: interpolate(formAnim.value, [0, 1], [30, 0], Extrapolate.CLAMP),
        },
      ],
    };
  });

  return (
    <PaperProvider theme={MD3LightTheme}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.background}>
          {/* Background Gradient */}
          <View style={styles.gradientOverlay} />
          
          {/* Header */}
          <Animated.View style={[styles.header, animatedContainerStyle]}>
            <Button
              mode="text"
              onPress={onBack}
              style={styles.backButton}
              labelStyle={styles.backButtonText}
              icon="arrow-left"
            >
              Back
            </Button>
          </Animated.View>

          {/* Logo Section */}
          <Animated.View style={[styles.logoSection, animatedLogoStyle]}>
            <Surface style={styles.logoContainer} elevation={8}>
              <MaterialCommunityIcons name="book-open-variant" size={60} color="#1E40AF" />
            </Surface>
            <Title style={styles.logoTitle}>Library Management</Title>
            <Paragraph style={styles.logoSubtitle}>
              Your digital library companion
            </Paragraph>
          </Animated.View>

          {/* Login Form */}
          <Animated.View style={[styles.formContainer, animatedFormStyle]}>
            <Card style={styles.loginCard} elevation={8}>
              <Card.Content style={styles.cardContent}>
                <Title style={styles.formTitle}>Welcome Back!</Title>
                <Paragraph style={styles.formSubtitle}>
                  Sign in to your account
                </Paragraph>

                {errors.general && (
                  <Surface style={styles.errorContainer} elevation={2}>
                    <Text style={styles.errorText}>{errors.general}</Text>
                  </Surface>
                )}

                <View style={styles.inputContainer}>
                  <TextInput
                    label="Student ID Number"
                    value={idNumber}
                    onChangeText={setIdNumber}
                    mode="outlined"
                    style={styles.input}
                    autoCapitalize="characters"
                    keyboardType="default"
                    error={!!errors.idNumber}
                    left={<TextInput.Icon icon="account" />}
                  />
                  <HelperText type="error" visible={!!errors.idNumber}>
                    {errors.idNumber}
                  </HelperText>
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    style={styles.input}
                    secureTextEntry={!showPassword}
                    error={!!errors.password}
                    left={<TextInput.Icon icon="lock" />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                  />
                  <HelperText type="error" visible={!!errors.password}>
                    {errors.password}
                  </HelperText>
                </View>

                <Button
                  mode="text"
                  onPress={() => onNavigate('forgotPassword')}
                  style={styles.forgotButton}
                  labelStyle={styles.forgotButtonText}
                >
                  Forgot Password?
                </Button>

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                  style={styles.loginButton}
                  contentStyle={styles.loginButtonContent}
                  labelStyle={styles.loginButtonText}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>

                <Divider style={styles.divider} />

                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>Don't have an account? </Text>
                  <Button
                    mode="text"
                    onPress={() => onNavigate('register')}
                    labelStyle={styles.signupButtonText}
                  >
                    Sign Up
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </Animated.View>

          {/* Footer */}
          <Animated.View style={[styles.footer, animatedContainerStyle]}>
            <Text style={styles.footerText}>
              Secure • Reliable • Modern
            </Text>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: '#1E40AF',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(30, 64, 175, 0.9)',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  logoSection: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  logoSubtitle: {
    fontSize: 16,
    color: '#E0E7FF',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
  },
  cardContent: {
    padding: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotButtonText: {
    color: '#1E40AF',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    marginBottom: 20,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#E5E7EB',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#6B7280',
  },
  signupButtonText: {
    color: '#1E40AF',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#E0E7FF',
    textAlign: 'center',
  },
});

export default UltraModernLoginScreen;
