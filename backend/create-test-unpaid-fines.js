const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function createTestUnpaidFines() {
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

    // First, let's check current fines status
    console.log('\n📊 Current fines status:');
    const [currentFines] = await connection.execute(`
      SELECT student_id_number, COUNT(*) as total_fines, 
             SUM(CASE WHEN status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_fines,
             SUM(amount) as total_amount,
             SUM(CASE WHEN status = 'unpaid' THEN amount ELSE 0 END) as unpaid_amount
      FROM fines 
      GROUP BY student_id_number
    `);

    console.table(currentFines);

    // Create some unpaid fines for testing
    console.log('\n🔧 Creating test unpaid fines...');

    // Get some borrowing transactions that are overdue
    const [overdueTransactions] = await connection.execute(`
      SELECT bt.id, bt.student_id_number, bt.book_id, bt.due_date, b.title
      FROM borrowing_transactions bt
      JOIN books b ON bt.book_id = b.id
      WHERE bt.status = 'overdue' 
      AND bt.student_id_number IN ('C22-0045', 'C22-0044')
      LIMIT 3
    `);

    console.log('📚 Found overdue transactions:', overdueTransactions);

    if (overdueTransactions.length === 0) {
      console.log('⚠️ No overdue transactions found. Creating some...');
      
      // Create some overdue borrowing transactions first
      const [books] = await connection.execute(`
        SELECT id, title FROM books WHERE status = 'available' LIMIT 3
      `);

      if (books.length > 0) {
        for (let i = 0; i < Math.min(books.length, 2); i++) {
          const book = books[i];
          const studentId = i === 0 ? 'C22-0045' : 'C22-0044';
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() - 5); // 5 days ago

          await connection.execute(`
            INSERT INTO borrowing_transactions 
            (student_id_number, book_id, borrowed_at, due_date, status, borrowed_by_admin)
            VALUES (?, ?, NOW(), ?, 'overdue', 'admin')
          `, [studentId, book.id, dueDate]);

          // Update book status to borrowed
          await connection.execute(`
            UPDATE books SET status = 'borrowed' WHERE id = ?
          `, [book.id]);

          console.log(`✅ Created overdue transaction for ${studentId} - ${book.title}`);
        }
      }
    }

    // Now create unpaid fines for these transactions
    const [newOverdueTransactions] = await connection.execute(`
      SELECT bt.id, bt.student_id_number, bt.book_id, bt.due_date, b.title
      FROM borrowing_transactions bt
      JOIN books b ON bt.book_id = b.id
      WHERE bt.status = 'overdue' 
      AND bt.student_id_number IN ('C22-0045', 'C22-0044')
      LIMIT 3
    `);

    for (const transaction of newOverdueTransactions) {
      // Calculate days overdue
      const dueDate = new Date(transaction.due_date);
      const today = new Date();
      const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
      const fineAmount = daysOverdue * 15; // ₱15 per day

      // Check if fine already exists
      const [existingFine] = await connection.execute(`
        SELECT id FROM fines 
        WHERE student_id_number = ? AND transaction_id = ? AND status = 'unpaid'
      `, [transaction.student_id_number, transaction.id]);

      if (existingFine.length === 0) {
        await connection.execute(`
          INSERT INTO fines 
          (student_id_number, transaction_id, book_id, amount, days_overdue, status, fine_date)
          VALUES (?, ?, ?, ?, ?, 'unpaid', NOW())
        `, [transaction.student_id_number, transaction.id, transaction.book_id, fineAmount, daysOverdue]);

        console.log(`✅ Created unpaid fine for ${transaction.student_id_number} - ${transaction.title} (₱${fineAmount}, ${daysOverdue} days overdue)`);
      } else {
        console.log(`⚠️ Fine already exists for ${transaction.student_id_number} - ${transaction.title}`);
      }
    }

    // Show updated fines status
    console.log('\n📊 Updated fines status:');
    const [updatedFines] = await connection.execute(`
      SELECT student_id_number, COUNT(*) as total_fines, 
             SUM(CASE WHEN status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_fines,
             SUM(amount) as total_amount,
             SUM(CASE WHEN status = 'unpaid' THEN amount ELSE 0 END) as unpaid_amount
      FROM fines 
      GROUP BY student_id_number
    `);

    console.table(updatedFines);

    console.log('\n✅ Test unpaid fines created successfully!');
    console.log('🎯 Now you should see "Paid" buttons in Penalty Management for students with unpaid fines.');

  } catch (error) {
    console.error('❌ Error creating test unpaid fines:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

createTestUnpaidFines();
