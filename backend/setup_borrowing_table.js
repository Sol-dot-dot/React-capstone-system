const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function setupBorrowingTable() {
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

        console.log('Connected to database successfully!');

        // Create borrowing transactions table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS borrowing_transactions (
                id INT PRIMARY KEY AUTO_INCREMENT,
                student_id_number VARCHAR(10) NOT NULL,
                book_id INT NOT NULL,
                borrowed_by_admin INT NOT NULL,
                borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                due_date TIMESTAMP NULL,
                returned_at TIMESTAMP NULL,
                returned_by_admin INT NULL,
                status ENUM('borrowed', 'returned', 'overdue') DEFAULT 'borrowed',
                notes TEXT,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
                FOREIGN KEY (borrowed_by_admin) REFERENCES admins(id),
                FOREIGN KEY (returned_by_admin) REFERENCES admins(id)
            )
        `;

        await connection.execute(createTableQuery);
        console.log('✅ Borrowing transactions table created successfully!');

        // Add indexes for better performance
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_borrowing_student_id ON borrowing_transactions(student_id_number)',
            'CREATE INDEX IF NOT EXISTS idx_borrowing_book_id ON borrowing_transactions(book_id)',
            'CREATE INDEX IF NOT EXISTS idx_borrowing_status ON borrowing_transactions(status)',
            'CREATE INDEX IF NOT EXISTS idx_borrowing_due_date ON borrowing_transactions(due_date)',
            'CREATE INDEX IF NOT EXISTS idx_borrowing_borrowed_at ON borrowing_transactions(borrowed_at)'
        ];

        for (const indexQuery of indexes) {
            try {
                await connection.execute(indexQuery);
                console.log('✅ Index created successfully');
            } catch (error) {
                if (error.code === 'ER_DUP_KEYNAME') {
                    console.log('ℹ️  Index already exists');
                } else {
                    console.error('❌ Error creating index:', error.message);
                }
            }
        }

        console.log('🎉 Borrowing system setup completed successfully!');

    } catch (error) {
        console.error('❌ Error setting up borrowing table:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed.');
        }
    }
}

// Run the setup
setupBorrowingTable();
