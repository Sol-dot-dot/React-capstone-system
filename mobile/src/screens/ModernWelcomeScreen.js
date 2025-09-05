import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { ModernTheme, ModernStyles } from '../styles/ModernTheme';

const ModernWelcomeScreen = ({ onNavigate }) => {
  return (
    <SafeAreaView style={ModernStyles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Capstone Mobile App</Text>
          <Text style={styles.headerSubtitle}>Welcome</Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>📚</Text>
            </View>
            <Text style={styles.mainTitle}>Library Management</Text>
            <Text style={styles.subtitle}>Your digital library companion</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsSection}>
            <TouchableOpacity 
              style={[styles.primaryButton]}
              onPress={() => onNavigate('login')}
            >
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.secondaryButton]}
              onPress={() => onNavigate('register')}
            >
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
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
    backgroundColor: ModernTheme.colors.background,
    padding: ModernTheme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: ModernTheme.spacing.xxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ff6b6b20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ModernTheme.spacing.lg,
  },
  logoIcon: {
    fontSize: 50,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3498db',
    textAlign: 'center',
    marginBottom: ModernTheme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: '#b0b0b0',
    textAlign: 'center',
  },
  buttonsSection: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: ModernTheme.borderRadius.md,
    paddingVertical: ModernTheme.spacing.md,
    paddingHorizontal: ModernTheme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ModernTheme.spacing.md,
    ...ModernTheme.shadows.button,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: '#3a3a3a',
    borderRadius: ModernTheme.borderRadius.md,
    paddingVertical: ModernTheme.spacing.md,
    paddingHorizontal: ModernTheme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...ModernTheme.shadows.button,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default ModernWelcomeScreen;
