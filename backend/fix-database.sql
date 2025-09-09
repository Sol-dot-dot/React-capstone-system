-- Fix database issues for payment processing
USE capstone_system;

-- Check if fines table exists and has the right structure
SHOW TABLES LIKE 'fines';

-- If fines table doesn't exist, create it
CREATE TABLE IF NOT EXISTS fines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id_number VARCHAR(10) NOT NULL,
    transaction_id INT NOT NULL,
    fine_amount DECIMAL(10,2) NOT NULL,
    days_overdue INT NOT NULL,
    fine_date DATE NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    paid_date TIMESTAMP NULL,
    status ENUM('unpaid', 'paid', 'waived') DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Check if borrowing_transactions table exists
SHOW TABLES LIKE 'borrowing_transactions';

-- Check if books table exists
SHOW TABLES LIKE 'books';

-- Create some test data if it doesn't exist
INSERT IGNORE INTO fines (student_id_number, transaction_id, fine_amount, days_overdue, fine_date, status) VALUES
('C22-0045', 1, 45.00, 3, CURDATE(), 'unpaid'),
('C22-0044', 2, 30.00, 2, CURDATE(), 'unpaid');

-- Show current fines
SELECT 
    student_id_number, 
    COUNT(*) as total_fines,
    SUM(CASE WHEN status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_fines,
    SUM(fine_amount) as total_amount,
    SUM(CASE WHEN status = 'unpaid' THEN fine_amount ELSE 0 END) as unpaid_amount
FROM fines 
WHERE student_id_number IN ('C22-0045', 'C22-0044')
GROUP BY student_id_number;
