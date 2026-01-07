const pool = require('../config/database');
const natural = require('natural');

const { logger } = require('../config/logger');
/**
 * User Knowledge Service
 * Provides comprehensive user information and context for the chatbot
 */
class UserKnowledgeService {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
  }

  /**
   * Get comprehensive user knowledge for chatbot context
   * @param {string} studentIdNumber - Student ID number
   * @returns {Object} Complete user knowledge profile
   */
  async getUserKnowledge(studentIdNumber) {
    try {
      logger.info(`[INFO] Building comprehensive user knowledge for: ${studentIdNumber}`);

      const [
        userProfile,
        borrowingHistory,
        currentBorrowings,
        readingStats,
        preferences,
        penalties,
        activityLogs
      ] = await Promise.all([
        this.getUserProfile(studentIdNumber),
        this.getBorrowingHistory(studentIdNumber),
        this.getCurrentBorrowings(studentIdNumber),
        this.getReadingStatistics(studentIdNumber),
        this.getUserPreferences(studentIdNumber),
        this.getPenaltyInformation(studentIdNumber),
        this.getUserActivityLogs(studentIdNumber)
      ]);

      const userKnowledge = {
        // Basic Profile
        profile: userProfile,

        // Borrowing Information
        borrowing: {
          history: borrowingHistory,
          current: currentBorrowings,
          statistics: readingStats
        },

        // Reading Patterns
        reading: {
          preferences: preferences,
          patterns: this.analyzeReadingPatterns(borrowingHistory),
          trends: this.analyzeReadingTrends(borrowingHistory)
        },

        // System Status
        status: {
          penalties: penalties,
          activity: activityLogs,
          accountStatus: this.getAccountStatus(userProfile, penalties)
        },

        // AI Context
        context: this.generateAIContext(userProfile, borrowingHistory, preferences, penalties),

        // Summary for quick reference
        summary: this.generateUserSummary(userProfile, readingStats, preferences)
      };

      logger.info(`[OK] User knowledge built successfully for ${studentIdNumber}`);
      return userKnowledge;

    } catch (error) {
      logger.error('[ERROR] Error building user knowledge:', error);
      throw error;
    }
  }

  /**
   * Get user profile information
   * @param {string} studentIdNumber - Student ID number
   * @returns {Object} User profile data
   */
  async getUserProfile(studentIdNumber) {
    try {
      const [users] = await pool.execute(`
        SELECT
          id,
          id_number,
          first_name,
          last_name,
          email,
          role,
          email_verified,
          created_at,
          last_login
        FROM users
        WHERE id_number = ?
      `, [studentIdNumber]);

      if (users.length === 0) {
        return null;
      }

      const user = users[0];

      // Calculate account age
      const accountAge = this.calculateAccountAge(user.created_at);

      return {
        ...user,
        accountAge,
        fullName: `${user.first_name} ${user.last_name}`,
        isVerified: user.email_verified === 1,
        lastLoginFormatted: this.formatDate(user.last_login)
      };
    } catch (error) {
      logger.error('[ERROR] Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Get complete borrowing history
   * @param {string} studentIdNumber - Student ID number
   * @returns {Array} Borrowing history with book details
   */
  async getBorrowingHistory(studentIdNumber) {
    try {
      const [history] = await pool.execute(`
        SELECT
          bt.id as transaction_id,
          bt.borrowed_date,
          bt.due_date,
          bt.returned_date,
          bt.status,
          bt.created_at as transaction_created,
          b.id as book_id,
          b.title,
          b.author,
          b.description,
          b.publication_year,
          b.publisher,
          b.isbn,
          b.status as book_status,
          DATEDIFF(COALESCE(bt.returned_date, NOW()), bt.borrowed_date) as days_kept,
          CASE
            WHEN bt.returned_date IS NOT NULL THEN 1
            ELSE 0
          END as completed_reading,
          CASE
            WHEN bt.returned_date IS NULL AND bt.due_date < NOW() THEN 1
            ELSE 0
          END as is_overdue
        FROM borrowing_transactions bt
        JOIN books b ON bt.book_id = b.id
        WHERE bt.student_id_number = ?
        ORDER BY bt.borrowed_date DESC
      `, [studentIdNumber]);

      return history.map(record => ({
        ...record,
        borrowedDateFormatted: this.formatDate(record.borrowed_date),
        dueDateFormatted: this.formatDate(record.due_date),
        returnedDateFormatted: record.returned_date ? this.formatDate(record.returned_date) : null,
        isCurrentlyBorrowed: record.status === 'borrowed',
        isOverdue: record.is_overdue === 1,
        readingDuration: this.calculateReadingDuration(record.borrowed_date, record.returned_date)
      }));
    } catch (error) {
      logger.error('[ERROR] Error getting borrowing history:', error);
      return [];
    }
  }

  /**
   * Get current borrowings
   * @param {string} studentIdNumber - Student ID number
   * @returns {Array} Currently borrowed books
   */
  async getCurrentBorrowings(studentIdNumber) {
    try {
      const [current] = await pool.execute(`
        SELECT
          bt.id as transaction_id,
          bt.borrowed_date,
          bt.due_date,
          bt.status,
          b.id as book_id,
          b.title,
          b.author,
          b.description,
          b.publication_year,
          b.publisher,
          DATEDIFF(bt.due_date, NOW()) as days_until_due,
          CASE
            WHEN bt.due_date < NOW() THEN 1
            ELSE 0
          END as is_overdue
        FROM borrowing_transactions bt
        JOIN books b ON bt.book_id = b.id
        WHERE bt.student_id_number = ?
        AND bt.status IN ('borrowed', 'overdue')
        ORDER BY bt.due_date ASC
      `, [studentIdNumber]);

      return current.map(record => ({
        ...record,
        borrowedDateFormatted: this.formatDate(record.borrowed_date),
        dueDateFormatted: this.formatDate(record.due_date),
        isOverdue: record.is_overdue === 1,
        urgencyLevel: this.calculateUrgencyLevel(record.due_date)
      }));
    } catch (error) {
      logger.error('[ERROR] Error getting current borrowings:', error);
      return [];
    }
  }

  /**
   * Get comprehensive reading statistics
   * @param {string} studentIdNumber - Student ID number
   * @returns {Object} Reading statistics
   */
  async getReadingStatistics(studentIdNumber) {
    try {
      const [stats] = await pool.execute(`
        SELECT
          COUNT(*) as total_borrowed,
          COUNT(CASE WHEN returned_date IS NOT NULL THEN 1 END) as total_returned,
          COUNT(CASE WHEN status IN ('borrowed', 'overdue') THEN 1 END) as currently_borrowed,
          COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_books,
          COUNT(CASE WHEN DATEDIFF(COALESCE(returned_date, NOW()), borrowed_date) >= 7 THEN 1 END) as long_reads,
          AVG(DATEDIFF(COALESCE(returned_date, NOW()), borrowed_date)) as avg_reading_days,
          MIN(borrowed_date) as first_borrow_date,
          MAX(borrowed_date) as last_borrow_date,
          COUNT(DISTINCT book_id) as unique_books_read
        FROM borrowing_transactions
        WHERE student_id_number = ?
      `, [studentIdNumber]);

      const [monthlyStats] = await pool.execute(`
        SELECT
          DATE_FORMAT(borrowed_date, '%Y-%m') as month,
          COUNT(*) as books_borrowed
        FROM borrowing_transactions
        WHERE student_id_number = ?
        AND borrowed_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(borrowed_date, '%Y-%m')
        ORDER BY month DESC
      `, [studentIdNumber]);

      const [authorStats] = await pool.execute(`
        SELECT
          b.author,
          COUNT(*) as books_borrowed,
          AVG(DATEDIFF(COALESCE(bt.returned_date, NOW()), bt.borrowed_date)) as avg_reading_days
        FROM borrowing_transactions bt
        JOIN books b ON bt.book_id = b.id
        WHERE bt.student_id_number = ?
        GROUP BY b.author
        ORDER BY books_borrowed DESC
        LIMIT 10
      `, [studentIdNumber]);

      return {
        overview: stats[0] || {},
        monthly: monthlyStats,
        authors: authorStats,
        readingLevel: this.calculateReadingLevel(stats[0]),
        readingStreak: this.calculateReadingStreak(monthlyStats)
      };
    } catch (error) {
      logger.error('[ERROR] Error getting reading statistics:', error);
      return {};
    }
  }

  /**
   * Get user preferences and patterns
   * @param {string} studentIdNumber - Student ID number
   * @returns {Object} User preferences
   */
  async getUserPreferences(studentIdNumber) {
    try {
      // Since user_preferences table doesn't exist, return default preferences
      return this.getDefaultPreferences();
    } catch (error) {
      logger.error('[ERROR] Error getting user preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Get penalty information
   * @param {string} studentIdNumber - Student ID number
   * @returns {Object} Penalty information
   */
  async getPenaltyInformation(studentIdNumber) {
    try {
      const [penalties] = await pool.execute(`
        SELECT
          COUNT(*) as total_fines,
          SUM(fine_amount) as total_amount,
          SUM(CASE WHEN status = 'paid' THEN fine_amount ELSE 0 END) as paid_amount,
          SUM(CASE WHEN status = 'unpaid' THEN fine_amount ELSE 0 END) as unpaid_amount,
          COUNT(CASE WHEN status = 'unpaid' THEN 1 END) as unpaid_fines
        FROM fines
        WHERE student_id_number = ?
      `, [studentIdNumber]);

      const [recentFines] = await pool.execute(`
        SELECT
          id,
          fine_amount as amount,
          status,
          created_at
        FROM fines
        WHERE student_id_number = ?
        ORDER BY created_at DESC
        LIMIT 5
      `, [studentIdNumber]);

      return {
        summary: penalties[0] || {},
        recent: recentFines.map(fine => ({
          ...fine,
          createdFormatted: this.formatDate(fine.created_at),
          paidFormatted: null
        })),
        hasUnpaidFines: (penalties[0]?.unpaid_fines || 0) > 0,
        canBorrow: (penalties[0]?.unpaid_fines || 0) === 0
      };
    } catch (error) {
      logger.error('[ERROR] Error getting penalty information:', error);
      return { summary: {}, recent: [], hasUnpaidFines: false, canBorrow: true };
    }
  }

  /**
   * Get user activity logs
   * @param {string} studentIdNumber - Student ID number
   * @returns {Array} Recent activity logs
   */
  async getUserActivityLogs(studentIdNumber) {
    try {
      // Since activity_logs table doesn't exist, return empty array
      return [];
    } catch (error) {
      logger.error('[ERROR] Error getting user activity logs:', error);
      return [];
    }
  }

  /**
   * Analyze reading patterns
   * @param {Array} borrowingHistory - User's borrowing history
   * @returns {Object} Reading pattern analysis
   */
  analyzeReadingPatterns(borrowingHistory) {
    if (borrowingHistory.length === 0) {
      return this.getDefaultPatterns();
    }

    const patterns = {
      readingFrequency: this.calculateReadingFrequency(borrowingHistory),
      preferredAuthors: this.extractPreferredAuthors(borrowingHistory),
      readingSpeed: this.calculateReadingSpeed(borrowingHistory),
      completionRate: this.calculateCompletionRate(borrowingHistory),
      diversityScore: this.calculateDiversityScore(borrowingHistory)
    };

    return patterns;
  }

  /**
   * Analyze reading trends
   * @param {Array} borrowingHistory - User's borrowing history
   * @returns {Object} Reading trend analysis
   */
  analyzeReadingTrends(borrowingHistory) {
    if (borrowingHistory.length === 0) {
      return { trend: 'new_user', direction: 'stable' };
    }

    const monthlyData = this.groupByMonth(borrowingHistory);
    const trend = this.calculateTrend(monthlyData);

    return {
      trend: trend.direction,
      strength: trend.strength,
      recentActivity: this.getRecentActivity(monthlyData),
      peakMonths: this.getPeakMonths(monthlyData),
      readingMomentum: this.calculateMomentum(monthlyData)
    };
  }

  /**
   * Generate AI context for chatbot
   * @param {Object} profile - User profile
   * @param {Array} history - Borrowing history
   * @param {Object} preferences - User preferences
   * @param {Object} penalties - Penalty information
   * @returns {string} AI context string
   */
  generateAIContext(profile, history, preferences, penalties) {
    if (!profile) {
      return "User profile not found.";
    }

    const context = `
USER PROFILE:
- Name: ${profile.fullName}
- Student ID: ${profile.id_number}
- Account Age: ${profile.accountAge}
- Email Verified: ${profile.isVerified ? 'Yes' : 'No'}
- Last Login: ${profile.lastLoginFormatted}

BORROWING HISTORY:
- Total Books Borrowed: ${history.length}
- Currently Borrowed: ${history.filter(h => h.isCurrentlyBorrowed).length}
- Overdue Books: ${history.filter(h => h.isOverdue).length}
- Completion Rate: ${this.calculateCompletionRate(history)}%

READING PREFERENCES:
- Favorite Genres: ${this.extractPreferredGenres(history).slice(0, 3).join(', ')}
- Favorite Authors: ${this.extractPreferredAuthors(history).slice(0, 3).join(', ')}
- Reading Speed: ${this.calculateReadingSpeed(history)}

CURRENT STATUS:
- Can Borrow: ${penalties.canBorrow ? 'Yes' : 'No'}
- Unpaid Fines: ${penalties.summary.unpaid_amount || 0} pesos
- Account Status: ${this.getAccountStatus(profile, penalties)}

RECENT ACTIVITY:
- Last Borrowed: ${history.length > 0 ? history[0].borrowedDateFormatted : 'Never'}
- Most Recent Book: ${history.length > 0 ? history[0].title : 'None'}
    `.trim();

    return context;
  }

  /**
   * Generate user summary for quick reference
   * @param {Object} profile - User profile
   * @param {Object} stats - Reading statistics
   * @param {Object} preferences - User preferences
   * @returns {Object} User summary
   */
  generateUserSummary(profile, stats, preferences) {
    return {
      name: profile?.fullName || 'Unknown',
      id: profile?.id_number || 'Unknown',
      totalBooks: stats.overview?.total_borrowed || 0,
      currentBooks: stats.overview?.currently_borrowed || 0,
      overdueBooks: stats.overview?.overdue_books || 0,
      readingLevel: stats.readingLevel || 'Beginner',
      favoriteGenre: this.extractPreferredGenres([]).slice(0, 1)[0] || 'None',
      canBorrow: true, // Will be updated with penalty info
      lastActivity: profile?.lastLoginFormatted || 'Never'
    };
  }

  // Helper methods
  calculateAccountAge(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  }

  formatDate(date) {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  calculateReadingDuration(borrowedDate, returnedDate) {
    if (!returnedDate) return 'Currently reading';
    const borrowed = new Date(borrowedDate);
    const returned = new Date(returnedDate);
    const diffTime = Math.abs(returned - borrowed);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  }

  calculateUrgencyLevel(dueDate) {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'due-today';
    if (diffDays <= 2) return 'urgent';
    if (diffDays <= 5) return 'soon';
    return 'normal';
  }

  calculateReadingLevel(stats) {
    const totalBooks = stats?.total_borrowed || 0;
    const avgDays = stats?.avg_reading_days || 0;

    if (totalBooks === 0) return 'New Reader';
    if (totalBooks < 5) return 'Beginner';
    if (totalBooks < 15) return 'Intermediate';
    if (totalBooks < 30) return 'Advanced';
    return 'Expert';
  }

  calculateReadingStreak(monthlyStats) {
    if (monthlyStats.length === 0) return 0;

    let streak = 0;
    const currentMonth = new Date().toISOString().slice(0, 7);

    for (let i = 0; i < monthlyStats.length; i++) {
      if (monthlyStats[i].month === currentMonth || monthlyStats[i].books_borrowed > 0) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  calculateReadingFrequency(history) {
    if (history.length === 0) return 'No activity';

    const firstBorrow = new Date(history[history.length - 1].borrowed_date);
    const lastBorrow = new Date(history[0].borrowed_date);
    const totalDays = Math.ceil((lastBorrow - firstBorrow) / (1000 * 60 * 60 * 24));
    const booksPerMonth = (history.length / totalDays) * 30;

    if (booksPerMonth >= 4) return 'Very Active';
    if (booksPerMonth >= 2) return 'Active';
    if (booksPerMonth >= 1) return 'Moderate';
    return 'Occasional';
  }

  extractPreferredGenres(history) {
    // Since books table doesn't have category field, return empty array
    return [];
  }

  extractPreferredAuthors(history) {
    const authorCount = {};
    history.forEach(record => {
      if (record.author) {
        authorCount[record.author] = (authorCount[record.author] || 0) + 1;
      }
    });

    return Object.entries(authorCount)
      .sort(([,a], [,b]) => b - a)
      .map(([author]) => author);
  }

  calculateReadingSpeed(history) {
    if (history.length === 0) return 'Unknown';

    const completedBooks = history.filter(h => h.completed_reading);
    if (completedBooks.length === 0) return 'Unknown';

    const totalDays = completedBooks.reduce((sum, book) => sum + book.days_kept, 0);
    const avgDays = totalDays / completedBooks.length;

    if (avgDays <= 3) return 'Very Fast';
    if (avgDays <= 7) return 'Fast';
    if (avgDays <= 14) return 'Moderate';
    if (avgDays <= 21) return 'Slow';
    return 'Very Slow';
  }

  calculateCompletionRate(history) {
    if (history.length === 0) return 0;
    const completed = history.filter(h => h.completed_reading).length;
    return Math.round((completed / history.length) * 100);
  }

  calculateDiversityScore(history) {
    if (history.length === 0) return 0;

    const uniqueGenres = new Set(history.map(h => h.category)).size;
    const uniqueAuthors = new Set(history.map(h => h.author)).size;
    const totalBooks = history.length;

    const genreDiversity = uniqueGenres / Math.min(totalBooks, 10);
    const authorDiversity = uniqueAuthors / Math.min(totalBooks, 10);

    return Math.round(((genreDiversity + authorDiversity) / 2) * 100);
  }

  getAccountStatus(profile, penalties) {
    if (!profile) return 'Unknown';
    if (!profile.isVerified) return 'Unverified';
    if (penalties.hasUnpaidFines) return 'Restricted';
    return 'Active';
  }

  getDefaultPreferences() {
    return {
      parsed: {
        notifications: { email: true, push: true },
        goals: { monthly: 0, yearly: 0 },
        genres: [],
        authors: [],
        schedule: {}
      }
    };
  }

  getDefaultPatterns() {
    return {
      readingFrequency: 'No activity',
      preferredAuthors: [],
      readingSpeed: 'Unknown',
      completionRate: 0,
      diversityScore: 0
    };
  }

  formatAction(action) {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  groupByMonth(history) {
    const monthly = {};
    history.forEach(record => {
      if (record.borrowed_date) {
        try {
          const date = new Date(record.borrowed_date);
          if (!isNaN(date.getTime())) {
            const month = date.toISOString().slice(0, 7);
            if (!monthly[month]) monthly[month] = 0;
            monthly[month]++;
          }
        } catch (error) {
          logger.info('Invalid date:', record.borrowed_date);
        }
      }
    });
    return monthly;
  }

  calculateTrend(monthlyData) {
    const months = Object.keys(monthlyData).sort();
    if (months.length < 2) return { direction: 'stable', strength: 0 };

    const recent = months.slice(-3).reduce((sum, month) => sum + monthlyData[month], 0);
    const earlier = months.slice(-6, -3).reduce((sum, month) => sum + monthlyData[month], 0);

    if (recent > earlier * 1.2) return { direction: 'increasing', strength: 'strong' };
    if (recent < earlier * 0.8) return { direction: 'decreasing', strength: 'strong' };
    return { direction: 'stable', strength: 'moderate' };
  }

  getRecentActivity(monthlyData) {
    const months = Object.keys(monthlyData).sort().slice(-3);
    return months.map(month => ({
      month,
      books: monthlyData[month]
    }));
  }

  getPeakMonths(monthlyData) {
    return Object.entries(monthlyData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([month, books]) => ({ month, books }));
  }

  calculateMomentum(monthlyData) {
    const months = Object.keys(monthlyData).sort();
    if (months.length < 2) return 'stable';

    const recent = months.slice(-2).reduce((sum, month) => sum + monthlyData[month], 0);
    const previous = months.slice(-4, -2).reduce((sum, month) => sum + monthlyData[month], 0);

    if (recent > previous * 1.5) return 'accelerating';
    if (recent < previous * 0.5) return 'decelerating';
    return 'stable';
  }
}

module.exports = new UserKnowledgeService();
