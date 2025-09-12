import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { ModernTheme } from '../styles/ModernTheme';
import UniversalPageTemplate from '../components/UniversalPageTemplate';

const PenaltyScreen = ({ userData, onBack }) => {
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
        return '#dc3545';
      case 'paid':
        return '#28a745';
      case 'waived':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  const getBorrowingStatusColor = (canBorrow) => {
    return canBorrow ? '#28a745' : '#dc3545';
  };

  if (loading) {
    return (
      <UniversalPageTemplate
        title="Penalty Information"
        userData={userData}
        onBack={onBack}
        showUserInfo={false}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading penalty information...</Text>
        </View>
      </UniversalPageTemplate>
    );
  }

  return (
    <UniversalPageTemplate
      title="Penalty Information"
      userData={userData}
      onBack={onBack}
      refreshing={refreshing}
      onRefresh={onRefresh}
      showUserInfo={false}
    >
        {/* Borrowing Status Card */}
        <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <Icon name="library-outline" size={20} color="#2c3e50" />
            <Text style={styles.cardTitle}>Borrowing Status</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Can Borrow Books:</Text>
            <Text
              style={[
                styles.statusValue,
                { color: getBorrowingStatusColor(penaltyData?.borrowingStatus?.canBorrow) }
              ]}
            >
              {penaltyData?.borrowingStatus?.canBorrow ? 'Yes' : 'No'}
            </Text>
          </View>
          {!penaltyData?.borrowingStatus?.canBorrow && (
            <View style={styles.warningContainer}>
              <Icon name="warning-outline" size={16} color="#dc3545" />
              <Text style={styles.warningText}>
                {penaltyData?.borrowingStatus?.reasonBlocked}
              </Text>
            </View>
          )}
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Currently Borrowed:</Text>
            <Text style={styles.statusValue}>
              {penaltyData?.currentBorrowedCount || 0} books
            </Text>
          </View>
        </View>

        {/* Semester Progress Card */}
        {penaltyData?.semesterTracking && (
          <View style={styles.card}>
            <View style={styles.cardTitleContainer}>
              <Icon name="calendar-outline" size={20} color="#2c3e50" />
              <Text style={styles.cardTitle}>Semester Progress</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Books Borrowed This Semester:</Text>
              <Text style={styles.statusValue}>
                {penaltyData.semesterTracking.books_borrowed_count || 0} / {penaltyData.semesterTracking.books_required || 20}
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
                    )}%`
                  }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {penaltyData.semesterTracking.books_borrowed_count || 0} of {penaltyData.semesterTracking.books_required || 20} books borrowed this semester
            </Text>
          </View>
        )}

        {/* Fines Card */}
        <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <Icon name="card-outline" size={20} color="#2c3e50" />
            <Text style={styles.cardTitle}>Fines</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Total Unpaid Fines:</Text>
            <Text style={[styles.statusValue, { color: '#dc3545' }]}>
              {formatCurrency(penaltyData?.totalUnpaidAmount || 0)}
            </Text>
          </View>

          {penaltyData?.fines && penaltyData.fines.length > 0 ? (
            <View style={styles.finesList}>
              <Text style={styles.finesListTitle}>Unpaid Fines:</Text>
              {penaltyData.fines.map((fine, index) => (
                <View key={index} style={styles.fineItem}>
                  <View style={styles.fineHeader}>
                    <Text style={styles.fineBookTitle}>{fine.title}</Text>
                    <Text style={[styles.fineStatus, { color: getStatusColor(fine.status) }]}>
                      {fine.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.fineBookCode}>Book Code: {fine.number_code}</Text>
                  <View style={styles.fineDetails}>
                    <Text style={styles.fineAmount}>
                      Amount: {formatCurrency(fine.fine_amount)}
                    </Text>
                    <Text style={styles.finePaid}>
                      Paid: {formatCurrency(fine.paid_amount)}
                    </Text>
                    <Text style={styles.fineRemaining}>
                      Remaining: {formatCurrency(fine.fine_amount - fine.paid_amount)}
                    </Text>
                  </View>
                  <Text style={styles.fineDays}>
                    Days Overdue: {fine.days_overdue}
                  </Text>
                  <Text style={styles.fineDate}>
                    Fine Date: {new Date(fine.fine_date).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noFinesContainer}>
              <Icon name="checkmark-circle-outline" size={20} color="#28a745" />
              <Text style={styles.noFinesText}>No unpaid fines</Text>
            </View>
          )}
        </View>

        {/* Important Notes */}
        {/* <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <Icon name="clipboard-outline" size={20} color="#2c3e50" />
            <Text style={styles.cardTitle}>Important Notes</Text>
          </View>
          <Text style={styles.noteText}>
            • You can borrow up to 3 books at a time
          </Text>
          <Text style={styles.noteText}>
            • Books must be returned within 7 days
          </Text>
          <Text style={styles.noteText}>
            • Overdue books incur a fine of ₱5.00 per day
          </Text>
          <Text style={styles.noteText}>
            • You must borrow at least 20 books during the semester (accumulative)
          </Text>
          <Text style={styles.noteText}>
            • You cannot borrow new books if you have unpaid fines or overdue books
          </Text>
        </View> */}
    </UniversalPageTemplate>
  );
};

const styles = StyleSheet.create({
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 16,
    color: '#495057',
    flex: 1,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  warningText: {
    fontSize: 14,
    color: '#dc3545',
    marginLeft: 8,
    flex: 1,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginVertical: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007bff',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 5,
  },
  finesList: {
    marginTop: 15,
  },
  finesListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 10,
  },
  fineItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  fineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  fineBookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  fineStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  fineBookCode: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 10,
  },
  fineDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  fineAmount: {
    fontSize: 14,
    color: '#dc3545',
    fontWeight: '600',
  },
  finePaid: {
    fontSize: 14,
    color: '#28a745',
  },
  fineRemaining: {
    fontSize: 14,
    color: '#ffc107',
    fontWeight: '600',
  },
  fineDays: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 5,
  },
  fineDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  noFinesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  noFinesText: {
    fontSize: 16,
    color: '#28a745',
    marginLeft: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default PenaltyScreen;
