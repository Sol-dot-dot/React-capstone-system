import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
import { ModernTheme } from '../../styles/ModernTheme';

const { width } = Dimensions.get('window');

const EnhancedBottomNavigation = ({ activeTab, onTabPress }) => {
  const tabs = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: 'home-outline',
      activeIcon: 'home',
    },
    {
      id: 'borrowedBooks',
      label: 'Books',
      icon: 'library-outline',
      activeIcon: 'library',
    },
    {
      id: 'penalties',
      label: 'Penalties',
      icon: 'card-outline',
      activeIcon: 'card',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'person-outline',
      activeIcon: 'person',
    },
    {
      id: 'chatbot',
      label: '',
      icon: 'chatbubble-outline',
      activeIcon: 'chatbubble',
      isSpecial: true,
    },
  ];

  const handleTabPress = (tabId) => {
    onTabPress(tabId);
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.background} />
      
      {/* Navigation Items */}
      <View style={styles.navigation}>
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const isSpecial = tab.isSpecial;
          
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                isSpecial && styles.specialTab,
              ]}
              onPress={() => handleTabPress(tab.id)}
              activeOpacity={0.7}
            >
              {/* Special Chatbot Button */}
              {isSpecial ? (
                <View style={[
                  styles.specialButton,
                  isActive && styles.specialButtonActive,
                ]}>
                  <Icon 
                    name={isActive ? tab.activeIcon : tab.icon}
                    size={24}
                    color={isActive ? '#ffffff' : ModernTheme.colors.textSecondary}
                  />
                </View>
              ) : (
                <View style={styles.tabContent}>
                  {/* Active indicator line */}
                  {isActive && <View style={styles.activeIndicator} />}
                  
                  <View style={[
                    styles.iconContainer,
                    isActive && styles.iconContainerActive,
                  ]}>
                    <Icon 
                      name={isActive ? tab.activeIcon : tab.icon}
                      size={24}
                      color={isActive ? ModernTheme.colors.primary : ModernTheme.colors.textSecondary}
                    />
                  </View>
                  
                  {tab.label && (
                    <Text style={[
                      styles.label,
                      isActive && styles.labelActive,
                    ]}>
                      {tab.label}
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 90 : 80,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingTop: 12,
    height: '100%',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  specialTab: {
    flex: 0,
    width: 60,
    marginLeft: 8,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 32,
    height: 3,
    backgroundColor: ModernTheme.colors.primary,
    borderRadius: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  iconContainerActive: {
    backgroundColor: '#0284c740',
    borderRadius: 20,
    width: 40,
    height: 40,
  },
  label: {
    fontSize: 12,
    color: ModernTheme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  labelActive: {
    color: ModernTheme.colors.primary,
    fontWeight: '600',
  },
  specialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  specialButtonActive: {
    backgroundColor: ModernTheme.colors.primary,
    shadowColor: ModernTheme.colors.primary,
    shadowOpacity: 0.3,
  },
});

export default EnhancedBottomNavigation;
