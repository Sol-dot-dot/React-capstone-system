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
import { ModernButton, ModernCard, ModernBadge } from '../components/ModernComponents';
import axios from 'axios';
import { buildApiUrl, getEndpoint } from '../config/api';

const { width } = Dimensions.get('window');

const PenaltyScreen = ({ userData, onBack }) => {
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
        setPenalties(response.data.data.penalties || []);
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

  const renderPenaltyCard = (penalty, index) => {
    const status = getPenaltyStatus(penalty);
    const dueDate = new Date(penalty.dueDate);
    const createdDate = new Date(penalty.createdAt);

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
                {penalty.reason}
              </Text>
              <Text style={styles.penaltyBook} numberOfLines={1}>
                Book: {penalty.bookTitle}
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
                Amount: ₱{penalty.amount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="calendar-outline" size={16} color={ModernTheme.colors.textTertiary} />
              <Text style={styles.detailText}>
                Created: {createdDate.toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="time-outline" size={16} color={ModernTheme.colors.textTertiary} />
              <Text style={styles.detailText}>
                Due: {dueDate.toLocaleDateString()}
              </Text>
            </View>
          </View>

          {penalty.status !== 'paid' && (
            <View style={styles.paymentSection}>
              <ModernButton
                title="Pay Now"
                onPress={() => {
                  // Handle payment logic here
                  console.log('Payment for penalty:', penalty.id);
                }}
                variant="primary"
                size="small"
                icon="card-outline"
                style={styles.payButton}
              />
            </View>
          )}
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
          <ModernButton
            title="←"
            onPress={onBack}
            variant="outline"
            size="small"
            style={styles.backButton}
          />
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

            {/* Penalties List */}
            <View style={styles.penaltiesContainer}>
              {penalties.map((penalty, index) => renderPenaltyCard(penalty, index))}
            </View>
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 0,
    marginRight: ModernTheme.spacing.md,
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
  paymentSection: {
    alignItems: 'flex-end',
  },
  payButton: {
    paddingHorizontal: ModernTheme.spacing.lg,
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
