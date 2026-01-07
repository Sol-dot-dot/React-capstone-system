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
  TouchableOpacity,
  ActivityIndicator,
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
  const [borrowingHistory, setBorrowingHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedYears, setExpandedYears] = useState({});
  const [expandedSemesters, setExpandedSemesters] = useState({});

  useEffect(() => {
    loadProfileData();
    loadBorrowingHistory();
  }, []);

  // Refresh data when app comes back to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        loadProfileData();
        loadBorrowingHistory();
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

  const loadBorrowingHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await axios.get(
        buildApiUrl(getEndpoint('BORROWING', 'GET_USER_BORROWING_HISTORY', userData.idNumber))
      );

      if (response.data.success) {
        setBorrowingHistory(response.data.data);
        // Auto-expand the most recent year
        if (response.data.data.academicYears && response.data.data.academicYears.length > 0) {
          const firstYear = response.data.data.academicYears[0].academicYear;
          setExpandedYears({ [firstYear]: true });
        }
      }
    } catch (error) {
      // Silent fail for history loading
    } finally {
      setHistoryLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadProfileData(), loadBorrowingHistory()]);
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

  const getInitials = (firstName, lastName) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) return firstName.charAt(0).toUpperCase();
    return 'U';
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

  const getBookStatusColor = (status) => {
    switch (status) {
      case 'returned':
        return ModernTheme.colors.success;
      case 'returned_late':
        return ModernTheme.colors.warning;
      case 'borrowed':
        return ModernTheme.colors.primary;
      case 'overdue':
        return ModernTheme.colors.error;
      default:
        return ModernTheme.colors.textSecondary;
    }
  };

  const getBookStatusText = (status) => {
    switch (status) {
      case 'returned':
        return 'Returned';
      case 'returned_late':
        return 'Late Return';
      case 'borrowed':
        return 'Borrowed';
      case 'overdue':
        return 'Overdue';
      default:
        return status;
    }
  };

  const toggleYear = (year) => {
    setExpandedYears(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  const toggleSemester = (key) => {
    setExpandedSemesters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderBorrowingItem = (book) => (
    <View key={book.id} style={styles.bookItem}>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{book.bookTitle}</Text>
        <Text style={styles.bookAuthor}>{book.author}</Text>
        <Text style={styles.bookDates}>
          {formatDate(book.borrowedDate)} - {book.returnedDate ? formatDate(book.returnedDate) : 'Not returned'}
        </Text>
        {book.daysLate > 0 && (
          <Text style={styles.daysLate}>{book.daysLate} day(s) late</Text>
        )}
        {book.fineAmount > 0 && (
          <Text style={styles.fineText}>
            Fine: P{book.fineAmount.toFixed(2)}
            {book.paidAmount > 0 && ` (Paid: P${book.paidAmount.toFixed(2)})`}
          </Text>
        )}
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getBookStatusColor(book.status) + '20' }]}>
        <Text style={[styles.statusText, { color: getBookStatusColor(book.status) }]}>
          {getBookStatusText(book.status)}
        </Text>
      </View>
    </View>
  );

  const renderSemester = (semester, yearKey) => {
    const semesterKey = `${yearKey}-${semester.semesterNumber}`;
    const isExpanded = expandedSemesters[semesterKey];

    return (
      <View key={semesterKey} style={styles.semesterContainer}>
        <TouchableOpacity
          style={styles.semesterHeader}
          onPress={() => toggleSemester(semesterKey)}
          activeOpacity={0.7}
        >
          <View style={styles.semesterInfo}>
            <Text style={styles.semesterName}>{semester.semesterName}</Text>
            <Text style={styles.semesterCount}>{semester.booksCount} book(s)</Text>
          </View>
          <Icon
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={ModernTheme.colors.textSecondary}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.semesterBooks}>
            {semester.borrowings.map(book => renderBorrowingItem(book))}
          </View>
        )}
      </View>
    );
  };

  const renderAcademicYear = (year) => {
    const isExpanded = expandedYears[year.academicYear];

    return (
      <ModernCard key={year.academicYear} style={styles.yearCard}>
        <TouchableOpacity
          style={styles.yearHeader}
          onPress={() => toggleYear(year.academicYear)}
          activeOpacity={0.7}
        >
          <View style={styles.yearInfo}>
            <Icon name="school-outline" size={24} color={ModernTheme.colors.primary} />
            <View style={styles.yearTextContainer}>
              <Text style={styles.yearTitle}>A.Y. {year.academicYear}</Text>
              <Text style={styles.yearSubtitle}>{year.totalBooks} total book(s) borrowed</Text>
            </View>
          </View>
          <Icon
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={ModernTheme.colors.primary}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.yearContent}>
            {year.semesters.map(semester => renderSemester(semester, year.academicYear))}
          </View>
        )}
      </ModernCard>
    );
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
                <ModernBadge
                  text={getStatusText(userData.status || 'active')}
                  variant={userData.status === 'active' ? 'success' : 'warning'}
                  size="small"
                  style={styles.statusBadgeProfile}
                />
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

        {/* Library Statistics */}
        {borrowingHistory?.summary && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Library Statistics</Text>
            <ModernCard style={styles.statsCard}>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Icon name="book-outline" size={24} color={ModernTheme.colors.primary} />
                  <Text style={styles.statValue}>{borrowingHistory.summary.totalBorrowed}</Text>
                  <Text style={styles.statLabel}>Total Borrowed</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="checkmark-circle-outline" size={24} color={ModernTheme.colors.success} />
                  <Text style={styles.statValue}>{borrowingHistory.summary.totalReturned}</Text>
                  <Text style={styles.statLabel}>Returned</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="time-outline" size={24} color={ModernTheme.colors.warning} />
                  <Text style={styles.statValue}>{borrowingHistory.summary.currentlyBorrowed}</Text>
                  <Text style={styles.statLabel}>Currently</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="cash-outline" size={24} color={ModernTheme.colors.error} />
                  <Text style={styles.statValue}>P{borrowingHistory.summary.outstandingBalance.toFixed(0)}</Text>
                  <Text style={styles.statLabel}>Balance</Text>
                </View>
              </View>
            </ModernCard>
          </View>
        )}

        {/* Borrowing History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Borrowing History</Text>

          {historyLoading ? (
            <ModernCard style={styles.loadingCard}>
              <ActivityIndicator size="small" color={ModernTheme.colors.primary} />
              <Text style={styles.loadingText}>Loading history...</Text>
            </ModernCard>
          ) : borrowingHistory?.academicYears?.length > 0 ? (
            borrowingHistory.academicYears.map(year => renderAcademicYear(year))
          ) : (
            <ModernCard style={styles.emptyCard}>
              <Icon name="library-outline" size={48} color={ModernTheme.colors.textSecondary} />
              <Text style={styles.emptyText}>No borrowing history yet</Text>
              <Text style={styles.emptySubtext}>Your borrowed books will appear here</Text>
            </ModernCard>
          )}
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <ModernCard style={styles.settingsCard}>
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
            {profileData?.studentBarcode && (
              <View style={styles.accountItem}>
                <Text style={styles.accountLabel}>Barcode</Text>
                <Text style={styles.accountValue}>{profileData.studentBarcode}</Text>
              </View>
            )}
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>Email</Text>
              <Text style={styles.accountValue} numberOfLines={2} ellipsizeMode="middle">
                {profileData?.email || userData.email}
              </Text>
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
  statusBadgeProfile: {
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
  // History Section
  historySection: {
    marginBottom: ModernTheme.spacing.xl,
  },
  yearCard: {
    marginBottom: ModernTheme.spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  yearHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: ModernTheme.spacing.lg,
  },
  yearInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  yearTextContainer: {
    marginLeft: ModernTheme.spacing.md,
  },
  yearTitle: {
    ...ModernTheme.typography.bodyMedium,
    color: ModernTheme.colors.textPrimary,
    fontWeight: '600',
  },
  yearSubtitle: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
    marginTop: 2,
  },
  yearContent: {
    borderTopWidth: 1,
    borderTopColor: ModernTheme.colors.border,
  },
  semesterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: ModernTheme.colors.border,
  },
  semesterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ModernTheme.spacing.lg,
    paddingVertical: ModernTheme.spacing.md,
    backgroundColor: ModernTheme.colors.background,
  },
  semesterInfo: {
    flex: 1,
  },
  semesterName: {
    ...ModernTheme.typography.body,
    color: ModernTheme.colors.textPrimary,
    fontWeight: '500',
  },
  semesterCount: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
  },
  semesterBooks: {
    paddingHorizontal: ModernTheme.spacing.lg,
    paddingBottom: ModernTheme.spacing.md,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: ModernTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: ModernTheme.colors.border,
  },
  bookInfo: {
    flex: 1,
    marginRight: ModernTheme.spacing.md,
  },
  bookTitle: {
    ...ModernTheme.typography.bodyMedium,
    color: ModernTheme.colors.textPrimary,
    fontWeight: '500',
  },
  bookAuthor: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
    marginTop: 2,
  },
  bookDates: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
    marginTop: 4,
  },
  daysLate: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.error,
    marginTop: 2,
  },
  fineText: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.error,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: ModernTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: ModernTheme.borderRadius.sm,
  },
  statusText: {
    ...ModernTheme.typography.caption,
    fontWeight: '600',
  },
  loadingCard: {
    padding: ModernTheme.spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
    marginTop: ModernTheme.spacing.md,
  },
  emptyCard: {
    padding: ModernTheme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...ModernTheme.typography.bodyMedium,
    color: ModernTheme.colors.textSecondary,
    marginTop: ModernTheme.spacing.md,
  },
  emptySubtext: {
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
  // Logout Section
  logoutSection: {
    marginBottom: ModernTheme.spacing.xl,
  },
  logoutButton: {
    borderColor: ModernTheme.colors.error,
  },
});

export default ProfileScreen;
