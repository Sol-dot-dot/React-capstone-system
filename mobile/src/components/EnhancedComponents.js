import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
import { EnhancedTheme } from '../styles/EnhancedTheme';

const { width } = Dimensions.get('window');

// Enhanced Button Component with improved accessibility and animations
export const EnhancedButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        ...EnhancedTheme.animations.springBouncy,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: EnhancedTheme.animations.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...EnhancedTheme.animations.spring,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: EnhancedTheme.animations.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`button_${variant}`], styles[`button_${size}`]];
    if (disabled) baseStyle.push(styles.buttonDisabled);
    if (isPressed) baseStyle.push(styles.buttonPressed);
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText, styles[`buttonText_${variant}`], styles[`buttonText_${size}`]];
    if (disabled) baseStyle.push(styles.buttonTextDisabled);
    return baseStyle;
  };

  const getIconColor = () => {
    if (disabled) return EnhancedTheme.colors.textDisabled;
    if (variant === 'primary' || variant === 'secondary') return EnhancedTheme.colors.textInverse;
    return EnhancedTheme.colors.primary;
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      <Pressable
        style={getButtonStyle()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading }}
        {...props}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator 
              size="small" 
              color={getIconColor()} 
              style={styles.loadingSpinner}
            />
            <Text style={[getTextStyle(), { marginLeft: EnhancedTheme.spacing.sm }]}>
              Loading...
            </Text>
          </View>
        ) : (
          <View style={styles.buttonContent}>
            {icon && iconPosition === 'left' && (
              <Icon 
                name={icon} 
                size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
                color={getIconColor()} 
                style={styles.buttonIcon} 
              />
            )}
            {title && <Text style={[getTextStyle(), textStyle]}>{title}</Text>}
            {icon && iconPosition === 'right' && (
              <Icon 
                name={icon} 
                size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
                color={getIconColor()} 
                style={styles.buttonIcon} 
              />
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

// Enhanced Input Component with better validation and accessibility
export const EnhancedInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  disabled = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) => {
  const focusAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: EnhancedTheme.animations.duration.normal,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(focusAnim, {
        toValue: 0,
        duration: EnhancedTheme.animations.duration.normal,
        useNativeDriver: false,
      }).start();
    }
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [EnhancedTheme.colors.border, EnhancedTheme.colors.borderFocus],
  });

  const labelColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [EnhancedTheme.colors.textSecondary, EnhancedTheme.colors.primary],
  });

  return (
    <Animated.View
      style={[
        styles.inputContainer,
        { transform: [{ translateX: shakeAnim }] },
        style,
      ]}
    >
      {label && (
        <Animated.Text style={[styles.inputLabel, { color: labelColor }]}>
          {label}
        </Animated.Text>
      )}
      <Animated.View
        style={[
          styles.inputWrapper,
          { borderColor },
          error && styles.inputError,
          disabled && styles.inputDisabled,
          isFocused && styles.inputFocused,
        ]}
      >
        {leftIcon && (
          <Icon 
            name={leftIcon} 
            size={20} 
            color={isFocused ? EnhancedTheme.colors.primary : EnhancedTheme.colors.textTertiary} 
            style={styles.inputIcon} 
          />
        )}
        <TextInput
          style={[styles.input, disabled && styles.inputTextDisabled]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          editable={!disabled}
          placeholderTextColor={EnhancedTheme.colors.textMuted}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled }}
          {...props}
        />
        {rightIcon && (
          <Pressable 
            onPress={onRightIconPress} 
            style={styles.inputIconButton}
            accessibilityRole="button"
            accessibilityLabel={`${rightIcon} action`}
          >
            <Icon 
              name={rightIcon} 
              size={20} 
              color={isFocused ? EnhancedTheme.colors.primary : EnhancedTheme.colors.textTertiary} 
            />
          </Pressable>
        )}
      </Animated.View>
      {error && (
        <Animatable.View 
          animation="fadeInDown" 
          duration={300}
          style={styles.errorContainer}
        >
          <Icon name="alert-circle" size={16} color={EnhancedTheme.colors.error} />
          <Text style={styles.inputErrorText}>{error}</Text>
        </Animatable.View>
      )}
    </Animated.View>
  );
};

// Enhanced Card Component with better interactions
export const EnhancedCard = ({
  children,
  style,
  onPress,
  variant = 'default',
  animated = true,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    if (onPress) {
      setIsPressed(true);
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        ...EnhancedTheme.animations.spring,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      setIsPressed(false);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...EnhancedTheme.animations.spring,
      }).start();
    }
  };

  const getCardStyle = () => {
    const baseStyle = [styles.card, styles[`card_${variant}`]];
    if (isPressed) baseStyle.push(styles.cardPressed);
    return baseStyle;
  };

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={getCardStyle()}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityRole="button"
          {...props}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View style={[getCardStyle(), style]} {...props}>
      {children}
    </View>
  );
};

