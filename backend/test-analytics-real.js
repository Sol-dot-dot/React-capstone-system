// Test script for analytics endpoints with real database
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testAnalyticsWithRealDB() {
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

    // Test user growth query
    console.log('\n1. Testing User Growth Query...');
    const userGrowthQuery = `
      SELECT 
        DATE_FORMAT(created_at, '%b') as month,
        COUNT(*) as users,
        SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verified,
        COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH) AND role = 'student'
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY created_at
    `;
    
    const [userGrowth] = await connection.execute(userGrowthQuery);
    console.log('User Growth Results:', userGrowth);

    // Test book categories query
    console.log('\n2. Testing Book Categories Query...');
    const bookCategoriesQuery = `
      SELECT 
        category,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM books), 1) as percentage
      FROM books 
      GROUP BY category
      ORDER BY count DESC
    `;
    
    const [bookCategories] = await connection.execute(bookCategoriesQuery);
    console.log('Book Categories Results:', bookCategories);

    // Test borrowing trends query
    console.log('\n3. Testing Borrowing Trends Query...');
    const borrowingTrendsQuery = `
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
    
    const [borrowingTrends] = await connection.execute(borrowingTrendsQuery);
    console.log('Borrowing Trends Results:', borrowingTrends);

    // Test system metrics query
    console.log('\n4. Testing System Metrics Query...');
    const systemMetricsQuery = `
      SELECT 
        DATE(login_time) as date,
        COUNT(DISTINCT user_id) as logins,
        COUNT(CASE WHEN user_type = 'student' THEN 1 END) as student_logins,
        COUNT(CASE WHEN user_type = 'admin' THEN 1 END) as admin_logins
      FROM login_logs 
      WHERE login_time >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
      GROUP BY DATE(login_time)
      ORDER BY login_time
    `;
    
    const [systemMetrics] = await connection.execute(systemMetricsQuery);
    console.log('System Metrics Results:', systemMetrics);

    // Test fines query
    console.log('\n5. Testing Fines Query...');
    const finesQuery = `
      SELECT 
        'overdue' as type,
        COUNT(*) as count,
        SUM(fine_amount) as amount,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM fines), 1) as percentage
      FROM fines 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
      GROUP BY 'overdue'
      ORDER BY count DESC
    `;
    
    const [fines] = await connection.execute(finesQuery);
    console.log('Fines Results:', fines);

    console.log('\n🎉 All analytics queries executed successfully!');
    console.log('\nDatabase contains:');
    console.log(`- ${userGrowth.length} user growth records`);
    console.log(`- ${bookCategories.length} book categories`);
    console.log(`- ${borrowingTrends.length} borrowing trend records`);
    console.log(`- ${systemMetrics.length} system metric records`);
    console.log(`- ${fines.length} fine records`);

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
testAnalyticsWithRealDB();
