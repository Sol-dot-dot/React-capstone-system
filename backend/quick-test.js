// Quick test to check database connection and tables
const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function quickTest() {
  let connection;
  
  try {
    console.log('Testing database connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('✅ Connected to database');
    
    // Test if fines table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'fines'");
    console.log('Fines table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      // Check fines structure
      const [columns] = await connection.execute("DESCRIBE fines");
      console.log('Fines table columns:');
      columns.forEach(col => console.log(`  ${col.Field}: ${col.Type}`));
      
      // Check fines data
      const [fines] = await connection.execute("SELECT * FROM fines LIMIT 3");
      console.log('Sample fines data:', fines);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

quickTest();
