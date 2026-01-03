import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import NotificationService from '../services/NotificationService';
import { buildApiUrl } from '../config/api';

const DAYS_BEFORE_OPTIONS = [1, 2, 3, 5, 7];

const NotificationSettingsScreen = ({ userData, onBack }) => {
  const [settings, setSettings] = useState({
    enabled: true,
    pushNotifications: true,
    emailNotifications: true,
    daysBefore: 3,
    reminderTiming: {
      oneDayBefore: true,
      dueToday: true,
      overdue: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPermissionStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const idNumber = userData?.idNumber || userData?.id_number;
      const currentSettings = await NotificationService.getNotificationSettings(idNumber);
      setSettings(currentSettings);
    } catch (error) {
      // Silent fail for settings loading
    } finally {
      setLoading(false);
    }
  };

  const checkPermissionStatus = async () => {
    const hasPermission = await NotificationService.checkPermission();
    setPermissionGranted(hasPermission);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const idNumber = userData?.idNumber || userData?.id_number;
      const success = await NotificationService.updateNotificationSettings(settings, idNumber);
      if (success) {
        Alert.alert('Success', 'Notification settings saved and synced');
      } else {
        Alert.alert('Error', 'Failed to update notification settings');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const testPushNotification = async () => {
    setTesting(true);
    try {
      // Send a real push notification using notifee
      const result = await NotificationService.sendTestNotification();

      if (result.success) {
        Alert.alert(
          'Push Notification Sent!',
          result.message + '\n\nCheck your notification tray to see the notification.'
        );
        // Update permission status
        setPermissionGranted(true);
      } else {
        if (result.permissionDenied) {
          Alert.alert(
            'Permission Required',
            result.message,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => NotificationService.openNotificationSettings()
              }
            ]
          );
        } else {
          Alert.alert('Test Failed', result.message);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification: ' + error.message);
    } finally {
      setTesting(false);
    }
  };

  const testEmailNotification = async () => {
    setTesting(true);
    try {
      // Get user email
      const userEmail = userData?.email;
      const firstName = userData?.firstName || userData?.first_name;
      const idNumber = userData?.idNumber || userData?.id_number;

      if (!userEmail) {
        Alert.alert('Error', 'No email address found. Please make sure you are logged in.');
        setTesting(false);
        return;
      }

      // Send test email directly to the user
      const response = await fetch(buildApiUrl('/api/notifications/test-email'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          firstName: firstName,
          idNumber: idNumber
        }),
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert(
          'Test Email Sent!',
          `A test email has been sent to:\n${userEmail}\n\nPlease check your inbox (and spam folder) to verify email notifications are working.`
        );
      } else {
        Alert.alert(
          'Email Failed',
          result.message || 'Failed to send test email. Please check the server configuration.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Connection Issue',
        'Could not connect to the server. Make sure the backend is running.'
      );
    } finally {
      setTesting(false);
    }
  };

  const requestPermission = async () => {
    const granted = await NotificationService.requestPermission();
    setPermissionGranted(granted);
    if (granted) {
      Alert.alert('Permission Granted', 'You can now receive push notifications!');
    } else {
      Alert.alert(
        'Permission Required',
        'Notification permission was denied. You can enable it in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => NotificationService.openNotificationSettings()
          }
        ]
      );
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateReminderTiming = (timing, value) => {
    setSettings(prev => ({
      ...prev,
      reminderTiming: {
        ...prev.reminderTiming,
        [timing]: value
      }
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notification Settings</Text>
      </View>

      <View style={styles.content}>
        {/* Permission Status */}
        <View style={[styles.permissionSection, permissionGranted ? styles.permissionGranted : styles.permissionDenied]}>
          <View style={styles.permissionHeader}>
            <Text style={styles.permissionIcon}>{permissionGranted ? 'ON' : 'OFF'}</Text>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionTitle}>
                {permissionGranted ? 'Notifications Enabled' : 'Notifications Disabled'}
              </Text>
              <Text style={styles.permissionDescription}>
                {permissionGranted
                  ? 'You will receive push notifications on this device'
                  : 'Enable notifications to receive due date reminders'}
              </Text>
            </View>
          </View>
          {!permissionGranted && (
            <TouchableOpacity style={styles.enableButton} onPress={requestPermission}>
              <Text style={styles.enableButtonText}>Enable Notifications</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Main Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Settings</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Notifications</Text>
              <Text style={styles.settingDescription}>
                Turn on/off all library notifications
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={(value) => updateSetting('enabled', value)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={settings.enabled ? '#007bff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications on your device
              </Text>
            </View>
            <Switch
              value={settings.pushNotifications && settings.enabled}
              onValueChange={(value) => updateSetting('pushNotifications', value)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={settings.pushNotifications && settings.enabled ? '#007bff' : '#f4f3f4'}
              disabled={!settings.enabled}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Email Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive email reminders for due dates
              </Text>
            </View>
            <Switch
              value={settings.emailNotifications && settings.enabled}
              onValueChange={(value) => updateSetting('emailNotifications', value)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={settings.emailNotifications && settings.enabled ? '#007bff' : '#f4f3f4'}
              disabled={!settings.enabled}
            />
          </View>
        </View>

        {/* Reminder Days Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder Days</Text>
          <Text style={styles.sectionDescription}>
            How many days before due date should we remind you?
          </Text>

          <View style={styles.daysContainer}>
            {DAYS_BEFORE_OPTIONS.map((days) => (
              <TouchableOpacity
                key={days}
                style={[
                  styles.dayOption,
                  settings.daysBefore === days && styles.dayOptionSelected,
                  !settings.enabled && styles.dayOptionDisabled
                ]}
                onPress={() => settings.enabled && updateSetting('daysBefore', days)}
                disabled={!settings.enabled}
              >
                <Text style={[
                  styles.dayOptionText,
                  settings.daysBefore === days && styles.dayOptionTextSelected
                ]}>
                  {days} {days === 1 ? 'day' : 'days'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reminder Timing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          <Text style={styles.sectionDescription}>
            Choose which notifications you want to receive
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>1 Day Before Due</Text>
              <Text style={styles.settingDescription}>
                Get reminded 1 day before your book is due
              </Text>
            </View>
            <Switch
              value={settings.reminderTiming.oneDayBefore && settings.enabled}
              onValueChange={(value) => updateReminderTiming('oneDayBefore', value)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={settings.reminderTiming.oneDayBefore && settings.enabled ? '#007bff' : '#f4f3f4'}
              disabled={!settings.enabled}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Due Today</Text>
              <Text style={styles.settingDescription}>
                Get reminded when your book is due today
              </Text>
            </View>
            <Switch
              value={settings.reminderTiming.dueToday && settings.enabled}
              onValueChange={(value) => updateReminderTiming('dueToday', value)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={settings.reminderTiming.dueToday && settings.enabled ? '#007bff' : '#f4f3f4'}
              disabled={!settings.enabled}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Overdue Books</Text>
              <Text style={styles.settingDescription}>
                Get reminded when your books are overdue
              </Text>
            </View>
            <Switch
              value={settings.reminderTiming.overdue && settings.enabled}
              onValueChange={(value) => updateReminderTiming('overdue', value)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={settings.reminderTiming.overdue && settings.enabled ? '#007bff' : '#f4f3f4'}
              disabled={!settings.enabled}
            />
          </View>
        </View>

        {/* Test Notification Section */}
        <View style={styles.testSection}>
          <Text style={styles.testTitle}>Test Notifications</Text>
          <Text style={styles.testDescription}>
            Test if push and email notifications are working properly.
          </Text>

          <View style={styles.testButtonsContainer}>
            <TouchableOpacity
              style={[styles.testButton, testing && styles.testButtonDisabled]}
              onPress={testPushNotification}
              disabled={testing}
            >
              {testing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.testButtonText}>Test Push</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, styles.testButtonEmail, testing && styles.testButtonDisabled]}
              onPress={testEmailNotification}
              disabled={testing}
            >
              {testing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.testButtonText}>Test Email</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About Notifications</Text>
          <Text style={styles.infoText}>
            • Push notifications appear in your device's notification tray
          </Text>
          <Text style={styles.infoText}>
            • Email notifications are sent to your registered email
          </Text>
          <Text style={styles.infoText}>
            • Notifications help you avoid overdue fines
          </Text>
          <Text style={styles.infoText}>
            • Make sure to allow notifications in device settings
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={saveSettings}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save Settings</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    fontSize: 16,
    color: '#007bff',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 20,
  },
  permissionSection: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  permissionGranted: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  permissionDenied: {
    backgroundColor: '#fff3e0',
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  permissionDescription: {
    fontSize: 13,
    color: '#666',
  },
  enableButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  enableButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 3,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  infoSection: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 5,
  },
  testSection: {
    backgroundColor: '#fff3e0',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 10,
  },
  testDescription: {
    fontSize: 14,
    color: '#e65100',
    marginBottom: 15,
  },
  testButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  testButton: {
    flex: 1,
    backgroundColor: '#ff9800',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonEmail: {
    backgroundColor: '#2196f3',
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  dayOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  dayOptionSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007bff',
  },
  dayOptionDisabled: {
    opacity: 0.5,
  },
  dayOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  dayOptionTextSelected: {
    color: '#007bff',
    fontWeight: '600',
  },
});

export default NotificationSettingsScreen;
