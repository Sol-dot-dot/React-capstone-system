import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const EnhancedTheme = {
  // Device dimensions
  dimensions: {
    width,
    height,
    isSmallDevice: width < 375,
    isMediumDevice: width >= 375 && width < 414,
    isLargeDevice: width >= 414,
  },

  colors: {
    // Enhanced primary palette with better contrast
    primary: '#2563eb', // Vibrant blue
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    secondary: '#7c3aed', // Purple accent
    secondaryLight: '#8b5cf6',
    secondaryDark: '#6d28d9',
    
    // Enhanced background system
    background: '#ffffff',
    backgroundSecondary: '#f8fafc',
    backgroundTertiary: '#f1f5f9',
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    surfaceOverlay: 'rgba(0, 0, 0, 0.5)',
    
    // Enhanced accent colors with better accessibility
    accent: '#06b6d4', // Cyan
    accentLight: '#22d3ee',
    accentDark: '#0891b2',
    
    // Status colors with improved contrast
    success: '#10b981',
    successLight: '#34d399',
    successDark: '#059669',
    warning: '#f59e0b',
    warningLight: '#fbbf24',
    warningDark: '#d97706',
    error: '#ef4444',
    errorLight: '#f87171',
    errorDark: '#dc2626',
    info: '#3b82f6',
    infoLight: '#60a5fa',
    infoDark: '#2563eb',
    
    // Enhanced text colors with better contrast ratios
    textPrimary: '#0f172a',
    textSecondary: '#334155',
    textTertiary: '#64748b',
    textMuted: '#94a3b8',
    textInverse: '#ffffff',
    textDisabled: '#cbd5e1',
    
    // Enhanced border system
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderDark: '#cbd5e1',
    borderFocus: '#2563eb',
    
    // Enhanced gray scale
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    
    // Gradient colors
    gradients: {
      primary: ['#2563eb', '#3b82f6'],
      secondary: ['#7c3aed', '#8b5cf6'],
      accent: ['#06b6d4', '#22d3ee'],
      success: ['#10b981', '#34d399'],
      warning: ['#f59e0b', '#fbbf24'],
      error: ['#ef4444', '#f87171'],
      background: ['#f8fafc', '#e2e8f0'],
      surface: ['#ffffff', '#f8fafc'],
    },
  },

  // Enhanced spacing system
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  // Enhanced border radius system
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 999,
  },

  // Enhanced typography system with better hierarchy
  typography: {
    // Display styles
    display: {
      fontSize: 48,
      fontWeight: '800',
      lineHeight: 56,
      letterSpacing: -0.5,
    },
    
    // Headings
    h1: {
      fontSize: 36,
      fontWeight: '700',
      lineHeight: 44,
      letterSpacing: -0.3,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 36,
      letterSpacing: -0.2,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
      letterSpacing: -0.1,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    h5: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
    },
    h6: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 22,
    },
    
    // Body text
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    bodyMedium: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    
    // Caption and small text
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
    captionMedium: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
    },
    small: {
      fontSize: 11,
      fontWeight: '400',
      lineHeight: 14,
    },
    smallMedium: {
      fontSize: 11,
      fontWeight: '500',
      lineHeight: 14,
    },
    
    // Button text
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 18,
      letterSpacing: 0.1,
    },
    buttonLarge: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 22,
      letterSpacing: 0.1,
    },
  },

  // Enhanced shadow system
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    xxl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 12,
    },
  },

  // Enhanced animation system
  animations: {
    duration: {
      instant: 100,
      fast: 200,
      normal: 300,
      slow: 500,
      slower: 700,
    },
    easing: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
    spring: {
      damping: 15,
      stiffness: 150,
      mass: 1,
    },
    springBouncy: {
      damping: 8,
      stiffness: 200,
      mass: 0.8,
    },
    springSmooth: {
      damping: 20,
      stiffness: 100,
      mass: 1,
    },
  },

  // Enhanced breakpoints
  breakpoints: {
    xs: 320,
    sm: 375,
    md: 414,
    lg: 768,
    xl: 1024,
  },

  // Z-index system
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
};

