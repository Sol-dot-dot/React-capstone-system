import React, { useRef, useEffect, useState } from 'react';
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
import { EnhancedTheme } from '../styles/EnhancedTheme';
import { EnhancedButton, EnhancedCard } from '../components/EnhancedComponents';

const { width, height } = Dimensions.get('window');

const EnhancedWelcomeScreen = ({ onNavigate }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Staggered entrance animations for better visual impact
    const animationSequence = Animated.sequence([
      // Logo animation
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Content fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Content slide up
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

  const features = [
    {
      icon: 'library-outline',
      title: 'Digital Library',
      description: 'Access thousands of books instantly',
      color: EnhancedTheme.colors.primary,
    },
    {
      icon: 'time-outline',
      title: 'Smart Notifications',
      description: 'Never miss a due date',
      color: EnhancedTheme.colors.success,
    },
    {
      icon: 'search-outline',
      title: 'Easy Search',
      description: 'Find books quickly and easily',
      color: EnhancedTheme.colors.accent,
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Secure Access',
      description: 'Your data is always protected',
      color: EnhancedTheme.colors.secondary,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Enhanced Background with Gradient Effect */}
      <View style={styles.backgroundGradient} />
      <View style={styles.backgroundPattern} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Logo Section */}
        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
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
              <View style={styles.logoGlow} />
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

        {/* Enhanced Features Section */}
        {isLoaded && (
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={200}
            style={styles.featuresSection}
          >
            <Text style={styles.featuresTitle}>Why Choose Our App?</Text>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <Animatable.View
                  key={feature.title}
                  animation="fadeInUp"
                  duration={600}
                  delay={400 + (index * 100)}
                  style={styles.featureItem}
                >
                  <EnhancedCard style={styles.featureCard}>
                    <View style={[styles.featureIcon, { backgroundColor: feature.color + '15' }]}>
                      <Icon name={feature.icon} size={24} color={feature.color} />
                    </View>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </EnhancedCard>
                </Animatable.View>
              ))}
            </View>
          </Animatable.View>
        )}

        {/* Enhanced Action Buttons */}
        {isLoaded && (
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={1000}
            style={styles.actionSection}
          >
            <EnhancedButton
              title="Sign In"
              onPress={() => onNavigate('login')}
              variant="primary"
              size="large"
              style={styles.primaryButton}
              icon="log-in-outline"
              accessibilityLabel="Sign in to your account"
              accessibilityHint="Double tap to sign in to your library account"
            />
            
            <EnhancedButton
              title="Create Account"
              onPress={() => onNavigate('register')}
              variant="outline"
              size="large"
              style={styles.secondaryButton}
              icon="person-add-outline"
              accessibilityLabel="Create a new account"
              accessibilityHint="Double tap to create a new library account"
            />
          </Animatable.View>
        )}

        {/* Enhanced Footer */}
        {isLoaded && (
          <Animatable.View
            animation="fadeIn"
            duration={600}
            delay={1200}
            style={styles.footer}
          >
            <Text style={styles.footerText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </Animatable.View>
        )}
      </ScrollView>
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
    opacity: 0.03,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: EnhancedTheme.spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: EnhancedTheme.spacing.xxl,
  },
  logoContainer: {
    marginBottom: EnhancedTheme.spacing.xl,
  },
  logoImageWrapper: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    ...EnhancedTheme.shadows.lg,
  },
  logoGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: EnhancedTheme.colors.primary + '20',
    top: 10,
    left: 10,
  },
  title: {
    ...EnhancedTheme.typography.h1,
    textAlign: 'center',
    marginBottom: EnhancedTheme.spacing.sm,
    color: EnhancedTheme.colors.textPrimary,
    fontWeight: '800',
  },
  subtitle: {
    ...EnhancedTheme.typography.h4,
    textAlign: 'center',
    color: EnhancedTheme.colors.textSecondary,
    marginBottom: EnhancedTheme.spacing.lg,
    fontWeight: '600',
  },
  description: {
    ...EnhancedTheme.typography.bodyLarge,
    textAlign: 'center',
    color: EnhancedTheme.colors.textTertiary,
    lineHeight: 28,
    paddingHorizontal: EnhancedTheme.spacing.md,
    maxWidth: 320,
  },
  featuresSection: {
    marginBottom: EnhancedTheme.spacing.xxl,
  },
  featuresTitle: {
    ...EnhancedTheme.typography.h3,
    textAlign: 'center',
    color: EnhancedTheme.colors.textPrimary,
    marginBottom: EnhancedTheme.spacing.lg,
    fontWeight: '700',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    marginBottom: EnhancedTheme.spacing.md,
  },
  featureCard: {
    padding: EnhancedTheme.spacing.lg,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: EnhancedTheme.spacing.md,
  },
  featureTitle: {
    ...EnhancedTheme.typography.bodyMedium,
    textAlign: 'center',
    color: EnhancedTheme.colors.textPrimary,
    marginBottom: EnhancedTheme.spacing.xs,
    fontWeight: '600',
  },
  featureDescription: {
    ...EnhancedTheme.typography.caption,
    textAlign: 'center',
    color: EnhancedTheme.colors.textSecondary,
    lineHeight: 18,
  },
  actionSection: {
    gap: EnhancedTheme.spacing.md,
    marginTop: EnhancedTheme.spacing.lg,
  },
  primaryButton: {
    ...EnhancedTheme.shadows.lg,
  },
  secondaryButton: {
    borderColor: EnhancedTheme.colors.primary,
    backgroundColor: EnhancedTheme.colors.surface,
    ...EnhancedTheme.shadows.md,
  },
  footer: {
    marginTop: EnhancedTheme.spacing.xl,
    paddingHorizontal: EnhancedTheme.spacing.md,
  },
  footerText: {
    ...EnhancedTheme.typography.caption,
    textAlign: 'center',
    color: EnhancedTheme.colors.textMuted,
    lineHeight: 18,
  },
});

export default EnhancedWelcomeScreen;