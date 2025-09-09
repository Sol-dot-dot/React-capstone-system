import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const SimpleModernBottomNavigation = ({ activeTab, onTabPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate tab selection
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeTab]);

  const tabs = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: 'home',
      activeIcon: 'home',
    },
    {
      id: 'borrowedBooks',
      label: 'Books',
      icon: 'book',
      activeIcon: 'book',
    },
    {
      id: 'chatbot',
      label: 'Chat',
      icon: 'chat',
      activeIcon: 'chat',
    },
    {
      id: 'penalties',
      label: 'Penalties',
      icon: 'warning',
      activeIcon: 'warning',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'person',
      activeIcon: 'person',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navigation}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => onTabPress(tab.id)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.tabContent,
                  {
                    transform: [{ scale: isActive ? scaleAnim : 1 }],
                  },
                ]}
              >
                <MaterialIcons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={24}
                  color={isActive ? '#6366f1' : '#9ca3af'}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isActive ? '#6366f1' : '#9ca3af' },
                  ]}
                >
                  {tab.label}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});

export default SimpleModernBottomNavigation;
