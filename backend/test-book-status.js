// Test script to check book status data
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testBookStatus() {
  let connection;
  
  try {
    console.log('Testing Book Status Data...\n');
    
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'capstone_system_optimized'
    });

    console.log('✅ Connected to database');

    // Test basic book counts
    console.log('\n📚 Book Overview:');
    
    const [totalBooks] = await connection.execute('SELECT COUNT(*) as total FROM books');
    console.log(`- Total Books: ${totalBooks[0].total}`);
    
    const [activeTransactions] = await connection.execute(`
      SELECT COUNT(*) as total 
      FROM borrowing_transactions 
      WHERE returned_date IS NULL
    `);
    console.log(`- Active Transactions: ${activeTransactions[0].total}`);
    
    const [overdueTransactions] = await connection.execute(`
      SELECT COUNT(*) as total 
      FROM borrowing_transactions 
      WHERE returned_date IS NULL AND due_date < NOW()
    `);
    console.log(`- Overdue Transactions: ${overdueTransactions[0].total}`);
    
    const [currentBorrowed] = await connection.execute(`
      SELECT COUNT(*) as total 
      FROM borrowing_transactions 
      WHERE returned_date IS NULL AND due_date >= NOW()
    `);
    console.log(`- Currently Borrowed: ${currentBorrowed[0].total}`);

    // Test the book status query
    console.log('\n📊 Book Status Query:');
    const bookStatusQuery = `
      SELECT 
        CASE 
          WHEN bt.id IS NOT NULL AND bt.returned_date IS NULL AND bt.due_date >= NOW() THEN 'Borrowed'
          WHEN bt.id IS NOT NULL AND bt.returned_date IS NULL AND bt.due_date < NOW() THEN 'Overdue'
          WHEN b.status = 'maintenance' THEN 'Maintenance'
          ELSE 'Available'
        END as status,
        COUNT(*) as count
      FROM books b
      LEFT JOIN (
        SELECT book_id, borrowed_date, returned_date, due_date, id
        FROM borrowing_transactions 
        WHERE returned_date IS NULL
      ) bt ON b.id = bt.book_id
      GROUP BY 
        CASE 
          WHEN bt.id IS NOT NULL AND bt.returned_date IS NULL AND bt.due_date >= NOW() THEN 'Borrowed'
          WHEN bt.id IS NOT NULL AND bt.returned_date IS NULL AND bt.due_date < NOW() THEN 'Overdue'
          WHEN b.status = 'maintenance' THEN 'Maintenance'
          ELSE 'Available'
        END
    `;
    
    const [bookStatus] = await connection.execute(bookStatusQuery);
    console.log('Book Status Results:', bookStatus);

    // Test individual book statuses
    console.log('\n🔍 Individual Book Statuses:');
    const [bookDetails] = await connection.execute(`
      SELECT 
        b.id, 
        b.title, 
        bt.borrowed_date, 
        bt.returned_date, 
        bt.due_date,
        CASE 
          WHEN bt.id IS NOT NULL AND bt.returned_date IS NULL AND bt.due_date >= NOW() THEN 'Borrowed'
          WHEN bt.id IS NOT NULL AND bt.returned_date IS NULL AND bt.due_date < NOW() THEN 'Overdue'
          WHEN b.status = 'maintenance' THEN 'Maintenance'
          ELSE 'Available'
        END as status
      FROM books b
      LEFT JOIN (
        SELECT book_id, borrowed_date, returned_date, due_date, id
        FROM borrowing_transactions 
        WHERE returned_date IS NULL
      ) bt ON b.id = bt.book_id
      ORDER BY b.id
      LIMIT 10
    `);
    
    console.log('Book Details (first 10):', bookDetails);

    console.log('\n🎉 Book status data analysis complete!');

  } catch (error) {
    console.error('❌ Error testing book status:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

// Run the test
testBookStatus();
