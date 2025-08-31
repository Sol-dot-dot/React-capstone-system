const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function testDatabase() {
    let connection;
    
    try {
        console.log('Testing database connection...');
        console.log('Config:', {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'capstone_system',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Database connection successful!');

        // Test if books table exists
        const [tables] = await connection.execute(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'books'
        `, [process.env.DB_NAME]);

        if (tables.length > 0) {
            console.log('✅ Books table exists!');
            
            // Count books
            const [count] = await connection.execute('SELECT COUNT(*) as total FROM books');
            console.log(`📚 Total books: ${count[0].total}`);
            
            if (count[0].total > 0) {
                const [books] = await connection.execute('SELECT title, author FROM books LIMIT 3');
                console.log('Sample books:');
                books.forEach(book => console.log(`- ${book.title} by ${book.author}`));
            }
        } else {
            console.log('❌ Books table does not exist!');
        }

        // Test if admins table exists
        const [adminTables] = await connection.execute(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'admins'
        `, [process.env.DB_NAME]);

        if (adminTables.length > 0) {
            console.log('✅ Admins table exists!');
            const [admins] = await connection.execute('SELECT COUNT(*) as total FROM admins');
            console.log(`👥 Total admins: ${admins[0].total}`);
        } else {
            console.log('❌ Admins table does not exist!');
        }

    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        console.error('Full error:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed.');
        }
    }
}

testDatabase();
