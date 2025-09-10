import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Avatar,
  Badge,
  Surface,
  Chip,
  Divider,
  List,
  IconButton,
  ProgressBar,
} from 'react-native-paper';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {
  MaterialIcons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import axios from 'axios';
import { buildApiUrl, getEndpoint } from '../config/api';

const { width } = Dimensions.get('window');

const UltraModernPenaltyScreen = ({ userData, onBack }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [penalties, setPenalties] = useState([]);
  const [penaltyData, setPenaltyData] = useState(null);

  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const scaleAnim = useSharedValue(0.9);

  useEffect(() => {
    // Start animations
    fadeAnim.value = withTiming(1, { duration: 800 });
    slideAnim.value = withSpring(0, { damping: 15, stiffness: 150 });
    scaleAnim.value = withSpring(1, { damping: 12, stiffness: 100 });
    
    // Load penalty data
    loadPenaltyData();
  }, []);

  const loadPenaltyData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        buildApiUrl(getEndpoint('PENALTY', 'GET_USER_PENALTIES', userData.idNumber))
      );

      if (response.data.success) {
        const data = response.data.data;
        setPenaltyData(data);
        
        // Transform fines data to match the UI format
        const transformedPenalties = data.fines.map(fine => ({
          id: fine.id,
          bookTitle: fine.title,
          bookAuthor: fine.author,
          penaltyType: 'overdue',
          amount: fine.fine_amount - fine.paid_amount,
          dueDate: fine.due_date,
          status: fine.status === 'unpaid' ? 'pending' : 'paid',
          daysOverdue: fine.days_overdue,
          description: 'Late return penalty',
        }));
        
        setPenalties(transformedPenalties);
      }
    } catch (error) {
      console.error('Error loading penalty data:', error);
      Alert.alert('Error', 'Failed to load penalty information');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadPenaltyData();
    setRefreshing(false);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'overdue': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'pending': return 'Pending';
      case 'overdue': return 'Overdue';
      default: return 'Unknown';
    }
  };

  const getPenaltyTypeColor = (type) => {
    switch (type) {
      case 'overdue': return '#EF4444';
      case 'damage': return '#F59E0B';
      case 'lost': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getPenaltyTypeText = (type) => {
    switch (type) {
      case 'overdue': return 'Late Return';
      case 'damage': return 'Book Damage';
      case 'lost': return 'Lost Book';
      default: return 'Other';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return `₱${amount.toFixed(2)}`;
  };

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [
        { translateY: slideAnim.value },
        { scale: scaleAnim.value },
      ],
    };
  });

  const PenaltyCard = ({ penalty, index }) => {
    const cardAnim = useSharedValue(0);
    const cardSlide = useSharedValue(30);

    useEffect(() => {
      cardAnim.value = withDelay(index * 100, withTiming(1, { duration: 600 }));
      cardSlide.value = withDelay(index * 100, withSpring(0, { damping: 12 }));
    }, []);

    const cardAnimatedStyle = useAnimatedStyle(() => {
      return {
        opacity: cardAnim.value,
        transform: [{ translateX: cardSlide.value }],
      };
    });

    const statusColor = getStatusColor(penalty.status);
    const penaltyTypeColor = getPenaltyTypeColor(penalty.penaltyType);

    return (
      <Animated.View style={cardAnimatedStyle}>
        <Card style={styles.penaltyCard} elevation={3}>
          <Card.Content style={styles.penaltyCardContent}>
            <View style={styles.penaltyHeader}>
              <View style={styles.penaltyInfo}>
                <Title style={styles.penaltyTitle} numberOfLines={2}>
                  {penalty.bookTitle}
                </Title>
                <Paragraph style={styles.penaltyAuthor}>
                  by {penalty.bookAuthor}
                </Paragraph>
                <Text style={styles.penaltyDescription}>
                  {penalty.description}
                </Text>
              </View>
              <View style={styles.penaltyStatus}>
                <Chip
                  mode="outlined"
                  textStyle={{ color: statusColor, fontSize: 12 }}
                  style={[styles.statusChip, { borderColor: statusColor }]}
                >
                  {getStatusText(penalty.status)}
                </Chip>
                <Text style={[styles.amountText, { color: statusColor }]}>
                  {formatCurrency(penalty.amount)}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.penaltyDetails}>
              <View style={styles.detailRow}>
                <MaterialIcons name="category" size={16} color="#6B7280" />
                <Text style={styles.detailLabel}>Type:</Text>
                <Chip
                  mode="outlined"
                  textStyle={{ color: penaltyTypeColor, fontSize: 10 }}
                  style={[styles.typeChip, { borderColor: penaltyTypeColor }]}
                >
                  {getPenaltyTypeText(penalty.penaltyType)}
                </Chip>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons name="schedule" size={16} color="#6B7280" />
                <Text style={styles.detailLabel}>Due Date:</Text>
                <Text style={[styles.detailValue, { color: statusColor }]}>
                  {formatDate(penalty.dueDate)}
                </Text>
              </View>
              {penalty.daysOverdue > 0 && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="warning" size={16} color="#EF4444" />
                  <Text style={styles.detailLabel}>Days Overdue:</Text>
                  <Text style={[styles.detailValue, { color: '#EF4444' }]}>
                    {penalty.daysOverdue} days
                  </Text>
                </View>
              )}
            </View>

            {penalty.status === 'pending' && (
              <View style={styles.penaltyActions}>
                <Button
                  mode="outlined"
                  onPress={() => {}}
                  style={styles.actionButton}
                  contentStyle={styles.actionButtonContent}
                  icon="information"
                >
                  Details
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {}}
                  style={[styles.actionButton, { backgroundColor: statusColor }]}
                  contentStyle={styles.actionButtonContent}
                  icon="credit-card"
                >
                  Pay Now
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const SummaryCard = () => {
    const totalPenalties = penalties.length;
    const pendingPenalties = penalties.filter(p => p.status === 'pending').length;
    const totalAmount = penaltyData?.totalUnpaidAmount || 0;
    const pendingAmount = penaltyData?.totalUnpaidAmount || 0;

    return (
      <Animated.View style={[animatedHeaderStyle, styles.summaryContainer]}>
        <Surface style={styles.summaryCard} elevation={4}>
          <Title style={styles.summaryTitle}>Penalty Summary</Title>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalPenalties}</Text>
              <Text style={styles.summaryLabel}>Total Penalties</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>{pendingPenalties}</Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
                {formatCurrency(pendingAmount)}
              </Text>
              <Text style={styles.summaryLabel}>Outstanding</Text>
            </View>
          </View>
          
          <Divider style={styles.summaryDivider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
          </View>
        </Surface>
      </Animated.View>
    );
  };

  return (
    <PaperProvider theme={MD3LightTheme}>
      <View style={styles.container}>
        {/* Header */}
        <Animated.View style={[styles.header, animatedHeaderStyle]}>
          <Surface style={styles.headerSurface} elevation={2}>
            <View style={styles.headerContent}>
              <IconButton
                icon="arrow-left"
                size={24}
                onPress={onBack}
                style={styles.backButton}
              />
              <View style={styles.headerText}>
                <Title style={styles.headerTitle}>Penalties & Fines</Title>
                <Paragraph style={styles.headerSubtitle}>
                  Manage your library penalties
                </Paragraph>
              </View>
            </View>
          </Surface>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Card */}
          <SummaryCard />

          {/* Penalties List */}
          <View style={styles.penaltiesContainer}>
            <Text style={styles.sectionTitle}>Your Penalties</Text>
            {penalties.map((penalty, index) => (
              <PenaltyCard key={penalty.id} penalty={penalty} index={index} />
            ))}
          </View>

          {/* Empty State */}
          {penalties.length === 0 && (
            <Animated.View style={[animatedHeaderStyle, styles.emptyState]}>
              <MaterialCommunityIcons name="check-circle" size={80} color="#10B981" />
              <Title style={styles.emptyTitle}>No Penalties</Title>
              <Paragraph style={styles.emptySubtitle}>
                Great! You don't have any outstanding penalties or fines.
              </Paragraph>
            </Animated.View>
          )}

          {/* Payment Info */}
          <Animated.View style={[animatedHeaderStyle, styles.paymentInfo]}>
            <Card style={styles.paymentCard} elevation={2}>
              <Card.Content>
                <Title style={styles.paymentTitle}>Payment Information</Title>
                <Paragraph style={styles.paymentText}>
                  You can pay your penalties online or visit the library. 
                  Online payments are processed securely and reflected immediately.
                </Paragraph>
                <Button
                  mode="contained"
                  onPress={() => {}}
                  style={styles.paymentButton}
                  contentStyle={styles.paymentButtonContent}
                  icon="credit-card"
                >
                  Pay All Pending
                </Button>
              </Card.Content>
            </Card>
          </Animated.View>
        </ScrollView>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerSurface: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    margin: 0,
  },
  headerText: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  summaryContainer: {
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  summaryDivider: {
    marginVertical: 16,
    backgroundColor: '#E5E7EB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  penaltiesContainer: {
    marginBottom: 24,
  },
  penaltyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
  },
  penaltyCardContent: {
    padding: 16,
  },
  penaltyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  penaltyInfo: {
    flex: 1,
    marginRight: 12,
  },
  penaltyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  penaltyAuthor: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  penaltyDescription: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  penaltyStatus: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: 4,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#E5E7EB',
  },
  penaltyDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  typeChip: {
    height: 24,
  },
  penaltyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  actionButtonContent: {
    paddingVertical: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  paymentInfo: {
    marginBottom: 100,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  paymentText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  paymentButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  paymentButtonContent: {
    paddingVertical: 4,
  },
});

export default UltraModernPenaltyScreen;
