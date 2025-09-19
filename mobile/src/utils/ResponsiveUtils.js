import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 12/13/14)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Responsive scaling functions
export const scale = (size) => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

export const verticalScale = (size) => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

export const moderateScale = (size, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

// Font scaling
export const scaleFont = (size) => {
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
  if (isSmallDevice) {
    return baseSpacing * 0.8;
  } else if (isLargeDevice) {
    return baseSpacing * 1.2;
  }
  return baseSpacing;
};

// Responsive font sizes
export const getResponsiveFontSize = (baseSize) => {
  if (isSmallDevice) {
    return baseSize * 0.9;
  } else if (isLargeDevice) {
    return baseSize * 1.1;
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
  if (isSmallDevice) {
    return basePadding * 0.8;
  } else if (isLargeDevice) {
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

// Responsive styles helper
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

export default {
  scale,
  verticalScale,
  moderateScale,
  scaleFont,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  getResponsiveSpacing,
  getResponsiveFontSize,
  getGridColumns,
  getCardWidth,
  getResponsivePadding,
  screenDimensions,
  breakpoints,
  isBreakpoint,
  createResponsiveStyle,
};
