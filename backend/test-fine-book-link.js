const mysql = require('mysql2/promise');

async function testFineBookLink() {
    let connection;
    try {
        // Test database connection
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '', // Add password if needed
            database: 'capstone_system'
        });

        console.log('✅ Database connected successfully');

        const studentId = 'C22-0045';
        console.log(`🔍 Testing fine-book link for student: ${studentId}`);

        // Check student's borrowing transactions
        const [borrowingTransactions] = await connection.execute(
            `SELECT 
                bt.id,
                bt.student_id_number,
                bt.book_id,
                bt.borrowed_at,
                bt.due_date,
                bt.status,
                b.title,
                b.author,
                b.number_code
             FROM borrowing_transactions bt
             JOIN books b ON bt.book_id = b.id
             WHERE bt.student_id_number = ? 
             AND bt.status IN ('borrowed', 'overdue')
             ORDER BY bt.due_date ASC`,
            [studentId]
        );

        console.log('📚 Borrowing transactions:', borrowingTransactions);

        // Check student's fines
        const [fines] = await connection.execute(
            `SELECT 
                f.id,
                f.student_id_number,
                f.transaction_id,
                f.fine_amount,
                f.days_overdue,
                f.fine_date,
                f.status,
                f.paid_amount,
                f.paid_date
             FROM fines f
             WHERE f.student_id_number = ?
             ORDER BY f.fine_date DESC`,
            [studentId]
        );

        console.log('💰 Fines:', fines);

        // Check if fines are linked to transactions
        const [linkedFines] = await connection.execute(
            `SELECT 
                f.*, 
                bt.id as transaction_id, 
                bt.book_id, 
                bt.status as transaction_status,
                b.title,
                b.author
             FROM fines f
             LEFT JOIN borrowing_transactions bt ON f.transaction_id = bt.id
             LEFT JOIN books b ON bt.book_id = b.id
             WHERE f.student_id_number = ?`,
            [studentId]
        );

        console.log('🔗 Linked fines and transactions:', linkedFines);

    } catch (error) {
        console.error('❌ Test error:', error.message);
        console.error('Error details:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testFineBookLink();
