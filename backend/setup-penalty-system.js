const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

async function setupPenaltySystem() {
  try {
    console.log('🚀 Setting up Penalty System...\n');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'penalty-system.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('USE'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
          await pool.execute(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_ENTRY') {
            console.log(`⚠️  Statement ${i + 1} skipped (already exists)`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            throw error;
          }
        }
      }
    }
    
    console.log('\n🎉 Penalty system setup completed successfully!');
    
    // Verify the setup
    console.log('\n🔍 Verifying setup...');
    
    const [tables] = await pool.execute("SHOW TABLES LIKE 'fines'");
    console.log('✅ Fines table created:', tables.length > 0);
    
    const [settingsTable] = await pool.execute("SHOW TABLES LIKE 'system_settings'");
    console.log('✅ System settings table created:', settingsTable.length > 0);
    
    const [semesterTable] = await pool.execute("SHOW TABLES LIKE 'semester_tracking'");
    console.log('✅ Semester tracking table created:', semesterTable.length > 0);
    
    const [statusTable] = await pool.execute("SHOW TABLES LIKE 'student_borrowing_status'");
    console.log('✅ Student borrowing status table created:', statusTable.length > 0);
    
    const [paymentsTable] = await pool.execute("SHOW TABLES LIKE 'fine_payments'");
    console.log('✅ Fine payments table created:', paymentsTable.length > 0);
    
    // Check system settings
    const [settings] = await pool.execute('SELECT * FROM system_settings');
    console.log(`✅ System settings inserted: ${settings.length} settings`);
    
    console.log('\n🎯 Penalty system is ready to use!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error setting up penalty system:', error);
    process.exit(1);
  }
}

setupPenaltySystem();
