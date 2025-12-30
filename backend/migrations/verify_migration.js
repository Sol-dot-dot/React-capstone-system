/**
 * Verify Migration Script
 * Checks if the semester tracking migration was successful
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

    console.log('=== Borrowing Transactions for C22-0044 ===');
    const [borrowings] = await conn.query(`
        SELECT bt.id, bt.student_id_number, bt.borrowed_date, bt.semester_id, s.semester_name, ay.year_name
        FROM borrowing_transactions bt
        LEFT JOIN semesters s ON bt.semester_id = s.id
        LEFT JOIN academic_years ay ON bt.academic_year_id = ay.id
        WHERE bt.student_id_number = 'C22-0044'
        ORDER BY bt.borrowed_date
        LIMIT 10
    `);
    console.table(borrowings);

    console.log('\n=== Student Year History ===');
    const [history] = await conn.query(`
        SELECT syh.user_id, syh.year_level, u.id_number, ay.year_name
        FROM student_year_history syh
        JOIN users u ON syh.user_id = u.id
        JOIN academic_years ay ON syh.academic_year_id = ay.id
    `);
    console.table(history);

    console.log('\n=== Semester Clearances ===');
    const [clearances] = await conn.query(`
        SELECT sc.user_id, sc.books_borrowed, u.id_number, s.semester_name, ay.year_name
        FROM semester_clearances sc
        JOIN users u ON sc.user_id = u.id
        JOIN semesters s ON sc.semester_id = s.id
        JOIN academic_years ay ON s.academic_year_id = ay.id
    `);
    console.table(clearances);

    await conn.end();
}

verify().catch(console.error);
