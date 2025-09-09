-- Improved Database Schema for Library Management System
-- This schema provides better separation of concerns and enhanced tracking

USE capstone_system;

-- ==============================================
-- 1. BORROWING MANAGEMENT TABLES
-- ==============================================

-- Borrowing requests table (when student requests to borrow)
CREATE TABLE borrowing_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id_number VARCHAR(10) NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    requested_books JSON NOT NULL, -- Array of book IDs requested
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id_number) REFERENCES users(id_number) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES admins(id)
);

-- Active borrowings table (currently borrowed books)
CREATE TABLE active_borrowings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    borrowing_request_id INT NOT NULL,
    student_id_number VARCHAR(10) NOT NULL,
    book_id INT NOT NULL,
    borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    borrowed_by_admin INT NOT NULL,
    status ENUM('active', 'overdue', 'extended') DEFAULT 'active',
    extension_count INT DEFAULT 0,
    last_extension_date TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (borrowing_request_id) REFERENCES borrowing_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id_number) REFERENCES users(id_number) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (borrowed_by_admin) REFERENCES admins(id),
    UNIQUE KEY unique_active_borrowing (student_id_number, book_id, status)
);

-- ==============================================
-- 2. RETURN MANAGEMENT TABLES
-- ==============================================

-- Return requests table (when student wants to return)
CREATE TABLE return_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id_number VARCHAR(10) NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    books_to_return JSON NOT NULL, -- Array of active_borrowing IDs
    return_reason ENUM('normal', 'early', 'overdue', 'damaged', 'lost') DEFAULT 'normal',
    notes TEXT,
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id_number) REFERENCES users(id_number) ON DELETE CASCADE
);

-- Return transactions table (actual returns processed)
CREATE TABLE return_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    return_request_id INT NOT NULL,
    active_borrowing_id INT NOT NULL,
    student_id_number VARCHAR(10) NOT NULL,
    book_id INT NOT NULL,
    returned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    returned_by_admin INT NOT NULL,
    return_condition ENUM('excellent', 'good', 'fair', 'poor', 'damaged', 'lost') DEFAULT 'good',
    condition_notes TEXT,
    fine_applied DECIMAL(10,2) DEFAULT 0.00,
    fine_reason TEXT,
    processing_notes TEXT,
    status ENUM('completed', 'pending_fine', 'disputed') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (return_request_id) REFERENCES return_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (active_borrowing_id) REFERENCES active_borrowings(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id_number) REFERENCES users(id_number) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (returned_by_admin) REFERENCES admins(id)
);

-- ==============================================
-- 3. ENHANCED TRACKING TABLES
-- ==============================================

-- Book condition history table
CREATE TABLE book_condition_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    book_id INT NOT NULL,
    condition_before ENUM('excellent', 'good', 'fair', 'poor', 'damaged') NOT NULL,
    condition_after ENUM('excellent', 'good', 'fair', 'poor', 'damaged') NOT NULL,
    change_reason ENUM('borrowing', 'return', 'maintenance', 'damage', 'repair') NOT NULL,
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by_admin INT NOT NULL,
    notes TEXT,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_admin) REFERENCES admins(id)
);

-- Borrowing extensions table
CREATE TABLE borrowing_extensions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    active_borrowing_id INT NOT NULL,
    original_due_date TIMESTAMP NOT NULL,
    new_due_date TIMESTAMP NOT NULL,
    extension_days INT NOT NULL,
    extension_reason TEXT,
    requested_by_student BOOLEAN DEFAULT FALSE,
    approved_by_admin INT NOT NULL,
    approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (active_borrowing_id) REFERENCES active_borrowings(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by_admin) REFERENCES admins(id)
);

-- ==============================================
-- 4. AUDIT AND LOGGING TABLES
-- ==============================================

-- System audit log table
CREATE TABLE system_audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    performed_by_admin INT,
    performed_by_student VARCHAR(10),
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (performed_by_admin) REFERENCES admins(id),
    FOREIGN KEY (performed_by_student) REFERENCES users(id_number)
);

-- ==============================================
-- 5. IMPROVED INDEXES
-- ==============================================

