import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import NotificationService from '../services/NotificationService';

const BorrowedBooksScreen = ({ userData, onBack }) => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);

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
        setBorrowedBooks(response.data.data.borrowedBooks);
        checkDueDateNotifications(response.data.data.borrowedBooks);
        // Also check for smart notifications using the enhanced service
        await NotificationService.checkAndShowSmartNotifications(response.data.data.borrowedBooks, userData);
      }
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to fetch borrowed books'
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBorrowedBooks();
    setRefreshing(false);
  };

  const checkDueDateNotifications = (books) => {
    const newNotifications = [];
    
    books.forEach(book => {
      if (book.dueStatus === 'overdue') {
        newNotifications.push({
          type: 'overdue',
          message: `Book "${book.title}" is overdue by ${book.daysUntilDue} day(s)`,
          bookTitle: book.title,
          daysOverdue: book.daysUntilDue
        });
      } else if (book.dueStatus === 'today') {
        newNotifications.push({
          type: 'today',
          message: `Book "${book.title}" is due today!`,
          bookTitle: book.title
        });
      } else if (book.dueStatus === 'tomorrow') {
        newNotifications.push({
          type: 'tomorrow',
          message: `Book "${book.title}" is due tomorrow`,
          bookTitle: book.title
        });
      } else if (book.dueStatus === 'near') {
        newNotifications.push({
          type: 'near',
          message: `Book "${book.title}" is due in ${book.daysUntilDue} days`,
          bookTitle: book.title,
          daysUntilDue: book.daysUntilDue
        });
      }
    });

    setNotifications(newNotifications);
    
    // Show alerts for urgent notifications
    newNotifications.forEach(notification => {
      if (notification.type === 'overdue' || notification.type === 'today') {
        Alert.alert(
          'Due Date Alert',
          notification.message,
          [{ text: 'OK' }]
        );
      }
    });
  };

  const getStatusColor = (dueStatus) => {
    switch (dueStatus) {
      case 'overdue':
        return '#dc3545'; // Red
      case 'today':
        return '#ffc107'; // Yellow
      case 'tomorrow':
        return '#fd7e14'; // Orange
      case 'near':
        return '#17a2b8'; // Blue
      default:
        return '#28a745'; // Green
    }
  };

  const getStatusText = (dueStatus, daysUntilDue) => {
    switch (dueStatus) {
      case 'overdue':
        return `Overdue by ${daysUntilDue} day(s)`;
      case 'today':
        return 'Due Today';
      case 'tomorrow':
        return 'Due Tomorrow';
      case 'near':
        return `Due in ${daysUntilDue} days`;
      default:
        return 'On Time';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderBookCard = (book) => (
    <View key={book.id} style={styles.bookCard}>
      <View style={styles.bookHeader}>
        <Text style={styles.bookTitle}>{book.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(book.dueStatus) }]}>
          <Text style={styles.statusText}>
            {getStatusText(book.dueStatus, book.daysUntilDue)}
          </Text>
        </View>
      </View>
      
      <View style={styles.bookDetails}>
        <Text style={styles.bookAuthor}>Author: {book.author}</Text>
        <Text style={styles.bookCode}>Code: {book.number_code}</Text>
        <Text style={styles.borrowedDate}>
          Borrowed: {formatDate(book.borrowed_at)}
        </Text>
        <Text style={styles.dueDate}>
          Due Date: {formatDate(book.due_date)}
        </Text>
      </View>
    </View>
  );

  const renderNotificationCard = (notification, index) => (
    <View key={index} style={[styles.notificationCard, { borderLeftColor: getStatusColor(notification.type) }]}>
      <Text style={styles.notificationText}>{notification.message}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading borrowed books...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Borrowed Books</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifications.length > 0 && (
          <View style={styles.notificationsSection}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            {notifications.map((notification, index) => 
              renderNotificationCard(notification, index)
            )}
          </View>
        )}

        <View style={styles.booksSection}>
          <Text style={styles.sectionTitle}>
            Borrowed Books ({borrowedBooks.length})
          </Text>
          
          {borrowedBooks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                You don't have any borrowed books at the moment.
              </Text>
            </View>
          ) : (
            borrowedBooks.map(renderBookCard)
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007bff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  notificationsSection: {
    margin: 15,
  },
  booksSection: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  notificationCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  notificationText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  bookCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bookDetails: {
    gap: 5,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
  },
  bookCode: {
    fontSize: 14,
    color: '#666',
  },
  borrowedDate: {
    fontSize: 14,
    color: '#666',
  },
  dueDate: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default BorrowedBooksScreen;
