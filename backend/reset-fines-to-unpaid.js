const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function resetFinesToUnpaid() {
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

    // First, let's see what fines exist
    console.log('📊 Current fines in database:');
    const [allFines] = await connection.execute(`
      SELECT student_id_number, status, amount, COUNT(*) as count
      FROM fines 
      GROUP BY student_id_number, status
    `);
    console.table(allFines);

    // Reset some paid fines back to unpaid for testing
    console.log('🔄 Resetting some paid fines to unpaid status...');
    
    const [result] = await connection.execute(`
      UPDATE fines 
      SET status = 'unpaid' 
      WHERE student_id_number IN ('C22-0045', 'C22-0044') 
      AND status = 'paid'
      LIMIT 2
    `);

    console.log(`✅ Updated ${result.affectedRows} fines to unpaid status`);

    // Show current status
    const [fines] = await connection.execute(`
      SELECT student_id_number, 
             COUNT(*) as total_fines,
             SUM(CASE WHEN status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_fines,
             SUM(amount) as total_amount,
             SUM(CASE WHEN status = 'unpaid' THEN amount ELSE 0 END) as unpaid_amount
      FROM fines 
      WHERE student_id_number IN ('C22-0045', 'C22-0044')
      GROUP BY student_id_number
    `);

    console.log('\n📊 Current fines status:');
    console.table(fines);

    if (fines.length > 0 && fines.some(f => f.unpaid_fines > 0)) {
      console.log('\n🎯 Perfect! Now you should see "Paid" buttons in Penalty Management for students with unpaid fines.');
    } else {
      console.log('\n⚠️ No unpaid fines found. You may need to create some new fines.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

resetFinesToUnpaid();
