// Direct database test for book status
const mysql = require('mysql2/promise');
require('dotenv').config();

async function directDbTest() {
  let connection;
  
  try {
    console.log('🔍 Direct Database Test for Book Status...\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'capstone_system_optimized'
    });

    console.log('✅ Connected to database');

    // Test the exact query from analytics
    console.log('\n📊 Testing Book Status Query:');
    const bookStatusQuery = `
      SELECT 
        'Available' as status,
        (SELECT COUNT(*) FROM books WHERE id NOT IN (
          SELECT DISTINCT book_id FROM borrowing_transactions WHERE returned_date IS NULL
        ) AND status != 'maintenance') as count,
        ROUND((SELECT COUNT(*) FROM books WHERE id NOT IN (
          SELECT DISTINCT book_id FROM borrowing_transactions WHERE returned_date IS NULL
        ) AND status != 'maintenance') * 100.0 / (SELECT COUNT(*) FROM books), 1) as percentage
      UNION ALL
      SELECT 
        'Borrowed' as status,
        (SELECT COUNT(*) FROM borrowing_transactions WHERE returned_date IS NULL AND due_date >= NOW()) as count,
        ROUND((SELECT COUNT(*) FROM borrowing_transactions WHERE returned_date IS NULL AND due_date >= NOW()) * 100.0 / (SELECT COUNT(*) FROM books), 1) as percentage
      UNION ALL
      SELECT 
        'Overdue' as status,
        (SELECT COUNT(*) FROM borrowing_transactions WHERE returned_date IS NULL AND due_date < NOW()) as count,
        ROUND((SELECT COUNT(*) FROM borrowing_transactions WHERE returned_date IS NULL AND due_date < NOW()) * 100.0 / (SELECT COUNT(*) FROM books), 1) as percentage
      UNION ALL
      SELECT 
        'Maintenance' as status,
        (SELECT COUNT(*) FROM books WHERE status = 'maintenance') as count,
        ROUND((SELECT COUNT(*) FROM books WHERE status = 'maintenance') * 100.0 / (SELECT COUNT(*) FROM books), 1) as percentage
    `;
    
    const [bookStatus] = await connection.execute(bookStatusQuery);
    console.log('Book Status Results:');
    bookStatus.forEach(status => {
      console.log(`- ${status.status}: ${status.count} (${status.percentage}%)`);
    });

    // Test individual components
    console.log('\n🔍 Individual Component Tests:');
    
    const [totalBooks] = await connection.execute('SELECT COUNT(*) as count FROM books');
    console.log(`Total books: ${totalBooks[0].count}`);
    
    const [activeTransactions] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM borrowing_transactions 
      WHERE returned_date IS NULL
    `);
    console.log(`Active transactions: ${activeTransactions[0].count}`);
    
    const [borrowedCount] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM borrowing_transactions 
      WHERE returned_date IS NULL AND due_date >= NOW()
    `);
    console.log(`Currently borrowed: ${borrowedCount[0].count}`);
    
    const [overdueCount] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM borrowing_transactions 
      WHERE returned_date IS NULL AND due_date < NOW()
    `);
    console.log(`Overdue: ${overdueCount[0].count}`);

    // Show some sample data
    console.log('\n📋 Sample Active Transactions:');
    const [sampleTransactions] = await connection.execute(`
      SELECT 
        book_id, 
        borrowed_date, 
        due_date, 
        returned_date,
        CASE 
          WHEN due_date >= NOW() THEN 'Currently Borrowed'
          WHEN due_date < NOW() THEN 'Overdue'
          ELSE 'Unknown'
        END as status
      FROM borrowing_transactions 
      WHERE returned_date IS NULL
      ORDER BY borrowed_date DESC
      LIMIT 5
    `);
    
    sampleTransactions.forEach((tx, index) => {
      console.log(`${index + 1}. Book ID: ${tx.book_id}, Borrowed: ${tx.borrowed_date}, Due: ${tx.due_date}, Status: ${tx.status}`);
    });

    console.log('\n🎉 Direct database test complete!');

  } catch (error) {
    console.error('❌ Error in direct database test:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

// Run the test
directDbTest();
