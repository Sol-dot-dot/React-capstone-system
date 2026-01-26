-- ================================================================
-- COMPLETE DATABASE SCHEMA FOR CAPSTONE LIBRARY MANAGEMENT SYSTEM
-- Generated: 2026-01-16
-- Database: capstone_system_optimized
-- Description: Complete schema with all tables, relationships, functions, triggers, and views
-- ================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- IMPORTANT: Disable foreign key checks FIRST to allow dropping tables in any order
SET FOREIGN_KEY_CHECKS = 0;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `capstone_system_optimized`
--
CREATE DATABASE IF NOT EXISTS `capstone_system_optimized` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `capstone_system_optimized`;

-- ================================================================
-- STEP 1: STORED FUNCTIONS
-- ================================================================

DELIMITER $$

-- Function to generate book barcode
DROP FUNCTION IF EXISTS `generate_book_barcode`$$
CREATE FUNCTION `generate_book_barcode` (`book_code` VARCHAR(20))
RETURNS VARCHAR(50)
CHARSET utf8mb4 COLLATE utf8mb4_general_ci
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE barcode VARCHAR(50);
    SET barcode = CONCAT('BOOK-', book_code);
    RETURN barcode;
END$$

-- Function to generate student barcode
DROP FUNCTION IF EXISTS `generate_student_barcode`$$
CREATE FUNCTION `generate_student_barcode` (`student_id` VARCHAR(10))
RETURNS VARCHAR(50)
CHARSET utf8mb4 COLLATE utf8mb4_general_ci
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE barcode VARCHAR(50);
    SET barcode = CONCAT('STU-', student_id);
    RETURN barcode;
END$$

DELIMITER ;

