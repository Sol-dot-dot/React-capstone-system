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
import { ModernTheme, ModernStyles } from '../styles/ModernTheme';

// Fallback icon component in case vector icons don't load
const FallbackIcon = ({ name, size, color }) => {
  const iconMap = {
    'arrow-left': '←',
    'dollar-sign': '💰',
    'book': '📚',
    'check-circle': '✅',
    'calendar': '📅',
    'clipboard': '📋',
    'book-open': '📖',
    'alert-circle': '⚠️',
    'clock': '⏰',
    'target': '🎯',
    'x-circle': '🚫',
  };
  
  return (
    <Text style={{ fontSize: size, color }}>
      {iconMap[name] || '📱'}
    </Text>
  );
};

// Try to import vector icons, fallback to emoji if not available
let Icon;
try {
  Icon = require('react-native-vector-icons/Feather').default;
} catch (error) {
  console.warn('Vector icons not available, using fallback icons');
  Icon = FallbackIcon;
}

const ModernPenaltyScreen = ({ userData, onBack }) => {
  const [penaltyData, setPenaltyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPenaltyData();
  }, []);

  const loadPenaltyData = async () => {
    try {
      const response = await axios.get(
        `http://10.0.2.2:5000/api/penalty/user/${userData.idNumber}`
      );

      if (response.data.success) {
        setPenaltyData(response.data.data);
      }
    } catch (error) {
      console.error('Error loading penalty data:', error);
      Alert.alert('Error', 'Failed to load penalty information');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPenaltyData();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unpaid':
        return ModernTheme.colors.error;
      case 'paid':
        return ModernTheme.colors.success;
      case 'waived':
        return ModernTheme.colors.warning;
      default:
        return ModernTheme.colors.secondary;
    }
  };

  const getBorrowingStatusColor = (canBorrow) => {
    return canBorrow ? ModernTheme.colors.success : ModernTheme.colors.error;
  };

  const getTotalFines = () => {
    return penaltyData?.totalUnpaidAmount || 0;
  };

  const getUnpaidFinesCount = () => {
    return penaltyData?.fines?.filter(fine => fine.status === 'unpaid').length || 0;
  };

  const getOverdueBooksCount = () => {
    return penaltyData?.fines?.filter(fine => fine.days_overdue > 0).length || 0;
  };

  const fineCategories = [
    {
      title: 'Unpaid Fines',
      count: getUnpaidFinesCount(),
      amount: getTotalFines(),
      icon: 'dollar-sign',
      color: ModernTheme.colors.error,
    },
    {
      title: 'Overdue Books',
      count: getOverdueBooksCount(),
      amount: 0,
      icon: 'book',
      color: ModernTheme.colors.warning,
    },
    {
      title: 'Can Borrow',
      count: penaltyData?.borrowingStatus?.canBorrow ? 1 : 0,
      amount: 0,
      icon: 'check-circle',
      color: ModernTheme.colors.success,
    },
  ];

  if (loading) {
    return (
      <View style={ModernStyles.container}>
        <View style={ModernStyles.header}>
          <TouchableOpacity style={ModernStyles.headerButton} onPress={onBack}>
            <Text style={ModernStyles.buttonText}>←</Text>
          </TouchableOpacity>
          <Text style={ModernStyles.headerTitle}>Fines & Penalties</Text>
          <View style={ModernStyles.headerButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ModernTheme.colors.accent} />
          <Text style={ModernTheme.typography.caption}>Loading penalty information...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={ModernStyles.container}>
      {/* Header */}
      <View style={ModernStyles.header}>
        <TouchableOpacity style={ModernStyles.headerButton} onPress={onBack}>
          <Icon name="arrow-left" size={20} color={ModernTheme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={ModernStyles.headerTitle}>Fines & Penalties</Text>
        <TouchableOpacity style={ModernStyles.headerButton}>
          <Icon name="dollar-sign" size={20} color={ModernTheme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Total Fines Section */}
        <View style={[ModernStyles.statCard, styles.totalSection]}>
          <Text style={ModernTheme.typography.caption}>Total Unpaid Fines</Text>
          <Text style={[ModernStyles.statValue, { color: ModernTheme.colors.error }]}>
            {formatCurrency(getTotalFines())}
          </Text>
        </View>

        {/* Categories Section */}
        <View style={styles.categoriesHeader}>
          <Text style={ModernTheme.typography.h3}>Summary</Text>
          <TouchableOpacity>
            <Icon name="bar-chart-2" size={20} color={ModernTheme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesContainer}>
          {fineCategories.map((category, index) => (
            <View key={index} style={[styles.categoryCard, { backgroundColor: category.color + '15' }]}>
              <View style={styles.categoryHeader}>
                <Icon name={category.icon} size={20} color={category.color} />
                <Text style={[ModernTheme.typography.body, { color: category.color }]}>
                  {category.amount > 0 ? formatCurrency(category.amount) : category.count}
                </Text>
              </View>
              <Text style={[ModernTheme.typography.caption, { color: category.color }]}>
                {category.count} {category.count === 1 ? 'item' : 'items'}
              </Text>
              <Text style={[ModernTheme.typography.small, { color: category.color }]}>
                {category.title}
              </Text>
            </View>
          ))}
        </View>

        {/* Borrowing Status Card */}
        <View style={[ModernStyles.card, styles.statusCard]}>
          <View style={styles.cardHeader}>
            <Icon name="book" size={24} color={ModernTheme.colors.primary} />
            <Text style={ModernTheme.typography.h3}>Borrowing Status</Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={ModernTheme.typography.caption}>Can Borrow Books:</Text>
            <View style={[styles.statusBadge, { backgroundColor: getBorrowingStatusColor(penaltyData?.borrowingStatus?.canBorrow) + '20' }]}>
              <Text style={[ModernTheme.typography.small, { color: getBorrowingStatusColor(penaltyData?.borrowingStatus?.canBorrow) }]}>
                {penaltyData?.borrowingStatus?.canBorrow ? 'YES' : 'NO'}
              </Text>
            </View>
          </View>

          {!penaltyData?.borrowingStatus?.canBorrow && (
            <View style={styles.warningCard}>
              <Icon name="alert-circle" size={16} color={ModernTheme.colors.error} />
              <Text style={[ModernTheme.typography.caption, { color: ModernTheme.colors.error }]}>
                {penaltyData?.borrowingStatus?.reasonBlocked}
              </Text>
            </View>
          )}

          <View style={styles.statusRow}>
            <Text style={ModernTheme.typography.caption}>Currently Borrowed:</Text>
            <Text style={ModernTheme.typography.body}>
              {penaltyData?.currentBorrowedCount || 0} books
            </Text>
          </View>
        </View>

        {/* Semester Progress Card */}
        {penaltyData?.semesterTracking && (
          <View style={[ModernStyles.card, styles.progressCard]}>
            <View style={styles.cardHeader}>
              <Icon name="calendar" size={24} color={ModernTheme.colors.primary} />
              <Text style={ModernTheme.typography.h3}>Semester Progress</Text>
            </View>
            
            <View style={styles.progressSection}>
              <View style={styles.progressStats}>
                <Text style={[ModernTheme.typography.h2, { color: ModernTheme.colors.accent }]}>
                  {penaltyData.semesterTracking.books_borrowed_count || 0}
                </Text>
                <Text style={ModernTheme.typography.caption}>
                  of {penaltyData.semesterTracking.books_required || 20} books
                </Text>
              </View>
              
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        ((penaltyData.semesterTracking.books_borrowed_count || 0) /
                          (penaltyData.semesterTracking.books_required || 20)) *
                          100,
                        100
                      )}%`,
                      backgroundColor: ModernTheme.colors.accent,
                    }
                  ]}
                />
              </View>
            </View>
          </View>
        )}

        {/* Fines List */}
        <View style={styles.finesSection}>
          <Text style={ModernTheme.typography.h3}>Fines Details</Text>
          {penaltyData?.fines && penaltyData.fines.length > 0 ? (
            penaltyData.fines.map((fine, index) => (
              <View key={index} style={[ModernStyles.listItem, styles.fineItem]}>
                <View style={[ModernStyles.listItemIcon, { backgroundColor: getStatusColor(fine.status) + '20' }]}>
                  <Icon name="book-open" size={20} color={getStatusColor(fine.status)} />
                </View>
                <View style={ModernStyles.listItemContent}>
                  <Text style={ModernStyles.listItemTitle}>{fine.title}</Text>
                  <Text style={ModernStyles.listItemSubtitle}>
                    Book Code: {fine.number_code}
                  </Text>
                  <View style={styles.fineDetails}>
                    <Text style={[ModernTheme.typography.small, { color: getStatusColor(fine.status) }]}>
                      {fine.status.toUpperCase()} • {fine.days_overdue} days overdue
                    </Text>
                  </View>
                </View>
                <View style={styles.fineAmounts}>
                  <Text style={[ModernTheme.typography.body, { color: ModernTheme.colors.error }]}>
                    {formatCurrency(fine.fine_amount)}
                  </Text>
                  <Text style={[ModernTheme.typography.small, { color: ModernTheme.colors.success }]}>
                    Paid: {formatCurrency(fine.paid_amount)}
                  </Text>
                  <Text style={[ModernTheme.typography.small, { color: ModernTheme.colors.warning }]}>
                    Remaining: {formatCurrency(fine.fine_amount - fine.paid_amount)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="check-circle" size={48} color={ModernTheme.colors.success} />
              <Text style={ModernTheme.typography.body}>No unpaid fines</Text>
              <Text style={ModernTheme.typography.caption}>
                You're all caught up!
              </Text>
            </View>
          )}
        </View>

        {/* Important Notes */}
        <View style={[ModernStyles.card, styles.notesCard]}>
          <View style={styles.cardHeader}>
            <Icon name="clipboard" size={24} color={ModernTheme.colors.primary} />
            <Text style={ModernTheme.typography.h3}>Important Notes</Text>
          </View>
          
          <View style={styles.notesList}>
            <View style={styles.noteItem}>
              <Icon name="book" size={16} color={ModernTheme.colors.primary} />
              <Text style={ModernTheme.typography.caption}>You can borrow up to 3 books at a time</Text>
            </View>
            <View style={styles.noteItem}>
              <Icon name="clock" size={16} color={ModernTheme.colors.primary} />
              <Text style={ModernTheme.typography.caption}>Books must be returned within 7 days</Text>
            </View>
            <View style={styles.noteItem}>
              <Icon name="dollar-sign" size={16} color={ModernTheme.colors.primary} />
              <Text style={ModernTheme.typography.caption}>Overdue books incur a fine of ₱5.00 per day</Text>
            </View>
            <View style={styles.noteItem}>
              <Icon name="target" size={16} color={ModernTheme.colors.primary} />
              <Text style={ModernTheme.typography.caption}>You must borrow at least 20 books during the semester</Text>
            </View>
            <View style={styles.noteItem}>
              <Icon name="x-circle" size={16} color={ModernTheme.colors.primary} />
              <Text style={ModernTheme.typography.caption}>You cannot borrow new books if you have unpaid fines</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
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
    paddingHorizontal: ModernTheme.spacing.lg,
    marginBottom: ModernTheme.spacing.lg,
  },
  categoryCard: {
    flex: 1,
    marginHorizontal: ModernTheme.spacing.xs,
    borderRadius: ModernTheme.borderRadius.lg,
    padding: ModernTheme.spacing.lg,
    minHeight: 100,
    justifyContent: 'space-between',
    ...ModernTheme.shadows.card,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ModernTheme.spacing.sm,
  },
  categoryIcon: {
    fontSize: 20,
  },
  statusCard: {
    marginHorizontal: ModernTheme.spacing.lg,
    marginBottom: ModernTheme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ModernTheme.spacing.md,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: ModernTheme.spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ModernTheme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: ModernTheme.spacing.sm,
    paddingVertical: ModernTheme.spacing.xs,
    borderRadius: ModernTheme.borderRadius.sm,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ModernTheme.colors.error + '10',
    padding: ModernTheme.spacing.sm,
    borderRadius: ModernTheme.borderRadius.sm,
    marginVertical: ModernTheme.spacing.sm,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: ModernTheme.spacing.sm,
  },
  progressCard: {
    marginHorizontal: ModernTheme.spacing.lg,
    marginBottom: ModernTheme.spacing.md,
  },
  progressSection: {
    alignItems: 'center',
  },
  progressStats: {
    alignItems: 'center',
    marginBottom: ModernTheme.spacing.md,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: ModernTheme.colors.surfaceLight,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  finesSection: {
    paddingHorizontal: ModernTheme.spacing.lg,
    marginBottom: ModernTheme.spacing.lg,
  },
  fineItem: {
    marginBottom: ModernTheme.spacing.sm,
  },
  fineIcon: {
    fontSize: 20,
  },
  fineDetails: {
    marginTop: ModernTheme.spacing.xs,
  },
  fineAmounts: {
    alignItems: 'flex-end',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: ModernTheme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: ModernTheme.spacing.md,
  },
  notesCard: {
    marginHorizontal: ModernTheme.spacing.lg,
    marginBottom: ModernTheme.spacing.xl,
  },
  notesList: {
    marginTop: ModernTheme.spacing.sm,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ModernTheme.spacing.sm,
  },
  noteIcon: {
    fontSize: 16,
    marginRight: ModernTheme.spacing.sm,
    width: 20,
  },
});

export default ModernPenaltyScreen;
