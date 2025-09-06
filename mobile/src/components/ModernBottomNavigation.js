import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ModernTheme, ModernStyles } from '../styles/ModernTheme';

// Fallback icon component in case vector icons don't load
const FallbackIcon = ({ name, size, color }) => {
  const iconMap = {
    'home': '🏠',
    'book': '📚',
    'message-circle': '💬',
    'dollar-sign': '💰',
    'user': '👤',
  };
  
  return (
    <Text style={{ fontSize: size, color }}>
      {iconMap[name] || '📱'}
    </Text>
  );
};

// Try to import vector icons, fallback to emoji if not available
let Icon;
try {
  Icon = require('react-native-vector-icons/Feather').default;
} catch (error) {
  console.warn('Vector icons not available, using fallback icons');
  Icon = FallbackIcon;
}

const ModernBottomNavigation = ({ activeTab, onTabPress }) => {
  const navItems = [
    {
      id: 'dashboard',
      icon: 'home',
      label: 'Dashboard',
    },
    {
      id: 'borrowedBooks',
      icon: 'book',
      label: 'Books',
    },
    {
      id: 'chatbot',
      icon: 'message-circle',
      label: 'AI Assistant',
      isSpecial: true,
    },
    {
      id: 'penalties',
      icon: 'dollar-sign',
      label: 'Fines',
    },
    {
      id: 'profile',
      icon: 'user',
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
              <Icon 
                name={item.icon} 
                size={24} 
                color="#ffffff" 
              />
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
              <Icon 
                name={item.icon} 
                size={20} 
                color={isActive ? ModernTheme.colors.accent : ModernTheme.colors.textTertiary} 
              />
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
    marginBottom: ModernTheme.spacing.xs,
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
});

export default ModernBottomNavigation;
