// Test script for analytics with real database
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testRealAnalytics() {
  let connection;
  
  try {
    console.log('Testing Analytics with Real Database...\n');
    
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'capstone_system_optimized'
    });

    console.log('✅ Connected to database');

    // Test basic data counts
    console.log('\n📊 Database Overview:');
    
    const [users] = await connection.execute('SELECT COUNT(*) as total FROM users');
    console.log(`- Total Users: ${users[0].total}`);
    
    const [books] = await connection.execute('SELECT COUNT(*) as total FROM books');
    console.log(`- Total Books: ${books[0].total}`);
    
    const [transactions] = await connection.execute('SELECT COUNT(*) as total FROM borrowing_transactions');
    console.log(`- Total Transactions: ${transactions[0].total}`);
    
    const [fines] = await connection.execute('SELECT COUNT(*) as total FROM fines');
    console.log(`- Total Fines: ${fines[0].total}`);

    // Test user analytics query
    console.log('\n👥 User Analytics:');
    const userQuery = `
      SELECT 
        role,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users), 1) as percentage
      FROM users 
      GROUP BY role
      ORDER BY count DESC
    `;
    const [userTypes] = await connection.execute(userQuery);
    console.log('User Types:', userTypes);

    // Test book categories
    console.log('\n📚 Book Categories:');
    const categoryQuery = `
      SELECT 
        category,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM books), 1) as percentage
      FROM books 
      GROUP BY category
      ORDER BY count DESC
    `;
    const [categories] = await connection.execute(categoryQuery);
    console.log('Book Categories:', categories);

    // Test borrowing trends
    console.log('\n📈 Borrowing Trends:');
    const borrowingQuery = `
      SELECT 
        DATE_FORMAT(borrowed_date, '%b') as month,
        COUNT(*) as borrowed,
        COUNT(CASE WHEN returned_date IS NOT NULL THEN 1 END) as returned,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue
      FROM borrowing_transactions 
      WHERE borrowed_date >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
      GROUP BY DATE_FORMAT(borrowed_date, '%Y-%m')
      ORDER BY borrowed_date
    `;
    const [borrowingTrends] = await connection.execute(borrowingQuery);
    console.log('Borrowing Trends:', borrowingTrends);

    // Test system metrics
    console.log('\n🔧 System Metrics:');
    const systemQuery = `
      SELECT 
        DATE(login_time) as date,
        COUNT(DISTINCT user_id) as logins,
        COUNT(CASE WHEN user_type = 'student' THEN 1 END) as student_logins,
        COUNT(CASE WHEN user_type = 'admin' THEN 1 END) as admin_logins
      FROM login_logs 
      WHERE login_time >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
      GROUP BY DATE(login_time)
      ORDER BY login_time
      LIMIT 5
    `;
    const [systemMetrics] = await connection.execute(systemQuery);
    console.log('System Metrics (last 5 days):', systemMetrics);

    console.log('\n🎉 Analytics data is available and ready!');
    console.log('\nThe analytics dashboard will now show real data from your database.');

  } catch (error) {
    console.error('❌ Error testing analytics:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

// Run the test
testRealAnalytics();
