// Debug script to check book status data in detail
const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugBookStatus() {
  let connection;
  
  try {
    console.log('🔍 Debugging Book Status Data...\n');
    
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'capstone_system_optimized'
    });

    console.log('✅ Connected to database');

    // Check all borrowing transactions
    console.log('\n📚 All Borrowing Transactions:');
    const [allTransactions] = await connection.execute(`
      SELECT 
        id, 
        book_id, 
        user_id, 
        borrowed_date, 
        due_date, 
        returned_date,
        status,
        CASE 
          WHEN returned_date IS NULL AND due_date >= NOW() THEN 'Currently Borrowed'
          WHEN returned_date IS NULL AND due_date < NOW() THEN 'Overdue'
          WHEN returned_date IS NOT NULL THEN 'Returned'
          ELSE 'Unknown'
        END as current_status
      FROM borrowing_transactions 
      ORDER BY borrowed_date DESC
    `);
    
    console.log(`Total transactions: ${allTransactions.length}`);
    allTransactions.forEach((tx, index) => {
      console.log(`${index + 1}. Book ID: ${tx.book_id}, Borrowed: ${tx.borrowed_date}, Due: ${tx.due_date}, Returned: ${tx.returned_date}, Status: ${tx.current_status}`);
    });

    // Check active transactions (not returned)
    console.log('\n🔄 Active Transactions (Not Returned):');
    const [activeTransactions] = await connection.execute(`
      SELECT 
        id, 
        book_id, 
        user_id, 
        borrowed_date, 
        due_date, 
        returned_date,
        status,
        CASE 
          WHEN due_date >= NOW() THEN 'Currently Borrowed'
          WHEN due_date < NOW() THEN 'Overdue'
          ELSE 'Unknown'
        END as current_status
      FROM borrowing_transactions 
      WHERE returned_date IS NULL
      ORDER BY borrowed_date DESC
    `);
    
    console.log(`Active transactions: ${activeTransactions.length}`);
    activeTransactions.forEach((tx, index) => {
      console.log(`${index + 1}. Book ID: ${tx.book_id}, Borrowed: ${tx.borrowed_date}, Due: ${tx.due_date}, Status: ${tx.current_status}`);
    });

    // Check currently borrowed (not overdue)
    console.log('\n📖 Currently Borrowed (Not Overdue):');
    const [currentlyBorrowed] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM borrowing_transactions 
      WHERE returned_date IS NULL AND due_date >= NOW()
    `);
    console.log(`Currently borrowed count: ${currentlyBorrowed[0].count}`);

    // Check overdue
    console.log('\n⚠️ Overdue Books:');
    const [overdue] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM borrowing_transactions 
      WHERE returned_date IS NULL AND due_date < NOW()
    `);
    console.log(`Overdue count: ${overdue[0].count}`);

    // Test the exact query used in analytics
    console.log('\n📊 Analytics Query Test:');
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
    console.log('Book Status Results:');
    bookStatus.forEach(status => {
      console.log(`- ${status.status}: ${status.count}`);
    });

    // Check if there are any books with maintenance status
    console.log('\n🔧 Books with Maintenance Status:');
    const [maintenanceBooks] = await connection.execute(`
      SELECT id, title, status 
      FROM books 
      WHERE status = 'maintenance'
    `);
    console.log(`Maintenance books: ${maintenanceBooks.length}`);
    maintenanceBooks.forEach(book => {
      console.log(`- Book ID: ${book.id}, Title: ${book.title}, Status: ${book.status}`);
    });

    console.log('\n🎉 Debug analysis complete!');

  } catch (error) {
    console.error('❌ Error debugging book status:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

// Run the debug
debugBookStatus();
