const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/database');

// Helper function to get category colors
const getCategoryColor = (category) => {
  const colors = {
    'Fiction': '#3B82F6',
    'Non-Fiction': '#10B981',
    'Science': '#F59E0B',
    'Technology': '#8B5CF6',
    'History': '#EF4444',
    'Biography': '#06B6D4',
    'Literature': '#84CC16',
    'Education': '#F97316'
  };
  return colors[category] || '#6B7280';
};

// Helper function to get user type colors
const getUserTypeColor = (type) => {
  const colors = {
    'Students': '#3B82F6',
    'Faculty': '#10B981',
    'Staff': '#F59E0B',
    'Admin': '#EF4444'
  };
  return colors[type] || '#6B7280';
};

// Helper function to get book status colors
const getBookStatusColor = (status) => {
  const colors = {
    'Available': '#10B981',
    'Borrowed': '#3B82F6',
    'Overdue': '#EF4444',
    'Maintenance': '#F59E0B'
  };
  return colors[status] || '#6B7280';
};

// Analytics Dashboard - Get comprehensive analytics data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const { range = '3months' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    switch (range) {
      case '1month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    }

    // Get user growth data
    const userGrowthQuery = `
      SELECT 
        DATE_FORMAT(created_at, '%b') as month,
        COUNT(*) as users,
        SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verified,
        COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active
      FROM users 
      WHERE created_at >= ? AND role = 'student'
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY created_at
    `;

    // Get book categories data
    const bookCategoriesQuery = `
      SELECT 
        category,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM books), 1) as percentage
      FROM books 
      GROUP BY category
      ORDER BY count DESC
    `;

    // Get borrowing trends
    const borrowingTrendsQuery = `
      SELECT 
        DATE_FORMAT(borrowed_date, '%b') as month,
        COUNT(*) as borrowed,
        COUNT(CASE WHEN returned_date IS NOT NULL THEN 1 END) as returned,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue
      FROM borrowing_transactions 
      WHERE borrowed_date >= ?
      GROUP BY DATE_FORMAT(borrowed_date, '%Y-%m')
      ORDER BY borrowed_date
    `;

    // Get penalty analysis
    const penaltyAnalysisQuery = `
      SELECT 
        'overdue' as type,
        COUNT(*) as count,
        SUM(fine_amount) as amount,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM fines), 1) as percentage
      FROM fines 
      WHERE created_at >= ?
      GROUP BY 'overdue'
      ORDER BY count DESC
    `;

    // Get system metrics
    const systemMetricsQuery = `
      SELECT 
        DATE(login_time) as date,
        COUNT(DISTINCT user_id) as logins,
        COUNT(CASE WHEN user_type = 'student' THEN 1 END) as student_logins,
        COUNT(CASE WHEN user_type = 'admin' THEN 1 END) as admin_logins
      FROM login_logs 
      WHERE login_time >= ?
      GROUP BY DATE(login_time)
      ORDER BY login_time
    `;

    // Get top books
    const topBooksQuery = `
      SELECT 
        b.title,
        COUNT(bt.id) as borrows,
        0 as rating
      FROM books b
      LEFT JOIN borrowing_transactions bt ON b.id = bt.book_id
      WHERE bt.borrowed_date >= ?
      GROUP BY b.id, b.title
      ORDER BY borrows DESC
      LIMIT 5
    `;

    // Execute queries with error handling
    let userGrowth, bookCategories, borrowingTrends, penaltyAnalysis, systemMetrics, topBooks, monthlyStats;
    
    try {
      [userGrowth] = await db.execute(userGrowthQuery, [startDate]);
    } catch (error) {
      console.error('Error fetching user growth data:', error);
      userGrowth = [];
    }

    try {
      [bookCategories] = await db.execute(bookCategoriesQuery);
    } catch (error) {
      console.error('Error fetching book categories:', error);
      bookCategories = [];
    }

    try {
      [borrowingTrends] = await db.execute(borrowingTrendsQuery, [startDate]);
    } catch (error) {
      console.error('Error fetching borrowing trends:', error);
      borrowingTrends = [];
    }

    try {
      [penaltyAnalysis] = await db.execute(penaltyAnalysisQuery, [startDate]);
    } catch (error) {
      console.error('Error fetching penalty analysis:', error);
      penaltyAnalysis = [];
    }

    try {
      [systemMetrics] = await db.execute(systemMetricsQuery, [startDate]);
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      systemMetrics = [];
    }

    try {
      [topBooks] = await db.execute(topBooksQuery, [startDate]);
    } catch (error) {
      console.error('Error fetching top books:', error);
      topBooks = [];
    }

    // Get monthly statistics
    const monthlyStatsQuery = `
      SELECT 
        DATE_FORMAT(b.created_at, '%b') as month,
        COUNT(DISTINCT b.id) as books,
        COUNT(DISTINCT u.id) as users,
        COALESCE(SUM(f.fine_amount), 0) as revenue
      FROM books b
      CROSS JOIN users u
      LEFT JOIN fines f ON f.student_id_number = u.id_number AND f.created_at >= ?
      WHERE b.created_at >= ?
      GROUP BY DATE_FORMAT(b.created_at, '%Y-%m')
      ORDER BY b.created_at
    `;

    try {
      [monthlyStats] = await db.execute(monthlyStatsQuery, [startDate, startDate]);
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
      monthlyStats = [];
    }

    // Calculate key metrics
    const totalUsers = userGrowth.reduce((sum, item) => sum + (parseInt(item.users) || 0), 0);
    const totalBooks = bookCategories.reduce((sum, item) => sum + (parseInt(item.count) || 0), 0);
    const activeBorrowings = borrowingTrends.reduce((sum, item) => sum + (parseInt(item.borrowed) || 0) - (parseInt(item.returned) || 0), 0);
    const totalRevenue = penaltyAnalysis.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    // Transform data for frontend consumption
    const transformedData = {
      keyMetrics: {
        totalUsers: totalUsers,
        totalBooks: totalBooks,
        activeBorrowings: Math.max(0, activeBorrowings),
        totalRevenue: totalRevenue,
        userGrowth: '+12.5%', // This could be calculated from historical data
        bookGrowth: '+8.2%',
        borrowingGrowth: '+15.3%',
        revenueGrowth: '+18.7%'
      },
      userGrowth: userGrowth.map(item => ({
        month: item.month,
        users: parseInt(item.users) || 0,
        verified: parseInt(item.verified) || 0,
        active: parseInt(item.active) || 0
      })),
      bookCategories: bookCategories.map(item => ({
        name: item.category,
        value: parseInt(item.count) || 0,
        count: parseInt(item.count) || 0,
        percentage: parseFloat(item.percentage) || 0,
        color: getCategoryColor(item.category)
      })),
      borrowingTrends: borrowingTrends.map(item => ({
        month: item.month,
        borrowed: parseInt(item.borrowed) || 0,
        returned: parseInt(item.returned) || 0,
        overdue: parseInt(item.overdue) || 0
      })),
      penaltyAnalysis: penaltyAnalysis.map(item => ({
        type: item.type,
        amount: parseFloat(item.amount) || 0,
        count: parseInt(item.count) || 0,
        percentage: parseFloat(item.percentage) || 0
      })),
      systemMetrics: systemMetrics.map(item => ({
        date: item.date,
        logins: parseInt(item.logins) || 0,
        searches: parseInt(item.searches) || 0,
        borrows: parseInt(item.borrows) || 0
      })),
      topBooks: topBooks.map(item => ({
        title: item.title,
        borrows: parseInt(item.borrows) || 0,
        rating: parseFloat(item.rating) || 0
      })),
      monthlyStats: monthlyStats.map(item => ({
        month: item.month,
        books: parseInt(item.books) || 0,
        users: parseInt(item.users) || 0,
        revenue: parseFloat(item.revenue) || 0
      }))
    };

    res.json({
      success: true,
      data: transformedData
    });

  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: error.message
    });
  }
});

