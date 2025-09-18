const { processAllOverdueFines, calculateFine } = require('../utils/penaltyUtils');
const pool = require('../config/database');

class FineCalculationService {
    constructor() {
        this.isRunning = false;
        this.intervalId = null;
        this.intervalMs = 5000; // 5 seconds
        this.lastProcessedTime = null;
    }

    /**
     * Start the background fine calculation service
     */
    start() {
        if (this.isRunning) {
            console.log('⚠️  Fine calculation service is already running');
            return;
        }

        console.log('🚀 Starting fine calculation service...');
        this.isRunning = true;
        this.lastProcessedTime = new Date();

        // Run immediately on start
        this.processFines();

        // Set up interval
        this.intervalId = setInterval(() => {
            this.processFines();
        }, this.intervalMs);

        console.log(`✅ Fine calculation service started (checking every ${this.intervalMs / 1000} seconds)`);
    }

    /**
     * Stop the background fine calculation service
     */
    stop() {
        if (!this.isRunning) {
            console.log('⚠️  Fine calculation service is not running');
            return;
        }

        console.log('🛑 Stopping fine calculation service...');
        this.isRunning = false;

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        console.log('✅ Fine calculation service stopped');
    }

    /**
     * Populate overdue history for existing overdue books
     */
    async populateOverdueHistory() {
        try {
            console.log('🔄 Populating overdue history for existing overdue books...');
            
            const [overdueTransactions] = await pool.execute(`
                SELECT 
                    bt.id as transaction_id,
                    bt.student_id_number,
                    bt.borrowed_date,
                    bt.due_date,
                    bt.status,
                    b.title as book_title,
                    b.author as book_author,
                    b.number_code as book_code,
                    f.fine_amount,
                    f.paid_amount,
                    DATEDIFF(CURDATE(), bt.due_date) as days_overdue
                FROM borrowing_transactions bt
                JOIN books b ON bt.book_id = b.id
                LEFT JOIN fines f ON bt.id = f.transaction_id
                WHERE bt.status = 'overdue' 
                AND bt.due_date < CURDATE()
                AND NOT EXISTS (
                    SELECT 1 FROM overdue_history oh 
                    WHERE oh.transaction_id = bt.id
                )
                ORDER BY bt.due_date ASC
            `);

            if (overdueTransactions.length === 0) {
                console.log('✅ No overdue transactions need history records');
                return;
            }

            console.log(`📝 Creating overdue history for ${overdueTransactions.length} transactions`);

            for (const transaction of overdueTransactions) {
                await pool.execute(`
                    INSERT INTO overdue_history 
                    (student_id_number, transaction_id, book_title, book_author, book_code,
                     borrowed_at, due_date, returned_at, days_overdue, fine_amount, paid_amount,
                     returned_by_admin, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, NOW())
                `, [
                    transaction.student_id_number,
                    transaction.transaction_id,
                    transaction.book_title,
                    transaction.book_author,
                    transaction.book_code,
                    transaction.borrowed_date,
                    transaction.due_date,
                    transaction.days_overdue,
                    transaction.fine_amount || 0,
                    transaction.paid_amount || 0,
                    1 // Default admin ID
                ]);
            }

            console.log(`✅ Successfully created ${overdueTransactions.length} overdue history records`);

        } catch (error) {
            console.error('❌ Error populating overdue history:', error);
        }
    }

    /**
     * Process fines for all overdue books
     */
    async processFines() {
        try {
            const startTime = new Date();
            
            // First, populate overdue history for existing overdue books
            await this.populateOverdueHistory();
            
            // Get all overdue transactions that need fine updates
            const [overdueTransactions] = await pool.execute(`
                SELECT 
                    bt.id,
                    bt.student_id_number,
                    bt.due_date,
                    bt.status,
                    f.id as fine_id,
                    f.fine_amount as current_fine_amount,
                    f.days_overdue as current_days_overdue,
                    f.updated_at as last_updated
                FROM borrowing_transactions bt
                LEFT JOIN fines f ON bt.id = f.transaction_id
                WHERE bt.status IN ('borrowed', 'overdue') 
                AND bt.due_date < NOW()
                AND (f.id IS NULL OR f.status = 'unpaid')
            `);

            if (overdueTransactions.length === 0) {
                // No overdue books, just update last processed time
                this.lastProcessedTime = startTime;
                return;
            }

            console.log(`🔄 Processing ${overdueTransactions.length} overdue transactions...`);

            let updatedCount = 0;
            let errorCount = 0;

            for (const transaction of overdueTransactions) {
                try {
                    // Calculate current fine amount
                    const fineCalculation = await calculateFine(transaction.id);
                    
                    if (fineCalculation.fineAmount > 0) {
                        // Check if fine needs updating
                        const needsUpdate = !transaction.fine_id || 
                                          transaction.current_fine_amount !== fineCalculation.fineAmount ||
                                          transaction.current_days_overdue !== fineCalculation.daysOverdue;

                        if (needsUpdate) {
                            if (transaction.fine_id) {
                                // Update existing fine
                                await pool.execute(`
                                    UPDATE fines 
                                    SET fine_amount = ?, 
                                        days_overdue = ?, 
                                        updated_at = CURRENT_TIMESTAMP
                                    WHERE id = ?
                                `, [fineCalculation.fineAmount, fineCalculation.daysOverdue, transaction.fine_id]);
                            } else {
                                // Create new fine
                                await pool.execute(`
                                    INSERT INTO fines 
                                    (student_id_number, transaction_id, fine_amount, days_overdue, fine_date, status) 
                                    VALUES (?, ?, ?, ?, CURDATE(), 'unpaid')
                                `, [
                                    transaction.student_id_number,
                                    transaction.id,
                                    fineCalculation.fineAmount,
                                    fineCalculation.daysOverdue
                                ]);
                            }

                            // Update transaction status to overdue if still borrowed
                            if (transaction.status === 'borrowed') {
                                await pool.execute(`
                                    UPDATE borrowing_transactions 
                                    SET status = 'overdue' 
                                    WHERE id = ?
                                `, [transaction.id]);
                            }

                            updatedCount++;
                        }
                    }
                } catch (error) {
                    console.error(`❌ Error processing transaction ${transaction.id}:`, error.message);
                    errorCount++;
                }
            }

            this.lastProcessedTime = startTime;

            if (updatedCount > 0 || errorCount > 0) {
                console.log(`📊 Fine calculation completed: ${updatedCount} updated, ${errorCount} errors`);
            }

        } catch (error) {
            console.error('❌ Error in fine calculation service:', error);
        }
    }

    /**
     * Get service status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            intervalMs: this.intervalMs,
            lastProcessedTime: this.lastProcessedTime,
            uptime: this.isRunning ? Date.now() - (this.lastProcessedTime?.getTime() || Date.now()) : 0
        };
    }

    /**
     * Force immediate processing of fines
     */
    async forceProcess() {
        console.log('🔄 Force processing fines...');
        await this.processFines();
    }

    /**
     * Update the interval time
     */
    setInterval(intervalMs) {
        if (intervalMs < 1000) {
            throw new Error('Interval must be at least 1000ms (1 second)');
        }

        this.intervalMs = intervalMs;

        if (this.isRunning) {
            // Restart with new interval
            this.stop();
            this.start();
        }
    }
}

// Create singleton instance
const fineCalculationService = new FineCalculationService();

module.exports = fineCalculationService;
