const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config({ path: './config.env' });

async function runSQL() {
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

    // Read and execute the SQL file
    const sql = fs.readFileSync('./add-unpaid-fines.sql', 'utf8');
    const statements = sql.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const [result] = await connection.execute(statement);
          console.log('✅ Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          console.log('⚠️ Statement failed:', statement.substring(0, 50) + '...', error.message);
        }
      }
    }

    console.log('\n✅ SQL script completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

runSQL();