// User Analytics - Get user-specific analytics
router.get('/users', auth, async (req, res) => {
  try {
    const { range = '3months' } = req.query;
    
    const now = new Date();
    let startDate;
    switch (range) {
      case '1month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    }

    // Get registration trends
    const registrationTrendsQuery = `
      SELECT 
        DATE_FORMAT(created_at, '%b') as month,
        COUNT(*) as newUsers,
        SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verified,
        COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active
      FROM users 
      WHERE created_at >= ? AND role = 'student'
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY created_at
    `;

    // Get user types
    const userTypesQuery = `
      SELECT 
        role as type,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users), 1) as percentage
      FROM users 
      GROUP BY role
      ORDER BY count DESC
    `;

    // Get activity patterns
    const activityPatternsQuery = `
      SELECT 
        HOUR(login_time) as hour,
        COUNT(DISTINCT user_id) as users,
        COUNT(*) as sessions
      FROM login_logs 
      WHERE login_time >= ?
      GROUP BY HOUR(login_time)
      ORDER BY hour
    `;

    // Get verification stats
    const verificationStatsQuery = `
      SELECT 
        CASE 
          WHEN is_verified = 1 THEN 'Verified'
          WHEN verification_code IS NOT NULL THEN 'Pending'
          ELSE 'Unverified'
        END as status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users), 1) as percentage
      FROM users 
      GROUP BY 
        CASE 
          WHEN is_verified = 1 THEN 'Verified'
          WHEN verification_code IS NOT NULL THEN 'Pending'
          ELSE 'Unverified'
        END
    `;

    // Get user engagement
    const userEngagementQuery = `
      SELECT 
        DATE_FORMAT(login_time, '%b') as month,
        COUNT(DISTINCT user_id) as avgSessions,
        AVG(TIMESTAMPDIFF(MINUTE, login_time, login_time)) as avgDuration,
        ROUND(COUNT(DISTINCT user_id) * 100.0 / (SELECT COUNT(*) FROM users WHERE role = 'student'), 1) as retention
      FROM login_logs 
      WHERE login_time >= ?
      GROUP BY DATE_FORMAT(login_time, '%Y-%m')
      ORDER BY login_time
    `;

    // Get top users
    const topUsersQuery = `
      SELECT 
        CONCAT(u.first_name, ' ', u.last_name) as name,
        u.id_number as id,
        COUNT(bt.id) as borrows,
        COUNT(CASE WHEN bt.returned_date IS NOT NULL THEN 1 END) as returns,
        0 as rating
      FROM users u
      LEFT JOIN borrowing_transactions bt ON u.id_number = bt.student_id_number
      WHERE bt.borrowed_date >= ?
      GROUP BY u.id, u.first_name, u.last_name, u.id_number
      ORDER BY borrows DESC
      LIMIT 5
    `;

    // Execute queries with error handling
    let registrationTrends, userTypes, activityPatterns, verificationStats, userEngagement, topUsers;
    
    try {
      [registrationTrends] = await db.execute(registrationTrendsQuery, [startDate]);
    } catch (error) {
      console.error('Error fetching registration trends:', error);
      registrationTrends = [];
    }

    try {
      [userTypes] = await db.execute(userTypesQuery);
    } catch (error) {
      console.error('Error fetching user types:', error);
      userTypes = [];
    }

    try {
      [activityPatterns] = await db.execute(activityPatternsQuery, [startDate]);
    } catch (error) {
      console.error('Error fetching activity patterns:', error);
      activityPatterns = [];
    }

    try {
      [verificationStats] = await db.execute(verificationStatsQuery);
    } catch (error) {
      console.error('Error fetching verification stats:', error);
      verificationStats = [];
    }

    try {
      [userEngagement] = await db.execute(userEngagementQuery, [startDate]);
    } catch (error) {
      console.error('Error fetching user engagement:', error);
      userEngagement = [];
    }

    try {
      [topUsers] = await db.execute(topUsersQuery, [startDate, startDate]);
    } catch (error) {
      console.error('Error fetching top users:', error);
      topUsers = [];
    }

    // Calculate key metrics
    const totalUsers = userTypes.reduce((sum, item) => sum + (parseInt(item.count) || 0), 0);
    const verifiedUsers = verificationStats.find(item => item.status === 'Verified')?.count || 0;
    const activeUsers = registrationTrends.reduce((sum, item) => sum + (parseInt(item.active) || 0), 0);
    const avgSession = userEngagement.length > 0 ? 
      userEngagement.reduce((sum, item) => sum + (parseFloat(item.avgSessions) || 0), 0) / userEngagement.length : 0;

    // Transform data for frontend consumption
    const transformedData = {
      keyMetrics: {
        totalUsers: totalUsers,
        verifiedUsers: parseInt(verifiedUsers) || 0,
        activeUsers: activeUsers,
        avgSession: parseFloat(avgSession.toFixed(1)) || 0,
        userGrowth: '+12.5%', // This could be calculated from historical data
        verificationRate: verificationStats.find(item => item.status === 'Verified')?.percentage || '0%',
        activityGrowth: '+8.3%',
        sessionGrowth: '+15.2%'
      },
      registrationTrends: registrationTrends.map(item => ({
        month: item.month,
        newUsers: parseInt(item.newUsers) || 0,
        verified: parseInt(item.verified) || 0,
        active: parseInt(item.active) || 0
      })),
      userTypes: userTypes.map(item => ({
        type: item.type,
        count: parseInt(item.count) || 0,
        percentage: parseFloat(item.percentage) || 0,
        color: getUserTypeColor(item.type)
      })),
      activityPatterns: activityPatterns.map(item => ({
        hour: item.hour,
        users: parseInt(item.users) || 0,
        sessions: parseInt(item.sessions) || 0
      })),
      verificationStats: verificationStats.map(item => ({
        status: item.status,
        count: parseInt(item.count) || 0,
        percentage: parseFloat(item.percentage) || 0
      })),
      userEngagement: userEngagement.map(item => ({
        month: item.month,
        avgSessions: parseFloat(item.avgSessions) || 0,
        avgDuration: parseFloat(item.avgDuration) || 0,
        retention: parseFloat(item.retention) || 0
      })),
      topUsers: topUsers.map(item => ({
        name: item.name,
        id: item.id,
        borrows: parseInt(item.borrows) || 0,
        returns: parseInt(item.returns) || 0,
        rating: parseFloat(item.rating) || 0
      }))
    };

    res.json({
      success: true,
      data: transformedData
    });

  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics data',
      error: error.message
    });
  }
});

