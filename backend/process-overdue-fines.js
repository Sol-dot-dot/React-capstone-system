const pool = require('./config/database');
const { processAllOverdueFines } = require('./utils/penaltyUtils');

async function processOverdueFines() {
  try {
    console.log('🚀 Processing Overdue Fines...\n');
    
    // First, let's check what overdue books we have
    const [overdue] = await pool.execute(`
      SELECT 
        bt.id,
        bt.student_id_number,
        bt.due_date,
        bt.borrowed_at,
        bt.status,
        b.title,
        b.number_code,
        DATEDIFF(NOW(), bt.due_date) as days_overdue
      FROM borrowing_transactions bt
      JOIN books b ON bt.book_id = b.id
      WHERE bt.status = 'borrowed' AND bt.due_date < NOW()
    `);
    
    console.log(`📚 Found ${overdue.length} overdue books:`);
    overdue.forEach(book => {
      console.log(`  - ${book.title} (${book.number_code}) - Student: ${book.student_id_number}, ${book.days_overdue} days overdue`);
    });
    
    if (overdue.length === 0) {
      console.log('✅ No overdue books found. All books are returned on time!');
      return;
    }
    
    console.log('\n💰 Processing fines for overdue books...');
    
    // Process all overdue fines
    const results = await processAllOverdueFines();
    
    console.log(`\n📊 Processing Results:`);
    results.forEach((result, index) => {
      if (result.error) {
        console.log(`  ❌ Transaction ${result.transactionId}: ${result.error}`);
      } else if (result.created) {
        console.log(`  ✅ Transaction ${result.transactionId}: Fine created - ₱${result.fineAmount} (${result.daysOverdue} days)`);
      } else {
        console.log(`  ⚠️  Transaction ${result.transactionId}: ${result.message}`);
      }
    });
    
    // Check the created fines
    const [fines] = await pool.execute(`
      SELECT 
        f.id,
        f.student_id_number,
        f.fine_amount,
        f.days_overdue,
        f.status,
        f.fine_date,
        b.title,
        b.number_code
      FROM fines f
      JOIN borrowing_transactions bt ON f.transaction_id = bt.id
      JOIN books b ON bt.book_id = b.id
      ORDER BY f.fine_date DESC
    `);
    
    console.log(`\n💸 Total fines created: ${fines.length}`);
    fines.forEach(fine => {
      console.log(`  - Fine ${fine.id}: ${fine.title} - Student ${fine.student_id_number}, ₱${fine.fine_amount} (${fine.days_overdue} days), Status: ${fine.status}`);
    });
    
    // Calculate total unpaid amount
    const unpaidFines = fines.filter(f => f.status === 'unpaid');
    const totalUnpaid = unpaidFines.reduce((sum, fine) => sum + parseFloat(fine.fine_amount), 0);
    
    console.log(`\n📈 Summary:`);
    console.log(`  - Total fines: ${fines.length}`);
    console.log(`  - Unpaid fines: ${unpaidFines.length}`);
    console.log(`  - Total unpaid amount: ₱${totalUnpaid.toFixed(2)}`);
    
    console.log('\n🎉 Overdue fines processing completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error processing overdue fines:', error);
    process.exit(1);
  }
}

processOverdueFines();
