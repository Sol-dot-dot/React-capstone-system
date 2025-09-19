import { Animated, Easing } from 'react-native';

// Animation presets
export const AnimationPresets = {
  // Fade animations
  fadeIn: {
    toValue: 1,
    duration: 300,
    easing: Easing.out(Easing.quad),
  },
  fadeOut: {
    toValue: 0,
    duration: 300,
    easing: Easing.in(Easing.quad),
  },

  // Scale animations
  scaleIn: {
    toValue: 1,
    duration: 300,
    easing: Easing.out(Easing.back(1.2)),
  },
  scaleOut: {
    toValue: 0,
    duration: 300,
    easing: Easing.in(Easing.back(1.2)),
  },

  // Slide animations
  slideInFromRight: {
    toValue: 0,
    duration: 400,
    easing: Easing.out(Easing.cubic),
  },
  slideInFromLeft: {
    toValue: 0,
    duration: 400,
    easing: Easing.out(Easing.cubic),
  },
  slideInFromBottom: {
    toValue: 0,
    duration: 400,
    easing: Easing.out(Easing.cubic),
  },
  slideInFromTop: {
    toValue: 0,
    duration: 400,
    easing: Easing.out(Easing.cubic),
  },

  // Bounce animations
  bounceIn: {
    toValue: 1,
    duration: 600,
    easing: Easing.out(Easing.bounce),
  },
  bounceOut: {
    toValue: 0,
    duration: 600,
    easing: Easing.in(Easing.bounce),
  },

  // Spring animations
  springIn: {
    toValue: 1,
    tension: 100,
    friction: 8,
  },
  springOut: {
    toValue: 0,
    tension: 100,
    friction: 8,
  },
};

// Animation utility functions
export const createFadeAnimation = (initialValue = 0) => {
  return new Animated.Value(initialValue);
};

export const createScaleAnimation = (initialValue = 0) => {
  return new Animated.Value(initialValue);
};

export const createSlideAnimation = (initialValue = 100) => {
  return new Animated.Value(initialValue);
};

export const createRotationAnimation = (initialValue = 0) => {
  return new Animated.Value(initialValue);
};

// Animation execution functions
export const fadeIn = (animatedValue, duration = 300, delay = 0) => {
  return Animated.timing(animatedValue, {
    ...AnimationPresets.fadeIn,
    duration,
    delay,
    useNativeDriver: true,
  });
};

export const fadeOut = (animatedValue, duration = 300, delay = 0) => {
  return Animated.timing(animatedValue, {
    ...AnimationPresets.fadeOut,
    duration,
    delay,
    useNativeDriver: true,
  });
};

export const scaleIn = (animatedValue, duration = 300, delay = 0) => {
  return Animated.timing(animatedValue, {
    ...AnimationPresets.scaleIn,
    duration,
    delay,
    useNativeDriver: true,
  });
};

export const scaleOut = (animatedValue, duration = 300, delay = 0) => {
  return Animated.timing(animatedValue, {
    ...AnimationPresets.scaleOut,
    duration,
    delay,
    useNativeDriver: true,
  });
};

export const slideInFromRight = (animatedValue, duration = 400, delay = 0) => {
  return Animated.timing(animatedValue, {
    ...AnimationPresets.slideInFromRight,
    duration,
    delay,
    useNativeDriver: true,
  });
};

export const slideInFromLeft = (animatedValue, duration = 400, delay = 0) => {
  return Animated.timing(animatedValue, {
    ...AnimationPresets.slideInFromLeft,
    duration,
    delay,
    useNativeDriver: true,
  });
};

export const slideInFromBottom = (animatedValue, duration = 400, delay = 0) => {
  return Animated.timing(animatedValue, {
    ...AnimationPresets.slideInFromBottom,
    duration,
    delay,
    useNativeDriver: true,
  });
};

export const slideInFromTop = (animatedValue, duration = 400, delay = 0) => {
  return Animated.timing(animatedValue, {
    ...AnimationPresets.slideInFromTop,
    duration,
    delay,
    useNativeDriver: true,
  });
};

