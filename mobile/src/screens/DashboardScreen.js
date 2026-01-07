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
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
import { ModernTheme } from '../styles/ModernTheme';
import { 
  getResponsiveSpacing, 
  getResponsiveFontSize, 
  deviceInfo,
  getResponsiveLayout 
} from '../utils/ResponsiveUtils';
import { 
  ModernButton, 
  ModernCard, 
  ModernBadge, 
  StatisticsCard, 
  ResponsiveGrid, 
  ResponsiveContainer 
} from '../components/ui/ModernComponents';
import axios from 'axios';
import { buildApiUrl, getEndpoint } from '../config/api';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ userData, onNavigate, onLogout }) => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [clearanceData, setClearanceData] = useState(null);
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

      const [borrowedResponse, penaltiesResponse, semesterResponse] = await Promise.all([
        axios.get(buildApiUrl(getEndpoint('BORROWING', 'GET_USER_BORROWED_BOOKS', userData.idNumber))),
        axios.get(buildApiUrl(getEndpoint('PENALTY', 'GET_USER_PENALTIES', userData.idNumber))),
        axios.get(buildApiUrl(`/api/borrowing/user/${userData.idNumber}/semester-count`)),
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

      // Use real semester data from database (requiredBooks comes from system_settings)
      if (semesterResponse && semesterResponse.data && semesterResponse.data.success) {
        setClearanceData(semesterResponse.data.data);
      } else {
        // Fallback when API unavailable - derive from borrowed books count
        // Note: requiredBooks value should come from API (system_settings.books_required_per_semester)
        const derivedCount = Array.isArray(borrowedResponse?.data?.data?.borrowedBooks)
          ? borrowedResponse.data.data.borrowedBooks.length
          : borrowedBooks.length;
        const fallbackRequired = clearanceData?.requiredBooks || 20; // Use cached value or default
        setClearanceData({
          booksThisSemester: derivedCount,
          requiredBooks: fallbackRequired,
          booksRemaining: Math.max(0, fallbackRequired - derivedCount),
          clearanceStatus: derivedCount >= fallbackRequired ? 'completed' :
                          derivedCount >= Math.ceil(fallbackRequired * 0.75) ? 'near_completion' :
                          derivedCount >= Math.ceil(fallbackRequired * 0.5) ? 'in_progress' : 'needs_improvement'
        });
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
        <ResponsiveContainer padding="large">
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
          <Text style={[styles.sectionTitle, { fontSize: getResponsiveFontSize(20) }]}>
            Overview
          </Text>
          <ResponsiveGrid columns={deviceInfo.isTablet ? 4 : 2} spacing={16}>
            {stats.map((stat, index) => (
              <Animatable.View
                key={stat.title}
                animation="fadeInUp"
                duration={600}
                delay={400 + (index * 100)}
              >
                <StatisticsCard
                  title={stat.title}
                  value={stat.value}
                  icon={<Icon name={stat.icon} size={getResponsiveFontSize(24)} color={stat.color} />}
                  color={stat.color}
                  style={[styles.statCard, { borderLeftColor: stat.color, borderLeftWidth: 4 }]}
                />
              </Animatable.View>
            ))}
          </ResponsiveGrid>
        </Animatable.View>

        {/* Quick Actions - removed as requested */}

        {/* Semester Books Requirement Progress */}
        <Animatable.View
          animation="fadeInUp"
          duration={800}
          delay={1200}
          style={styles.progressContainer}
        >
          <Text style={[styles.sectionTitle, { fontSize: getResponsiveFontSize(20) }]}>
            Semester Books Requirement
          </Text>
          <ModernCard style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressInfo}>
                <Icon name="book-outline" size={24} color={ModernTheme.colors.primary} />
                <View style={styles.progressText}>
                  <Text style={styles.progressTitle}>Semester Books</Text>
                  <Text style={styles.progressSubtitle}>Complete your semester reading requirements</Text>
                </View>
              </View>
              <View style={styles.progressStats}>
                <Text style={styles.progressValue}>
                  {clearanceData ? clearanceData.booksThisSemester : borrowedBooks.length}
                </Text>
                <Text style={styles.progressTotal}>
                  / {clearanceData ? clearanceData.requiredBooks : 20}
                </Text>
              </View>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${clearanceData ? Math.min((clearanceData.booksThisSemester / clearanceData.requiredBooks) * 100, 100) : Math.min((borrowedBooks.length / 20) * 100, 100)}%`,
                      backgroundColor: clearanceData ? 
                        (clearanceData.booksThisSemester >= clearanceData.requiredBooks ? ModernTheme.colors.success : ModernTheme.colors.primary) :
                        (borrowedBooks.length >= 20 ? ModernTheme.colors.success : ModernTheme.colors.primary)
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressPercentage}>
                {clearanceData ? 
                  Math.round((clearanceData.booksThisSemester / clearanceData.requiredBooks) * 100) :
                  Math.round((borrowedBooks.length / 20) * 100)
                }%
              </Text>
            </View>
            
            <View style={styles.progressDetails}>
              <View style={styles.progressDetailItem}>
                <Icon name="checkmark-circle-outline" size={16} color={ModernTheme.colors.success} />
                <Text style={styles.progressDetailText}>
                  {clearanceData ? clearanceData.booksThisSemester : borrowedBooks.length} books completed
                </Text>
              </View>
              <View style={styles.progressDetailItem}>
                <Icon name="time-outline" size={16} color={ModernTheme.colors.warning} />
                <Text style={styles.progressDetailText}>
                  {clearanceData ? 
                    Math.max(0, clearanceData.requiredBooks - clearanceData.booksThisSemester) :
                    Math.max(0, 20 - borrowedBooks.length)
                  } more required
                </Text>
              </View>
            </View>
          </ModernCard>
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
        </ResponsiveContainer>
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
    paddingTop: getResponsiveSpacing(60),
    paddingBottom: getResponsiveSpacing(120), // Account for bottom navigation
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
    fontSize: getResponsiveFontSize(16),
  },
  userName: {
    ...ModernTheme.typography.h2,
    color: ModernTheme.colors.textPrimary,
    fontSize: getResponsiveFontSize(24),
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
  progressContainer: {
    marginBottom: ModernTheme.spacing.xl,
  },
  progressCard: {
    padding: ModernTheme.spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ModernTheme.spacing.lg,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressText: {
    marginLeft: ModernTheme.spacing.md,
    flex: 1,
  },
  progressTitle: {
    ...ModernTheme.typography.bodyMedium,
    color: ModernTheme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: ModernTheme.spacing.xs,
  },
  progressSubtitle: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
  },
  progressStats: {
    alignItems: 'flex-end',
  },
  progressValue: {
    ...ModernTheme.typography.h2,
    color: ModernTheme.colors.primary,
    fontWeight: '700',
  },
  progressTotal: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ModernTheme.spacing.lg,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: ModernTheme.colors.border,
    borderRadius: 4,
    marginRight: ModernTheme.spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressDetailText: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
    marginLeft: ModernTheme.spacing.sm,
    fontSize: 12,
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
