import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const ModernTheme = {
  // Device dimensions
  dimensions: {
    width,
    height,
    isSmallDevice: width < 375,
    isMediumDevice: width >= 375 && width < 414,
    isLargeDevice: width >= 414,
  },

  colors: {
    // Match web design system colors
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceElevated: '#ffffff',
    primary: '#0284c7', // Primary blue from web
    secondary: '#64748b',
    accent: '#0ea5e9', // Accent blue
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Accent colors for cards - matching web
    purple: '#8b5cf6',
    green: '#10b981',
    orange: '#f59e0b',
    blue: '#3b82f6',
    pink: '#ec4899',
    
    // Background gradient - matching web
    backgroundGradient: ['#f0f9ff', '#e0f2fe'],
    
    // Text colors - matching web design system
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textTertiary: '#64748b',
    textMuted: '#94a3b8',
    textInverse: '#ffffff',
    
    // Border colors - matching web
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    
    // Additional colors for better UI
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  borderRadius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28,
    full: 999,   // ensures fully rounded buttons/avatars
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 50,
  },
  
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      color: '#0f172a',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700',
      color: '#0f172a',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      color: '#0f172a',
      lineHeight: 28,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600',
      color: '#0f172a',
      lineHeight: 24,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      color: '#0f172a',
      lineHeight: 24,
    },
    bodyMedium: {
      fontSize: 16,
      fontWeight: '500',
      color: '#0f172a',
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400',
      color: '#475569',
      lineHeight: 20,
    },
    captionMedium: {
      fontSize: 14,
      fontWeight: '500',
      color: '#475569',
      lineHeight: 20,
    },
    small: {
      fontSize: 12,
      fontWeight: '400',
      color: '#64748b',
      lineHeight: 16,
    },
    smallMedium: {
      fontSize: 12,
      fontWeight: '500',
      color: '#64748b',
      lineHeight: 16,
    },
  },
  
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    button: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    elevated: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    floating: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 12,
    },
  },

  // Animation configurations
  animations: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      easeInOut: 'ease-in-out',
      easeOut: 'ease-out',
      easeIn: 'ease-in',
    },
    spring: {
      damping: 15,
      stiffness: 150,
    },
  },

  // Responsive breakpoints
  breakpoints: {
    small: 375,
    medium: 414,
    large: 768,
  },
};

export const ModernStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: ModernTheme.colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: ModernTheme.colors.background,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ModernTheme.spacing.lg,
    paddingVertical: ModernTheme.spacing.md,
    backgroundColor: ModernTheme.colors.surface,
  },
  
  headerTitle: {
    ...ModernTheme.typography.h3,
    textAlign: 'center',
    flex: 1,
  },
  
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ModernTheme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  backButton: {
    position: 'absolute',
    top: 60,
    left: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ModernTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Card styles
  card: {
    backgroundColor: ModernTheme.colors.surface,
    borderRadius: ModernTheme.borderRadius.lg,
    padding: ModernTheme.spacing.lg,
    marginVertical: ModernTheme.spacing.sm,
    ...ModernTheme.shadows.card,
  },
  
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Button styles
  primaryButton: {
    backgroundColor: ModernTheme.colors.accent,
    borderRadius: ModernTheme.borderRadius.md,
    paddingVertical: ModernTheme.spacing.md,
    paddingHorizontal: ModernTheme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...ModernTheme.shadows.button,
  },
  
  secondaryButton: {
    backgroundColor: ModernTheme.colors.surfaceLight,
    borderRadius: ModernTheme.borderRadius.md,
    paddingVertical: ModernTheme.spacing.md,
    paddingHorizontal: ModernTheme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ModernTheme.colors.border,
  },
  
  buttonText: {
    ...ModernTheme.typography.body,
    fontWeight: '600',
  },
  
  // Input styles
  input: {
    backgroundColor: ModernTheme.colors.surfaceLight,
    borderRadius: ModernTheme.borderRadius.md,
    paddingHorizontal: ModernTheme.spacing.md,
    paddingVertical: ModernTheme.spacing.md,
    ...ModernTheme.typography.body,
    borderWidth: 1,
    borderColor: ModernTheme.colors.border,
  },
  
  // Navigation styles
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: ModernTheme.colors.surface,
    paddingVertical: ModernTheme.spacing.sm,
    paddingHorizontal: ModernTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: ModernTheme.colors.border,
  },
  
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: ModernTheme.spacing.sm,
  },
  
  navItemActive: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: ModernTheme.spacing.sm,
  },
  
  navIcon: {
    width: 24,
    height: 24,
    marginBottom: ModernTheme.spacing.xs,
  },
  
  navLabel: {
    ...ModernTheme.typography.small,
    textAlign: 'center',
  },
  
  // Special chatbot button
  chatbotButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ModernTheme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10,
    ...ModernTheme.shadows.card,
  },
  
  // Grid styles
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: ModernTheme.spacing.lg,
  },
  
  gridItem: {
    width: '48%',
    backgroundColor: ModernTheme.colors.surface,
    borderRadius: ModernTheme.borderRadius.lg,
    padding: ModernTheme.spacing.lg,
    marginBottom: ModernTheme.spacing.md,
    alignItems: 'center',
    ...ModernTheme.shadows.card,
  },
  
  // Profile styles
  profileContainer: {
    alignItems: 'center',
    paddingVertical: ModernTheme.spacing.xl,
  },
  
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ModernTheme.colors.surfaceLight,
    marginBottom: ModernTheme.spacing.md,
  },
  
  profileName: {
    ...ModernTheme.typography.h2,
    marginBottom: ModernTheme.spacing.xs,
  },
  
  profileEmail: {
    ...ModernTheme.typography.caption,
    marginBottom: ModernTheme.spacing.lg,
  },
  
  // Statistics styles
  statCard: {
    backgroundColor: ModernTheme.colors.surface,
    borderRadius: ModernTheme.borderRadius.lg,
    padding: ModernTheme.spacing.lg,
    marginBottom: ModernTheme.spacing.md,
    ...ModernTheme.shadows.card,
  },
  
  statValue: {
    ...ModernTheme.typography.h1,
    marginBottom: ModernTheme.spacing.xs,
  },
  
  statLabel: {
    ...ModernTheme.typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  // List styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ModernTheme.colors.surface,
    borderRadius: ModernTheme.borderRadius.lg,
    padding: ModernTheme.spacing.lg,
    marginBottom: ModernTheme.spacing.sm,
    ...ModernTheme.shadows.card,
  },
  
  listItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ModernTheme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ModernTheme.spacing.md,
  },
  
  listItemContent: {
    flex: 1,
  },
  
  listItemTitle: {
    ...ModernTheme.typography.body,
    fontWeight: '600',
    marginBottom: ModernTheme.spacing.xs,
  },
  
  listItemSubtitle: {
    ...ModernTheme.typography.caption,
  },
  
  // Badge styles
  badge: {
    backgroundColor: ModernTheme.colors.accent,
    borderRadius: ModernTheme.borderRadius.full,
    paddingHorizontal: ModernTheme.spacing.sm,
    paddingVertical: ModernTheme.spacing.xs,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  badgeText: {
    ...ModernTheme.typography.small,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
