const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupAnalytics() {
  let connection;
  
  try {
    console.log('Setting up analytics database tables...\n');
    
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'capstone_system'
    });

    console.log('✅ Connected to database');

    // Read and execute the SQL file
    const sqlFile = path.join(__dirname, 'create-analytics-tables.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Split SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_KEYNAME') {
            console.log(`⚠️  Statement ${i + 1} skipped (already exists)`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
          }
        }
      }
    }

    console.log('\n🎉 Analytics database setup completed!');
    console.log('\nCreated/Updated tables:');
    console.log('- activity_logs (for tracking user actions)');
    console.log('- search_logs (for search analytics)');
    console.log('- book_ratings (for book ratings)');
    console.log('- user_sessions (for user engagement)');
    console.log('- system_metrics (for system performance)');
    console.log('\nSample data has been inserted for testing.');

  } catch (error) {
    console.error('❌ Error setting up analytics:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

// Run the setup
setupAnalytics();
