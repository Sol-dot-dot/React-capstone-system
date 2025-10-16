import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 12/13/14)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Enhanced device detection
export const deviceInfo = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  pixelRatio: PixelRatio.get(),
  fontScale: PixelRatio.getFontScale(),
  isSmallDevice: SCREEN_WIDTH < 375,
  isMediumDevice: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLargeDevice: SCREEN_WIDTH >= 414 && SCREEN_WIDTH < 768,
  isTablet: SCREEN_WIDTH >= 768,
  isLandscape: SCREEN_WIDTH > SCREEN_HEIGHT,
  isPortrait: SCREEN_WIDTH < SCREEN_HEIGHT,
};

// Enhanced responsive scaling functions
export const scale = (size) => {
  const scaledSize = (SCREEN_WIDTH / BASE_WIDTH) * size;
  // Limit scaling to prevent extreme sizes
  return Math.max(size * 0.8, Math.min(size * 1.5, scaledSize));
};

export const verticalScale = (size) => {
  const scaledSize = (SCREEN_HEIGHT / BASE_HEIGHT) * size;
  // Limit scaling to prevent extreme sizes
  return Math.max(size * 0.8, Math.min(size * 1.5, scaledSize));
};

export const moderateScale = (size, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

// Enhanced font scaling with better control
export const scaleFont = (size) => {
  const scaledSize = scale(size);
  const fontScale = PixelRatio.getFontScale();
  
  // Adjust for device font scale settings
  let adjustedSize = scaledSize / fontScale;
  
  // Apply device-specific adjustments
  if (deviceInfo.isSmallDevice) {
    adjustedSize *= 0.9;
  } else if (deviceInfo.isTablet) {
    adjustedSize *= 1.1;
  }
  
  return Math.round(adjustedSize);
};

// Legacy font scaling (kept for backward compatibility)
export const legacyScaleFont = (size) => {
  const newSize = scale(size);
  if (PixelRatio.get() < 3) {
    return newSize * 0.95;
  }
  return newSize;
};

// Device type detection
export const isSmallDevice = SCREEN_WIDTH < 375;
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
export const isLargeDevice = SCREEN_WIDTH >= 414;
export const isTablet = SCREEN_WIDTH >= 768;

// Responsive spacing
export const getResponsiveSpacing = (baseSpacing) => {
  if (deviceInfo.isSmallDevice) {
    return baseSpacing * 0.8;
  } else if (deviceInfo.isTablet) {
    return baseSpacing * 1.3;
  }
  return baseSpacing;
};

// Responsive font sizes
export const getResponsiveFontSize = (baseSize) => {
  if (deviceInfo.isSmallDevice) {
    return baseSize * 0.9;
  } else if (deviceInfo.isTablet) {
    return baseSize * 1.15;
  }
  return baseSize;
};

// Grid columns based on screen size
export const getGridColumns = () => {
  if (isTablet) {
    return 3;
  } else if (isLargeDevice) {
    return 2;
  }
  return 2;
};

// Card width based on screen size
export const getCardWidth = (containerPadding = 32) => {
  const availableWidth = SCREEN_WIDTH - containerPadding;
  const columns = getGridColumns();
  return (availableWidth - (columns - 1) * 16) / columns;
};

// Responsive padding
export const getResponsivePadding = (basePadding) => {
  if (deviceInfo.isSmallDevice) {
    return basePadding * 0.8;
  } else if (deviceInfo.isTablet) {
    return basePadding * 1.2;
  }
  return basePadding;
};

// Screen dimensions
export const screenDimensions = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
};

// Responsive breakpoints
export const breakpoints = {
  small: 375,
  medium: 414,
  large: 768,
};

// Media query helper
export const isBreakpoint = (breakpoint) => {
  switch (breakpoint) {
    case 'small':
      return SCREEN_WIDTH < breakpoints.small;
    case 'medium':
      return SCREEN_WIDTH >= breakpoints.small && SCREEN_WIDTH < breakpoints.medium;
    case 'large':
      return SCREEN_WIDTH >= breakpoints.medium && SCREEN_WIDTH < breakpoints.large;
    case 'xlarge':
      return SCREEN_WIDTH >= breakpoints.large;
    default:
      return false;
  }
};

// Enhanced responsive styles helper
export const createResponsiveStyle = (styles) => {
  return {
    ...styles,
    // Apply responsive scaling to common properties
    padding: styles.padding ? getResponsivePadding(styles.padding) : undefined,
    margin: styles.margin ? getResponsivePadding(styles.margin) : undefined,
    fontSize: styles.fontSize ? getResponsiveFontSize(styles.fontSize) : undefined,
    width: styles.width ? scale(styles.width) : undefined,
    height: styles.height ? verticalScale(styles.height) : undefined,
  };
};

// Advanced responsive utilities
export const getResponsiveValue = (small, medium, large, tablet) => {
  if (deviceInfo.isTablet) return tablet || large;
  if (deviceInfo.isLargeDevice) return large;
  if (deviceInfo.isMediumDevice) return medium;
  return small;
};

// Responsive grid system
export const getResponsiveGridColumns = () => {
  if (deviceInfo.isTablet) return 3;
  if (deviceInfo.isLargeDevice) return 2;
  return 2;
};

// Responsive card dimensions
export const getResponsiveCardDimensions = () => {
  const columns = getResponsiveGridColumns();
  const containerPadding = getResponsivePadding(32);
  const gap = getResponsivePadding(16);
  
  const availableWidth = SCREEN_WIDTH - (containerPadding * 2);
  const cardWidth = (availableWidth - (gap * (columns - 1))) / columns;
  
  return {
    width: cardWidth,
    height: cardWidth * 1.2, // Maintain aspect ratio
    columns,
  };
};



// Responsive icon size
export const getResponsiveIconSize = (baseSize) => {
  if (deviceInfo.isSmallDevice) return baseSize * 0.9;
  if (deviceInfo.isTablet) return baseSize * 1.2;
  return baseSize;
};

// Responsive border radius
export const getResponsiveBorderRadius = (baseRadius) => {
  if (deviceInfo.isSmallDevice) return baseRadius * 0.8;
  if (deviceInfo.isTablet) return baseRadius * 1.2;
  return baseRadius;
};

// Layout helpers
export const getResponsiveLayout = () => {
  return {
    containerPadding: getResponsivePadding(20),
    cardPadding: getResponsivePadding(16),
    sectionSpacing: getResponsivePadding(24),
    itemSpacing: getResponsivePadding(12),
  };
};

export default {
  // Core scaling functions
  scale,
  verticalScale,
  moderateScale,
  scaleFont,
  legacyScaleFont,
  
  // Device detection
  deviceInfo,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  
  // Responsive utilities
  getResponsiveSpacing,
  getResponsiveFontSize,
  getResponsiveIconSize,
  getResponsiveBorderRadius,
  getResponsivePadding,
  getResponsiveValue,
  getResponsiveLayout,
  
  // Grid and layout
  getGridColumns,
  getResponsiveGridColumns,
  getCardWidth,
  getResponsiveCardDimensions,
  
  // Screen info
  screenDimensions,
  breakpoints,
  isBreakpoint,
  
  // Style helpers
  createResponsiveStyle,
};
