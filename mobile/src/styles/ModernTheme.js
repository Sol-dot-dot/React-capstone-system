import { StyleSheet } from 'react-native';

export const ModernTheme = {
  colors: {
    // Light theme colors - modern and clean
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceElevated: '#ffffff',
    primary: '#0ea5e9',
    secondary: '#64748b',
    accent: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    
    // Accent colors for cards
    purple: '#8b5cf6',
    green: '#10b981',
    orange: '#f59e0b',
    blue: '#3b82f6',
    pink: '#ec4899',
    
    // Background gradient
    backgroundGradient: ['#f0f9ff', '#e0f2fe'],
    
    // Text colors
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textTertiary: '#64748b',
    textMuted: '#94a3b8',
    
    // Border colors
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
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
      fontWeight: 'bold',
      color: '#0f172a',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#0f172a',
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      color: '#0f172a',
    },
    body: {
      fontSize: 16,
      color: '#0f172a',
    },
    caption: {
      fontSize: 14,
      color: '#475569',
    },
    small: {
      fontSize: 12,
      color: '#64748b',
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
