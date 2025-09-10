-- Complete fix for all missing tables and overdue book issues
-- Run this to fix all database issues

USE capstone_system;

-- 1. Create return_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS return_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    return_request_id INT NULL,
    active_borrowing_id INT NOT NULL,
    student_id_number VARCHAR(10) NOT NULL,
    book_id INT NOT NULL,
    returned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    returned_by_admin INT NOT NULL,
    return_condition ENUM('good', 'damaged', 'lost') DEFAULT 'good',
    condition_notes TEXT,
    fine_applied DECIMAL(10,2) DEFAULT 0.00,
    fine_reason TEXT,
    processing_notes TEXT,
    status ENUM('completed', 'pending_fine', 'disputed') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id_number) REFERENCES users(id_number) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (returned_by_admin) REFERENCES admins(id) ON DELETE CASCADE,
    FOREIGN KEY (active_borrowing_id) REFERENCES borrowing_transactions(id) ON DELETE CASCADE,
    INDEX idx_student_return (student_id_number),
    INDEX idx_return_date (returned_at),
    INDEX idx_status (status)
);

-- 2. Create overdue_history table if it doesn't exist
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

-- 3. Create fine_payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS fine_payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fine_id INT NOT NULL,
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'online') DEFAULT 'cash',
    processed_by INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fine_id) REFERENCES fines(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES admins(id) ON DELETE CASCADE,
    INDEX idx_fine_payment (fine_id),
    INDEX idx_payment_date (created_at)
);

-- 4. Add missing indexes for better performance
ALTER TABLE fines ADD INDEX IF NOT EXISTS idx_student_status (student_id_number, status);
ALTER TABLE borrowing_transactions ADD INDEX IF NOT EXISTS idx_status_due (status, due_date);

-- 5. CRITICAL FIX: Update all overdue books and create missing fines
-- Update all borrowed books that are past due to overdue status
UPDATE borrowing_transactions 
SET status = 'overdue' 
WHERE status = 'borrowed' 
AND due_date < CURDATE();

-- Create fines for all overdue books that don't have fines yet
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

-- 6. Show results
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

-- 7. Show table structures
SHOW TABLES LIKE '%return%';
SHOW TABLES LIKE '%overdue%';
SHOW TABLES LIKE '%fine%';
