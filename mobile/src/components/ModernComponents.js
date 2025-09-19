import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
import { ModernTheme } from '../styles/ModernTheme';

const { width } = Dimensions.get('window');

// Enhanced Button Component with animations
export const ModernButton = ({
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
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        ...ModernTheme.animations.spring,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: ModernTheme.animations.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...ModernTheme.animations.spring,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: ModernTheme.animations.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`button_${variant}`], styles[`button_${size}`]];
    if (disabled) baseStyle.push(styles.buttonDisabled);
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText, styles[`buttonText_${variant}`], styles[`buttonText_${size}`]];
    if (disabled) baseStyle.push(styles.buttonTextDisabled);
    return baseStyle;
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
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        {...props}
      >
        {loading ? (
          <View>
            <Icon name="refresh" size={20} color={variant === 'primary' ? '#ffffff' : ModernTheme.colors.primary} />
          </View>
        ) : (
          <View style={styles.buttonContent}>
            {icon && iconPosition === 'left' && (
              <Icon name={icon} size={20} color={variant === 'primary' ? '#ffffff' : ModernTheme.colors.primary} style={styles.buttonIcon} />
            )}
            {title && <Text style={[getTextStyle(), textStyle]}>{title}</Text>}
            {icon && iconPosition === 'right' && (
              <Icon name={icon} size={20} color={variant === 'primary' ? '#ffffff' : ModernTheme.colors.primary} style={styles.buttonIcon} />
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Enhanced Input Component with animations
export const ModernInput = ({
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
  ...props
}) => {
  const focusAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

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
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: ModernTheme.animations.duration.normal,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    if (!value) {
      Animated.timing(focusAnim, {
        toValue: 0,
        duration: ModernTheme.animations.duration.normal,
        useNativeDriver: false,
      }).start();
    }
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [ModernTheme.colors.border, ModernTheme.colors.primary],
  });

  return (
    <Animated.View
      style={[
        styles.inputContainer,
        { transform: [{ translateX: shakeAnim }] },
        style,
      ]}
    >
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <Animated.View
        style={[
          styles.inputWrapper,
          { borderColor },
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
      >
        {leftIcon && (
          <Icon name={leftIcon} size={20} color={ModernTheme.colors.textTertiary} style={styles.inputIcon} />
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
          placeholderTextColor={ModernTheme.colors.textMuted}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.inputIconButton}>
            <Icon name={rightIcon} size={20} color={ModernTheme.colors.textTertiary} />
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && (
        <View>
          <Text style={styles.inputErrorText}>{error}</Text>
        </View>
      )}
    </Animated.View>
  );
};

// Enhanced Card Component with animations
export const ModernCard = ({
  children,
  style,
  onPress,
  animated = true,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        ...ModernTheme.animations.spring,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...ModernTheme.animations.spring,
      }).start();
    }
  };

  const CardComponent = View;

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          {...props}
        >
          <CardComponent style={[styles.card, style]}>
            {children}
          </CardComponent>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <CardComponent style={[styles.card, style]} {...props}>
      {children}
    </CardComponent>
  );
};

// Enhanced Badge Component
export const ModernBadge = ({
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
      <Text style={[styles.badgeText, styles[`badgeText_${variant}`], styles[`badgeText_${size}`]]}>
        {text}
      </Text>
    </View>
  );
};

// Loading Spinner Component
export const ModernSpinner = ({ size = 'medium', color = ModernTheme.colors.primary }) => {
  return (
    <View style={[styles.spinner, styles[`spinner_${size}`]]}>
      <Icon name="refresh" size={size === 'small' ? 16 : size === 'large' ? 32 : 24} color={color} />
    </View>
  );
};

// Enhanced List Item Component
export const ModernListItem = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onPress,
  style,
  ...props
}) => {
  return (
    <ModernCard onPress={onPress} style={[styles.listItem, style]} {...props}>
      <View style={styles.listItemContent}>
        {leftIcon && (
          <View style={styles.listItemIcon}>
            <Icon name={leftIcon} size={24} color={ModernTheme.colors.primary} />
          </View>
        )}
        <View style={styles.listItemText}>
          <Text style={styles.listItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.listItemSubtitle}>{subtitle}</Text>}
        </View>
        {rightIcon && (
          <Icon name={rightIcon} size={20} color={ModernTheme.colors.textTertiary} />
        )}
      </View>
    </ModernCard>
  );
};

