import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { buildApiUrl } from '../config/api';

// Push notifications will be implemented in a future version
// For now, we use a simple notification service without push notifications

class NotificationService {
  static STORAGE_KEY = 'borrowed_books_notifications';
  static NOTIFICATION_SETTINGS_KEY = 'notification_settings';

  // Initialize notifications (simplified version without push notifications)
  static initializePushNotifications() {
    // Notification service initialized - using email notifications for reliability
  }

  // Smart notification system with push notifications and email
  static async checkAndShowSmartNotifications(borrowedBooks, userData) {
    try {
      const settings = await this.getNotificationSettings();
      const today = new Date().toDateString();
      
      // Check if notifications are enabled
      if (!settings.enabled) {
        return;
      }

      // Group books by notification type
      const notifications = this.categorizeBooksForNotifications(borrowedBooks);
      
      // Process each notification type
      for (const [type, books] of Object.entries(notifications)) {
        if (books.length > 0) {
          await this.processNotificationType(type, books, userData, settings);
        }
      }

      // Store today's date to prevent multiple notifications
      await AsyncStorage.setItem(this.STORAGE_KEY, today);
    } catch (error) {
      console.error('Error checking smart notifications:', error);
    }
  }

  // Categorize books based on due date status
  static categorizeBooksForNotifications(borrowedBooks) {
    const notifications = {
      overdue: [],
      dueToday: [],
      dueTomorrow: [],
      dueSoon: []
    };

    borrowedBooks.forEach(book => {
      switch (book.dueStatus) {
        case 'overdue':
          notifications.overdue.push(book);
          break;
        case 'today':
          notifications.dueToday.push(book);
          break;
        case 'tomorrow':
          notifications.dueTomorrow.push(book);
          break;
        case 'near':
          notifications.dueSoon.push(book);
          break;
      }
    });

    return notifications;
  }

  // Process notifications for a specific type
  static async processNotificationType(type, books, userData, settings) {
    const notificationKey = `${type}_${new Date().toDateString()}`;
    const lastSent = await AsyncStorage.getItem(notificationKey);
    
    // Don't send the same type of notification twice in one day
    if (lastSent) {
      return;
    }

    // Send push notification
    if (settings.pushNotifications) {
      this.sendPushNotification(type, books);
    }

    // Send email notification
    if (settings.emailNotifications) {
      await this.sendEmailNotification(type, books, userData);
    }

    // Show in-app alert for urgent notifications
    if (type === 'overdue' || type === 'dueToday') {
      this.showInAppAlert(type, books);
    }

    // Mark as sent
    await AsyncStorage.setItem(notificationKey, new Date().toISOString());
  }

  // Send push notification (simplified - will be implemented in future version)
  static sendPushNotification(type, books) {
    // Push notifications will be implemented in a future version
    // Currently using email notifications for reliability
  }

  // Send email notification via backend
  static async sendEmailNotification(type, books, userData) {
    try {
      const reminderType = this.mapNotificationTypeToEmailType(type);
      
      const response = await fetch(buildApiUrl('/api/notifications/send-email'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          userData: userData,
          books: books,
          reminderType: reminderType
        })
      });

      if (response.ok) {
        // Email notification sent successfully
      } else {
        console.error('Failed to send email notification');
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  // Map notification type to email reminder type
  static mapNotificationTypeToEmailType(type) {
    switch (type) {
      case 'overdue':
        return 'overdue';
      case 'dueToday':
        return 'due_today';
      case 'dueTomorrow':
        return '1_day_before';
      case 'dueSoon':
        return '1_day_before';
      default:
        return '1_day_before';
    }
  }

  // Show in-app alert for urgent notifications
  static showInAppAlert(type, books) {
    let title, message;

    switch (type) {
      case 'overdue':
        title = '🚨 Overdue Books Alert';
        message = `You have ${books.length} overdue book(s)! Return them immediately to avoid penalties.`;
        break;
      case 'dueToday':
        title = '⚠️ Books Due Today';
        message = `You have ${books.length} book(s) due today! Please return them.`;
        break;
    }

    Alert.alert(
      title,
      message,
      [
        { text: 'View Books', style: 'default' },
        { text: 'Later', style: 'cancel' }
      ]
    );
  }

  // Legacy method for backward compatibility
  static async checkAndShowNotifications(borrowedBooks) {
    // This method is kept for backward compatibility
    // It will be replaced by checkAndShowSmartNotifications
    return this.checkAndShowSmartNotifications(borrowedBooks, {});
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

  // Notification settings management
  static async getNotificationSettings() {
    try {
      const settings = await AsyncStorage.getItem(this.NOTIFICATION_SETTINGS_KEY);
      if (settings) {
        return JSON.parse(settings);
      }
      // Default settings
      return {
        enabled: true,
        pushNotifications: true,
        emailNotifications: true,
        reminderTiming: {
          oneDayBefore: true,
          dueToday: true,
          overdue: true
        }
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return {
        enabled: true,
        pushNotifications: true,
        emailNotifications: true,
        reminderTiming: {
          oneDayBefore: true,
          dueToday: true,
          overdue: true
        }
      };
    }
  }

  static async updateNotificationSettings(settings) {
    try {
      await AsyncStorage.setItem(this.NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  }

  // Schedule future notifications
  static scheduleFutureNotifications(books, userData) {
    books.forEach(book => {
      const dueDate = new Date(book.dueDate);
      const now = new Date();
      
      // Schedule notification for 1 day before due date
      const oneDayBefore = new Date(dueDate);
      oneDayBefore.setDate(oneDayBefore.getDate() - 1);
      
      if (oneDayBefore > now) {
        this.scheduleNotification(
          oneDayBefore,
          '📚 Book Due Tomorrow',
          `"${book.title}" is due tomorrow!`,
          book
        );
      }

      // Schedule notification for due date
      if (dueDate > now) {
        this.scheduleNotification(
          dueDate,
          '⚠️ Book Due Today',
          `"${book.title}" is due today!`,
          book
        );
      }
    });
  }

  static scheduleNotification(date, title, message, book) {
    // Scheduled notifications will be implemented in a future version
    // Currently using email notifications for reliability
  }

  // Cancel all scheduled notifications
  static cancelAllNotifications() {
    // Cancel notifications will be implemented in a future version
  }

  // Get push notification token
  static async getPushToken() {
    try {
      return await AsyncStorage.getItem('push_token');
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }
}

export default NotificationService;
