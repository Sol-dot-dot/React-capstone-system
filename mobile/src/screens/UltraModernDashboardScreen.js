import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
// import { LinearGradient } from 'expo-linear-gradient';
import { ModernTheme } from '../styles/ModernTheme';

const UltraModernDashboardScreen = ({ userData, onNavigate, onLogout }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    borrowedBooks: 0,
    overdueBooks: 0,
    totalPenalties: 0,
    readingHistory: 0,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const quickActions = [
    {
      id: 'borrowedBooks',
      title: 'My Books',
      subtitle: 'View borrowed books',
      icon: 'library-outline',
      color: ModernTheme.colors.primary,
      onPress: () => onNavigate('borrowedBooks'),
    },
    {
      id: 'penalties',
      title: 'Penalties',
      subtitle: 'Check fines & fees',
      icon: 'card-outline',
      color: ModernTheme.colors.warning,
      onPress: () => onNavigate('penalties'),
    },
    {
      id: 'profile',
      title: 'Profile',
      subtitle: 'Manage account',
      icon: 'person-outline',
      color: ModernTheme.colors.accent,
      onPress: () => onNavigate('profile'),
    },
    {
      id: 'chatbot',
      title: 'AI Assistant',
      subtitle: 'Get help & support',
      icon: 'chatbubble-outline',
      color: ModernTheme.colors.success,
      onPress: () => onNavigate('chatbot'),
    },
  ];

  const recentActivities = [
    {
      id: 1,
      title: 'Book Borrowed',
      description: 'Introduction to React Native',
      time: '2 hours ago',
      type: 'borrow',
    },
    {
      id: 2,
      title: 'Book Returned',
      description: 'JavaScript: The Good Parts',
      time: '1 day ago',
      type: 'return',
    },
    {
      id: 3,
      title: 'Penalty Paid',
      description: 'Overdue fine payment',
      time: '3 days ago',
      type: 'payment',
    },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'borrow': return 'book-outline';
      case 'return': return 'library-outline';
      case 'payment': return 'card-outline';
      default: return 'document-outline';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {userData?.idNumber?.charAt(0) || 'U'}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.greeting}>Welcome back!</Text>
                <Text style={styles.userName}>
                  {userData?.idNumber || 'User'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Library Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.borrowedBooks}</Text>
              <Text style={styles.statLabel}>Borrowed Books</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.overdueBooks}</Text>
              <Text style={styles.statLabel}>Overdue</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalPenalties}</Text>
              <Text style={styles.statLabel}>Penalties</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.readingHistory}</Text>
              <Text style={styles.statLabel}>History</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, { borderLeftColor: action.color }]}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <View style={styles.actionIcon}>
                  <Icon name={action.icon} size={24} color={action.color} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
                <Text style={styles.actionArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <View style={styles.activitiesList}>
            {recentActivities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Icon 
                    name={getActivityIcon(activity.type)} 
                    size={18} 
                    color={ModernTheme.colors.textTertiary} 
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDescription}>
                    {activity.description}
                  </Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom navigation
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: ModernTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ModernTheme.spacing.md,
  },
  avatarText: {
    ...ModernTheme.typography.h4,
    color: ModernTheme.colors.textInverse,
  },
  userDetails: {
    flex: 1,
  },
  greeting: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
  },
  userName: {
    ...ModernTheme.typography.h4,
    color: ModernTheme.colors.textPrimary,
  },
  logoutButton: {
    paddingHorizontal: ModernTheme.spacing.md,
    paddingVertical: ModernTheme.spacing.sm,
    borderRadius: ModernTheme.borderRadius.md,
    backgroundColor: ModernTheme.colors.error + '20',
  },
  logoutButtonText: {
    ...ModernTheme.typography.captionMedium,
    color: ModernTheme.colors.error,
  },
  statsSection: {
    paddingHorizontal: ModernTheme.spacing.lg,
    marginBottom: ModernTheme.spacing.xl,
  },
  sectionTitle: {
    ...ModernTheme.typography.h3,
    marginBottom: ModernTheme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: ModernTheme.colors.surfaceElevated,
    borderRadius: ModernTheme.borderRadius.lg,
    padding: ModernTheme.spacing.lg,
    marginBottom: ModernTheme.spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    ...ModernTheme.typography.h1,
    color: ModernTheme.colors.primary,
    marginBottom: ModernTheme.spacing.xs,
  },
  statLabel: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
    textAlign: 'center',
  },
  actionsSection: {
    paddingHorizontal: ModernTheme.spacing.lg,
    marginBottom: ModernTheme.spacing.xl,
  },
  actionsGrid: {
    gap: ModernTheme.spacing.sm,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ModernTheme.colors.surfaceElevated,
    borderRadius: ModernTheme.borderRadius.lg,
    padding: ModernTheme.spacing.lg,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: ModernTheme.colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ModernTheme.spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    ...ModernTheme.typography.bodyMedium,
    color: ModernTheme.colors.textPrimary,
    marginBottom: ModernTheme.spacing.xs,
  },
  actionSubtitle: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
  },
  actionArrow: {
    ...ModernTheme.typography.h4,
    color: ModernTheme.colors.textTertiary,
  },
  activitiesSection: {
    paddingHorizontal: ModernTheme.spacing.lg,
    marginBottom: ModernTheme.spacing.xl,
  },
  activitiesList: {
    gap: ModernTheme.spacing.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ModernTheme.colors.surfaceElevated,
    borderRadius: ModernTheme.borderRadius.lg,
    padding: ModernTheme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ModernTheme.colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ModernTheme.spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...ModernTheme.typography.bodyMedium,
    color: ModernTheme.colors.textPrimary,
    marginBottom: ModernTheme.spacing.xs,
  },
  activityDescription: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
    marginBottom: ModernTheme.spacing.xs,
  },
  activityTime: {
    ...ModernTheme.typography.small,
    color: ModernTheme.colors.textTertiary,
  },
});

export default UltraModernDashboardScreen;