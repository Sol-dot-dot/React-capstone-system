import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  RefreshControl,
  Animated,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
import { EnhancedTheme } from '../styles/EnhancedTheme';
import { EnhancedButton, EnhancedCard, EnhancedBadge, EnhancedFAB } from '../components/EnhancedComponents';
import axios from 'axios';
import { buildApiUrl, getEndpoint } from '../config/api';

const { width } = Dimensions.get('window');

const EnhancedDashboardScreen = ({ userData, onNavigate, onLogout }) => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadDashboardData();
    
    // Entrance animation
    const animationSequence = Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    animationSequence.start(() => {
      setIsLoaded(true);
    });
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
      color: EnhancedTheme.colors.primary,
      onPress: () => onNavigate('borrowedBooks'),
      trend: '+2 this week',
    },
    {
      title: 'Overdue',
      value: getOverdueBooks().length,
      icon: 'warning-outline',
      color: EnhancedTheme.colors.error,
      onPress: () => onNavigate('borrowedBooks'),
      trend: getOverdueBooks().length > 0 ? 'Action needed' : 'All caught up',
    },
    {
      title: 'Due Soon',
      value: getUpcomingDueBooks().length,
      icon: 'time-outline',
      color: EnhancedTheme.colors.warning,
      onPress: () => onNavigate('borrowedBooks'),
      trend: getUpcomingDueBooks().length > 0 ? 'Check dates' : 'No upcoming',
    },
    {
      title: 'Penalties',
      value: penalties.length,
      icon: 'card-outline',
      color: EnhancedTheme.colors.secondary,
      onPress: () => onNavigate('penalties'),
      trend: penalties.length > 0 ? 'Payment due' : 'No penalties',
    },
  ];

  const quickActions = [
    {
      title: 'My Books',
      subtitle: 'View borrowed books',
      icon: 'library-outline',
      color: EnhancedTheme.colors.primary,
      onPress: () => onNavigate('borrowedBooks'),
    },
    {
      title: 'Penalties',
      subtitle: 'Check penalty status',
      icon: 'card-outline',
      color: EnhancedTheme.colors.error,
      onPress: () => onNavigate('penalties'),
    },
    {
      title: 'Profile',
      subtitle: 'Manage account',
      icon: 'person-outline',
      color: EnhancedTheme.colors.success,
      onPress: () => onNavigate('profile'),
    },
    {
      title: 'AI Assistant',
      subtitle: 'Get help',
      icon: 'chatbubble-outline',
      color: EnhancedTheme.colors.accent,
      onPress: () => onNavigate('chatbot'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Enhanced Background */}
      <View style={styles.backgroundGradient} />
      <View style={styles.backgroundPattern} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[EnhancedTheme.colors.primary]}
            tintColor={EnhancedTheme.colors.primary}
          />
        }
      >
        {/* Enhanced Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerContent}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{userData.firstName || userData.idNumber}</Text>
            </View>
            <EnhancedButton
              title=""
              onPress={onLogout}
              variant="outline"
              size="small"
              icon="log-out-outline"
              style={styles.logoutButton}
              accessibilityLabel="Logout"
              accessibilityHint="Double tap to logout from your account"
            />
          </View>
        </Animated.View>

        {/* Enhanced Stats Grid */}
        {isLoaded && (
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={200}
            style={styles.statsContainer}
          >
            <Text style={styles.sectionTitle}>Library Overview</Text>
            <View style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <Animatable.View
                  key={stat.title}
                  animation="fadeInUp"
                  duration={600}
                  delay={400 + (index * 100)}
                  style={styles.statItem}
                >
                  <EnhancedCard
                    onPress={stat.onPress}
                    style={[styles.statCard, { borderLeftColor: stat.color, borderLeftWidth: 4 }]}
                  >
                    <View style={styles.statContent}>
                      <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                        <Icon name={stat.icon} size={28} color={stat.color} />
                      </View>
                      <View style={styles.statText}>
                        <Text style={styles.statValue}>{stat.value}</Text>
                        <Text style={styles.statLabel}>{stat.title}</Text>
                        <Text style={styles.statTrend}>{stat.trend}</Text>
                      </View>
                    </View>
                  </EnhancedCard>
                </Animatable.View>
              ))}
            </View>
          </Animatable.View>
        )}

        {/* Enhanced Quick Actions */}
        {isLoaded && (
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
                  <EnhancedCard
                    onPress={action.onPress}
                    style={styles.quickActionCard}
                  >
                    <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                      <Icon name={action.icon} size={32} color={action.color} />
                    </View>
                    <Text style={styles.quickActionTitle}>{action.title}</Text>
                    <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                  </EnhancedCard>
                </Animatable.View>
              ))}
            </View>
          </Animatable.View>
        )}

        {/* Enhanced Recent Activity */}
        {borrowedBooks.length > 0 && isLoaded && (
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={1400}
            style={styles.recentActivityContainer}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <EnhancedButton
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
                <EnhancedCard style={styles.activityCard}>
                  <View style={styles.activityContent}>
                    <View style={styles.activityIcon}>
                      <Icon name="book-outline" size={24} color={EnhancedTheme.colors.primary} />
                    </View>
                    <View style={styles.activityText}>
                      <Text style={styles.activityTitle}>{book.title}</Text>
                      <Text style={styles.activitySubtitle}>
                        Due: {new Date(book.dueDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.activityRight}>
                      {new Date(book.dueDate) < new Date() ? (
                        <EnhancedBadge text="Overdue" variant="error" size="small" />
                      ) : getUpcomingDueBooks().includes(book) ? (
                        <EnhancedBadge text="Due Soon" variant="warning" size="small" />
                      ) : (
                        <EnhancedBadge text="On Time" variant="success" size="small" />
                      )}
                    </View>
                  </View>
                </EnhancedCard>
              </Animatable.View>
            ))}
          </Animatable.View>
        )}
      </ScrollView>

      {/* Enhanced Floating Action Button */}
      <EnhancedFAB
        onPress={() => onNavigate('chatbot')}
        icon="chatbubble-outline"
        variant="primary"
        size="medium"
        style={styles.fab}
        accessibilityLabel="AI Assistant"
        accessibilityHint="Double tap to open AI assistant"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EnhancedTheme.colors.background,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: EnhancedTheme.colors.backgroundGradient[0],
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.02,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: EnhancedTheme.spacing.lg,
    paddingTop: 60,
    paddingBottom: 120, // Account for bottom navigation and FAB
  },
  header: {
    marginBottom: EnhancedTheme.spacing.xl,
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
    ...EnhancedTheme.typography.bodyLarge,
    color: EnhancedTheme.colors.textSecondary,
  },
  userName: {
    ...EnhancedTheme.typography.h2,
    color: EnhancedTheme.colors.textPrimary,
    fontWeight: '800',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 0,
  },
  sectionTitle: {
    ...EnhancedTheme.typography.h3,
    color: EnhancedTheme.colors.textPrimary,
    marginBottom: EnhancedTheme.spacing.lg,
    fontWeight: '700',
  },
  statsContainer: {
    marginBottom: EnhancedTheme.spacing.xxl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    marginBottom: EnhancedTheme.spacing.md,
  },
  statCard: {
    padding: EnhancedTheme.spacing.lg,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: EnhancedTheme.spacing.md,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    ...EnhancedTheme.typography.h2,
    color: EnhancedTheme.colors.textPrimary,
    marginBottom: EnhancedTheme.spacing.xs,
    fontWeight: '800',
  },
  statLabel: {
    ...EnhancedTheme.typography.captionMedium,
    color: EnhancedTheme.colors.textSecondary,
    marginBottom: EnhancedTheme.spacing.xs,
  },
  statTrend: {
    ...EnhancedTheme.typography.small,
    color: EnhancedTheme.colors.textTertiary,
  },
  quickActionsContainer: {
    marginBottom: EnhancedTheme.spacing.xxl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '48%',
    marginBottom: EnhancedTheme.spacing.md,
  },
  quickActionCard: {
    padding: EnhancedTheme.spacing.lg,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: EnhancedTheme.spacing.md,
  },
  quickActionTitle: {
    ...EnhancedTheme.typography.bodyMedium,
    color: EnhancedTheme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: EnhancedTheme.spacing.xs,
    fontWeight: '600',
  },
  quickActionSubtitle: {
    ...EnhancedTheme.typography.caption,
    color: EnhancedTheme.colors.textSecondary,
    textAlign: 'center',
  },
  recentActivityContainer: {
    marginBottom: EnhancedTheme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: EnhancedTheme.spacing.lg,
  },
  viewAllButton: {
    paddingHorizontal: EnhancedTheme.spacing.md,
  },
  activityItem: {
    marginBottom: EnhancedTheme.spacing.sm,
  },
  activityCard: {
    padding: EnhancedTheme.spacing.md,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: EnhancedTheme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: EnhancedTheme.spacing.md,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    ...EnhancedTheme.typography.bodyMedium,
    color: EnhancedTheme.colors.textPrimary,
    marginBottom: EnhancedTheme.spacing.xs,
    fontWeight: '600',
  },
  activitySubtitle: {
    ...EnhancedTheme.typography.caption,
    color: EnhancedTheme.colors.textSecondary,
  },
  activityRight: {
    marginLeft: EnhancedTheme.spacing.sm,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
  },
});

export default EnhancedDashboardScreen;