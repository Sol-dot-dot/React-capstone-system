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
     * Process fines for all overdue books
     */
    async processFines() {
        try {
            const startTime = new Date();
            
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