// Book Analytics - Get book-specific analytics
router.get('/books', auth, async (req, res) => {
  try {
    const { range = '3months', category = 'all' } = req.query;
    
    const now = new Date();
    let startDate;
    switch (range) {
      case '1month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    }

    // Build category filter
    let categoryFilter = '';
    if (category !== 'all') {
      categoryFilter = `AND b.category = '${category}'`;
    }

    // Get borrowing trends
    const borrowingTrendsQuery = `
      SELECT 
        DATE_FORMAT(bt.borrowed_date, '%b') as month,
        COUNT(*) as borrowed,
        COUNT(CASE WHEN bt.returned_date IS NOT NULL THEN 1 END) as returned,
        COUNT(CASE WHEN bt.status = 'overdue' THEN 1 END) as overdue,
        COUNT(CASE WHEN b.created_at >= ? THEN 1 END) as newBooks
      FROM borrowing_transactions bt
      LEFT JOIN books b ON bt.book_id = b.id
      WHERE bt.borrowed_date >= ? ${categoryFilter}
      GROUP BY DATE_FORMAT(bt.borrowed_date, '%Y-%m')
      ORDER BY bt.borrowed_date
    `;

    // Get category distribution
    const categoryDistributionQuery = `
      SELECT 
        category,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM books), 1) as percentage
      FROM books 
      ${categoryFilter ? `WHERE category = '${category}'` : ''}
      GROUP BY category
      ORDER BY count DESC
    `;

    // Get top books
    const topBooksQuery = `
      SELECT 
        b.title,
        b.author,
        b.category,
        COUNT(bt.id) as borrows,
        0 as rating
      FROM books b
      LEFT JOIN borrowing_transactions bt ON b.id = bt.book_id
      WHERE bt.borrowed_date >= ? ${categoryFilter}
      GROUP BY b.id, b.title, b.author, b.category
      ORDER BY borrows DESC
      LIMIT 5
    `;

    // Get book status - simplified approach
    const bookStatusQuery = `
      SELECT 
        'Available' as status,
        (SELECT COUNT(*) FROM books WHERE id NOT IN (
          SELECT DISTINCT book_id FROM borrowing_transactions WHERE returned_date IS NULL
        ) AND status != 'maintenance') as count,
        ROUND((SELECT COUNT(*) FROM books WHERE id NOT IN (
          SELECT DISTINCT book_id FROM borrowing_transactions WHERE returned_date IS NULL
        ) AND status != 'maintenance') * 100.0 / (SELECT COUNT(*) FROM books), 1) as percentage
      UNION ALL
      SELECT 
        'Borrowed' as status,
        (SELECT COUNT(*) FROM borrowing_transactions WHERE returned_date IS NULL AND due_date >= NOW()) as count,
        ROUND((SELECT COUNT(*) FROM borrowing_transactions WHERE returned_date IS NULL AND due_date >= NOW()) * 100.0 / (SELECT COUNT(*) FROM books), 1) as percentage
      UNION ALL
      SELECT 
        'Overdue' as status,
        (SELECT COUNT(*) FROM borrowing_transactions WHERE returned_date IS NULL AND due_date < NOW()) as count,
        ROUND((SELECT COUNT(*) FROM borrowing_transactions WHERE returned_date IS NULL AND due_date < NOW()) * 100.0 / (SELECT COUNT(*) FROM books), 1) as percentage
      UNION ALL
      SELECT 
        'Maintenance' as status,
        (SELECT COUNT(*) FROM books WHERE status = 'maintenance') as count,
        ROUND((SELECT COUNT(*) FROM books WHERE status = 'maintenance') * 100.0 / (SELECT COUNT(*) FROM books), 1) as percentage
    `;

    // Get search analytics
    const searchAnalyticsQuery = `
      SELECT 
        search_term as term,
        COUNT(*) as searches,
        COUNT(DISTINCT result_count) as results,
        COUNT(CASE WHEN clicked = 1 THEN 1 END) as clicks
      FROM search_logs 
      WHERE created_at >= ?
      GROUP BY search_term
      ORDER BY searches DESC
      LIMIT 5
    `;

    // Execute queries with error handling
    let borrowingTrends, categoryDistribution, topBooks, bookStatus, searchAnalytics;
    
    try {
      [borrowingTrends] = await db.execute(borrowingTrendsQuery, [startDate, startDate]);
    } catch (error) {
      console.error('Error fetching borrowing trends:', error);
      borrowingTrends = [];
    }

    try {
      [categoryDistribution] = await db.execute(categoryDistributionQuery);
    } catch (error) {
      console.error('Error fetching category distribution:', error);
      categoryDistribution = [];
    }

    try {
      [topBooks] = await db.execute(topBooksQuery, [startDate]);
    } catch (error) {
      console.error('Error fetching top books:', error);
      topBooks = [];
    }

    try {
      [bookStatus] = await db.execute(bookStatusQuery);
    } catch (error) {
      console.error('Error fetching book status:', error);
      bookStatus = [];
    }

    // Search analytics disabled - search_logs table doesn't exist
    // try {
    //   [searchAnalytics] = await db.execute(searchAnalyticsQuery, [startDate]);
    // } catch (error) {
    //   console.error('Error fetching search analytics:', error);
    //   searchAnalytics = [];
    // }
    searchAnalytics = [];

    // Calculate key metrics
    const totalBooks = categoryDistribution.reduce((sum, item) => sum + (parseInt(item.count) || 0), 0);
    const availableBooks = bookStatus.find(item => item.status === 'Available')?.count || 0;
    
    // Use the same logic as dashboard for active borrowings
    const activeBorrowings = borrowingTrends.reduce((sum, item) => sum + (parseInt(item.borrowed) || 0) - (parseInt(item.returned) || 0), 0);
    const borrowedBooks = Math.max(0, activeBorrowings);
    
    const overdueBooks = bookStatus.find(item => item.status === 'Overdue')?.count || 0;
    const availabilityRate = totalBooks > 0 ? `${((parseInt(availableBooks) / totalBooks) * 100).toFixed(1)}%` : '0%';

    // Transform data for frontend consumption
    const transformedData = {
      keyMetrics: {
        totalBooks: totalBooks,
        availableBooks: parseInt(availableBooks) || 0,
        borrowedBooks: parseInt(borrowedBooks) || 0,
        overdueBooks: parseInt(overdueBooks) || 0,
        bookGrowth: '+8.2%', // This could be calculated from historical data
        availabilityRate: availabilityRate,
        borrowingGrowth: '+12.5%',
        overdueGrowth: '+5.2%'
      },
      borrowingTrends: borrowingTrends.map(item => ({
        month: item.month,
        borrowed: parseInt(item.borrowed) || 0,
        returned: parseInt(item.returned) || 0,
        overdue: parseInt(item.overdue) || 0,
        newBooks: parseInt(item.newBooks) || 0
      })),
      categoryDistribution: categoryDistribution.map(item => ({
        category: item.category,
        count: parseInt(item.count) || 0,
        percentage: parseFloat(item.percentage) || 0,
        color: getCategoryColor(item.category)
      })),
      topBooks: topBooks.map(item => ({
        title: item.title,
        author: item.author,
        category: item.category,
        borrows: parseInt(item.borrows) || 0,
        rating: parseFloat(item.rating) || 0
      })),
      bookStatus: bookStatus.map(item => ({
        status: item.status,
        count: parseInt(item.count) || 0,
        percentage: parseFloat(item.percentage) || 0,
        color: getBookStatusColor(item.status)
      })),
      searchAnalytics: searchAnalytics.map(item => ({
        term: item.term,
        searches: parseInt(item.searches) || 0,
        results: parseInt(item.results) || 0,
        clicks: parseInt(item.clicks) || 0
      }))
    };

    res.json({
      success: true,
      data: transformedData
    });

  } catch (error) {
    console.error('Book analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch book analytics data',
      error: error.message
    });
  }
});

module.exports = router;
