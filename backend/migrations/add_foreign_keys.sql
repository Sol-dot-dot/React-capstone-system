-- ================================================================
-- MIGRATION: Add Foreign Key Relationships
-- Date: 2026-01-07
-- Description: Adds all foreign key constraints to establish
--              proper relationships between tables
-- ================================================================

-- IMPORTANT: Run this script in phpMyAdmin by importing it
-- Make sure to back up your database first!

-- ================================================================
-- STEP 1: Convert all tables to InnoDB (required for foreign keys)
-- ================================================================

ALTER TABLE users ENGINE = InnoDB;
ALTER TABLE books ENGINE = InnoDB;
ALTER TABLE borrowing_transactions ENGINE = InnoDB;
ALTER TABLE fines ENGINE = InnoDB;
ALTER TABLE fine_payments ENGINE = InnoDB;
ALTER TABLE academic_years ENGINE = InnoDB;
ALTER TABLE semesters ENGINE = InnoDB;
ALTER TABLE student_year_history ENGINE = InnoDB;
ALTER TABLE semester_clearances ENGINE = InnoDB;
ALTER TABLE semester_fine_payments ENGINE = InnoDB;
ALTER TABLE notification_preferences ENGINE = InnoDB;
ALTER TABLE notification_logs ENGINE = InnoDB;
ALTER TABLE overdue_history ENGINE = InnoDB;
ALTER TABLE return_transactions ENGINE = InnoDB;
ALTER TABLE login_logs ENGINE = InnoDB;
ALTER TABLE audit_logs ENGINE = InnoDB;
ALTER TABLE student_borrowing_status ENGINE = InnoDB;
ALTER TABLE system_settings ENGINE = InnoDB;
ALTER TABLE semester_tracking ENGINE = InnoDB;

-- ================================================================
-- STEP 2: Drop existing foreign keys if any (to recreate cleanly)
-- ================================================================

-- Suppress errors for non-existing constraints
SET FOREIGN_KEY_CHECKS = 0;

-- borrowing_transactions
ALTER TABLE borrowing_transactions DROP FOREIGN KEY IF EXISTS fk_bt_student;
ALTER TABLE borrowing_transactions DROP FOREIGN KEY IF EXISTS fk_bt_book;
ALTER TABLE borrowing_transactions DROP FOREIGN KEY IF EXISTS fk_bt_borrowed_admin;
ALTER TABLE borrowing_transactions DROP FOREIGN KEY IF EXISTS fk_bt_returned_admin;
ALTER TABLE borrowing_transactions DROP FOREIGN KEY IF EXISTS fk_bt_semester;
ALTER TABLE borrowing_transactions DROP FOREIGN KEY IF EXISTS fk_bt_academic_year;

-- fines
ALTER TABLE fines DROP FOREIGN KEY IF EXISTS fk_fines_student;
ALTER TABLE fines DROP FOREIGN KEY IF EXISTS fk_fines_transaction;

-- fine_payments
ALTER TABLE fine_payments DROP FOREIGN KEY IF EXISTS fk_fp_fine;
ALTER TABLE fine_payments DROP FOREIGN KEY IF EXISTS fk_fp_processed_by;

-- semesters
ALTER TABLE semesters DROP FOREIGN KEY IF EXISTS fk_sem_academic_year;

-- student_year_history
ALTER TABLE student_year_history DROP FOREIGN KEY IF EXISTS fk_syh_user;
ALTER TABLE student_year_history DROP FOREIGN KEY IF EXISTS fk_syh_academic_year;

-- semester_clearances
ALTER TABLE semester_clearances DROP FOREIGN KEY IF EXISTS fk_sc_user;
ALTER TABLE semester_clearances DROP FOREIGN KEY IF EXISTS fk_sc_semester;
ALTER TABLE semester_clearances DROP FOREIGN KEY IF EXISTS fk_sc_cleared_by;

-- semester_fine_payments
ALTER TABLE semester_fine_payments DROP FOREIGN KEY IF EXISTS fk_sfp_user;
ALTER TABLE semester_fine_payments DROP FOREIGN KEY IF EXISTS fk_sfp_borrowing;
ALTER TABLE semester_fine_payments DROP FOREIGN KEY IF EXISTS fk_sfp_semester;
ALTER TABLE semester_fine_payments DROP FOREIGN KEY IF EXISTS fk_sfp_received_by;

