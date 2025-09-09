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
import { MD3LightTheme } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const SimpleModernLoginScreen = ({ onLogin, onNavigate, onBack }) => {
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
      const response = await axios.post('http://10.0.2.2:3000/api/auth/login', {
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

  const customTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: '#6366f1',
      primaryContainer: '#e0e7ff',
      secondary: '#8b5cf6',
      surface: '#ffffff',
      surfaceVariant: '#f8fafc',
      background: '#f1f5f9',
      error: '#ef4444',
    },
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
          <Avatar.Icon
            size={80}
            icon="library"
            style={styles.logo}
          />
          <Title style={styles.title}>Library System</Title>
          <Paragraph style={styles.subtitle}>
            Sign in to access your account
          </Paragraph>
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
          <Card style={styles.loginCard} elevation={4}>
            <Card.Content style={styles.cardContent}>
              <Title style={styles.formTitle}>Welcome Back</Title>
              
              {errors.general && (
                <HelperText type="error" visible={!!errors.general}>
                  {errors.general}
                </HelperText>
              )}

              <TextInput
                label="ID Number"
                value={idNumber}
                onChangeText={setIdNumber}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="account" />}
                error={!!errors.idNumber}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.idNumber && (
                <HelperText type="error" visible={!!errors.idNumber}>
                  {errors.idNumber}
                </HelperText>
              )}

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!showPassword}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                error={!!errors.password}
              />
              {errors.password && (
                <HelperText type="error" visible={!!errors.password}>
                  {errors.password}
                </HelperText>
              )}

              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.loginButton}
                contentStyle={styles.buttonContent}
                disabled={loading}
                loading={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <Divider style={styles.divider} />

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
            </Card.Content>
          </Card>
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
  logo: {
    backgroundColor: '#ffffff',
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
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },
  cardContent: {
    padding: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  loginButton: {
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  divider: {
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

export default SimpleModernLoginScreen;
