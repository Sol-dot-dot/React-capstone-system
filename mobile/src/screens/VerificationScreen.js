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
import { buildApiUrl, getEndpoint } from '../config/api';

const VerificationScreen = ({ onNavigate, onBack, userData }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Verification code must be 6 digits');
      return;
    }

    try {
      setLoading(true);
      
      // Step 3: Verify Email Code
      console.log('Step 3: Verifying email code...');
      const verifyResponse = await axios.post(buildApiUrl(getEndpoint('AUTH', 'USER_VERIFY_CODE')), {
        idNumber: userData.idNumber,
        email: userData.email,
        verificationCode: verificationCode,
      });

      if (!verifyResponse.data.success) {
        Alert.alert('Verification Failed', verifyResponse.data.message || 'Invalid verification code');
        return;
      }

      // Step 4: Complete Registration with Password
      console.log('Step 4: Completing registration...');
      const completeResponse = await axios.post(buildApiUrl(getEndpoint('AUTH', 'USER_COMPLETE_REGISTRATION')), {
        userId: userData.userId,
        password: userData.password,
      });

      if (completeResponse.data.success) {
        Alert.alert(
          'Registration Successful!',
          'Your account has been created successfully. You can now login.',
          [
            {
              text: 'OK',
              onPress: () => onNavigate('login'),
            },
          ]
        );
      } else {
        Alert.alert('Registration Failed', completeResponse.data.message || 'Failed to complete registration');
      }
      
    } catch (error) {
      console.error('Verification error:', error);
      const errorMessage = error.response?.data?.message || 'Verification failed. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setLoading(true);
      
      // Resend verification code
      const response = await axios.post(buildApiUrl(getEndpoint('AUTH', 'USER_CHECK_EMAIL')), {
        idNumber: userData.idNumber,
        email: userData.email,
      });

      if (response.data.success) {
        Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
      } else {
        Alert.alert('Error', 'Failed to resend verification code');
      }
      
    } catch (error) {
      console.error('Resend code error:', error);
      Alert.alert('Error', 'Failed to resend verification code');
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
        <Text style={ModernStyles.headerTitle}>Verify Email</Text>
        <View style={ModernStyles.headerButton} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Logo/Icon Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>📧</Text>
            </View>
            <Text style={styles.welcomeTitle}>Check Your Email</Text>
            <Text style={styles.welcomeSubtitle}>
              We've sent a 6-digit verification code to{'\n'}
              <Text style={styles.emailText}>{userData?.email}</Text>
            </Text>
          </View>

          {/* Verification Form */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Verification Code</Text>
              <TextInput
                style={[ModernStyles.input, styles.input, styles.codeInput]}
                placeholder="123456"
                placeholderTextColor={ModernTheme.colors.textMuted}
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="numeric"
                maxLength={6}
                textAlign="center"
                autoFocus
              />
              <Text style={styles.inputHint}>Enter the 6-digit code from your email</Text>
            </View>

            <TouchableOpacity 
              style={[ModernStyles.primaryButton, styles.verifyButton]}
              onPress={handleVerifyCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={ModernStyles.buttonText}>Verify & Complete Registration</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[ModernStyles.secondaryButton, styles.resendButton]}
              onPress={handleResendCode}
              disabled={loading}
            >
              <Text style={[ModernStyles.buttonText, { color: ModernTheme.colors.primary }]}>
                Resend Code
              </Text>
            </TouchableOpacity>
          </View>

          {/* Help Section */}
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>Didn't receive the code?</Text>
            <Text style={styles.helpText}>
              • Check your spam/junk folder{'\n'}
              • Make sure you entered the correct email address{'\n'}
              • Wait a few minutes and try resending{'\n'}
              • Contact support if the problem persists
            </Text>
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
    lineHeight: 20,
  },
  emailText: {
    fontWeight: '600',
    color: ModernTheme.colors.primary,
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
  codeInput: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 8,
  },
  inputHint: {
    ...ModernTheme.typography.small,
    marginTop: ModernTheme.spacing.xs,
    color: ModernTheme.colors.textMuted,
    textAlign: 'center',
  },
  verifyButton: {
    marginTop: ModernTheme.spacing.md,
  },
  resendButton: {
    marginTop: ModernTheme.spacing.md,
  },
  helpSection: {
    marginBottom: ModernTheme.spacing.xl,
  },
  helpTitle: {
    ...ModernTheme.typography.caption,
    fontWeight: '600',
    marginBottom: ModernTheme.spacing.sm,
    textAlign: 'center',
  },
  helpText: {
    ...ModernTheme.typography.small,
    textAlign: 'center',
    lineHeight: 20,
    color: ModernTheme.colors.textMuted,
  },
});

export default VerificationScreen;










