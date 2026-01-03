import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import { buildApiUrl, getEndpoint } from '../config/api';
import axios from 'axios';
import notifee, { AndroidImportance, AuthorizationStatus, TriggerType } from '@notifee/react-native';

class NotificationService {
  static STORAGE_KEY = 'borrowed_books_notifications';
  static NOTIFICATION_SETTINGS_KEY = 'notification_settings';
  static CHANNEL_ID = 'library-notifications';
  static permissionGranted = false;

  // Initialize push notifications - request permission and create channel
  static async initializePushNotifications() {
    try {
      // Request permission
      const permissionStatus = await this.requestPermission();
      this.permissionGranted = permissionStatus;

      // Create notification channel for Android
      await this.createNotificationChannel();

      return permissionStatus;
    } catch (error) {
      return false;
    }
  }

  // Request notification permission
  static async requestPermission() {
    try {
      // For Android 13+ (API 33+), request POST_NOTIFICATIONS permission
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'SMC Library needs notification permission to remind you about book due dates.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Allow',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }

      // For notifee permission
      const settings = await notifee.requestPermission();
      return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
    } catch (error) {
      return false;
    }
  }

  // Check if notifications are permitted
  static async checkPermission() {
    try {
      const settings = await notifee.getNotificationSettings();
      return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
    } catch (error) {
      return false;
    }
  }

  // Create Android notification channel
  static async createNotificationChannel() {
    try {
      await notifee.createChannel({
        id: this.CHANNEL_ID,
        name: 'Library Notifications',
        description: 'Notifications for book due dates and reminders',
        importance: AndroidImportance.HIGH,
        vibration: true,
        sound: 'default',
      });
    } catch (error) {
      // Channel creation failed silently
    }
  }

  // Display a push notification
  static async displayNotification(title, body, data = {}) {
    try {
      // Check permission first
      const hasPermission = await this.checkPermission();
      if (!hasPermission) {
        console.log('NotificationService: Permission not granted');
        return false;
      }

      // Ensure channel exists
      await this.createNotificationChannel();

      await notifee.displayNotification({
        title,
        body,
        data,
        android: {
          channelId: this.CHANNEL_ID,
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
          // Use ic_launcher which exists in all React Native apps
          // or omit smallIcon to let notifee use default
          smallIcon: 'ic_launcher',
          color: '#007bff',
        },
        ios: {
          sound: 'default',
        },
      });

      console.log('NotificationService: Notification displayed successfully');
      return true;
    } catch (error) {
      console.error('NotificationService: Error displaying notification:', error);
      return false;
    }
  }

  // Send a test notification
  static async sendTestNotification() {
    try {
      console.log('NotificationService: Starting test notification...');

      // First ensure we have permission
      const hasPermission = await this.checkPermission();
      console.log('NotificationService: Permission status:', hasPermission);

      if (!hasPermission) {
        // Request permission
        const granted = await this.requestPermission();
        console.log('NotificationService: Permission request result:', granted);
        if (!granted) {
          return {
            success: false,
            message: 'Notification permission denied. Please enable notifications in your device settings.',
            permissionDenied: true,
          };
        }
      }

      // Create channel if not exists
      console.log('NotificationService: Creating notification channel...');
      await this.createNotificationChannel();

      // Display test notification
      console.log('NotificationService: Displaying notification...');
      const success = await this.displayNotification(
        'SMC Library Test',
        'Push notifications are working! You will receive reminders for your borrowed books.',
        { type: 'test' }
      );

      console.log('NotificationService: Display result:', success);

      if (success) {
        return {
          success: true,
          message: 'Test notification sent successfully! Check your notification tray.',
        };
      } else {
        // Try to get more details about why it failed
        const settings = await notifee.getNotificationSettings();
        console.log('NotificationService: Settings:', JSON.stringify(settings));

        return {
          success: false,
          message: `Failed to display notification. Authorization: ${settings.authorizationStatus}. Try restarting the app.`,
        };
      }
    } catch (error) {
      console.error('NotificationService: Test notification error:', error);
      return {
        success: false,
        message: 'Error sending test notification: ' + (error.message || 'Unknown error'),
      };
    }
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

      // Initialize notifications if not done
      if (!this.permissionGranted) {
        await this.initializePushNotifications();
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
      // Silent fail
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
      await this.sendPushNotification(type, books);
    }

    // Send email notification
    if (settings.emailNotifications) {
      await this.sendEmailNotification(type, books, userData);
    }

    // Mark as sent
    await AsyncStorage.setItem(notificationKey, new Date().toISOString());
  }

  // Send real push notification
  static async sendPushNotification(type, books) {
    try {
      let title, body;

      switch (type) {
        case 'overdue':
          title = 'Overdue Books Alert';
          body = `You have ${books.length} overdue book(s)! Return them immediately to avoid penalties.`;
          break;
        case 'dueToday':
          title = 'Books Due Today';
          body = `You have ${books.length} book(s) due today! Please return them.`;
          break;
        case 'dueTomorrow':
          title = 'Books Due Tomorrow';
          body = `You have ${books.length} book(s) due tomorrow. Don't forget to return them!`;
          break;
        case 'dueSoon':
          title = 'Book Due Date Reminder';
          body = `You have ${books.length} book(s) due soon. Plan to return them on time.`;
          break;
        default:
          return;
      }

      await this.displayNotification(title, body, { type, bookCount: books.length });
    } catch (error) {
      // Silent fail for push notification
    }
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

      return response.ok;
    } catch (error) {
      return false;
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
        title = 'Overdue Books Alert';
        message = `You have ${books.length} overdue book(s)! Return them immediately to avoid penalties.`;
        break;
      case 'dueToday':
        title = 'Books Due Today';
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
      'Book Due Date Alert',
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
      'Book Due Date Reminder',
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
      // Also cancel all displayed notifications
      await notifee.cancelAllNotifications();
    } catch (error) {
      // Silent fail
    }
  }

  // Get notification status
  static async getNotificationStatus() {
    try {
      const lastNotificationDate = await AsyncStorage.getItem(this.STORAGE_KEY);
      const permissionStatus = await this.checkPermission();
      return {
        lastNotificationDate,
        permissionGranted: permissionStatus,
      };
    } catch (error) {
      return null;
    }
  }

  // Notification settings management - syncs with backend
  static async getNotificationSettings(idNumber = null) {
    try {
      // Try to get from backend first if user is logged in
      if (idNumber) {
        try {
          const response = await axios.get(
            buildApiUrl(getEndpoint('NOTIFICATIONS', 'GET_SETTINGS', idNumber))
          );
          if (response.data.success) {
            // Also save locally as cache
            await AsyncStorage.setItem(
              this.NOTIFICATION_SETTINGS_KEY,
              JSON.stringify(response.data.data)
            );
            return response.data.data;
          }
        } catch (apiError) {
          // Fall back to local storage if API fails
        }
      }

      // Fall back to local storage
      const settings = await AsyncStorage.getItem(this.NOTIFICATION_SETTINGS_KEY);
      if (settings) {
        return JSON.parse(settings);
      }

      // Default settings
      return {
        enabled: true,
        pushNotifications: true,
        emailNotifications: true,
        daysBefore: 3,
        reminderTiming: {
          oneDayBefore: true,
          dueToday: true,
          overdue: true
        }
      };
    } catch (error) {
      return {
        enabled: true,
        pushNotifications: true,
        emailNotifications: true,
        daysBefore: 3,
        reminderTiming: {
          oneDayBefore: true,
          dueToday: true,
          overdue: true
        }
      };
    }
  }

  static async updateNotificationSettings(settings, idNumber = null) {
    try {
      // Save locally first
      await AsyncStorage.setItem(this.NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));

      // Sync with backend if user is logged in
      if (idNumber) {
        try {
          await axios.put(
            buildApiUrl(getEndpoint('NOTIFICATIONS', 'UPDATE_SETTINGS', idNumber)),
            { settings }
          );
        } catch (apiError) {
          // Local save succeeded, backend sync can retry later
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  // Schedule future notifications using notifee triggers
  static async scheduleFutureNotifications(books, userData) {
    try {
      for (const book of books) {
        const dueDate = new Date(book.dueDate);
        const now = new Date();

        // Schedule notification for 1 day before due date
        const oneDayBefore = new Date(dueDate);
        oneDayBefore.setDate(oneDayBefore.getDate() - 1);
        oneDayBefore.setHours(9, 0, 0, 0); // 9 AM

        if (oneDayBefore > now) {
          await this.scheduleNotification(
            oneDayBefore,
            'Book Due Tomorrow',
            `"${book.title}" is due tomorrow!`,
            { bookId: book.id, type: 'due_tomorrow' }
          );
        }

        // Schedule notification for due date
        const dueDateNotif = new Date(dueDate);
        dueDateNotif.setHours(9, 0, 0, 0); // 9 AM

        if (dueDateNotif > now) {
          await this.scheduleNotification(
            dueDateNotif,
            'Book Due Today',
            `"${book.title}" is due today!`,
            { bookId: book.id, type: 'due_today' }
          );
        }
      }
    } catch (error) {
      // Silent fail for scheduling
    }
  }

  static async scheduleNotification(date, title, body, data = {}) {
    try {
      const trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: date.getTime(),
      };

      // Ensure channel exists
      await this.createNotificationChannel();

      await notifee.createTriggerNotification(
        {
          title,
          body,
          data,
          android: {
            channelId: this.CHANNEL_ID,
            importance: AndroidImportance.HIGH,
            pressAction: {
              id: 'default',
            },
            smallIcon: 'ic_launcher',
            color: '#007bff',
          },
          ios: {
            sound: 'default',
          },
        },
        trigger
      );

      return true;
    } catch (error) {
      console.error('NotificationService: Error scheduling notification:', error);
      return false;
    }
  }

  // Cancel all scheduled notifications
  static async cancelAllNotifications() {
    try {
      await notifee.cancelAllNotifications();
      // Also cancel triggers
      const triggers = await notifee.getTriggerNotificationIds();
      if (triggers.length > 0) {
        await notifee.cancelTriggerNotifications(triggers);
      }
    } catch (error) {
      // Silent fail
    }
  }

  // Get all scheduled notifications
  static async getScheduledNotifications() {
    try {
      return await notifee.getTriggerNotificationIds();
    } catch (error) {
      return [];
    }
  }

  // Open device notification settings
  static async openNotificationSettings() {
    try {
      await notifee.openNotificationSettings();
    } catch (error) {
      Alert.alert(
        'Settings',
        'Please go to your device Settings > Apps > SMC Library > Notifications to manage notification permissions.'
      );
    }
  }

  // Get push notification token (for future remote push)
  static async getPushToken() {
    try {
      return await AsyncStorage.getItem('push_token');
    } catch (error) {
      return null;
    }
  }
}

export default NotificationService;
