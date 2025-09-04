-- Penalty and Rules System Database Schema
-- This file contains the additional tables needed for the penalty system

USE capstone_system;

-- System settings table for configurable rules
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value VARCHAR(255) NOT NULL,
    description TEXT,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES admins(id)
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('max_books_per_borrowing', '3', 'Maximum number of books a student can borrow at once'),
('borrowing_period_days', '7', 'Number of days a book can be borrowed (1 week)'),
('fine_per_day', '5', 'Fine amount in pesos per day for overdue books'),
('books_required_per_semester', '20', 'Minimum number of books a student must borrow per semester'),
('semester_duration_months', '5', 'Duration of a semester in months');

-- Fines table to track student fines
CREATE TABLE fines (
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id_number) REFERENCES users(id_number) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES borrowing_transactions(id) ON DELETE CASCADE
);

-- Semester tracking table
CREATE TABLE semester_tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id_number VARCHAR(10) NOT NULL,
    semester_start_date DATE NOT NULL,
    semester_end_date DATE NOT NULL,
    books_borrowed_count INT DEFAULT 0,
    books_required INT DEFAULT 20,
    status ENUM('active', 'completed', 'incomplete') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id_number) REFERENCES users(id_number) ON DELETE CASCADE,
    UNIQUE KEY unique_active_semester (student_id_number, status)
);

-- Student borrowing status table (to track if student can borrow)
CREATE TABLE student_borrowing_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id_number VARCHAR(10) UNIQUE NOT NULL,
    can_borrow BOOLEAN DEFAULT TRUE,
    reason_blocked TEXT NULL,
    blocked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id_number) REFERENCES users(id_number) ON DELETE CASCADE
);

-- Fine payments table
CREATE TABLE fine_payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fine_id INT NOT NULL,
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('cash', 'online', 'waived') DEFAULT 'cash',
    processed_by INT NOT NULL,
    notes TEXT,
    FOREIGN KEY (fine_id) REFERENCES fines(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES admins(id)
);

-- Create indexes for better performance
CREATE INDEX idx_fines_student ON fines(student_id_number);
CREATE INDEX idx_fines_status ON fines(status);
CREATE INDEX idx_fines_date ON fines(fine_date);
CREATE INDEX idx_semester_tracking_student ON semester_tracking(student_id_number);
CREATE INDEX idx_semester_tracking_status ON semester_tracking(status);
CREATE INDEX idx_borrowing_status_student ON student_borrowing_status(student_id_number);

-- Create a view for student borrowing summary
CREATE VIEW student_borrowing_summary AS
SELECT 
    u.id_number,
    u.email,
    COALESCE(sbs.can_borrow, TRUE) as can_borrow,
    sbs.reason_blocked,
    sbs.blocked_until,
    COALESCE(st.books_borrowed_count, 0) as semester_books_borrowed,
    COALESCE(st.books_required, 20) as semester_books_required,
    COALESCE(st.status, 'active') as semester_status,
    COALESCE(fine_summary.total_unpaid_fines, 0) as total_unpaid_fines,
    COALESCE(fine_summary.total_paid_fines, 0) as total_paid_fines,
    COALESCE(current_borrowed.current_count, 0) as currently_borrowed
FROM users u
LEFT JOIN student_borrowing_status sbs ON u.id_number = sbs.student_id_number
LEFT JOIN semester_tracking st ON u.id_number = st.student_id_number AND st.status = 'active'
LEFT JOIN (
    SELECT 
        student_id_number,
        SUM(CASE WHEN status = 'unpaid' THEN fine_amount - paid_amount ELSE 0 END) as total_unpaid_fines,
        SUM(CASE WHEN status = 'paid' THEN fine_amount ELSE 0 END) as total_paid_fines
    FROM fines 
    GROUP BY student_id_number
) fine_summary ON u.id_number = fine_summary.student_id_number
LEFT JOIN (
    SELECT 
        student_id_number,
        COUNT(*) as current_count
    FROM borrowing_transactions 
    WHERE status = 'borrowed'
    GROUP BY student_id_number
) current_borrowed ON u.id_number = current_borrowed.student_id_number;