// Enhanced Badge Component with better variants
export const EnhancedBadge = ({
  text,
  variant = 'primary',
  size = 'medium',
  style,
  ...props
}) => {
  return (
    <View
      style={[styles.badge, styles[`badge_${variant}`], styles[`badge_${size}`], style]}
      {...props}
    >
      <Text style={[styles.badgeText, styles[`badgeText_${size}`]]}>
        {text}
      </Text>
    </View>
  );
};

// Enhanced Loading Spinner with better animations
export const EnhancedSpinner = ({ 
  size = 'medium', 
  color = EnhancedTheme.colors.primary,
  style 
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    rotate.start();
    return () => rotate.stop();
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.spinner, styles[`spinner_${size}`], { transform: [{ rotate }] }, style]}>
      <ActivityIndicator size="small" color={color} />
    </Animated.View>
  );
};

// Enhanced List Item Component
export const EnhancedListItem = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onPress,
  style,
  badge,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) => {
  return (
    <EnhancedCard 
      onPress={onPress} 
      style={[styles.listItem, style]} 
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      {...props}
    >
      <View style={styles.listItemContent}>
        {leftIcon && (
          <View style={styles.listItemIcon}>
            <Icon name={leftIcon} size={24} color={EnhancedTheme.colors.primary} />
          </View>
        )}
        <View style={styles.listItemText}>
          <Text style={styles.listItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.listItemSubtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.listItemRight}>
          {badge && <EnhancedBadge {...badge} />}
          {rightIcon && (
            <Icon name={rightIcon} size={20} color={EnhancedTheme.colors.textTertiary} />
          )}
        </View>
      </View>
    </EnhancedCard>
  );
};