export const EnhancedStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: EnhancedTheme.colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: EnhancedTheme.colors.background,
  },
  
  // Enhanced card styles
  card: {
    backgroundColor: EnhancedTheme.colors.surface,
    borderRadius: EnhancedTheme.borderRadius.lg,
    padding: EnhancedTheme.spacing.lg,
    marginVertical: EnhancedTheme.spacing.sm,
    ...EnhancedTheme.shadows.md,
  },
  
  cardElevated: {
    backgroundColor: EnhancedTheme.colors.surface,
    borderRadius: EnhancedTheme.borderRadius.lg,
    padding: EnhancedTheme.spacing.lg,
    marginVertical: EnhancedTheme.spacing.sm,
    ...EnhancedTheme.shadows.lg,
  },
  
  cardInteractive: {
    backgroundColor: EnhancedTheme.colors.surface,
    borderRadius: EnhancedTheme.borderRadius.lg,
    padding: EnhancedTheme.spacing.lg,
    marginVertical: EnhancedTheme.spacing.sm,
    ...EnhancedTheme.shadows.md,
    borderWidth: 1,
    borderColor: EnhancedTheme.colors.border,
  },
  
  // Enhanced button styles
  button: {
    borderRadius: EnhancedTheme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...EnhancedTheme.shadows.sm,
  },
  
  buttonPrimary: {
    backgroundColor: EnhancedTheme.colors.primary,
  },
  
  buttonSecondary: {
    backgroundColor: EnhancedTheme.colors.secondary,
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: EnhancedTheme.colors.primary,
  },
  
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  
  // Enhanced input styles
  input: {
    backgroundColor: EnhancedTheme.colors.surface,
    borderRadius: EnhancedTheme.borderRadius.md,
    paddingHorizontal: EnhancedTheme.spacing.md,
    paddingVertical: EnhancedTheme.spacing.md,
    borderWidth: 1,
    borderColor: EnhancedTheme.colors.border,
    ...EnhancedTheme.typography.body,
  },
  
  inputFocused: {
    borderColor: EnhancedTheme.colors.borderFocus,
    ...EnhancedTheme.shadows.sm,
  },
  
  inputError: {
    borderColor: EnhancedTheme.colors.error,
  },
  
  // Enhanced navigation styles
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: EnhancedTheme.colors.surface,
    paddingVertical: EnhancedTheme.spacing.sm,
    paddingHorizontal: EnhancedTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: EnhancedTheme.colors.border,
    ...EnhancedTheme.shadows.lg,
  },
  
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: EnhancedTheme.spacing.sm,
    borderRadius: EnhancedTheme.borderRadius.md,
  },
  
  navItemActive: {
    backgroundColor: EnhancedTheme.colors.primary + '10',
  },
  
  // Enhanced list styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EnhancedTheme.colors.surface,
    borderRadius: EnhancedTheme.borderRadius.lg,
    padding: EnhancedTheme.spacing.lg,
    marginBottom: EnhancedTheme.spacing.sm,
    ...EnhancedTheme.shadows.sm,
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
  
  // Enhanced badge styles
  badge: {
    borderRadius: EnhancedTheme.borderRadius.full,
    paddingHorizontal: EnhancedTheme.spacing.sm,
    paddingVertical: EnhancedTheme.spacing.xs,
    alignSelf: 'flex-start',
  },
  
  badgePrimary: {
    backgroundColor: EnhancedTheme.colors.primary,
  },
  
  badgeSecondary: {
    backgroundColor: EnhancedTheme.colors.secondary,
  },
  
  badgeSuccess: {
    backgroundColor: EnhancedTheme.colors.success,
  },
  
  badgeWarning: {
    backgroundColor: EnhancedTheme.colors.warning,
  },
  
  badgeError: {
    backgroundColor: EnhancedTheme.colors.error,
  },
  
  badgeText: {
    ...EnhancedTheme.typography.captionMedium,
    color: EnhancedTheme.colors.textInverse,
    fontWeight: '600',
  },
});

export default EnhancedTheme;