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

const NotificationSettingsScreen = ({ userData, onBack }) => {
  const [settings, setSettings] = useState({
    enabled: true,
    pushNotifications: true,
    emailNotifications: true,
    reminderTiming: {
      oneDayBefore: true,
      dueToday: true,
      overdue: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await NotificationService.getNotificationSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const success = await NotificationService.updateNotificationSettings(settings);
      if (success) {
        Alert.alert('Success', 'Notification settings updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update notification settings');
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save notification settings');
    } finally {
      setSaving(false);
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

        {/* Reminder Timing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder Timing</Text>
          <Text style={styles.sectionDescription}>
            Choose when you want to receive reminders
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

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>📱 About Smart Notifications</Text>
          <Text style={styles.infoText}>
            • Push notifications appear on your device even when the app is closed
          </Text>
          <Text style={styles.infoText}>
            • Email notifications are sent to your registered email address
          </Text>
          <Text style={styles.infoText}>
            • You can customize when you receive reminders
          </Text>
          <Text style={styles.infoText}>
            • Notifications help you avoid overdue fines
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
});

export default NotificationSettingsScreen;
