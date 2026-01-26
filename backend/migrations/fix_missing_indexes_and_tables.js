/**
 * Fix Missing Indexes and Tables for Foreign Keys
 * Run this before run_foreign_keys.js
 *
 * Usage: node migrations/fix_missing_indexes_and_tables.js
 */

const mysql = require('mysql2/promise');
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

async function runFixes() {
    let connection;

    try {
        console.log('========================================');
        console.log('  Fix Missing Indexes & Tables');
        console.log('========================================\n');

        console.log('[1/4] Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('      Connected!\n');

        // Step 2: Add index on users.id_number (required for FK references)
        console.log('[2/4] Adding required indexes...\n');

        const indexes = [
            { table: 'users', column: 'id_number', name: 'idx_users_id_number' },
            { table: 'borrowing_transactions', column: 'student_id_number', name: 'idx_bt_student_id' },
            { table: 'borrowing_transactions', column: 'borrowed_by_admin', name: 'idx_bt_borrowed_admin' },
            { table: 'fines', column: 'student_id_number', name: 'idx_fines_student_id' },
            { table: 'overdue_history', column: 'student_id_number', name: 'idx_oh_student_id' },
            { table: 'overdue_history', column: 'returned_by_admin', name: 'idx_oh_returned_admin' },
            { table: 'return_transactions', column: 'student_id_number', name: 'idx_rt_student_id' },
            { table: 'return_transactions', column: 'returned_by_admin', name: 'idx_rt_returned_admin' },
            { table: 'student_borrowing_status', column: 'student_id_number', name: 'idx_sbs_student_id' },
            { table: 'student_borrowing_status', column: 'updated_by', name: 'idx_sbs_updated_by' },
            { table: 'semester_tracking', column: 'student_id_number', name: 'idx_st_student_id' },
            { table: 'fine_payments', column: 'processed_by', name: 'idx_fp_processed_by' },
            { table: 'audit_logs', column: 'user_id', name: 'idx_al_user_id' },
            { table: 'system_settings', column: 'updated_by', name: 'idx_ss_updated_by' }
        ];

        for (const idx of indexes) {
            try {
                // Check if column exists first
                const [cols] = await connection.query(`
                    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = ? AND COLUMN_NAME = ?
                `, [idx.table, idx.column]);

                if (cols.length === 0) {
                    console.log(`      Skip: ${idx.table}.${idx.column} (column doesn't exist)`);
                    continue;
                }

                // Check if index already exists
                const [existing] = await connection.query(`
                    SHOW INDEX FROM ${idx.table} WHERE Column_name = ?
                `, [idx.column]);

                if (existing.length > 0) {
                    console.log(`      OK: ${idx.table}.${idx.column} (index exists)`);
                } else {
                    await connection.query(`CREATE INDEX ${idx.name} ON ${idx.table}(${idx.column})`);
                    console.log(`      Added: ${idx.name} on ${idx.table}.${idx.column}`);
                }
            } catch (err) {
                console.log(`      Error: ${idx.table}.${idx.column} - ${err.message.substring(0, 50)}`);
            }
        }

        // Step 3: Create missing tables
        console.log('\n[3/4] Creating missing tables...\n');

        const createTables = [
            {
                name: 'student_year_history',
                sql: `CREATE TABLE IF NOT EXISTS student_year_history (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    user_id INT NOT NULL,
                    academic_year_id INT NOT NULL,
                    year_level INT NOT NULL,
                    status ENUM('enrolled', 'graduated', 'dropped', 'on_leave') DEFAULT 'enrolled',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_user_year (user_id, academic_year_id),
                    UNIQUE KEY unique_user_year (user_id, academic_year_id)
                ) ENGINE=InnoDB`
            },
            {
                name: 'semester_clearances',
                sql: `CREATE TABLE IF NOT EXISTS semester_clearances (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    user_id INT NOT NULL,
                    semester_id INT NOT NULL,
                    books_borrowed INT DEFAULT 0,
                    books_required INT DEFAULT 20,
                    total_fines DECIMAL(10,2) DEFAULT 0.00,
                    fines_paid DECIMAL(10,2) DEFAULT 0.00,
                    is_cleared BOOLEAN DEFAULT FALSE,
                    cleared_date DATE,
                    cleared_by INT,
                    remarks TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_user_semester (user_id, semester_id),
                    INDEX idx_is_cleared (is_cleared),
                    UNIQUE KEY unique_user_semester (user_id, semester_id)
                ) ENGINE=InnoDB`
            },
            {
                name: 'semester_fine_payments',
                sql: `CREATE TABLE IF NOT EXISTS semester_fine_payments (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    user_id INT NOT NULL,
                    borrowing_id INT,
                    semester_id INT,
                    amount DECIMAL(10,2) NOT NULL,
                    payment_date DATE NOT NULL,
                    payment_method ENUM('cash', 'gcash', 'bank_transfer', 'other') DEFAULT 'cash',
                    reference_number VARCHAR(100),
                    received_by INT,
                    remarks TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_user_id (user_id),
                    INDEX idx_semester (semester_id),
                    INDEX idx_payment_date (payment_date)
                ) ENGINE=InnoDB`
            },
            {
                name: 'notification_preferences',
                sql: `CREATE TABLE IF NOT EXISTS notification_preferences (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    notifications_enabled BOOLEAN DEFAULT TRUE,
                    push_enabled BOOLEAN DEFAULT TRUE,
                    email_enabled BOOLEAN DEFAULT TRUE,
                    days_before_due INT DEFAULT 3,
                    notify_overdue BOOLEAN DEFAULT TRUE,
                    notify_due_today BOOLEAN DEFAULT TRUE,
                    notify_due_soon BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_user_prefs (user_id)
                ) ENGINE=InnoDB`
            },
            {
                name: 'notification_logs',
                sql: `CREATE TABLE IF NOT EXISTS notification_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    transaction_id INT NOT NULL,
                    notification_type ENUM('due_soon', 'due_today', 'overdue') NOT NULL,
                    sent_via ENUM('push', 'email', 'both', 'in_app') NOT NULL,
                    book_title VARCHAR(255),
                    days_until_due INT,
                    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    sent_date DATE GENERATED ALWAYS AS (DATE(sent_at)) STORED,
                    INDEX idx_notif_log_user (user_id, sent_at),
                    INDEX idx_notif_log_type (notification_type, sent_at),
                    UNIQUE KEY unique_daily_notification (user_id, transaction_id, notification_type, sent_date)
                ) ENGINE=InnoDB`
            }
        ];

        for (const table of createTables) {
            try {
                await connection.query(table.sql);
                console.log(`      Created: ${table.name}`);
            } catch (err) {
                if (err.code === 'ER_TABLE_EXISTS_ERROR') {
                    console.log(`      OK: ${table.name} (already exists)`);
                } else {
                    console.log(`      Error: ${table.name} - ${err.message.substring(0, 50)}`);
                }
            }
        }

        // Step 4: Add missing columns
        console.log('\n[4/4] Adding missing columns...\n');

        const columns = [
            { table: 'borrowing_transactions', column: 'borrowed_by_admin', type: 'INT NULL' },
            { table: 'fine_payments', column: 'processed_by', type: 'INT NULL' },
            { table: 'overdue_history', column: 'returned_by_admin', type: 'INT NULL' },
            { table: 'return_transactions', column: 'returned_by_admin', type: 'INT NULL' },
            { table: 'student_borrowing_status', column: 'updated_by', type: 'INT NULL' },
            { table: 'system_settings', column: 'updated_by', type: 'INT NULL' },
            { table: 'audit_logs', column: 'user_id', type: 'INT NULL' }
        ];

        for (const col of columns) {
            try {
                // Check if column exists
                const [existing] = await connection.query(`
                    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = ? AND COLUMN_NAME = ?
                `, [col.table, col.column]);

                if (existing.length > 0) {
                    console.log(`      OK: ${col.table}.${col.column} (exists)`);
                } else {
                    await connection.query(`ALTER TABLE ${col.table} ADD COLUMN ${col.column} ${col.type}`);
                    console.log(`      Added: ${col.table}.${col.column}`);
                }
            } catch (err) {
                console.log(`      Error: ${col.table}.${col.column} - ${err.message.substring(0, 50)}`);
            }
        }

        console.log('\n========================================');
        console.log('  Fixes Complete!');
        console.log('========================================');
        console.log('  Now run: node migrations/run_foreign_keys.js');
        console.log('========================================\n');

    } catch (error) {
        console.error('\n[ERROR]:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

runFixes();
