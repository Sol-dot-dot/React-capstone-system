import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { ModernTheme, ModernStyles } from '../styles/ModernTheme';

const { width } = Dimensions.get('window');

const ModernRegisterScreen = ({ onRegister, onNavigate, onBack }) => {
  const [formData, setFormData] = useState({
    idNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateField = (field, value) => {
    switch (field) {
      case 'idNumber':
        const idNumberRegex = /^[A-Z]\d{2}-\d{3,4}$/;
        if (!value.trim()) return 'ID Number is required';
        if (!idNumberRegex.test(value)) return 'Format: XXX-XXX or XXX-XXXX';
        return '';
      
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (value.trim().length < 2) return 'First name must be at least 2 characters';
        return '';
      
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (value.trim().length < 2) return 'Last name must be at least 2 characters';
        return '';
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) return 'Email is required';
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        if (!value.endsWith('@my.smciligan.edu.ph')) return 'Must be from @my.smciligan.edu.ph domain';
        return '';
      
      case 'password':
        if (!value.trim()) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      
      case 'confirmPassword':
        if (!value.trim()) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: '', color: '#e5e7eb' };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: '#ef4444' };
    if (password.length < 8) return { strength: 2, label: 'Fair', color: '#f59e0b' };
    if (password.length < 10) return { strength: 3, label: 'Good', color: '#3b82f6' };
    return { strength: 4, label: 'Strong', color: '#10b981' };
  };

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setCurrentStep(2);
      
      // Step 1: Check ID Number
      const idCheckResponse = await axios.post('http://10.0.2.2:5000/api/auth/user/check-id', {
        idNumber: formData.idNumber,
      });

      if (!idCheckResponse.data.success) {
        setErrors({ general: idCheckResponse.data.message || 'ID number check failed' });
        setCurrentStep(1);
        return;
      }

      setCurrentStep(3);

      // Step 2: Check Email and Send Verification Code
      const emailCheckResponse = await axios.post('http://10.0.2.2:5000/api/auth/user/check-email', {
        idNumber: formData.idNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      });

      if (!emailCheckResponse.data.success) {
        setErrors({ general: emailCheckResponse.data.message || 'Email check failed' });
        setCurrentStep(1);
        return;
      }

      setCurrentStep(4);
      
      // Navigate to verification screen after delay
      setTimeout(() => {
        onNavigate('verify', { 
          userId: emailCheckResponse.data.userId, 
          idNumber: formData.idNumber, 
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password 
        });
      }, 1500);
      
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ 
        general: error.response?.data?.message || 'Registration failed. Please try again.' 
      });
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity style={styles.headerButton} onPress={onBack}>
          <Icon name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={styles.headerButton} />
      </Animated.View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Logo/Icon Section */}
          <View style={styles.logoSection}>
            <Image 
              source={require('../assets/smc-logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.welcomeTitle}>Join Our Library</Text>
            <Text style={styles.welcomeSubtitle}>Create your account to get started</Text>
          </View>

          {/* Progress Steps */}
          <View style={styles.progressContainer}>
            {[1, 2, 3, 4].map((step) => (
              <View key={step} style={styles.progressStep}>
                <View style={[
                  styles.progressCircle,
                  currentStep >= step ? styles.progressCircleActive : styles.progressCircleInactive
                ]}>
                  {currentStep > step ? (
                    <Icon name="checkmark" size={16} color="#ffffff" />
                  ) : (
                    <Text style={[
                      styles.progressText,
                      currentStep >= step ? styles.progressTextActive : styles.progressTextInactive
                    ]}>
                      {step}
                    </Text>
                  )}
                </View>
                {step < 4 && (
                  <View style={[
                    styles.progressLine,
                    currentStep > step ? styles.progressLineActive : styles.progressLineInactive
                  ]} />
                )}
              </View>
            ))}
          </View>

          {/* Error Message */}
          {errors.general && (
            <Animated.View style={styles.errorContainer}>
              <Icon name="alert-circle" size={20} color="#ef4444" />
              <Text style={styles.errorText}>{errors.general}</Text>
            </Animated.View>
          )}

          {/* Registration Form */}
          {currentStep === 1 && (
            <View style={styles.formSection}>
              {/* ID Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Student ID Number</Text>
                <View style={styles.inputContainer}>
                  <Icon name="person" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, errors.idNumber && styles.inputError]}
                    placeholder="C22-004"
                    placeholderTextColor="#9ca3af"
                    value={formData.idNumber}
                    onChangeText={(value) => handleInputChange('idNumber', value.toUpperCase())}
                    autoCapitalize="characters"
                    keyboardType="default"
                    maxLength={8}
                  />
                  {formData.idNumber && !errors.idNumber && (
                    <Icon name="checkmark-circle" size={20} color="#10b981" style={styles.inputIcon} />
                  )}
                </View>
                {errors.idNumber && <Text style={styles.errorText}>{errors.idNumber}</Text>}
                <Text style={styles.inputHint}>Format: XXX-XXX or XXX-XXXX (e.g., C22-004)</Text>
              </View>

              {/* First Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>First Name</Text>
                <View style={styles.inputContainer}>
                  <Icon name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, errors.firstName && styles.inputError]}
                    placeholder="Enter your first name"
                    placeholderTextColor="#9ca3af"
                    value={formData.firstName}
                    onChangeText={(value) => handleInputChange('firstName', value)}
                    autoCapitalize="words"
                    keyboardType="default"
                  />
                  {formData.firstName && !errors.firstName && (
                    <Icon name="checkmark-circle" size={20} color="#10b981" style={styles.inputIcon} />
                  )}
                </View>
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
              </View>

              {/* Last Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <View style={styles.inputContainer}>
                  <Icon name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, errors.lastName && styles.inputError]}
                    placeholder="Enter your last name"
                    placeholderTextColor="#9ca3af"
                    value={formData.lastName}
                    onChangeText={(value) => handleInputChange('lastName', value)}
                    autoCapitalize="words"
                    keyboardType="default"
                  />
                  {formData.lastName && !errors.lastName && (
                    <Icon name="checkmark-circle" size={20} color="#10b981" style={styles.inputIcon} />
                  )}
                </View>
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Icon name="mail" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="yourname@my.smciligan.edu.ph"
                    placeholderTextColor="#9ca3af"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value.toLowerCase())}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  {formData.email && !errors.email && (
                    <Icon name="checkmark-circle" size={20} color="#10b981" style={styles.inputIcon} />
                  )}
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                <Text style={styles.inputHint}>Must be from @my.smciligan.edu.ph domain</Text>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputContainer}>
                  <Icon name="lock-closed" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, errors.password && styles.inputError]}
                    placeholder="Create a password"
                    placeholderTextColor="#9ca3af"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Icon 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#9ca3af" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <View style={styles.passwordStrengthContainer}>
                    <View style={styles.passwordStrengthBar}>
                      <View 
                        style={[
                          styles.passwordStrengthFill,
                          { 
                            width: `${(passwordStrength.strength / 4) * 100}%`,
                            backgroundColor: passwordStrength.color
                          }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                      {passwordStrength.label}
                    </Text>
                  </View>
                )}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <Icon name="lock-closed" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, errors.confirmPassword && styles.inputError]}
                    placeholder="Confirm your password"
                    placeholderTextColor="#9ca3af"
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Icon 
                      name={showConfirmPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#9ca3af" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>

              <TouchableOpacity 
                style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Icon name="person-add" size={20} color="#ffffff" style={styles.buttonIcon} />
                    <Text style={styles.registerButtonText}>Create Account</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Loading Steps */}
          {currentStep > 1 && currentStep < 4 && (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingIcon}>
                <ActivityIndicator size="large" color="#3b82f6" />
              </View>
              <Text style={styles.loadingTitle}>
                {currentStep === 2 && 'Checking ID Number...'}
                {currentStep === 3 && 'Verifying Email...'}
              </Text>
              <Text style={styles.loadingSubtitle}>
                {currentStep === 2 && 'Please wait while we verify your student ID.'}
                {currentStep === 3 && 'Sending verification code to your email...'}
              </Text>
            </View>
          )}

          {/* Success Step */}
          {currentStep === 4 && (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Icon name="checkmark-circle" size={48} color="#10b981" />
              </View>
              <Text style={styles.successTitle}>Verification Code Sent!</Text>
              <Text style={styles.successSubtitle}>
                Please check your email and enter the verification code to complete your registration.
              </Text>
            </View>
          )}

          {/* Terms and Conditions */}
          <View style={styles.termsSection}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => onNavigate('login')}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleActive: {
    backgroundColor: '#3b82f6',
  },
  progressCircleInactive: {
    backgroundColor: '#e5e7eb',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressTextActive: {
    color: '#ffffff',
  },
  progressTextInactive: {
    color: '#9ca3af',
  },
  progressLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#3b82f6',
  },
  progressLineInactive: {
    backgroundColor: '#e5e7eb',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginLeft: 8,
    flex: 1,
  },
  formSection: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    paddingVertical: 12,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  eyeButton: {
    padding: 4,
  },
  passwordStrengthContainer: {
    marginTop: 8,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 4,
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  registerButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  registerButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonIcon: {
    marginRight: 8,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingIcon: {
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  termsSection: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  termsText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  signInText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
});

export default ModernRegisterScreen;
