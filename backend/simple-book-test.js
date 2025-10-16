// Simple test for book status
const mysql = require('mysql2/promise');
require('dotenv').config();

async function simpleBookTest() {
  let connection;
  
  try {
    console.log('Testing book status...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'capstone_system_optimized'
    });

    console.log('Connected to database');

    // Simple count queries
    const [totalBooks] = await connection.execute('SELECT COUNT(*) as count FROM books');
    console.log('Total books:', totalBooks[0].count);

    const [activeTransactions] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM borrowing_transactions 
      WHERE returned_date IS NULL
    `);
    console.log('Active transactions:', activeTransactions[0].count);

    const [overdueTransactions] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM borrowing_transactions 
      WHERE returned_date IS NULL AND due_date < NOW()
    `);
    console.log('Overdue transactions:', overdueTransactions[0].count);

    const [borrowedTransactions] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM borrowing_transactions 
      WHERE returned_date IS NULL AND due_date >= NOW()
    `);
    console.log('Currently borrowed:', borrowedTransactions[0].count);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

simpleBookTest();
