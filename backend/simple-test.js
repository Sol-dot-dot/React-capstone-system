console.log('Starting simple test...');

try {
  const mysql = require('mysql2/promise');
  console.log('✅ MySQL module loaded');
  
  require('dotenv').config({ path: './config.env' });
  console.log('✅ Environment loaded');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_NAME:', process.env.DB_NAME);
  
  async function test() {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });
      
      console.log('✅ Database connected');
      
      // Test a simple query
      const [result] = await connection.execute('SELECT 1 as test');
      console.log('✅ Simple query works:', result);
      
      // Test if fines table exists
      const [tables] = await connection.execute("SHOW TABLES LIKE 'fines'");
      console.log('✅ Fines table exists:', tables.length > 0);
      
      if (tables.length > 0) {
        // Test if we can query fines
        const [fines] = await connection.execute('SELECT COUNT(*) as count FROM fines');
        console.log('✅ Fines table query works:', fines);
      }
      
      await connection.end();
      console.log('✅ Connection closed');
      
    } catch (dbError) {
      console.error('❌ Database error:', dbError.message);
    }
  }
  
  test();
  
} catch (error) {
  console.error('❌ General error:', error.message);
}
