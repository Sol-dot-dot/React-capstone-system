-- Migration: Add Semester Tracking to Borrowing Transactions
-- Date: 2024-12-30
-- Description: Adds semester_id and academic_year_id to borrowing_transactions and links existing data

-- ================================================================
-- STEP 1: Ensure academic_years table exists with proper data
-- ================================================================

CREATE TABLE IF NOT EXISTS academic_years (
    id INT PRIMARY KEY AUTO_INCREMENT,
    year_name VARCHAR(20) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_year_name (year_name),
    INDEX idx_is_current (is_current)
);

-- Insert academic years (Philippine school calendar: Aug-May)
INSERT INTO academic_years (year_name, start_date, end_date, is_current) VALUES
('2020-2021', '2020-08-01', '2021-05-31', 0),
('2021-2022', '2021-08-01', '2022-05-31', 0),
('2022-2023', '2022-08-01', '2023-05-31', 0),
('2023-2024', '2023-08-01', '2024-05-31', 0),
('2024-2025', '2024-08-01', '2025-05-31', 1)
ON DUPLICATE KEY UPDATE is_current = VALUES(is_current);

-- ================================================================
-- STEP 2: Ensure semesters table exists with proper data
-- ================================================================

CREATE TABLE IF NOT EXISTS semesters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    academic_year_id INT NOT NULL,
    semester_number INT NOT NULL,
    semester_name VARCHAR(50) NOT NULL,
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

-- Insert semesters for each academic year (with proper date ranges)
-- 2020-2021
INSERT INTO semesters (academic_year_id, semester_number, semester_name, start_date, end_date, is_current)
SELECT ay.id, 1, 'First Semester', '2020-08-01', '2020-12-20', 0
FROM academic_years ay WHERE ay.year_name = '2020-2021'
ON DUPLICATE KEY UPDATE semester_name = VALUES(semester_name);

INSERT INTO semesters (academic_year_id, semester_number, semester_name, start_date, end_date, is_current)
SELECT ay.id, 2, 'Second Semester', '2021-01-10', '2021-05-31', 0
FROM academic_years ay WHERE ay.year_name = '2020-2021'
ON DUPLICATE KEY UPDATE semester_name = VALUES(semester_name);

-- 2021-2022
INSERT INTO semesters (academic_year_id, semester_number, semester_name, start_date, end_date, is_current)
SELECT ay.id, 1, 'First Semester', '2021-08-01', '2021-12-20', 0
FROM academic_years ay WHERE ay.year_name = '2021-2022'
ON DUPLICATE KEY UPDATE semester_name = VALUES(semester_name);

INSERT INTO semesters (academic_year_id, semester_number, semester_name, start_date, end_date, is_current)
SELECT ay.id, 2, 'Second Semester', '2022-01-10', '2022-05-31', 0
FROM academic_years ay WHERE ay.year_name = '2021-2022'
ON DUPLICATE KEY UPDATE semester_name = VALUES(semester_name);

-- 2022-2023
INSERT INTO semesters (academic_year_id, semester_number, semester_name, start_date, end_date, is_current)
SELECT ay.id, 1, 'First Semester', '2022-08-01', '2022-12-20', 0
FROM academic_years ay WHERE ay.year_name = '2022-2023'
ON DUPLICATE KEY UPDATE semester_name = VALUES(semester_name);

INSERT INTO semesters (academic_year_id, semester_number, semester_name, start_date, end_date, is_current)
SELECT ay.id, 2, 'Second Semester', '2023-01-10', '2023-05-31', 0
FROM academic_years ay WHERE ay.year_name = '2022-2023'
ON DUPLICATE KEY UPDATE semester_name = VALUES(semester_name);

-- 2023-2024
INSERT INTO semesters (academic_year_id, semester_number, semester_name, start_date, end_date, is_current)
SELECT ay.id, 1, 'First Semester', '2023-08-01', '2023-12-20', 0
FROM academic_years ay WHERE ay.year_name = '2023-2024'
ON DUPLICATE KEY UPDATE semester_name = VALUES(semester_name);

INSERT INTO semesters (academic_year_id, semester_number, semester_name, start_date, end_date, is_current)
SELECT ay.id, 2, 'Second Semester', '2024-01-10', '2024-05-31', 0
FROM academic_years ay WHERE ay.year_name = '2023-2024'
ON DUPLICATE KEY UPDATE semester_name = VALUES(semester_name);

-- 2024-2025 (current year)
INSERT INTO semesters (academic_year_id, semester_number, semester_name, start_date, end_date, is_current)
SELECT ay.id, 1, 'First Semester', '2024-08-01', '2024-12-20', 1
FROM academic_years ay WHERE ay.year_name = '2024-2025'
ON DUPLICATE KEY UPDATE semester_name = VALUES(semester_name), is_current = 1;

INSERT INTO semesters (academic_year_id, semester_number, semester_name, start_date, end_date, is_current)
SELECT ay.id, 2, 'Second Semester', '2025-01-10', '2025-05-31', 0
FROM academic_years ay WHERE ay.year_name = '2024-2025'
ON DUPLICATE KEY UPDATE semester_name = VALUES(semester_name);

-- ================================================================
-- STEP 3: Add semester_id and academic_year_id to borrowing_transactions
-- ================================================================

-- Check if columns exist before adding them
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
    AND table_name = 'borrowing_transactions'
    AND column_name = 'semester_id');

SET @add_col = IF(@col_exists = 0,
    'ALTER TABLE borrowing_transactions ADD COLUMN semester_id INT NULL AFTER returned_by_admin',
    'SELECT "semester_id column already exists"');
