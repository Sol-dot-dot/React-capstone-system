const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function checkBooksData() {
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

    // Check if books table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'books'");
    console.log('Books table exists:', tables.length > 0);

    if (tables.length > 0) {
      // Check books table structure
      const [columns] = await connection.execute("DESCRIBE books");
      console.log('\n📋 Books table structure:');
      console.table(columns);

      // Check total books count
      const [countResult] = await connection.execute("SELECT COUNT(*) as total FROM books");
      console.log('\n📊 Total books in database:', countResult[0].total);

      // Check books by status
      const [statusCount] = await connection.execute(`
        SELECT status, COUNT(*) as count 
        FROM books 
        GROUP BY status
      `);
      console.log('\n📊 Books by status:');
      console.table(statusCount);

      // Show sample books
      const [sampleBooks] = await connection.execute(`
        SELECT id, title, author, status, genre, created_at 
        FROM books 
        LIMIT 5
      `);
      console.log('\n📚 Sample books:');
      console.table(sampleBooks);

      // Check if there are any books at all
      if (countResult[0].total === 0) {
        console.log('\n⚠️ No books found in database. Creating sample books...');
        
        // Insert some sample books
        const sampleBooksData = [
          ['The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'Fiction', 'available', 1],
          ['To Kill a Mockingbird', 'Harper Lee', '9780061120084', 'Fiction', 'available', 1],
          ['1984', 'George Orwell', '9780451524935', 'Fiction', 'available', 1],
          ['Pride and Prejudice', 'Jane Austen', '9780141439518', 'Fiction', 'available', 1],
          ['The Hobbit', 'J.R.R. Tolkien', '9780547928227', 'Fantasy', 'available', 1],
          ['Harry Potter and the Philosopher\'s Stone', 'J.K. Rowling', '9780747532699', 'Fantasy', 'available', 1],
          ['The Catcher in the Rye', 'J.D. Salinger', '9780316769174', 'Fiction', 'available', 1],
          ['Lord of the Flies', 'William Golding', '9780571056866', 'Fiction', 'available', 1],
          ['Animal Farm', 'George Orwell', '9780451526342', 'Fiction', 'available', 1],
          ['Brave New World', 'Aldous Huxley', '9780060850524', 'Fiction', 'available', 1]
        ];

        for (const book of sampleBooksData) {
          await connection.execute(`
            INSERT INTO books (title, author, isbn, genre, status, added_by, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())
          `, book);
        }

        console.log('✅ Sample books created successfully!');
      }
    } else {
      console.log('❌ Books table does not exist!');
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

checkBooksData();
