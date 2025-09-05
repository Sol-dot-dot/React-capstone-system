import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ModernTheme, ModernStyles } from '../styles/ModernTheme';

const ModernBottomNavigation = ({ activeTab, onTabPress }) => {
  const navItems = [
    {
      id: 'dashboard',
      icon: '📊',
      label: 'Dashboard',
    },
    {
      id: 'borrowedBooks',
      icon: '📚',
      label: 'Books',
    },
    {
      id: 'chatbot',
      icon: '🤖',
      label: 'AI Assistant',
      isSpecial: true,
    },
    {
      id: 'penalties',
      icon: '💰',
      label: 'Fines',
    },
    {
      id: 'profile',
      icon: '👤',
      label: 'Profile',
    },
  ];

  const handleTabPress = (tabId) => {
    if (tabId === 'chatbot') {
      // Handle chatbot button press
      onTabPress('chatbot');
    } else {
      onTabPress(tabId);
    }
  };

  return (
    <View style={ModernStyles.bottomNav}>
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const isSpecial = item.isSpecial;

        if (isSpecial) {
          return (
            <TouchableOpacity
              key={item.id}
              style={ModernStyles.chatbotButton}
              onPress={() => handleTabPress(item.id)}
            >
              <Text style={styles.chatbotIcon}>{item.icon}</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={item.id}
            style={[ModernStyles.navItem, isActive && ModernStyles.navItemActive]}
            onPress={() => handleTabPress(item.id)}
          >
            <View style={styles.navIconContainer}>
              <Text style={[styles.navIcon, isActive && styles.navIconActive]}>
                {item.icon}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </View>
            <Text style={[
              ModernTheme.typography.small,
              isActive && styles.navLabelActive
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 20,
    marginBottom: ModernTheme.spacing.xs,
  },
  navIconActive: {
    fontSize: 22,
  },
  navLabelActive: {
    color: ModernTheme.colors.accent,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    top: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ModernTheme.colors.accent,
  },
  chatbotIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
});

export default ModernBottomNavigation;
