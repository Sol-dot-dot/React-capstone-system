import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import { ModernTheme, ModernStyles } from '../styles/ModernTheme';

const ModernBorrowedBooksScreen = ({ userData, onBack }) => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://10.0.2.2:5000/api/borrowing/user/${userData.idNumber}`
      );

      if (response.data.success) {
        setBorrowedBooks(response.data.data.borrowedBooks || []);
      }
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBorrowedBooks();
    setRefreshing(false);
  };

  const getTotalBooks = () => {
    return borrowedBooks.length;
  };

  const getOverdueBooks = () => {
    return borrowedBooks.filter(book => book.dueStatus === 'overdue').length;
  };

  const getDueTodayBooks = () => {
    return borrowedBooks.filter(book => book.dueStatus === 'today').length;
  };

  const getDueTomorrowBooks = () => {
    return borrowedBooks.filter(book => book.dueStatus === 'tomorrow').length;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue':
        return ModernTheme.colors.error;
      case 'today':
        return ModernTheme.colors.warning;
      case 'tomorrow':
        return ModernTheme.colors.orange;
      case 'near':
        return ModernTheme.colors.blue;
      default:
        return ModernTheme.colors.success;
    }
  };

  const getStatusText = (status, daysUntilDue) => {
    switch (status) {
      case 'overdue':
        return `${Math.abs(daysUntilDue)} days overdue`;
      case 'today':
        return 'Due today';
      case 'tomorrow':
        return 'Due tomorrow';
      case 'near':
        return `${daysUntilDue} days left`;
      default:
        return 'Available';
    }
  };

  const categories = [
    {
      title: 'Overdue',
      count: getOverdueBooks(),
      amount: getOverdueBooks() * 5, // 5 pesos per day fine
      icon: '🚨',
      color: ModernTheme.colors.error,
    },
    {
      title: 'Due Today',
      count: getDueTodayBooks(),
      amount: 0,
      icon: '⚠️',
      color: ModernTheme.colors.warning,
    },
    {
      title: 'Due Soon',
      count: getDueTomorrowBooks(),
      amount: 0,
      icon: '📚',
      color: ModernTheme.colors.blue,
    },
  ];

  if (loading) {
    return (
      <View style={[ModernStyles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={ModernTheme.colors.accent} />
        <Text style={ModernTheme.typography.caption}>Loading your books...</Text>
      </View>
    );
  }

  return (
    <View style={ModernStyles.container}>
      {/* Header */}
      <View style={ModernStyles.header}>
        <TouchableOpacity style={ModernStyles.headerButton} onPress={onBack}>
          <Text style={ModernStyles.buttonText}>←</Text>
        </TouchableOpacity>
        <Text style={ModernStyles.headerTitle}>Week 2-11 October</Text>
        <TouchableOpacity style={ModernStyles.headerButton}>
          <Text style={ModernStyles.buttonText}>📅</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Total Books Section */}
        <View style={[ModernStyles.statCard, styles.totalSection]}>
          <Text style={ModernTheme.typography.caption}>Total Books Borrowed</Text>
          <Text style={[ModernStyles.statValue, { color: ModernTheme.colors.accent }]}>
            {getTotalBooks()}.00
          </Text>
        </View>

        {/* Chart Placeholder */}
        <View style={[ModernStyles.card, styles.chartContainer]}>
          <View style={styles.chartBars}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <View key={day} style={styles.chartBar}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: Math.random() * 60 + 20,
                      backgroundColor: index === 2 || index === 4 ? ModernTheme.colors.success : ModernTheme.colors.surfaceLight
                    }
                  ]} 
                />
                <Text style={ModernTheme.typography.small}>{day}</Text>
              </View>
            ))}
          </View>
          <View style={styles.chartLimit}>
            <View style={styles.limitLine} />
            <View style={styles.limitCircle}>
              <Text style={ModernTheme.typography.small}>3</Text>
            </View>
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.categoriesHeader}>
          <Text style={ModernTheme.typography.h3}>Category</Text>
          <TouchableOpacity>
            <Text style={ModernTheme.typography.caption}>🔍</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <View key={index} style={[styles.categoryCard, { backgroundColor: category.color + '20' }]}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[ModernTheme.typography.body, { color: category.color }]}>
                  {category.amount.toFixed(2)}
                </Text>
              </View>
              <Text style={[ModernTheme.typography.caption, { color: category.color }]}>
                {category.count} books
              </Text>
              <Text style={[ModernTheme.typography.small, { color: category.color }]}>
                {category.title}
              </Text>
            </View>
          ))}
        </View>

        {/* Books List */}
        <View style={styles.booksSection}>
          <Text style={ModernTheme.typography.h3}>Your Borrowed Books</Text>
          {borrowedBooks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={ModernTheme.typography.body}>No books borrowed yet</Text>
              <Text style={ModernTheme.typography.caption}>
                Visit the library to borrow some books!
              </Text>
            </View>
          ) : (
            borrowedBooks.map((book, index) => (
              <View key={index} style={ModernStyles.listItem}>
                <View style={[ModernStyles.listItemIcon, { backgroundColor: getStatusColor(book.dueStatus) + '20' }]}>
                  <Text style={styles.bookIcon}>📖</Text>
                </View>
                <View style={ModernStyles.listItemContent}>
                  <Text style={ModernStyles.listItemTitle}>{book.title}</Text>
                  <Text style={ModernStyles.listItemSubtitle}>
                    by {book.author}
                  </Text>
                  <Text style={[ModernTheme.typography.small, { color: getStatusColor(book.dueStatus) }]}>
                    {getStatusText(book.dueStatus, book.daysUntilDue)}
                  </Text>
                </View>
                <View style={styles.bookStatus}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(book.dueStatus) }]} />
                </View>
              </View>
            ))
          )}
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
  totalSection: {
    marginHorizontal: ModernTheme.spacing.lg,
    marginTop: ModernTheme.spacing.lg,
  },
  chartContainer: {
    marginHorizontal: ModernTheme.spacing.lg,
    marginTop: ModernTheme.spacing.md,
    height: 120,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 80,
    marginBottom: ModernTheme.spacing.sm,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    marginBottom: ModernTheme.spacing.xs,
  },
  chartLimit: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  limitLine: {
    width: 30,
    height: 1,
    backgroundColor: ModernTheme.colors.border,
    borderStyle: 'dashed',
  },
  limitCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: ModernTheme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: ModernTheme.spacing.xs,
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ModernTheme.spacing.lg,
    marginTop: ModernTheme.spacing.lg,
    marginBottom: ModernTheme.spacing.md,
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: ModernTheme.spacing.lg,
    marginBottom: ModernTheme.spacing.lg,
  },
  categoryCard: {
    flex: 1,
    marginHorizontal: ModernTheme.spacing.xs,
    borderRadius: ModernTheme.borderRadius.lg,
    padding: ModernTheme.spacing.md,
    ...ModernTheme.shadows.card,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ModernTheme.spacing.xs,
  },
  categoryIcon: {
    fontSize: 20,
  },
  booksSection: {
    paddingHorizontal: ModernTheme.spacing.lg,
    marginBottom: ModernTheme.spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: ModernTheme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: ModernTheme.spacing.md,
  },
  bookIcon: {
    fontSize: 20,
  },
  bookStatus: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default ModernBorrowedBooksScreen;
