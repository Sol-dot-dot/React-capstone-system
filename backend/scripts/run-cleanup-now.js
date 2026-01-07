/**
 * Quick cleanup script for duplicate fines
 * Run this to remove all duplicate fines immediately
 */

const pool = require('../config/database');
const { logger } = require('../config/logger');

async function runCleanup() {
    console.log('🧹 Starting duplicate fines cleanup...\n');

    let connection;
    try {
        connection = await pool.getConnection();

        // Step 1: Count total fines before
        const [beforeCount] = await connection.execute('SELECT COUNT(*) as total FROM fines');
        console.log(`📊 Total fines before cleanup: ${beforeCount[0].total}`);

        // Step 2: Count duplicates
        const [duplicateCount] = await connection.execute(`
            SELECT COUNT(*) as duplicates
            FROM fines f1
            WHERE EXISTS (
                SELECT 1 FROM fines f2
                WHERE f2.transaction_id = f1.transaction_id
                AND f2.id < f1.id
            )
        `);
        console.log(`🔍 Found ${duplicateCount[0].duplicates} duplicate fines to remove\n`);

        if (duplicateCount[0].duplicates === 0) {
            console.log('✅ No duplicates found! Database is clean.');
            return;
        }

        console.log('🗑️  Starting deletion in batches...\n');

        // Step 3: Delete duplicates in batches
        let totalDeleted = 0;
        let batchNum = 0;

        while (true) {
            // Delete in smaller batches to avoid locks
            const [result] = await connection.execute(`
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
                        LIMIT 5000
                    ) AS temp
                )
            `);

            const deleted = result.affectedRows;
            if (deleted === 0) break;

            totalDeleted += deleted;
            batchNum++;
            console.log(`   Batch ${batchNum}: Deleted ${deleted.toLocaleString()} duplicates (Total: ${totalDeleted.toLocaleString()})`);

            // Small delay between batches
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        console.log(`\n✅ Cleanup complete! Deleted ${totalDeleted.toLocaleString()} duplicate fines\n`);

        // Step 4: Verify cleanup
        const [afterCount] = await connection.execute('SELECT COUNT(*) as total FROM fines');
        console.log(`📊 Total fines after cleanup: ${afterCount[0].total}`);

        // Check for any remaining duplicates
        const [remainingDuplicates] = await connection.execute(`
            SELECT COUNT(*) as count
            FROM (
                SELECT transaction_id
                FROM fines
                GROUP BY transaction_id
                HAVING COUNT(*) > 1
            ) AS dups
        `);

        if (remainingDuplicates[0].count > 0) {
            console.log(`⚠️  Warning: ${remainingDuplicates[0].count} transactions still have duplicates`);
            console.log('   Run the script again to clean them.');
        } else {
            console.log('✅ Verification passed: No duplicates remaining!\n');
        }

        // Step 5: Show sample of cleaned data
        const [sampleStudent] = await connection.execute(`
            SELECT u.id_number, u.email,
                   COUNT(DISTINCT f.id) as total_fines,
                   COUNT(DISTINCT CASE WHEN f.status = 'unpaid' THEN f.id END) as unpaid_fines,
                   COALESCE(SUM(DISTINCT CASE WHEN f.status = 'unpaid' THEN f.fine_amount ELSE 0 END), 0) as unpaid_amount
            FROM users u
            LEFT JOIN fines f ON u.id_number = f.student_id_number
            WHERE u.id_number = 'C22-0044'
            GROUP BY u.id_number, u.email
        `);

        if (sampleStudent.length > 0) {
            const student = sampleStudent[0];
            console.log('📋 Sample check for C22-0044:');
            console.log(`   - Total fines: ${student.total_fines}`);
            console.log(`   - Unpaid fines: ${student.unpaid_fines}`);
            console.log(`   - Unpaid amount: ₱${student.unpaid_amount}\n`);
        }

    } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
        throw error;
    } finally {
        if (connection) connection.release();
        await pool.end();
    }
}

// Run the cleanup
runCleanup()
    .then(() => {
        console.log('🎉 Script completed successfully!\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error.message);
        process.exit(1);
    });
