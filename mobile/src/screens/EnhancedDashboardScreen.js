import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  RefreshControl,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
import { ModernTheme } from '../styles/ModernTheme';
import { ModernButton, ModernCard, ModernBadge } from '../components/ModernComponents';
import axios from 'axios';
import { buildApiUrl, getEndpoint } from '../config/api';

const { width } = Dimensions.get('window');

const EnhancedDashboardScreen = ({ userData, onNavigate, onLogout }) => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [borrowedResponse, penaltiesResponse] = await Promise.all([
        axios.get(buildApiUrl(getEndpoint('BORROWING', 'GET_USER_BORROWED_BOOKS', userData.idNumber))),
        axios.get(buildApiUrl(getEndpoint('PENALTY', 'GET_USER_PENALTIES', userData.idNumber))),
      ]);

      if (borrowedResponse.data.success) {
        setBorrowedBooks(borrowedResponse.data.data.borrowedBooks || []);
      }

      if (penaltiesResponse.data.success) {
        setPenalties(penaltiesResponse.data.data.penalties || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getOverdueBooks = () => {
    const today = new Date();
    return borrowedBooks.filter(book => {
      const dueDate = new Date(book.dueDate);
      return dueDate < today;
    });
  };

  const getUpcomingDueBooks = () => {
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
    return borrowedBooks.filter(book => {
      const dueDate = new Date(book.dueDate);
      return dueDate >= today && dueDate <= threeDaysFromNow;
    });
  };

  const stats = [
    {
      title: 'Borrowed Books',
      value: borrowedBooks.length,
      icon: 'library-outline',
      color: ModernTheme.colors.primary,
      onPress: () => onNavigate('borrowedBooks'),
    },
    {
      title: 'Overdue',
      value: getOverdueBooks().length,
      icon: 'warning-outline',
      color: ModernTheme.colors.error,
      onPress: () => onNavigate('borrowedBooks'),
    },
    {
      title: 'Due Soon',
      value: getUpcomingDueBooks().length,
      icon: 'time-outline',
      color: ModernTheme.colors.warning,
      onPress: () => onNavigate('borrowedBooks'),
    },
    {
      title: 'Penalties',
      value: penalties.length,
      icon: 'card-outline',
      color: ModernTheme.colors.secondary,
      onPress: () => onNavigate('penalties'),
    },
  ];

  const quickActions = [
    {
      title: 'My Books',
      subtitle: 'View borrowed books',
      icon: 'library-outline',
      color: ModernTheme.colors.primary,
      onPress: () => onNavigate('borrowedBooks'),
    },
    {
      title: 'Penalties',
      subtitle: 'Check penalty status',
      icon: 'card-outline',
      color: ModernTheme.colors.error,
      onPress: () => onNavigate('penalties'),
    },
    {
      title: 'Profile',
      subtitle: 'Manage account',
      icon: 'person-outline',
      color: ModernTheme.colors.success,
      onPress: () => onNavigate('profile'),
    },
    {
      title: 'AI Assistant',
      subtitle: 'Get help',
      icon: 'chatbubble-outline',
      color: ModernTheme.colors.accent,
      onPress: () => onNavigate('chatbot'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />

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
        {/* Header */}
        <Animatable.View
          animation="fadeInDown"
          duration={600}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{userData.firstName || userData.idNumber}</Text>
            </View>
            <ModernButton
              title=""
              onPress={onLogout}
              variant="outline"
              size="small"
              icon="log-out-outline"
              style={styles.logoutButton}
            />
          </View>
        </Animatable.View>

        {/* Stats Grid */}
        <Animatable.View
          animation="fadeInUp"
          duration={800}
          delay={200}
          style={styles.statsContainer}
        >
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <Animatable.View
                key={stat.title}
                animation="fadeInUp"
                duration={600}
                delay={400 + (index * 100)}
                style={styles.statItem}
              >
                <ModernCard
                  onPress={stat.onPress}
                  style={[styles.statCard, { borderLeftColor: stat.color, borderLeftWidth: 4 }]}
                >
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
              </Animatable.View>
            ))}
          </View>
        </Animatable.View>

        {/* Quick Actions */}
        <Animatable.View
          animation="fadeInUp"
          duration={800}
          delay={800}
          style={styles.quickActionsContainer}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <Animatable.View
                key={action.title}
                animation="fadeInUp"
                duration={600}
                delay={1000 + (index * 100)}
                style={styles.quickActionItem}
              >
                <ModernCard
                  onPress={action.onPress}
                  style={styles.quickActionCard}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                    <Icon name={action.icon} size={28} color={action.color} />
                  </View>
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                </ModernCard>
              </Animatable.View>
            ))}
          </View>
        </Animatable.View>

        {/* Recent Activity */}
        {borrowedBooks.length > 0 && (
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={1400}
            style={styles.recentActivityContainer}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <ModernButton
                title="View All"
                onPress={() => onNavigate('borrowedBooks')}
                variant="outline"
                size="small"
                style={styles.viewAllButton}
              />
            </View>
            {borrowedBooks.slice(0, 3).map((book, index) => (
              <Animatable.View
                key={book.id}
                animation="fadeInRight"
                duration={600}
                delay={1600 + (index * 100)}
                style={styles.activityItem}
              >
                <ModernCard style={styles.activityCard}>
                  <View style={styles.activityContent}>
                    <View style={styles.activityIcon}>
                      <Icon name="book-outline" size={20} color={ModernTheme.colors.primary} />
                    </View>
                    <View style={styles.activityText}>
                      <Text style={styles.activityTitle}>{book.title}</Text>
                      <Text style={styles.activitySubtitle}>
                        Due: {new Date(book.dueDate).toLocaleDateString()}
                      </Text>
                    </View>
                    {new Date(book.dueDate) < new Date() && (
                      <ModernBadge text="Overdue" variant="error" size="small" />
                    )}
                  </View>
                </ModernCard>
              </Animatable.View>
            ))}
          </Animatable.View>
        )}
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
  scrollContent: {
    paddingHorizontal: ModernTheme.spacing.lg,
    paddingTop: 60,
    paddingBottom: 120, // Account for bottom navigation
  },
  header: {
    marginBottom: ModernTheme.spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    ...ModernTheme.typography.body,
    color: ModernTheme.colors.textSecondary,
  },
  userName: {
    ...ModernTheme.typography.h2,
    color: ModernTheme.colors.textPrimary,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 0,
  },
  sectionTitle: {
    ...ModernTheme.typography.h3,
    color: ModernTheme.colors.textPrimary,
    marginBottom: ModernTheme.spacing.lg,
  },
  statsContainer: {
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
  quickActionsContainer: {
    marginBottom: ModernTheme.spacing.xl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '48%',
    marginBottom: ModernTheme.spacing.md,
  },
  quickActionCard: {
    padding: ModernTheme.spacing.lg,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ModernTheme.spacing.md,
  },
  quickActionTitle: {
    ...ModernTheme.typography.bodyMedium,
    color: ModernTheme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: ModernTheme.spacing.xs,
    fontWeight: '600',
  },
  quickActionSubtitle: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
    textAlign: 'center',
  },
  recentActivityContainer: {
    marginBottom: ModernTheme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ModernTheme.spacing.lg,
  },
  viewAllButton: {
    paddingHorizontal: ModernTheme.spacing.md,
  },
  activityItem: {
    marginBottom: ModernTheme.spacing.sm,
  },
  activityCard: {
    padding: ModernTheme.spacing.md,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ModernTheme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ModernTheme.spacing.md,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    ...ModernTheme.typography.bodyMedium,
    color: ModernTheme.colors.textPrimary,
    marginBottom: ModernTheme.spacing.xs,
    fontWeight: '600',
  },
  activitySubtitle: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
  },
});

export default EnhancedDashboardScreen;
