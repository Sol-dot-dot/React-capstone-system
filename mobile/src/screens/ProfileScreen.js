import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  RefreshControl,
  Alert,
  AppState,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
import { ModernTheme } from '../styles/ModernTheme';
import { ModernButton, ModernCard, ModernBadge } from '../components/ui/ModernComponents';
import axios from 'axios';
import { buildApiUrl, getEndpoint } from '../config/api';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ userData, onBack, onNavigate, onLogout }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  // Refresh data when app comes back to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        loadProfileData();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [profileResponse, borrowedResponse, penaltiesResponse] = await Promise.all([
        axios.get(buildApiUrl(getEndpoint('USER', 'GET_PROFILE', userData.idNumber))),
        axios.get(buildApiUrl(getEndpoint('BORROWING', 'GET_USER_BORROWED_BOOKS', userData.idNumber))),
        axios.get(buildApiUrl(getEndpoint('PENALTY', 'GET_USER_PENALTIES', userData.idNumber))),
      ]);

      if (profileResponse.data.success) {
        // Transform fines data to match expected penalty structure
        const fines = penaltiesResponse.data.success ? penaltiesResponse.data.data.fines || [] : [];
        const transformedPenalties = fines.map(fine => ({
          id: fine.id,
          reason: `Overdue book: ${fine.title}`,
          bookTitle: fine.title,
          amount: parseFloat(fine.fine_amount) - parseFloat(fine.paid_amount || 0),
          status: fine.status,
          dueDate: fine.due_date,
          createdAt: fine.fine_date,
          daysOverdue: fine.days_overdue,
          bookCode: fine.number_code,
          author: fine.author,
          borrowedDate: fine.borrowed_date,
          returnedDate: fine.returned_date
        }));

        setProfileData({
          ...profileResponse.data.user,
          borrowedBooks: borrowedResponse.data.success ? borrowedResponse.data.data.borrowedBooks : [],
          penalties: transformedPenalties,
        });
      }
    } catch (error) {
      // Silent fail for profile data loading
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    // Call onLogout - App.js handles the confirmation dialog
    onLogout();
  };

  const getInitials = (firstName, lastName) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) return firstName.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSubtitle}>Manage your account</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[ModernTheme.colors.primary]}
            tintColor={ModernTheme.colors.primary}
          />
        }
      >
        {/* Profile Card */}
        <View style={styles.profileSection}>
          <ModernCard style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getInitials(profileData?.firstName || userData.firstName, profileData?.lastName || userData.lastName)}
                  </Text>
                </View>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {profileData?.firstName && profileData?.lastName
                    ? `${profileData.firstName} ${profileData.lastName}`
                    : userData.firstName && userData.lastName
                      ? `${userData.firstName} ${userData.lastName}`
                      : userData.idNumber}
                </Text>
                <Text style={styles.profileId}>{userData.idNumber}</Text>
                <Text style={styles.profileEmail}>{profileData?.email || userData.email}</Text>
              </View>
            </View>
          </ModernCard>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <ModernCard style={styles.settingsCard}>
            <ModernButton
              title="Borrowing History"
              onPress={() => onNavigate('borrowingHistory')}
              variant="ghost"
              size="medium"
              icon={<Icon name="library-outline" size={20} color={ModernTheme.colors.primary} />}
              style={styles.settingsButton}
            />
            <View style={styles.settingsDivider} />
            <ModernButton
              title="Notification Settings"
              onPress={() => onNavigate('notificationSettings')}
              variant="ghost"
              size="medium"
              icon={<Icon name="notifications-outline" size={20} color={ModernTheme.colors.primary} />}
              style={styles.settingsButton}
            />
          </ModernCard>
        </View>

        {/* Account Information */}
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <ModernCard style={styles.accountCard}>
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>Student ID</Text>
              <Text style={styles.accountValue}>{userData.idNumber}</Text>
            </View>
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>Email</Text>
              <Text style={styles.accountValue} numberOfLines={2} ellipsizeMode="middle">
                {profileData?.email || userData.email}
              </Text>
            </View>
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>Member Since</Text>
              <Text style={styles.accountValue}>
                {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() :
                 userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </ModernCard>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <ModernButton
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            size="large"
            icon={<Icon name="log-out-outline" size={20} color={ModernTheme.colors.error} />}
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ModernTheme.colors.background,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: ModernTheme.colors.backgroundGradient[0],
  },
  header: {
    paddingHorizontal: ModernTheme.spacing.lg,
    paddingTop: 60,
    paddingBottom: ModernTheme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...ModernTheme.typography.h2,
    color: ModernTheme.colors.textPrimary,
  },
  headerSubtitle: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
    marginTop: ModernTheme.spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: ModernTheme.spacing.lg,
    paddingBottom: 120,
  },
  profileSection: {
    marginBottom: ModernTheme.spacing.xl,
  },
  profileCard: {
    padding: ModernTheme.spacing.xl,
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: ModernTheme.spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: ModernTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ModernTheme.spacing.md,
    ...ModernTheme.shadows.elevated,
  },
  avatarText: {
    ...ModernTheme.typography.h1,
    color: ModernTheme.colors.textInverse,
    fontSize: 40,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    ...ModernTheme.typography.h3,
    color: ModernTheme.colors.textPrimary,
    marginBottom: ModernTheme.spacing.xs,
    textAlign: 'center',
  },
  profileId: {
    ...ModernTheme.typography.bodyMedium,
    color: ModernTheme.colors.primary,
    marginBottom: ModernTheme.spacing.xs,
    fontWeight: '600',
  },
  profileEmail: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    ...ModernTheme.typography.h3,
    color: ModernTheme.colors.textPrimary,
    marginBottom: ModernTheme.spacing.lg,
  },
  // Stats Section
  statsSection: {
    marginBottom: ModernTheme.spacing.xl,
  },
  statsCard: {
    padding: ModernTheme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: ModernTheme.spacing.md,
    marginBottom: ModernTheme.spacing.md,
    backgroundColor: ModernTheme.colors.background,
    borderRadius: ModernTheme.borderRadius.md,
  },
  statValue: {
    ...ModernTheme.typography.h2,
    color: ModernTheme.colors.textPrimary,
    marginTop: ModernTheme.spacing.xs,
  },
  statLabel: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
    marginTop: ModernTheme.spacing.xs,
  },
  // Account Section
  accountSection: {
    marginBottom: ModernTheme.spacing.xl,
  },
  accountCard: {
    padding: ModernTheme.spacing.lg,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: ModernTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: ModernTheme.colors.border,
    minHeight: 50,
  },
  accountLabel: {
    ...ModernTheme.typography.body,
    color: ModernTheme.colors.textSecondary,
    flex: 0,
    minWidth: 100,
  },
  accountValue: {
    ...ModernTheme.typography.bodyMedium,
    color: ModernTheme.colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: ModernTheme.spacing.md,
  },
  // Settings Section
  settingsSection: {
    marginBottom: ModernTheme.spacing.xl,
  },
  settingsCard: {
    padding: ModernTheme.spacing.sm,
  },
  settingsButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: ModernTheme.spacing.md,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: ModernTheme.colors.border,
    marginHorizontal: ModernTheme.spacing.md,
  },
  // Logout Section
  logoutSection: {
    marginBottom: ModernTheme.spacing.xl,
  },
  logoutButton: {
    borderColor: ModernTheme.colors.error,
  },
});

export default ProfileScreen;
