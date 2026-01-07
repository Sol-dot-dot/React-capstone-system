import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  RefreshControl,
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

const BorrowedBooksScreen = ({ userData, onBack }) => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Recommendations state
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [expandedBookId, setExpandedBookId] = useState(null);

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
      // Silent fail for borrowed books loading
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBorrowedBooks();
    setRefreshing(false);
  };

  const mapDatabaseStatusToAvailability = (book) => {
    // Just use the status directly from database
    const status = book.status;
    
    // Simple mapping - just capitalize the first letter
    if (status === 'available') {
      return 'Available';
    } else if (status === 'borrowed') {
      return 'Borrowed';
    } else if (status === 'maintenance') {
      return 'Maintenance';
    } else {
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    }
  };

  const getPersonalizedRecommendations = async () => {
    if (!userData?.idNumber) {
      return;
    }

    try {
      setLoadingRecommendations(true);
      const response = await axios.post(buildApiUrl(getEndpoint('CHATBOT', 'PERSONALIZED')), {
        studentIdNumber: userData.idNumber,
        limit: 6 // Show 6 recommendations
      });

      if (response.data.success) {
        // Map database status to mobile app availability
        const booksWithAvailability = (response.data.data.books || []).map(book => ({
          ...book,
          availability: mapDatabaseStatusToAvailability(book)
        }));
        setRecommendedBooks(booksWithAvailability);
        setShowRecommendations(true);
      }
    } catch (error) {
      // Silent fail for recommendations loading
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const getBookStatus = (book) => {
    // Use the dueStatus from backend if available
    if (book.dueStatus) {
      switch (book.dueStatus) {
        case 'overdue':
          return { 
            status: 'overdue', 
            color: ModernTheme.colors.error, 
            text: `${book.daysUntilDue} day${book.daysUntilDue !== 1 ? 's' : ''} overdue`,
            days: book.daysUntilDue
          };
        case 'today':
          return { 
            status: 'due-soon', 
            color: ModernTheme.colors.warning, 
            text: 'Due today',
            days: 0
          };
        case 'tomorrow':
          return { 
            status: 'due-soon', 
            color: ModernTheme.colors.warning, 
            text: 'Due tomorrow',
            days: 1
          };
        case 'near':
          return { 
            status: 'due-soon', 
            color: ModernTheme.colors.warning, 
            text: `${book.daysUntilDue} days left`,
            days: book.daysUntilDue
          };
        default:
          return { 
            status: 'active', 
            color: ModernTheme.colors.success, 
            text: 'Active',
            days: book.daysUntilDue
          };
      }
    }
    
    // Fallback calculation
    const today = new Date();
    const due = new Date(book.due_date || book.dueDate);
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

  const getDueSoonBooks = () => {
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

  const getActiveBooks = () => {
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
    return borrowedBooks.filter(book => {
      const dueDate = new Date(book.due_date || book.dueDate);
      return dueDate > threeDaysFromNow;
    });
  };

  const renderBookCard = (book, index) => {
    const status = getBookStatus(book);
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
        <ModernCard style={styles.bookCard}>
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

  const toggleBookExpansion = (bookId) => {
    setExpandedBookId(expandedBookId === bookId ? null : bookId);
  };

  const renderRecommendedBook = (book, index) => {
    const isExpanded = expandedBookId === book.id;

    return (
      <Animatable.View
        key={book.id || index}
        animation="fadeInUp"
        duration={600}
        delay={index * 100}
        style={styles.recommendedBookCard}
      >
        <ModernCard style={styles.recommendedBook}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => toggleBookExpansion(book.id)}
          >
            <View style={styles.recommendedBookHeader}>
              <View style={styles.recommendedBookInfo}>
                <Text style={styles.recommendedBookTitle} numberOfLines={isExpanded ? undefined : 2}>
                  {book.title}
                </Text>
                <Text style={styles.recommendedBookAuthor} numberOfLines={1}>
                  by {book.author}
                </Text>
                {book.category && (
                  <Text style={styles.recommendedBookGenre}>{book.category}</Text>
                )}
              </View>
              <Icon
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={ModernTheme.colors.textSecondary}
              />
            </View>

            {book.description && (
              <Text style={styles.recommendedBookDescription} numberOfLines={isExpanded ? undefined : 2}>
                {book.description}
              </Text>
            )}

            <View style={styles.recommendedBookFooter}>
              <View style={styles.recommendedBookMeta}>
                <Icon name="library-outline" size={14} color={ModernTheme.colors.textTertiary} />
                <Text style={styles.recommendedBookCode}>Code: {book.number_code || book.isbn}</Text>
              </View>
              {book.availability && (
                <ModernBadge
                  text={book.availability}
                  variant={
                    book.status === 'available' ? 'success' :
                    book.status === 'borrowed' ? 'warning' :
                    'error'
                  }
                  size="small"
                />
              )}
            </View>
          </TouchableOpacity>

          {/* Expanded Details */}
          {isExpanded && (
            <Animatable.View
              animation="fadeIn"
              duration={300}
              style={styles.expandedDetails}
            >
              <View style={styles.expandedDivider} />

              <Text style={styles.expandedSectionTitle}>Book Details</Text>

              <View style={styles.expandedGrid}>
                {book.isbn && (
                  <View style={styles.expandedItem}>
                    <Icon name="barcode-outline" size={16} color={ModernTheme.colors.primary} />
                    <View style={styles.expandedItemText}>
                      <Text style={styles.expandedLabel}>ISBN</Text>
                      <Text style={styles.expandedValue}>{book.isbn}</Text>
                    </View>
                  </View>
                )}

                {book.publisher && (
                  <View style={styles.expandedItem}>
                    <Icon name="business-outline" size={16} color={ModernTheme.colors.primary} />
                    <View style={styles.expandedItemText}>
                      <Text style={styles.expandedLabel}>Publisher</Text>
                      <Text style={styles.expandedValue} numberOfLines={2}>{book.publisher}</Text>
                    </View>
                  </View>
                )}

                {book.publication_year && (
                  <View style={styles.expandedItem}>
                    <Icon name="calendar-outline" size={16} color={ModernTheme.colors.primary} />
                    <View style={styles.expandedItemText}>
                      <Text style={styles.expandedLabel}>Year</Text>
                      <Text style={styles.expandedValue}>{book.publication_year}</Text>
                    </View>
                  </View>
                )}

                {book.pages && (
                  <View style={styles.expandedItem}>
                    <Icon name="document-text-outline" size={16} color={ModernTheme.colors.primary} />
                    <View style={styles.expandedItemText}>
                      <Text style={styles.expandedLabel}>Pages</Text>
                      <Text style={styles.expandedValue}>{book.pages}</Text>
                    </View>
                  </View>
                )}

                {book.category && (
                  <View style={styles.expandedItem}>
                    <Icon name="pricetag-outline" size={16} color={ModernTheme.colors.primary} />
                    <View style={styles.expandedItemText}>
                      <Text style={styles.expandedLabel}>Category</Text>
                      <Text style={styles.expandedValue}>{book.category}</Text>
                    </View>
                  </View>
                )}

                {(book.available_copies !== undefined || book.book_copies !== undefined) && (
                  <View style={styles.expandedItem}>
                    <Icon name="copy-outline" size={16} color={ModernTheme.colors.primary} />
                    <View style={styles.expandedItemText}>
                      <Text style={styles.expandedLabel}>Copies</Text>
                      <Text style={styles.expandedValue}>
                        {book.available_copies !== undefined ? book.available_copies : '?'} / {book.book_copies || '?'} available
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {book.status === 'available' && (
                <View style={styles.availableHint}>
                  <Icon name="checkmark-circle" size={16} color={ModernTheme.colors.success} />
                  <Text style={styles.availableHintText}>
                    This book is available! Visit the library to borrow it.
                  </Text>
                </View>
              )}
            </Animatable.View>
          )}
        </ModernCard>
      </Animatable.View>
    );
  };

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

        {/* Recommended Books Section - Always visible */}
        <Animatable.View
          animation="fadeInUp"
          duration={600}
          delay={borrowedBooks.length === 0 ? 200 : 400}
          style={styles.recommendationsSection}
        >
          <View style={styles.recommendationsHeader}>
            <View style={styles.recommendationsTitleContainer}>
              <Icon name="sparkles-outline" size={20} color={ModernTheme.colors.primary} />
              <Text style={styles.recommendationsTitle}>Recommended for You</Text>
            </View>
            <Text style={styles.recommendationsSubtitle}>
              {borrowedBooks.length > 0
                ? 'Based on your reading history and patterns'
                : 'Discover books you might enjoy'}
            </Text>
          </View>

          {!showRecommendations ? (
            <TouchableOpacity
              style={styles.getRecommendationsButton}
              onPress={getPersonalizedRecommendations}
              disabled={loadingRecommendations}
            >
              {loadingRecommendations ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Icon name="book-outline" size={16} color="#ffffff" />
                  <Text style={styles.getRecommendationsButtonText}>
                    Get Smart Recommendations
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.recommendedBooksContainer}>
              {recommendedBooks.length > 0 ? (
                recommendedBooks.map((book, index) => renderRecommendedBook(book, index))
              ) : (
                <View style={styles.noRecommendationsContainer}>
                  <Icon name="book-outline" size={32} color={ModernTheme.colors.textMuted} />
                  <Text style={styles.noRecommendationsText}>
                    No recommendations available at the moment.
                  </Text>
                </View>
              )}
            </View>
          )}
        </Animatable.View>
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
  // Recommendations Section Styles
  recommendationsSection: {
    marginTop: ModernTheme.spacing.xl,
    marginBottom: ModernTheme.spacing.xl,
  },
  recommendationsHeader: {
    marginBottom: ModernTheme.spacing.lg,
  },
  recommendationsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ModernTheme.spacing.xs,
  },
  recommendationsTitle: {
    ...ModernTheme.typography.h3,
    color: ModernTheme.colors.textPrimary,
    marginLeft: ModernTheme.spacing.sm,
    fontWeight: '600',
  },
  recommendationsSubtitle: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
  },
  getRecommendationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ModernTheme.colors.primary,
    paddingVertical: ModernTheme.spacing.md,
    paddingHorizontal: ModernTheme.spacing.lg,
    borderRadius: ModernTheme.borderRadius.lg,
    ...ModernTheme.shadows.button,
  },
  getRecommendationsButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: ModernTheme.spacing.sm,
  },
  recommendedBooksContainer: {
    marginTop: ModernTheme.spacing.md,
  },
  recommendedBookCard: {
    marginBottom: ModernTheme.spacing.md,
  },
  recommendedBook: {
    padding: ModernTheme.spacing.lg,
  },
  recommendedBookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ModernTheme.spacing.md,
  },
  recommendedBookInfo: {
    flex: 1,
    marginRight: ModernTheme.spacing.md,
  },
  recommendedBookTitle: {
    ...ModernTheme.typography.bodyMedium,
    color: ModernTheme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: ModernTheme.spacing.xs,
  },
  recommendedBookAuthor: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
    marginBottom: ModernTheme.spacing.xs,
  },
  recommendedBookGenre: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.primary,
    fontSize: 11,
    fontWeight: '500',
  },
  recommendedBookDescription: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: ModernTheme.spacing.md,
  },
  recommendedBookFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendedBookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendedBookCode: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textTertiary,
    marginLeft: ModernTheme.spacing.xs,
    fontSize: 11,
  },
  noRecommendationsContainer: {
    alignItems: 'center',
    paddingVertical: ModernTheme.spacing.xl,
  },
  noRecommendationsText: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
    marginTop: ModernTheme.spacing.sm,
    textAlign: 'center',
  },
  // Expanded Book Details Styles
  expandedDetails: {
    marginTop: ModernTheme.spacing.md,
  },
  expandedDivider: {
    height: 1,
    backgroundColor: ModernTheme.colors.border,
    marginBottom: ModernTheme.spacing.md,
  },
  expandedSectionTitle: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: ModernTheme.spacing.md,
  },
  expandedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -ModernTheme.spacing.xs,
  },
  expandedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '50%',
    paddingHorizontal: ModernTheme.spacing.xs,
    marginBottom: ModernTheme.spacing.md,
  },
  expandedItemText: {
    marginLeft: ModernTheme.spacing.sm,
    flex: 1,
  },
  expandedLabel: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  expandedValue: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textPrimary,
    fontWeight: '500',
    marginTop: 2,
  },
  availableHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ModernTheme.colors.success + '15',
    padding: ModernTheme.spacing.md,
    borderRadius: ModernTheme.borderRadius.md,
    marginTop: ModernTheme.spacing.sm,
  },
  availableHintText: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.success,
    marginLeft: ModernTheme.spacing.sm,
    flex: 1,
    fontWeight: '500',
  },
});

export default BorrowedBooksScreen;
