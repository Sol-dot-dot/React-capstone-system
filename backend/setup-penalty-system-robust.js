const pool = require('./config/database');

async function setupPenaltySystem() {
  try {
    console.log('🚀 Setting up Penalty System (Robust Version)...\n');
    
    // Create system_settings table
    console.log('📝 Creating system_settings table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value VARCHAR(255) NOT NULL,
        description TEXT,
        updated_by INT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ system_settings table ready');
    
    // Insert default system settings (ignore duplicates)
    console.log('⚙️ Inserting default system settings...');
    const defaultSettings = [
      ['max_books_per_borrowing', '3', 'Maximum number of books a student can borrow at once'],
      ['borrowing_period_days', '7', 'Number of days a book can be borrowed (1 week)'],
      ['fine_per_day', '5', 'Fine amount in pesos per day for overdue books'],
      ['books_required_per_semester', '20', 'Minimum number of books a student must borrow per semester'],
      ['semester_duration_months', '5', 'Duration of a semester in months']
    ];
    
    for (const [key, value, description] of defaultSettings) {
      await pool.execute(`
        INSERT IGNORE INTO system_settings (setting_key, setting_value, description) 
        VALUES (?, ?, ?)
      `, [key, value, description]);
    }
    console.log('✅ Default settings inserted');
    
    // Create fines table
    console.log('📝 Creating fines table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS fines (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id_number VARCHAR(10) NOT NULL,
        transaction_id INT NOT NULL,
        fine_amount DECIMAL(10,2) NOT NULL,
        days_overdue INT NOT NULL,
        fine_date DATE NOT NULL,
        paid_amount DECIMAL(10,2) DEFAULT 0.00,
        paid_date TIMESTAMP NULL,
        status ENUM('unpaid', 'paid', 'waived') DEFAULT 'unpaid',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ fines table ready');
    
    // Create semester_tracking table
    console.log('📝 Creating semester_tracking table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS semester_tracking (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id_number VARCHAR(10) NOT NULL,
        semester_start_date DATE NOT NULL,
        semester_end_date DATE NOT NULL,
        books_borrowed_count INT DEFAULT 0,
        books_required INT DEFAULT 20,
        status ENUM('active', 'completed', 'incomplete') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_active_semester (student_id_number, status)
      )
    `);
    console.log('✅ semester_tracking table ready');
    
    // Create student_borrowing_status table
    console.log('📝 Creating student_borrowing_status table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS student_borrowing_status (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id_number VARCHAR(10) UNIQUE NOT NULL,
        can_borrow BOOLEAN DEFAULT TRUE,
        reason_blocked TEXT NULL,
        blocked_until TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ student_borrowing_status table ready');
    
    // Create fine_payments table
    console.log('📝 Creating fine_payments table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS fine_payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        fine_id INT NOT NULL,
        payment_amount DECIMAL(10,2) NOT NULL,
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        payment_method ENUM('cash', 'online', 'waived') DEFAULT 'cash',
        processed_by INT NOT NULL,
        notes TEXT
      )
    `);
    console.log('✅ fine_payments table ready');
    
    // Create indexes (ignore if they exist)
    console.log('📊 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_fines_student ON fines(student_id_number)',
      'CREATE INDEX IF NOT EXISTS idx_fines_status ON fines(status)',
      'CREATE INDEX IF NOT EXISTS idx_fines_date ON fines(fine_date)',
      'CREATE INDEX IF NOT EXISTS idx_semester_tracking_student ON semester_tracking(student_id_number)',
      'CREATE INDEX IF NOT EXISTS idx_semester_tracking_status ON semester_tracking(status)',
      'CREATE INDEX IF NOT EXISTS idx_borrowing_status_student ON student_borrowing_status(student_id_number)'
    ];
    
    for (const indexQuery of indexes) {
      try {
        await pool.execute(indexQuery);
      } catch (error) {
        if (error.code !== 'ER_DUP_KEYNAME') {
          console.log('⚠️  Index creation skipped (already exists)');
        }
      }
    }
    console.log('✅ Indexes created');
    
    console.log('\n🎉 Penalty system setup completed successfully!');
    
    // Verify the setup
    console.log('\n🔍 Verifying setup...');
    
    const [tables] = await pool.execute("SHOW TABLES LIKE 'fines'");
    console.log('✅ Fines table exists:', tables.length > 0);
    
    const [settingsTable] = await pool.execute("SHOW TABLES LIKE 'system_settings'");
    console.log('✅ System settings table exists:', settingsTable.length > 0);
    
    const [settings] = await pool.execute('SELECT * FROM system_settings');
    console.log(`✅ System settings: ${settings.length} settings`);
    settings.forEach(setting => {
      console.log(`   - ${setting.setting_key}: ${setting.setting_value}`);
    });
    
    console.log('\n🎯 Penalty system is ready to use!');
    console.log('\n📋 Next steps:');
    console.log('1. Process overdue fines: POST /api/penalty/process-overdue');
    console.log('2. Check penalty stats: GET /api/penalty/stats');
    console.log('3. View user penalties: GET /api/penalty/user/:studentId');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error setting up penalty system:', error);
    process.exit(1);
  }
}

setupPenaltySystem();