-- Borrowing indexes
CREATE INDEX idx_borrowing_requests_student ON borrowing_requests(student_id_number);
CREATE INDEX idx_borrowing_requests_status ON borrowing_requests(status);
CREATE INDEX idx_borrowing_requests_date ON borrowing_requests(request_date);

CREATE INDEX idx_active_borrowings_student ON active_borrowings(student_id_number);
CREATE INDEX idx_active_borrowings_book ON active_borrowings(book_id);
CREATE INDEX idx_active_borrowings_status ON active_borrowings(status);
CREATE INDEX idx_active_borrowings_due_date ON active_borrowings(due_date);

-- Return indexes
CREATE INDEX idx_return_requests_student ON return_requests(student_id_number);
CREATE INDEX idx_return_requests_status ON return_requests(status);
CREATE INDEX idx_return_requests_date ON return_requests(request_date);

CREATE INDEX idx_return_transactions_student ON return_transactions(student_id_number);
CREATE INDEX idx_return_transactions_book ON return_transactions(book_id);
CREATE INDEX idx_return_transactions_admin ON return_transactions(returned_by_admin);
CREATE INDEX idx_return_transactions_date ON return_transactions(returned_at);

-- ==============================================
-- 6. ENHANCED VIEWS
-- ==============================================

-- Current borrowing status view
CREATE VIEW current_borrowing_status AS
SELECT 
    ab.id,
    ab.student_id_number,
    u.email as student_email,
    ab.book_id,
    b.title as book_title,
    b.author as book_author,
    ab.borrowed_at,
    ab.due_date,
    ab.status,
    ab.extension_count,
    DATEDIFF(NOW(), ab.due_date) as days_overdue,
    CASE 
        WHEN ab.due_date < NOW() THEN 'overdue'
        WHEN DATEDIFF(ab.due_date, NOW()) <= 1 THEN 'due_soon'
        ELSE 'normal'
    END as urgency_status
FROM active_borrowings ab
JOIN users u ON ab.student_id_number = u.id_number
JOIN books b ON ab.book_id = b.id
WHERE ab.status IN ('active', 'overdue');

-- Return processing summary view
CREATE VIEW return_processing_summary AS
SELECT 
    rt.id,
    rt.student_id_number,
    u.email as student_email,
    rt.book_id,
    b.title as book_title,
    rt.returned_at,
    rt.return_condition,
    rt.fine_applied,
    rt.status,
    a.username as processed_by_admin,
    DATEDIFF(rt.returned_at, ab.due_date) as days_late
FROM return_transactions rt
JOIN users u ON rt.student_id_number = u.id_number
JOIN books b ON rt.book_id = b.id
JOIN admins a ON rt.returned_by_admin = a.id
JOIN active_borrowings ab ON rt.active_borrowing_id = ab.id;

-- ==============================================
-- 7. MIGRATION SCRIPT (Optional)
-- ==============================================

-- This would migrate existing data from the old structure
-- Uncomment and run if you want to migrate existing data

/*
-- Migrate existing borrowing_transactions to new structure
INSERT INTO borrowing_requests (student_id_number, request_date, requested_books, status, approved_by, approved_at)
SELECT 
    student_id_number,
    borrowed_at,
    JSON_ARRAY(book_id),
    'approved',
    borrowed_by_admin,
    borrowed_at
FROM borrowing_transactions
WHERE status = 'borrowed';

INSERT INTO active_borrowings (borrowing_request_id, student_id_number, book_id, borrowed_at, due_date, borrowed_by_admin, status)
SELECT 
    br.id,
    bt.student_id_number,
    bt.book_id,
    bt.borrowed_at,
    bt.due_date,
    bt.borrowed_by_admin,
    CASE 
        WHEN bt.due_date < NOW() THEN 'overdue'
        ELSE 'active'
    END
FROM borrowing_transactions bt
JOIN borrowing_requests br ON bt.student_id_number = br.student_id_number 
    AND JSON_CONTAINS(br.requested_books, CAST(bt.book_id AS JSON))
WHERE bt.status = 'borrowed';
*/
