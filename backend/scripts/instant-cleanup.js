/**
 * INSTANT cleanup using temp table approach
 * This is the fastest method for massive duplicates
 */

const pool = require('../config/database');

async function instantCleanup() {
    console.log('⚡⚡⚡ INSTANT cleanup starting...\n');

    let connection;
    try {
        connection = await pool.getConnection();

        // Step 1: Create temp table with IDs to KEEP
        console.log('1️⃣  Creating temp table with IDs to keep...');
        await connection.execute('DROP TEMPORARY TABLE IF EXISTS fines_to_keep');
        await connection.execute(`
            CREATE TEMPORARY TABLE fines_to_keep AS
            SELECT MIN(id) as keep_id
            FROM fines
            GROUP BY transaction_id
        `);
        const [keepCount] = await connection.execute('SELECT COUNT(*) as count FROM fines_to_keep');
        console.log(`   ✅ ${keepCount[0].count.toLocaleString()} fines will be kept\n`);

        // Step 2: Count total before
        const [beforeCount] = await connection.execute('SELECT COUNT(*) as count FROM fines');
        console.log(`2️⃣  Total fines before: ${beforeCount[0].count.toLocaleString()}`);
        const toDelete = beforeCount[0].count - keepCount[0].count;
        console.log(`   📊 Will delete: ${toDelete.toLocaleString()} duplicates\n`);

        // Step 3: Delete everything NOT in keep list
        console.log('3️⃣  Deleting duplicates...');
        const startTime = Date.now();

        const [deleteResult] = await connection.execute(`
            DELETE FROM fines
            WHERE id NOT IN (SELECT keep_id FROM fines_to_keep)
        `);

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`   ✅ Deleted ${deleteResult.affectedRows.toLocaleString()} fines in ${duration}s!\n`);

        // Step 4: Verify
        const [afterCount] = await connection.execute('SELECT COUNT(*) as count FROM fines');
        console.log(`4️⃣  Total fines after: ${afterCount[0].count.toLocaleString()}\n`);

        // Check for remaining duplicates
        const [dupCheck] = await connection.execute(`
            SELECT COUNT(*) as count
            FROM (
                SELECT transaction_id
                FROM fines
                GROUP BY transaction_id
                HAVING COUNT(*) > 1
                LIMIT 1
            ) AS dups
        `);

        if (dupCheck[0].count === 0) {
            console.log('✅ NO DUPLICATES REMAINING!\n');
        } else {
            console.log('⚠️  Some duplicates may remain - run script again\n');
        }

        // Step 5: Check C22-0044
        const [student] = await connection.execute(`
            SELECT
                COUNT(*) as total_fines,
                SUM(CASE WHEN status = 'unpaid' THEN fine_amount ELSE 0 END) as unpaid_amount
            FROM fines
            WHERE student_id_number = 'C22-0044'
        `);

        if (student.length > 0) {
            console.log('📋 Student C22-0044 status:');
            console.log(`   Total fines: ${student[0].total_fines}`);
            console.log(`   Unpaid amount: ₱${student[0].unpaid_amount || 0}\n`);
        }

        // Cleanup temp table
        await connection.execute('DROP TEMPORARY TABLE IF EXISTS fines_to_keep');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.code === 'ER_LOCK_WAIT_TIMEOUT') {
            console.log('\n💡 Try stopping the backend server first, then run this script again');
        }
        throw error;
    } finally {
        if (connection) connection.release();
        await pool.end();
    }
}

instantCleanup()
    .then(() => {
        console.log('🎉 CLEANUP COMPLETE!\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed');
        process.exit(1);
    });
