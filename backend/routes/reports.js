const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/database');

// Report 1: Currently Borrowed Books
router.get('/currently-borrowed', auth, async (req, res) => {
  try {
    const { status = 'all', startDate, endDate } = req.query;

    let statusFilter = '';
    if (status === 'active') {
      statusFilter = `AND bt.status IN ('borrowed', 'active') AND bt.due_date >= NOW()`;
    } else if (status === 'overdue') {
      statusFilter = `AND bt.status = 'overdue' OR (bt.due_date < NOW() AND bt.returned_date IS NULL)`;
    } else {
      statusFilter = `AND bt.returned_date IS NULL`;
    }

    let dateFilter = '';
    const params = [];
    if (startDate && endDate) {
      dateFilter = `AND bt.borrowed_date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    const query = `
      SELECT
        b.title as book_title,
        b.author,
        CONCAT(u.first_name, ' ', u.last_name) as borrower_name,
        u.id_number as borrower_id,
        bt.borrowed_date,
        bt.due_date,
        CASE
          WHEN bt.due_date < NOW() AND bt.returned_date IS NULL THEN 'Overdue'
          WHEN bt.returned_date IS NULL THEN 'Active'
          ELSE 'Returned'
        END as status,
        DATEDIFF(NOW(), bt.due_date) as days_overdue
      FROM borrowing_transactions bt
      JOIN books b ON bt.book_id = b.id
      JOIN users u ON bt.student_id_number = u.id_number
      WHERE 1=1 ${statusFilter} ${dateFilter}
      ORDER BY bt.due_date ASC
    `;

    const [results] = await db.execute(query, params);

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Currently borrowed report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch currently borrowed books report',
      error: error.message
    });
  }
});

// Report 2: Overdue Books Report
router.get('/overdue-books', auth, async (req, res) => {
  try {
    const query = `
      SELECT
        b.title as book_title,
        CONCAT(u.first_name, ' ', u.last_name) as borrower_name,
        u.id_number as borrower_id,
        u.email as borrower_contact,
        bt.due_date,
        DATEDIFF(NOW(), bt.due_date) as days_overdue,
        COALESCE(f.fine_amount, 0) as penalty_amount
      FROM borrowing_transactions bt
      JOIN books b ON bt.book_id = b.id
      JOIN users u ON bt.student_id_number = u.id_number
      LEFT JOIN fines f ON bt.id = f.transaction_id
      WHERE bt.returned_date IS NULL AND bt.due_date < NOW()
      ORDER BY days_overdue DESC
    `;

    const [results] = await db.execute(query);

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Overdue books report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overdue books report',
      error: error.message
    });
  }
});

// Report 3: Returned Books History
router.get('/returned-books', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params = [];
    if (startDate && endDate) {
      dateFilter = `AND bt.returned_date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    } else {
      // Default to last 30 days
      dateFilter = `AND bt.returned_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
    }

    const query = `
      SELECT
        b.title as book_title,
        CONCAT(u.first_name, ' ', u.last_name) as borrower_name,
        bt.borrowed_date,
        bt.returned_date,
        bt.due_date,
        CASE
          WHEN bt.returned_date <= bt.due_date THEN 'On-time'
          ELSE 'Late'
        END as return_status,
        DATEDIFF(bt.returned_date, bt.due_date) as days_late
      FROM borrowing_transactions bt
      JOIN books b ON bt.book_id = b.id
      JOIN users u ON bt.student_id_number = u.id_number
      WHERE bt.returned_date IS NOT NULL ${dateFilter}
      ORDER BY bt.returned_date DESC
    `;

    const [results] = await db.execute(query, params);

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Returned books report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch returned books report',
      error: error.message
    });
  }
});

// Report 4: Most Borrowed Books (Top 10)
router.get('/most-borrowed', auth, async (req, res) => {
  try {
    const { period = 'all' } = req.query;

    let dateFilter = '';
    if (period === 'month') {
      dateFilter = `WHERE bt.borrowed_date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`;
    } else if (period === 'semester') {
      dateFilter = `WHERE bt.borrowed_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)`;
    }

    const query = `
      SELECT
        b.title as book_title,
        b.author,
        b.category,
        COUNT(bt.id) as times_borrowed
      FROM books b
      LEFT JOIN borrowing_transactions bt ON b.id = bt.book_id
      ${dateFilter}
      GROUP BY b.id, b.title, b.author, b.category
      HAVING times_borrowed > 0
      ORDER BY times_borrowed DESC
      LIMIT 10
    `;

    const [results] = await db.execute(query);

    res.json({
      success: true,
      data: results.map((item, index) => ({
        rank: index + 1,
        ...item,
        times_borrowed: parseInt(item.times_borrowed) || 0
      }))
    });

  } catch (error) {
    console.error('Most borrowed books report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch most borrowed books report',
      error: error.message
    });
  }
});

// Report 5: Books Inventory Summary
router.get('/inventory-summary', auth, async (req, res) => {
  try {
    // Get summary by category
    const [categoryResults] = await db.execute(`
      SELECT
        b.category,
        COUNT(b.id) as total_books,
        SUM(CASE WHEN b.status = 'available' AND b.available_copies > 0 THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN b.id IN (
          SELECT DISTINCT book_id FROM borrowing_transactions
          WHERE returned_date IS NULL
        ) THEN 1 ELSE 0 END) as borrowed,
        SUM(CASE WHEN b.status = 'lost' THEN 1 ELSE 0 END) as lost_damaged
      FROM books b
      GROUP BY b.category
      ORDER BY total_books DESC
    `);

    // Get overall distribution for pie chart
    const [overallResults] = await db.execute(`
      SELECT
        SUM(CASE WHEN status = 'available' AND available_copies > 0 THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN id IN (
          SELECT DISTINCT book_id FROM borrowing_transactions
          WHERE returned_date IS NULL
        ) THEN 1 ELSE 0 END) as borrowed,
        SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lost_damaged
      FROM books
    `);

    res.json({
      success: true,
      data: {
        categoryBreakdown: categoryResults,
        overallDistribution: overallResults[0]
      }
    });

  } catch (error) {
    console.error('Inventory summary report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory summary report',
      error: error.message
    });
  }
});

// Report 6: User Borrowing History (individual lookup)
router.get('/user-history/:idNumber', auth, async (req, res) => {
  try {
    const { idNumber } = req.params;

    // Get user info
    const [userInfo] = await db.execute(`
      SELECT
        id_number,
        CONCAT(first_name, ' ', last_name) as full_name,
        email,
        created_at
      FROM users
      WHERE id_number = ?
    `, [idNumber]);

    if (userInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get current borrows
    const [currentBorrows] = await db.execute(`
      SELECT
        b.title,
        bt.borrowed_date,
        bt.due_date,
        CASE
          WHEN bt.due_date < NOW() THEN 'Overdue'
          ELSE 'Active'
        END as status,
        DATEDIFF(NOW(), bt.due_date) as days_overdue
      FROM borrowing_transactions bt
      JOIN books b ON bt.book_id = b.id
      WHERE bt.student_id_number = ? AND bt.returned_date IS NULL
      ORDER BY bt.borrowed_date DESC
    `, [idNumber]);

    // Get borrowing history
    const [borrowingHistory] = await db.execute(`
      SELECT
        b.title,
        bt.borrowed_date,
        bt.returned_date,
        bt.due_date,
        CASE
          WHEN bt.returned_date IS NULL AND bt.due_date < NOW() THEN 'Overdue'
          WHEN bt.returned_date IS NULL THEN 'Active'
          WHEN bt.returned_date <= bt.due_date THEN 'Returned On-time'
          ELSE 'Returned Late'
        END as status
      FROM borrowing_transactions bt
      JOIN books b ON bt.book_id = b.id
      WHERE bt.student_id_number = ?
      ORDER BY bt.borrowed_date DESC
      LIMIT 50
    `, [idNumber]);

    // Get penalties
    const [penalties] = await db.execute(`
      SELECT
        b.title,
        f.fine_amount,
        f.paid_amount,
        f.status,
        f.fine_date,
        f.days_overdue
      FROM fines f
      JOIN borrowing_transactions bt ON f.transaction_id = bt.id
      JOIN books b ON bt.book_id = b.id
      WHERE f.student_id_number = ?
      ORDER BY f.fine_date DESC
    `, [idNumber]);

    res.json({
      success: true,
      data: {
        userInfo: userInfo[0],
        currentBorrows,
        borrowingHistory,
        penalties
      }
    });

  } catch (error) {
    console.error('User history report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user history report',
      error: error.message
    });
  }
});

module.exports = router;
