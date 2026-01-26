import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ModernTheme } from '../styles/ModernTheme';
import { ModernCard } from '../components/ui/ModernComponents';
import axios from 'axios';
import { buildApiUrl, getEndpoint } from '../config/api';

const BorrowingHistoryScreen = ({ userData, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [expandedYears, setExpandedYears] = useState({});
  const [expandedSemesters, setExpandedSemesters] = useState({});

  useEffect(() => {
    loadBorrowingHistory();
  }, []);

  const loadBorrowingHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        buildApiUrl(getEndpoint('BORROWING', 'GET_USER_BORROWING_HISTORY', userData.idNumber))
      );

      if (response.data.success) {
        setHistoryData(response.data.data);
        // Auto-expand the most recent year
        if (response.data.data.academicYears && response.data.data.academicYears.length > 0) {
          const firstYear = response.data.data.academicYears[0].academicYear;
          setExpandedYears({ [firstYear]: true });
        }
      }
    } catch (error) {
      console.error('Failed to load borrowing history:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBorrowingHistory();
    setRefreshing(false);
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

  const getStatusColor = (status) => {
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

  const getStatusText = (status) => {
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

  const getYearLevelLabel = (level) => {
    switch (level) {
      case 1:
        return '1st Year';
      case 2:
        return '2nd Year';
      case 3:
        return '3rd Year';
      case 4:
        return '4th Year';
      default:
        return `Year ${level}`;
    }
  };

  const renderBorrowingItem = (book) => (
    <View key={book.id} style={styles.bookItem}>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{book.bookTitle}</Text>
        <Text style={styles.bookAuthor}>{book.author}</Text>
        <View style={styles.bookDatesRow}>
          <View style={styles.dateItem}>
            <Icon name="calendar-outline" size={12} color={ModernTheme.colors.textSecondary} />
            <Text style={styles.dateText}>Borrowed: {formatDate(book.borrowedDate)}</Text>
          </View>
          <View style={styles.dateItem}>
            <Icon name="time-outline" size={12} color={ModernTheme.colors.textSecondary} />
            <Text style={styles.dateText}>Due: {formatDate(book.dueDate)}</Text>
          </View>
        </View>
        {book.returnedDate && (
          <View style={styles.dateItem}>
            <Icon name="checkmark-circle-outline" size={12} color={ModernTheme.colors.success} />
            <Text style={styles.dateText}>Returned: {formatDate(book.returnedDate)}</Text>
          </View>
        )}
        {book.daysLate > 0 && (
          <Text style={styles.daysLate}>{book.daysLate} day(s) late</Text>
        )}
        {book.fineAmount > 0 && (
          <View style={styles.fineRow}>
            <Icon name="cash-outline" size={12} color={ModernTheme.colors.error} />
            <Text style={styles.fineText}>
              Fine: P{book.fineAmount.toFixed(2)}
              {book.paidAmount > 0 && ` (Paid: P${book.paidAmount.toFixed(2)})`}
            </Text>
          </View>
        )}
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(book.status) + '20' }]}>
        <Text style={[styles.statusText, { color: getStatusColor(book.status) }]}>
          {getStatusText(book.status)}
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
          <View style={styles.semesterLeft}>
            <View style={[styles.semesterIcon, { backgroundColor: ModernTheme.colors.primary + '20' }]}>
              <Icon name="book-outline" size={16} color={ModernTheme.colors.primary} />
            </View>
            <View style={styles.semesterInfo}>
              <Text style={styles.semesterName}>{semester.semesterName}</Text>
              <Text style={styles.semesterCount}>{semester.booksCount} book(s) borrowed</Text>
            </View>
          </View>
          <Icon
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={ModernTheme.colors.textSecondary}
          />
        </TouchableOpacity>

        {isExpanded && semester.borrowings && semester.borrowings.length > 0 && (
          <View style={styles.semesterBooks}>
            {semester.borrowings.map(book => renderBorrowingItem(book))}
          </View>
        )}
      </View>
    );
  };

  const renderAcademicYear = (year) => {
    const isExpanded = expandedYears[year.academicYear];
    // Filter to only show semesters with data
    const semestersWithData = year.semesters.filter(sem => sem.booksCount > 0);

    return (
      <ModernCard key={year.academicYear} style={styles.yearCard}>
        <TouchableOpacity
          style={styles.yearHeader}
          onPress={() => toggleYear(year.academicYear)}
          activeOpacity={0.7}
        >
          <View style={styles.yearLeft}>
            <View style={styles.yearIconContainer}>
              <Icon name="school-outline" size={24} color={ModernTheme.colors.primary} />
            </View>
            <View style={styles.yearInfo}>
              <Text style={styles.yearTitle}>
                {year.yearLevel ? `${getYearLevelLabel(year.yearLevel)} - ` : ''}A.Y. {year.academicYear}
              </Text>
              <Text style={styles.yearSubtitle}>
                {year.totalBooks} total book(s) borrowed
              </Text>
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
            {semestersWithData.map(semester => renderSemester(semester, year.academicYear))}
          </View>
        )}
      </ModernCard>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.backgroundGradient} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ModernTheme.colors.primary} />
          <Text style={styles.loadingText}>Loading borrowing history...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Icon name="arrow-back" size={24} color={ModernTheme.colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Borrowing History</Text>
            <Text style={styles.headerSubtitle}>Your complete library record</Text>
          </View>
          <View style={styles.headerSpacer} />
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
        {/* Academic Years - Only show years/semesters with data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic History</Text>

          {historyData?.academicYears?.filter(year => year.totalBooks > 0).length > 0 ? (
            historyData.academicYears
              .filter(year => year.totalBooks > 0)
              .map(year => renderAcademicYear(year))
          ) : (
            <ModernCard style={styles.emptyCard}>
              <Icon name="library-outline" size={48} color={ModernTheme.colors.textSecondary} />
              <Text style={styles.emptyText}>No borrowing history yet</Text>
              <Text style={styles.emptySubtext}>Your borrowed books will appear here organized by academic year</Text>
            </ModernCard>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...ModernTheme.typography.body,
    color: ModernTheme.colors.textSecondary,
    marginTop: ModernTheme.spacing.md,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ModernTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...ModernTheme.shadows.small,
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
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: ModernTheme.spacing.lg,
    paddingBottom: 120,
  },
  section: {
    marginBottom: ModernTheme.spacing.xl,
  },
  sectionTitle: {
    ...ModernTheme.typography.h3,
    color: ModernTheme.colors.textPrimary,
    marginBottom: ModernTheme.spacing.md,
  },
  // Year Card
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
  yearLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  yearIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: ModernTheme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ModernTheme.spacing.md,
  },
  yearInfo: {
    flex: 1,
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
  // Semester
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
  semesterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  semesterIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ModernTheme.spacing.md,
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
    backgroundColor: ModernTheme.colors.surface,
  },
  // Book Item
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
  bookDatesRow: {
    marginTop: ModernTheme.spacing.sm,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
    marginLeft: 4,
  },
  daysLate: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.error,
    marginTop: 4,
  },
  fineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  fineText: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.error,
    marginLeft: 4,
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
  // Empty State
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
    textAlign: 'center',
  },
});

export default BorrowingHistoryScreen;
