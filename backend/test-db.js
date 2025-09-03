const db = require('./config/database');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const [result] = await db.execute('SELECT 1 as test');
    console.log('✅ Database connection successful');
    
    // Check if books table exists
    const [tables] = await db.execute('SHOW TABLES');
    console.log('📚 Available tables:', tables.map(t => Object.values(t)[0]));
    
    // Check books table structure
    const [columns] = await db.execute('DESCRIBE books');
    console.log('📖 Books table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    
    // Check if books table has data
    const [books] = await db.execute('SELECT COUNT(*) as count FROM books');
    console.log(`📊 Total books in database: ${books[0].count}`);
    
    // Show sample book data
    const [sampleBooks] = await db.execute('SELECT * FROM books LIMIT 3');
    console.log('📚 Sample books:');
    sampleBooks.forEach(book => {
      console.log(`  - ${book.title} by ${book.author}`);
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    process.exit(0);
  }
}

testDatabase();
