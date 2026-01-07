/**
 * Ultra-fast cleanup - deletes duplicates without counting first
 */

const pool = require('../config/database');

async function ultraFastCleanup() {
    console.log('⚡ ULTRA-FAST duplicate cleanup starting...\n');

    let connection;
    try {
        connection = await pool.getConnection();

        console.log('🗑️  Deleting duplicates (keeping MIN id per transaction)...\n');

        let totalDeleted = 0;
        let batchNum = 0;

        // Delete in batches until no more duplicates
        while (true) {
            const startTime = Date.now();

            const [result] = await connection.execute(`
                DELETE FROM fines
                WHERE id IN (
                    SELECT id FROM (
                        SELECT f1.id
                        FROM fines f1
                        INNER JOIN fines f2
                          ON f1.transaction_id = f2.transaction_id
                          AND f1.id > f2.id
                        LIMIT 10000
                    ) AS temp
                )
            `);

            const deleted = result.affectedRows;
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);

            if (deleted === 0) {
                console.log('\n✅ No more duplicates found!');
                break;
            }

            totalDeleted += deleted;
            batchNum++;
            console.log(`   Batch ${batchNum}: ${deleted.toLocaleString()} deleted in ${duration}s (Total: ${totalDeleted.toLocaleString()})`);

            // Very small delay
            await new Promise(resolve => setTimeout(resolve, 10));

            // Safety limit
            if (batchNum > 200) {
                console.log('\n⚠️  Reached safety limit of 200 batches (2M deletes). Run again if needed.');
                break;
            }
        }

        console.log(`\n🎉 Deleted ${totalDeleted.toLocaleString()} duplicate fines!\n`);

        // Quick verification for C22-0044
        const [student] = await connection.execute(`
            SELECT
                COUNT(*) as total_fines,
                SUM(CASE WHEN status = 'unpaid' THEN fine_amount ELSE 0 END) as unpaid_amount
            FROM fines
            WHERE student_id_number = 'C22-0044'
        `);

        if (student.length > 0) {
            console.log('📋 Student C22-0044 after cleanup:');
            console.log(`   Fines: ${student[0].total_fines}`);
            console.log(`   Unpaid: ₱${student[0].unpaid_amount}\n`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        if (connection) connection.release();
        await pool.end();
    }
}

ultraFastCleanup()
    .then(() => {
        console.log('✅ Done!\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    });
