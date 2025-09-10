-- =====================================================
-- DATA MIGRATION SCRIPT
-- =====================================================
-- This script helps migrate data from your old database to the new optimized one
-- Run this AFTER creating the new optimized database

USE capstone_system;

-- =====================================================
-- MIGRATION INSTRUCTIONS
-- =====================================================

/*
STEP 1: Backup your current database
- Export your current capstone_system database
- Save it as capstone_system_backup.sql

STEP 2: Create the new optimized database
- Run the optimized-database-rebuild.sql script
- This will create a clean, optimized database

STEP 3: Migrate your data (run these commands one by one)
- Copy and paste each section below into phpMyAdmin
- Run them in order

STEP 4: Verify the migration
- Check that all your data is present
- Test the system functionality
*/

-- =====================================================
-- DATA MIGRATION COMMANDS
-- =====================================================

-- 1. MIGRATE USERS DATA
-- Copy this and run in your OLD database, then copy results to NEW database
/*
SELECT 
    id_number,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    is_verified,
    email_verified,
    last_login,
    created_at,
    updated_at
FROM users
ORDER BY id;
*/

-- 2. MIGRATE BOOKS DATA
/*
SELECT 
    title,
    author,
    isbn,
    number_code,
    category,
    publisher,
    publication_year,
    pages,
    description,
    status,
    created_at,
    updated_at
FROM books
ORDER BY id;
*/

-- 3. MIGRATE BORROWING TRANSACTIONS
/*
SELECT 
    student_id_number,
    book_id,
    borrowed_date,
    due_date,
    returned_date,
    status,
    borrowed_by_admin,
    returned_by_admin,
    created_at,
    updated_at
FROM borrowing_transactions
ORDER BY id;
*/

-- 4. MIGRATE FINES DATA
/*
SELECT 
    student_id_number,
    transaction_id,
    fine_amount,
    paid_amount,
    days_overdue,
    fine_date,
    status,
    created_at,
    updated_at
FROM fines
ORDER BY id;
*/

-- 5. MIGRATE SYSTEM SETTINGS
/*
SELECT 
    setting_key,
    setting_value,
    description,
    updated_by
FROM system_settings
ORDER BY id;
*/

-- =====================================================
-- POST-MIGRATION VERIFICATION
-- =====================================================

-- Check data integrity
SELECT 'Users migrated' as check_type, COUNT(*) as count FROM users
UNION ALL
SELECT 'Books migrated', COUNT(*) FROM books
UNION ALL
SELECT 'Borrowing transactions migrated', COUNT(*) FROM borrowing_transactions
UNION ALL
SELECT 'Fines migrated', COUNT(*) FROM fines
UNION ALL
SELECT 'System settings migrated', COUNT(*) FROM system_settings;

-- Check foreign key relationships
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'capstone_system' 
AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME;

-- Test overdue books view
SELECT COUNT(*) as overdue_books_count FROM overdue_books_with_fines;

-- Test active borrowing status view
SELECT COUNT(*) as active_students_count FROM active_borrowing_status;
