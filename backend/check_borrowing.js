const db = require('./config/database');

async function checkBorrowing() {
    try {
        console.log('🔍 Checking borrowing system state...\n');
        
        // Check borrowing transactions
        const [transactions] = await db.execute('SELECT * FROM borrowing_transactions');
        console.log('📚 Borrowing transactions:', transactions.length);
        if (transactions.length > 0) {
            console.log('Transaction details:', JSON.stringify(transactions, null, 2));
        }
        
        // Check borrowed books
        const [borrowedBooks] = await db.execute('SELECT number_code, title, status FROM books WHERE status = ?', ['borrowed']);
        console.log('\n📖 Books with "borrowed" status:', borrowedBooks.length);
        if (borrowedBooks.length > 0) {
            console.log('Borrowed books:', JSON.stringify(borrowedBooks, null, 2));
        }
        
        // Check available books
        const [availableBooks] = await db.execute('SELECT number_code, title, status FROM books WHERE status = ?', ['available']);
        console.log('\n✅ Available books:', availableBooks.length);
        
        console.log('\n🎯 Summary:');
        console.log(`- Total transactions: ${transactions.length}`);
        console.log(`- Borrowed books: ${borrowedBooks.length}`);
        console.log(`- Available books: ${availableBooks.length}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit();
    }
}

checkBorrowing();
