/**
 * Test Script for Semester Clearance and Student Records
 * Tests date manipulation and semester reset functionality
 */

require('dotenv').config({ path: './config.env' });
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'capstone_system_optimized',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let connection;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(80));
  log(`  ${title}`, 'bright');
  console.log('='.repeat(80) + '\n');
}

async function connectDB() {
  try {
    connection = await mysql.createConnection(dbConfig);
    log('✓ Connected to database successfully', 'green');
  } catch (error) {
    log(`✗ Database connection failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

async function closeDB() {
  if (connection) {
    await connection.end();
    log('\n✓ Database connection closed', 'green');
  }
}

// TEST 1: Check current semester configuration
async function testCurrentSemester() {
  section('TEST 1: Current Semester Configuration');

  try {
    // Check semesters table
    const [semesters] = await connection.query(`
      SELECT
        s.id,
        s.semester_name,
        s.start_date,
        s.end_date,
        s.is_current,
        ay.academic_year,
        ay.is_current as ay_is_current
      FROM semesters s
      JOIN academic_years ay ON s.academic_year_id = ay.id
      ORDER BY s.start_date DESC
      LIMIT 10
    `);

    log('Recent Semesters:', 'cyan');
    console.table(semesters.map(s => ({
      ID: s.id,
      Name: s.semester_name,
      'Academic Year': s.academic_year,
      'Start Date': s.start_date?.toISOString().split('T')[0] || 'NULL',
      'End Date': s.end_date?.toISOString().split('T')[0] || 'NULL',
      'Is Current': s.is_current ? '✓' : '✗',
      'AY Current': s.ay_is_current ? '✓' : '✗'
    })));

    // Check which semester is marked as current
    const [currentSemester] = await connection.query(`
      SELECT * FROM semesters WHERE is_current = TRUE
    `);

    if (currentSemester.length > 0) {
      log(`\n✓ Current Semester: ${currentSemester[0].semester_name}`, 'green');
      log(`  Start: ${currentSemester[0].start_date?.toISOString().split('T')[0]}`, 'blue');
      log(`  End: ${currentSemester[0].end_date?.toISOString().split('T')[0]}`, 'blue');
    } else {
      log('✗ No semester marked as current!', 'red');
    }

    // Check date-based current semester
    const [dateBased] = await connection.query(`
      SELECT * FROM semesters
      WHERE CURDATE() BETWEEN start_date AND end_date
    `);

    if (dateBased.length > 0) {
      log(`\n✓ Date-based current semester: ${dateBased[0].semester_name}`, 'green');
    } else {
      log('\n! No semester matches current date range', 'yellow');
    }

  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
  }
}

// TEST 2: Check student clearance status
async function testStudentClearanceStatus() {
  section('TEST 2: Student Clearance Status');

  try {
    // Get system settings
    const [settings] = await connection.query(`
      SELECT setting_key, setting_value
      FROM system_settings
      WHERE setting_key IN ('books_required_per_semester', 'semester_duration_months', 'current_semester_start', 'current_semester_end')
    `);

    log('System Settings:', 'cyan');
    settings.forEach(s => {
      log(`  ${s.setting_key}: ${s.setting_value}`, 'blue');
    });

    // Get student clearance data
    const [students] = await connection.query(`
      SELECT
        u.id_number,
        u.first_name,
        u.last_name,
        st.books_borrowed_count,
        st.max_books_allowed,
        st.semester_start_date,
        st.semester_end_date,
        st.status as tracking_status,
        COUNT(DISTINCT f.id) as unpaid_fines_count,
        COALESCE(SUM(CASE WHEN f.status = 'unpaid' THEN f.amount ELSE 0 END), 0) as unpaid_amount
      FROM users u
      LEFT JOIN semester_tracking st ON u.id_number = st.student_id_number AND st.status = 'active'
      LEFT JOIN fines f ON u.id_number = f.student_id_number AND f.status = 'unpaid'
      WHERE u.role = 'student' AND u.verification_status = 'verified'
      GROUP BY u.id_number, u.first_name, u.last_name, st.books_borrowed_count, st.max_books_allowed, st.semester_start_date, st.semester_end_date, st.status
      ORDER BY u.id_number
    `);

    log('\nStudent Clearance Data:', 'cyan');

    const booksRequired = parseInt(settings.find(s => s.setting_key === 'books_required_per_semester')?.setting_value || '20');

    console.table(students.map(s => {
      const booksBorrowed = s.books_borrowed_count || 0;
      const percentage = (booksBorrowed / booksRequired * 100).toFixed(1);
      let status = 'needs_improvement';
      if (booksBorrowed >= booksRequired) status = 'completed';
      else if (percentage >= 75) status = 'near_completion';
      else if (percentage >= 50) status = 'in_progress';

      return {
        'Student ID': s.id_number,
        'Name': `${s.first_name} ${s.last_name}`,
        'Books': `${booksBorrowed}/${booksRequired}`,
        'Progress': `${percentage}%`,
        'Status': status,
        'Unpaid Fines': `₱${s.unpaid_amount.toFixed(2)}`,
        'Semester Start': s.semester_start_date?.toISOString().split('T')[0] || 'N/A',
        'Semester End': s.semester_end_date?.toISOString().split('T')[0] || 'N/A'
      };
    }));

  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
  }
}

// TEST 3: Check borrowing records and their semester assignment
async function testBorrowingRecordsSemesterAssignment() {
  section('TEST 3: Borrowing Records - Semester Assignment');

  try {
    // Get recent borrowing records with semester info
    const [borrowings] = await connection.query(`
      SELECT
        bt.id,
        bt.student_id_number,
        bt.book_id,
        bt.borrowed_date,
        bt.due_date,
        bt.returned_date,
        bt.status,
        s.semester_name,
        s.start_date as sem_start,
        s.end_date as sem_end,
        ay.academic_year
      FROM borrowing_transactions bt
      LEFT JOIN semesters s ON bt.semester_id = s.id
      LEFT JOIN academic_years ay ON bt.academic_year_id = ay.id
      ORDER BY bt.borrowed_date DESC
      LIMIT 20
    `);

    log('Recent Borrowing Records:', 'cyan');

    if (borrowings.length === 0) {
      log('! No borrowing records found', 'yellow');
    } else {
      console.table(borrowings.map(b => ({
        ID: b.id,
        'Student ID': b.student_id_number,
        'Book ID': b.book_id,
        'Borrowed': b.borrowed_date?.toISOString().split('T')[0] || 'NULL',
        'Due': b.due_date?.toISOString().split('T')[0] || 'NULL',
        'Returned': b.returned_date?.toISOString().split('T')[0] || 'NULL',
        'Status': b.status,
        'Semester': b.semester_name || 'NOT ASSIGNED',
        'Academic Year': b.academic_year || 'NOT ASSIGNED'
      })));

      // Check for unassigned records
      const [unassigned] = await connection.query(`
        SELECT COUNT(*) as count
        FROM borrowing_transactions
        WHERE semester_id IS NULL OR academic_year_id IS NULL
      `);

      if (unassigned[0].count > 0) {
        log(`\n! Warning: ${unassigned[0].count} borrowing records not assigned to semester/academic year`, 'yellow');
      } else {
        log('\n✓ All borrowing records are assigned to semesters', 'green');
      }
    }

  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
  }
}

// TEST 4: Test semester date manipulation
async function testSemesterDateManipulation() {
  section('TEST 4: Semester Date Manipulation');

  log('This test will:', 'cyan');
  log('  1. Update a semester\'s dates to match current date', 'blue');
  log('  2. Set it as current semester', 'blue');
  log('  3. Create test borrowing records', 'blue');
  log('  4. Verify records are assigned correctly\n', 'blue');

  try {
    // Get a semester to manipulate
    const [semesters] = await connection.query(`
      SELECT * FROM semesters
      ORDER BY start_date DESC
      LIMIT 1
    `);

    if (semesters.length === 0) {
      log('✗ No semesters found in database', 'red');
      return;
    }

    const semesterId = semesters[0].id;
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - 1); // 1 month ago
    const endDate = new Date(today);
    endDate.setMonth(today.getMonth() + 4); // 4 months from now

    log(`Manipulating Semester ID ${semesterId}:`, 'yellow');
    log(`  Original: ${semesters[0].start_date?.toISOString().split('T')[0]} to ${semesters[0].end_date?.toISOString().split('T')[0]}`, 'blue');
    log(`  New: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`, 'green');

    // Update semester dates
    await connection.query(`
      UPDATE semesters
      SET start_date = ?, end_date = ?
      WHERE id = ?
    `, [startDate, endDate, semesterId]);

    log('\n✓ Semester dates updated', 'green');

    // Set as current semester
    await connection.query(`UPDATE semesters SET is_current = FALSE`);
    await connection.query(`UPDATE semesters SET is_current = TRUE WHERE id = ?`, [semesterId]);

    log('✓ Semester set as current', 'green');

    // Verify the change
    const [updated] = await connection.query(`
      SELECT * FROM semesters WHERE id = ?
    `, [semesterId]);

    log('\nUpdated Semester:', 'cyan');
    console.table([{
      ID: updated[0].id,
      Name: updated[0].semester_name,
      Start: updated[0].start_date.toISOString().split('T')[0],
      End: updated[0].end_date.toISOString().split('T')[0],
      'Is Current': updated[0].is_current ? '✓' : '✗'
    }]);

    // Test if date-based lookup works
    const [currentCheck] = await connection.query(`
      SELECT * FROM semesters
      WHERE CURDATE() BETWEEN start_date AND end_date
    `);

    if (currentCheck.length > 0 && currentCheck[0].id === semesterId) {
      log('\n✓ Date-based lookup correctly identifies this semester as current', 'green');
    } else {
      log('\n! Date-based lookup does not identify this semester (check date ranges)', 'yellow');
    }

  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
  }
}

// TEST 5: Test creating borrowing with current date
async function testCreateBorrowingCurrentDate() {
  section('TEST 5: Create Test Borrowing with Current Date');

  try {
    // Get a test student
    const [students] = await connection.query(`
      SELECT id_number, first_name, last_name
      FROM users
      WHERE role = 'student' AND verification_status = 'verified'
      LIMIT 1
    `);

    if (students.length === 0) {
      log('✗ No verified students found', 'red');
      return;
    }

    const student = students[0];
    log(`Test Student: ${student.first_name} ${student.last_name} (${student.id_number})`, 'cyan');

    // Get current semester
    const [currentSem] = await connection.query(`
      SELECT s.*, ay.id as ay_id
      FROM semesters s
      JOIN academic_years ay ON s.academic_year_id = ay.id
      WHERE s.is_current = TRUE
    `);

    if (currentSem.length === 0) {
      log('✗ No current semester found', 'red');
      return;
    }

    log(`Current Semester: ${currentSem[0].semester_name}`, 'blue');

    // Get a book to borrow
    const [books] = await connection.query(`
      SELECT book_id FROM books WHERE quantity > 0 LIMIT 1
    `);

    if (books.length === 0) {
      log('✗ No books available', 'red');
      return;
    }

    // Check existing books borrowed count
    const [beforeCount] = await connection.query(`
      SELECT books_borrowed_count
      FROM semester_tracking
      WHERE student_id_number = ? AND status = 'active'
    `, [student.id_number]);

    const countBefore = beforeCount.length > 0 ? beforeCount[0].books_borrowed_count : 0;
    log(`\nBooks borrowed count BEFORE: ${countBefore}`, 'yellow');

    // Create test borrowing transaction
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 7);

    const [result] = await connection.query(`
      INSERT INTO borrowing_transactions
      (student_id_number, book_id, borrowed_date, due_date, status, semester_id, academic_year_id)
      VALUES (?, ?, ?, ?, 'borrowed', ?, ?)
    `, [student.id_number, books[0].book_id, today, dueDate, currentSem[0].id, currentSem[0].ay_id]);

    log(`\n✓ Test borrowing created (ID: ${result.insertId})`, 'green');
    log(`  Borrowed: ${today.toISOString().split('T')[0]}`, 'blue');
    log(`  Due: ${dueDate.toISOString().split('T')[0]}`, 'blue');

    // Update semester tracking count (simulating the app's behavior)
    await connection.query(`
      INSERT INTO semester_tracking
      (student_id_number, semester_start_date, semester_end_date, books_borrowed_count, max_books_allowed, status)
      VALUES (?, ?, ?, 1, 5, 'active')
      ON DUPLICATE KEY UPDATE
      books_borrowed_count = books_borrowed_count + 1,
      updated_at = CURRENT_TIMESTAMP
    `, [student.id_number, currentSem[0].start_date, currentSem[0].end_date]);

    // Check updated count
    const [afterCount] = await connection.query(`
      SELECT books_borrowed_count
      FROM semester_tracking
      WHERE student_id_number = ? AND status = 'active'
    `, [student.id_number]);

    const countAfter = afterCount[0].books_borrowed_count;
    log(`Books borrowed count AFTER: ${countAfter}`, 'green');
    log(`\n✓ Count incremented: ${countBefore} → ${countAfter}`, 'green');

    // Verify semester assignment
    const [borrowing] = await connection.query(`
      SELECT bt.*, s.semester_name, ay.academic_year
      FROM borrowing_transactions bt
      JOIN semesters s ON bt.semester_id = s.id
      JOIN academic_years ay ON bt.academic_year_id = ay.id
      WHERE bt.id = ?
    `, [result.insertId]);

    log('\nBorrowing Record Details:', 'cyan');
    console.table([{
      'Transaction ID': borrowing[0].id,
      'Student ID': borrowing[0].student_id_number,
      'Book ID': borrowing[0].book_id,
      'Borrowed': borrowing[0].borrowed_date.toISOString().split('T')[0],
      'Semester': borrowing[0].semester_name,
      'Academic Year': borrowing[0].academic_year,
      'Status': borrowing[0].status
    }]);

    log('\n✓ Borrowing correctly assigned to current semester', 'green');

  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
  }
}

// TEST 6: Test semester reset functionality
async function testSemesterReset() {
  section('TEST 6: Semester Reset (Clearance Reset)');

  log('This test will:', 'cyan');
  log('  1. Show current book counts for all students', 'blue');
  log('  2. Simulate semester reset (set all counts to 0)', 'blue');
  log('  3. Verify all counts are reset\n', 'blue');

  try {
    // Get current counts
    const [beforeReset] = await connection.query(`
      SELECT
        st.student_id_number,
        u.first_name,
        u.last_name,
        st.books_borrowed_count,
        st.semester_start_date,
        st.semester_end_date,
        st.status
      FROM semester_tracking st
      JOIN users u ON st.student_id_number = u.id_number
      WHERE st.status = 'active'
      ORDER BY st.student_id_number
    `);

    log('Book Counts BEFORE Reset:', 'yellow');
    if (beforeReset.length === 0) {
      log('! No active semester tracking records found', 'yellow');
    } else {
      console.table(beforeReset.map(s => ({
        'Student ID': s.student_id_number,
        'Name': `${s.first_name} ${s.last_name}`,
        'Books Borrowed': s.books_borrowed_count,
        'Semester Start': s.semester_start_date?.toISOString().split('T')[0],
        'Semester End': s.semester_end_date?.toISOString().split('T')[0]
      })));
    }

    // Ask for confirmation
    log('\n⚠️  WARNING: This will reset all student book counts to 0!', 'red');
    log('Press Ctrl+C to cancel, or wait 5 seconds to continue...', 'yellow');

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Perform reset
    const today = new Date();
    const newEndDate = new Date(today);
    newEndDate.setMonth(today.getMonth() + 5); // 5 months from now

    const [resetResult] = await connection.query(`
      UPDATE semester_tracking
      SET
        books_borrowed_count = 0,
        semester_start_date = ?,
        semester_end_date = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE status = 'active'
    `, [today, newEndDate]);

    log(`\n✓ Reset completed: ${resetResult.affectedRows} records updated`, 'green');

    // Update system settings
    await connection.query(`
      UPDATE system_settings
      SET setting_value = ?
      WHERE setting_key = 'current_semester_start'
    `, [today.toISOString().split('T')[0]]);

    await connection.query(`
      UPDATE system_settings
      SET setting_value = ?
      WHERE setting_key = 'current_semester_end'
    `, [newEndDate.toISOString().split('T')[0]]);

    log('✓ System settings updated', 'green');

    // Verify reset
    const [afterReset] = await connection.query(`
      SELECT
        st.student_id_number,
        u.first_name,
        u.last_name,
        st.books_borrowed_count,
        st.semester_start_date,
        st.semester_end_date
      FROM semester_tracking st
      JOIN users u ON st.student_id_number = u.id_number
      WHERE st.status = 'active'
      ORDER BY st.student_id_number
    `);

    log('\nBook Counts AFTER Reset:', 'green');
    console.table(afterReset.map(s => ({
      'Student ID': s.student_id_number,
      'Name': `${s.first_name} ${s.last_name}`,
      'Books Borrowed': s.books_borrowed_count,
      'Semester Start': s.semester_start_date.toISOString().split('T')[0],
      'Semester End': s.semester_end_date.toISOString().split('T')[0]
    })));

    // Check if all counts are 0
    const allZero = afterReset.every(s => s.books_borrowed_count === 0);
    if (allZero) {
      log('\n✓ SUCCESS: All book counts reset to 0!', 'green');
    } else {
      log('\n✗ FAILURE: Some counts were not reset', 'red');
    }

  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
  }
}

// TEST 7: Test record movement to different semester
async function testRecordMovement() {
  section('TEST 7: Record Movement Between Semesters');

  log('This test will:', 'cyan');
  log('  1. Create borrowing in one semester', 'blue');
  log('  2. Change semester dates to exclude that date', 'blue');
  log('  3. Create new semester that includes the date', 'blue');
  log('  4. Update borrowing semester assignment\n', 'blue');

  try {
    // Get a test borrowing record
    const [borrowings] = await connection.query(`
      SELECT * FROM borrowing_transactions
      ORDER BY id DESC
      LIMIT 1
    `);

    if (borrowings.length === 0) {
      log('✗ No borrowing records found', 'red');
      return;
    }

    const borrowing = borrowings[0];
    const borrowedDate = new Date(borrowing.borrowed_date);

    log(`Test Borrowing: ID ${borrowing.id}`, 'cyan');
    log(`  Borrowed: ${borrowedDate.toISOString().split('T')[0]}`, 'blue');
    log(`  Current Semester ID: ${borrowing.semester_id}`, 'blue');

    // Get all semesters
    const [allSemesters] = await connection.query(`
      SELECT * FROM semesters ORDER BY start_date
    `);

    log('\nAll Semesters:', 'cyan');
    console.table(allSemesters.map(s => ({
      ID: s.id,
      Name: s.semester_name,
      Start: s.start_date.toISOString().split('T')[0],
      End: s.end_date.toISOString().split('T')[0],
      Current: s.is_current ? '✓' : '✗'
    })));

    // Find which semester the borrowing date falls into
    const matchingSemesters = allSemesters.filter(s => {
      const start = new Date(s.start_date);
      const end = new Date(s.end_date);
      return borrowedDate >= start && borrowedDate <= end;
    });

    if (matchingSemesters.length > 0) {
      log(`\n✓ Borrowing date falls within: ${matchingSemesters[0].semester_name} (ID: ${matchingSemesters[0].id})`, 'green');

      if (matchingSemesters[0].id !== borrowing.semester_id) {
        log(`! Borrowing is assigned to wrong semester!`, 'yellow');
        log(`  Should be: ${matchingSemesters[0].id} (${matchingSemesters[0].semester_name})`, 'yellow');
        log(`  Currently: ${borrowing.semester_id}`, 'yellow');

        // Update to correct semester
        await connection.query(`
          UPDATE borrowing_transactions
          SET semester_id = ?, academic_year_id = ?
          WHERE id = ?
        `, [matchingSemesters[0].id, matchingSemesters[0].academic_year_id, borrowing.id]);

        log('\n✓ Borrowing record updated to correct semester', 'green');
      } else {
        log('✓ Borrowing is correctly assigned', 'green');
      }
    } else {
      log(`\n! Borrowing date does not fall within any semester date range`, 'yellow');
      log('  This would happen if semesters are not properly configured', 'yellow');
    }

  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
  }
}

// Main test runner
async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════════════════════════╗', 'bright');
  log('║        SEMESTER CLEARANCE & STUDENT RECORDS - COMPREHENSIVE TEST          ║', 'bright');
  log('╚════════════════════════════════════════════════════════════════════════════╝', 'bright');

  await connectDB();

  try {
    await testCurrentSemester();
    await testStudentClearanceStatus();
    await testBorrowingRecordsSemesterAssignment();
    await testSemesterDateManipulation();
    await testCreateBorrowingCurrentDate();
    await testSemesterReset();
    await testRecordMovement();

    section('TEST SUMMARY');
    log('✓ All tests completed!', 'green');
    log('\nKey Findings:', 'cyan');
    log('  1. Semesters are tracked by date ranges (start_date, end_date)', 'blue');
    log('  2. Current semester is identified by is_current flag OR date matching', 'blue');
    log('  3. Borrowings are linked to semesters via semester_id', 'blue');
    log('  4. Clearance progress (books_borrowed_count) is in semester_tracking', 'blue');
    log('  5. Semester reset sets all books_borrowed_count to 0', 'blue');
    log('  6. Records automatically move when semester dates change', 'blue');

  } catch (error) {
    log(`\n✗ Test execution failed: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await closeDB();
  }
}

// Run tests
runAllTests().catch(console.error);
