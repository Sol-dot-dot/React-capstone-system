import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  RefreshControl,
  AppState,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
import { ModernTheme } from '../styles/ModernTheme';
import { ModernButton, ModernCard, ModernBadge } from '../components/ui/ModernComponents';
import axios from 'axios';
import { buildApiUrl, getEndpoint } from '../config/api';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ userData, onNavigate, onLogout }) => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Refresh data when app comes back to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        loadDashboardData();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
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
        // Backend returns 'fines' not 'penalties'
        const fines = penaltiesResponse.data.data.fines || [];
        
        // Transform fines data to match the expected penalty structure
        const transformedPenalties = fines.map(fine => ({
          id: fine.id,
          reason: `Overdue book: ${fine.title}`,
          bookTitle: fine.title,
          amount: parseFloat(fine.fine_amount) - parseFloat(fine.paid_amount || 0), // Outstanding amount
          status: fine.status,
          dueDate: fine.due_date,
          createdAt: fine.fine_date,
          daysOverdue: fine.days_overdue,
          bookCode: fine.number_code,
          author: fine.author,
          borrowedDate: fine.borrowed_date,
          returnedDate: fine.returned_date
        }));
        
        setPenalties(transformedPenalties);
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
    return borrowedBooks.filter(book => {
      // Use the dueStatus from backend if available, otherwise calculate
      if (book.dueStatus) {
        return book.dueStatus === 'overdue';
      }
      
      // Fallback calculation
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(book.due_date || book.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate < today; // Only books past their due date
    });
  };

  const getUpcomingDueBooks = () => {
    return borrowedBooks.filter(book => {
      // Use the dueStatus from backend if available, otherwise calculate
      if (book.dueStatus) {
        return book.dueStatus === 'today' || book.dueStatus === 'tomorrow' || book.dueStatus === 'near';
      }
      
      // Fallback calculation
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
      threeDaysFromNow.setHours(23, 59, 59, 999);
      const dueDate = new Date(book.due_date || book.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate >= today && dueDate <= threeDaysFromNow; // Books due today through 3 days
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
            </View>
            {borrowedBooks.slice(0, 3).map((book, index) => {
              const dueDate = new Date(book.due_date || book.dueDate);
              
              // Use dueStatus from backend if available, otherwise calculate
              let isOverdue = false;
              let isDueSoon = false;
              
              if (book.dueStatus) {
                isOverdue = book.dueStatus === 'overdue';
                isDueSoon = book.dueStatus === 'today' || book.dueStatus === 'tomorrow' || book.dueStatus === 'near';
              } else {
                // Fallback calculation
                const today = new Date();
                
                // Normalize dates to start of day for accurate comparison
                dueDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);
                
                const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
                threeDaysFromNow.setHours(23, 59, 59, 999);
                
                isOverdue = dueDate < today;
                isDueSoon = dueDate >= today && dueDate <= threeDaysFromNow;
              }
              
              return (
                <Animatable.View
                  key={book.id}
                  animation="fadeInRight"
                  duration={600}
                  delay={1600 + (index * 100)}
                  style={styles.activityItem}
                >
                  <ModernCard style={styles.activityCard}>
                    <View style={styles.activityContent}>
                      <View style={[
                        styles.activityIcon,
                        { backgroundColor: isOverdue ? ModernTheme.colors.error + '20' : isDueSoon ? ModernTheme.colors.warning + '20' : ModernTheme.colors.primary + '20' }
                      ]}>
                        <Icon 
                          name={isOverdue ? "warning-outline" : isDueSoon ? "time-outline" : "book-outline"} 
                          size={20} 
                          color={isOverdue ? ModernTheme.colors.error : isDueSoon ? ModernTheme.colors.warning : ModernTheme.colors.primary} 
                        />
                      </View>
                      <View style={styles.activityText}>
                        <Text style={styles.activityTitle} numberOfLines={1}>{book.title}</Text>
                        <Text style={styles.activitySubtitle}>
                          Due: {dueDate.toLocaleDateString()}
                        </Text>
                      </View>
                      {isOverdue && (
                        <ModernBadge text="Overdue" variant="error" size="small" />
                      )}
                      {isDueSoon && !isOverdue && (
                        <ModernBadge text="Due Soon" variant="warning" size="small" />
                      )}
                    </View>
                  </ModernCard>
                </Animatable.View>
              );
            })}
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

export default DashboardScreen;
