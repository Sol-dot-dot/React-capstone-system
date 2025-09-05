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
} from 'react-native';
import axios from 'axios';
import { ModernTheme, ModernStyles } from '../styles/ModernTheme';

const ModernRegisterScreen = ({ onRegister, onNavigate, onBack }) => {
  const [formData, setFormData] = useState({
    idNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { idNumber, email, password, confirmPassword } = formData;
    
    if (!idNumber.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await axios.post('http://10.0.2.2:5000/api/auth/user/register', {
        idNumber: formData.idNumber,
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        Alert.alert(
          'Registration Successful',
          'Please check your email for verification instructions.',
          [{ text: 'OK', onPress: () => onNavigate('email') }]
        );
        setFormData({
          idNumber: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
      } else {
        Alert.alert('Registration Failed', response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Registration failed. Please try again.');
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
        <Text style={ModernStyles.headerTitle}>Create Account</Text>
        <View style={ModernStyles.headerButton} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Logo/Icon Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>📚</Text>
            </View>
            <Text style={styles.welcomeTitle}>Join Our Library</Text>
            <Text style={styles.welcomeSubtitle}>Create your account to get started</Text>
          </View>

          {/* Registration Form */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Student ID Number</Text>
              <TextInput
                style={[ModernStyles.input, styles.input]}
                placeholder="Enter your student ID"
                placeholderTextColor={ModernTheme.colors.textMuted}
                value={formData.idNumber}
                onChangeText={(value) => handleInputChange('idNumber', value)}
                autoCapitalize="none"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={[ModernStyles.input, styles.input]}
                placeholder="Enter your email"
                placeholderTextColor={ModernTheme.colors.textMuted}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={[ModernStyles.input, styles.input]}
                placeholder="Create a password"
                placeholderTextColor={ModernTheme.colors.textMuted}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry
              />
              <Text style={styles.passwordHint}>Must be at least 6 characters</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={[ModernStyles.input, styles.input]}
                placeholder="Confirm your password"
                placeholderTextColor={ModernTheme.colors.textMuted}
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={[ModernStyles.primaryButton, styles.registerButton]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={ModernStyles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

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
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: ModernTheme.spacing.lg,
    paddingTop: ModernTheme.spacing.lg,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: ModernTheme.spacing.xl,
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
    marginBottom: ModernTheme.spacing.lg,
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
  passwordHint: {
    ...ModernTheme.typography.small,
    marginTop: ModernTheme.spacing.xs,
    color: ModernTheme.colors.textMuted,
  },
  registerButton: {
    marginTop: ModernTheme.spacing.md,
  },
  termsSection: {
    marginBottom: ModernTheme.spacing.lg,
  },
  termsText: {
    ...ModernTheme.typography.small,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: ModernTheme.colors.accent,
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ModernTheme.spacing.xl,
  },
  footerText: {
    ...ModernTheme.typography.caption,
    marginRight: ModernTheme.spacing.sm,
  },
  signInText: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.accent,
    fontWeight: '600',
  },
});

export default ModernRegisterScreen;
