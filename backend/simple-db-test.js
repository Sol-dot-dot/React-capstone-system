// Simple database connection test
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  let connection;
  
  try {
    console.log('Testing database connection...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'capstone_system_optimized'
    });

    console.log('✅ Connected to database');

    // Test simple query
    const [rows] = await connection.execute('SELECT COUNT(*) as total FROM users');
    console.log('Total users:', rows[0].total);

    const [books] = await connection.execute('SELECT COUNT(*) as total FROM books');
    console.log('Total books:', books[0].total);

    const [transactions] = await connection.execute('SELECT COUNT(*) as total FROM borrowing_transactions');
    console.log('Total transactions:', transactions[0].total);

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

testConnection();
