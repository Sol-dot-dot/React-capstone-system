import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Animated,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const SimpleDashboardScreen = ({ userData, onNavigate, onLogout }) => {
  const [stats, setStats] = useState({
    borrowedBooks: 0,
    overdueBooks: 0,
    totalBooks: 0,
    penalties: 0,
  });
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Use mock data since dashboard endpoint doesn't exist yet
      setStats({
        borrowedBooks: 3,
        overdueBooks: 1,
        totalBooks: 150,
        penalties: 25,
      });
      setRecentBooks([
        { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', dueDate: '2024-01-15' },
        { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', dueDate: '2024-01-20' },
        { id: 3, title: '1984', author: 'George Orwell', dueDate: '2024-01-25' },
      ]);
    } catch (error) {
      console.error('Dashboard data error:', error);
      // Set mock data for demo
      setStats({
        borrowedBooks: 3,
        overdueBooks: 1,
        totalBooks: 150,
        penalties: 25,
      });
      setRecentBooks([
        { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', dueDate: '2024-01-15' },
        { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', dueDate: '2024-01-20' },
        { id: 3, title: '1984', author: 'George Orwell', dueDate: '2024-01-25' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.statCard, { borderLeftColor: color }]}>
        <View style={styles.statContent}>
          <View style={styles.statHeader}>
            <MaterialIcons name={icon} size={24} color={color} />
            <Text style={[styles.statValue, { color }]}>{value}</Text>
          </View>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>
                {userData.name || userData.idNumber || 'User'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
            <MaterialIcons name="logout" size={24} color="#6366f1" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Library Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Borrowed Books"
              value={stats.borrowedBooks}
              icon="book"
              color="#6366f1"
              onPress={() => onNavigate('borrowedBooks')}
            />
            <StatCard
              title="Overdue Books"
              value={stats.overdueBooks}
              icon="warning"
              color="#ef4444"
              onPress={() => onNavigate('borrowedBooks')}
            />
            <StatCard
              title="Total Books"
              value={stats.totalBooks}
              icon="library-books"
              color="#10b981"
              onPress={() => onNavigate('books')}
            />
            <StatCard
              title="Penalties"
              value={`$${stats.penalties}`}
              icon="attach-money"
              color="#f59e0b"
              onPress={() => onNavigate('penalties')}
            />
          </View>
        </Animated.View>

        {/* Recent Books */}
        <Animated.View
          style={[
            styles.recentBooksContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Books</Text>
            <TouchableOpacity onPress={() => onNavigate('borrowedBooks')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentBooks.length > 0 ? (
            recentBooks.map((book, index) => (
              <View key={book.id} style={styles.bookCard}>
                <View style={styles.bookContent}>
                  <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle}>{book.title}</Text>
                    <Text style={styles.bookAuthor}>by {book.author}</Text>
                    <View style={styles.bookMeta}>
                      <View style={styles.dueDateChip}>
                        <Text style={styles.dueDateText}>Due: {book.dueDate}</Text>
                      </View>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <MaterialIcons name="book" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No books borrowed yet</Text>
                <TouchableOpacity
                  style={styles.browseButton}
                  onPress={() => onNavigate('books')}
                >
                  <Text style={styles.browseButtonText}>Browse Books</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => onNavigate('books')}
      >
        <MaterialIcons name="search" size={24} color="#ffffff" />
        <Text style={styles.fabText}>Search Books</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  logoutButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 50) / 2,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statContent: {
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  recentBooksContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
  bookCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  bookContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  bookMeta: {
    flexDirection: 'row',
  },
  dueDateChip: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dueDateText: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyCard: {
    borderRadius: 12,
    backgroundColor: '#ffffff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  browseButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#6366f1',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SimpleDashboardScreen;
