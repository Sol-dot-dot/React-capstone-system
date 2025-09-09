const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function checkDatabaseSchema() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('🔗 Connected to database');

    // Check if fines table exists and its structure
    console.log('\n📋 Checking fines table structure:');
    const [finesColumns] = await connection.execute(`
      DESCRIBE fines
    `);
    console.table(finesColumns);

    // Check if borrowing_transactions table exists and its structure
    console.log('\n📋 Checking borrowing_transactions table structure:');
    const [borrowingColumns] = await connection.execute(`
      DESCRIBE borrowing_transactions
    `);
    console.table(borrowingColumns);

    // Check if books table exists and its structure
    console.log('\n📋 Checking books table structure:');
    const [booksColumns] = await connection.execute(`
      DESCRIBE books
    `);
    console.table(booksColumns);

    // Check current fines data
    console.log('\n📊 Current fines data:');
    const [finesData] = await connection.execute(`
      SELECT * FROM fines LIMIT 5
    `);
    console.table(finesData);

    // Check current borrowing transactions
    console.log('\n📊 Current borrowing transactions:');
    const [borrowingData] = await connection.execute(`
      SELECT * FROM borrowing_transactions LIMIT 5
    `);
    console.table(borrowingData);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

checkDatabaseSchema();
