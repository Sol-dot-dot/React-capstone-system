import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { ModernTheme, ModernStyles } from '../styles/ModernTheme';

// Fallback icon component in case vector icons don't load
const FallbackIcon = ({ name, size, color }) => {
  const iconMap = {
    'book': '📚',
    'check-circle': '✅',
    'dollar-sign': '💰',
    'book-open': '📖',
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

const ModernDashboardScreen = ({ userData, onNavigate, onLogout }) => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    borrowedBooks: 0,
    overdueBooks: 0,
    fines: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch borrowed books
      const borrowedResponse = await axios.get(
        `http://10.0.2.2:5000/api/borrowing/user/${userData.idNumber}`
      );

      // Fetch penalty data for semester tracking
      const penaltyResponse = await axios.get(
        `http://10.0.2.2:5000/api/penalty/user/${userData.idNumber}`
      );

      if (borrowedResponse.data.success) {
        const borrowedBooks = borrowedResponse.data.data.borrowedBooks || [];
        const overdueBooks = borrowedBooks.filter(book => book.dueStatus === 'overdue');
        
        // Get total books borrowed from semester tracking
        const totalBooksBorrowed = penaltyResponse.data.success 
          ? (penaltyResponse.data.data.semesterTracking?.books_borrowed_count || 0)
          : 0;
        
        setStats({
          totalBooks: totalBooksBorrowed, // Total books borrowed this semester
          borrowedBooks: borrowedBooks.length, // Currently borrowed books
          overdueBooks: overdueBooks.length,
          fines: overdueBooks.length * 5, // 5 pesos per day
        });

        // Create recent activity from borrowed books
        const activity = borrowedBooks.slice(0, 3).map(book => ({
          id: book.id,
          title: book.title,
          type: 'borrowed',
          amount: 0,
          time: book.borrowDate || 'Recently',
          icon: 'book',
        }));
        setRecentActivity(activity);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currencies = [
    {
      code: 'TOTAL',
      amount: stats.totalBooks.toFixed(0),
      label: 'Total This Semester',
    },
    {
      code: 'CURRENT',
      amount: stats.borrowedBooks.toFixed(0),
      label: 'Currently Borrowed',
    },
    {
      code: 'OVERDUE',
      amount: stats.overdueBooks.toFixed(0),
      label: 'Overdue Books',
    },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'borrowed':
        return 'book';
      case 'returned':
        return 'check-circle';
      case 'fine':
        return 'dollar-sign';
      default:
        return 'book-open';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'borrowed':
        return ModernTheme.colors.blue;
      case 'returned':
        return ModernTheme.colors.success;
      case 'fine':
        return ModernTheme.colors.error;
      default:
        return ModernTheme.colors.secondary;
    }
  };

  if (loading) {
    return (
      <View style={[ModernStyles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={ModernTheme.colors.accent} />
        <Text style={ModernTheme.typography.caption}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={ModernStyles.container}>
      {/* Header */}
      <View style={ModernStyles.header}>
        <TouchableOpacity style={ModernStyles.headerButton}>
          <Icon name="plus" size={20} color={ModernTheme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={ModernStyles.headerTitle}>Library Dashboard</Text>
        <TouchableOpacity style={ModernStyles.headerButton} onPress={onLogout}>
          <Icon name="log-out" size={20} color={ModernTheme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* User & Balance Section */}
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <View style={[ModernStyles.profileImage, styles.userImage]}>
              <Text style={styles.userImageText}>
                {userData?.idNumber ? userData.idNumber.charAt(0) : 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userId}>**** {userData?.idNumber?.slice(-4) || '0000'}</Text>
              <Text style={styles.userName}>{userData?.idNumber || 'Student'}</Text>
            </View>
          </View>
          
          {/* Main Balance */}
          <View style={styles.balanceSection}>
            <Text style={[ModernStyles.statValue, styles.mainBalance]}>
              {stats.totalBooks}
            </Text>
            <Text style={ModernTheme.typography.caption}>Books This Semester</Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            style={[ModernStyles.primaryButton, styles.actionButton]}
            onPress={() => onNavigate('borrowedBooks')}
          >
            <Icon name="book" size={24} color="#ffffff" />
            <Text style={ModernStyles.buttonText}>View Books</Text>
          </TouchableOpacity>
        </View>

        {/* Currency Balances */}
        <View style={styles.currenciesSection}>
          {currencies.map((currency, index) => (
            <View key={index} style={[ModernStyles.card, styles.currencyCard]}>
              <Text style={[ModernTheme.typography.body, { color: ModernTheme.colors.accent }]}>
                {currency.amount}
              </Text>
              <Text style={ModernTheme.typography.small}>{currency.code}</Text>
              <Text style={ModernTheme.typography.caption}>{currency.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={ModernTheme.typography.h3}>Recent Activity</Text>
          {recentActivity.length === 0 ? (
            <View style={styles.emptyActivity}>
              <Icon name="book-open" size={48} color={ModernTheme.colors.textMuted} />
              <Text style={ModernTheme.typography.body}>No recent activity</Text>
              <Text style={ModernTheme.typography.caption}>
                Your library activity will appear here
              </Text>
            </View>
          ) : (
            recentActivity.map((activity, index) => (
              <View key={index} style={ModernStyles.listItem}>
                <View style={[ModernStyles.listItemIcon, { backgroundColor: getActivityColor(activity.type) + '20' }]}>
                  <Icon name={getActivityIcon(activity.type)} size={20} color={getActivityColor(activity.type)} />
                </View>
                <View style={ModernStyles.listItemContent}>
                  <Text style={ModernStyles.listItemTitle}>{activity.title}</Text>
                  <Text style={ModernStyles.listItemSubtitle}>
                    {activity.type === 'borrowed' ? 'Book borrowed' : activity.type}
                  </Text>
                </View>
                <View style={styles.activityDetails}>
                  <Text style={[ModernTheme.typography.body, { color: getActivityColor(activity.type) }]}>
                    {activity.amount > 0 ? `+ ${activity.amount}` : '0'}
                  </Text>
                  <Text style={ModernTheme.typography.small}>{activity.time}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={ModernTheme.typography.h3}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={[ModernStyles.card, styles.quickActionCard]}
              onPress={() => onNavigate('borrowedBooks')}
            >
              <Icon name="book" size={20} color={ModernTheme.colors.primary} />
              <Text style={ModernTheme.typography.caption}>My Books</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[ModernStyles.card, styles.quickActionCard]}
              onPress={() => onNavigate('penalties')}
            >
              <Icon name="dollar-sign" size={20} color={ModernTheme.colors.warning} />
              <Text style={ModernTheme.typography.caption}>Fines</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[ModernStyles.card, styles.quickActionCard]}
              onPress={() => onNavigate('notificationSettings')}
            >
              <Icon name="bell" size={20} color={ModernTheme.colors.warning} />
              <Text style={ModernTheme.typography.caption}>Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[ModernStyles.card, styles.quickActionCard]}
              onPress={() => onNavigate('profile')}
            >
              <Icon name="user" size={20} color={ModernTheme.colors.purple} />
              <Text style={ModernTheme.typography.caption}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  userSection: {
    paddingHorizontal: ModernTheme.spacing.lg,
    paddingVertical: ModernTheme.spacing.xl,
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ModernTheme.spacing.lg,
  },
  userImage: {
    marginRight: ModernTheme.spacing.md,
  },
  userImageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ModernTheme.colors.primary,
  },
  userDetails: {
    flex: 1,
  },
  userId: {
    ...ModernTheme.typography.caption,
    marginBottom: ModernTheme.spacing.xs,
  },
  userName: {
    ...ModernTheme.typography.h3,
  },
  balanceSection: {
    alignItems: 'center',
    marginBottom: ModernTheme.spacing.lg,
  },
  mainBalance: {
    fontSize: 36,
    color: ModernTheme.colors.accent,
    marginBottom: ModernTheme.spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ModernTheme.spacing.xl,
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: ModernTheme.spacing.sm,
  },
  currenciesSection: {
    flexDirection: 'row',
    paddingHorizontal: ModernTheme.spacing.lg,
    marginBottom: ModernTheme.spacing.lg,
  },
  currencyCard: {
    flex: 1,
    marginHorizontal: ModernTheme.spacing.xs,
    alignItems: 'center',
    paddingVertical: ModernTheme.spacing.md,
    minHeight: 80,
    justifyContent: 'center',
  },
  activitySection: {
    paddingHorizontal: ModernTheme.spacing.lg,
    marginBottom: ModernTheme.spacing.lg,
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: ModernTheme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: ModernTheme.spacing.md,
  },
  activityIcon: {
    fontSize: 20,
  },
  activityDetails: {
    alignItems: 'flex-end',
  },
  quickActionsSection: {
    paddingHorizontal: ModernTheme.spacing.lg,
    marginBottom: ModernTheme.spacing.xl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: ModernTheme.spacing.lg,
    paddingHorizontal: ModernTheme.spacing.md,
    marginBottom: ModernTheme.spacing.md,
    minHeight: 80,
    justifyContent: 'center',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: ModernTheme.spacing.sm,
  },
});

export default ModernDashboardScreen;
