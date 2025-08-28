const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function updateDatabase() {
    let connection;
    
    try {
        // Create connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        console.log('Connected to database successfully');

        // Check if reset_code column exists
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME = 'reset_code'
        `);

        if (columns.length === 0) {
            console.log('Adding password reset fields to users table...');
            
            // Add the password reset fields
            await connection.execute(`
                ALTER TABLE users 
                ADD COLUMN reset_code VARCHAR(6) NULL,
                ADD COLUMN reset_expires TIMESTAMP NULL
            `);
            
            console.log('Password reset fields added successfully!');
        } else {
            console.log('Password reset fields already exist in users table');
        }

        // Verify the table structure
        const [tableStructure] = await connection.execute('DESCRIBE users');
        console.log('\nCurrent users table structure:');
        tableStructure.forEach(column => {
            console.log(`${column.Field}: ${column.Type} ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });

    } catch (error) {
        console.error('Database update error:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed');
        }
    }
}

updateDatabase();
