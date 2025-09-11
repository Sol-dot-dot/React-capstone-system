-- Fix missing return transactions
-- This script creates return_transaction records for all borrowing_transactions 
-- that have been returned but don't have corresponding return_transaction records

USE capstone_system_optimized;

-- Insert missing return transaction records
INSERT INTO return_transactions (
    transaction_id,
    student_id_number,
    book_id,
    returned_at,
    returned_by_admin,
    return_condition,
    condition_notes,
    processing_notes,
    status
)
SELECT 
    bt.id as transaction_id,
    bt.student_id_number,
    bt.book_id,
    bt.returned_date as returned_at,
    bt.returned_by_admin,
    'good' as return_condition,
    NULL as condition_notes,
    'Auto-created: Missing return transaction record' as processing_notes,
    'completed' as status
FROM borrowing_transactions bt
WHERE bt.status = 'returned' 
  AND bt.returned_date IS NOT NULL
  AND bt.returned_by_admin IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM return_transactions rt 
      WHERE rt.transaction_id = bt.id
  );

-- Show the results
SELECT 
    'Return transactions created' as action,
    COUNT(*) as count
FROM return_transactions rt
WHERE rt.processing_notes = 'Auto-created: Missing return transaction record';

-- Show all return transactions
SELECT 
    rt.id,
    rt.transaction_id,
    rt.student_id_number,
    rt.returned_at,
    rt.return_condition,
    rt.status,
    rt.processing_notes
FROM return_transactions rt
ORDER BY rt.returned_at DESC;
