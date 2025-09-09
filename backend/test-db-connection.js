console.log('Starting database test...');

try {
  const mysql = require('mysql2/promise');
  console.log('✅ MySQL module loaded');
  
  require('dotenv').config({ path: './config.env' });
  console.log('✅ Environment loaded');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_NAME:', process.env.DB_NAME);
  
  async function testConnection() {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('✅ Database connected');
    
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query executed:', result);
    
    await connection.end();
    console.log('✅ Connection closed');
  }
  
  testConnection().catch(console.error);
  
} catch (error) {
  console.error('❌ Error:', error);
}
