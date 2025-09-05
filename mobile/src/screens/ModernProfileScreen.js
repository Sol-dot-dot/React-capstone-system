import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { ModernTheme, ModernStyles } from '../styles/ModernTheme';

const ModernProfileScreen = ({ userData, onBack, onNavigate, onLogout }) => {
  const profileOptions = [
    {
      id: 'settings',
      title: 'Settings',
      icon: '⚙️',
      color: ModernTheme.colors.purple,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: '🔔',
      color: ModernTheme.colors.green,
      badge: 7, // Mock notification count
    },
    {
      id: 'verification',
      title: 'Verification',
      icon: '📄',
      color: ModernTheme.colors.orange,
    },
    {
      id: 'support',
      title: 'Support',
      icon: '🎧',
      color: ModernTheme.colors.blue,
    },
    {
      id: 'referral',
      title: 'Referral',
      icon: '👥',
      color: ModernTheme.colors.pink,
    },
    {
      id: 'legal',
      title: 'Legal',
      icon: '📋',
      color: ModernTheme.colors.purple,
    },
    {
      id: 'logout',
      title: 'Logout',
      icon: '🚪',
      color: ModernTheme.colors.error,
    },
  ];

  const handleOptionPress = (optionId) => {
    switch (optionId) {
      case 'settings':
        onNavigate('notificationSettings');
        break;
      case 'notifications':
        onNavigate('notificationSettings');
        break;
      case 'verification':
        // Handle verification
        break;
      case 'support':
        // Handle support
        break;
      case 'referral':
        // Handle referral
        break;
      case 'legal':
        // Handle legal
        break;
      case 'logout':
        onLogout();
        break;
      default:
        break;
    }
  };

  return (
    <View style={ModernStyles.container}>
      {/* Header */}
      <View style={ModernStyles.header}>
        <TouchableOpacity style={ModernStyles.headerButton} onPress={onBack}>
          <Text style={ModernStyles.buttonText}>←</Text>
        </TouchableOpacity>
        <Text style={ModernStyles.headerTitle}>ID {userData?.idNumber || 'N/A'}</Text>
        <TouchableOpacity style={ModernStyles.headerButton}>
          <Text style={ModernStyles.buttonText}>↻</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Profile Section */}
        <View style={ModernStyles.profileContainer}>
          <View style={[ModernStyles.profileImage, styles.profileImageContainer]}>
            <Text style={styles.profileImageText}>
              {userData?.idNumber ? userData.idNumber.charAt(0) : 'U'}
            </Text>
          </View>
          <Text style={ModernTheme.typography.h2}>
            {userData?.idNumber || 'User Name'}
          </Text>
          <Text style={ModernTheme.typography.caption}>
            {userData?.email || 'user@example.com'}
          </Text>
        </View>

        {/* Options Grid */}
        <View style={styles.optionsGrid}>
          {profileOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionItem, { backgroundColor: option.color + '20' }]}
              onPress={() => handleOptionPress(option.id)}
            >
              <View style={styles.optionIconContainer}>
                <Text style={styles.optionIcon}>{option.icon}</Text>
                {option.badge && (
                  <View style={[ModernStyles.badge, styles.optionBadge]}>
                    <Text style={ModernStyles.badgeText}>{option.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[ModernStyles.buttonText, styles.optionTitle]}>
                {option.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional Info */}
        <View style={[ModernStyles.card, styles.additionalInfo]}>
          <Text style={ModernTheme.typography.h3}>Account Information</Text>
          <View style={styles.infoRow}>
            <Text style={ModernTheme.typography.caption}>Member Since</Text>
            <Text style={ModernTheme.typography.body}>
              {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={ModernTheme.typography.caption}>Status</Text>
            <Text style={[ModernTheme.typography.body, { color: ModernTheme.colors.success }]}>
              {userData?.isVerified ? 'Verified' : 'Pending Verification'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={ModernTheme.typography.caption}>Total Books Borrowed</Text>
            <Text style={ModernTheme.typography.body}>0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  profileImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: ModernTheme.colors.primary,
  },
  optionIconContainer: {
    position: 'relative',
    marginBottom: ModernTheme.spacing.sm,
  },
  optionIcon: {
    fontSize: 24,
  },
  optionBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 20,
    height: 20,
  },
  optionTitle: {
    textAlign: 'center',
    fontSize: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: ModernTheme.spacing.lg,
  },
  optionItem: {
    width: '30%',
    backgroundColor: ModernTheme.colors.surface,
    borderRadius: ModernTheme.borderRadius.lg,
    padding: ModernTheme.spacing.md,
    marginBottom: ModernTheme.spacing.md,
    alignItems: 'center',
    ...ModernTheme.shadows.card,
  },
  additionalInfo: {
    marginHorizontal: ModernTheme.spacing.lg,
    marginTop: ModernTheme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: ModernTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: ModernTheme.colors.border,
  },
});

export default ModernProfileScreen;
