import React, { useState, useEffect } from 'react';
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

const BorrowedBooksScreen = ({ userData, onBack }) => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBorrowedBooks();
  }, []);

  const loadBorrowedBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        buildApiUrl(getEndpoint('BORROWING', 'GET_USER_BORROWED_BOOKS', userData.idNumber))
      );

      if (response.data.success) {
        setBorrowedBooks(response.data.data.borrowedBooks || []);
      }
    } catch (error) {
      console.error('Error loading borrowed books:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBorrowedBooks();
    setRefreshing(false);
  };

  const getBookStatus = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { 
        status: 'overdue', 
        color: ModernTheme.colors.error, 
        text: `${Math.abs(diffDays)} days overdue`,
        days: Math.abs(diffDays)
      };
    } else if (diffDays <= 3) {
      return { 
        status: 'due-soon', 
        color: ModernTheme.colors.warning, 
        text: diffDays === 0 ? 'Due today' : diffDays === 1 ? 'Due tomorrow' : `${diffDays} days left`,
        days: diffDays
      };
    } else {
      return { 
        status: 'active', 
        color: ModernTheme.colors.success, 
        text: 'Active',
        days: diffDays
      };
    }
  };

  const getOverdueBooks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    return borrowedBooks.filter(book => {
      const dueDate = new Date(book.due_date || book.dueDate);
      dueDate.setHours(0, 0, 0, 0); // Start of due date
      
      // Debug logging
      console.log('BorrowedBooks Overdue check:', {
        bookTitle: book.title,
        dueDate: book.due_date || book.dueDate,
        parsedDueDate: dueDate.toISOString(),
        today: today.toISOString(),
        isOverdue: dueDate < today
      });
      
      return dueDate < today; // Only books past their due date
    });
  };

  const getDueSoonBooks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
    threeDaysFromNow.setHours(23, 59, 59, 999); // End of 3 days from now
    
    return borrowedBooks.filter(book => {
      const dueDate = new Date(book.due_date || book.dueDate);
      dueDate.setHours(0, 0, 0, 0); // Start of due date
      
      // Debug logging
      console.log('BorrowedBooks Due soon check:', {
        bookTitle: book.title,
        dueDate: book.due_date || book.dueDate,
        parsedDueDate: dueDate.toISOString(),
        today: today.toISOString(),
        threeDaysFromNow: threeDaysFromNow.toISOString(),
        isDueSoon: dueDate >= today && dueDate <= threeDaysFromNow
      });
      
      return dueDate >= today && dueDate <= threeDaysFromNow; // Books due today through 3 days
    });
  };

  const getActiveBooks = () => {
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
    return borrowedBooks.filter(book => {
      const dueDate = new Date(book.due_date || book.dueDate);
      return dueDate > threeDaysFromNow;
    });
  };

  const renderBookCard = (book, index) => {
    const status = getBookStatus(book.due_date || book.dueDate);
    const dueDate = new Date(book.due_date || book.dueDate);
    const borrowDate = new Date(book.borrowed_date || book.borrowDate);

    return (
      <Animatable.View
        key={book.id}
        animation="fadeInUp"
        duration={600}
        delay={index * 100}
        style={styles.bookCardContainer}
      >
        <ModernCard style={[
          styles.bookCard,
          status.status === 'overdue' && styles.overdueCard
        ]}>
          <View style={styles.bookHeader}>
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle} numberOfLines={2}>
                {book.title}
              </Text>
              <Text style={styles.bookAuthor} numberOfLines={1}>
                by {book.author}
              </Text>
            </View>
            <ModernBadge
              text={status.text}
              variant={status.status === 'overdue' ? 'error' : status.status === 'due-soon' ? 'warning' : 'success'}
              size="small"
            />
          </View>

          <View style={styles.bookDetails}>
            <View style={styles.detailItem}>
              <Icon name="calendar-outline" size={16} color={ModernTheme.colors.textTertiary} />
              <Text style={styles.detailText}>
                Borrowed: {borrowDate.toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="time-outline" size={16} color={ModernTheme.colors.textTertiary} />
              <Text style={styles.detailText}>
                Due: {dueDate.toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="library-outline" size={16} color={ModernTheme.colors.textTertiary} />
              <Text style={styles.detailText}>
                Code: {book.number_code || book.isbn}
              </Text>
            </View>
          </View>

          {status.status === 'overdue' && (
            <View style={styles.overdueWarning}>
              <Icon name="warning-outline" size={20} color={ModernTheme.colors.error} />
              <Text style={styles.overdueText}>
                This book is overdue. Please return it as soon as possible.
              </Text>
            </View>
          )}
          
          {status.status === 'due-soon' && (
            <View style={styles.dueSoonWarning}>
              <Icon name="time-outline" size={20} color={ModernTheme.colors.warning} />
              <Text style={styles.dueSoonText}>
                This book is due soon. Consider returning it early.
              </Text>
            </View>
          )}
        </ModernCard>
      </Animatable.View>
    );
  };

  const renderEmptyState = () => (
    <Animatable.View
      animation="fadeIn"
      duration={600}
      style={styles.emptyState}
    >
      <View style={styles.emptyIcon}>
        <Icon name="library-outline" size={64} color={ModernTheme.colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No Borrowed Books</Text>
      <Text style={styles.emptySubtitle}>
        You haven't borrowed any books yet.{'\n'}Visit the library to start borrowing!
      </Text>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />

      {/* Header */}
      <Animatable.View
        animation="fadeInDown"
        duration={600}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <ModernButton
            title="←"
            onPress={onBack}
            variant="outline"
            size="small"
            style={styles.backButton}
          />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>My Borrowed Books</Text>
            <Text style={styles.headerSubtitle}>
              {borrowedBooks.length} book{borrowedBooks.length !== 1 ? 's' : ''} borrowed
            </Text>
          </View>
        </View>
      </Animatable.View>

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
        {borrowedBooks.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Summary Cards */}
            <Animatable.View
              animation="fadeInUp"
              duration={600}
              delay={200}
              style={styles.summaryContainer}
            >
              <View style={styles.summaryGrid}>
                <ModernCard style={[styles.summaryCard, { borderLeftColor: ModernTheme.colors.error, borderLeftWidth: 4 }]}>
                  <View style={styles.summaryContent}>
                    <Icon name="warning-outline" size={24} color={ModernTheme.colors.error} />
                    <View style={styles.summaryText}>
                      <Text style={styles.summaryValue}>{getOverdueBooks().length}</Text>
                      <Text style={styles.summaryLabel}>Overdue</Text>
                      {getOverdueBooks().length > 0 && (
                        <Text style={styles.summarySubtext}>
                          {Math.max(...getOverdueBooks().map(book => {
                            const dueDate = new Date(book.due_date || book.dueDate);
                            const today = new Date();
                            return Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
                          }))} days max
                        </Text>
                      )}
                    </View>
                  </View>
                </ModernCard>

                <ModernCard style={[styles.summaryCard, { borderLeftColor: ModernTheme.colors.warning, borderLeftWidth: 4 }]}>
                  <View style={styles.summaryContent}>
                    <Icon name="time-outline" size={24} color={ModernTheme.colors.warning} />
                    <View style={styles.summaryText}>
                      <Text style={styles.summaryValue}>{getDueSoonBooks().length}</Text>
                      <Text style={styles.summaryLabel}>Due Soon</Text>
                    </View>
                  </View>
                </ModernCard>
              </View>
            </Animatable.View>

            {/* Books List */}
            <View style={styles.booksContainer}>
              {borrowedBooks.map((book, index) => renderBookCard(book, index))}
            </View>
          </>
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
  header: {
    paddingHorizontal: ModernTheme.spacing.lg,
    paddingTop: 60,
    paddingBottom: ModernTheme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 0,
    marginRight: ModernTheme.spacing.md,
  },
  headerText: {
    flex: 1,
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
  summaryContainer: {
    marginBottom: ModernTheme.spacing.xl,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    padding: ModernTheme.spacing.lg,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    marginLeft: ModernTheme.spacing.md,
  },
  summaryValue: {
    ...ModernTheme.typography.h2,
    color: ModernTheme.colors.textPrimary,
  },
  summaryLabel: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
  },
  summarySubtext: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textTertiary,
    fontSize: 10,
    marginTop: 2,
  },
  booksContainer: {
    marginBottom: ModernTheme.spacing.xl,
  },
  bookCardContainer: {
    marginBottom: ModernTheme.spacing.md,
  },
  bookCard: {
    padding: ModernTheme.spacing.lg,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: ModernTheme.colors.error,
    backgroundColor: ModernTheme.colors.error + '05',
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ModernTheme.spacing.md,
  },
  bookInfo: {
    flex: 1,
    marginRight: ModernTheme.spacing.md,
  },
  bookTitle: {
    ...ModernTheme.typography.bodyMedium,
    color: ModernTheme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: ModernTheme.spacing.xs,
  },
  bookAuthor: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
  },
  bookDetails: {
    marginBottom: ModernTheme.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ModernTheme.spacing.xs,
  },
  detailText: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
    marginLeft: ModernTheme.spacing.sm,
  },
  overdueWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ModernTheme.colors.error + '10',
    padding: ModernTheme.spacing.md,
    borderRadius: ModernTheme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: ModernTheme.colors.error,
  },
  overdueText: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.error,
    marginLeft: ModernTheme.spacing.sm,
    flex: 1,
  },
  dueSoonWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ModernTheme.colors.warning + '10',
    padding: ModernTheme.spacing.md,
    borderRadius: ModernTheme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: ModernTheme.colors.warning,
  },
  dueSoonText: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.warning,
    marginLeft: ModernTheme.spacing.sm,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ModernTheme.spacing.xxl,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: ModernTheme.colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ModernTheme.spacing.lg,
  },
  emptyTitle: {
    ...ModernTheme.typography.h3,
    color: ModernTheme.colors.textPrimary,
    marginBottom: ModernTheme.spacing.sm,
  },
  emptySubtitle: {
    ...ModernTheme.typography.body,
    color: ModernTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: ModernTheme.spacing.lg,
  },
});

export default BorrowedBooksScreen;
