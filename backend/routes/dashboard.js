const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Get comprehensive dashboard statistics
router.get('/api/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    const connection = await db.getConnection();
    
    // User Statistics
    const [userStats] = await connection.execute(`
      SELECT 
        COUNT(*) as totalUsers,
        COUNT(CASE WHEN email_verified = 1 THEN 1 END) as verifiedUsers,
        COUNT(CASE WHEN DATE(last_login) = CURDATE() THEN 1 END) as todayLogins,
        COUNT(CASE WHEN role = 'student' THEN 1 END) as totalStudents,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as totalAdmins
      FROM users
    `);

    // Book Statistics
    const [bookStats] = await connection.execute(`
      SELECT 
        COUNT(*) as totalBooks,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as availableBooks,
        COUNT(CASE WHEN status IN ('borrowed', 'overdue') THEN 1 END) as borrowedBooks,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdueBooks,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as addedToday
      FROM books
    `);

    // Borrowing Statistics
    const [borrowingStats] = await connection.execute(`
      SELECT 
        COUNT(CASE WHEN status IN ('borrowed', 'overdue') THEN 1 END) as currentlyBorrowed,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdueBooks,
        COUNT(CASE WHEN DATE(borrowed_date) = CURDATE() THEN 1 END) as todayBorrowings,
        COUNT(CASE WHEN DATE(returned_date) = CURDATE() THEN 1 END) as todayReturns,
        COUNT(CASE WHEN status = 'returned' AND DATE(returned_date) = CURDATE() THEN 1 END) as todayReturns
      FROM borrowing_transactions
    `);

    // Penalty Statistics
    const [penaltyStats] = await connection.execute(`
      SELECT 
        COUNT(*) as totalFines,
        COUNT(CASE WHEN paid_amount = 0 THEN 1 END) as unpaidFines,
        COALESCE(SUM(fine_amount), 0) as totalAmount,
        COALESCE(SUM(fine_amount - paid_amount), 0) as unpaidAmount,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as finesToday
      FROM fines
    `);

    // Activity Statistics
    const [activityStats] = await connection.execute(`
      SELECT 
        COUNT(*) as totalLogs,
        COUNT(CASE WHEN DATE(login_time) = CURDATE() THEN 1 END) as todayLogins,
        COUNT(CASE WHEN DATE(login_time) = CURDATE() THEN 1 END) as todayLogins,
        COUNT(DISTINCT user_id) as activeUsers,
        COUNT(CASE WHEN DATE(login_time) = CURDATE() THEN 1 END) as systemActivity
      FROM login_logs
    `);

    // Recent Activity
    const [recentActivity] = await connection.execute(`
      SELECT 
        ll.id,
        ll.login_time as time,
        ll.user_type,
        ll.user_id,
        ll.ip_address,
        ll.user_agent,
        'login' as action
      FROM login_logs ll
      ORDER BY ll.login_time DESC
      LIMIT 10
    `);

    // System Health
    const [systemHealth] = await connection.execute(`
      SELECT 
        'Online' as status,
        NOW() as lastCheck,
        (SELECT COUNT(*) FROM users WHERE last_login > DATE_SUB(NOW(), INTERVAL 1 HOUR)) as activeUsers
    `);

    connection.release();

    const dashboardStats = {
      users: {
        total: userStats[0].totalUsers,
        verified: userStats[0].verifiedUsers,
        todayLogins: userStats[0].todayLogins,
        students: userStats[0].totalStudents,
        admins: userStats[0].totalAdmins,
        verificationRate: userStats[0].totalUsers > 0 ? 
          Math.round((userStats[0].verifiedUsers / userStats[0].totalUsers) * 100) : 0
      },
      books: {
        total: bookStats[0].totalBooks,
        available: bookStats[0].availableBooks,
        borrowed: bookStats[0].borrowedBooks,
        overdue: bookStats[0].overdueBooks,
        addedToday: bookStats[0].addedToday
      },
      borrowing: {
        currentlyBorrowed: borrowingStats[0].currentlyBorrowed,
        overdueBooks: borrowingStats[0].overdueBooks,
        todayBorrowings: borrowingStats[0].todayBorrowings,
        todayReturns: borrowingStats[0].todayReturns
      },
      penalties: {
        totalFines: penaltyStats[0].totalFines,
        unpaidFines: penaltyStats[0].unpaidFines,
        totalAmount: penaltyStats[0].totalAmount,
        unpaidAmount: penaltyStats[0].unpaidAmount,
        finesToday: penaltyStats[0].finesToday
      },
      activity: {
        totalLogs: activityStats[0].totalLogs,
        todayLogins: activityStats[0].todayLogins,
        activeUsers: activityStats[0].activeUsers,
        systemActivity: activityStats[0].systemActivity
      },
      system: {
        status: systemHealth[0].status,
        lastCheck: systemHealth[0].lastCheck,
        activeUsers: systemHealth[0].activeUsers
      },
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        time: activity.time,
        userType: activity.user_type,
        userId: activity.user_id,
        ipAddress: activity.ip_address,
        userAgent: activity.user_agent,
        action: activity.action
      }))
    };

    res.json({
      success: true,
      data: dashboardStats
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
});

module.exports = router;
