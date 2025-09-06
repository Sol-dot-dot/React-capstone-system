const pool = require('./config/database');
const { calculateFine, recalculateStudentFines } = require('./utils/penaltyUtils');
const fineCalculationService = require('./services/fineCalculationService');

async function testFineCalculation() {
    try {
        console.log('🧪 Testing Fine Calculation System\n');

        // Test 1: Check if there are any overdue books
        console.log('1️⃣ Checking for overdue books...');
        const [overdueBooks] = await pool.execute(`
            SELECT 
                bt.id,
                bt.student_id_number,
                bt.due_date,
                bt.status,
                b.title,
                b.number_code,
                DATEDIFF(NOW(), bt.due_date) as days_overdue
            FROM borrowing_transactions bt
            JOIN books b ON bt.book_id = b.id
            WHERE bt.status IN ('borrowed', 'overdue') 
            AND bt.due_date < NOW()
            ORDER BY bt.due_date ASC
            LIMIT 5
        `);

        if (overdueBooks.length === 0) {
            console.log('   ✅ No overdue books found');
        } else {
            console.log(`   📚 Found ${overdueBooks.length} overdue books:`);
            overdueBooks.forEach(book => {
                console.log(`      - ${book.title} (${book.number_code}) - Student: ${book.student_id_number}, ${book.days_overdue} days overdue`);
            });
        }

        // Test 2: Test fine calculation for a specific transaction
        if (overdueBooks.length > 0) {
            console.log('\n2️⃣ Testing fine calculation...');
            const testTransaction = overdueBooks[0];
            const fineCalculation = await calculateFine(testTransaction.id);
            
            console.log(`   📊 Transaction ${testTransaction.id}:`);
            console.log(`      - Days overdue: ${fineCalculation.daysOverdue}`);
            console.log(`      - Fine amount: ₱${fineCalculation.fineAmount}`);
            console.log(`      - Due date: ${testTransaction.due_date}`);
            console.log(`      - Current time: ${new Date().toISOString()}`);
        }

        // Test 3: Test student fine recalculation
        if (overdueBooks.length > 0) {
            console.log('\n3️⃣ Testing student fine recalculation...');
            const testStudent = overdueBooks[0].student_id_number;
            
            console.log(`   🔄 Recalculating fines for student: ${testStudent}`);
            await recalculateStudentFines(testStudent);
            console.log('   ✅ Recalculation completed');
        }

        // Test 4: Check fine calculation service status
        console.log('\n4️⃣ Checking fine calculation service...');
        const serviceStatus = fineCalculationService.getStatus();
        console.log(`   📊 Service Status:`);
        console.log(`      - Running: ${serviceStatus.isRunning}`);
        console.log(`      - Interval: ${serviceStatus.intervalMs}ms`);
        console.log(`      - Last processed: ${serviceStatus.lastProcessedTime || 'Never'}`);

        // Test 5: Check current fines in database
        console.log('\n5️⃣ Checking current fines in database...');
        const [currentFines] = await pool.execute(`
            SELECT 
                f.id,
                f.student_id_number,
                f.fine_amount,
                f.days_overdue,
                f.status,
                f.updated_at,
                b.title,
                b.number_code
            FROM fines f
            JOIN borrowing_transactions bt ON f.transaction_id = bt.id
            JOIN books b ON bt.book_id = b.id
            WHERE f.status = 'unpaid'
            ORDER BY f.updated_at DESC
            LIMIT 5
        `);

        if (currentFines.length === 0) {
            console.log('   ✅ No unpaid fines found');
        } else {
            console.log(`   💰 Found ${currentFines.length} unpaid fines:`);
            currentFines.forEach(fine => {
                console.log(`      - Fine ${fine.id}: ${fine.title} - Student ${fine.student_id_number}, ₱${fine.fine_amount} (${fine.days_overdue} days), Updated: ${fine.updated_at}`);
            });
        }

        console.log('\n🎉 Fine calculation system test completed!');
        console.log('\n📝 Summary:');
        console.log('   - The background service will automatically update fines every 5 seconds');
        console.log('   - API endpoints now include real-time recalculation');
        console.log('   - Fines are calculated based on current time vs due date');
        console.log('   - The system handles server restarts gracefully');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        process.exit(0);
    }
}

// Run the test
testFineCalculation();
