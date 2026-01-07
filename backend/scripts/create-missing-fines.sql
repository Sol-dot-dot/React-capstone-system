-- Script to create missing fine records for overdue books
-- Run this to create fines for students with overdue books but no fine records

-- Check overdue books without fines first
SELECT
    bt.id as transaction_id,
    bt.student_id_number,
    bt.borrowed_date,
    bt.due_date,
    bt.status,
    b.title,
    b.author,
    DATEDIFF(CURDATE(), bt.due_date) as days_overdue,
    (DATEDIFF(CURDATE(), bt.due_date) * 5) as calculated_fine,
    CASE
        WHEN EXISTS (SELECT 1 FROM fines WHERE transaction_id = bt.id) THEN 'Has Fine'
        ELSE 'Missing Fine'
    END as fine_status
FROM borrowing_transactions bt
JOIN books b ON bt.book_id = b.id
WHERE (bt.status = 'overdue' OR (bt.status = 'borrowed' AND bt.due_date < CURDATE()))
AND NOT EXISTS (
    SELECT 1 FROM fines WHERE transaction_id = bt.id
)
ORDER BY bt.student_id_number, bt.due_date;

-- To create the missing fines, you can use the admin API endpoint:
-- POST /api/penalty/process-overdue
-- This will automatically create fine records for all overdue books