const styles = StyleSheet.create({
  // Button styles
  button: {
    borderRadius: ModernTheme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...ModernTheme.shadows.button,
  },
  button_primary: {
    backgroundColor: ModernTheme.colors.primary,
  },
  button_secondary: {
    backgroundColor: ModernTheme.colors.surface,
    borderWidth: 2,
    borderColor: ModernTheme.colors.primary,
  },
  button_outline: {
    backgroundColor: ModernTheme.colors.surface,
    borderWidth: 1,
    borderColor: ModernTheme.colors.primary,
  },
  button_small: {
    paddingVertical: ModernTheme.spacing.sm,
    paddingHorizontal: ModernTheme.spacing.md,
  },
  button_medium: {
    paddingVertical: ModernTheme.spacing.md,
    paddingHorizontal: ModernTheme.spacing.lg,
  },
  button_large: {
    paddingVertical: ModernTheme.spacing.lg,
    paddingHorizontal: ModernTheme.spacing.xl,
  },
  buttonDisabled: {
    backgroundColor: ModernTheme.colors.gray[300],
    borderColor: ModernTheme.colors.gray[300],
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ModernTheme.spacing.xs,
    minHeight: 20, // Ensure minimum height for icon-only buttons
  },
  buttonIcon: {
    marginHorizontal: ModernTheme.spacing.xs,
  },
  buttonText: {
    ...ModernTheme.typography.bodyMedium,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonText_primary: {
    color: ModernTheme.colors.textInverse,
  },
  buttonText_secondary: {
    color: ModernTheme.colors.primary,
  },
  buttonText_outline: {
    color: ModernTheme.colors.primary,
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
    color: ModernTheme.colors.textMuted,
  },

  // Input styles
  inputContainer: {
    marginBottom: ModernTheme.spacing.md,
  },
  inputLabel: {
    ...ModernTheme.typography.captionMedium,
    color: ModernTheme.colors.textPrimary,
    marginBottom: ModernTheme.spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ModernTheme.colors.surface,
    borderRadius: ModernTheme.borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: ModernTheme.spacing.md,
  },
  input: {
    flex: 1,
    ...ModernTheme.typography.body,
    paddingVertical: ModernTheme.spacing.md,
    color: ModernTheme.colors.textPrimary,
  },
  inputIcon: {
    marginRight: ModernTheme.spacing.sm,
  },
  inputIconButton: {
    padding: ModernTheme.spacing.xs,
  },
  inputError: {
    borderColor: ModernTheme.colors.error,
  },
  inputDisabled: {
    backgroundColor: ModernTheme.colors.gray[100],
  },
  inputTextDisabled: {
    color: ModernTheme.colors.textMuted,
  },
  inputErrorText: {
    ...ModernTheme.typography.small,
    color: ModernTheme.colors.error,
    marginTop: ModernTheme.spacing.xs,
  },

  // Card styles
  card: {
    backgroundColor: ModernTheme.colors.surface,
    borderRadius: ModernTheme.borderRadius.lg,
    padding: ModernTheme.spacing.lg,
    marginVertical: ModernTheme.spacing.sm,
    ...ModernTheme.shadows.card,
  },

  // Badge styles
  badge: {
    borderRadius: ModernTheme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  badge_primary: {
    backgroundColor: ModernTheme.colors.primary,
  },
  badge_secondary: {
    backgroundColor: ModernTheme.colors.secondary,
  },
  badge_success: {
    backgroundColor: ModernTheme.colors.success,
  },
  badge_warning: {
    backgroundColor: ModernTheme.colors.warning,
  },
  badge_error: {
    backgroundColor: ModernTheme.colors.error,
  },
  badge_small: {
    paddingHorizontal: ModernTheme.spacing.sm,
    paddingVertical: ModernTheme.spacing.xs,
  },
  badge_medium: {
    paddingHorizontal: ModernTheme.spacing.md,
    paddingVertical: ModernTheme.spacing.sm,
  },
  badge_large: {
    paddingHorizontal: ModernTheme.spacing.lg,
    paddingVertical: ModernTheme.spacing.md,
  },
  badgeText: {
    ...ModernTheme.typography.small,
    fontWeight: '600',
    color: ModernTheme.colors.textInverse,
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

  // Spinner styles
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

  // List item styles
  listItem: {
    marginVertical: ModernTheme.spacing.xs,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ModernTheme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ModernTheme.spacing.md,
  },
  listItemText: {
    flex: 1,
  },
  listItemTitle: {
    ...ModernTheme.typography.bodyMedium,
    color: ModernTheme.colors.textPrimary,
    marginBottom: ModernTheme.spacing.xs,
  },
  listItemSubtitle: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
  },
});