-- notification_preferences
ALTER TABLE notification_preferences DROP FOREIGN KEY IF EXISTS fk_np_user;

-- notification_logs
ALTER TABLE notification_logs DROP FOREIGN KEY IF EXISTS fk_nl_user;
ALTER TABLE notification_logs DROP FOREIGN KEY IF EXISTS fk_nl_transaction;

-- overdue_history
ALTER TABLE overdue_history DROP FOREIGN KEY IF EXISTS fk_oh_student;
ALTER TABLE overdue_history DROP FOREIGN KEY IF EXISTS fk_oh_transaction;
ALTER TABLE overdue_history DROP FOREIGN KEY IF EXISTS fk_oh_returned_admin;

-- return_transactions
ALTER TABLE return_transactions DROP FOREIGN KEY IF EXISTS fk_rt_transaction;
ALTER TABLE return_transactions DROP FOREIGN KEY IF EXISTS fk_rt_student;
ALTER TABLE return_transactions DROP FOREIGN KEY IF EXISTS fk_rt_book;
ALTER TABLE return_transactions DROP FOREIGN KEY IF EXISTS fk_rt_admin;

-- login_logs
ALTER TABLE login_logs DROP FOREIGN KEY IF EXISTS fk_ll_user;

-- audit_logs
ALTER TABLE audit_logs DROP FOREIGN KEY IF EXISTS fk_al_user;

-- student_borrowing_status
ALTER TABLE student_borrowing_status DROP FOREIGN KEY IF EXISTS fk_sbs_student;
ALTER TABLE student_borrowing_status DROP FOREIGN KEY IF EXISTS fk_sbs_updated_by;

-- system_settings
ALTER TABLE system_settings DROP FOREIGN KEY IF EXISTS fk_ss_updated_by;

-- semester_tracking
ALTER TABLE semester_tracking DROP FOREIGN KEY IF EXISTS fk_st_student;

SET FOREIGN_KEY_CHECKS = 1;

-- ================================================================
-- STEP 3: Add all foreign key constraints
-- ================================================================

-- -------------------------------------------------
-- borrowing_transactions relationships
-- -------------------------------------------------

-- Link to users via student_id_number
ALTER TABLE borrowing_transactions
ADD CONSTRAINT fk_bt_student
FOREIGN KEY (student_id_number) REFERENCES users(id_number)
ON DELETE CASCADE ON UPDATE CASCADE;

-- Link to books
ALTER TABLE borrowing_transactions
ADD CONSTRAINT fk_bt_book
FOREIGN KEY (book_id) REFERENCES books(id)
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Link to admin who processed borrowing
ALTER TABLE borrowing_transactions
ADD CONSTRAINT fk_bt_borrowed_admin
FOREIGN KEY (borrowed_by_admin) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

-- Link to admin who processed return
ALTER TABLE borrowing_transactions
ADD CONSTRAINT fk_bt_returned_admin
FOREIGN KEY (returned_by_admin) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

-- Link to semester
ALTER TABLE borrowing_transactions
ADD CONSTRAINT fk_bt_semester
FOREIGN KEY (semester_id) REFERENCES semesters(id)
ON DELETE SET NULL ON UPDATE CASCADE;

-- Link to academic year
ALTER TABLE borrowing_transactions
ADD CONSTRAINT fk_bt_academic_year
FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
ON DELETE SET NULL ON UPDATE CASCADE;

-- -------------------------------------------------
-- fines relationships
-- -------------------------------------------------

-- Link to student
ALTER TABLE fines
ADD CONSTRAINT fk_fines_student
FOREIGN KEY (student_id_number) REFERENCES users(id_number)
ON DELETE CASCADE ON UPDATE CASCADE;

-- Link to borrowing transaction
ALTER TABLE fines
ADD CONSTRAINT fk_fines_transaction
FOREIGN KEY (transaction_id) REFERENCES borrowing_transactions(id)
ON DELETE CASCADE ON UPDATE CASCADE;

