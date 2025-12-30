/**
 * Verify All Borrowings for C22-0044
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

    console.log('=== ALL Borrowing Transactions for C22-0044 ===');
    const [borrowings] = await conn.query(`
        SELECT bt.id, bt.student_id_number, bt.borrowed_date, bt.returned_date, bt.status, bt.semester_id, s.semester_name, ay.year_name
        FROM borrowing_transactions bt
        LEFT JOIN semesters s ON bt.semester_id = s.id
        LEFT JOIN academic_years ay ON bt.academic_year_id = ay.id
        WHERE bt.student_id_number = 'C22-0044'
        ORDER BY bt.borrowed_date DESC
    `);
    console.log('Total borrowings:', borrowings.length);
    console.table(borrowings);

    console.log('\n=== Academic Years ===');
    const [years] = await conn.query(`SELECT * FROM academic_years ORDER BY start_date`);
    console.table(years);

    console.log('\n=== Semesters ===');
    const [semesters] = await conn.query(`
        SELECT s.*, ay.year_name
        FROM semesters s
        JOIN academic_years ay ON s.academic_year_id = ay.id
        ORDER BY s.start_date
    `);
    console.table(semesters);

    await conn.end();
}

verify().catch(console.error);