export const bounceIn = (animatedValue, duration = 600, delay = 0) => {
  return Animated.timing(animatedValue, {
    ...AnimationPresets.bounceIn,
    duration,
    delay,
    useNativeDriver: true,
  });
};

export const bounceOut = (animatedValue, duration = 600, delay = 0) => {
  return Animated.timing(animatedValue, {
    ...AnimationPresets.bounceOut,
    duration,
    delay,
    useNativeDriver: true,
  });
};

export const springIn = (animatedValue, tension = 100, friction = 8) => {
  return Animated.spring(animatedValue, {
    ...AnimationPresets.springIn,
    tension,
    friction,
    useNativeDriver: true,
  });
};

export const springOut = (animatedValue, tension = 100, friction = 8) => {
  return Animated.spring(animatedValue, {
    ...AnimationPresets.springOut,
    tension,
    friction,
    useNativeDriver: true,
  });
};

// Complex animation sequences
export const createStaggeredAnimation = (animatedValues, animationType, staggerDelay = 100) => {
  const animations = animatedValues.map((animatedValue, index) => {
    const delay = index * staggerDelay;
    switch (animationType) {
      case 'fadeIn':
        return fadeIn(animatedValue, 300, delay);
      case 'scaleIn':
        return scaleIn(animatedValue, 300, delay);
      case 'slideInFromBottom':
        return slideInFromBottom(animatedValue, 400, delay);
      case 'slideInFromRight':
        return slideInFromRight(animatedValue, 400, delay);
      default:
        return fadeIn(animatedValue, 300, delay);
    }
  });

  return Animated.parallel(animations);
};

export const createPulseAnimation = (animatedValue, minValue = 0.8, maxValue = 1.2) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: maxValue,
        duration: 1000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: minValue,
        duration: 1000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ])
  );
};

export const createShakeAnimation = (animatedValue, intensity = 10) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: intensity,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: -intensity,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: intensity,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 50,
      useNativeDriver: true,
    }),
  ]);
};

export const createLoadingAnimation = (animatedValue) => {
  return Animated.loop(
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  );
};

// Animation interpolation helpers
export const createOpacityInterpolation = (animatedValue, inputRange = [0, 1]) => {
  return animatedValue.interpolate({
    inputRange,
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
};

export const createScaleInterpolation = (animatedValue, inputRange = [0, 1]) => {
  return animatedValue.interpolate({
    inputRange,
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
};

export const createTranslateXInterpolation = (animatedValue, inputRange = [0, 1], outputRange = [100, 0]) => {
  return animatedValue.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp',
  });
};

export const createTranslateYInterpolation = (animatedValue, inputRange = [0, 1], outputRange = [100, 0]) => {
  return animatedValue.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp',
  });
};

export const createRotationInterpolation = (animatedValue, inputRange = [0, 1]) => {
  return animatedValue.interpolate({
    inputRange,
    outputRange: ['0deg', '360deg'],
    extrapolate: 'clamp',
  });
};

// Animation timing presets
export const TimingPresets = {
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
};

// Easing presets
export const EasingPresets = {
  easeIn: Easing.in(Easing.quad),
  easeOut: Easing.out(Easing.quad),
  easeInOut: Easing.inOut(Easing.quad),
  bounce: Easing.bounce,
  elastic: Easing.elastic(1),
  back: Easing.back(1.2),
  linear: Easing.linear,
};

export default {
  AnimationPresets,
  createFadeAnimation,
  createScaleAnimation,
  createSlideAnimation,
  createRotationAnimation,
  fadeIn,
  fadeOut,
  scaleIn,
  scaleOut,
  slideInFromRight,
  slideInFromLeft,
  slideInFromBottom,
  slideInFromTop,
  bounceIn,
  bounceOut,
  springIn,
  springOut,
  createStaggeredAnimation,
  createPulseAnimation,
  createShakeAnimation,
  createLoadingAnimation,
  createOpacityInterpolation,
  createScaleInterpolation,
  createTranslateXInterpolation,
  createTranslateYInterpolation,
  createRotationInterpolation,
  TimingPresets,
  EasingPresets,
};
