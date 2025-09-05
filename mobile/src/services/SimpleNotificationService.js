import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

class SimpleNotificationService {
  static STORAGE_KEY = 'borrowed_books_notifications';
  static NOTIFICATION_SETTINGS_KEY = 'notification_settings';

  // Simple notification system without push notifications
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

  // Send email notification via backend
  static async sendEmailNotification(type, books, userData) {
    try {
      const reminderType = this.mapNotificationTypeToEmailType(type);
      
      const response = await fetch('http://10.0.2.2:5000/api/notifications/send-email', {
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
        console.log(`Email notification sent for ${type}`);
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
        pushNotifications: false, // Disabled for simple version
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
        pushNotifications: false,
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

  // Legacy method for backward compatibility
  static async checkAndShowNotifications(borrowedBooks) {
    return this.checkAndShowSmartNotifications(borrowedBooks, {});
  }

  // Initialize method (no-op for simple version)
  static initializePushNotifications() {
    console.log('Simple notification service initialized (no push notifications)');
  }

  // Schedule future notifications (no-op for simple version)
  static scheduleFutureNotifications(books, userData) {
    console.log('Scheduling not available in simple notification service');
  }

  // Cancel all notifications (no-op for simple version)
  static cancelAllNotifications() {
    console.log('Cancel notifications not available in simple notification service');
  }

  // Get push token (no-op for simple version)
  static async getPushToken() {
    return null;
  }
}

export default SimpleNotificationService;
