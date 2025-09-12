import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
// import { LinearGradient } from 'expo-linear-gradient';
import { ModernTheme } from '../styles/ModernTheme';

const { width } = Dimensions.get('window');

const UltraModernBottomNavigation = ({ activeTab, onTabPress }) => {
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
      label: 'AI',
      icon: 'chatbubble-outline',
      activeIcon: 'chatbubble',
      isSpecial: true,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />
      
      {/* Navigation Items */}
      <View style={styles.navigation}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isSpecial = tab.isSpecial;
          
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                isSpecial && styles.specialTab,
                isActive && styles.activeTab,
              ]}
              onPress={() => onTabPress(tab.id)}
              activeOpacity={0.7}
            >
              {/* Special Chatbot Button */}
              {isSpecial ? (
                <View style={styles.specialButtonContainer}>
                  <View style={[
                    styles.specialButton,
                    isActive && styles.specialButtonActive,
                  ]}>
                    <Icon 
                      name={isActive ? tab.activeIcon : tab.icon}
                      size={24}
                      color={isActive ? ModernTheme.colors.textInverse : ModernTheme.colors.textTertiary}
                    />
                  </View>
                </View>
              ) : (
                <>
                  <View style={[
                    styles.iconContainer,
                    isActive && styles.iconContainerActive,
                  ]}>
                    <Icon 
                      name={isActive ? tab.activeIcon : tab.icon}
                      size={20}
                      color={isActive ? ModernTheme.colors.primary : ModernTheme.colors.textTertiary}
                    />
                  </View>
                  
                  <Text style={[
                    styles.label,
                    isActive && styles.labelActive,
                  ]}>
                    {tab.label}
                  </Text>
                </>
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
    height: 90,
    paddingBottom: 20, // Account for home indicator
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: ModernTheme.colors.surfaceElevated,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: ModernTheme.spacing.md,
    paddingTop: ModernTheme.spacing.md,
    height: '100%',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ModernTheme.spacing.sm,
  },
  specialTab: {
    flex: 0,
    width: 60,
  },
  activeTab: {
    // Active state styling handled by individual elements
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ModernTheme.spacing.xs,
  },
  iconContainerActive: {
    backgroundColor: ModernTheme.colors.primary + '20',
  },
  label: {
    ...ModernTheme.typography.small,
    color: ModernTheme.colors.textTertiary,
    textAlign: 'center',
  },
  labelActive: {
    color: ModernTheme.colors.primary,
    fontWeight: '600',
  },
  specialButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: ModernTheme.colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  specialButtonActive: {
    backgroundColor: ModernTheme.colors.primary,
    shadowColor: ModernTheme.colors.primary,
    shadowOpacity: 0.3,
    elevation: 4,
  },
});

export default UltraModernBottomNavigation;