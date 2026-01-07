/**
 * Final Verification of Semester Tracking System
 */

require('dotenv').config({ path: './config.env' });
const mysql = require('mysql2/promise');

async function verify() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'capstone_system_optimized'
    });

    console.log('='.repeat(60));
    console.log('FINAL VERIFICATION - Semester Tracking System');
    console.log('='.repeat(60));

    // Check 1: Academic Years
    console.log('\n1. ACADEMIC YEARS');
    const [years] = await conn.query(`SELECT id, year_name, is_current FROM academic_years ORDER BY start_date`);
    console.log(`   Total: ${years.length}`);
    years.forEach(y => console.log(`   - ${y.year_name} ${y.is_current ? '(CURRENT)' : ''}`));

    // Check 2: Semesters
    console.log('\n2. SEMESTERS');
    const [semesters] = await conn.query(`
        SELECT s.id, s.semester_name, ay.year_name, s.is_current
        FROM semesters s
        JOIN academic_years ay ON s.academic_year_id = ay.id
        ORDER BY ay.start_date, s.semester_number
    `);
    console.log(`   Total: ${semesters.length}`);
    semesters.slice(-4).forEach(s => console.log(`   - ${s.year_name} / ${s.semester_name} ${s.is_current ? '(CURRENT)' : ''}`));

    // Check 3: Borrowing Transactions
    console.log('\n3. BORROWING TRANSACTIONS');
    const [btStats] = await conn.query(`
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN semester_id IS NOT NULL THEN 1 ELSE 0 END) as with_semester,
            SUM(CASE WHEN academic_year_id IS NOT NULL THEN 1 ELSE 0 END) as with_year
        FROM borrowing_transactions
    `);
    console.log(`   Total: ${btStats[0].total}`);
    console.log(`   With Semester: ${btStats[0].with_semester}`);
    console.log(`   With Academic Year: ${btStats[0].with_year}`);

    // Check 4: Student Year History
    console.log('\n4. STUDENT YEAR HISTORY');
    const [syhStats] = await conn.query(`
        SELECT COUNT(DISTINCT user_id) as students, COUNT(*) as records
        FROM student_year_history
    `);
    console.log(`   Students: ${syhStats[0].students}`);
    console.log(`   Records: ${syhStats[0].records}`);

    // Check 5: Semester Clearances
    console.log('\n5. SEMESTER CLEARANCES');
    const [scStats] = await conn.query(`
        SELECT COUNT(DISTINCT user_id) as students, COUNT(*) as records
        FROM semester_clearances
    `);
    console.log(`   Students: ${scStats[0].students}`);
    console.log(`   Records: ${scStats[0].records}`);

    // Check 6: Sample Student Record (C22-0044)
    console.log('\n6. SAMPLE STUDENT RECORD (C22-0044)');
    const [studentRecords] = await conn.query(`
        SELECT
            u.id_number,
            ay.year_name,
            syh.year_level,
            s.semester_name,
            COUNT(DISTINCT bt.id) as books_borrowed,
            COALESCE(SUM(f.fine_amount), 0) as total_fines
        FROM users u
        LEFT JOIN student_year_history syh ON u.id = syh.user_id
        LEFT JOIN academic_years ay ON syh.academic_year_id = ay.id
        LEFT JOIN semesters s ON s.academic_year_id = ay.id
        LEFT JOIN borrowing_transactions bt ON u.id_number = bt.student_id_number AND bt.semester_id = s.id
        LEFT JOIN fines f ON bt.id = f.transaction_id
        WHERE u.id_number = 'C22-0044'
        GROUP BY u.id_number, ay.year_name, syh.year_level, s.semester_name
        HAVING books_borrowed > 0
        ORDER BY ay.year_name, s.semester_name
    `);
    if (studentRecords.length > 0) {
        console.table(studentRecords);
    } else {
        console.log('   No records found for C22-0044');
    }

    // Check 7: All students with borrowing history
    console.log('\n7. ALL STUDENTS WITH BORROWING HISTORY');
    const [allStudents] = await conn.query(`
        SELECT
            u.id_number,
            u.first_name,
            u.last_name,
            COUNT(DISTINCT bt.id) as total_borrowings,
            COUNT(DISTINCT bt.academic_year_id) as academic_years_count,
            MAX(ay.year_name) as latest_year
        FROM users u
        JOIN borrowing_transactions bt ON u.id_number = bt.student_id_number
        JOIN academic_years ay ON bt.academic_year_id = ay.id
        WHERE u.role = 'student'
        GROUP BY u.id, u.id_number, u.first_name, u.last_name
        ORDER BY total_borrowings DESC
    `);
    console.table(allStudents);

    console.log('\n' + '='.repeat(60));
    console.log('VERIFICATION COMPLETE');
    console.log('='.repeat(60));

    await conn.end();
}

verify().catch(console.error);
