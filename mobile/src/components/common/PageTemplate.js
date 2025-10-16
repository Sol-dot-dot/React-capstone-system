import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ModernTheme, ModernStyles } from '../../styles/ModernTheme';

const UniversalPageTemplate = ({ 
  title, 
  userData, 
  onBack, 
  onLogout, 
  children, 
  refreshing = false, 
  onRefresh = null,
  showHeader = true,
  showUserInfo = true,
  headerActions = null
}) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />
      
      {/* Header */}
      {showHeader && (
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {onBack && (
              <TouchableOpacity style={ModernStyles.backButton} onPress={onBack}>
                <Icon name="arrow-back" size={20} color={ModernTheme.colors.textPrimary} />
              </TouchableOpacity>
            )}
            
            <Text style={styles.headerTitle}>{title}</Text>
            
            {headerActions || (
              <View style={styles.headerActions}>
                {onLogout && (
                  <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                    <Icon name="log-out-outline" size={20} color={ModernTheme.colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
          
          {/* User Info Section */}
          {showUserInfo && userData && (
            <View style={styles.userInfoSection}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {userData?.idNumber ? userData.idNumber.charAt(0) : 'U'}
                  </Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.greeting}>Welcome back!</Text>
                  <Text style={styles.userName}>{userData?.idNumber || 'User'}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
      >
        {children}
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
  header: {
    paddingHorizontal: ModernTheme.spacing.lg,
    paddingTop: 60,
    paddingBottom: ModernTheme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ModernTheme.spacing.md,
  },
  headerTitle: {
    ...ModernTheme.typography.h3,
    textAlign: 'center',
    flex: 1,
    marginHorizontal: ModernTheme.spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    paddingHorizontal: ModernTheme.spacing.md,
    paddingVertical: ModernTheme.spacing.sm,
    borderRadius: ModernTheme.borderRadius.md,
    backgroundColor: ModernTheme.colors.error + '20',
  },
  userInfoSection: {
    marginTop: ModernTheme.spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: ModernTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ModernTheme.spacing.md,
  },
  avatarText: {
    ...ModernTheme.typography.h4,
    color: ModernTheme.colors.textInverse,
  },
  userDetails: {
    flex: 1,
  },
  greeting: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
  },
  userName: {
    ...ModernTheme.typography.h4,
    color: ModernTheme.colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: ModernTheme.spacing.lg,
    paddingBottom: 100, // Space for bottom navigation
  },
});

export default UniversalPageTemplate;
