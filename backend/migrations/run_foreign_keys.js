/**
 * Migration Runner: Add Foreign Key Relationships
 * Run this script to add all foreign key constraints to the database
 *
 * Usage: node migrations/run_foreign_keys.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config.env') });

const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'capstone_system_optimized',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
};

async function runMigration() {
    let connection;

    try {
        console.log('========================================');
        console.log('  Foreign Key Migration Runner');
        console.log('========================================\n');

        console.log('[1/5] Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('      Connected to:', dbConfig.database, '\n');

        // Step 2: Check for orphan records
        console.log('[2/5] Checking for orphan records...\n');

        const orphanChecks = [
            {
                name: 'borrowing_transactions with invalid student',
                query: `SELECT COUNT(*) as count FROM borrowing_transactions bt
                        WHERE student_id_number IS NOT NULL
                        AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id_number = bt.student_id_number)`
            },
            {
                name: 'borrowing_transactions with invalid book',
                query: `SELECT COUNT(*) as count FROM borrowing_transactions bt
                        WHERE book_id IS NOT NULL
                        AND NOT EXISTS (SELECT 1 FROM books b WHERE b.id = bt.book_id)`
            },
            {
                name: 'fines with invalid student',
                query: `SELECT COUNT(*) as count FROM fines f
                        WHERE student_id_number IS NOT NULL
                        AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id_number = f.student_id_number)`
            },
            {
                name: 'fines with invalid transaction',
                query: `SELECT COUNT(*) as count FROM fines f
                        WHERE transaction_id IS NOT NULL
                        AND NOT EXISTS (SELECT 1 FROM borrowing_transactions bt WHERE bt.id = f.transaction_id)`
            }
        ];

        let hasOrphans = false;
        for (const check of orphanChecks) {
            try {
                const [rows] = await connection.query(check.query);
                const count = rows[0].count;
                if (count > 0) {
                    console.log(`      WARNING: ${count} orphan records in ${check.name}`);
                    hasOrphans = true;
                } else {
                    console.log(`      OK: ${check.name}`);
                }
            } catch (err) {
                console.log(`      SKIP: ${check.name} (table may not exist)`);
            }
        }

        if (hasOrphans) {
            console.log('\n      Cleaning orphan records...');
            await cleanOrphanRecords(connection);
            console.log('      Orphan records cleaned.\n');
        } else {
            console.log('\n      No orphan records found.\n');
        }

        // Step 3: Convert tables to InnoDB
        console.log('[3/5] Converting tables to InnoDB engine...\n');

        const tables = [
            'users', 'books', 'borrowing_transactions', 'fines', 'fine_payments',
            'academic_years', 'semesters', 'student_year_history', 'semester_clearances',
            'semester_fine_payments', 'notification_preferences', 'notification_logs',
            'overdue_history', 'return_transactions', 'login_logs', 'audit_logs',
            'student_borrowing_status', 'system_settings', 'semester_tracking'
        ];

        for (const table of tables) {
            try {
                await connection.query(`ALTER TABLE ${table} ENGINE = InnoDB`);
                console.log(`      Converted: ${table}`);
            } catch (err) {
                console.log(`      Skip: ${table} (${err.message.split('\n')[0]})`);
            }
        }

        // Step 4: Add foreign key constraints
        console.log('\n[4/5] Adding foreign key constraints...\n');

        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        const foreignKeys = [
            // borrowing_transactions
            { table: 'borrowing_transactions', name: 'fk_bt_student', column: 'student_id_number', refTable: 'users', refColumn: 'id_number', onDelete: 'CASCADE' },
            { table: 'borrowing_transactions', name: 'fk_bt_book', column: 'book_id', refTable: 'books', refColumn: 'id', onDelete: 'RESTRICT' },
            { table: 'borrowing_transactions', name: 'fk_bt_borrowed_admin', column: 'borrowed_by_admin', refTable: 'users', refColumn: 'id', onDelete: 'SET NULL' },
            { table: 'borrowing_transactions', name: 'fk_bt_returned_admin', column: 'returned_by_admin', refTable: 'users', refColumn: 'id', onDelete: 'SET NULL' },
            { table: 'borrowing_transactions', name: 'fk_bt_semester', column: 'semester_id', refTable: 'semesters', refColumn: 'id', onDelete: 'SET NULL' },
            { table: 'borrowing_transactions', name: 'fk_bt_academic_year', column: 'academic_year_id', refTable: 'academic_years', refColumn: 'id', onDelete: 'SET NULL' },

            // fines
            { table: 'fines', name: 'fk_fines_student', column: 'student_id_number', refTable: 'users', refColumn: 'id_number', onDelete: 'CASCADE' },
            { table: 'fines', name: 'fk_fines_transaction', column: 'transaction_id', refTable: 'borrowing_transactions', refColumn: 'id', onDelete: 'CASCADE' },

            // fine_payments
            { table: 'fine_payments', name: 'fk_fp_fine', column: 'fine_id', refTable: 'fines', refColumn: 'id', onDelete: 'CASCADE' },
            { table: 'fine_payments', name: 'fk_fp_processed_by', column: 'processed_by', refTable: 'users', refColumn: 'id', onDelete: 'SET NULL' },

            // semesters
            { table: 'semesters', name: 'fk_sem_academic_year', column: 'academic_year_id', refTable: 'academic_years', refColumn: 'id', onDelete: 'CASCADE' },

            // student_year_history
            { table: 'student_year_history', name: 'fk_syh_user', column: 'user_id', refTable: 'users', refColumn: 'id', onDelete: 'CASCADE' },
            { table: 'student_year_history', name: 'fk_syh_academic_year', column: 'academic_year_id', refTable: 'academic_years', refColumn: 'id', onDelete: 'CASCADE' },

            // semester_clearances
            { table: 'semester_clearances', name: 'fk_sc_user', column: 'user_id', refTable: 'users', refColumn: 'id', onDelete: 'CASCADE' },
            { table: 'semester_clearances', name: 'fk_sc_semester', column: 'semester_id', refTable: 'semesters', refColumn: 'id', onDelete: 'CASCADE' },
            { table: 'semester_clearances', name: 'fk_sc_cleared_by', column: 'cleared_by', refTable: 'users', refColumn: 'id', onDelete: 'SET NULL' },

            // semester_fine_payments
            { table: 'semester_fine_payments', name: 'fk_sfp_user', column: 'user_id', refTable: 'users', refColumn: 'id', onDelete: 'CASCADE' },
            { table: 'semester_fine_payments', name: 'fk_sfp_borrowing', column: 'borrowing_id', refTable: 'borrowing_transactions', refColumn: 'id', onDelete: 'SET NULL' },
            { table: 'semester_fine_payments', name: 'fk_sfp_semester', column: 'semester_id', refTable: 'semesters', refColumn: 'id', onDelete: 'SET NULL' },
            { table: 'semester_fine_payments', name: 'fk_sfp_received_by', column: 'received_by', refTable: 'users', refColumn: 'id', onDelete: 'SET NULL' },

            // notification_preferences
            { table: 'notification_preferences', name: 'fk_np_user', column: 'user_id', refTable: 'users', refColumn: 'id', onDelete: 'CASCADE' },

            // notification_logs
            { table: 'notification_logs', name: 'fk_nl_user', column: 'user_id', refTable: 'users', refColumn: 'id', onDelete: 'CASCADE' },
            { table: 'notification_logs', name: 'fk_nl_transaction', column: 'transaction_id', refTable: 'borrowing_transactions', refColumn: 'id', onDelete: 'CASCADE' },

            // overdue_history
            { table: 'overdue_history', name: 'fk_oh_student', column: 'student_id_number', refTable: 'users', refColumn: 'id_number', onDelete: 'CASCADE' },
            { table: 'overdue_history', name: 'fk_oh_transaction', column: 'transaction_id', refTable: 'borrowing_transactions', refColumn: 'id', onDelete: 'CASCADE' },
            { table: 'overdue_history', name: 'fk_oh_returned_admin', column: 'returned_by_admin', refTable: 'users', refColumn: 'id', onDelete: 'SET NULL' },

            // return_transactions
            { table: 'return_transactions', name: 'fk_rt_transaction', column: 'transaction_id', refTable: 'borrowing_transactions', refColumn: 'id', onDelete: 'CASCADE' },
            { table: 'return_transactions', name: 'fk_rt_student', column: 'student_id_number', refTable: 'users', refColumn: 'id_number', onDelete: 'CASCADE' },
            { table: 'return_transactions', name: 'fk_rt_book', column: 'book_id', refTable: 'books', refColumn: 'id', onDelete: 'RESTRICT' },
            { table: 'return_transactions', name: 'fk_rt_admin', column: 'returned_by_admin', refTable: 'users', refColumn: 'id', onDelete: 'SET NULL' },

            // login_logs
            { table: 'login_logs', name: 'fk_ll_user', column: 'user_id', refTable: 'users', refColumn: 'id', onDelete: 'CASCADE' },

            // audit_logs
            { table: 'audit_logs', name: 'fk_al_user', column: 'user_id', refTable: 'users', refColumn: 'id', onDelete: 'SET NULL' },

            // student_borrowing_status
            { table: 'student_borrowing_status', name: 'fk_sbs_student', column: 'student_id_number', refTable: 'users', refColumn: 'id_number', onDelete: 'CASCADE' },
            { table: 'student_borrowing_status', name: 'fk_sbs_updated_by', column: 'updated_by', refTable: 'users', refColumn: 'id', onDelete: 'SET NULL' },

            // system_settings
            { table: 'system_settings', name: 'fk_ss_updated_by', column: 'updated_by', refTable: 'users', refColumn: 'id', onDelete: 'SET NULL' },

            // semester_tracking
            { table: 'semester_tracking', name: 'fk_st_student', column: 'student_id_number', refTable: 'users', refColumn: 'id_number', onDelete: 'CASCADE' }
        ];

        let successCount = 0;
        let skipCount = 0;

        for (const fk of foreignKeys) {
            try {
                // First try to drop existing constraint
                try {
                    await connection.query(`ALTER TABLE ${fk.table} DROP FOREIGN KEY ${fk.name}`);
                } catch (e) {
                    // Constraint doesn't exist, that's fine
                }

                // Add the foreign key
                const sql = `ALTER TABLE ${fk.table}
                    ADD CONSTRAINT ${fk.name}
                    FOREIGN KEY (${fk.column}) REFERENCES ${fk.refTable}(${fk.refColumn})
                    ON DELETE ${fk.onDelete} ON UPDATE CASCADE`;

                await connection.query(sql);
                console.log(`      Added: ${fk.table}.${fk.column} -> ${fk.refTable}.${fk.refColumn}`);
                successCount++;
            } catch (err) {
                console.log(`      Skip: ${fk.name} - ${err.message.split('\n')[0].substring(0, 60)}`);
                skipCount++;
            }
        }

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        // Step 5: Verify relationships
        console.log('\n[5/5] Verifying relationships...\n');

        const [relationships] = await connection.query(`
            SELECT
                TABLE_NAME,
                COLUMN_NAME,
                CONSTRAINT_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
            AND REFERENCED_TABLE_NAME IS NOT NULL
            ORDER BY TABLE_NAME, COLUMN_NAME
        `);

        console.log(`      Total foreign keys created: ${relationships.length}\n`);

        console.log('========================================');
        console.log('  Migration Complete!');
        console.log('========================================');
        console.log(`  - Foreign keys added: ${successCount}`);
        console.log(`  - Skipped (table/column not found): ${skipCount}`);
        console.log(`  - Total relationships: ${relationships.length}`);
        console.log('\n  Open phpMyAdmin -> Designer view to see');
        console.log('  all relationships visually.');
        console.log('========================================\n');

    } catch (error) {
        console.error('\n[ERROR] Migration failed:', error.message);
        console.error('\nStack trace:', error.stack);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function cleanOrphanRecords(connection) {
    const cleanupQueries = [
        // Clean notification_logs first (depends on borrowing_transactions)
        `DELETE FROM notification_logs WHERE transaction_id NOT IN (SELECT id FROM borrowing_transactions)`,
        `DELETE FROM notification_logs WHERE user_id NOT IN (SELECT id FROM users)`,

        // Clean fines
        `DELETE FROM fines WHERE transaction_id IS NOT NULL AND transaction_id NOT IN (SELECT id FROM borrowing_transactions)`,
        `DELETE FROM fines WHERE student_id_number NOT IN (SELECT id_number FROM users)`,

        // Clean overdue_history
        `DELETE FROM overdue_history WHERE transaction_id NOT IN (SELECT id FROM borrowing_transactions)`,
        `DELETE FROM overdue_history WHERE student_id_number NOT IN (SELECT id_number FROM users)`,

        // Clean return_transactions
        `DELETE FROM return_transactions WHERE transaction_id NOT IN (SELECT id FROM borrowing_transactions)`,
        `DELETE FROM return_transactions WHERE student_id_number NOT IN (SELECT id_number FROM users)`,

        // Clean borrowing_transactions
        `DELETE FROM borrowing_transactions WHERE student_id_number NOT IN (SELECT id_number FROM users)`,
        `DELETE FROM borrowing_transactions WHERE book_id NOT IN (SELECT id FROM books)`
    ];

    for (const query of cleanupQueries) {
        try {
            const [result] = await connection.query(query);
            if (result.affectedRows > 0) {
                console.log(`      Cleaned ${result.affectedRows} orphan records`);
            }
        } catch (err) {
            // Table might not exist, ignore
        }
    }
}

// Run the migration
runMigration();
