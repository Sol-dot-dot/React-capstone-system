/**
 * Fix Admin References for Foreign Keys
 * Cleans up invalid admin user references and adds remaining FKs
 *
 * Usage: node migrations/fix_admin_references.js
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

async function fixAdminReferences() {
    let connection;

    try {
        console.log('========================================');
        console.log('  Fix Admin References');
        console.log('========================================\n');

        connection = await mysql.createConnection(dbConfig);
        console.log('[1/3] Connected to database\n');

        // Step 2: Find and fix invalid admin references
        console.log('[2/3] Fixing invalid admin references...\n');

        const fixQueries = [
            {
                desc: 'borrowing_transactions.borrowed_by_admin',
                check: `SELECT COUNT(*) as count FROM borrowing_transactions
                        WHERE borrowed_by_admin IS NOT NULL
                        AND borrowed_by_admin NOT IN (SELECT id FROM users)`,
                fix: `UPDATE borrowing_transactions SET borrowed_by_admin = NULL
                      WHERE borrowed_by_admin IS NOT NULL
                      AND borrowed_by_admin NOT IN (SELECT id FROM users)`
            },
            {
                desc: 'fine_payments.processed_by',
                check: `SELECT COUNT(*) as count FROM fine_payments
                        WHERE processed_by IS NOT NULL
                        AND processed_by NOT IN (SELECT id FROM users)`,
                fix: `UPDATE fine_payments SET processed_by = NULL
                      WHERE processed_by IS NOT NULL
                      AND processed_by NOT IN (SELECT id FROM users)`
            },
            {
                desc: 'overdue_history.returned_by_admin',
                check: `SELECT COUNT(*) as count FROM overdue_history
                        WHERE returned_by_admin IS NOT NULL
                        AND returned_by_admin NOT IN (SELECT id FROM users)`,
                fix: `UPDATE overdue_history SET returned_by_admin = NULL
                      WHERE returned_by_admin IS NOT NULL
                      AND returned_by_admin NOT IN (SELECT id FROM users)`
            },
            {
                desc: 'return_transactions.returned_by_admin',
                check: `SELECT COUNT(*) as count FROM return_transactions
                        WHERE returned_by_admin IS NOT NULL
                        AND returned_by_admin NOT IN (SELECT id FROM users)`,
                fix: `UPDATE return_transactions SET returned_by_admin = NULL
                      WHERE returned_by_admin IS NOT NULL
                      AND returned_by_admin NOT IN (SELECT id FROM users)`
            },
            {
                desc: 'audit_logs.user_id',
                check: `SELECT COUNT(*) as count FROM audit_logs
                        WHERE user_id IS NOT NULL
                        AND user_id NOT IN (SELECT id FROM users)`,
                fix: `UPDATE audit_logs SET user_id = NULL
                      WHERE user_id IS NOT NULL
                      AND user_id NOT IN (SELECT id FROM users)`
            },
            {
                desc: 'student_borrowing_status.updated_by',
                check: `SELECT COUNT(*) as count FROM student_borrowing_status
                        WHERE updated_by IS NOT NULL
                        AND updated_by NOT IN (SELECT id FROM users)`,
                fix: `UPDATE student_borrowing_status SET updated_by = NULL
                      WHERE updated_by IS NOT NULL
                      AND updated_by NOT IN (SELECT id FROM users)`
            },
            {
                desc: 'system_settings.updated_by',
                check: `SELECT COUNT(*) as count FROM system_settings
                        WHERE updated_by IS NOT NULL
                        AND updated_by NOT IN (SELECT id FROM users)`,
                fix: `UPDATE system_settings SET updated_by = NULL
                      WHERE updated_by IS NOT NULL
                      AND updated_by NOT IN (SELECT id FROM users)`
            }
        ];

        for (const q of fixQueries) {
            try {
                const [checkResult] = await connection.query(q.check);
                const count = checkResult[0].count;

                if (count > 0) {
                    const [fixResult] = await connection.query(q.fix);
                    console.log(`      Fixed: ${q.desc} (${fixResult.affectedRows} rows updated)`);
                } else {
                    console.log(`      OK: ${q.desc} (no invalid refs)`);
                }
            } catch (err) {
                console.log(`      Skip: ${q.desc} - ${err.message.substring(0, 50)}`);
            }
        }

        // Step 3: Add remaining foreign keys
        console.log('\n[3/3] Adding remaining foreign keys...\n');

        const remainingFKs = [
            { table: 'borrowing_transactions', name: 'fk_bt_borrowed_admin', column: 'borrowed_by_admin', refTable: 'users', refColumn: 'id', onDelete: 'SET NULL' },
            { table: 'fine_payments', name: 'fk_fp_processed_by', column: 'processed_by', refTable: 'users', refColumn: 'id', onDelete: 'SET NULL' },
            { table: 'overdue_history', name: 'fk_oh_returned_admin', column: 'returned_by_admin', refTable: 'users', refColumn: 'id', onDelete: 'SET NULL' },
            { table: 'return_transactions', name: 'fk_rt_admin', column: 'returned_by_admin', refTable: 'users', refColumn: 'id', onDelete: 'SET NULL' },
            { table: 'audit_logs', name: 'fk_al_user', column: 'user_id', refTable: 'users', refColumn: 'id', onDelete: 'SET NULL' },
            { table: 'student_borrowing_status', name: 'fk_sbs_updated_by', column: 'updated_by', refTable: 'users', refColumn: 'id', onDelete: 'SET NULL' },
            { table: 'system_settings', name: 'fk_ss_updated_by', column: 'updated_by', refTable: 'users', refColumn: 'id', onDelete: 'SET NULL' }
        ];

        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        let successCount = 0;
        for (const fk of remainingFKs) {
            try {
                // Drop existing if any
                try {
                    await connection.query(`ALTER TABLE ${fk.table} DROP FOREIGN KEY ${fk.name}`);
                } catch (e) {}

                // Add the FK
                await connection.query(`
                    ALTER TABLE ${fk.table}
                    ADD CONSTRAINT ${fk.name}
                    FOREIGN KEY (${fk.column}) REFERENCES ${fk.refTable}(${fk.refColumn})
                    ON DELETE ${fk.onDelete} ON UPDATE CASCADE
                `);
                console.log(`      Added: ${fk.table}.${fk.column} -> ${fk.refTable}.${fk.refColumn}`);
                successCount++;
            } catch (err) {
                console.log(`      Failed: ${fk.name} - ${err.message.substring(0, 60)}`);
            }
        }

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        // Verify total
        const [total] = await connection.query(`
            SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `);

        console.log('\n========================================');
        console.log('  Complete!');
        console.log('========================================');
        console.log(`  - Added: ${successCount} foreign keys`);
        console.log(`  - Total relationships: ${total[0].count}`);
        console.log('\n  Open phpMyAdmin -> Designer to verify!');
        console.log('========================================\n');

    } catch (error) {
        console.error('[ERROR]:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

fixAdminReferences();
