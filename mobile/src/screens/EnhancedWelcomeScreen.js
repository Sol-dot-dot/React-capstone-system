import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  ScrollView,
  Animated,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
import { ModernTheme } from '../styles/ModernTheme';
import { ModernButton } from '../components/ModernComponents';

const { width, height } = Dimensions.get('window');

const EnhancedWelcomeScreen = ({ onNavigate }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Staggered entrance animations
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: 300,
      useNativeDriver: true,
    }).start();
    
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      delay: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const features = [
    {
      icon: 'notifications-outline',
      title: 'Smart Notifications',
      description: 'Get timely reminders for book returns',
      color: ModernTheme.colors.primary,
    },
    {
      icon: 'book-outline',
      title: 'Track Borrowing',
      description: 'Monitor your borrowed books easily',
      color: ModernTheme.colors.success,
    },
    {
      icon: 'chatbubble-outline',
      title: 'AI Assistant',
      description: 'Get help with library queries',
      color: ModernTheme.colors.accent,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoImageWrapper}>
              <Image 
                source={require('../assets/smc-logo.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>
          
          <Text style={styles.title}>
            SMC Library System
          </Text>
          
          <Text style={styles.subtitle}>
            St. Michael's College
          </Text>
          
          <Text style={styles.description}>
            Your digital library companion for seamless book management and borrowing
          </Text>
        </Animated.View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Key Features</Text>
          {features.map((feature, index) => (
            <View
              key={feature.title}
              style={styles.featureItem}
            >
              <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                <Icon name={feature.icon} size={28} color={feature.color} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <ModernButton
            title="Sign In"
            onPress={() => onNavigate('login')}
            variant="primary"
            size="large"
            style={styles.primaryButton}
            icon="log-in-outline"
          />
          
          <ModernButton
            title="Create Account"
            onPress={() => onNavigate('register')}
            variant="secondary"
            size="large"
            style={styles.secondaryButton}
            icon="person-add-outline"
          />
        </View>
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: ModernTheme.spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: ModernTheme.spacing.xxl,
  },
  logoContainer: {
    marginBottom: ModernTheme.spacing.xl,
  },
  logoImageWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: ModernTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...ModernTheme.shadows.elevated,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  title: {
    ...ModernTheme.typography.h1,
    textAlign: 'center',
    marginBottom: ModernTheme.spacing.sm,
    color: ModernTheme.colors.textPrimary,
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
    marginBottom: ModernTheme.spacing.xxl,
  },
  featuresTitle: {
    ...ModernTheme.typography.h3,
    textAlign: 'center',
    marginBottom: ModernTheme.spacing.lg,
    color: ModernTheme.colors.textPrimary,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ModernTheme.colors.surface,
    borderRadius: ModernTheme.borderRadius.lg,
    padding: ModernTheme.spacing.lg,
    marginBottom: ModernTheme.spacing.md,
    ...ModernTheme.shadows.card,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ModernTheme.spacing.lg,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...ModernTheme.typography.bodyMedium,
    color: ModernTheme.colors.textPrimary,
    marginBottom: ModernTheme.spacing.xs,
    fontWeight: '600',
  },
  featureDescription: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
    lineHeight: 20,
  },
  actionSection: {
    gap: ModernTheme.spacing.md,
    marginTop: ModernTheme.spacing.lg,
  },
  primaryButton: {
    ...ModernTheme.shadows.elevated,
  },
  secondaryButton: {
    borderColor: ModernTheme.colors.primary,
    backgroundColor: ModernTheme.colors.surface,
    ...ModernTheme.shadows.button,
  },
});

export default EnhancedWelcomeScreen;
