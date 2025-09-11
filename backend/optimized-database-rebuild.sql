-- =====================================================
-- OPTIMIZED CAPSTONE LIBRARY MANAGEMENT SYSTEM DATABASE
-- =====================================================
-- This script creates a clean, optimized database with proper relationships
-- Remove unnecessary tables and ensure all tables are properly connected

-- Drop existing database and recreate
DROP DATABASE IF EXISTS capstone_system;
CREATE DATABASE capstone_system;
USE capstone_system;

-- =====================================================
-- CORE TABLES (ESSENTIAL FOR SYSTEM FUNCTIONALITY)
-- =====================================================

-- 1. USERS TABLE (Students and Admins)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_number VARCHAR(10) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_id_number (id_number),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- 2. BOOKS TABLE
CREATE TABLE books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    number_code VARCHAR(20) UNIQUE NOT NULL,
    category VARCHAR(100),
    publisher VARCHAR(255),
    publication_year YEAR,
    pages INT,
    description TEXT,
    status ENUM('available', 'borrowed', 'maintenance', 'lost') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_title (title),
    INDEX idx_author (author),
    INDEX idx_number_code (number_code),
    INDEX idx_status (status),
    INDEX idx_category (category)
);

-- 3. BORROWING TRANSACTIONS TABLE
CREATE TABLE borrowing_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id_number VARCHAR(10) NOT NULL,
    book_id INT NOT NULL,
    borrowed_date DATE NOT NULL,
    due_date DATE NOT NULL,
    returned_date DATE NULL,
    status ENUM('borrowed', 'returned', 'overdue') DEFAULT 'borrowed',
    borrowed_by_admin INT NOT NULL,
    returned_by_admin INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id_number) REFERENCES users(id_number) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (borrowed_by_admin) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (returned_by_admin) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student (student_id_number),
    INDEX idx_book (book_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    INDEX idx_borrowed_date (borrowed_date)
);

-- 4. FINES TABLE
CREATE TABLE fines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id_number VARCHAR(10) NOT NULL,
    transaction_id INT NOT NULL,
    fine_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    days_overdue INT NOT NULL DEFAULT 0,
    fine_date DATE NOT NULL,
    status ENUM('unpaid', 'paid', 'partial') DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id_number) REFERENCES users(id_number) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES borrowing_transactions(id) ON DELETE CASCADE,
    INDEX idx_student (student_id_number),
    INDEX idx_transaction (transaction_id),
    INDEX idx_status (status),
    INDEX idx_fine_date (fine_date)
);

-- 5. FINE PAYMENTS TABLE
CREATE TABLE fine_payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fine_id INT NOT NULL,
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'online') DEFAULT 'cash',
    processed_by INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fine_id) REFERENCES fines(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_fine (fine_id),
    INDEX idx_processed_by (processed_by),
    INDEX idx_payment_date (created_at)
);

-- 6. RETURN TRANSACTIONS TABLE
CREATE TABLE return_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id INT NOT NULL,
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
    FOREIGN KEY (transaction_id) REFERENCES borrowing_transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id_number) REFERENCES users(id_number) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (returned_by_admin) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_transaction (transaction_id),
    INDEX idx_student (student_id_number),
    INDEX idx_returned_at (returned_at),
    INDEX idx_status (status)
);

-- 7. OVERDUE HISTORY TABLE
CREATE TABLE overdue_history (
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
    FOREIGN KEY (transaction_id) REFERENCES borrowing_transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (returned_by_admin) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student (student_id_number),
    INDEX idx_transaction (transaction_id),
    INDEX idx_returned_at (returned_at)
);

-- 8. SYSTEM SETTINGS TABLE
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_setting_key (setting_key)
);

-- 9. SEMESTER TRACKING TABLE
CREATE TABLE semester_tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id_number VARCHAR(10) NOT NULL,
    semester_start_date DATE NOT NULL,
    semester_end_date DATE NOT NULL,
    books_borrowed_count INT DEFAULT 0,
    max_books_allowed INT DEFAULT 5,
    status ENUM('active', 'completed', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id_number) REFERENCES users(id_number) ON DELETE CASCADE,
    INDEX idx_student (student_id_number),
    INDEX idx_status (status),
    INDEX idx_semester_dates (semester_start_date, semester_end_date)
);

-- 10. STUDENT BORROWING STATUS TABLE
CREATE TABLE student_borrowing_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id_number VARCHAR(10) UNIQUE NOT NULL,
    can_borrow BOOLEAN DEFAULT TRUE,
    reason TEXT,
    updated_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id_number) REFERENCES users(id_number) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student (student_id_number),
    INDEX idx_can_borrow (can_borrow)
);

-- =====================================================
-- AUDIT AND LOGGING TABLES (ESSENTIAL FOR MONITORING)
-- =====================================================

-- 11. LOGIN LOGS TABLE
CREATE TABLE login_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    user_type ENUM('student', 'admin') NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_login_time (login_time),
    INDEX idx_user_type (user_type)
);