-- ================================================================
-- STEP 2: CORE TABLES
-- ================================================================

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_number` varchar(10) NOT NULL,
  `student_barcode` varchar(50) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `role` enum('student','admin') DEFAULT 'student',
  `is_verified` tinyint(1) DEFAULT 0,
  `email_verified` tinyint(1) DEFAULT 0,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reset_code` varchar(6) DEFAULT NULL,
  `reset_expires` timestamp NULL DEFAULT NULL,
  `verification_code` varchar(6) DEFAULT NULL,
  `verification_expires` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_number` (`id_number`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `student_barcode` (`student_barcode`),
  KEY `idx_role` (`role`),
  KEY `idx_id_number` (`id_number`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `books`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `books`;
CREATE TABLE `books` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `number_code` varchar(20) NOT NULL,
  `barcode` varchar(50) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `publisher` varchar(255) DEFAULT NULL,
  `publication_year` year(4) DEFAULT NULL,
  `pages` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('available','borrowed','maintenance','lost') DEFAULT 'available',
  `book_copies` int(11) DEFAULT 1,
  `available_copies` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `number_code` (`number_code`),
  UNIQUE KEY `isbn` (`isbn`),
  UNIQUE KEY `barcode` (`barcode`),
  KEY `idx_title` (`title`),
  KEY `idx_author` (`author`),
  KEY `idx_status` (`status`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ================================================================
-- STEP 3: ACADEMIC STRUCTURE TABLES
-- ================================================================

-- --------------------------------------------------------
-- Table structure for table `academic_years`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `academic_years`;
CREATE TABLE `academic_years` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `year_name` varchar(20) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_current` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `year_name` (`year_name`),
  KEY `idx_year_name` (`year_name`),
  KEY `idx_is_current` (`is_current`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert default academic years
INSERT INTO `academic_years` (`year_name`, `start_date`, `end_date`, `is_current`) VALUES
('2020-2021', '2020-08-01', '2021-05-31', 0),
('2021-2022', '2021-08-01', '2022-05-31', 0),
('2022-2023', '2022-08-01', '2023-05-31', 0),
('2023-2024', '2023-08-01', '2024-05-31', 0),
('2024-2025', '2024-08-01', '2025-05-31', 0),
('2025-2026', '2025-08-01', '2026-05-31', 1);

-- --------------------------------------------------------
-- Table structure for table `semesters`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `semesters`;
CREATE TABLE `semesters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `academic_year_id` int(11) NOT NULL,
  `semester_number` int(11) NOT NULL,
  `semester_name` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_current` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_semester` (`academic_year_id`, `semester_number`),
  KEY `idx_academic_year` (`academic_year_id`),
  KEY `idx_is_current` (`is_current`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert default semesters for each academic year
INSERT INTO `semesters` (`academic_year_id`, `semester_number`, `semester_name`, `start_date`, `end_date`, `is_current`)
SELECT ay.id, 1, 'First Semester',
  DATE_FORMAT(ay.start_date, '%Y-08-01'),
  DATE_FORMAT(ay.start_date, '%Y-12-20'),
  CASE WHEN ay.is_current = 1 THEN 1 ELSE 0 END
FROM academic_years ay
UNION ALL
SELECT ay.id, 2, 'Second Semester',
  DATE_ADD(ay.start_date, INTERVAL 5 MONTH),
  ay.end_date,
  0
FROM academic_years ay;

-- ================================================================
-- STEP 4: TRANSACTION TABLES
-- ================================================================

-- --------------------------------------------------------
-- Table structure for table `borrowing_transactions`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `borrowing_transactions`;
CREATE TABLE `borrowing_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id_number` varchar(10) NOT NULL,
  `book_id` int(11) NOT NULL,
  `borrowed_date` date NOT NULL,
  `due_date` date NOT NULL,
  `returned_date` date DEFAULT NULL,
  `status` enum('borrowed','returned','overdue') DEFAULT 'borrowed',
  `borrowed_by_admin` int(11) DEFAULT NULL,
  `returned_by_admin` int(11) DEFAULT NULL,
  `semester_id` int(11) DEFAULT NULL,
  `academic_year_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_student_id` (`student_id_number`),
  KEY `idx_book_id` (`book_id`),
  KEY `idx_status` (`status`),
  KEY `idx_due_date` (`due_date`),
  KEY `idx_borrowed_date` (`borrowed_date`),
  KEY `idx_borrowed_admin` (`borrowed_by_admin`),
  KEY `idx_returned_admin` (`returned_by_admin`),
  KEY `idx_semester` (`semester_id`),
  KEY `idx_academic_year` (`academic_year_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `fines`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `fines`;
CREATE TABLE `fines` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id_number` varchar(10) NOT NULL,
  `transaction_id` int(11) NOT NULL,
  `fine_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `paid_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `days_overdue` int(11) NOT NULL DEFAULT 0,
  `fine_date` date NOT NULL,
  `status` enum('unpaid','paid','partial') DEFAULT 'unpaid',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_student` (`student_id_number`),
  KEY `idx_transaction` (`transaction_id`),
  KEY `idx_status` (`status`),
  KEY `idx_fine_date` (`fine_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `fine_payments`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `fine_payments`;
CREATE TABLE `fine_payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fine_id` int(11) NOT NULL,
  `payment_amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','card','online') DEFAULT 'cash',
  `processed_by` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_fine` (`fine_id`),
  KEY `idx_processed_by` (`processed_by`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `return_transactions`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `return_transactions`;
CREATE TABLE `return_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transaction_id` int(11) NOT NULL,
  `student_id_number` varchar(10) NOT NULL,
  `book_id` int(11) NOT NULL,
  `returned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `returned_by_admin` int(11) DEFAULT NULL,
  `return_condition` enum('good','damaged','lost') DEFAULT 'good',
  `condition_notes` text DEFAULT NULL,
  `fine_applied` decimal(10,2) DEFAULT 0.00,
  `fine_reason` text DEFAULT NULL,
  `processing_notes` text DEFAULT NULL,
  `status` enum('completed','pending_fine','disputed') DEFAULT 'completed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_transaction` (`transaction_id`),
  KEY `idx_student` (`student_id_number`),
  KEY `idx_returned_at` (`returned_at`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `overdue_history`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `overdue_history`;
CREATE TABLE `overdue_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id_number` varchar(10) NOT NULL,
  `transaction_id` int(11) NOT NULL,
  `book_title` varchar(255) NOT NULL,
  `book_author` varchar(255) NOT NULL,
  `book_code` varchar(20) NOT NULL,
  `borrowed_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `due_date` date NOT NULL,
  `returned_at` timestamp NULL DEFAULT NULL,
  `days_overdue` int(11) NOT NULL,
  `fine_amount` decimal(10,2) DEFAULT 0.00,
  `paid_amount` decimal(10,2) DEFAULT 0.00,
  `returned_by_admin` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_student` (`student_id_number`),
  KEY `idx_transaction` (`transaction_id`),
  KEY `idx_returned_at` (`returned_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ================================================================
-- STEP 5: ACADEMIC TRACKING TABLES
-- ================================================================

-- --------------------------------------------------------
-- Table structure for table `student_year_history`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `student_year_history`;
CREATE TABLE `student_year_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `academic_year_id` int(11) NOT NULL,
  `year_level` int(11) NOT NULL,
  `status` enum('enrolled','graduated','dropped','on_leave') DEFAULT 'enrolled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_year` (`user_id`, `academic_year_id`),
  KEY `idx_user_year` (`user_id`, `academic_year_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `semester_clearances`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `semester_clearances`;
CREATE TABLE `semester_clearances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `books_borrowed` int(11) DEFAULT 0,
  `books_required` int(11) DEFAULT 20,
  `total_fines` decimal(10,2) DEFAULT 0.00,
  `fines_paid` decimal(10,2) DEFAULT 0.00,
  `is_cleared` tinyint(1) DEFAULT 0,
  `cleared_date` date DEFAULT NULL,
  `cleared_by` int(11) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_semester` (`user_id`, `semester_id`),
  KEY `idx_user_semester` (`user_id`, `semester_id`),
  KEY `idx_is_cleared` (`is_cleared`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `semester_fine_payments`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `semester_fine_payments`;
CREATE TABLE `semester_fine_payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `borrowing_id` int(11) DEFAULT NULL,
  `semester_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','card','online') DEFAULT 'cash',
  `received_by` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_borrowing` (`borrowing_id`),
  KEY `idx_semester` (`semester_id`),
  KEY `idx_received_by` (`received_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `semester_tracking` (Legacy)
-- --------------------------------------------------------

DROP TABLE IF EXISTS `semester_tracking`;
CREATE TABLE `semester_tracking` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id_number` varchar(10) NOT NULL,
  `semester_start_date` date NOT NULL,
  `semester_end_date` date NOT NULL,
  `books_borrowed_count` int(11) DEFAULT 0,
  `max_books_allowed` int(11) DEFAULT 5,
  `status` enum('active','completed','suspended') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_student` (`student_id_number`),
  KEY `idx_status` (`status`),
  KEY `idx_semester_dates` (`semester_start_date`, `semester_end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ================================================================
-- STEP 6: NOTIFICATION TABLES
-- ================================================================

-- --------------------------------------------------------
-- Table structure for table `notification_preferences`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `notification_preferences`;
CREATE TABLE `notification_preferences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `notifications_enabled` tinyint(1) DEFAULT 1,
  `push_enabled` tinyint(1) DEFAULT 1,
  `email_enabled` tinyint(1) DEFAULT 1,
  `days_before_due` int(11) DEFAULT 3,
  `notify_overdue` tinyint(1) DEFAULT 1,
  `notify_due_today` tinyint(1) DEFAULT 1,
  `notify_due_soon` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_prefs` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `notification_logs`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `notification_logs`;
CREATE TABLE `notification_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `transaction_id` int(11) NOT NULL,
  `notification_type` enum('due_soon','due_today','overdue') NOT NULL,
  `sent_via` enum('push','email','both','in_app') NOT NULL,
  `book_title` varchar(255) DEFAULT NULL,
  `days_until_due` int(11) DEFAULT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `sent_date` date GENERATED ALWAYS AS (DATE(sent_at)) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_daily_notification` (`user_id`, `transaction_id`, `notification_type`, `sent_date`),
  KEY `idx_user_sent` (`user_id`, `sent_at`),
  KEY `idx_type_sent` (`notification_type`, `sent_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ================================================================
-- STEP 7: AUDIT AND LOG TABLES
-- ================================================================

-- --------------------------------------------------------
-- Table structure for table `audit_logs`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(100) DEFAULT NULL,
  `record_id` int(11) DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_table` (`table_name`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `login_logs`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `login_logs`;
CREATE TABLE `login_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `user_type` enum('student','admin') NOT NULL,
  `login_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_login_time` (`login_time`),
  KEY `idx_user_type` (`user_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ================================================================
-- STEP 8: SETTINGS AND STATUS TABLES
-- ================================================================

-- --------------------------------------------------------
-- Table structure for table `student_borrowing_status`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `student_borrowing_status`;
CREATE TABLE `student_borrowing_status` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id_number` varchar(10) NOT NULL,
  `can_borrow` tinyint(1) DEFAULT 1,
  `reason` text DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_id_number` (`student_id_number`),
  KEY `idx_can_borrow` (`can_borrow`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `system_settings`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `description` text DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert default system settings
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `description`, `updated_by`) VALUES
('fine_per_day', '5', 'Fine amount per day for overdue books', 1),
('max_borrow_days', '7', 'Maximum number of days a book can be borrowed', 1),
('max_books_per_student', '5', 'Maximum number of books a student can borrow at once', 1),
('semester_books_required', '20', 'Minimum books required to borrow per semester for clearance', 1);

-- ================================================================
-- STEP 8.5: INSERT SAMPLE BOOKS (100 Books)
-- ================================================================

INSERT INTO `books` (`title`, `author`, `isbn`, `number_code`, `category`, `publisher`, `publication_year`, `pages`, `description`, `status`, `book_copies`, `available_copies`) VALUES
-- Fiction (20 books)
('To Kill a Mockingbird', 'Harper Lee', '978-0061120084', 'FIC-001', 'Fiction', 'Harper Perennial', 2006, 336, 'A classic novel about racial injustice in the American South through the eyes of young Scout Finch.', 'available', 5, 5),
('1984', 'George Orwell', '978-0451524935', 'FIC-002', 'Fiction', 'Signet Classic', 1961, 328, 'A dystopian novel set in a totalitarian society ruled by Big Brother.', 'available', 4, 4),
('Pride and Prejudice', 'Jane Austen', '978-0141439518', 'FIC-003', 'Fiction', 'Penguin Classics', 2002, 480, 'A romantic novel following Elizabeth Bennet as she navigates issues of manners, morality, and marriage.', 'available', 3, 3),
('The Great Gatsby', 'F. Scott Fitzgerald', '978-0743273565', 'FIC-004', 'Fiction', 'Scribner', 2004, 180, 'A tale of the mysteriously wealthy Jay Gatsby and his love for Daisy Buchanan in 1920s America.', 'available', 4, 4),
('One Hundred Years of Solitude', 'Gabriel Garcia Marquez', '978-0060883287', 'FIC-005', 'Fiction', 'Harper Perennial', 2006, 417, 'A multigenerational story of the Buendía family in the fictional town of Macondo.', 'available', 3, 3),
('The Catcher in the Rye', 'J.D. Salinger', '978-0316769488', 'FIC-006', 'Fiction', 'Little Brown', 2001, 277, 'The story of Holden Caulfield, a teenager navigating adulthood in New York City.', 'available', 5, 5),
('Brave New World', 'Aldous Huxley', '978-0060850524', 'FIC-007', 'Fiction', 'Harper Perennial', 2006, 288, 'A dystopian novel set in a futuristic World State with genetically modified citizens.', 'available', 3, 3),
('The Lord of the Rings', 'J.R.R. Tolkien', '978-0544003415', 'FIC-008', 'Fiction', 'Mariner Books', 2012, 1178, 'An epic high-fantasy novel following the quest to destroy the One Ring.', 'available', 6, 6),
('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', '978-0590353427', 'FIC-009', 'Fiction', 'Scholastic', 1998, 309, 'The first book in the Harry Potter series about a young wizard discovering his magical heritage.', 'available', 8, 8),
('The Hunger Games', 'Suzanne Collins', '978-0439023481', 'FIC-010', 'Fiction', 'Scholastic Press', 2008, 374, 'A dystopian novel about Katniss Everdeen surviving a televised death match.', 'available', 5, 5),
('Animal Farm', 'George Orwell', '978-0451526342', 'FIC-011', 'Fiction', 'Signet Classics', 1996, 141, 'An allegorical novella reflecting events leading up to the Russian Revolution.', 'available', 4, 4),
('The Alchemist', 'Paulo Coelho', '978-0062315007', 'FIC-012', 'Fiction', 'HarperOne', 2014, 208, 'A philosophical novel about a shepherd boy''s journey to find treasure in Egypt.', 'available', 5, 5),
('Don Quixote', 'Miguel de Cervantes', '978-0060934347', 'FIC-013', 'Fiction', 'Ecco', 2005, 940, 'The story of a man who loses his sanity and decides to become a knight-errant.', 'available', 2, 2),
('Crime and Punishment', 'Fyodor Dostoevsky', '978-0143058144', 'FIC-014', 'Fiction', 'Penguin Classics', 2017, 671, 'A psychological drama about a poor student who commits murder and faces moral dilemmas.', 'available', 3, 3),
('Wuthering Heights', 'Emily Bronte', '978-0141439556', 'FIC-015', 'Fiction', 'Penguin Classics', 2002, 416, 'A tale of passionate and doomed love on the Yorkshire moors.', 'available', 3, 3),
('Jane Eyre', 'Charlotte Bronte', '978-0141441146', 'FIC-016', 'Fiction', 'Penguin Classics', 2006, 624, 'The story of a plain governess who falls in love with her mysterious employer.', 'available', 4, 4),
('The Picture of Dorian Gray', 'Oscar Wilde', '978-0141439570', 'FIC-017', 'Fiction', 'Penguin Classics', 2003, 304, 'A Gothic tale about a man whose portrait ages while he remains young.', 'available', 3, 3),
('Moby-Dick', 'Herman Melville', '978-0142437247', 'FIC-018', 'Fiction', 'Penguin Classics', 2002, 720, 'The epic tale of Captain Ahab''s obsessive quest to kill the white whale.', 'available', 2, 2),
('Frankenstein', 'Mary Shelley', '978-0141439471', 'FIC-019', 'Fiction', 'Penguin Classics', 2003, 288, 'The classic story of a scientist who creates a sapient creature.', 'available', 4, 4),
('Dracula', 'Bram Stoker', '978-0141439846', 'FIC-020', 'Fiction', 'Penguin Classics', 2003, 512, 'The quintessential vampire novel featuring Count Dracula.', 'available', 3, 3),

-- Science & Technology (20 books)
('A Brief History of Time', 'Stephen Hawking', '978-0553380163', 'SCI-001', 'Science', 'Bantam', 1998, 212, 'An accessible exploration of cosmology, black holes, and the nature of time.', 'available', 4, 4),
('The Origin of Species', 'Charles Darwin', '978-0451529060', 'SCI-002', 'Science', 'Signet Classics', 2003, 576, 'Darwin''s groundbreaking work on the theory of evolution by natural selection.', 'available', 3, 3),
('Cosmos', 'Carl Sagan', '978-0345539434', 'SCI-003', 'Science', 'Ballantine Books', 2013, 432, 'A journey through the universe exploring science and civilization.', 'available', 4, 4),
('The Selfish Gene', 'Richard Dawkins', '978-0199291151', 'SCI-004', 'Science', 'Oxford University Press', 2006, 360, 'A revolutionary look at evolution from the gene''s point of view.', 'available', 3, 3),
('Silent Spring', 'Rachel Carson', '978-0618249060', 'SCI-005', 'Science', 'Mariner Books', 2002, 400, 'A groundbreaking book on the environmental impact of pesticides.', 'available', 3, 3),
('The Structure of Scientific Revolutions', 'Thomas S. Kuhn', '978-0226458120', 'SCI-006', 'Science', 'University of Chicago Press', 2012, 264, 'An influential work on the history and philosophy of science.', 'available', 2, 2),
('Clean Code', 'Robert C. Martin', '978-0132350884', 'TECH-001', 'Technology', 'Prentice Hall', 2008, 464, 'A handbook of agile software craftsmanship with practical advice on writing clean code.', 'available', 6, 6),
('Introduction to Algorithms', 'Thomas H. Cormen', '978-0262033848', 'TECH-002', 'Technology', 'MIT Press', 2009, 1312, 'A comprehensive textbook covering a broad range of algorithms.', 'available', 5, 5),
('Design Patterns', 'Erich Gamma', '978-0201633610', 'TECH-003', 'Technology', 'Addison-Wesley', 1994, 416, 'Elements of reusable object-oriented software design patterns.', 'available', 4, 4),
('The Pragmatic Programmer', 'David Thomas', '978-0135957059', 'TECH-004', 'Technology', 'Addison-Wesley', 2019, 352, 'A guide to becoming a better programmer through practical advice.', 'available', 5, 5),
('JavaScript: The Good Parts', 'Douglas Crockford', '978-0596517748', 'TECH-005', 'Technology', 'O''Reilly Media', 2008, 176, 'A deep dive into the best features of JavaScript.', 'available', 4, 4),
('Python Crash Course', 'Eric Matthes', '978-1593279288', 'TECH-006', 'Technology', 'No Starch Press', 2019, 544, 'A hands-on, project-based introduction to Python programming.', 'available', 6, 6),
('Artificial Intelligence: A Modern Approach', 'Stuart Russell', '978-0136042594', 'TECH-007', 'Technology', 'Pearson', 2020, 1136, 'The leading textbook on artificial intelligence used worldwide.', 'available', 4, 4),
('The Art of Computer Programming', 'Donald Knuth', '978-0201896831', 'TECH-008', 'Technology', 'Addison-Wesley', 2011, 672, 'A comprehensive monograph on algorithms and their analysis.', 'available', 2, 2),
('Computer Networks', 'Andrew S. Tanenbaum', '978-0132126953', 'TECH-009', 'Technology', 'Pearson', 2010, 960, 'A thorough introduction to computer networks and protocols.', 'available', 4, 4),
('Database System Concepts', 'Abraham Silberschatz', '978-0078022159', 'TECH-010', 'Technology', 'McGraw-Hill', 2019, 1376, 'A comprehensive guide to database management systems.', 'available', 5, 5),
('Operating System Concepts', 'Abraham Silberschatz', '978-1119800361', 'TECH-011', 'Technology', 'Wiley', 2021, 1040, 'A comprehensive textbook on operating systems principles.', 'available', 5, 5),
('Computer Organization and Design', 'David A. Patterson', '978-0128201091', 'TECH-012', 'Technology', 'Morgan Kaufmann', 2020, 800, 'The hardware/software interface explained clearly.', 'available', 4, 4),
('Software Engineering', 'Ian Sommerville', '978-0133943030', 'TECH-013', 'Technology', 'Pearson', 2015, 816, 'A comprehensive introduction to software engineering practices.', 'available', 4, 4),
('Cracking the Coding Interview', 'Gayle Laakmann McDowell', '978-0984782857', 'TECH-014', 'Technology', 'CareerCup', 2015, 708, '189 programming questions and solutions for technical interviews.', 'available', 6, 6),

-- History & Social Sciences (20 books)
('Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', '978-0062316097', 'HIST-001', 'History', 'Harper', 2015, 464, 'A sweeping narrative of human history from the Stone Age to the present.', 'available', 5, 5),
('Guns, Germs, and Steel', 'Jared Diamond', '978-0393354324', 'HIST-002', 'History', 'W.W. Norton', 2017, 528, 'An exploration of why certain civilizations came to dominate others.', 'available', 4, 4),
('A People''s History of the United States', 'Howard Zinn', '978-0062397348', 'HIST-003', 'History', 'Harper Perennial', 2015, 784, 'American history told from the perspective of marginalized groups.', 'available', 3, 3),
('The Art of War', 'Sun Tzu', '978-1599869773', 'HIST-004', 'History', 'Filiquarian Publishing', 2007, 68, 'An ancient Chinese military treatise on strategy and tactics.', 'available', 5, 5),
('The Prince', 'Niccolo Machiavelli', '978-0140449150', 'HIST-005', 'History', 'Penguin Classics', 2003, 144, 'A 16th-century political treatise on acquiring and maintaining power.', 'available', 4, 4),
('The Republic', 'Plato', '978-0140455113', 'HIST-006', 'Philosophy', 'Penguin Classics', 2007, 516, 'Plato''s influential dialogue on justice and the ideal state.', 'available', 3, 3),
('Meditations', 'Marcus Aurelius', '978-0140449334', 'HIST-007', 'Philosophy', 'Penguin Classics', 2006, 304, 'Personal writings of the Roman Emperor on Stoic philosophy.', 'available', 4, 4),
('The Social Contract', 'Jean-Jacques Rousseau', '978-0140442014', 'HIST-008', 'Philosophy', 'Penguin Classics', 1968, 192, 'A treatise on the foundations of political legitimacy.', 'available', 3, 3),
('The Communist Manifesto', 'Karl Marx', '978-0140447576', 'HIST-009', 'History', 'Penguin Classics', 2002, 96, 'A political pamphlet outlining the goals of communism.', 'available', 4, 4),
('The Wealth of Nations', 'Adam Smith', '978-0553585971', 'HIST-010', 'Economics', 'Bantam Classics', 2003, 1264, 'A foundational work of classical economics.', 'available', 2, 2),
('The Diary of a Young Girl', 'Anne Frank', '978-0553296983', 'HIST-011', 'History', 'Bantam', 1993, 352, 'The diary of a Jewish girl hiding from the Nazis during WWII.', 'available', 5, 5),
('Night', 'Elie Wiesel', '978-0374500016', 'HIST-012', 'History', 'Hill and Wang', 2006, 120, 'A memoir of the author''s experiences in Nazi concentration camps.', 'available', 4, 4),
('The Rise and Fall of the Third Reich', 'William L. Shirer', '978-1451651683', 'HIST-013', 'History', 'Simon & Schuster', 2011, 1280, 'A comprehensive history of Nazi Germany.', 'available', 2, 2),
('Team of Rivals', 'Doris Kearns Goodwin', '978-0743270755', 'HIST-014', 'History', 'Simon & Schuster', 2006, 944, 'The political genius of Abraham Lincoln.', 'available', 3, 3),
('The Immortal Life of Henrietta Lacks', 'Rebecca Skloot', '978-1400052189', 'HIST-015', 'Science', 'Crown', 2010, 381, 'The story of HeLa cells and the woman behind them.', 'available', 4, 4),
('Freakonomics', 'Steven D. Levitt', '978-0060731335', 'HIST-016', 'Economics', 'William Morrow', 2009, 336, 'A rogue economist explores the hidden side of everything.', 'available', 4, 4),
('Thinking, Fast and Slow', 'Daniel Kahneman', '978-0374533557', 'HIST-017', 'Psychology', 'Farrar, Straus and Giroux', 2013, 499, 'An exploration of the two systems that drive the way we think.', 'available', 5, 5),
('Outliers', 'Malcolm Gladwell', '978-0316017930', 'HIST-018', 'Psychology', 'Little Brown', 2008, 309, 'The story of success and what makes high-achievers different.', 'available', 4, 4),
('The Tipping Point', 'Malcolm Gladwell', '978-0316346627', 'HIST-019', 'Psychology', 'Back Bay Books', 2002, 301, 'How little things can make a big difference.', 'available', 4, 4),
('Man''s Search for Meaning', 'Viktor E. Frankl', '978-0807014295', 'HIST-020', 'Psychology', 'Beacon Press', 2006, 184, 'A psychiatrist''s experiences in Nazi death camps and the birth of logotherapy.', 'available', 5, 5),

-- Business & Self-Help (20 books)
('How to Win Friends and Influence People', 'Dale Carnegie', '978-0671027032', 'BUS-001', 'Self-Help', 'Simon & Schuster', 1998, 288, 'A classic guide to improving social skills and building relationships.', 'available', 5, 5),
('The 7 Habits of Highly Effective People', 'Stephen R. Covey', '978-1982137274', 'BUS-002', 'Self-Help', 'Simon & Schuster', 2020, 464, 'Powerful lessons in personal change and effectiveness.', 'available', 5, 5),
('Rich Dad Poor Dad', 'Robert T. Kiyosaki', '978-1612680194', 'BUS-003', 'Business', 'Plata Publishing', 2017, 336, 'What the rich teach their kids about money that the poor do not.', 'available', 4, 4),
('Think and Grow Rich', 'Napoleon Hill', '978-1585424337', 'BUS-004', 'Business', 'TarcherPerigee', 2005, 320, 'A personal development and self-improvement book.', 'available', 4, 4),
('The Lean Startup', 'Eric Ries', '978-0307887894', 'BUS-005', 'Business', 'Currency', 2011, 336, 'How today''s entrepreneurs use continuous innovation.', 'available', 4, 4),
('Good to Great', 'Jim Collins', '978-0066620992', 'BUS-006', 'Business', 'HarperBusiness', 2001, 400, 'Why some companies make the leap and others don''t.', 'available', 3, 3),
('Zero to One', 'Peter Thiel', '978-0804139298', 'BUS-007', 'Business', 'Currency', 2014, 224, 'Notes on startups, or how to build the future.', 'available', 4, 4),
('Start with Why', 'Simon Sinek', '978-1591846444', 'BUS-008', 'Business', 'Portfolio', 2011, 256, 'How great leaders inspire everyone to take action.', 'available', 4, 4),
('The Hard Thing About Hard Things', 'Ben Horowitz', '978-0062273208', 'BUS-009', 'Business', 'Harper Business', 2014, 304, 'Building a business when there are no easy answers.', 'available', 3, 3),
('Atomic Habits', 'James Clear', '978-0735211292', 'BUS-010', 'Self-Help', 'Avery', 2018, 320, 'An easy and proven way to build good habits and break bad ones.', 'available', 6, 6),
('The Power of Habit', 'Charles Duhigg', '978-0812981605', 'BUS-011', 'Self-Help', 'Random House', 2014, 416, 'Why we do what we do in life and business.', 'available', 4, 4),
('Mindset', 'Carol S. Dweck', '978-0345472328', 'BUS-012', 'Self-Help', 'Ballantine Books', 2007, 320, 'The new psychology of success.', 'available', 4, 4),
('Deep Work', 'Cal Newport', '978-1455586691', 'BUS-013', 'Self-Help', 'Grand Central Publishing', 2016, 304, 'Rules for focused success in a distracted world.', 'available', 4, 4),
('The Four Hour Workweek', 'Timothy Ferriss', '978-0307465351', 'BUS-014', 'Business', 'Harmony', 2009, 416, 'Escape 9-5, live anywhere, and join the new rich.', 'available', 3, 3),
('The Intelligent Investor', 'Benjamin Graham', '978-0060555665', 'BUS-015', 'Business', 'Harper Business', 2006, 640, 'The definitive book on value investing.', 'available', 4, 4),
('Influence: The Psychology of Persuasion', 'Robert B. Cialdini', '978-0062937650', 'BUS-016', 'Psychology', 'Harper Business', 2021, 592, 'The psychology of why people say yes.', 'available', 4, 4),
('Emotional Intelligence', 'Daniel Goleman', '978-0553804911', 'BUS-017', 'Psychology', 'Bantam', 2005, 384, 'Why it can matter more than IQ.', 'available', 4, 4),
('The Subtle Art of Not Giving a F*ck', 'Mark Manson', '978-0062457714', 'BUS-018', 'Self-Help', 'Harper', 2016, 224, 'A counterintuitive approach to living a good life.', 'available', 5, 5),
('Grit', 'Angela Duckworth', '978-1501111112', 'BUS-019', 'Self-Help', 'Scribner', 2016, 352, 'The power of passion and perseverance.', 'available', 4, 4),
('The 48 Laws of Power', 'Robert Greene', '978-0140280197', 'BUS-020', 'Self-Help', 'Penguin Books', 2000, 480, 'A guide to the laws of power throughout history.', 'available', 3, 3),

-- Academic & Reference (20 books)
('Campbell Biology', 'Lisa A. Urry', '978-0135188743', 'ACAD-001', 'Biology', 'Pearson', 2020, 1488, 'The world''s most widely used biology textbook.', 'available', 5, 5),
('Organic Chemistry', 'Paula Yurkanis Bruice', '978-0134042282', 'ACAD-002', 'Chemistry', 'Pearson', 2016, 1344, 'A comprehensive introduction to organic chemistry.', 'available', 4, 4),
('Physics for Scientists and Engineers', 'Raymond A. Serway', '978-1337553278', 'ACAD-003', 'Physics', 'Cengage Learning', 2018, 1536, 'A comprehensive physics textbook.', 'available', 4, 4),
('Calculus: Early Transcendentals', 'James Stewart', '978-1285741550', 'ACAD-004', 'Mathematics', 'Cengage Learning', 2015, 1368, 'The most widely used calculus textbook.', 'available', 6, 6),
('Linear Algebra and Its Applications', 'David C. Lay', '978-0321982384', 'ACAD-005', 'Mathematics', 'Pearson', 2015, 576, 'A modern introduction to linear algebra.', 'available', 4, 4),
('Principles of Economics', 'N. Gregory Mankiw', '978-1305585126', 'ACAD-006', 'Economics', 'Cengage Learning', 2020, 856, 'An introduction to economics principles.', 'available', 5, 5),
('Psychology', 'David G. Myers', '978-1319050627', 'ACAD-007', 'Psychology', 'Worth Publishers', 2018, 864, 'A comprehensive introduction to psychology.', 'available', 5, 5),
('Sociology', 'John J. Macionis', '978-0134736570', 'ACAD-008', 'Sociology', 'Pearson', 2018, 720, 'A comprehensive introduction to sociology.', 'available', 4, 4),
('Human Anatomy & Physiology', 'Elaine N. Marieb', '978-0134580999', 'ACAD-009', 'Biology', 'Pearson', 2018, 1264, 'A comprehensive guide to human anatomy.', 'available', 5, 5),
('Fundamentals of Nursing', 'Patricia A. Potter', '978-0323677721', 'ACAD-010', 'Nursing', 'Elsevier', 2020, 1392, 'Essential nursing concepts and clinical skills.', 'available', 6, 6),
('Harrison''s Principles of Internal Medicine', 'J. Larry Jameson', '978-1259644030', 'ACAD-011', 'Medicine', 'McGraw-Hill', 2018, 4000, 'The authoritative guide to internal medicine.', 'available', 3, 3),
('Gray''s Anatomy', 'Susan Standring', '978-0702052309', 'ACAD-012', 'Medicine', 'Elsevier', 2020, 1606, 'The classic anatomy reference.', 'available', 3, 3),
('Clinical Microbiology', 'Patrick R. Murray', '978-0323673228', 'ACAD-013', 'Medicine', 'Elsevier', 2020, 872, 'A comprehensive guide to medical microbiology.', 'available', 4, 4),
('Business Law', 'Henry R. Cheeseman', '978-0134728780', 'ACAD-014', 'Law', 'Pearson', 2018, 1200, 'Legal environment of business.', 'available', 4, 4),
('Accounting Principles', 'Jerry J. Weygandt', '978-1119411017', 'ACAD-015', 'Accounting', 'Wiley', 2018, 1296, 'Fundamentals of accounting.', 'available', 5, 5),
('Marketing Management', 'Philip Kotler', '978-0134887838', 'ACAD-016', 'Business', 'Pearson', 2019, 800, 'The gold standard of marketing textbooks.', 'available', 4, 4),
('Human Resource Management', 'Gary Dessler', '978-0134742564', 'ACAD-017', 'Business', 'Pearson', 2019, 720, 'A comprehensive guide to HR management.', 'available', 4, 4),
('Financial Management', 'Eugene F. Brigham', '978-1337902601', 'ACAD-018', 'Business', 'Cengage Learning', 2019, 1136, 'Theory and practice of financial management.', 'available', 4, 4),
('Research Methods in Psychology', 'Beth Morling', '978-0393536263', 'ACAD-019', 'Psychology', 'W.W. Norton', 2017, 640, 'Evaluating a world of information.', 'available', 4, 4),
('Statistics for Business and Economics', 'Paul Newbold', '978-0134506593', 'ACAD-020', 'Statistics', 'Pearson', 2019, 880, 'Statistical methods for business applications.', 'available', 5, 5);

-- ================================================================
-- STEP 9: ADD ALL FOREIGN KEY CONSTRAINTS
-- ================================================================

-- Foreign key checks already disabled at the start of this script

-- borrowing_transactions relationships
ALTER TABLE `borrowing_transactions`
  ADD CONSTRAINT `fk_bt_student` FOREIGN KEY (`student_id_number`) REFERENCES `users` (`id_number`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_bt_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_bt_borrowed_admin` FOREIGN KEY (`borrowed_by_admin`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_bt_returned_admin` FOREIGN KEY (`returned_by_admin`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_bt_semester` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_bt_academic_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- fines relationships
ALTER TABLE `fines`
  ADD CONSTRAINT `fk_fines_student` FOREIGN KEY (`student_id_number`) REFERENCES `users` (`id_number`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_fines_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `borrowing_transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- fine_payments relationships
ALTER TABLE `fine_payments`
  ADD CONSTRAINT `fk_fp_fine` FOREIGN KEY (`fine_id`) REFERENCES `fines` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_fp_processed_by` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- semesters relationships
ALTER TABLE `semesters`
  ADD CONSTRAINT `fk_sem_academic_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- student_year_history relationships
ALTER TABLE `student_year_history`
  ADD CONSTRAINT `fk_syh_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_syh_academic_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- semester_clearances relationships
ALTER TABLE `semester_clearances`
  ADD CONSTRAINT `fk_sc_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sc_semester` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sc_cleared_by` FOREIGN KEY (`cleared_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- semester_fine_payments relationships
ALTER TABLE `semester_fine_payments`
  ADD CONSTRAINT `fk_sfp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sfp_borrowing` FOREIGN KEY (`borrowing_id`) REFERENCES `borrowing_transactions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sfp_semester` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sfp_received_by` FOREIGN KEY (`received_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- notification_preferences relationships
ALTER TABLE `notification_preferences`
  ADD CONSTRAINT `fk_np_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- notification_logs relationships
ALTER TABLE `notification_logs`
  ADD CONSTRAINT `fk_nl_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_nl_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `borrowing_transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- overdue_history relationships
ALTER TABLE `overdue_history`
  ADD CONSTRAINT `fk_oh_student` FOREIGN KEY (`student_id_number`) REFERENCES `users` (`id_number`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_oh_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `borrowing_transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_oh_returned_admin` FOREIGN KEY (`returned_by_admin`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- return_transactions relationships
ALTER TABLE `return_transactions`
  ADD CONSTRAINT `fk_rt_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `borrowing_transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rt_student` FOREIGN KEY (`student_id_number`) REFERENCES `users` (`id_number`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rt_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rt_admin` FOREIGN KEY (`returned_by_admin`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- login_logs relationships
ALTER TABLE `login_logs`
  ADD CONSTRAINT `fk_ll_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- audit_logs relationships
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_al_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- student_borrowing_status relationships
ALTER TABLE `student_borrowing_status`
  ADD CONSTRAINT `fk_sbs_student` FOREIGN KEY (`student_id_number`) REFERENCES `users` (`id_number`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sbs_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- system_settings relationships
ALTER TABLE `system_settings`
  ADD CONSTRAINT `fk_ss_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- semester_tracking relationships
ALTER TABLE `semester_tracking`
  ADD CONSTRAINT `fk_st_student` FOREIGN KEY (`student_id_number`) REFERENCES `users` (`id_number`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ================================================================
-- STEP 10: CREATE TRIGGERS
-- ================================================================

DELIMITER $$

-- Trigger to generate student barcode on insert
DROP TRIGGER IF EXISTS `generate_student_barcode_on_insert`$$
CREATE TRIGGER `generate_student_barcode_on_insert`
BEFORE INSERT ON `users`
FOR EACH ROW
BEGIN
    IF NEW.student_barcode IS NULL OR NEW.student_barcode = '' THEN
        SET NEW.student_barcode = generate_student_barcode(NEW.id_number);
    END IF;
END$$

-- Trigger to generate book barcode on insert
DROP TRIGGER IF EXISTS `generate_book_barcode_on_insert`$$
CREATE TRIGGER `generate_book_barcode_on_insert`
BEFORE INSERT ON `books`
FOR EACH ROW
BEGIN
    IF NEW.barcode IS NULL OR NEW.barcode = '' THEN
        SET NEW.barcode = generate_book_barcode(NEW.number_code);
    END IF;
END$$

-- Trigger to set book status on insert based on available copies
DROP TRIGGER IF EXISTS `set_book_status_on_insert`$$
CREATE TRIGGER `set_book_status_on_insert`
BEFORE INSERT ON `books`
FOR EACH ROW
BEGIN
    IF NEW.available_copies = 0 THEN
        SET NEW.status = 'borrowed';
    ELSEIF NEW.available_copies >= 1 THEN
        SET NEW.status = 'available';
    END IF;
END$$

-- Trigger to update book status when available copies change
DROP TRIGGER IF EXISTS `update_book_status_on_available_copies_change`$$
CREATE TRIGGER `update_book_status_on_available_copies_change`
BEFORE UPDATE ON `books`
FOR EACH ROW
BEGIN
    IF NEW.available_copies = 0 THEN
        SET NEW.status = 'borrowed';
    ELSEIF NEW.available_copies >= 1 THEN
        SET NEW.status = 'available';
    END IF;
END$$

-- Trigger to update book status when borrowed
DROP TRIGGER IF EXISTS `update_book_status_on_borrow`$$
CREATE TRIGGER `update_book_status_on_borrow`
AFTER INSERT ON `borrowing_transactions`
FOR EACH ROW
BEGIN
    UPDATE books
    SET available_copies = available_copies - 1
    WHERE id = NEW.book_id;
END$$

-- Trigger to update book status when returned
DROP TRIGGER IF EXISTS `update_book_status_on_return`$$
CREATE TRIGGER `update_book_status_on_return`
AFTER UPDATE ON `borrowing_transactions`
FOR EACH ROW
BEGIN
    IF NEW.status = 'returned' AND OLD.status != 'returned' THEN
        UPDATE books
        SET available_copies = available_copies + 1
        WHERE id = NEW.book_id;
    END IF;
END$$

-- Trigger to create fine on overdue
DROP TRIGGER IF EXISTS `create_fine_on_overdue`$$
CREATE TRIGGER `create_fine_on_overdue`
AFTER UPDATE ON `borrowing_transactions`
FOR EACH ROW
BEGIN
    IF NEW.status = 'overdue' AND OLD.status != 'overdue' THEN
        -- Create fine record
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

        -- Create overdue history record
        INSERT INTO overdue_history
        (student_id_number, transaction_id, book_title, book_author, book_code,
         borrowed_at, due_date, returned_at, days_overdue, fine_amount, paid_amount,
         returned_by_admin, created_at)
        SELECT
            NEW.student_id_number,
            NEW.id,
            b.title,
            b.author,
            b.number_code,
            NEW.borrowed_date,
            NEW.due_date,
            NULL,
            DATEDIFF(CURDATE(), NEW.due_date),
            DATEDIFF(CURDATE(), NEW.due_date) * COALESCE(ss.setting_value, 5),
            0.00,
            1,
            NOW()
        FROM books b, system_settings ss
        WHERE b.id = NEW.book_id
        AND ss.setting_key = 'fine_per_day'
        LIMIT 1;
    END IF;
END$$

DELIMITER ;

-- ================================================================
-- STEP 11: CREATE VIEWS
-- ================================================================

-- View: Active Borrowing Status
DROP VIEW IF EXISTS `active_borrowing_status`;
CREATE VIEW `active_borrowing_status` AS
SELECT
    u.id_number,
    u.email,
    u.first_name,
    u.last_name,
    COUNT(DISTINCT CASE WHEN bt.status = 'borrowed' THEN bt.id END) AS currently_borrowed,
    COUNT(DISTINCT CASE WHEN bt.status = 'overdue' THEN bt.id END) AS overdue_count,
    COALESCE(SUM(CASE WHEN f.status = 'unpaid' THEN f.fine_amount - f.paid_amount ELSE 0 END), 0) AS unpaid_fine_amount,
    COALESCE(sbs.can_borrow, 1) AS can_borrow,
    sbs.reason AS borrowing_restriction_reason
FROM users u
LEFT JOIN borrowing_transactions bt ON u.id_number = bt.student_id_number
    AND bt.status IN ('borrowed', 'overdue')
    AND bt.returned_date IS NULL
LEFT JOIN fines f ON bt.id = f.transaction_id AND f.status = 'unpaid'
LEFT JOIN student_borrowing_status sbs ON u.id_number = sbs.student_id_number
WHERE u.role = 'student'
GROUP BY u.id_number, u.email, u.first_name, u.last_name, sbs.can_borrow, sbs.reason;

-- View: Barcode Lookup
DROP VIEW IF EXISTS `barcode_lookup`;
CREATE VIEW `barcode_lookup` AS
SELECT
    'book' AS type,
    b.id AS item_id,
    b.barcode,
    b.number_code AS code,
    b.title AS name,
    b.author,
    b.status,
    b.available_copies,
    b.book_copies
FROM books b
UNION ALL
SELECT
    'student' AS type,
    u.id AS item_id,
    u.student_barcode AS barcode,
    u.id_number AS code,
    CONCAT(u.first_name, ' ', u.last_name) AS name,
    NULL AS author,
    CASE WHEN u.is_verified = 1 THEN 'active' ELSE 'inactive' END AS status,
    NULL AS available_copies,
    NULL AS book_copies
FROM users u
WHERE u.role = 'student';

-- View: Overdue Books with Fines
DROP VIEW IF EXISTS `overdue_books_with_fines`;
CREATE VIEW `overdue_books_with_fines` AS
SELECT
    bt.id AS transaction_id,
    u.id_number AS student_id_number,
    u.first_name,
    u.last_name,
    u.email,
    b.id AS book_id,
    b.title AS book_title,
    b.author AS book_author,
    b.number_code AS book_code,
    bt.borrowed_date,
    bt.due_date,
    DATEDIFF(CURDATE(), bt.due_date) AS days_overdue,
    f.fine_amount,
    f.paid_amount,
    (f.fine_amount - f.paid_amount) AS balance,
    f.status AS fine_status,
    bt.status AS transaction_status
FROM borrowing_transactions bt
JOIN users u ON bt.student_id_number = u.id_number
JOIN books b ON bt.book_id = b.id
LEFT JOIN fines f ON bt.id = f.transaction_id
WHERE bt.status = 'overdue' AND bt.returned_date IS NULL;

-- View: Books Needing Notifications
DROP VIEW IF EXISTS `v_books_needing_notifications`;
CREATE VIEW `v_books_needing_notifications` AS
SELECT
    bt.id AS transaction_id,
    u.id AS user_id,
    u.id_number,
    u.email,
    u.first_name,
    u.last_name,
    b.id AS book_id,
    b.title AS book_title,
    b.author,
    bt.due_date,
    DATEDIFF(bt.due_date, CURDATE()) AS days_until_due,
    CASE
        WHEN DATEDIFF(bt.due_date, CURDATE()) < 0 THEN 'overdue'
        WHEN DATEDIFF(bt.due_date, CURDATE()) = 0 THEN 'due_today'
        ELSE 'due_soon'
    END AS notification_type,
    COALESCE(np.days_before_due, 3) AS reminder_days,
    COALESCE(np.push_enabled, 1) AS push_enabled,
    COALESCE(np.email_enabled, 1) AS email_enabled,
    COALESCE(np.notify_overdue, 1) AS notify_overdue,
    COALESCE(np.notify_due_today, 1) AS notify_due_today,
    COALESCE(np.notify_due_soon, 1) AS notify_due_soon
FROM borrowing_transactions bt
JOIN users u ON bt.student_id_number = u.id_number
JOIN books b ON bt.book_id = b.id
LEFT JOIN notification_preferences np ON u.id = np.user_id
WHERE bt.status IN ('borrowed', 'overdue')
    AND bt.returned_date IS NULL
    AND u.is_verified = 1;

-- ================================================================
-- VERIFICATION QUERY
-- ================================================================

-- Show all tables in database
SELECT TABLE_NAME, TABLE_ROWS,
       ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;

-- Show all foreign key relationships
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
    AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME;

COMMIT;

-- ================================================================
-- SCHEMA CREATION COMPLETED SUCCESSFULLY
-- ================================================================

SELECT 'Database schema created successfully! All tables, relationships, triggers, and views are now in place.' AS Status;
