import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { ModernTheme, ModernStyles } from '../styles/ModernTheme';

// Fallback icon component in case vector icons don't load
const FallbackIcon = ({ name, size, color }) => {
  const iconMap = {
    'arrow-left': '←',
    'refresh-cw': '↻',
    'settings': '⚙️',
    'bell': '🔔',
    'file-text': '📄',
    'headphones': '🎧',
    'users': '👥',
    'clipboard': '📋',
    'log-out': '🚪',
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

const ModernProfileScreen = ({ userData, onBack, onNavigate, onLogout }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch penalty data which includes semester tracking
      const penaltyResponse = await axios.get(
        `http://10.0.2.2:5000/api/penalty/user/${userData.idNumber}`
      );

      if (penaltyResponse.data.success) {
        setProfileData(penaltyResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSemesterStatus = () => {
    if (!profileData?.semesterTracking) {
      return { status: 'No Data', color: ModernTheme.colors.textMuted };
    }

    const { books_borrowed_count = 0, books_required = 20 } = profileData.semesterTracking;
    
    if (books_borrowed_count >= books_required) {
      return { 
        status: `Complete (${books_borrowed_count}/${books_required})`, 
        color: ModernTheme.colors.success 
      };
    } else {
      return { 
        status: `Incomplete (${books_borrowed_count}/${books_required})`, 
        color: ModernTheme.colors.warning 
      };
    }
  };

  const getTotalBooksBorrowed = () => {
    return profileData?.semesterTracking?.books_borrowed_count || 0;
  };

  const profileOptions = [
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings',
      color: ModernTheme.colors.purple,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'bell',
      color: ModernTheme.colors.green,
      badge: 7, // Mock notification count
    },
    {
      id: 'verification',
      title: 'Verification',
      icon: 'file-text',
      color: ModernTheme.colors.orange,
    },
    {
      id: 'support',
      title: 'Support',
      icon: 'headphones',
      color: ModernTheme.colors.blue,
    },
    {
      id: 'referral',
      title: 'Referral',
      icon: 'users',
      color: ModernTheme.colors.pink,
    },
    {
      id: 'legal',
      title: 'Legal',
      icon: 'clipboard',
      color: ModernTheme.colors.purple,
    },
    {
      id: 'logout',
      title: 'Logout',
      icon: 'log-out',
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
          <Icon name="arrow-left" size={20} color={ModernTheme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={ModernStyles.headerTitle}>ID {userData?.idNumber || 'N/A'}</Text>
        <TouchableOpacity style={ModernStyles.headerButton}>
          <Icon name="refresh-cw" size={20} color={ModernTheme.colors.textPrimary} />
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
              style={[styles.optionItem, { backgroundColor: option.color + '15' }]}
              onPress={() => handleOptionPress(option.id)}
            >
              <View style={styles.optionIconContainer}>
                <Icon name={option.icon} size={24} color={option.color} />
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
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={ModernTheme.colors.accent} />
              <Text style={ModernTheme.typography.caption}>Loading...</Text>
            </View>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Text style={ModernTheme.typography.caption}>Semester Status</Text>
                <Text style={[ModernTheme.typography.body, { color: getSemesterStatus().color }]}>
                  {getSemesterStatus().status}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={ModernTheme.typography.caption}>Total Books Borrowed</Text>
                <Text style={ModernTheme.typography.body}>{getTotalBooksBorrowed()}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={ModernTheme.typography.caption}>Currently Borrowed</Text>
                <Text style={ModernTheme.typography.body}>
                  {profileData?.currentBorrowedCount || 0} books
                </Text>
              </View>
            </>
          )}
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
    marginBottom: ModernTheme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: ModernTheme.spacing.lg,
    marginBottom: ModernTheme.spacing.md,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: ModernTheme.spacing.lg,
  },
});

export default ModernProfileScreen;
