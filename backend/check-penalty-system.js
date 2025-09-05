const pool = require('./config/database');

async function checkPenaltySystem() {
  try {
    console.log('=== CHECKING PENALTY SYSTEM ===\n');
    
    // Check overdue books
    const [overdue] = await pool.execute(`
      SELECT id, student_id_number, due_date, status, borrowed_at 
      FROM borrowing_transactions 
      WHERE status = 'borrowed' AND due_date < CURDATE()
    `);
    console.log('📚 Overdue books:', overdue.length);
    overdue.forEach(book => {
      console.log(`  - Transaction ${book.id}: Student ${book.student_id_number}, Due: ${book.due_date}, Borrowed: ${book.borrowed_at}`);
    });
    
    // Check existing fines
    const [fines] = await pool.execute('SELECT * FROM fines ORDER BY fine_date DESC');
    console.log('\n💰 Existing fines:', fines.length);
    fines.forEach(fine => {
      console.log(`  - Fine ${fine.id}: Student ${fine.student_id_number}, Amount: ₱${fine.fine_amount}, Status: ${fine.status}, Days: ${fine.days_overdue}`);
    });
    
    // Check system settings
    const [settings] = await pool.execute('SELECT * FROM system_settings');
    console.log('\n⚙️ System settings:', settings.length);
    settings.forEach(setting => {
      console.log(`  - ${setting.setting_key}: ${setting.setting_value}`);
    });
    
    // Check if penalty system tables exist
    const [tables] = await pool.execute("SHOW TABLES LIKE 'fines'");
    console.log('\n🗄️ Fines table exists:', tables.length > 0);
    
    const [settingsTable] = await pool.execute("SHOW TABLES LIKE 'system_settings'");
    console.log('🗄️ System settings table exists:', settingsTable.length > 0);
    
    // Check borrowing transactions status
    const [allBorrowed] = await pool.execute(`
      SELECT status, COUNT(*) as count 
      FROM borrowing_transactions 
      GROUP BY status
    `);
    console.log('\n📊 Borrowing transaction status:');
    allBorrowed.forEach(stat => {
      console.log(`  - ${stat.status}: ${stat.count} books`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPenaltySystem();
