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
// import LinearGradient from 'react-native-linear-gradient';
import { ModernTheme } from '../styles/ModernTheme';
import { ModernButton } from '../components/ui/ModernComponents';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ onNavigate }) => {
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


        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <ModernButton
            title="Sign In"
            onPress={() => onNavigate('login')}
            variant="primary"
            size="medium"
            style={styles.primaryButton}
            icon="log-in-outline"
          />
          
          <ModernButton
            title="Create Account"
            onPress={() => onNavigate('register')}
            variant="secondary"
            size="medium"
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
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
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

export default WelcomeScreen;