-- -------------------------------------------------
-- fine_payments relationships
-- -------------------------------------------------

-- Link to fine
ALTER TABLE fine_payments
ADD CONSTRAINT fk_fp_fine
FOREIGN KEY (fine_id) REFERENCES fines(id)
ON DELETE CASCADE ON UPDATE CASCADE;

-- Link to admin who processed payment
ALTER TABLE fine_payments
ADD CONSTRAINT fk_fp_processed_by
FOREIGN KEY (processed_by) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

-- -------------------------------------------------
-- semesters relationships
-- -------------------------------------------------

-- Link to academic year
ALTER TABLE semesters
ADD CONSTRAINT fk_sem_academic_year
FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
ON DELETE CASCADE ON UPDATE CASCADE;

-- -------------------------------------------------
-- student_year_history relationships
-- -------------------------------------------------

-- Link to user
ALTER TABLE student_year_history
ADD CONSTRAINT fk_syh_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE ON UPDATE CASCADE;

-- Link to academic year
ALTER TABLE student_year_history
ADD CONSTRAINT fk_syh_academic_year
FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
ON DELETE CASCADE ON UPDATE CASCADE;

-- -------------------------------------------------
-- semester_clearances relationships
-- -------------------------------------------------

-- Link to user
ALTER TABLE semester_clearances
ADD CONSTRAINT fk_sc_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE ON UPDATE CASCADE;

-- Link to semester
ALTER TABLE semester_clearances
ADD CONSTRAINT fk_sc_semester
FOREIGN KEY (semester_id) REFERENCES semesters(id)
ON DELETE CASCADE ON UPDATE CASCADE;

-- Link to admin who cleared (nullable)
ALTER TABLE semester_clearances
ADD CONSTRAINT fk_sc_cleared_by
FOREIGN KEY (cleared_by) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

-- -------------------------------------------------
-- semester_fine_payments relationships
-- -------------------------------------------------

-- Link to user
ALTER TABLE semester_fine_payments
ADD CONSTRAINT fk_sfp_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE ON UPDATE CASCADE;

-- Link to borrowing transaction (nullable)
ALTER TABLE semester_fine_payments
ADD CONSTRAINT fk_sfp_borrowing
FOREIGN KEY (borrowing_id) REFERENCES borrowing_transactions(id)
ON DELETE SET NULL ON UPDATE CASCADE;

-- Link to semester (nullable)
ALTER TABLE semester_fine_payments
ADD CONSTRAINT fk_sfp_semester
FOREIGN KEY (semester_id) REFERENCES semesters(id)
ON DELETE SET NULL ON UPDATE CASCADE;

-- Link to admin who received payment (nullable)
ALTER TABLE semester_fine_payments
ADD CONSTRAINT fk_sfp_received_by
FOREIGN KEY (received_by) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

-- -------------------------------------------------
-- notification_preferences relationships
-- -------------------------------------------------

-- Link to user
ALTER TABLE notification_preferences
ADD CONSTRAINT fk_np_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE ON UPDATE CASCADE;

-- -------------------------------------------------
-- notification_logs relationships
-- -------------------------------------------------

-- Link to user
ALTER TABLE notification_logs
ADD CONSTRAINT fk_nl_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE ON UPDATE CASCADE;

-- Link to borrowing transaction
ALTER TABLE notification_logs
ADD CONSTRAINT fk_nl_transaction
FOREIGN KEY (transaction_id) REFERENCES borrowing_transactions(id)
ON DELETE CASCADE ON UPDATE CASCADE;

-- -------------------------------------------------
-- overdue_history relationships
-- -------------------------------------------------

-- Link to student
ALTER TABLE overdue_history
ADD CONSTRAINT fk_oh_student
FOREIGN KEY (student_id_number) REFERENCES users(id_number)
ON DELETE CASCADE ON UPDATE CASCADE;

-- Link to borrowing transaction
ALTER TABLE overdue_history
ADD CONSTRAINT fk_oh_transaction
FOREIGN KEY (transaction_id) REFERENCES borrowing_transactions(id)
ON DELETE CASCADE ON UPDATE CASCADE;

