/**
 * Fix Script for Clearance Tracking
 * Syncs semester_tracking.books_borrowed_count with actual borrowing_transactions
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
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function fixClearanceTracking() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    log('✓ Connected to database\n', 'green');

    log('=== FIX CLEARANCE TRACKING ===\n', 'bright');

    // Get current state
    log('BEFORE FIX:', 'yellow');
    const [before] = await connection.query(`
      SELECT
        u.id_number,
        u.first_name,
        u.last_name,
        COALESCE(st.books_borrowed_count, 0) as tracked_count,
        COALESCE(actual.total_borrowed, 0) as actual_count
      FROM users u
      LEFT JOIN semester_tracking st ON u.id_number = st.student_id_number AND st.status = 'active'
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

    console.table(before.map(s => ({
      'Student ID': s.id_number,
      'Name': `${s.first_name} ${s.last_name}`,
      'Tracked': s.tracked_count,
      'Actual': s.actual_count,
      'Difference': s.actual_count - s.tracked_count
    })));

    // Prompt for confirmation
    log('\n⚠️  This will update semester_tracking to match actual borrowings', 'yellow');
    log('Press Ctrl+C to cancel, or wait 3 seconds to continue...\n', 'yellow');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // OPTION 1: Update existing semester_tracking records
    log('Updating existing semester_tracking records...', 'cyan');

    const [updateResult] = await connection.query(`
      UPDATE semester_tracking st
      JOIN (
        SELECT
          student_id_number,
          COUNT(*) as actual_count
        FROM borrowing_transactions
        GROUP BY student_id_number
      ) actual ON st.student_id_number = actual.student_id_number
      SET st.books_borrowed_count = actual.actual_count,
          st.updated_at = CURRENT_TIMESTAMP
      WHERE st.status = 'active'
    `);

    log(`✓ Updated ${updateResult.affectedRows} semester_tracking records`, 'green');

    // OPTION 2: Create semester_tracking for students who don't have one
    log('\nCreating semester_tracking for students without one...', 'cyan');

    // Get current semester info
    const [currentSem] = await connection.query(`
      SELECT * FROM semesters WHERE is_current = TRUE LIMIT 1
    `);

    let semesterStart, semesterEnd;
    if (currentSem.length > 0) {
      semesterStart = currentSem[0].start_date;
      semesterEnd = currentSem[0].end_date;
    } else {
      // Fallback to date-based calculation
      const today = new Date();
      semesterStart = today.toISOString().split('T')[0];
      const endDate = new Date(today);
      endDate.setMonth(endDate.getMonth() + 5);
      semesterEnd = endDate.toISOString().split('T')[0];
    }

    const [insertResult] = await connection.query(`
      INSERT INTO semester_tracking (student_id_number, semester_start_date, semester_end_date, books_borrowed_count, max_books_allowed, status)
      SELECT
        u.id_number,
        ? as semester_start_date,
        ? as semester_end_date,
        COALESCE(actual.total_borrowed, 0) as books_borrowed_count,
        5 as max_books_allowed,
        'active' as status
      FROM users u
      LEFT JOIN (
        SELECT
          student_id_number,
          COUNT(*) as total_borrowed
        FROM borrowing_transactions
        GROUP BY student_id_number
      ) actual ON u.id_number = actual.student_id_number
      LEFT JOIN semester_tracking st ON u.id_number = st.student_id_number AND st.status = 'active'
      WHERE u.role = 'student'
        AND st.id IS NULL
    `, [semesterStart, semesterEnd]);

    if (insertResult.affectedRows > 0) {
      log(`✓ Created ${insertResult.affectedRows} new semester_tracking records`, 'green');
    } else {
      log('✓ All students already have semester_tracking records', 'green');
    }

    // Verify the fix
    log('\nAFTER FIX:', 'green');
    const [after] = await connection.query(`
      SELECT
        u.id_number,
        u.first_name,
        u.last_name,
        COALESCE(st.books_borrowed_count, 0) as tracked_count,
        COALESCE(actual.total_borrowed, 0) as actual_count
      FROM users u
      LEFT JOIN semester_tracking st ON u.id_number = st.student_id_number AND st.status = 'active'
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

    console.table(after.map(s => ({
      'Student ID': s.id_number,
      'Name': `${s.first_name} ${s.last_name}`,
      'Tracked': s.tracked_count,
      'Actual': s.actual_count,
      'Difference': s.actual_count - s.tracked_count
    })));

    // Check if all are in sync
    const stillMismatched = after.filter(s => s.actual_count !== s.tracked_count);
    if (stillMismatched.length === 0) {
      log('\n✓ SUCCESS! All semester_tracking records are now in sync!', 'green');
    } else {
      log(`\n! Still ${stillMismatched.length} records out of sync`, 'yellow');
      console.table(stillMismatched.map(s => ({
        'Student ID': s.id_number,
        'Tracked': s.tracked_count,
        'Actual': s.actual_count
      })));
    }

    log('\n=== SUMMARY ===', 'cyan');
    log('1. Updated existing semester_tracking records to match actual borrowings', 'blue');
    log('2. Created semester_tracking records for students who didnt have one', 'blue');
    log('3. Clearance requirements page should now show correct book counts', 'blue');
    log('\n✓ Fix completed! Refresh the clearance requirements page to see changes.', 'green');

  } catch (error) {
    log(`\n✗ Error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
      log('\n✓ Database connection closed', 'green');
    }
  }
}

fixClearanceTracking();
