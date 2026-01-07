const { processAllOverdueFines, calculateFine } = require('../utils/penaltyUtils');
const pool = require('../config/database');

const { logger } = require('../config/logger');
class FineCalculationService {
    constructor() {
        this.isRunning = false;
        this.intervalId = null;
        this.intervalMs = 60000; // 60 seconds (1 minute) - reduced frequency
        this.lastProcessedTime = null;
        this.isProcessing = false; // Prevent concurrent processing
        this.batchSize = 100; // Process 100 transactions at a time
    }

    /**
     * Start the background fine calculation service
     */
    start() {
        if (this.isRunning) {
            logger.info('[WARN] Fine calculation service is already running');
            return;
        }

        logger.info('[INFO] Starting fine calculation service...');
        this.isRunning = true;
        this.lastProcessedTime = new Date();

        // Run immediately on start (with error handling)
        this.processFines().catch(error => {
            logger.error('[ERROR] Error in initial fine processing:', error);
        });

        // Set up interval
        this.intervalId = setInterval(() => {
            this.processFines().catch(error => {
                logger.error('[ERROR] Error in scheduled fine processing:', error);
            });
        }, this.intervalMs);

        logger.info(`[OK] Fine calculation service started (checking every ${this.intervalMs / 1000} seconds)`);
    }

    /**
     * Stop the background fine calculation service
     */
    stop() {
        if (!this.isRunning) {
            logger.info('[WARN] Fine calculation service is not running');
            return;
        }

        logger.info('[INFO] Stopping fine calculation service...');
        this.isRunning = false;

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        logger.info('[OK] Fine calculation service stopped');
    }

    /**
     * Populate overdue history for existing overdue books
     */
    async populateOverdueHistory() {
        try {
            // DISABLED: This function was causing memory issues with hundreds of thousands of records
            // Skip this for now to reduce load - can be run manually if needed
            // If you need to populate overdue history, create a separate migration script
            return;
        } catch (error) {
            logger.error('[ERROR] Error populating overdue history:', error);
        }
    }

    /**
     * Process fines for all overdue books
     */
    async processFines() {
        // Prevent concurrent processing
        if (this.isProcessing) {
            logger.info('[WARN] Fine calculation already in progress, skipping...');
            return;
        }

        try {
            this.isProcessing = true;
            const startTime = new Date();

            // First, populate overdue history for existing overdue books (with limit)
            await this.populateOverdueHistory();

            // Get overdue transactions that need fine updates (BATCH PROCESSING)
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
                ORDER BY bt.due_date ASC
                LIMIT ?
            `, [this.batchSize]);

            if (overdueTransactions.length === 0) {
                // No overdue books, just update last processed time
                this.lastProcessedTime = startTime;
                return;
            }

            logger.info(`[INFO] Processing ${overdueTransactions.length} overdue transactions (batch processing)...`);

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
                    logger.error(`[ERROR] Error processing transaction ${transaction.id}:`, error.message);
                    errorCount++;
                }
            }

            this.lastProcessedTime = startTime;

            if (updatedCount > 0 || errorCount > 0) {
                logger.info(`[INFO] Fine calculation completed: ${updatedCount} updated, ${errorCount} errors`);
            }

        } catch (error) {
            logger.error('[ERROR] Error in fine calculation service:', error);
        } finally {
            this.isProcessing = false;
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
        logger.info('[INFO] Force processing fines...');
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
