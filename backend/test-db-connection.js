const pool = require('./config/database');

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    
    const [rows] = await pool.execute('SELECT 1 as test');
    console.log('✅ Database connection successful:', rows);
    
    const [tables] = await pool.execute('SHOW TABLES');
    console.log('📋 Available tables:', tables.map(t => t.Tables_in_capstone_system));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
