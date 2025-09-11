-- Fix borrowed_date for existing transactions
-- This script updates all borrowing transactions that have '0000-00-00' as borrowed_date
-- to use the created_at timestamp as the borrowed_date

USE capstone_system_optimized;

-- Update borrowing transactions where borrowed_date is '0000-00-00'
-- Use created_at as the borrowed_date since that's when the transaction was actually created
UPDATE borrowing_transactions 
SET borrowed_date = DATE(created_at)
WHERE borrowed_date = '0000-00-00' OR borrowed_date IS NULL;

-- Verify the update
SELECT 
    id,
    student_id_number,
    book_id,
    borrowed_date,
    due_date,
    returned_date,
    status,
    created_at
FROM borrowing_transactions 
ORDER BY id;
