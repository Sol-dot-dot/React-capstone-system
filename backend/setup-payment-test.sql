-- Setup script to test payment functionality
-- Run this in your MySQL database

USE capstone_system;

-- Create fines table if it doesn't exist
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

-- Create borrowing_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS borrowing_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id_number VARCHAR(10) NOT NULL,
    book_id INT NOT NULL,
    borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date DATE NOT NULL,
    returned_at TIMESTAMP NULL,
    status ENUM('borrowed', 'returned', 'overdue') DEFAULT 'borrowed',
    borrowed_by_admin VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create books table if it doesn't exist
CREATE TABLE IF NOT EXISTS books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20),
    genre VARCHAR(100),
    status ENUM('available', 'borrowed', 'maintenance') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert test data
INSERT IGNORE INTO books (id, title, author, isbn, genre, status) VALUES
(1, 'Test Book 1', 'Test Author 1', '1234567890', 'Fiction', 'available'),
(2, 'Test Book 2', 'Test Author 2', '1234567891', 'Non-Fiction', 'available');

-- Insert test borrowing transactions
INSERT IGNORE INTO borrowing_transactions (id, student_id_number, book_id, borrowed_at, due_date, status, borrowed_by_admin) VALUES
(1, 'C22-0045', 1, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), 'overdue', 'admin'),
(2, 'C22-0044', 2, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), 'overdue', 'admin');

-- Update book status to borrowed
UPDATE books SET status = 'borrowed' WHERE id IN (1, 2);

-- Insert test fines
INSERT IGNORE INTO fines (student_id_number, transaction_id, fine_amount, days_overdue, fine_date, status) VALUES
('C22-0045', 1, 45.00, 3, CURDATE(), 'unpaid'),
('C22-0044', 2, 15.00, 1, CURDATE(), 'unpaid');

-- Show the test data
SELECT 'Fines Data:' as info;
SELECT 
    student_id_number, 
    COUNT(*) as total_fines,
    SUM(CASE WHEN status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_fines,
    SUM(fine_amount) as total_amount,
    SUM(CASE WHEN status = 'unpaid' THEN fine_amount ELSE 0 END) as unpaid_amount
FROM fines 
WHERE student_id_number IN ('C22-0045', 'C22-0044')
GROUP BY student_id_number;

SELECT 'Borrowing Transactions:' as info;
SELECT * FROM borrowing_transactions WHERE student_id_number IN ('C22-0045', 'C22-0044');

SELECT 'Books:' as info;
SELECT * FROM books WHERE id IN (1, 2);
