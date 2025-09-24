// Modern Design System for Web Admin Panel
export const designSystem = {
  // Color Palette
  colors: {
    // Primary Colors
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    
    // Secondary Colors
    secondary: {
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
    
    // Accent Colors
    accent: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    
    // Neutral Colors
    neutral: {
      white: '#ffffff',
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
    
    // Semantic Colors
    semantic: {
      background: '#ffffff',
      surface: '#f8fafc',
      surfaceElevated: '#ffffff',
      border: '#e2e8f0',
      borderLight: '#f1f5f9',
      text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        inverse: '#ffffff',
      },
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
    },
    
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  // Spacing
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  
  // Layout
  layout: {
    sidebar: {
      width: '280px',
      collapsedWidth: '80px',
    },
    header: {
      height: '64px',
    },
    content: {
      maxWidth: '1400px',
    },
  },
  
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Z-Index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

// CSS-in-JS utility functions
export const createStyles = (styles) => {
  return Object.entries(styles).reduce((acc, [key, value]) => {
    if (typeof value === 'object' && value !== null) {
      acc[key] = createStyles(value);
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
};

// Common component styles
export const commonStyles = {
  // Button variants
  button: {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: designSystem.borderRadius.lg,
      fontWeight: designSystem.typography.fontWeight.medium,
      transition: 'all 0.2s ease-in-out',
      cursor: 'pointer',
      border: 'none',
      textDecoration: 'none',
      fontSize: designSystem.typography.fontSize.sm,
      lineHeight: designSystem.typography.lineHeight.tight,
    },
    sizes: {
      sm: {
        padding: `${designSystem.spacing[2]} ${designSystem.spacing[3]}`,
        fontSize: designSystem.typography.fontSize.xs,
      },
      md: {
        padding: `${designSystem.spacing[3]} ${designSystem.spacing[4]}`,
        fontSize: designSystem.typography.fontSize.sm,
      },
      lg: {
        padding: `${designSystem.spacing[4]} ${designSystem.spacing[6]}`,
        fontSize: designSystem.typography.fontSize.base,
      },
    },
    variants: {
      primary: {
        backgroundColor: designSystem.colors.primary[600],
        color: designSystem.colors.neutral.white,
        '&:hover': {
          backgroundColor: designSystem.colors.primary[700],
        },
        '&:active': {
          backgroundColor: designSystem.colors.primary[800],
        },
      },
      secondary: {
        backgroundColor: designSystem.colors.neutral.white,
        color: designSystem.colors.secondary[700],
        border: `1px solid ${designSystem.colors.neutral.gray[300]}`,
        '&:hover': {
          backgroundColor: designSystem.colors.neutral.gray[50],
          borderColor: designSystem.colors.neutral.gray[400],
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: designSystem.colors.secondary[600],
        '&:hover': {
          backgroundColor: designSystem.colors.neutral.gray[100],
        },
      },
    },
  },
  
  // Card styles
  card: {
    base: {
      backgroundColor: designSystem.colors.semantic.surfaceElevated,
      borderRadius: designSystem.borderRadius.xl,
      boxShadow: designSystem.shadows.md,
      border: `1px solid ${designSystem.colors.semantic.border}`,
    },
    padding: {
      sm: designSystem.spacing[4],
      md: designSystem.spacing[6],
      lg: designSystem.spacing[8],
    },
  },
  
  // Input styles
  input: {
    base: {
      width: '100%',
      padding: `${designSystem.spacing[3]} ${designSystem.spacing[4]}`,
      border: `1px solid ${designSystem.colors.neutral.gray[300]}`,
      borderRadius: designSystem.borderRadius.lg,
      fontSize: designSystem.typography.fontSize.sm,
      lineHeight: designSystem.typography.lineHeight.normal,
      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:focus': {
        outline: 'none',
        borderColor: designSystem.colors.primary[500],
        boxShadow: `0 0 0 3px ${designSystem.colors.primary[100]}`,
      },
      '&::placeholder': {
        color: designSystem.colors.neutral.gray[400],
      },
    },
  },
  
  // Navigation styles
  navigation: {
    sidebar: {
      width: designSystem.layout.sidebar.width,
      backgroundColor: designSystem.colors.semantic.surfaceElevated,
      borderRight: `1px solid ${designSystem.colors.semantic.border}`,
      boxShadow: designSystem.shadows.lg,
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      padding: `${designSystem.spacing[3]} ${designSystem.spacing[4]}`,
      color: designSystem.colors.semantic.text.secondary,
      textDecoration: 'none',
      borderRadius: designSystem.borderRadius.lg,
      margin: `0 ${designSystem.spacing[2]}`,
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: designSystem.colors.neutral.gray[100],
        color: designSystem.colors.semantic.text.primary,
      },
      '&.active': {
        backgroundColor: designSystem.colors.primary[50],
        color: designSystem.colors.primary[700],
        fontWeight: designSystem.typography.fontWeight.semibold,
      },
    },
  },
};

export default designSystem;