-- 12. AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_table (table_name),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for overdue books with fines
CREATE VIEW overdue_books_with_fines AS
SELECT 
    bt.id as transaction_id,
    bt.student_id_number,
    u.email as student_email,
    u.first_name,
    u.last_name,
    bt.book_id,
    b.title as book_title,
    b.author as book_author,
    b.number_code as book_code,
    bt.borrowed_date,
    bt.due_date,
    DATEDIFF(CURDATE(), bt.due_date) as days_overdue,
    COALESCE(f.fine_amount, 0) as fine_amount,
    COALESCE(f.paid_amount, 0) as paid_amount,
    COALESCE(f.status, 'unpaid') as fine_status,
    bt.status as transaction_status
FROM borrowing_transactions bt
JOIN users u ON bt.student_id_number = u.id_number
JOIN books b ON bt.book_id = b.id
LEFT JOIN fines f ON bt.id = f.transaction_id
WHERE bt.status = 'overdue' AND bt.due_date < CURDATE();

-- View for active borrowing status
CREATE VIEW active_borrowing_status AS
SELECT 
    u.id_number,
    u.email,
    u.first_name,
    u.last_name,
    COUNT(bt.id) as currently_borrowed,
    COUNT(CASE WHEN bt.status = 'overdue' THEN 1 END) as overdue_count,
    COALESCE(SUM(f.fine_amount - f.paid_amount), 0) as unpaid_fine_amount,
    sbs.can_borrow,
    sbs.reason as borrowing_restriction_reason
FROM users u
LEFT JOIN borrowing_transactions bt ON u.id_number = bt.student_id_number AND bt.status IN ('borrowed', 'overdue')
LEFT JOIN fines f ON u.id_number = f.student_id_number AND f.status = 'unpaid'
LEFT JOIN student_borrowing_status sbs ON u.id_number = sbs.student_id_number
WHERE u.role = 'student'
GROUP BY u.id_number, u.email, u.first_name, u.last_name, sbs.can_borrow, sbs.reason;

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Insert default admin user
INSERT INTO users (id_number, email, password_hash, first_name, last_name, role, is_verified, email_verified) 
VALUES ('ADMIN001', 'admin@library.com', '$2b$10$rQZ8K9mN2pL1sT3uV4wX5eY6zA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA', 'System', 'Administrator', 'admin', TRUE, TRUE);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description, updated_by) VALUES
('fine_per_day', '5.00', 'Fine amount per day for overdue books', 1),
('max_books_per_student', '5', 'Maximum books a student can borrow', 1),
('borrowing_duration_days', '14', 'Number of days a book can be borrowed', 1),
('system_name', 'Capstone Library Management System', 'Name of the library system', 1),
('system_email', 'library@capstone.com', 'System email address', 1);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to update book status when borrowing
DELIMITER //
CREATE TRIGGER update_book_status_on_borrow
AFTER INSERT ON borrowing_transactions
FOR EACH ROW
BEGIN
    UPDATE books SET status = 'borrowed' WHERE id = NEW.book_id;
END//

-- Trigger to update book status when returning
CREATE TRIGGER update_book_status_on_return
AFTER UPDATE ON borrowing_transactions
FOR EACH ROW
BEGIN
    IF NEW.status = 'returned' AND OLD.status != 'returned' THEN
        UPDATE books SET status = 'available' WHERE id = NEW.book_id;
    END IF;
END//

-- Trigger to create fine when book becomes overdue
CREATE TRIGGER create_fine_on_overdue
AFTER UPDATE ON borrowing_transactions
FOR EACH ROW
BEGIN
    IF NEW.status = 'overdue' AND OLD.status != 'overdue' THEN
        INSERT INTO fines (student_id_number, transaction_id, fine_amount, days_overdue, fine_date, status)
        SELECT 
            NEW.student_id_number,
            NEW.id,
            DATEDIFF(CURDATE(), NEW.due_date) * COALESCE(ss.setting_value, 5),
            DATEDIFF(CURDATE(), NEW.due_date),
            CURDATE(),
            'unpaid'
        FROM system_settings ss
        WHERE ss.setting_key = 'fine_per_day'
        LIMIT 1;
    END IF;
END//

DELIMITER ;

-- =====================================================
-- SHOW FINAL STRUCTURE
-- =====================================================

-- Show all tables
SHOW TABLES;

-- Show foreign key relationships
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

-- Show table counts
SELECT 
    'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'books', COUNT(*) FROM books
UNION ALL
SELECT 'borrowing_transactions', COUNT(*) FROM borrowing_transactions
UNION ALL
SELECT 'fines', COUNT(*) FROM fines
UNION ALL
SELECT 'fine_payments', COUNT(*) FROM fine_payments
UNION ALL
SELECT 'return_transactions', COUNT(*) FROM return_transactions
UNION ALL
SELECT 'overdue_history', COUNT(*) FROM overdue_history
UNION ALL
SELECT 'system_settings', COUNT(*) FROM system_settings
UNION ALL
SELECT 'semester_tracking', COUNT(*) FROM semester_tracking
UNION ALL
SELECT 'student_borrowing_status', COUNT(*) FROM student_borrowing_status
UNION ALL
SELECT 'login_logs', COUNT(*) FROM login_logs
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs;





