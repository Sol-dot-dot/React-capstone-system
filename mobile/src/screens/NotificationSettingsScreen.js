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
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ModernTheme } from '../styles/ModernTheme';
import { ModernCard, ModernButton } from '../components/ui/ModernComponents';
import NotificationService from '../services/NotificationService';
import { buildApiUrl } from '../config/api';

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
      const result = await NotificationService.sendTestNotification();

      if (result.success) {
        Alert.alert(
          'Push Notification Sent!',
          result.message + '\n\nCheck your notification tray to see the notification.'
        );
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
      const userEmail = userData?.email;
      const firstName = userData?.firstName || userData?.first_name;
      const idNumber = userData?.idNumber || userData?.id_number;

      if (!userEmail) {
        Alert.alert('Error', 'No email address found. Please make sure you are logged in.');
        setTesting(false);
        return;
      }

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
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.backgroundGradient} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ModernTheme.colors.primary} />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Icon name="arrow-back" size={24} color={ModernTheme.colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Notification Settings</Text>
            <Text style={styles.headerSubtitle}>Manage your notifications</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Settings</Text>
          <ModernCard style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Icon name="notifications-outline" size={20} color={ModernTheme.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Enable Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Turn on/off all library notifications
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={(value) => updateSetting('enabled', value)}
                trackColor={{ false: '#E0E0E0', true: ModernTheme.colors.primary + '50' }}
                thumbColor={settings.enabled ? ModernTheme.colors.primary : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Icon name="phone-portrait-outline" size={20} color={ModernTheme.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Receive notifications on your device
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.pushNotifications && settings.enabled}
                onValueChange={(value) => updateSetting('pushNotifications', value)}
                trackColor={{ false: '#E0E0E0', true: ModernTheme.colors.primary + '50' }}
                thumbColor={settings.pushNotifications && settings.enabled ? ModernTheme.colors.primary : '#f4f3f4'}
                disabled={!settings.enabled}
              />
            </View>

            <View style={[styles.settingRow, styles.settingRowLast]}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Icon name="mail-outline" size={20} color={ModernTheme.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Email Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Receive email reminders for due dates
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.emailNotifications && settings.enabled}
                onValueChange={(value) => updateSetting('emailNotifications', value)}
                trackColor={{ false: '#E0E0E0', true: ModernTheme.colors.primary + '50' }}
                thumbColor={settings.emailNotifications && settings.enabled ? ModernTheme.colors.primary : '#f4f3f4'}
                disabled={!settings.enabled}
              />
            </View>
          </ModernCard>
        </View>

        {/* Notification Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          <ModernCard style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Icon name="today-outline" size={20} color={ModernTheme.colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Due Today</Text>
                  <Text style={styles.settingDescription}>
                    Get reminded when your book is due today
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.reminderTiming.dueToday && settings.enabled}
                onValueChange={(value) => updateReminderTiming('dueToday', value)}
                trackColor={{ false: '#E0E0E0', true: ModernTheme.colors.primary + '50' }}
                thumbColor={settings.reminderTiming.dueToday && settings.enabled ? ModernTheme.colors.primary : '#f4f3f4'}
                disabled={!settings.enabled}
              />
            </View>

            <View style={[styles.settingRow, styles.settingRowLast]}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Icon name="alert-circle-outline" size={20} color={ModernTheme.colors.error} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Overdue Books</Text>
                  <Text style={styles.settingDescription}>
                    Get reminded when your books are overdue
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.reminderTiming.overdue && settings.enabled}
                onValueChange={(value) => updateReminderTiming('overdue', value)}
                trackColor={{ false: '#E0E0E0', true: ModernTheme.colors.primary + '50' }}
                thumbColor={settings.reminderTiming.overdue && settings.enabled ? ModernTheme.colors.primary : '#f4f3f4'}
                disabled={!settings.enabled}
              />
            </View>
          </ModernCard>
        </View>

        {/* Test Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Notifications</Text>
          <ModernCard style={styles.testCard}>
            <Text style={styles.testDescription}>
              Test if push and email notifications are working properly.
            </Text>
            <View style={styles.testButtonsContainer}>
              <ModernButton
                title={testing ? '' : 'Test Push'}
                onPress={testPushNotification}
                variant="primary"
                size="medium"
                disabled={testing}
                style={styles.testButton}
                icon={testing ? <ActivityIndicator color="white" size="small" /> : <Icon name="notifications" size={18} color="white" />}
              />
              <ModernButton
                title={testing ? '' : 'Test Email'}
                onPress={testEmailNotification}
                variant="outline"
                size="medium"
                disabled={testing}
                style={styles.testButton}
                icon={testing ? <ActivityIndicator color={ModernTheme.colors.primary} size="small" /> : <Icon name="mail" size={18} color={ModernTheme.colors.primary} />}
              />
            </View>
          </ModernCard>
        </View>

        {/* Save Button */}
        <View style={styles.saveSection}>
          <ModernButton
            title={saving ? 'Saving...' : 'Save Settings'}
            onPress={saveSettings}
            variant="primary"
            size="large"
            disabled={saving}
            icon={saving ? <ActivityIndicator color="white" size="small" /> : null}
            style={styles.saveButton}
          />
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...ModernTheme.typography.body,
    color: ModernTheme.colors.textSecondary,
    marginTop: ModernTheme.spacing.md,
  },
  header: {
    paddingHorizontal: ModernTheme.spacing.lg,
    paddingTop: 60,
    paddingBottom: ModernTheme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ModernTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...ModernTheme.shadows.small,
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
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
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: ModernTheme.spacing.lg,
    paddingBottom: 120,
  },
  section: {
    marginBottom: ModernTheme.spacing.xl,
  },
  sectionTitle: {
    ...ModernTheme.typography.h3,
    color: ModernTheme.colors.textPrimary,
    marginBottom: ModernTheme.spacing.md,
  },
  // Settings Card
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: ModernTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: ModernTheme.colors.border,
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: ModernTheme.spacing.md,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ModernTheme.colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ModernTheme.spacing.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    ...ModernTheme.typography.bodyMedium,
    color: ModernTheme.colors.textPrimary,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
  },
  // Test Card
  testCard: {
    padding: ModernTheme.spacing.lg,
  },
  testDescription: {
    ...ModernTheme.typography.body,
    color: ModernTheme.colors.textSecondary,
    marginBottom: ModernTheme.spacing.lg,
  },
  testButtonsContainer: {
    flexDirection: 'row',
    gap: ModernTheme.spacing.md,
  },
  testButton: {
    flex: 1,
  },
  // Save Section
  saveSection: {
    marginBottom: ModernTheme.spacing.xl,
  },
  saveButton: {
    width: '100%',
  },
});

export default NotificationSettingsScreen;
