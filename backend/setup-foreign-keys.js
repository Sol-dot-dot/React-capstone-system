const mysql = require('mysql2/promise');
const fs = require('fs');

async function setupForeignKeys() {
    let connection;
    try {
        // Create connection
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '', // Add password if needed
            database: 'capstone_system'
        });

        console.log('Connected to database');

        // Read and execute the SQL file
        const sql = fs.readFileSync('add-foreign-keys.sql', 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.execute(statement);
                    console.log('✓ Executed:', statement.substring(0, 50) + '...');
                } catch (error) {
                    if (error.code === 'ER_DUP_KEYNAME' || error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
                        console.log('⚠ Skipped (already exists):', statement.substring(0, 50) + '...');
                    } else {
                        console.error('✗ Error executing:', statement.substring(0, 50) + '...');
                        console.error('Error:', error.message);
                    }
                }
            }
        }

        console.log('Foreign key setup completed!');

    } catch (error) {
        console.error('Database connection error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupForeignKeys();
