const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function checkBooks() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'capstone_system',
            port: process.env.DB_PORT || 3306
        });

        console.log('Connected to database successfully!');

        // Check total books
        const [totalBooks] = await connection.execute('SELECT COUNT(*) as total FROM books');
        console.log(`Total books in database: ${totalBooks[0].total}`);

        if (totalBooks[0].total > 0) {
            // Show some sample books
            const [books] = await connection.execute('SELECT title, author, barcode, number_code, status FROM books LIMIT 5');
            console.log('\nSample books:');
            books.forEach(book => {
                console.log(`- ${book.title} by ${book.author} (${book.barcode}) - ${book.status}`);
            });
        }

        // Check status distribution
        const [statusStats] = await connection.execute(`
            SELECT status, COUNT(*) as count 
            FROM books 
            GROUP BY status
        `);

        console.log('\nStatus distribution:');
        statusStats.forEach(stat => {
            console.log(`${stat.status}: ${stat.count}`);
        });

    } catch (error) {
        console.error('Error checking books:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkBooks();
