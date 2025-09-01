import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

class NotificationService {
  static STORAGE_KEY = 'borrowed_books_notifications';

  // Check if we should show notifications for borrowed books
  static async checkAndShowNotifications(borrowedBooks) {
    try {
      const lastNotificationDate = await AsyncStorage.getItem(this.STORAGE_KEY);
      const today = new Date().toDateString();
      
      // Only show notifications once per day
      if (lastNotificationDate === today) {
        return;
      }

      const urgentBooks = borrowedBooks.filter(book => 
        book.dueStatus === 'overdue' || book.dueStatus === 'today'
      );

      const nearDueBooks = borrowedBooks.filter(book => 
        book.dueStatus === 'tomorrow' || book.dueStatus === 'near'
      );

      if (urgentBooks.length > 0) {
        this.showUrgentNotification(urgentBooks);
      } else if (nearDueBooks.length > 0) {
        this.showNearDueNotification(nearDueBooks);
      }

      // Store today's date to prevent multiple notifications
      await AsyncStorage.setItem(this.STORAGE_KEY, today);
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  }

  static showUrgentNotification(books) {
    const overdueBooks = books.filter(book => book.dueStatus === 'overdue');
    const todayBooks = books.filter(book => book.dueStatus === 'today');

    let message = '';
    if (overdueBooks.length > 0 && todayBooks.length > 0) {
      message = `You have ${overdueBooks.length} overdue book(s) and ${todayBooks.length} book(s) due today!`;
    } else if (overdueBooks.length > 0) {
      message = `You have ${overdueBooks.length} overdue book(s)!`;
    } else if (todayBooks.length > 0) {
      message = `You have ${todayBooks.length} book(s) due today!`;
    }

    Alert.alert(
      '📚 Book Due Date Alert',
      message,
      [
        { text: 'View Books', style: 'default' },
        { text: 'Later', style: 'cancel' }
      ]
    );
  }

  static showNearDueNotification(books) {
    const tomorrowBooks = books.filter(book => book.dueStatus === 'tomorrow');
    const nearBooks = books.filter(book => book.dueStatus === 'near');

    let message = '';
    if (tomorrowBooks.length > 0 && nearBooks.length > 0) {
      message = `You have ${tomorrowBooks.length} book(s) due tomorrow and ${nearBooks.length} book(s) due soon.`;
    } else if (tomorrowBooks.length > 0) {
      message = `You have ${tomorrowBooks.length} book(s) due tomorrow.`;
    } else if (nearBooks.length > 0) {
      message = `You have ${nearBooks.length} book(s) due soon.`;
    }

    Alert.alert(
      '📖 Book Due Date Reminder',
      message,
      [
        { text: 'View Books', style: 'default' },
        { text: 'Later', style: 'cancel' }
      ]
    );
  }

  // Clear notification history (useful for testing)
  static async clearNotificationHistory() {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing notification history:', error);
    }
  }

  // Get notification status
  static async getNotificationStatus() {
    try {
      const lastNotificationDate = await AsyncStorage.getItem(this.STORAGE_KEY);
      return lastNotificationDate;
    } catch (error) {
      console.error('Error getting notification status:', error);
      return null;
    }
  }
}

export default NotificationService;
