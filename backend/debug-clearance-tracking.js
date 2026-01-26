/**
 * Debug Script for Clearance Tracking Issue
 * Checks why borrowed books are not being tracked
 */

require('dotenv').config({ path: './config.env' });
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'capstone_system_optimized',
  port: process.env.DB_PORT || 3306
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function debugClearanceTracking() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    log('✓ Connected to database\n', 'green');

    // 1. Check semester_tracking table
    log('=== CHECKING SEMESTER_TRACKING TABLE ===', 'cyan');
    const [tracking] = await connection.query(`
      SELECT * FROM semester_tracking ORDER BY student_id_number
    `);

    if (tracking.length === 0) {
      log('✗ No semester_tracking records found!', 'red');
    } else {
      log(`Found ${tracking.length} semester_tracking records:`, 'green');
      console.table(tracking.map(t => ({
        'Student ID': t.student_id_number,
        'Books Count': t.books_borrowed_count,
        'Max Allowed': t.max_books_allowed,
        'Status': t.status,
        'Start': t.semester_start_date?.toISOString().split('T')[0],
        'End': t.semester_end_date?.toISOString().split('T')[0],
        'Updated': t.updated_at?.toISOString().split('T')[0]
      })));
    }

    // 2. Check borrowing_transactions
    log('\n=== CHECKING BORROWING_TRANSACTIONS ===', 'cyan');
    const [borrowings] = await connection.query(`
      SELECT
        bt.id,
        bt.student_id_number,
        bt.book_id,
        bt.borrowed_date,
        bt.returned_date,
        bt.status,
        b.title,
        b.number_code
      FROM borrowing_transactions bt
      JOIN books b ON bt.book_id = b.id
      WHERE bt.status = 'borrowed'
      ORDER BY bt.borrowed_date DESC
      LIMIT 20
    `);

    if (borrowings.length === 0) {
      log('! No active borrowing records found', 'yellow');
    } else {
      log(`Found ${borrowings.length} active borrowing records:`, 'green');
      console.table(borrowings.map(b => ({
        ID: b.id,
        'Student': b.student_id_number,
        'Book': b.title?.substring(0, 30),
        'Code': b.number_code,
        'Borrowed': b.borrowed_date?.toISOString().split('T')[0],
        'Status': b.status
      })));
    }

    // 3. Count books per student from borrowing_transactions
    log('\n=== ACTUAL BOOKS BORROWED (FROM TRANSACTIONS) ===', 'cyan');
    const [actualCounts] = await connection.query(`
      SELECT
        bt.student_id_number,
        u.first_name,
        u.last_name,
        COUNT(*) as total_borrowed,
        SUM(CASE WHEN bt.status = 'borrowed' THEN 1 ELSE 0 END) as currently_borrowed,
        SUM(CASE WHEN bt.returned_date IS NOT NULL THEN 1 ELSE 0 END) as returned
      FROM borrowing_transactions bt
      LEFT JOIN users u ON bt.student_id_number = u.id_number
      GROUP BY bt.student_id_number, u.first_name, u.last_name
      ORDER BY bt.student_id_number
    `);

    if (actualCounts.length === 0) {
      log('! No borrowing transactions found at all', 'yellow');
    } else {
      log('Actual borrowing counts from transactions:', 'green');
      console.table(actualCounts.map(c => ({
        'Student ID': c.student_id_number,
        'Name': `${c.first_name} ${c.last_name}`,
        'Total Ever Borrowed': c.total_borrowed,
        'Currently Borrowed': c.currently_borrowed,
        'Returned': c.returned
      })));
    }

    // 4. Compare semester_tracking vs actual borrowings
    log('\n=== COMPARISON: SEMESTER_TRACKING vs ACTUAL BORROWINGS ===', 'cyan');
    const [comparison] = await connection.query(`
      SELECT
        u.id_number,
        u.first_name,
        u.last_name,
        COALESCE(st.books_borrowed_count, 0) as tracked_count,
        COALESCE(actual.total_borrowed, 0) as actual_count,
        COALESCE(st.status, 'NO TRACKING') as tracking_status,
        (COALESCE(actual.total_borrowed, 0) - COALESCE(st.books_borrowed_count, 0)) as difference
      FROM users u
      LEFT JOIN semester_tracking st ON u.id_number = st.student_id_number
      LEFT JOIN (
        SELECT
          student_id_number,
          COUNT(*) as total_borrowed
        FROM borrowing_transactions
        GROUP BY student_id_number
      ) actual ON u.id_number = actual.student_id_number
      WHERE u.role = 'student'
      ORDER BY u.id_number
    `);

    console.table(comparison.map(c => ({
      'Student ID': c.id_number,
      'Name': `${c.first_name} ${c.last_name}`,
      'Tracked Count': c.tracked_count,
      'Actual Count': c.actual_count,
      'Difference': c.difference,
      'Tracking Status': c.tracking_status
    })));

    // 5. Check if there's a mismatch
    const mismatch = comparison.filter(c => c.difference !== 0);
    if (mismatch.length > 0) {
      log(`\n✗ FOUND MISMATCH! ${mismatch.length} students have incorrect tracking`, 'red');
      log('This means semester_tracking is not being updated properly when books are borrowed', 'yellow');
    } else {
      log('\n✓ All counts match! Tracking is working correctly', 'green');
    }

    // 6. Check semester_tracking table structure
    log('\n=== SEMESTER_TRACKING TABLE STRUCTURE ===', 'cyan');
    const [columns] = await connection.query(`
      DESCRIBE semester_tracking
    `);
    console.table(columns);

    // 7. Check if there are any errors in the logs
    log('\n=== RECOMMENDATIONS ===', 'cyan');

    if (tracking.length === 0) {
      log('1. No semester_tracking records exist. The table needs to be populated.', 'yellow');
      log('   Run: POST /api/penalty/reset-semester to create tracking records', 'blue');
    }

    if (mismatch.length > 0) {
      log('2. Semester tracking counts are out of sync with actual borrowings.', 'yellow');
      log('   This could be because:', 'blue');
      log('   - updateSemesterBooksCount is not being called', 'blue');
      log('   - The function is failing silently', 'blue');
      log('   - The status field is not "active"', 'blue');
    }

    const inactiveTracking = tracking.filter(t => t.status !== 'active');
    if (inactiveTracking.length > 0) {
      log(`3. Found ${inactiveTracking.length} semester_tracking records with status != 'active'`, 'yellow');
      log('   The UPDATE query only updates records with status="active"', 'blue');
    }

  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
      log('\n✓ Database connection closed', 'green');
    }
  }
}

debugClearanceTracking();
