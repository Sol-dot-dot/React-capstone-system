import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Avatar,
  Badge,
  Surface,
  Chip,
  Divider,
  List,
  IconButton,
} from 'react-native-paper';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {
  MaterialIcons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const UltraModernBorrowedBooksScreen = ({ userData, onBack }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [borrowedBooks, setBorrowedBooks] = useState([
    {
      id: 1,
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0-7432-7356-5',
      borrowDate: '2024-01-15',
      dueDate: '2024-02-15',
      status: 'active',
      coverImage: null,
      daysRemaining: 5,
    },
    {
      id: 2,
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '978-0-06-112008-4',
      borrowDate: '2024-01-20',
      dueDate: '2024-02-20',
      status: 'active',
      coverImage: null,
      daysRemaining: 10,
    },
    {
      id: 3,
      title: '1984',
      author: 'George Orwell',
      isbn: '978-0-452-28423-4',
      borrowDate: '2024-01-10',
      dueDate: '2024-02-10',
      status: 'overdue',
      coverImage: null,
      daysRemaining: -2,
    },
  ]);

  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const scaleAnim = useSharedValue(0.9);

  useEffect(() => {
    // Start animations
    fadeAnim.value = withTiming(1, { duration: 800 });
    slideAnim.value = withSpring(0, { damping: 15, stiffness: 150 });
    scaleAnim.value = withSpring(1, { damping: 12, stiffness: 100 });
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getStatusColor = (status, daysRemaining) => {
    if (status === 'overdue' || daysRemaining < 0) return '#EF4444';
    if (daysRemaining <= 3) return '#F59E0B';
    return '#10B981';
  };

  const getStatusText = (status, daysRemaining) => {
    if (status === 'overdue' || daysRemaining < 0) return 'Overdue';
    if (daysRemaining <= 3) return 'Due Soon';
    return 'Active';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [
        { translateY: slideAnim.value },
        { scale: scaleAnim.value },
      ],
    };
  });

  const BookCard = ({ book, index }) => {
    const cardAnim = useSharedValue(0);
    const cardSlide = useSharedValue(30);

    useEffect(() => {
      cardAnim.value = withDelay(index * 100, withTiming(1, { duration: 600 }));
      cardSlide.value = withDelay(index * 100, withSpring(0, { damping: 12 }));
    }, []);

    const cardAnimatedStyle = useAnimatedStyle(() => {
      return {
        opacity: cardAnim.value,
        transform: [{ translateX: cardSlide.value }],
      };
    });

    const statusColor = getStatusColor(book.status, book.daysRemaining);
    const statusText = getStatusText(book.status, book.daysRemaining);

    return (
      <Animated.View style={cardAnimatedStyle}>
        <Card style={styles.bookCard} elevation={3}>
          <Card.Content style={styles.bookCardContent}>
            <View style={styles.bookHeader}>
              <View style={styles.bookInfo}>
                <Title style={styles.bookTitle} numberOfLines={2}>
                  {book.title}
                </Title>
                <Paragraph style={styles.bookAuthor}>
                  by {book.author}
                </Paragraph>
                <Text style={styles.bookIsbn}>ISBN: {book.isbn}</Text>
              </View>
              <View style={styles.bookStatus}>
                <Chip
                  mode="outlined"
                  textStyle={{ color: statusColor, fontSize: 12 }}
                  style={[styles.statusChip, { borderColor: statusColor }]}
                >
                  {statusText}
                </Chip>
                <Text style={[styles.daysText, { color: statusColor }]}>
                  {book.daysRemaining < 0
                    ? `${Math.abs(book.daysRemaining)} days overdue`
                    : `${book.daysRemaining} days left`}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.bookDetails}>
              <View style={styles.detailRow}>
                <MaterialIcons name="event" size={16} color="#6B7280" />
                <Text style={styles.detailLabel}>Borrowed:</Text>
                <Text style={styles.detailValue}>{formatDate(book.borrowDate)}</Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons name="schedule" size={16} color="#6B7280" />
                <Text style={styles.detailLabel}>Due Date:</Text>
                <Text style={[styles.detailValue, { color: statusColor }]}>
                  {formatDate(book.dueDate)}
                </Text>
              </View>
            </View>

            <View style={styles.bookActions}>
              <Button
                mode="outlined"
                onPress={() => {}}
                style={styles.actionButton}
                contentStyle={styles.actionButtonContent}
                icon="book-open"
              >
                Read
              </Button>
              <Button
                mode="contained"
                onPress={() => {}}
                style={[styles.actionButton, { backgroundColor: statusColor }]}
                contentStyle={styles.actionButtonContent}
                icon="book-return"
              >
                Return
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const SummaryCard = () => {
    const totalBooks = borrowedBooks.length;
    const overdueBooks = borrowedBooks.filter(book => book.daysRemaining < 0).length;
    const dueSoonBooks = borrowedBooks.filter(book => book.daysRemaining <= 3 && book.daysRemaining >= 0).length;

    return (
      <Animated.View style={[animatedHeaderStyle, styles.summaryContainer]}>
        <Surface style={styles.summaryCard} elevation={4}>
          <Title style={styles.summaryTitle}>Borrowing Summary</Title>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalBooks}</Text>
              <Text style={styles.summaryLabel}>Total Books</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#EF4444' }]}>{overdueBooks}</Text>
              <Text style={styles.summaryLabel}>Overdue</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>{dueSoonBooks}</Text>
              <Text style={styles.summaryLabel}>Due Soon</Text>
            </View>
          </View>
        </Surface>
      </Animated.View>
    );
  };

  return (
    <PaperProvider theme={MD3LightTheme}>
      <View style={styles.container}>
        {/* Header */}
        <Animated.View style={[styles.header, animatedHeaderStyle]}>
          <Surface style={styles.headerSurface} elevation={2}>
            <View style={styles.headerContent}>
              <IconButton
                icon="arrow-left"
                size={24}
                onPress={onBack}
                style={styles.backButton}
              />
              <View style={styles.headerText}>
                <Title style={styles.headerTitle}>My Borrowed Books</Title>
                <Paragraph style={styles.headerSubtitle}>
                  Manage your borrowed books
                </Paragraph>
              </View>
            </View>
          </Surface>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Card */}
          <SummaryCard />

          {/* Books List */}
          <View style={styles.booksContainer}>
            <Text style={styles.sectionTitle}>Your Books</Text>
            {borrowedBooks.map((book, index) => (
              <BookCard key={book.id} book={book} index={index} />
            ))}
          </View>

          {/* Empty State */}
          {borrowedBooks.length === 0 && (
            <Animated.View style={[animatedHeaderStyle, styles.emptyState]}>
              <MaterialCommunityIcons name="book-open-variant" size={80} color="#D1D5DB" />
              <Title style={styles.emptyTitle}>No Books Borrowed</Title>
              <Paragraph style={styles.emptySubtitle}>
                You haven't borrowed any books yet. Visit the library to get started!
              </Paragraph>
              <Button
                mode="contained"
                onPress={() => {}}
                style={styles.emptyButton}
                contentStyle={styles.emptyButtonContent}
                icon="book-plus"
              >
                Browse Books
              </Button>
            </Animated.View>
          )}
        </ScrollView>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerSurface: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    margin: 0,
  },
  headerText: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  summaryContainer: {
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  booksContainer: {
    marginBottom: 100,
  },
  bookCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
  },
  bookCardContent: {
    padding: 16,
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bookInfo: {
    flex: 1,
    marginRight: 12,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  bookIsbn: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  bookStatus: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: 4,
  },
  daysText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#E5E7EB',
  },
  bookDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  bookActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  actionButtonContent: {
    paddingVertical: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 12,
  },
  emptyButtonContent: {
    paddingVertical: 8,
  },
});

export default UltraModernBorrowedBooksScreen;
