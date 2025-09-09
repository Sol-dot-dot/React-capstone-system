import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Avatar,
  Badge,
  FAB,
  Portal,
  Modal,
  List,
  Divider,
  Chip,
  ProgressBar,
  Surface,
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
  Ionicons,
} from '@expo/vector-icons';
import { ModernTheme } from '../styles/ModernTheme';

const { width, height } = Dimensions.get('window');

const UltraModernDashboardScreen = ({ userData, onNavigate, onLogout }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalBooks: 56,
    borrowedBooks: 12,
    overdueBooks: 3,
    penalties: 2,
  });
  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      title: 'Book Returned',
      description: 'You returned "The Great Gatsby"',
      time: '2 hours ago',
      type: 'return',
      icon: 'book-return',
    },
    {
      id: 2,
      title: 'New Book Available',
      description: 'Check out the latest arrivals',
      time: '1 day ago',
      type: 'new',
      icon: 'book-plus',
    },
    {
      id: 3,
      title: 'Due Date Reminder',
      description: '3 books due tomorrow',
      time: '2 days ago',
      type: 'reminder',
      icon: 'clock-alert',
    },
  ]);

  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const scaleAnim = useSharedValue(0.8);

  useEffect(() => {
    // Start animations
    fadeAnim.value = withTiming(1, { duration: 800 });
    slideAnim.value = withSpring(0, { damping: 15, stiffness: 150 });
    scaleAnim.value = withSequence(
      withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }))
    );
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [
        { translateY: slideAnim.value },
        { scale: scaleAnim.value },
      ],
    };
  });

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ translateY: slideAnim.value }],
    };
  });

  const StatCard = ({ title, value, subtitle, icon, color, delay = 0 }) => {
    const cardAnim = useSharedValue(0);
    const cardScale = useSharedValue(0.9);

    useEffect(() => {
      cardAnim.value = withDelay(delay, withTiming(1, { duration: 600 }));
      cardScale.value = withDelay(delay, withSpring(1, { damping: 10 }));
    }, []);

    const cardAnimatedStyle = useAnimatedStyle(() => {
      return {
        opacity: cardAnim.value,
        transform: [{ scale: cardScale.value }],
      };
    });

    return (
      <Animated.View style={[cardAnimatedStyle, { flex: 1, margin: 4 }]}>
        <Card style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
          <Card.Content style={styles.statCardContent}>
            <View style={styles.statCardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                <MaterialIcons name={icon} size={24} color={color} />
              </View>
              <Text style={[styles.statValue, { color }]}>{value}</Text>
            </View>
            <Text style={styles.statTitle}>{title}</Text>
            <Text style={styles.statSubtitle}>{subtitle}</Text>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  const ActivityItem = ({ item, index }) => {
    const itemAnim = useSharedValue(0);
    const itemSlide = useSharedValue(30);

    useEffect(() => {
      itemAnim.value = withDelay(index * 100, withTiming(1, { duration: 500 }));
      itemSlide.value = withDelay(index * 100, withSpring(0, { damping: 12 }));
    }, []);

    const itemAnimatedStyle = useAnimatedStyle(() => {
      return {
        opacity: itemAnim.value,
        transform: [{ translateX: itemSlide.value }],
      };
    });

    const getIconName = (type) => {
      switch (type) {
        case 'return': return 'book-return';
        case 'new': return 'book-plus';
        case 'reminder': return 'clock-alert';
        default: return 'book';
      }
    };

    const getIconColor = (type) => {
      switch (type) {
        case 'return': return '#10B981';
        case 'new': return '#3B82F6';
        case 'reminder': return '#F59E0B';
        default: return '#6B7280';
      }
    };

    return (
      <Animated.View style={itemAnimatedStyle}>
        <Card style={styles.activityCard}>
          <Card.Content style={styles.activityContent}>
            <View style={styles.activityHeader}>
              <View style={[styles.activityIcon, { backgroundColor: getIconColor(item.type) + '20' }]}>
                <MaterialCommunityIcons
                  name={getIconName(item.type)}
                  size={20}
                  color={getIconColor(item.type)}
                />
              </View>
              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityDescription}>{item.description}</Text>
                <Text style={styles.activityTime}>{item.time}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
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
              <View style={styles.userInfo}>
                <Avatar.Text
                  size={50}
                  label={userData?.idNumber?.charAt(0) || 'U'}
                  style={styles.avatar}
                />
                <View style={styles.userDetails}>
                  <Text style={styles.welcomeText}>Welcome back!</Text>
                  <Text style={styles.userName}>{userData?.idNumber || 'User'}</Text>
                </View>
              </View>
              <Button
                mode="outlined"
                onPress={onLogout}
                style={styles.logoutButton}
                labelStyle={styles.logoutButtonText}
              >
                Logout
              </Button>
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
          {/* Quick Stats */}
          <Animated.View style={[animatedCardStyle, styles.statsContainer]}>
            <Text style={styles.sectionTitle}>Library Overview</Text>
            <View style={styles.statsGrid}>
              <StatCard
                title="Total Books"
                value={stats.totalBooks}
                subtitle="Available in library"
                icon="book"
                color="#3B82F6"
                delay={0}
              />
              <StatCard
                title="Borrowed"
                value={stats.borrowedBooks}
                subtitle="Currently borrowed"
                icon="bookmark"
                color="#10B981"
                delay={100}
              />
              <StatCard
                title="Overdue"
                value={stats.overdueBooks}
                subtitle="Need attention"
                icon="warning"
                color="#F59E0B"
                delay={200}
              />
              <StatCard
                title="Penalties"
                value={stats.penalties}
                subtitle="Outstanding fines"
                icon="attach-money"
                color="#EF4444"
                delay={300}
              />
            </View>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View style={[animatedCardStyle, styles.actionsContainer]}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <Button
                mode="contained"
                onPress={() => onNavigate('borrowedBooks')}
                style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
                contentStyle={styles.actionButtonContent}
                icon="book-open"
              >
                My Books
              </Button>
              <Button
                mode="contained"
                onPress={() => onNavigate('penalties')}
                style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                contentStyle={styles.actionButtonContent}
                icon="account-cash"
              >
                Penalties
              </Button>
              <Button
                mode="contained"
                onPress={() => onNavigate('profile')}
                style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
                contentStyle={styles.actionButtonContent}
                icon="account"
              >
                Profile
              </Button>
              <Button
                mode="contained"
                onPress={() => onNavigate('chatbot')}
                style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
                contentStyle={styles.actionButtonContent}
                icon="robot"
              >
                AI Assistant
              </Button>
            </View>
          </Animated.View>

          {/* Recent Activity */}
          <Animated.View style={[animatedCardStyle, styles.activityContainer]}>
            <View style={styles.activityHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <Button mode="text" compact>
                View All
              </Button>
            </View>
            <View style={styles.activityList}>
              {recentActivity.map((item, index) => (
                <ActivityItem key={item.id} item={item} index={index} />
              ))}
            </View>
          </Animated.View>

          {/* Progress Section */}
          <Animated.View style={[animatedCardStyle, styles.progressContainer]}>
            <Text style={styles.sectionTitle}>Reading Progress</Text>
            <Card style={styles.progressCard}>
              <Card.Content>
                <View style={styles.progressItem}>
                  <Text style={styles.progressLabel}>Books Read This Month</Text>
                  <View style={styles.progressBarContainer}>
                    <ProgressBar
                      progress={0.6}
                      color="#3B82F6"
                      style={styles.progressBar}
                    />
                    <Text style={styles.progressText}>6/10</Text>
                  </View>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.progressItem}>
                  <Text style={styles.progressLabel}>Reading Streak</Text>
                  <View style={styles.streakContainer}>
                    <MaterialIcons name="local-fire-department" size={24} color="#F59E0B" />
                    <Text style={styles.streakText}>7 days</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </Animated.View>
        </ScrollView>

        {/* Floating Action Button */}
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => onNavigate('chatbot')}
          label="Ask AI"
        />
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
    justifyContent: 'space-between',
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#3B82F6',
  },
  userDetails: {
    marginLeft: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  logoutButton: {
    borderColor: '#EF4444',
  },
  logoutButtonText: {
    color: '#EF4444',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  statCardContent: {
    padding: 16,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: (width - 56) / 2,
    borderRadius: 12,
  },
  actionButtonContent: {
    paddingVertical: 8,
  },
  activityContainer: {
    marginBottom: 24,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityList: {
    gap: 12,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 1,
  },
  activityContent: {
    padding: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  progressContainer: {
    marginBottom: 100,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  divider: {
    marginVertical: 16,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#3B82F6',
  },
});

export default UltraModernDashboardScreen;
