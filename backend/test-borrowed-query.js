// Test the borrowed books query directly
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testBorrowedQuery() {
  let connection;
  
  try {
    console.log('🔍 Testing Borrowed Books Query...\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'capstone_system_optimized'
    });

    console.log('✅ Connected to database');

    // Test the exact borrowed query from analytics
    console.log('\n📊 Testing Borrowed Books Query:');
    const borrowedQuery = `
      SELECT COUNT(*) as count 
      FROM borrowing_transactions 
      WHERE returned_date IS NULL AND due_date >= NOW()
    `;
    
    const [borrowedResult] = await connection.execute(borrowedQuery);
    console.log('Currently Borrowed (not overdue):', borrowedResult[0].count);

    // Test overdue query
    const overdueQuery = `
      SELECT COUNT(*) as count 
      FROM borrowing_transactions 
      WHERE returned_date IS NULL AND due_date < NOW()
    `;
    
    const [overdueResult] = await connection.execute(overdueQuery);
    console.log('Overdue books:', overdueResult[0].count);

    // Test all active transactions
    const allActiveQuery = `
      SELECT COUNT(*) as count 
      FROM borrowing_transactions 
      WHERE returned_date IS NULL
    `;
    
    const [allActiveResult] = await connection.execute(allActiveQuery);
    console.log('All active transactions:', allActiveResult[0].count);

    // Show sample data
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
    `);
    
    console.log(`Found ${sampleTransactions.length} active transactions:`);
    sampleTransactions.forEach((tx, index) => {
      console.log(`${index + 1}. Book ID: ${tx.book_id}, Borrowed: ${tx.borrowed_date}, Due: ${tx.due_date}, Status: ${tx.status}`);
    });

    console.log('\n🎉 Query test complete!');

  } catch (error) {
    console.error('❌ Error in query test:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

// Run the test
testBorrowedQuery();
