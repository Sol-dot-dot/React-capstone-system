import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  RefreshControl,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
import { ModernTheme } from '../styles/ModernTheme';
import { 
  ModernButton, 
  ModernCard, 
  ModernBadge, 
  ResponsiveContainer,
  ResponsiveGrid 
} from '../components/ui/ModernComponents';
import { 
  getResponsiveSpacing, 
  getResponsiveFontSize, 
  deviceInfo 
} from '../utils/ResponsiveUtils';
import axios from 'axios';
import { buildApiUrl, getEndpoint } from '../config/api';

const { width } = Dimensions.get('window');

const PenaltyScreen = ({ userData, onBack }) => {
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadPenalties();
  }, []);

  const loadPenalties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        buildApiUrl(getEndpoint('PENALTY', 'GET_USER_PENALTIES', userData.idNumber))
      );

      if (response.data.success) {
        // Backend returns 'fines' not 'penalties'
        const fines = response.data.data.fines || [];
        
        // Transform fines data to match the expected penalty structure
        const transformedPenalties = fines.map(fine => ({
          id: fine.id,
          reason: `Overdue book: ${fine.title}`,
          bookTitle: fine.title,
          amount: parseFloat(fine.fine_amount) - parseFloat(fine.paid_amount || 0), // Outstanding amount
          status: fine.status,
          dueDate: fine.due_date,
          createdAt: fine.fine_date,
          daysOverdue: fine.days_overdue,
          bookCode: fine.number_code,
          author: fine.author,
          borrowedDate: fine.borrowed_date,
          returnedDate: fine.returned_date
        }));
        
        setPenalties(transformedPenalties);
      }
    } catch (error) {
      console.error('Error loading penalties:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPenalties();
    setRefreshing(false);
  };

  const getPenaltyStatus = (penalty) => {
    if (penalty.status === 'paid') {
      return { status: 'paid', color: ModernTheme.colors.success, text: 'Paid' };
    } else if (penalty.status === 'pending') {
      return { status: 'pending', color: ModernTheme.colors.warning, text: 'Pending' };
    } else {
      return { status: 'overdue', color: ModernTheme.colors.error, text: 'Overdue' };
    }
  };

  const getTotalAmount = () => {
    return penalties.reduce((total, penalty) => {
      if (penalty.status !== 'paid') {
        return total + penalty.amount;
      }
      return total;
    }, 0);
  };

  const getPaidAmount = () => {
    return penalties.reduce((total, penalty) => {
      if (penalty.status === 'paid') {
        return total + penalty.amount;
      }
      return total;
    }, 0);
  };

  const getCurrentPenalties = () => {
    return penalties.filter(penalty => penalty.status !== 'paid');
  };

  const getHistoricalPenalties = () => {
    return penalties.filter(penalty => penalty.status === 'paid');
  };

  const renderPenaltyCard = (penalty, index) => {
    const status = getPenaltyStatus(penalty);
    const dueDate = new Date(penalty.dueDate);
    const createdDate = new Date(penalty.createdAt);
    const borrowedDate = new Date(penalty.borrowedDate);

    return (
      <Animatable.View
        key={penalty.id}
        animation="fadeInUp"
        duration={600}
        delay={index * 100}
        style={styles.penaltyCardContainer}
      >
        <ModernCard style={styles.penaltyCard}>
          <View style={styles.penaltyHeader}>
            <View style={styles.penaltyInfo}>
              <Text style={styles.penaltyTitle} numberOfLines={2}>
                {penalty.bookTitle}
              </Text>
              <Text style={styles.penaltyBook} numberOfLines={1}>
                by {penalty.author} • Code: {penalty.bookCode}
              </Text>
            </View>
            <ModernBadge
              text={status.text}
              variant={status.status === 'paid' ? 'success' : status.status === 'pending' ? 'warning' : 'error'}
              size="small"
            />
          </View>

          <View style={styles.penaltyDetails}>
            <View style={styles.detailItem}>
              <Icon name="cash-outline" size={16} color={ModernTheme.colors.textTertiary} />
              <Text style={styles.detailText}>
                Fine Amount: ₱{penalty.amount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="calendar-outline" size={16} color={ModernTheme.colors.textTertiary} />
              <Text style={styles.detailText}>
                Borrowed: {borrowedDate.toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="time-outline" size={16} color={ModernTheme.colors.textTertiary} />
              <Text style={styles.detailText}>
                Due: {dueDate.toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="alert-circle-outline" size={16} color={ModernTheme.colors.textTertiary} />
              <Text style={styles.detailText}>
                Days Overdue: {penalty.daysOverdue} day{penalty.daysOverdue !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="document-text-outline" size={16} color={ModernTheme.colors.textTertiary} />
              <Text style={styles.detailText}>
                Fine Created: {createdDate.toLocaleDateString()}
              </Text>
            </View>
            {penalty.status === 'paid' && penalty.returnedDate && (
              <View style={styles.detailItem}>
                <Icon name="checkmark-circle-outline" size={16} color={ModernTheme.colors.success} />
                <Text style={[styles.detailText, { color: ModernTheme.colors.success }]}>
                  Paid: {new Date(penalty.returnedDate).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>

        </ModernCard>
      </Animatable.View>
    );
  };

  const renderEmptyState = () => (
    <Animatable.View
      animation="fadeIn"
      duration={600}
      style={styles.emptyState}
    >
      <View style={styles.emptyIcon}>
        <Icon name="checkmark-circle-outline" size={64} color={ModernTheme.colors.success} />
      </View>
      <Text style={styles.emptyTitle}>No Penalties</Text>
      <Text style={styles.emptySubtitle}>
        Great! You don't have any outstanding penalties. Keep up the good work!
      </Text>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />

      {/* Header */}
      <Animatable.View
        animation="fadeInDown"
        duration={600}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Penalty Information</Text>
            <Text style={styles.headerSubtitle}>
              {penalties.length} penalty{penalties.length !== 1 ? 'ies' : ''} found
            </Text>
          </View>
        </View>
      </Animatable.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[ModernTheme.colors.primary]}
            tintColor={ModernTheme.colors.primary}
          />
        }
      >
        {penalties.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Summary Cards */}
            <Animatable.View
              animation="fadeInUp"
              duration={600}
              delay={200}
              style={styles.summaryContainer}
            >
              <View style={styles.summaryGrid}>
                <ModernCard style={[styles.summaryCard, { borderLeftColor: ModernTheme.colors.error, borderLeftWidth: 4 }]}>
                  <View style={styles.summaryContent}>
                    <Icon name="cash-outline" size={24} color={ModernTheme.colors.error} />
                    <View style={styles.summaryText}>
                      <Text style={styles.summaryValue}>₱{getTotalAmount().toFixed(2)}</Text>
                      <Text style={styles.summaryLabel}>Outstanding</Text>
                    </View>
                  </View>
                </ModernCard>

                <ModernCard style={[styles.summaryCard, { borderLeftColor: ModernTheme.colors.success, borderLeftWidth: 4 }]}>
                  <View style={styles.summaryContent}>
                    <Icon name="checkmark-circle-outline" size={24} color={ModernTheme.colors.success} />
                    <View style={styles.summaryText}>
                      <Text style={styles.summaryValue}>₱{getPaidAmount().toFixed(2)}</Text>
                      <Text style={styles.summaryLabel}>Paid</Text>
                    </View>
                  </View>
                </ModernCard>
              </View>
            </Animatable.View>

            {/* Current Penalties */}
            {getCurrentPenalties().length > 0 && (
              <View style={styles.penaltiesContainer}>
                <Text style={styles.sectionTitle}>Current Penalties</Text>
                {getCurrentPenalties().map((penalty, index) => renderPenaltyCard(penalty, index))}
              </View>
            )}

            {/* History Toggle */}
            <Animatable.View
              animation="fadeInUp"
              duration={600}
              delay={400}
              style={styles.historyToggleContainer}
            >
              <ModernButton
                title={showHistory ? "Hide History" : "View History"}
                onPress={() => setShowHistory(!showHistory)}
                variant="outline"
                size="medium"
                icon={<Icon name={showHistory ? "chevron-up-outline" : "time-outline"} size={20} color={ModernTheme.colors.primary} />}
                style={styles.historyToggleButton}
              />
            </Animatable.View>

            {/* Historical Penalties */}
            {showHistory && (
              <Animatable.View
                animation="fadeInUp"
                duration={600}
                style={styles.historyContainer}
              >
                <View style={styles.historyHeader}>
                  <Icon name="time-outline" size={20} color="#3b82f6" />
                  <Text style={[styles.sectionTitle, { marginLeft: ModernTheme.spacing.sm, marginBottom: 0 }]}>Payment History</Text>
                </View>
                {getHistoricalPenalties().length > 0 ? (
                  getHistoricalPenalties().map((penalty, index) => renderPenaltyCard(penalty, index))
                ) : (
                  <View style={styles.emptyHistoryState}>
                    <Icon name="time-outline" size={48} color="#94a3b8" />
                    <Text style={styles.emptyHistoryTitle}>No Payment History</Text>
                    <Text style={styles.emptyHistorySubtitle}>
                      You haven't paid any penalties yet. Once you pay a penalty, it will appear here.
                    </Text>
                  </View>
                )}
              </Animatable.View>
            )}
          </>
        )}
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
  },
  headerText: {
    flex: 1,
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
  scrollContent: {
    paddingHorizontal: ModernTheme.spacing.lg,
    paddingBottom: 120, // Account for bottom navigation
  },
  summaryContainer: {
    marginBottom: ModernTheme.spacing.xl,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    padding: ModernTheme.spacing.lg,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    marginLeft: ModernTheme.spacing.md,
  },
  summaryValue: {
    ...ModernTheme.typography.h2,
    color: ModernTheme.colors.textPrimary,
  },
  summaryLabel: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
  },
  penaltiesContainer: {
    marginBottom: ModernTheme.spacing.xl,
  },
  sectionTitle: {
    ...ModernTheme.typography.h3,
    color: ModernTheme.colors.textPrimary,
    marginBottom: ModernTheme.spacing.lg,
    fontWeight: '600',
  },
  historyToggleContainer: {
    marginBottom: ModernTheme.spacing.lg,
    alignItems: 'center',
  },
  historyToggleButton: {
    borderColor: '#3b82f6',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 2,
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyContainer: {
    marginBottom: ModernTheme.spacing.xl,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ModernTheme.spacing.lg,
  },
  emptyHistoryState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ModernTheme.spacing.xxl,
    paddingHorizontal: ModernTheme.spacing.lg,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginTop: ModernTheme.spacing.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyHistoryTitle: {
    ...ModernTheme.typography.h4,
    color: '#475569',
    marginTop: ModernTheme.spacing.md,
    marginBottom: ModernTheme.spacing.sm,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyHistorySubtitle: {
    ...ModernTheme.typography.body,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 14,
    fontWeight: '500',
  },
  penaltyCardContainer: {
    marginBottom: ModernTheme.spacing.md,
  },
  penaltyCard: {
    padding: ModernTheme.spacing.lg,
  },
  penaltyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ModernTheme.spacing.md,
  },
  penaltyInfo: {
    flex: 1,
    marginRight: ModernTheme.spacing.md,
  },
  penaltyTitle: {
    ...ModernTheme.typography.bodyMedium,
    color: ModernTheme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: ModernTheme.spacing.xs,
  },
  penaltyBook: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
  },
  penaltyDetails: {
    marginBottom: ModernTheme.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ModernTheme.spacing.xs,
  },
  detailText: {
    ...ModernTheme.typography.caption,
    color: ModernTheme.colors.textSecondary,
    marginLeft: ModernTheme.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ModernTheme.spacing.xxl,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: ModernTheme.colors.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ModernTheme.spacing.lg,
  },
  emptyTitle: {
    ...ModernTheme.typography.h3,
    color: ModernTheme.colors.textPrimary,
    marginBottom: ModernTheme.spacing.sm,
  },
  emptySubtitle: {
    ...ModernTheme.typography.body,
    color: ModernTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: ModernTheme.spacing.lg,
  },
});

export default PenaltyScreen;
