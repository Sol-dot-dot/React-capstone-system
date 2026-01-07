const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/database');

const { logger } = require('../config/logger');
// Get Simple Dashboard Statistics
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    // Get total books
    const [totalBooksResult] = await db.execute(
      'SELECT COUNT(*) as total_books FROM books'
    );

    // Get available books
    const [availableBooksResult] = await db.execute(
      `SELECT COUNT(*) as available_books FROM books
       WHERE status = 'available' AND available_copies > 0`
    );

    // Get borrowed books (active borrowings)
    const [borrowedBooksResult] = await db.execute(
      `SELECT COUNT(*) as borrowed_books FROM borrowing_transactions
       WHERE status IN ('borrowed', 'active') AND returned_date IS NULL`
    );

    // Get overdue books
    const [overdueBooksResult] = await db.execute(
      `SELECT COUNT(*) as overdue_books FROM borrowing_transactions
       WHERE status = 'overdue' AND returned_date IS NULL AND due_date < NOW()`
    );

    // Get total users (students only, exclude admin)
    const [totalUsersResult] = await db.execute(
      `SELECT COUNT(*) as total_users FROM users
       WHERE role != 'admin'`
    );

    // Get active borrowers (users who currently have borrowed books)
    const [activeBorrowersResult] = await db.execute(
      `SELECT COUNT(DISTINCT student_id_number) as active_borrowers
       FROM borrowing_transactions
       WHERE status IN ('borrowed', 'active', 'overdue') AND returned_date IS NULL`
    );

    res.json({
      success: true,
      data: {
        totalBooks: totalBooksResult[0].total_books || 0,
        availableBooks: availableBooksResult[0].available_books || 0,
        borrowedBooks: borrowedBooksResult[0].borrowed_books || 0,
        overdueBooks: overdueBooksResult[0].overdue_books || 0,
        totalUsers: totalUsersResult[0].total_users || 0,
        activeBorrowers: activeBorrowersResult[0].active_borrowers || 0
      }
    });

  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
});

// Get Books by Category (for bar chart)
router.get('/books-by-category', auth, async (req, res) => {
  try {
    const [results] = await db.execute(`
      SELECT
        category,
        COUNT(*) as book_count
      FROM books
      GROUP BY category
      ORDER BY book_count DESC
    `);

    res.json({
      success: true,
      data: results.map(item => ({
        category: item.category,
        count: parseInt(item.book_count) || 0
      }))
    });

  } catch (error) {
    logger.error('Books by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch books by category',
      error: error.message
    });
  }
});

// Get Book Status Distribution (for pie chart)
router.get('/book-status-distribution', auth, async (req, res) => {
  try {
    // Get available books
    const [availableResult] = await db.execute(`
      SELECT COUNT(*) as count FROM books
      WHERE status = 'available' AND available_copies > 0
    `);

    // Get borrowed books
    const [borrowedResult] = await db.execute(`
      SELECT COUNT(DISTINCT book_id) as count FROM borrowing_transactions
      WHERE status IN ('borrowed', 'active') AND returned_date IS NULL
    `);

    // Get overdue books
    const [overdueResult] = await db.execute(`
      SELECT COUNT(DISTINCT book_id) as count FROM borrowing_transactions
      WHERE status = 'overdue' AND returned_date IS NULL
    `);

    const statusData = [
      { status: 'Available', count: availableResult[0].count || 0, color: '#10B981' },
      { status: 'Borrowed', count: borrowedResult[0].count || 0, color: '#3B82F6' },
      { status: 'Overdue', count: overdueResult[0].count || 0, color: '#EF4444' }
    ];

    res.json({
      success: true,
      data: statusData
    });

  } catch (error) {
    logger.error('Book status distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch book status distribution',
      error: error.message
    });
  }
});

// Get Monthly Borrowing Count (last 6 months)
router.get('/monthly-borrowing', auth, async (req, res) => {
  try {
    const [results] = await db.execute(`
      SELECT
        DATE_FORMAT(borrowed_date, '%b %Y') as month,
        DATE_FORMAT(borrowed_date, '%Y-%m') as month_key,
        COUNT(*) as borrow_count
      FROM borrowing_transactions
      WHERE borrowed_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(borrowed_date, '%Y-%m'), DATE_FORMAT(borrowed_date, '%b %Y')
      ORDER BY month_key ASC
    `);

    res.json({
      success: true,
      data: results.map(item => ({
        month: item.month,
        count: parseInt(item.borrow_count) || 0
      }))
    });

  } catch (error) {
    logger.error('Monthly borrowing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly borrowing data',
      error: error.message
    });
  }
});

module.exports = router;