// Enhanced Floating Action Button
export const EnhancedFAB = ({
  onPress,
  icon = 'add',
  variant = 'primary',
  size = 'medium',
  style,
  accessibilityLabel,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      ...EnhancedTheme.animations.springBouncy,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...EnhancedTheme.animations.spring,
    }).start();
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.fab,
          styles[`fab_${variant}`],
          styles[`fab_${size}`],
          isPressed && styles.fabPressed,
        ]}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        {...props}
      >
        <Icon 
          name={icon} 
          size={size === 'small' ? 20 : size === 'large' ? 28 : 24} 
          color={EnhancedTheme.colors.textInverse} 
        />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Enhanced Button styles
  button: {
    borderRadius: EnhancedTheme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...EnhancedTheme.shadows.sm,
  },
  button_primary: {
    backgroundColor: EnhancedTheme.colors.primary,
  },
  button_secondary: {
    backgroundColor: EnhancedTheme.colors.secondary,
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: EnhancedTheme.colors.primary,
  },
  button_ghost: {
    backgroundColor: 'transparent',
  },
  button_small: {
    paddingVertical: EnhancedTheme.spacing.sm,
    paddingHorizontal: EnhancedTheme.spacing.md,
    minHeight: 36,
  },
  button_medium: {
    paddingVertical: EnhancedTheme.spacing.md,
    paddingHorizontal: EnhancedTheme.spacing.lg,
    minHeight: 44,
  },
  button_large: {
    paddingVertical: EnhancedTheme.spacing.lg,
    paddingHorizontal: EnhancedTheme.spacing.xl,
    minHeight: 52,
  },
  buttonDisabled: {
    backgroundColor: EnhancedTheme.colors.gray[300],
    borderColor: EnhancedTheme.colors.gray[300],
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: EnhancedTheme.spacing.xs,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    marginRight: EnhancedTheme.spacing.xs,
  },
  buttonIcon: {
    marginHorizontal: EnhancedTheme.spacing.xs,
  },
  buttonText: {
    ...EnhancedTheme.typography.button,
    textAlign: 'center',
  },
  buttonText_primary: {
    color: EnhancedTheme.colors.textInverse,
  },
  buttonText_secondary: {
    color: EnhancedTheme.colors.textInverse,
  },
  buttonText_outline: {
    color: EnhancedTheme.colors.primary,
  },
  buttonText_ghost: {
    color: EnhancedTheme.colors.primary,
  },
  buttonText_small: {
    fontSize: 14,
  },
  buttonText_medium: {
    fontSize: 16,
  },
  buttonText_large: {
    fontSize: 18,
  },
  buttonTextDisabled: {
    color: EnhancedTheme.colors.textDisabled,
  },

  // Enhanced Input styles
  inputContainer: {
    marginBottom: EnhancedTheme.spacing.md,
  },
  inputLabel: {
    ...EnhancedTheme.typography.captionMedium,
    color: EnhancedTheme.colors.textPrimary,
    marginBottom: EnhancedTheme.spacing.xs,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EnhancedTheme.colors.surface,
    borderRadius: EnhancedTheme.borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: EnhancedTheme.spacing.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    ...EnhancedTheme.typography.body,
    paddingVertical: EnhancedTheme.spacing.md,
    color: EnhancedTheme.colors.textPrimary,
  },
  inputIcon: {
    marginRight: EnhancedTheme.spacing.sm,
  },
  inputIconButton: {
    padding: EnhancedTheme.spacing.xs,
    marginLeft: EnhancedTheme.spacing.sm,
  },
  inputFocused: {
    ...EnhancedTheme.shadows.sm,
  },
  inputError: {
    borderColor: EnhancedTheme.colors.error,
  },
  inputDisabled: {
    backgroundColor: EnhancedTheme.colors.gray[100],
  },
  inputTextDisabled: {
    color: EnhancedTheme.colors.textDisabled,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: EnhancedTheme.spacing.xs,
  },
  inputErrorText: {
    ...EnhancedTheme.typography.caption,
    color: EnhancedTheme.colors.error,
    marginLeft: EnhancedTheme.spacing.xs,
    flex: 1,
  },

  // Enhanced Card styles
  card: {
    backgroundColor: EnhancedTheme.colors.surface,
    borderRadius: EnhancedTheme.borderRadius.lg,
    padding: EnhancedTheme.spacing.lg,
    marginVertical: EnhancedTheme.spacing.sm,
    ...EnhancedTheme.shadows.md,
  },
  card_default: {
    borderWidth: 1,
    borderColor: EnhancedTheme.colors.border,
  },
  card_elevated: {
    ...EnhancedTheme.shadows.lg,
  },
  card_interactive: {
    borderWidth: 1,
    borderColor: EnhancedTheme.colors.border,
  },
  cardPressed: {
    opacity: 0.95,
  },

  // Enhanced Badge styles
  badge: {
    borderRadius: EnhancedTheme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  badge_primary: {
    backgroundColor: EnhancedTheme.colors.primary,
  },
  badge_secondary: {
    backgroundColor: EnhancedTheme.colors.secondary,
  },
  badge_success: {
    backgroundColor: EnhancedTheme.colors.success,
  },
  badge_warning: {
    backgroundColor: EnhancedTheme.colors.warning,
  },
  badge_error: {
    backgroundColor: EnhancedTheme.colors.error,
  },
  badge_info: {
    backgroundColor: EnhancedTheme.colors.info,
  },
  badge_small: {
    paddingHorizontal: EnhancedTheme.spacing.sm,
    paddingVertical: EnhancedTheme.spacing.xs,
  },
  badge_medium: {
    paddingHorizontal: EnhancedTheme.spacing.md,
    paddingVertical: EnhancedTheme.spacing.sm,
  },
  badge_large: {
    paddingHorizontal: EnhancedTheme.spacing.lg,
    paddingVertical: EnhancedTheme.spacing.md,
  },
  badgeText: {
    ...EnhancedTheme.typography.captionMedium,
    color: EnhancedTheme.colors.textInverse,
    fontWeight: '600',
  },
  badgeText_small: {
    fontSize: 10,
  },
  badgeText_medium: {
    fontSize: 12,
  },
  badgeText_large: {
    fontSize: 14,
  },

  // Enhanced Spinner styles
  spinner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner_small: {
    width: 20,
    height: 20,
  },
  spinner_medium: {
    width: 30,
    height: 30,
  },
  spinner_large: {
    width: 40,
    height: 40,
  },

  // Enhanced List Item styles
  listItem: {
    marginVertical: EnhancedTheme.spacing.xs,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: EnhancedTheme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: EnhancedTheme.spacing.md,
  },
  listItemText: {
    flex: 1,
  },
  listItemTitle: {
    ...EnhancedTheme.typography.bodyMedium,
    color: EnhancedTheme.colors.textPrimary,
    marginBottom: EnhancedTheme.spacing.xs,
    fontWeight: '600',
  },
  listItemSubtitle: {
    ...EnhancedTheme.typography.caption,
    color: EnhancedTheme.colors.textSecondary,
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EnhancedTheme.spacing.sm,
  },

  // Enhanced FAB styles
  fab: {
    position: 'absolute',
    borderRadius: EnhancedTheme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...EnhancedTheme.shadows.lg,
  },
  fab_primary: {
    backgroundColor: EnhancedTheme.colors.primary,
  },
  fab_secondary: {
    backgroundColor: EnhancedTheme.colors.secondary,
  },
  fab_accent: {
    backgroundColor: EnhancedTheme.colors.accent,
  },
  fab_small: {
    width: 48,
    height: 48,
  },
  fab_medium: {
    width: 56,
    height: 56,
  },
  fab_large: {
    width: 64,
    height: 64,
  },
  fabPressed: {
    opacity: 0.8,
  },
});

export default {
  EnhancedButton,
  EnhancedInput,
  EnhancedCard,
  EnhancedBadge,
  EnhancedSpinner,
  EnhancedListItem,
  EnhancedFAB,
};