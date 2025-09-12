import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
// import { LinearGradient } from 'expo-linear-gradient';
import { ModernTheme } from '../styles/ModernTheme';

const { width, height } = Dimensions.get('window');

const UltraModernWelcomeScreen = ({ onNavigate }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />
      
      {/* Content */}
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>SMC</Text>
            </View>
          </View>
          
          <Text style={styles.title}>SMC Library System</Text>
          <Text style={styles.subtitle}>St. Michael's College</Text>
          <Text style={styles.description}>
            Your digital library companion for seamless book management and borrowing
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: ModernTheme.colors.primary + '20' }]}>
              <Icon name="library-outline" size={24} color={ModernTheme.colors.primary} />
            </View>
            <Text style={styles.featureText}>Browse Books</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: ModernTheme.colors.success + '20' }]}>
              <Icon name="book-outline" size={24} color={ModernTheme.colors.success} />
            </View>
            <Text style={styles.featureText}>Track Borrowing</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: ModernTheme.colors.accent + '20' }]}>
              <Icon name="chatbubble-outline" size={24} color={ModernTheme.colors.accent} />
            </View>
            <Text style={styles.featureText}>AI Assistant</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => onNavigate('login')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => onNavigate('register')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: ModernTheme.spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    marginBottom: ModernTheme.spacing.xl,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: ModernTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ModernTheme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700',
    color: ModernTheme.colors.textInverse,
  },
  title: {
    ...ModernTheme.typography.h1,
    textAlign: 'center',
    marginBottom: ModernTheme.spacing.sm,
  },
  subtitle: {
    ...ModernTheme.typography.h4,
    textAlign: 'center',
    color: ModernTheme.colors.textSecondary,
    marginBottom: ModernTheme.spacing.lg,
  },
  description: {
    ...ModernTheme.typography.body,
    textAlign: 'center',
    color: ModernTheme.colors.textTertiary,
    lineHeight: 24,
    paddingHorizontal: ModernTheme.spacing.md,
  },
  featuresSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: ModernTheme.spacing.xxl,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ModernTheme.spacing.sm,
  },
  featureText: {
    ...ModernTheme.typography.captionMedium,
    textAlign: 'center',
    color: ModernTheme.colors.textSecondary,
  },
  actionSection: {
    gap: ModernTheme.spacing.md,
  },
  primaryButton: {
    backgroundColor: ModernTheme.colors.primary,
    borderRadius: ModernTheme.borderRadius.lg,
    paddingVertical: ModernTheme.spacing.lg,
    paddingHorizontal: ModernTheme.spacing.xl,
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
  primaryButtonText: {
    ...ModernTheme.typography.bodyMedium,
    color: ModernTheme.colors.textInverse,
    fontSize: 18,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: ModernTheme.borderRadius.lg,
    paddingVertical: ModernTheme.spacing.lg,
    paddingHorizontal: ModernTheme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: ModernTheme.colors.primary,
  },
  secondaryButtonText: {
    ...ModernTheme.typography.bodyMedium,
    color: ModernTheme.colors.primary,
    fontSize: 18,
  },
});

export default UltraModernWelcomeScreen;
