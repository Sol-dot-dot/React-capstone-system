-- Add some unpaid fines for testing the "Paid" button

-- First, let's create some overdue borrowing transactions if they don't exist
INSERT IGNORE INTO borrowing_transactions 
(student_id_number, book_id, borrowed_at, due_date, status, borrowed_by_admin)
SELECT 
    'C22-0045' as student_id_number,
    id as book_id,
    DATE_SUB(NOW(), INTERVAL 10 DAY) as borrowed_at,
    DATE_SUB(NOW(), INTERVAL 5 DAY) as due_date,
    'overdue' as status,
    'admin' as borrowed_by_admin
FROM books 
WHERE status = 'available' 
LIMIT 1;

-- Update the book status to borrowed
UPDATE books 
SET status = 'borrowed' 
WHERE id IN (
    SELECT book_id 
    FROM borrowing_transactions 
    WHERE student_id_number = 'C22-0045' 
    AND status = 'overdue'
    LIMIT 1
);

-- Create unpaid fine for C22-0045
INSERT IGNORE INTO fines 
(student_id_number, transaction_id, book_id, amount, days_overdue, status, fine_date)
SELECT 
    bt.student_id_number,
    bt.id as transaction_id,
    bt.book_id,
    75.00 as amount,  -- 5 days * ₱15 = ₱75
    5 as days_overdue,
    'unpaid' as status,
    NOW() as fine_date
FROM borrowing_transactions bt
WHERE bt.student_id_number = 'C22-0045' 
AND bt.status = 'overdue'
LIMIT 1;

-- Do the same for C22-0044
INSERT IGNORE INTO borrowing_transactions 
(student_id_number, book_id, borrowed_at, due_date, status, borrowed_by_admin)
SELECT 
    'C22-0044' as student_id_number,
    id as book_id,
    DATE_SUB(NOW(), INTERVAL 8 DAY) as borrowed_at,
    DATE_SUB(NOW(), INTERVAL 3 DAY) as due_date,
    'overdue' as status,
    'admin' as borrowed_by_admin
FROM books 
WHERE status = 'available' 
AND id NOT IN (
    SELECT book_id 
    FROM borrowing_transactions 
    WHERE student_id_number = 'C22-0045'
)
LIMIT 1;

-- Update the book status to borrowed
UPDATE books 
SET status = 'borrowed' 
WHERE id IN (
    SELECT book_id 
    FROM borrowing_transactions 
    WHERE student_id_number = 'C22-0044' 
    AND status = 'overdue'
    LIMIT 1
);

-- Create unpaid fine for C22-0044
INSERT IGNORE INTO fines 
(student_id_number, transaction_id, book_id, amount, days_overdue, status, fine_date)
SELECT 
    bt.student_id_number,
    bt.id as transaction_id,
    bt.book_id,
    45.00 as amount,  -- 3 days * ₱15 = ₱45
    3 as days_overdue,
    'unpaid' as status,
    NOW() as fine_date
FROM borrowing_transactions bt
WHERE bt.student_id_number = 'C22-0044' 
AND bt.status = 'overdue'
LIMIT 1;

-- Show the results
SELECT 
    student_id_number,
    COUNT(*) as total_fines,
    SUM(CASE WHEN status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_fines,
    SUM(amount) as total_amount,
    SUM(CASE WHEN status = 'unpaid' THEN amount ELSE 0 END) as unpaid_amount
FROM fines 
WHERE student_id_number IN ('C22-0045', 'C22-0044')
GROUP BY student_id_number;
