/**
 * Aggressive cleanup script for duplicate fines
 * This will delete ALL duplicate fines and keep only one per transaction
 * Run this when the system has massive duplicates (100k+)
 */

const pool = require('../config/database');
const { logger } = require('../config/logger');

async function aggressiveCleanupDuplicates() {
    console.log('Starting aggressive duplicate fines cleanup...');

    try {
        const connection = await pool.getConnection();

        try {
            // Step 1: Count duplicates
            const [countResult] = await connection.execute(`
                SELECT COUNT(*) as total_duplicates
                FROM fines f1
                WHERE EXISTS (
                    SELECT 1 FROM fines f2
                    WHERE f2.transaction_id = f1.transaction_id
                    AND f2.id < f1.id
                )
            `);

            console.log(`Found ${countResult[0].total_duplicates} duplicate fine records to delete`);

            if (countResult[0].total_duplicates === 0) {
                console.log('No duplicates found. Exiting.');
                return;
            }

            // Step 2: Delete all duplicates in batches, keeping only the FIRST (MIN id) for each transaction
            console.log('Deleting duplicates in batches...');

            let totalDeleted = 0;
            let batchCount = 0;

            while (true) {
                await connection.beginTransaction();

                // Delete duplicates in batches of 10000
                const [deleteResult] = await connection.execute(`
                    DELETE FROM fines
                    WHERE id IN (
                        SELECT id FROM (
                            SELECT f1.id
                            FROM fines f1
                            WHERE EXISTS (
                                SELECT 1 FROM fines f2
                                WHERE f2.transaction_id = f1.transaction_id
                                AND f2.id < f1.id
                            )
                            LIMIT 10000
                        ) AS temp
                    )
                `);

                await connection.commit();

                const deleted = deleteResult.affectedRows;
                totalDeleted += deleted;
                batchCount++;

                console.log(`Batch ${batchCount}: Deleted ${deleted} duplicates (Total: ${totalDeleted})`);

                if (deleted === 0) {
                    break; // No more duplicates
                }

                // Small delay to prevent overwhelming the database
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            console.log(`\n✅ Cleanup completed! Deleted ${totalDeleted} duplicate fines`);

            // Step 3: Verify cleanup
            const [verifyResult] = await connection.execute(`
                SELECT transaction_id, COUNT(*) as count
                FROM fines
                GROUP BY transaction_id
                HAVING COUNT(*) > 1
                LIMIT 10
            `);

            if (verifyResult.length > 0) {
                console.log(`⚠️  Warning: Still found ${verifyResult.length} transactions with duplicates`);
                console.log('Sample:', verifyResult);
            } else {
                console.log('✅ Verification passed: No duplicates found');
            }

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error during aggressive cleanup:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run the cleanup
aggressiveCleanupDuplicates()
    .then(() => {
        console.log('\n✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
