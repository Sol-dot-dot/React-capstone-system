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
import { 
  getResponsiveSpacing, 
  getResponsiveFontSize, 
  getResponsiveBorderRadius,
  getResponsiveIconSize,
  deviceInfo 
} from '../../utils/ResponsiveUtils';

const { width } = Dimensions.get('window');

// Enhanced Modern Button Component
export const ModernButton = ({ 
  title, 
  onPress, 
  style, 
  textStyle, 
  disabled = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  icon = null
}) => {
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: getResponsiveSpacing(8),
          paddingHorizontal: getResponsiveSpacing(16),
          borderRadius: getResponsiveBorderRadius(8),
        };
      case 'large':
        return {
          paddingVertical: getResponsiveSpacing(16),
          paddingHorizontal: getResponsiveSpacing(24),
          borderRadius: getResponsiveBorderRadius(12),
        };
      default:
        return {
          paddingVertical: getResponsiveSpacing(12),
          paddingHorizontal: getResponsiveSpacing(20),
          borderRadius: getResponsiveBorderRadius(10),
        };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return getResponsiveFontSize(14);
      case 'large':
        return getResponsiveFontSize(18);
      default:
        return getResponsiveFontSize(16);
    }
  };

  const buttonSize = getButtonSize();
  
  const buttonStyle = [
    styles.button,
    variant === 'primary' ? styles.primaryButton : 
    variant === 'secondary' ? styles.secondaryButton :
    variant === 'outline' ? styles.outlineButton :
    variant === 'danger' ? styles.dangerButton :
    styles.primaryButton, // default
    {
      ...buttonSize,
      width: fullWidth ? '100%' : undefined,
    },
    disabled && styles.disabledButton,
    style,
  ];

  const buttonTextStyle = [
    styles.buttonText,
    variant === 'secondary' && styles.secondaryButtonText,
    variant === 'outline' && styles.outlineButtonText,
    variant === 'danger' && styles.dangerButtonText,
    {
      fontSize: getFontSize(),
    },
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
      {icon && (
        <View style={styles.buttonIcon}>
          {icon}
        </View>
      )}
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
  shadow = true,
  fullWidth = false
}) => {
  const getPadding = () => {
    switch (padding) {
      case 'small':
        return getResponsiveSpacing(12);
      case 'large':
        return getResponsiveSpacing(24);
      default:
        return getResponsiveSpacing(16);
    }
  };

  const cardStyle = [
    styles.card,
    variant === 'elevated' && styles.elevatedCard,
    variant === 'outlined' && styles.outlinedCard,
    variant === 'glass' && styles.glassCard,
    {
      padding: getPadding(),
      width: fullWidth ? '100%' : undefined,
      borderRadius: getResponsiveBorderRadius(12),
    },
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
  const getBadgeSize = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: getResponsiveSpacing(8),
          paddingVertical: getResponsiveSpacing(4),
          borderRadius: getResponsiveBorderRadius(12),
        };
      case 'large':
        return {
          paddingHorizontal: getResponsiveSpacing(16),
          paddingVertical: getResponsiveSpacing(8),
          borderRadius: getResponsiveBorderRadius(16),
        };
      default:
        return {
          paddingHorizontal: getResponsiveSpacing(12),
          paddingVertical: getResponsiveSpacing(6),
          borderRadius: getResponsiveBorderRadius(14),
        };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return getResponsiveFontSize(10);
      case 'large':
        return getResponsiveFontSize(14);
      default:
        return getResponsiveFontSize(12);
    }
  };

  const badgeSize = getBadgeSize();
  
  const badgeStyle = [
    styles.badge,
    variant === 'success' && styles.successBadge,
    variant === 'warning' && styles.warningBadge,
    variant === 'error' && styles.errorBadge,
    variant === 'info' && styles.infoBadge,
    variant === 'primary' && styles.primaryBadge,
    badgeSize,
    style,
  ];

  const badgeTextStyle = [
    styles.badgeText,
    {
      fontSize: getFontSize(),
    },
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
  size = 'medium',
  fullWidth = false,
  ...props
}) => {
  const getInputSize = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: getResponsiveSpacing(8),
          paddingHorizontal: getResponsiveSpacing(12),
          borderRadius: getResponsiveBorderRadius(8),
          fontSize: getResponsiveFontSize(14),
        };
      case 'large':
        return {
          paddingVertical: getResponsiveSpacing(16),
          paddingHorizontal: getResponsiveSpacing(16),
          borderRadius: getResponsiveBorderRadius(12),
          fontSize: getResponsiveFontSize(18),
        };
      default:
        return {
          paddingVertical: getResponsiveSpacing(12),
          paddingHorizontal: getResponsiveSpacing(14),
          borderRadius: getResponsiveBorderRadius(10),
          fontSize: getResponsiveFontSize(16),
        };
    }
  };

  const inputSize = getInputSize();

  return (
    <View style={[styles.inputContainer, fullWidth && { width: '100%' }]}>
      {label && (
        <Text style={[styles.inputLabel, { fontSize: getResponsiveFontSize(14) }]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          inputSize,
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
      {error && (
        <Text style={[styles.errorText, { fontSize: getResponsiveFontSize(12) }]}>
          {error}
        </Text>
      )}
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
          <Text style={[styles.statisticsValue, { fontSize: getResponsiveFontSize(24) }]}>
            {value}
          </Text>
          <Text style={[styles.statisticsTitle, { fontSize: getResponsiveFontSize(14) }]}>
            {title}
          </Text>
        </View>
      </View>
    </ModernCard>
  );
};

// New: Responsive Grid Component
export const ResponsiveGrid = ({ 
  children, 
  columns = null,
  spacing = 16,
  style 
}) => {
  const { getResponsiveGridColumns } = require('../../utils/ResponsiveUtils');
  const gridColumns = columns || getResponsiveGridColumns();
  const responsiveSpacing = getResponsiveSpacing(spacing);
  
  const gridStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -responsiveSpacing / 2,
  };

  const itemStyle = {
    width: `${100 / gridColumns}%`,
    paddingHorizontal: responsiveSpacing / 2,
    marginBottom: responsiveSpacing,
  };

  return (
    <View style={[gridStyle, style]}>
      {React.Children.map(children, (child, index) => (
        <View key={index} style={itemStyle}>
          {child}
        </View>
      ))}
    </View>
  );
};

// New: Responsive Container Component
export const ResponsiveContainer = ({ 
  children, 
  padding = 'medium',
  maxWidth = null,
  style 
}) => {
  const getPadding = () => {
    switch (padding) {
      case 'small':
        return getResponsiveSpacing(12);
      case 'large':
        return getResponsiveSpacing(24);
      default:
        return getResponsiveSpacing(16);
    }
  };

  const containerStyle = {
    padding: getPadding(),
    width: '100%',
    maxWidth: maxWidth || (deviceInfo.isTablet ? 800 : '100%'),
    alignSelf: 'center',
  };

  return (
    <View style={[containerStyle, style]}>
      {children}
    </View>
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
    minHeight: 48,
    minWidth: 120,
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
  buttonIcon: {
    marginRight: getResponsiveSpacing(8),
  },

  // Card Styles
  card: {
    backgroundColor: ModernTheme.colors.background,
    borderRadius: getResponsiveBorderRadius(16),
    marginVertical: getResponsiveSpacing(4),
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
    paddingHorizontal: getResponsiveSpacing(12),
    paddingVertical: getResponsiveSpacing(6),
    borderRadius: getResponsiveBorderRadius(16),
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
    fontSize: getResponsiveFontSize(12),
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
    marginBottom: getResponsiveSpacing(16),
  },
  inputLabel: {
    fontSize: getResponsiveFontSize(14),
    fontWeight: '600',
    color: ModernTheme.colors.textPrimary,
    marginBottom: getResponsiveSpacing(8),
  },
  input: {
    borderWidth: 1.5,
    borderColor: ModernTheme.colors.border,
    borderRadius: getResponsiveBorderRadius(12),
    paddingHorizontal: getResponsiveSpacing(16),
    paddingVertical: getResponsiveSpacing(14),
    fontSize: getResponsiveFontSize(16),
    backgroundColor: ModernTheme.colors.background,
    color: ModernTheme.colors.textPrimary,
    minHeight: getResponsiveSpacing(52),
  },
  inputError: {
    borderColor: ModernTheme.colors.error,
  },
  errorText: {
    fontSize: getResponsiveFontSize(12),
    color: ModernTheme.colors.error,
    marginTop: getResponsiveSpacing(4),
  },

  // Statistics Card Styles
  statisticsCard: {
    padding: getResponsiveSpacing(16),
    marginVertical: getResponsiveSpacing(6),
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