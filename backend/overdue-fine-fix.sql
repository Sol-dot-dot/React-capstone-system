-- CRITICAL FIX: Ensure all overdue books get fines automatically
-- This fixes the bug where overdue books don't get fines

USE capstone_system;

-- Create overdue history table (if not exists)
CREATE TABLE IF NOT EXISTS overdue_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id_number VARCHAR(10) NOT NULL,
    transaction_id INT NOT NULL,
    book_title VARCHAR(255) NOT NULL,
    book_author VARCHAR(255) NOT NULL,
    book_code VARCHAR(20) NOT NULL,
    borrowed_at TIMESTAMP NOT NULL,
    due_date DATE NOT NULL,
    returned_at TIMESTAMP NULL,
    days_overdue INT NOT NULL,
    fine_amount DECIMAL(10,2) DEFAULT 0.00,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    returned_by_admin INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id_number) REFERENCES users(id_number) ON DELETE CASCADE,
    FOREIGN KEY (returned_by_admin) REFERENCES admins(id) ON DELETE CASCADE,
    INDEX idx_student_overdue (student_id_number),
    INDEX idx_returned_date (returned_at)
);

-- Add indexes for better performance
ALTER TABLE fines ADD INDEX IF NOT EXISTS idx_student_status (student_id_number, status);
ALTER TABLE borrowing_transactions ADD INDEX IF NOT EXISTS idx_status_due (status, due_date);

-- Create view for overdue books with complete information
CREATE OR REPLACE VIEW overdue_books_with_fines AS
SELECT 
    bt.id as transaction_id,
    bt.student_id_number,
    bt.borrowed_at,
    bt.due_date,
    bt.status,
    b.title,
    b.author,
    b.number_code,
    b.id as book_id,
    u.email,
    DATEDIFF(NOW(), bt.due_date) as days_overdue,
    f.id as fine_id,
    f.fine_amount,
    f.paid_amount,
    f.status as fine_status,
    f.fine_date,
    f.paid_date,
    CASE 
        WHEN f.status = 'paid' THEN 'can_return'
        WHEN f.status = 'unpaid' THEN 'needs_payment'
        WHEN f.status IS NULL THEN 'no_fine'
        ELSE 'unknown'
    END as return_status
FROM borrowing_transactions bt
JOIN books b ON bt.book_id = b.id
JOIN users u ON bt.student_id_number = u.id_number
LEFT JOIN fines f ON bt.id = f.transaction_id
WHERE bt.status = 'overdue'
ORDER BY bt.due_date ASC, bt.student_id_number;

-- IMMEDIATE FIX: Update all overdue books and create missing fines
-- Step 1: Update all borrowed books that are past due to overdue status
UPDATE borrowing_transactions 
SET status = 'overdue' 
WHERE status = 'borrowed' 
AND due_date < CURDATE();

-- Step 2: Create fines for all overdue books that don't have fines yet
INSERT INTO fines (student_id_number, transaction_id, fine_amount, days_overdue, fine_date, status)
SELECT 
    bt.student_id_number,
    bt.id as transaction_id,
    DATEDIFF(CURDATE(), bt.due_date) * COALESCE(ss.setting_value, 5) as fine_amount,
    DATEDIFF(CURDATE(), bt.due_date) as days_overdue,
    CURDATE() as fine_date,
    'unpaid' as status
FROM borrowing_transactions bt
CROSS JOIN (SELECT setting_value FROM system_settings WHERE setting_key = 'fine_per_day' LIMIT 1) ss
WHERE bt.status = 'overdue'
AND bt.id NOT IN (SELECT transaction_id FROM fines WHERE transaction_id IS NOT NULL)
AND DATEDIFF(CURDATE(), bt.due_date) > 0;

-- Show results
SELECT 
    'Updated overdue books' as action,
    COUNT(*) as count
FROM borrowing_transactions 
WHERE status = 'overdue';

SELECT 
    'Created missing fines' as action,
    COUNT(*) as count
FROM fines 
WHERE fine_date = CURDATE();
