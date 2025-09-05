import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { ModernTheme, ModernStyles } from '../styles/ModernTheme';

const ModernForgotPasswordScreen = ({ onBack, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  console.log('ModernForgotPasswordScreen rendered');

  const handleSendResetCode = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://10.0.2.2:5000/api/auth/user/forgot-password', {
        email,
      });

      if (response.data.success) {
        Alert.alert(
          'Reset Code Sent',
          'Please check your email for the reset code.',
          [{ text: 'OK', onPress: () => onNavigate('resetPassword') }]
        );
        setEmail('');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to send reset code');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      Alert.alert('Error', 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={ModernStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Capstone Mobile App</Text>
        <Text style={styles.headerSubtitle}>Forgot Password</Text>
      </View>

      <View style={styles.content}>
        {/* Main Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Forgot Password?</Text>
          <Text style={styles.cardSubtitle}>
            Enter your email address and we'll send you a reset code
          </Text>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#b0b0b0"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Send Reset Code Button */}
          <TouchableOpacity 
            style={[styles.primaryButton]}
            onPress={handleSendResetCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Send Reset Code</Text>
            )}
          </TouchableOpacity>

          {/* Back to Login */}
          <View style={styles.loginLink}>
            <Text style={styles.loginText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => onNavigate('login')}>
              <Text style={styles.loginLinkText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#ffffff',
    paddingVertical: ModernTheme.spacing.lg,
    paddingHorizontal: ModernTheme.spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: ModernTheme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: ModernTheme.spacing.lg,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: ModernTheme.borderRadius.lg,
    padding: ModernTheme.spacing.xl,
    ...ModernTheme.shadows.card,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: ModernTheme.spacing.sm,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: ModernTheme.spacing.xl,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: ModernTheme.spacing.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: ModernTheme.spacing.sm,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: ModernTheme.borderRadius.md,
    paddingHorizontal: ModernTheme.spacing.md,
    paddingVertical: ModernTheme.spacing.md,
    fontSize: 16,
    color: '#2c3e50',
  },
  primaryButton: {
    backgroundColor: '#3498db',
    borderRadius: ModernTheme.borderRadius.md,
    paddingVertical: ModernTheme.spacing.md,
    paddingHorizontal: ModernTheme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ModernTheme.spacing.lg,
    ...ModernTheme.shadows.button,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  loginLinkText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '600',
  },
});

export default ModernForgotPasswordScreen;
