import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ModernTheme } from '../../styles/ModernTheme';

const { width } = Dimensions.get('window');

// Modern Button Component
export const ModernButton = ({ 
  title, 
  onPress, 
  style, 
  textStyle, 
  disabled = false,
  variant = 'primary',
  size = 'medium'
}) => {
  const buttonStyle = [
    styles.button,
    variant === 'primary' ? styles.primaryButton : 
    variant === 'secondary' ? styles.secondaryButton :
    variant === 'outline' ? styles.outlineButton :
    variant === 'danger' ? styles.dangerButton :
    styles.primaryButton, // default
    size === 'small' ? styles.smallButton : size === 'large' ? styles.largeButton : styles.mediumButton,
    disabled && styles.disabledButton,
    style,
  ];

  const buttonTextStyle = [
    styles.buttonText,
    variant === 'secondary' && styles.secondaryButtonText,
    variant === 'outline' && styles.outlineButtonText,
    variant === 'danger' && styles.dangerButtonText,
    size === 'small' ? styles.smallButtonText : size === 'large' ? styles.largeButtonText : styles.mediumButtonText,
    disabled && styles.disabledButtonText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={buttonTextStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

// Enhanced Modern Card Component
export const ModernCard = ({ 
  children, 
  style, 
  variant = 'default',
  padding = 'medium',
  shadow = true 
}) => {
  const cardStyle = [
    styles.card,
    variant === 'elevated' && styles.elevatedCard,
    variant === 'outlined' && styles.outlinedCard,
    variant === 'glass' && styles.glassCard,
    padding === 'small' && styles.smallPadding,
    padding === 'large' && styles.largePadding,
    shadow && styles.cardShadow,
    style,
  ];

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

// Professional Badge Component
export const ModernBadge = ({ 
  text, 
  variant = 'default', 
  style, 
  textStyle,
  size = 'medium'
}) => {
  const badgeStyle = [
    styles.badge,
    size === 'small' && styles.smallBadge,
    size === 'large' && styles.largeBadge,
    variant === 'success' && styles.successBadge,
    variant === 'warning' && styles.warningBadge,
    variant === 'error' && styles.errorBadge,
    variant === 'info' && styles.infoBadge,
    variant === 'primary' && styles.primaryBadge,
    style,
  ];

  const badgeTextStyle = [
    styles.badgeText,
    size === 'small' && styles.smallBadgeText,
    size === 'large' && styles.largeBadgeText,
    variant === 'success' && styles.successBadgeText,
    variant === 'warning' && styles.warningBadgeText,
    variant === 'error' && styles.errorBadgeText,
    variant === 'info' && styles.infoBadgeText,
    variant === 'primary' && styles.primaryBadgeText,
    textStyle,
  ];

  return (
    <View style={badgeStyle}>
      <Text style={badgeTextStyle}>{text}</Text>
    </View>
  );
};

// Enhanced Modern Input Component
export const ModernInput = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  style,
  label,
  error,
  ...props
}) => {
  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style
        ]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        placeholderTextColor={ModernTheme.colors.textSecondary}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// New: Statistics Card Component
export const StatisticsCard = ({ 
  title, 
  value, 
  icon, 
  color = ModernTheme.colors.primary,
  style 
}) => {
  return (
    <ModernCard style={[styles.statisticsCard, style]} variant="elevated">
      <View style={styles.statisticsContent}>
        <View style={[styles.statisticsIcon, { backgroundColor: color + '15' }]}>
          {icon}
        </View>
        <View style={styles.statisticsText}>
          <Text style={styles.statisticsValue}>{value}</Text>
          <Text style={styles.statisticsTitle}>{title}</Text>
        </View>
      </View>
    </ModernCard>
  );
};

// New: Action Card Component
export const ActionCard = ({ 
  title, 
  description, 
  icon, 
  onPress, 
  color = ModernTheme.colors.primary,
  style 
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <ModernCard style={[styles.actionCard, style]} variant="elevated">
        <View style={styles.actionContent}>
          <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
            {icon}
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>{title}</Text>
            <Text style={styles.actionDescription}>{description}</Text>
          </View>
        </View>
      </ModernCard>
    </TouchableOpacity>
  );
};

// New: Info Card Component
export const InfoCard = ({ 
  title, 
  subtitle, 
  icon, 
  color = ModernTheme.colors.primary,
  style 
}) => {
  return (
    <ModernCard style={[styles.infoCard, style]} variant="elevated">
      <View style={styles.infoContent}>
        <View style={[styles.infoIcon, { backgroundColor: color + '15' }]}>
          {icon}
        </View>
        <View style={styles.infoText}>
          <Text style={styles.infoTitle}>{title}</Text>
          {subtitle && <Text style={styles.infoSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </ModernCard>
  );
};

const styles = StyleSheet.create({
  // Button Styles
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: ModernTheme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: ModernTheme.colors.primary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: ModernTheme.colors.border,
  },
  dangerButton: {
    backgroundColor: ModernTheme.colors.error,
  },
  disabledButton: {
    backgroundColor: ModernTheme.colors.gray[300],
    borderColor: ModernTheme.colors.gray[300],
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 48,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56,
  },
  buttonText: {
    fontWeight: '600',
    color: ModernTheme.colors.textInverse,
  },
  smallButtonText: {
    fontSize: 14,
  },
  mediumButtonText: {
    fontSize: 16,
  },
  largeButtonText: {
    fontSize: 18,
  },
  secondaryButtonText: {
    color: ModernTheme.colors.primary,
  },
  outlineButtonText: {
    color: ModernTheme.colors.textPrimary,
  },
  dangerButtonText: {
    color: ModernTheme.colors.textInverse,
  },
  disabledButtonText: {
    color: ModernTheme.colors.textMuted,
  },

  // Card Styles
  card: {
    backgroundColor: ModernTheme.colors.background,
    borderRadius: 16,
    marginVertical: 4,
  },
  elevatedCard: {
    shadowColor: ModernTheme.colors.gray[900],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  outlinedCard: {
    borderWidth: 1,
    borderColor: ModernTheme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  glassCard: {
    backgroundColor: ModernTheme.colors.background + '90',
    backdropFilter: 'blur(10px)',
  },
  cardShadow: {
    shadowColor: ModernTheme.colors.gray[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  smallPadding: {
    padding: 12,
  },
  largePadding: {
    padding: 24,
  },

  // Badge Styles
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  smallBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  largeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  successBadge: {
    backgroundColor: ModernTheme.colors.success + '15',
  },
  warningBadge: {
    backgroundColor: ModernTheme.colors.warning + '15',
  },
  errorBadge: {
    backgroundColor: ModernTheme.colors.error + '15',
  },
  infoBadge: {
    backgroundColor: ModernTheme.colors.info + '15',
  },
  primaryBadge: {
    backgroundColor: ModernTheme.colors.primary + '15',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: ModernTheme.colors.primary,
  },
  smallBadgeText: {
    fontSize: 10,
  },
  largeBadgeText: {
    fontSize: 14,
  },
  successBadgeText: {
    color: ModernTheme.colors.success,
  },
  warningBadgeText: {
    color: ModernTheme.colors.warning,
  },
  errorBadgeText: {
    color: ModernTheme.colors.error,
  },
  infoBadgeText: {
    color: ModernTheme.colors.info,
  },
  primaryBadgeText: {
    color: ModernTheme.colors.primary,
  },

  // Input Styles
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: ModernTheme.colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: ModernTheme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: ModernTheme.colors.background,
    color: ModernTheme.colors.textPrimary,
    minHeight: 52,
  },
  inputError: {
    borderColor: ModernTheme.colors.error,
  },
  errorText: {
    fontSize: 12,
    color: ModernTheme.colors.error,
    marginTop: 4,
  },

  // Statistics Card Styles
  statisticsCard: {
    padding: 16,
    marginVertical: 6,
  },
  statisticsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statisticsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statisticsText: {
    flex: 1,
  },
  statisticsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: ModernTheme.colors.textPrimary,
    marginBottom: 2,
  },
  statisticsTitle: {
    fontSize: 14,
    color: ModernTheme.colors.textSecondary,
    fontWeight: '500',
  },

  // Action Card Styles
  actionCard: {
    padding: 20,
    marginVertical: 6,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ModernTheme.colors.textPrimary,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: ModernTheme.colors.textSecondary,
    lineHeight: 20,
  },

  // Info Card Styles
  infoCard: {
    padding: 20,
    marginVertical: 6,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ModernTheme.colors.textPrimary,
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 14,
    color: ModernTheme.colors.textSecondary,
  },
});