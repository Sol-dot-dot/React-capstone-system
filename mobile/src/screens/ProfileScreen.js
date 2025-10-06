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
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
import { ModernTheme } from '../styles/ModernTheme';
import { ModernButton, ModernCard, ModernBadge } from '../components/ModernComponents';
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

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [profileResponse, borrowedResponse, penaltiesResponse] = await Promise.all([
        axios.get(buildApiUrl(getEndpoint('USER', 'GET_PROFILE', userData.idNumber))),
        axios.get(buildApiUrl(getEndpoint('BORROWING', 'GET_USER_BORROWED_BOOKS', userData.idNumber))),
        axios.get(buildApiUrl(getEndpoint('PENALTY', 'GET_USER_PENALTIES', userData.idNumber))),
      ]);

      if (profileResponse.data.success) {
        setProfileData({
          ...profileResponse.data.user,
          borrowedBooks: borrowedResponse.data.success ? borrowedResponse.data.data.borrowedBooks : [],
          penalties: penaltiesResponse.data.success ? penaltiesResponse.data.data.penalties : [],
        });
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
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
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return ModernTheme.colors.success;
      case 'inactive':
        return ModernTheme.colors.error;
      default:
        return ModernTheme.colors.warning;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      default:
        return 'Pending';
    }
  };

  const stats = [
    {
      title: 'Books Borrowed',
      value: profileData?.borrowedBooks?.length || 0,
      icon: 'library-outline',
      color: ModernTheme.colors.primary,
    },
    {
      title: 'Currently Borrowed',
      value: profileData?.borrowedBooks?.filter(book => new Date(book.dueDate) > new Date()).length || 0,
      icon: 'book-outline',
      color: ModernTheme.colors.accent,
    },
    {
      title: 'Overdue Books',
      value: profileData?.borrowedBooks?.filter(book => new Date(book.dueDate) < new Date()).length || 0,
      icon: 'warning-outline',
      color: ModernTheme.colors.error,
    },
    {
      title: 'Penalties',
      value: profileData?.penalties?.filter(penalty => penalty.status !== 'paid').length || 0,
      icon: 'card-outline',
      color: ModernTheme.colors.warning,
    },
  ];

  const quickActions = [
    {
      title: 'Change Password',
      subtitle: 'Update your password',
      icon: 'lock-closed-outline',
      color: ModernTheme.colors.primary,
      onPress: () => onNavigate('changePassword'),
    },
    {
      title: 'Notification Settings',
      subtitle: 'Manage notifications',
      icon: 'notifications-outline',
      color: ModernTheme.colors.accent,
      onPress: () => onNavigate('notificationSettings'),
    },
    {
      title: 'Help & Support',
      subtitle: 'Get assistance',
      icon: 'help-circle-outline',
      color: ModernTheme.colors.success,
      onPress: () => onNavigate('help'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <ModernButton
            title="←"
            onPress={onBack}
            variant="secondary"
            size="small"
            style={styles.backButton}
          />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSubtitle}>Manage your account</Text>
          </View>
          <ModernButton
            title="↻"
            onPress={onRefresh}
            variant="secondary"
            size="small"
            style={styles.refreshButton}
          />
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
                    {getInitials(userData.firstName || userData.idNumber)}
                  </Text>
                </View>
                <ModernBadge
                  text={getStatusText(userData.status || 'active')}
                  variant={userData.status === 'active' ? 'success' : 'warning'}
                  size="small"
                  style={styles.statusBadge}
                />
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {userData.firstName ? `${userData.firstName} ${userData.lastName}` : userData.idNumber}
                </Text>
                <Text style={styles.profileId}>{userData.idNumber}</Text>
                <Text style={styles.profileEmail}>{userData.email}</Text>
              </View>
            </View>
          </ModernCard>
        </View>

        {/* Statistics */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={stat.title} style={styles.statItem}>
                <ModernCard style={styles.statCard}>
                  <View style={styles.statContent}>
                    <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                      <Icon name={stat.icon} size={24} color={stat.color} />
                    </View>
                    <View style={styles.statText}>
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statLabel}>{stat.title}</Text>
                    </View>
                  </View>
                </ModernCard>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {quickActions.map((action, index) => (
            <ModernCard
              key={action.title}
              onPress={action.onPress}
              style={styles.actionCard}
            >
              <View style={styles.actionContent}>
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <Icon name={action.icon} size={24} color={action.color} />
                </View>
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
                <Icon name="chevron-forward-outline" size={20} color={ModernTheme.colors.textTertiary} />
              </View>
            </ModernCard>
          ))}
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
              <Text style={styles.accountValue}>{userData.email}</Text>
            </View>
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>Account Status</Text>
              <ModernBadge
                text={getStatusText(userData.status || 'active')}
                variant={userData.status === 'active' ? 'success' : 'warning'}
                size="small"
              />
            </View>
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>Member Since</Text>
              <Text style={styles.accountValue}>
                {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
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
            icon="log-out-outline"
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 0,
    backgroundColor: ModernTheme.colors.surface,
    borderWidth: 1,
    borderColor: ModernTheme.colors.border,
    ...ModernTheme.shadows.button,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 0,
    backgroundColor: ModernTheme.colors.surface,
    borderWidth: 1,
    borderColor: ModernTheme.colors.border,
    ...ModernTheme.shadows.button,
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
    paddingBottom: 120, // Account for bottom navigation
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
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
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
  statsSection: {
    marginBottom: ModernTheme.spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    marginBottom: ModernTheme.spacing.md,
  },
  statCard: {
    padding: ModernTheme.spacing.lg,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ModernTheme.spacing.md,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    ...ModernTheme.typography.h2,
    color: ModernTheme.colors.textPrimary,
    marginBottom: ModernTheme.spacing.xs,
  },
  statLabel: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
  },
  quickActionsSection: {
    marginBottom: ModernTheme.spacing.xl,
  },
  actionCard: {
    padding: ModernTheme.spacing.lg,
    marginBottom: ModernTheme.spacing.sm,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ModernTheme.spacing.lg,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    ...ModernTheme.typography.bodyMedium,
    color: ModernTheme.colors.textPrimary,
    marginBottom: ModernTheme.spacing.xs,
    fontWeight: '600',
  },
  actionSubtitle: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
  },
  accountSection: {
    marginBottom: ModernTheme.spacing.xl,
  },
  accountCard: {
    padding: ModernTheme.spacing.lg,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: ModernTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: ModernTheme.colors.border,
  },
  accountLabel: {
    ...ModernTheme.typography.body,
    color: ModernTheme.colors.textSecondary,
  },
  accountValue: {
    ...ModernTheme.typography.bodyMedium,
    color: ModernTheme.colors.textPrimary,
    fontWeight: '600',
  },
  logoutSection: {
    marginBottom: ModernTheme.spacing.xl,
  },
  logoutButton: {
    borderColor: ModernTheme.colors.error,
  },
});

export default ProfileScreen;
