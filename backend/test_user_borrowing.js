const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function testUserBorrowingEndpoint() {
    let connection;
    
    try {
        // Create connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'capstone_system',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connected to database successfully!');

        // Test the new user borrowing endpoint logic
        const testIdNumber = 'C22-0044'; // Use a test student ID
        
        // Check if student exists
        const [studentRows] = await connection.execute(
            'SELECT * FROM users WHERE id_number = ?',
            [testIdNumber]
        );

        if (studentRows.length === 0) {
            console.log('❌ Test student not found. Please add a student with ID:', testIdNumber);
            return;
        }

        console.log('✅ Test student found:', studentRows[0]);

        // Get current borrowed books (only active/not returned)
        const [borrowedBooks] = await connection.execute(
            `SELECT 
                bt.id,
                bt.borrowed_at,
                bt.due_date,
                bt.status,
                b.title,
                b.author,
                b.number_code,
                b.barcode
             FROM borrowing_transactions bt
             JOIN books b ON bt.book_id = b.id
             WHERE bt.student_id_number = ? 
             AND bt.status IN ('borrowed', 'overdue')
             ORDER BY bt.due_date ASC`,
            [testIdNumber]
        );

        console.log('📚 Borrowed books found:', borrowedBooks.length);

        // Calculate due date status for each book
        const booksWithStatus = borrowedBooks.map(book => {
            const dueDate = new Date(book.due_date);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            // Reset time to compare only dates
            today.setHours(0, 0, 0, 0);
            tomorrow.setHours(0, 0, 0, 0);
            dueDate.setHours(0, 0, 0, 0);
            
            let dueStatus = 'normal';
            let daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            
            if (dueDate < today) {
                dueStatus = 'overdue';
                daysUntilDue = Math.abs(daysUntilDue);
            } else if (dueDate.getTime() === today.getTime()) {
                dueStatus = 'today';
                daysUntilDue = 0;
            } else if (dueDate.getTime() === tomorrow.getTime()) {
                dueStatus = 'tomorrow';
                daysUntilDue = 1;
            } else if (daysUntilDue <= 3) {
                dueStatus = 'near';
            }

            return {
                ...book,
                dueStatus,
                daysUntilDue
            };
        });

        console.log('📖 Books with status calculation:');
        booksWithStatus.forEach(book => {
            console.log(`- ${book.title} (${book.number_code}): ${book.dueStatus} (${book.daysUntilDue} days)`);
        });

        console.log('\n✅ User borrowing endpoint logic test completed successfully!');
        console.log('📱 The mobile app should now be able to fetch borrowed books and show notifications.');

    } catch (error) {
        console.error('❌ Error testing user borrowing endpoint:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testUserBorrowingEndpoint();
