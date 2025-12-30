-- Migration: Add Student Library Academic Records Schema
-- Date: 2024-12-30
-- Description: Creates tables for tracking student library records by academic year and semester

-- 1. Academic Years Table
CREATE TABLE IF NOT EXISTS academic_years (
    id INT PRIMARY KEY AUTO_INCREMENT,
    year_name VARCHAR(20) NOT NULL UNIQUE,     -- e.g., "2023-2024"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_year_name (year_name),
    INDEX idx_is_current (is_current)
);

-- 2. Semesters Table
CREATE TABLE IF NOT EXISTS semesters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    academic_year_id INT NOT NULL,
    semester_number INT NOT NULL,               -- 1 or 2
    semester_name VARCHAR(50) NOT NULL,         -- "First Semester", "Second Semester"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    INDEX idx_academic_year (academic_year_id),
    INDEX idx_is_current (is_current),
    UNIQUE KEY unique_semester (academic_year_id, semester_number)
);

-- 3. Student Year Level History
CREATE TABLE IF NOT EXISTS student_year_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    year_level INT NOT NULL,                    -- 1, 2, 3, 4
    status ENUM('enrolled', 'graduated', 'dropped', 'on_leave') DEFAULT 'enrolled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    INDEX idx_user_year (user_id, academic_year_id),
    UNIQUE KEY unique_user_year (user_id, academic_year_id)
);

-- 4. Semester Clearance Status
CREATE TABLE IF NOT EXISTS semester_clearances (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    semester_id INT NOT NULL,
    books_borrowed INT DEFAULT 0,
    books_required INT DEFAULT 20,              -- From settings
    total_fines DECIMAL(10,2) DEFAULT 0.00,
    fines_paid DECIMAL(10,2) DEFAULT 0.00,
    is_cleared BOOLEAN DEFAULT FALSE,
    cleared_date DATE,
    cleared_by INT,                             -- Admin who cleared
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
    INDEX idx_user_semester (user_id, semester_id),
    INDEX idx_is_cleared (is_cleared),
    UNIQUE KEY unique_user_semester (user_id, semester_id)
);

-- 5. Fine Payment History (for semester-based tracking)
-- Note: This may conflict with existing fine_payments table structure
-- Only create if table doesn't exist with different structure
CREATE TABLE IF NOT EXISTS semester_fine_payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    borrowing_id INT,                           -- Optional, for specific borrowing
    semester_id INT,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method ENUM('cash', 'gcash', 'bank_transfer', 'other') DEFAULT 'cash',
    reference_number VARCHAR(100),
    received_by INT,                            -- Admin who received payment
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_semester (semester_id),
    INDEX idx_payment_date (payment_date)
);

-- Insert sample academic years and semesters
INSERT INTO academic_years (year_name, start_date, end_date, is_current) VALUES
('2021-2022', '2021-08-01', '2022-05-31', FALSE),
('2022-2023', '2022-08-01', '2023-05-31', FALSE),
('2023-2024', '2023-08-01', '2024-05-31', FALSE),
('2024-2025', '2024-08-01', '2025-05-31', TRUE)
ON DUPLICATE KEY UPDATE is_current = VALUES(is_current);

-- Insert semesters for each academic year
INSERT INTO semesters (academic_year_id, semester_number, semester_name, start_date, end_date, is_current)
SELECT ay.id, 1, 'First Semester',
    DATE_ADD(ay.start_date, INTERVAL 0 MONTH),
    DATE_ADD(ay.start_date, INTERVAL 4 MONTH),
    (ay.is_current = TRUE AND MONTH(CURDATE()) BETWEEN 8 AND 12)
FROM academic_years ay
WHERE NOT EXISTS (
    SELECT 1 FROM semesters s
    WHERE s.academic_year_id = ay.id AND s.semester_number = 1
);

INSERT INTO semesters (academic_year_id, semester_number, semester_name, start_date, end_date, is_current)
SELECT ay.id, 2, 'Second Semester',
    DATE_ADD(ay.start_date, INTERVAL 5 MONTH),
    ay.end_date,
    (ay.is_current = TRUE AND MONTH(CURDATE()) BETWEEN 1 AND 5)
FROM academic_years ay
WHERE NOT EXISTS (
    SELECT 1 FROM semesters s
    WHERE s.academic_year_id = ay.id AND s.semester_number = 2
);

-- Migration complete
SELECT 'Student Records Schema Migration Completed Successfully' AS status;
