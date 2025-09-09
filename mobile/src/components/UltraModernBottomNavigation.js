import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BottomNavigation, Surface, Text } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {
  MaterialIcons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const UltraModernBottomNavigation = ({ activeTab, onTabPress }) => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {
      key: 'dashboard',
      title: 'Dashboard',
      focusedIcon: 'view-dashboard',
      unfocusedIcon: 'view-dashboard-outline',
    },
    {
      key: 'borrowedBooks',
      title: 'My Books',
      focusedIcon: 'book-open-page-variant',
      unfocusedIcon: 'book-open-page-variant-outline',
    },
    {
      key: 'penalties',
      title: 'Penalties',
      focusedIcon: 'cash-multiple',
      unfocusedIcon: 'cash-multiple',
    },
    {
      key: 'profile',
      title: 'Profile',
      focusedIcon: 'account',
      unfocusedIcon: 'account-outline',
    },
    {
      key: 'chatbot',
      title: 'AI Assistant',
      focusedIcon: 'robot',
      unfocusedIcon: 'robot-outline',
    },
  ]);

  const tabAnimations = routes.map(() => useSharedValue(0));

  React.useEffect(() => {
    // Reset all animations
    tabAnimations.forEach(anim => {
      anim.value = 0;
    });
    
    // Animate active tab
    if (index < tabAnimations.length) {
      tabAnimations[index].value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
    }
  }, [index]);

  const renderScene = ({ route, jumpTo }) => {
    // This is handled by the parent component
    return null;
  };

  const renderIcon = ({ route, focused, color }) => {
    const routeIndex = routes.findIndex(r => r.key === route.key);
    const animation = tabAnimations[routeIndex];

    const animatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        animation.value,
        [0, 1],
        [1, 1.2],
        Extrapolate.CLAMP
      );
      
      const translateY = interpolate(
        animation.value,
        [0, 1],
        [0, -4],
        Extrapolate.CLAMP
      );

      return {
        transform: [
          { scale },
          { translateY },
        ],
      };
    });

    const getIconName = () => {
      if (route.key === 'dashboard') {
        return focused ? 'view-dashboard' : 'view-dashboard-outline';
      } else if (route.key === 'borrowedBooks') {
        return focused ? 'book-open-page-variant' : 'book-open-page-variant-outline';
      } else if (route.key === 'penalties') {
        return focused ? 'cash-multiple' : 'cash-multiple';
      } else if (route.key === 'profile') {
        return focused ? 'account' : 'account-outline';
      } else if (route.key === 'chatbot') {
        return focused ? 'robot' : 'robot-outline';
      }
      return 'circle';
    };

    return (
      <Animated.View style={animatedStyle}>
        <MaterialCommunityIcons
          name={getIconName()}
          size={24}
          color={focused ? '#1E40AF' : '#6B7280'}
        />
      </Animated.View>
    );
  };

  const renderLabel = ({ route, focused, color }) => {
    const routeIndex = routes.findIndex(r => r.key === route.key);
    const animation = tabAnimations[routeIndex];

    const animatedLabelStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        animation.value,
        [0, 1],
        [0.7, 1],
        Extrapolate.CLAMP
      );

      return {
        opacity,
      };
    });

    return (
      <Animated.Text
        style={[
          styles.label,
          animatedLabelStyle,
          { color: focused ? '#1E40AF' : '#6B7280' },
        ]}
      >
        {route.title}
      </Animated.Text>
    );
  };

  const handleTabPress = (route) => {
    const routeIndex = routes.findIndex(r => r.key === route.key);
    setIndex(routeIndex);
    onTabPress(route.key);
  };

  return (
    <Surface style={styles.container} elevation={8}>
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        renderIcon={renderIcon}
        renderLabel={renderLabel}
        onTabPress={({ route }) => handleTabPress(route)}
        activeColor="#1E40AF"
        inactiveColor="#6B7280"
        barStyle={styles.barStyle}
        labeled={true}
        shifting={false}
        sceneAnimationEnabled={true}
        sceneAnimationType="shifting"
      />
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 8,
  },
  barStyle: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default UltraModernBottomNavigation;