PREPARE stmt FROM @add_col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE()
    AND table_name = 'borrowing_transactions'
    AND column_name = 'academic_year_id');

SET @add_col = IF(@col_exists = 0,
    'ALTER TABLE borrowing_transactions ADD COLUMN academic_year_id INT NULL AFTER semester_id',
    'SELECT "academic_year_id column already exists"');
PREPARE stmt FROM @add_col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_bt_semester ON borrowing_transactions(semester_id);
CREATE INDEX IF NOT EXISTS idx_bt_academic_year ON borrowing_transactions(academic_year_id);

-- ================================================================
-- STEP 4: Update existing borrowings with semester data
-- ================================================================

-- Link borrowings to semesters based on borrowed_date
UPDATE borrowing_transactions bt
JOIN semesters s ON bt.borrowed_date BETWEEN s.start_date AND s.end_date
SET bt.semester_id = s.id, bt.academic_year_id = s.academic_year_id
WHERE bt.semester_id IS NULL AND bt.borrowed_date IS NOT NULL AND bt.borrowed_date != '0000-00-00';

-- For any borrowings outside semester ranges, find the closest semester
UPDATE borrowing_transactions bt
SET bt.semester_id = (
    SELECT s.id FROM semesters s
    ORDER BY ABS(DATEDIFF(bt.borrowed_date, s.start_date))
    LIMIT 1
)
WHERE bt.semester_id IS NULL AND bt.borrowed_date IS NOT NULL AND bt.borrowed_date != '0000-00-00';

-- Update academic_year_id for records where we set semester_id
UPDATE borrowing_transactions bt
JOIN semesters s ON bt.semester_id = s.id
SET bt.academic_year_id = s.academic_year_id
WHERE bt.academic_year_id IS NULL AND bt.semester_id IS NOT NULL;

-- ================================================================
-- STEP 5: Create student_year_history table
-- ================================================================

CREATE TABLE IF NOT EXISTS student_year_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    year_level INT NOT NULL,
    status ENUM('enrolled', 'graduated', 'dropped', 'on_leave') DEFAULT 'enrolled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    INDEX idx_user_year (user_id, academic_year_id),
    UNIQUE KEY unique_user_year (user_id, academic_year_id)
);

-- ================================================================
-- STEP 6: Generate student year history from borrowing data
-- ================================================================

-- Auto-generate enrollment history for students based on their borrowing dates
-- This calculates year level based on the sequence of academic years they borrowed in
INSERT IGNORE INTO student_year_history (user_id, academic_year_id, year_level, status)
SELECT DISTINCT
    u.id as user_id,
    bt.academic_year_id,
    -- Calculate year level based on how many years since their first academic year
    COALESCE(
        (SELECT COUNT(DISTINCT bt2.academic_year_id)
         FROM borrowing_transactions bt2
         WHERE bt2.student_id_number = bt.student_id_number
         AND bt2.academic_year_id IS NOT NULL
         AND bt2.academic_year_id <= bt.academic_year_id),
        1
    ) as year_level,
    'enrolled'
FROM borrowing_transactions bt
JOIN users u ON bt.student_id_number = u.id_number
WHERE bt.academic_year_id IS NOT NULL
AND u.role = 'student';

-- ================================================================
-- STEP 7: Create semester_clearances table
-- ================================================================

CREATE TABLE IF NOT EXISTS semester_clearances (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    semester_id INT NOT NULL,
    books_borrowed INT DEFAULT 0,
    books_required INT DEFAULT 20,
    total_fines DECIMAL(10,2) DEFAULT 0.00,
    fines_paid DECIMAL(10,2) DEFAULT 0.00,
    is_cleared BOOLEAN DEFAULT FALSE,
    cleared_date DATE,
    cleared_by INT,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
    INDEX idx_user_semester (user_id, semester_id),
    INDEX idx_is_cleared (is_cleared),
    UNIQUE KEY unique_user_semester (user_id, semester_id)
);

-- ================================================================
-- STEP 8: Populate semester_clearances from existing borrowing data
-- ================================================================

-- Insert clearance records for each student-semester combination based on borrowing data
INSERT IGNORE INTO semester_clearances (user_id, semester_id, books_borrowed, total_fines, fines_paid)
SELECT
    u.id as user_id,
    bt.semester_id,
    COUNT(DISTINCT bt.id) as books_borrowed,
    COALESCE(SUM(f.fine_amount), 0) as total_fines,
    COALESCE(SUM(f.paid_amount), 0) as fines_paid
FROM borrowing_transactions bt
JOIN users u ON bt.student_id_number = u.id_number
LEFT JOIN fines f ON bt.id = f.transaction_id
WHERE bt.semester_id IS NOT NULL
AND u.role = 'student'
GROUP BY u.id, bt.semester_id;

-- ================================================================
-- VERIFICATION QUERIES (optional - run separately to verify data)
-- ================================================================

-- Check academic years
-- SELECT * FROM academic_years ORDER BY start_date;

-- Check semesters
-- SELECT s.*, ay.year_name FROM semesters s JOIN academic_years ay ON s.academic_year_id = ay.id ORDER BY ay.start_date, s.semester_number;

-- Check borrowings now have semester data
-- SELECT COUNT(*) as total, SUM(CASE WHEN semester_id IS NOT NULL THEN 1 ELSE 0 END) as with_semester FROM borrowing_transactions;

-- Check student year history
-- SELECT u.id_number, u.first_name, u.last_name, ay.year_name, syh.year_level FROM student_year_history syh JOIN users u ON syh.user_id = u.id JOIN academic_years ay ON syh.academic_year_id = ay.id;

SELECT 'Semester Tracking Migration Completed Successfully' AS status;
