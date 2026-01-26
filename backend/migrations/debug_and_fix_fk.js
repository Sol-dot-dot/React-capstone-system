/**
 * Debug and Fix Foreign Key Issues
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config.env') });

const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'capstone_system_optimized',
    port: process.env.DB_PORT || 3306
};

async function debugAndFix() {
    let connection;

    try {
        console.log('========================================');
        console.log('  Debug & Fix Foreign Key Issues');
        console.log('========================================\n');

        connection = await mysql.createConnection(dbConfig);

        // Check column data types
        console.log('[1/4] Checking column data types...\n');

        const [usersIdCol] = await connection.query(`
            SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'id'
        `);
        console.log('      users.id:', usersIdCol[0]);

        const columnsToCheck = [
            { table: 'borrowing_transactions', column: 'borrowed_by_admin' },
            { table: 'fine_payments', column: 'processed_by' },
            { table: 'overdue_history', column: 'returned_by_admin' },
            { table: 'return_transactions', column: 'returned_by_admin' },
            { table: 'audit_logs', column: 'user_id' },
            { table: 'student_borrowing_status', column: 'updated_by' },
            { table: 'system_settings', column: 'updated_by' }
        ];

        for (const col of columnsToCheck) {
            const [info] = await connection.query(`
                SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
            `, [col.table, col.column]);

            if (info.length > 0) {
                console.log(`      ${col.table}.${col.column}:`, info[0].COLUMN_TYPE, info[0].IS_NULLABLE);
            }
        }

        // Check for problematic values (0, negative, or non-existent IDs)
        console.log('\n[2/4] Checking for problematic values...\n');

        for (const col of columnsToCheck) {
            try {
                // Check for 0 values
                const [zeros] = await connection.query(`
                    SELECT COUNT(*) as count FROM ${col.table} WHERE ${col.column} = 0
                `);

                // Check for values not in users table
                const [invalid] = await connection.query(`
                    SELECT COUNT(*) as count FROM ${col.table}
                    WHERE ${col.column} IS NOT NULL
                    AND ${col.column} != 0
                    AND ${col.column} NOT IN (SELECT id FROM users)
                `);

                console.log(`      ${col.table}.${col.column}: zeros=${zeros[0].count}, invalid=${invalid[0].count}`);

                // Fix zeros by setting to NULL
                if (zeros[0].count > 0) {
                    await connection.query(`UPDATE ${col.table} SET ${col.column} = NULL WHERE ${col.column} = 0`);
                    console.log(`        -> Fixed ${zeros[0].count} zero values`);
                }

                // Fix invalid IDs by setting to NULL
                if (invalid[0].count > 0) {
                    await connection.query(`
                        UPDATE ${col.table} SET ${col.column} = NULL
                        WHERE ${col.column} IS NOT NULL
                        AND ${col.column} != 0
                        AND ${col.column} NOT IN (SELECT id FROM users)
                    `);
                    console.log(`        -> Fixed ${invalid[0].count} invalid refs`);
                }
            } catch (err) {
                console.log(`      ${col.table}.${col.column}: Error - ${err.message.substring(0, 40)}`);
            }
        }

        // Modify columns to match users.id type if needed
        console.log('\n[3/4] Ensuring column type compatibility...\n');

        for (const col of columnsToCheck) {
            try {
                await connection.query(`
                    ALTER TABLE ${col.table}
                    MODIFY COLUMN ${col.column} INT NULL
                `);
                console.log(`      Modified: ${col.table}.${col.column} -> INT NULL`);
            } catch (err) {
                console.log(`      Skip: ${col.table}.${col.column} - ${err.message.substring(0, 40)}`);
            }
        }

        // Now try to add the foreign keys
        console.log('\n[4/4] Adding foreign keys...\n');

        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        const fks = [
            { table: 'borrowing_transactions', name: 'fk_bt_borrowed_admin', column: 'borrowed_by_admin' },
            { table: 'fine_payments', name: 'fk_fp_processed_by', column: 'processed_by' },
            { table: 'overdue_history', name: 'fk_oh_returned_admin', column: 'returned_by_admin' },
            { table: 'return_transactions', name: 'fk_rt_admin', column: 'returned_by_admin' },
            { table: 'audit_logs', name: 'fk_al_user', column: 'user_id' },
            { table: 'student_borrowing_status', name: 'fk_sbs_updated_by', column: 'updated_by' },
            { table: 'system_settings', name: 'fk_ss_updated_by', column: 'updated_by' }
        ];

        let success = 0;
        for (const fk of fks) {
            try {
                // Drop if exists
                try {
                    await connection.query(`ALTER TABLE ${fk.table} DROP FOREIGN KEY ${fk.name}`);
                } catch (e) {}

                // Make sure there's an index on the column
                try {
                    await connection.query(`CREATE INDEX idx_${fk.column}_${fk.table.substring(0, 5)} ON ${fk.table}(${fk.column})`);
                } catch (e) {}

                // Add FK
                await connection.query(`
                    ALTER TABLE ${fk.table}
                    ADD CONSTRAINT ${fk.name}
                    FOREIGN KEY (${fk.column}) REFERENCES users(id)
                    ON DELETE SET NULL ON UPDATE CASCADE
                `);
                console.log(`      Added: ${fk.name}`);
                success++;
            } catch (err) {
                console.log(`      Failed: ${fk.name}`);
                console.log(`        Reason: ${err.message}`);
            }
        }

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        // Final count
        const [total] = await connection.query(`
            SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `);

        console.log('\n========================================');
        console.log(`  Added: ${success}/7`);
        console.log(`  Total FK relationships: ${total[0].count}`);
        console.log('========================================\n');

    } catch (error) {
        console.error('[ERROR]:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

debugAndFix();
