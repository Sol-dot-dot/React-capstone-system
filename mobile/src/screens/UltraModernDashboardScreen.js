import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { buildApiUrl, getEndpoint } from '../config/api';
import NetworkTest from '../components/NetworkTest';
// import { LinearGradient } from 'expo-linear-gradient';
import { ModernTheme } from '../styles/ModernTheme';

const UltraModernDashboardScreen = ({ userData, onNavigate, onLogout }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    borrowedBooks: 0,
    overdueBooks: 0,
    totalPenalties: 0,
    readingHistory: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [apiAvailable, setApiAvailable] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('Loading dashboard data for user:', userData.idNumber);
      
      // Try to load data with better error handling
      let borrowedResponse, penaltyResponse, historyResponse;
      
      try {
        // Load borrowed books data with multiple URL attempts
        const baseUrls = [
          'http://localhost:5000',
          'http://10.0.2.2:5000',
          'http://127.0.0.1:5000'
        ];
        
        let borrowedUrl = buildApiUrl(getEndpoint('BORROWING', 'GET_USER_BORROWED_BOOKS', userData.idNumber));
        console.log('Trying borrowed books URL:', borrowedUrl);
        
        // Try the primary URL first
        try {
          borrowedResponse = await axios.get(borrowedUrl, { timeout: 5000 });
          setApiAvailable(true);
        } catch (primaryError) {
          console.warn('Primary URL failed, trying alternatives...');
          
          // Try alternative URLs
          for (const baseUrl of baseUrls) {
            try {
              const altUrl = `${baseUrl}/api/borrowing/user/${userData.idNumber}`;
              console.log('Trying alternative URL:', altUrl);
              borrowedResponse = await axios.get(altUrl, { timeout: 5000 });
              setApiAvailable(true);
              console.log('Success with alternative URL:', baseUrl);
              break;
            } catch (altError) {
              console.warn(`Failed with ${baseUrl}:`, altError.message);
            }
          }
          
          if (!borrowedResponse) {
            throw primaryError; // Re-throw the original error if all attempts failed
          }
        }
      } catch (error) {
        console.warn('Failed to load borrowed books:', error.message);
        borrowedResponse = { data: { success: false, data: { borrowedBooks: [] } } };
        setApiAvailable(false);
      }
      
      try {
        // Load penalty data using the working base URL
        const penaltyUrl = `http://10.0.2.2:5000/api/penalty/user/${userData.idNumber}`;
        console.log('Penalty URL:', penaltyUrl);
        penaltyResponse = await axios.get(penaltyUrl, { timeout: 5000 });
      } catch (error) {
        console.warn('Failed to load penalty data:', error.message);
        penaltyResponse = { data: { success: false, data: { fines: [] } } };
      }
      
      try {
        // Load reading history using the working base URL
        const historyUrl = `http://10.0.2.2:5000/api/chatbot/reading-history/${userData.idNumber}`;
        console.log('History URL:', historyUrl);
        historyResponse = await axios.get(historyUrl, { timeout: 5000 });
      } catch (error) {
        console.warn('Failed to load reading history:', error.message);
        historyResponse = { data: { success: false, data: { totalBooks: 0 } } };
      }

      if (borrowedResponse.data.success) {
        // Extract borrowed books from the correct nested structure
        const borrowedBooks = borrowedResponse.data.data?.borrowedBooks || [];
        
        console.log('Borrowed books data:', borrowedBooks);
        
        const overdueBooks = borrowedBooks.filter(book => 
          new Date(book.due_date) < new Date() && book.status === 'borrowed'
        ).length;
        
        setStats(prev => ({
          ...prev,
          borrowedBooks: borrowedBooks.length,
          overdueBooks: overdueBooks,
        }));
      }

      if (penaltyResponse.data.success) {
        const penaltyData = penaltyResponse.data.data;
        setStats(prev => ({
          ...prev,
          totalPenalties: penaltyData?.fines?.length || 0,
        }));
      }

      if (historyResponse.data.success) {
        const historyData = historyResponse.data.data;
        setStats(prev => ({
          ...prev,
          readingHistory: historyData?.totalBooks || 0,
        }));
      }

      // Generate recent activities from borrowed books
      if (borrowedResponse.data.success) {
        const borrowedBooks = borrowedResponse.data.data?.borrowedBooks || [];
        
        const activities = borrowedBooks.slice(0, 3).map(book => ({
          id: book.id,
          title: 'Book Borrowed',
          description: book.title,
          time: formatTimeAgo(book.borrowed_date),
          type: 'borrow',
        }));
        setRecentActivities(activities);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      // Don't show alert for individual API failures since we have fallbacks
      // Alert.alert('Error', `Failed to load dashboard data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
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

  // recentActivities is now loaded from API data

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
          {!apiAvailable && (
            <View style={styles.offlineWarning}>
              <Text style={styles.offlineText}>⚠️ Offline Mode - Data may not be current</Text>
            </View>
          )}
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

        {/* Network Test - Temporary for debugging */}
        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>Debug Network</Text>
          <NetworkTest userData={userData} />
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <View style={styles.activitiesList}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading activities...</Text>
              </View>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
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
              ))
            ) : (
              <View style={styles.emptyActivities}>
                <Text style={styles.emptyActivitiesText}>No recent activities</Text>
              </View>
            )}
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: ModernTheme.spacing.lg,
  },
  loadingText: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
  },
  emptyActivities: {
    alignItems: 'center',
    paddingVertical: ModernTheme.spacing.lg,
  },
  emptyActivitiesText: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
  },
  offlineWarning: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  offlineText: {
    ...ModernTheme.typography.caption,
    color: '#856404',
    textAlign: 'center',
  },
});

export default UltraModernDashboardScreen;