-- Link to admin who processed return
ALTER TABLE overdue_history
ADD CONSTRAINT fk_oh_returned_admin
FOREIGN KEY (returned_by_admin) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

-- -------------------------------------------------
-- return_transactions relationships
-- -------------------------------------------------

-- Link to borrowing transaction
ALTER TABLE return_transactions
ADD CONSTRAINT fk_rt_transaction
FOREIGN KEY (transaction_id) REFERENCES borrowing_transactions(id)
ON DELETE CASCADE ON UPDATE CASCADE;

-- Link to student
ALTER TABLE return_transactions
ADD CONSTRAINT fk_rt_student
FOREIGN KEY (student_id_number) REFERENCES users(id_number)
ON DELETE CASCADE ON UPDATE CASCADE;

-- Link to book
ALTER TABLE return_transactions
ADD CONSTRAINT fk_rt_book
FOREIGN KEY (book_id) REFERENCES books(id)
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Link to admin who processed return
ALTER TABLE return_transactions
ADD CONSTRAINT fk_rt_admin
FOREIGN KEY (returned_by_admin) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

-- -------------------------------------------------
-- login_logs relationships
-- -------------------------------------------------

-- Link to user
ALTER TABLE login_logs
ADD CONSTRAINT fk_ll_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE ON UPDATE CASCADE;

-- -------------------------------------------------
-- audit_logs relationships
-- -------------------------------------------------

-- Link to user (nullable for system actions)
ALTER TABLE audit_logs
ADD CONSTRAINT fk_al_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

-- -------------------------------------------------
-- student_borrowing_status relationships
-- -------------------------------------------------

-- Link to student
ALTER TABLE student_borrowing_status
ADD CONSTRAINT fk_sbs_student
FOREIGN KEY (student_id_number) REFERENCES users(id_number)
ON DELETE CASCADE ON UPDATE CASCADE;

-- Link to admin who updated status
ALTER TABLE student_borrowing_status
ADD CONSTRAINT fk_sbs_updated_by
FOREIGN KEY (updated_by) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

-- -------------------------------------------------
-- system_settings relationships
-- -------------------------------------------------

-- Link to admin who updated setting
ALTER TABLE system_settings
ADD CONSTRAINT fk_ss_updated_by
FOREIGN KEY (updated_by) REFERENCES users(id)
ON DELETE SET NULL ON UPDATE CASCADE;

-- -------------------------------------------------
-- semester_tracking relationships (legacy table)
-- -------------------------------------------------

-- Link to student
ALTER TABLE semester_tracking
ADD CONSTRAINT fk_st_student
FOREIGN KEY (student_id_number) REFERENCES users(id_number)
ON DELETE CASCADE ON UPDATE CASCADE;

-- ================================================================
-- STEP 4: Add missing indexes for foreign key columns
-- ================================================================

-- These indexes improve query performance on foreign key columns
CREATE INDEX IF NOT EXISTS idx_bt_student_id ON borrowing_transactions(student_id_number);
CREATE INDEX IF NOT EXISTS idx_bt_book_id ON borrowing_transactions(book_id);
CREATE INDEX IF NOT EXISTS idx_bt_borrowed_admin ON borrowing_transactions(borrowed_by_admin);
CREATE INDEX IF NOT EXISTS idx_bt_returned_admin ON borrowing_transactions(returned_by_admin);
CREATE INDEX IF NOT EXISTS idx_fines_student ON fines(student_id_number);
CREATE INDEX IF NOT EXISTS idx_fines_transaction ON fines(transaction_id);
CREATE INDEX IF NOT EXISTS idx_fp_fine ON fine_payments(fine_id);
CREATE INDEX IF NOT EXISTS idx_oh_student ON overdue_history(student_id_number);
CREATE INDEX IF NOT EXISTS idx_rt_student ON return_transactions(student_id_number);
CREATE INDEX IF NOT EXISTS idx_sbs_student ON student_borrowing_status(student_id_number);

-- ================================================================
-- VERIFICATION: Show all foreign key relationships
-- ================================================================

SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE
    REFERENCED_TABLE_SCHEMA = DATABASE()
    AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME;

SELECT 'Foreign Key Migration Completed Successfully!' AS status;
