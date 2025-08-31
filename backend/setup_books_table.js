const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function setupBooksTable() {
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

        // Create books table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS books (
                id INT PRIMARY KEY AUTO_INCREMENT,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                isbn VARCHAR(13),
                publisher VARCHAR(255),
                publication_year INT,
                genre VARCHAR(100),
                description TEXT,
                barcode VARCHAR(50) UNIQUE NOT NULL,
                number_code VARCHAR(20) UNIQUE NOT NULL,
                status ENUM('available', 'borrowed', 'lost', 'maintenance') DEFAULT 'available',
                location VARCHAR(100),
                added_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (added_by) REFERENCES admins(id)
            )
        `;

        await connection.execute(createTableQuery);
        console.log('✅ Books table created successfully!');

        // Create indexes for better performance
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_books_title ON books(title)',
            'CREATE INDEX IF NOT EXISTS idx_books_author ON books(author)',
            'CREATE INDEX IF NOT EXISTS idx_books_barcode ON books(barcode)',
            'CREATE INDEX IF NOT EXISTS idx_books_number_code ON books(number_code)',
            'CREATE INDEX IF NOT EXISTS idx_books_status ON books(status)',
            'CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre)',
            'CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at)'
        ];

        for (const indexQuery of indexes) {
            try {
                await connection.execute(indexQuery);
            } catch (error) {
                // Index might already exist, that's okay
                console.log('Index already exists or error (continuing):', error.message);
            }
        }

        console.log('✅ Database indexes created successfully!');
        console.log('🎉 Books table setup completed successfully!');

    } catch (error) {
        console.error('❌ Error setting up books table:', error.message);
        console.error('Please check your database connection and try again.');
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the setup
setupBooksTable();
