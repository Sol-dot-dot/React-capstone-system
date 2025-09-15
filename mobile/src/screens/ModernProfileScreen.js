import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import { ModernTheme, ModernStyles } from '../styles/ModernTheme';
import UniversalPageTemplate from '../components/UniversalPageTemplate';

// Fallback icon component in case vector icons don't load
const FallbackIcon = ({ name, size, color }) => {
  const iconMap = {
    'arrow-left': '←',
    'refresh-cw': '↻',
    'settings': '⚙️',
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
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
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


  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <UniversalPageTemplate
        title={`ID ${userData?.idNumber || 'N/A'}`}
        userData={userData}
        onBack={onBack}
        showUserInfo={false}
        headerActions={
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Icon name="refresh-cw" size={20} color={ModernTheme.colors.textPrimary} />
          </TouchableOpacity>
        }
      >
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

        {/* Simple Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[ModernStyles.primaryButton, styles.actionButton]}
            onPress={() => onNavigate('notificationSettings')}
          >
            <Icon name="settings" size={20} color={ModernTheme.colors.textInverse} />
            <Text style={[ModernStyles.buttonText, styles.actionButtonText]}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[ModernStyles.secondaryButton, styles.actionButton]}
            onPress={onLogout}
          >
            <Icon name="log-out" size={20} color={ModernTheme.colors.error} />
            <Text style={[ModernStyles.buttonText, styles.actionButtonText, { color: ModernTheme.colors.error }]}>Logout</Text>
          </TouchableOpacity>
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
      </UniversalPageTemplate>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  refreshButton: {
    paddingHorizontal: ModernTheme.spacing.md,
    paddingVertical: ModernTheme.spacing.sm,
    borderRadius: ModernTheme.borderRadius.md,
    backgroundColor: ModernTheme.colors.surface,
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
  actionButtonsContainer: {
    paddingHorizontal: ModernTheme.spacing.lg,
    marginVertical: ModernTheme.spacing.lg,
    gap: ModernTheme.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ModernTheme.spacing.lg,
    paddingHorizontal: ModernTheme.spacing.xl,
  },
  actionButtonText: {
    marginLeft: ModernTheme.spacing.sm,
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
