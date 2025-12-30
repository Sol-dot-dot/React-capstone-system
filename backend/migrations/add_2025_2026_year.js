/**
 * Add 2025-2026 Academic Year and fix semester assignments
 */

require('dotenv').config({ path: './config.env' });
const mysql = require('mysql2/promise');

async function addYear() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'capstone_system_optimized'
    });

    console.log('Adding 2025-2026 academic year...');

    // Add 2025-2026 academic year
    await conn.query(`
        INSERT INTO academic_years (year_name, start_date, end_date, is_current)
        VALUES ('2025-2026', '2025-08-01', '2026-05-31', 0)
        ON DUPLICATE KEY UPDATE year_name = year_name
    `);

    // Get the new academic year id
    const [years] = await conn.query(`SELECT id FROM academic_years WHERE year_name = '2025-2026'`);
    const ayId = years[0].id;

    // Add semesters for 2025-2026
    await conn.query(`
        INSERT INTO semesters (academic_year_id, semester_number, semester_name, start_date, end_date, is_current)
        VALUES (?, 1, 'First Semester', '2025-08-01', '2025-12-20', 1)
        ON DUPLICATE KEY UPDATE is_current = 1
    `, [ayId]);

    await conn.query(`
        INSERT INTO semesters (academic_year_id, semester_number, semester_name, start_date, end_date, is_current)
        VALUES (?, 2, 'Second Semester', '2026-01-10', '2026-05-31', 0)
        ON DUPLICATE KEY UPDATE semester_name = semester_name
    `, [ayId]);

    // Update current flags - set 2025-2026 as current
    await conn.query(`UPDATE academic_years SET is_current = 0`);
    await conn.query(`UPDATE academic_years SET is_current = 1 WHERE year_name = '2025-2026'`);
    await conn.query(`UPDATE semesters SET is_current = 0`);
    await conn.query(`UPDATE semesters SET is_current = 1 WHERE academic_year_id = ? AND semester_number = 1`, [ayId]);

    // Re-link borrowings to correct semesters based on date
    console.log('Re-linking borrowings to semesters...');
    const [updateResult] = await conn.query(`
        UPDATE borrowing_transactions bt
        JOIN semesters s ON bt.borrowed_date BETWEEN s.start_date AND s.end_date
        SET bt.semester_id = s.id, bt.academic_year_id = s.academic_year_id
    `);
    console.log(`Updated ${updateResult.affectedRows} borrowings`);

    // Update student year history
    console.log('Updating student year history...');
    await conn.query(`
        INSERT IGNORE INTO student_year_history (user_id, academic_year_id, year_level, status)
        SELECT DISTINCT
            u.id as user_id,
            bt.academic_year_id,
            1 as year_level,
            'enrolled'
        FROM borrowing_transactions bt
        JOIN users u ON bt.student_id_number = u.id_number
        WHERE bt.academic_year_id IS NOT NULL AND u.role = 'student'
    `);

    // Update semester clearances
    console.log('Updating semester clearances...');
    await conn.query(`
        INSERT INTO semester_clearances (user_id, semester_id, books_borrowed, total_fines, fines_paid)
        SELECT
            u.id as user_id,
            bt.semester_id,
            COUNT(DISTINCT bt.id) as books_borrowed,
            COALESCE(SUM(f.fine_amount), 0) as total_fines,
            COALESCE(SUM(f.paid_amount), 0) as fines_paid
        FROM borrowing_transactions bt
        JOIN users u ON bt.student_id_number = u.id_number
        LEFT JOIN fines f ON bt.id = f.transaction_id
        WHERE bt.semester_id IS NOT NULL AND u.role = 'student'
        GROUP BY u.id, bt.semester_id
        ON DUPLICATE KEY UPDATE
            books_borrowed = VALUES(books_borrowed),
            total_fines = VALUES(total_fines),
            fines_paid = VALUES(fines_paid)
    `);

    // Verify
    console.log('\n=== Verification ===');
    const [borrowings] = await conn.query(`
        SELECT bt.id, bt.student_id_number, bt.borrowed_date, s.semester_name, ay.year_name
        FROM borrowing_transactions bt
        LEFT JOIN semesters s ON bt.semester_id = s.id
        LEFT JOIN academic_years ay ON bt.academic_year_id = ay.id
        WHERE bt.student_id_number = 'C22-0044'
        ORDER BY bt.borrowed_date DESC
    `);
    console.table(borrowings);

    console.log('\nDone!');
    await conn.end();
}

addYear().catch(console.error);
