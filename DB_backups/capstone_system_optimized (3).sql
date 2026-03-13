-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 26, 2026 at 08:14 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `capstone_system_optimized`
--

DELIMITER $$
--
-- Functions
--
CREATE DEFINER=`root`@`localhost` FUNCTION `generate_book_barcode` (`book_code` VARCHAR(20)) RETURNS VARCHAR(50) CHARSET utf8mb4 COLLATE utf8mb4_general_ci DETERMINISTIC READS SQL DATA BEGIN
    DECLARE barcode VARCHAR(50);
    SET barcode = CONCAT('BOOK-', book_code);
    RETURN barcode;
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `generate_student_barcode` (`student_id` VARCHAR(10)) RETURNS VARCHAR(50) CHARSET utf8mb4 COLLATE utf8mb4_general_ci DETERMINISTIC READS SQL DATA BEGIN
    DECLARE barcode VARCHAR(50);
    SET barcode = CONCAT('STU-', student_id);
    RETURN barcode;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `academic_years`
--

CREATE TABLE `academic_years` (
  `id` int(11) NOT NULL,
  `year_name` varchar(20) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_current` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `academic_years`
--

INSERT INTO `academic_years` (`id`, `year_name`, `start_date`, `end_date`, `is_current`, `created_at`, `updated_at`) VALUES
(1, '2020-2021', '2020-08-01', '2021-05-31', 0, '2026-01-23 09:13:55', '2026-01-23 09:13:55'),
(2, '2021-2022', '2021-08-01', '2022-05-31', 0, '2026-01-23 09:13:55', '2026-01-23 09:13:55'),
(3, '2022-2023', '2022-08-01', '2023-05-31', 0, '2026-01-23 09:13:55', '2026-01-23 09:13:55'),
(4, '2023-2024', '2023-08-01', '2024-05-31', 0, '2026-01-23 09:13:55', '2026-01-23 09:13:55'),
(5, '2024-2025', '2024-08-01', '2025-05-31', 0, '2026-01-23 09:13:55', '2026-01-23 09:13:55'),
(6, '2025-2026', '2025-08-01', '2026-05-31', 1, '2026-01-23 09:13:55', '2026-01-23 09:13:55');

-- --------------------------------------------------------

--
-- Stand-in structure for view `active_borrowing_status`
-- (See below for the actual view)
--
CREATE TABLE `active_borrowing_status` (
`id_number` varchar(10)
,`email` varchar(255)
,`first_name` varchar(100)
,`last_name` varchar(100)
,`currently_borrowed` bigint(21)
,`overdue_count` bigint(21)
,`unpaid_fine_amount` decimal(33,2)
,`can_borrow` int(4)
,`borrowing_restriction_reason` text
);

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(100) DEFAULT NULL,
  `record_id` int(11) DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `barcode_lookup`
-- (See below for the actual view)
--
CREATE TABLE `barcode_lookup` (
`type` varchar(7)
,`item_id` int(11)
,`barcode` varchar(50)
,`code` varchar(20)
,`name` varchar(255)
,`author` varchar(255)
,`status` varchar(11)
,`available_copies` int(11)
,`book_copies` int(11)
);

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `id` int(11) NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`id`, `title`, `author`, `isbn`, `number_code`, `barcode`, `category`, `publisher`, `publication_year`, `pages`, `description`, `status`, `book_copies`, `available_copies`, `created_at`, `updated_at`) VALUES
(1, 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '978-0132350884', 'IT-001', 'BOOK-IT-001', 'Programming', 'Prentice Hall', '2008', 464, 'A handbook of agile software craftsmanship with practical advice on writing clean, maintainable code.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:27:13'),
(2, 'The Pragmatic Programmer: Your Journey to Mastery', 'David Thomas & Andrew Hunt', '978-0135957059', 'IT-002', 'BOOK-IT-002', 'Programming', 'Addison-Wesley', '2019', 352, 'A guide to becoming a better programmer through practical advice and tips.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:27:11'),
(3, 'JavaScript: The Good Parts', 'Douglas Crockford', '978-0596517748', 'IT-003', 'BOOK-IT-003', 'Programming', 'O\'Reilly Media', '2008', 176, 'A deep dive into the best features of JavaScript programming language.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:27:15'),
(4, 'Python Crash Course', 'Eric Matthes', '978-1593279288', 'IT-004', 'BOOK-IT-004', 'Programming', 'No Starch Press', '2019', 544, 'A hands-on, project-based introduction to Python programming.', 'available', 6, 6, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(5, 'Eloquent JavaScript', 'Marijn Haverbeke', '978-1593279509', 'IT-005', 'BOOK-IT-005', 'Programming', 'No Starch Press', '2018', 472, 'A modern introduction to programming with JavaScript.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(6, 'Learning Python', 'Mark Lutz', '978-1449355739', 'IT-006', 'BOOK-IT-006', 'Programming', 'O\'Reilly Media', '2013', 1648, 'Comprehensive guide to learning Python programming from scratch.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(7, 'Java: The Complete Reference', 'Herbert Schildt', '978-1260440232', 'IT-007', 'BOOK-IT-007', 'Programming', 'McGraw-Hill', '2021', 1248, 'The definitive guide to Java programming language.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(8, 'C Programming Language', 'Brian W. Kernighan & Dennis M. Ritchie', '978-0131103627', 'IT-008', 'BOOK-IT-008', 'Programming', 'Prentice Hall', '1988', 272, 'The classic guide to C programming by its creators.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(9, 'Effective Java', 'Joshua Bloch', '978-0134685991', 'IT-009', 'BOOK-IT-009', 'Programming', 'Addison-Wesley', '2017', 416, 'Best practices for the Java platform.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(10, 'You Don\'t Know JS: Scope & Closures', 'Kyle Simpson', '978-1491904152', 'IT-010', 'BOOK-IT-010', 'Programming', 'O\'Reilly Media', '2014', 98, 'Deep dive into JavaScript scope and closures.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(11, 'Learning React', 'Alex Banks & Eve Porcello', '978-1492051725', 'IT-011', 'BOOK-IT-011', 'Web Development', 'O\'Reilly Media', '2020', 310, 'Modern patterns for developing React apps.', 'available', 6, 6, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(12, 'Node.js Design Patterns', 'Mario Casciaro', '978-1839214110', 'IT-012', 'BOOK-IT-012', 'Web Development', 'Packt Publishing', '2020', 664, 'Design and implement production-grade Node.js applications.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(13, 'Full-Stack React, TypeScript, and Node', 'David Choi', '978-1839219931', 'IT-013', 'BOOK-IT-013', 'Web Development', 'Packt Publishing', '2020', 648, 'Build cloud-ready web applications using React, TypeScript, and Node.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(14, 'HTML and CSS: Design and Build Websites', 'Jon Duckett', '978-1118008188', 'IT-014', 'BOOK-IT-014', 'Web Development', 'Wiley', '2011', 490, 'A beautifully designed introduction to HTML and CSS.', 'available', 6, 6, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(15, 'CSS: The Definitive Guide', 'Eric A. Meyer', '978-1449393199', 'IT-015', 'BOOK-IT-015', 'Web Development', 'O\'Reilly Media', '2017', 1090, 'Visual presentation for the web using CSS.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(16, 'Vue.js: Up and Running', 'Callum Macrae', '978-1491997246', 'IT-016', 'BOOK-IT-016', 'Web Development', 'O\'Reilly Media', '2018', 174, 'Building accessible and performant web apps with Vue.js.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(17, 'Angular: Up and Running', 'Shyam Seshadri', '978-1491999837', 'IT-017', 'BOOK-IT-017', 'Web Development', 'O\'Reilly Media', '2018', 312, 'Learning Angular step by step.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(18, 'RESTful Web APIs', 'Leonard Richardson', '978-1449358068', 'IT-018', 'BOOK-IT-018', 'Web Development', 'O\'Reilly Media', '2013', 406, 'Services for a changing world using REST APIs.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(19, 'Web Development with Node and Express', 'Ethan Brown', '978-1492053514', 'IT-019', 'BOOK-IT-019', 'Web Development', 'O\'Reilly Media', '2019', 347, 'Leveraging the JavaScript stack for web development.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(20, 'PHP & MySQL: Server-side Web Development', 'Jon Duckett', '978-1119149224', 'IT-020', 'BOOK-IT-020', 'Web Development', 'Wiley', '2022', 672, 'Learn server-side web development with PHP and MySQL.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(21, 'Introduction to Algorithms', 'Thomas H. Cormen', '978-0262033848', 'IT-021', 'BOOK-IT-021', 'Algorithms', 'MIT Press', '2009', 1312, 'The comprehensive textbook covering a broad range of algorithms.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(22, 'Cracking the Coding Interview', 'Gayle Laakmann McDowell', '978-0984782857', 'IT-022', 'BOOK-IT-022', 'Algorithms', 'CareerCup', '2015', 708, '189 programming questions and solutions for technical interviews.', 'available', 6, 6, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(23, 'The Algorithm Design Manual', 'Steven S. Skiena', '978-3030542559', 'IT-023', 'BOOK-IT-023', 'Algorithms', 'Springer', '2020', 810, 'Practical guide to algorithm design and analysis.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(24, 'Data Structures and Algorithms in Java', 'Robert Lafore', '978-0672324536', 'IT-024', 'BOOK-IT-024', 'Algorithms', 'Sams Publishing', '2002', 800, 'Learn data structures and algorithms using Java.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(25, 'Grokking Algorithms', 'Aditya Bhargava', '978-1617292231', 'IT-025', 'BOOK-IT-025', 'Algorithms', 'Manning', '2016', 256, 'An illustrated guide for programmers and curious people.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(26, 'Database System Concepts', 'Abraham Silberschatz', '978-0078022159', 'IT-026', 'BOOK-IT-026', 'Database', 'McGraw-Hill', '2019', 1376, 'Comprehensive guide to database management systems.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(27, 'Learning SQL', 'Alan Beaulieu', '978-1492057611', 'IT-027', 'BOOK-IT-027', 'Database', 'O\'Reilly Media', '2020', 378, 'Generate, manipulate, and retrieve data using SQL.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(28, 'MongoDB: The Definitive Guide', 'Shannon Bradshaw', '978-1491954461', 'IT-028', 'BOOK-IT-028', 'Database', 'O\'Reilly Media', '2019', 514, 'Powerful and scalable data storage with MongoDB.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(29, 'High Performance MySQL', 'Baron Schwartz', '978-1492080510', 'IT-029', 'BOOK-IT-029', 'Database', 'O\'Reilly Media', '2021', 800, 'Optimization, backups, and replication for MySQL.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(30, 'PostgreSQL: Up and Running', 'Regina O. Obe', '978-1491963418', 'IT-030', 'BOOK-IT-030', 'Database', 'O\'Reilly Media', '2017', 315, 'A practical guide to the advanced open source database.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(31, 'Operating System Concepts', 'Abraham Silberschatz', '978-1119800361', 'IT-031', 'BOOK-IT-031', 'Operating Systems', 'Wiley', '2021', 1040, 'Comprehensive textbook on operating systems principles.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(32, 'Computer Networks', 'Andrew S. Tanenbaum', '978-0132126953', 'IT-032', 'BOOK-IT-032', 'Networking', 'Pearson', '2010', 960, 'Thorough introduction to computer networks and protocols.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(33, 'Linux Command Line and Shell Scripting Bible', 'Richard Blum', '978-1119700913', 'IT-033', 'BOOK-IT-033', 'Operating Systems', 'Wiley', '2021', 816, 'Comprehensive guide to Linux command line and scripting.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(34, 'The Linux Programming Interface', 'Michael Kerrisk', '978-1593272203', 'IT-034', 'BOOK-IT-034', 'Operating Systems', 'No Starch Press', '2010', 1552, 'A Linux and UNIX system programming handbook.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(35, 'TCP/IP Illustrated, Volume 1', 'Kevin R. Fall', '978-0321336316', 'IT-035', 'BOOK-IT-035', 'Networking', 'Addison-Wesley', '2011', 1056, 'The protocols of TCP/IP explained.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(36, 'Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma', '978-0201633610', 'IT-036', 'BOOK-IT-036', 'Software Engineering', 'Addison-Wesley', '1994', 416, 'Classic book on software design patterns.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(37, 'Software Engineering', 'Ian Sommerville', '978-0133943030', 'IT-037', 'BOOK-IT-037', 'Software Engineering', 'Pearson', '2015', 816, 'Comprehensive introduction to software engineering practices.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(38, 'Head First Design Patterns', 'Eric Freeman & Elisabeth Robson', '978-1492078005', 'IT-038', 'BOOK-IT-038', 'Software Engineering', 'O\'Reilly Media', '2020', 672, 'A brain-friendly guide to design patterns.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(39, 'Refactoring: Improving the Design of Existing Code', 'Martin Fowler', '978-0134757599', 'IT-039', 'BOOK-IT-039', 'Software Engineering', 'Addison-Wesley', '2018', 448, 'Improving code design without changing behavior.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(40, 'Domain-Driven Design', 'Eric Evans', '978-0321125217', 'IT-040', 'BOOK-IT-040', 'Software Engineering', 'Addison-Wesley', '2003', 560, 'Tackling complexity in the heart of software.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(41, 'Artificial Intelligence: A Modern Approach', 'Stuart Russell & Peter Norvig', '978-0136042594', 'IT-041', 'BOOK-IT-041', 'Artificial Intelligence', 'Pearson', '2020', 1136, 'The leading textbook on AI used worldwide.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(42, 'Deep Learning', 'Ian Goodfellow', '978-0262035613', 'IT-042', 'BOOK-IT-042', 'Machine Learning', 'MIT Press', '2016', 800, 'Comprehensive textbook on deep learning.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(43, 'Hands-On Machine Learning with Scikit-Learn and TensorFlow', 'Aurelien Geron', '978-1492032649', 'IT-043', 'BOOK-IT-043', 'Machine Learning', 'O\'Reilly Media', '2019', 856, 'Concepts, tools, and techniques to build intelligent systems.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(44, 'Python Machine Learning', 'Sebastian Raschka', '978-1789955750', 'IT-044', 'BOOK-IT-044', 'Machine Learning', 'Packt Publishing', '2019', 772, 'Machine learning and deep learning with Python.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(45, 'Natural Language Processing with Python', 'Steven Bird', '978-0596516499', 'IT-045', 'BOOK-IT-045', 'Machine Learning', 'O\'Reilly Media', '2009', 504, 'Analyzing text with the Natural Language Toolkit.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(46, 'The Web Application Hacker\'s Handbook', 'Dafydd Stuttard', '978-1118026472', 'IT-046', 'BOOK-IT-046', 'Cybersecurity', 'Wiley', '2011', 912, 'Finding and exploiting security flaws in web applications.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(47, 'Hacking: The Art of Exploitation', 'Jon Erickson', '978-1593271442', 'IT-047', 'BOOK-IT-047', 'Cybersecurity', 'No Starch Press', '2008', 488, 'Introduction to hacking and exploitation techniques.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(48, 'Network Security Essentials', 'William Stallings', '978-0134527338', 'IT-048', 'BOOK-IT-048', 'Cybersecurity', 'Pearson', '2016', 448, 'Applications and standards for network security.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(49, 'Practical Malware Analysis', 'Michael Sikorski', '978-1593272906', 'IT-049', 'BOOK-IT-049', 'Cybersecurity', 'No Starch Press', '2012', 800, 'The hands-on guide to dissecting malicious software.', 'available', 3, 3, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(50, 'Cryptography and Network Security', 'William Stallings', '978-0134444284', 'IT-050', 'BOOK-IT-050', 'Cybersecurity', 'Pearson', '2016', 752, 'Principles and practice of cryptography.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(51, 'Docker Deep Dive', 'Nigel Poulton', '978-1521822807', 'IT-051', 'BOOK-IT-051', 'DevOps', 'Independently Published', '2020', 368, 'Comprehensive guide to Docker containers.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(52, 'Kubernetes: Up and Running', 'Brendan Burns', '978-1492046530', 'IT-052', 'BOOK-IT-052', 'DevOps', 'O\'Reilly Media', '2019', 278, 'Dive into the future of infrastructure with Kubernetes.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(53, 'The DevOps Handbook', 'Gene Kim', '978-1942788003', 'IT-053', 'BOOK-IT-053', 'DevOps', 'IT Revolution Press', '2016', 480, 'How to create world-class agility and reliability.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(54, 'Site Reliability Engineering', 'Betsy Beyer', '978-1491929124', 'IT-054', 'BOOK-IT-054', 'DevOps', 'O\'Reilly Media', '2016', 552, 'How Google runs production systems.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(55, 'AWS Certified Solutions Architect Study Guide', 'Ben Piper', '978-1119713081', 'IT-055', 'BOOK-IT-055', 'Cloud Computing', 'Sybex', '2021', 1056, 'AWS certification exam preparation guide.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(56, 'React Native in Action', 'Nader Dabit', '978-1617294051', 'IT-056', 'BOOK-IT-056', 'Mobile Development', 'Manning', '2019', 320, 'Developing iOS and Android apps with JavaScript.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(57, 'Android Programming: The Big Nerd Ranch Guide', 'Bill Phillips', '978-0135245125', 'IT-057', 'BOOK-IT-057', 'Mobile Development', 'Big Nerd Ranch', '2019', 624, 'Comprehensive guide to Android development.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(58, 'iOS Programming: The Big Nerd Ranch Guide', 'Christian Keur', '978-0135264027', 'IT-058', 'BOOK-IT-058', 'Mobile Development', 'Big Nerd Ranch', '2020', 416, 'Comprehensive guide to iOS development.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(59, 'Flutter in Action', 'Eric Windmill', '978-1617296147', 'IT-059', 'BOOK-IT-059', 'Mobile Development', 'Manning', '2020', 368, 'Build cross-platform mobile apps with Flutter.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(60, 'Kotlin in Action', 'Dmitry Jemerov', '978-1617293290', 'IT-060', 'BOOK-IT-060', 'Mobile Development', 'Manning', '2017', 360, 'Learn Kotlin programming for Android and beyond.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(61, 'Computer Organization and Design', 'David A. Patterson', '978-0128201091', 'IT-061', 'BOOK-IT-061', 'Computer Architecture', 'Morgan Kaufmann', '2020', 800, 'The hardware/software interface explained.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(62, 'Structured Computer Organization', 'Andrew S. Tanenbaum', '978-0132916523', 'IT-062', 'BOOK-IT-062', 'Computer Architecture', 'Pearson', '2012', 800, 'A structured approach to computer architecture.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(63, 'Computer Architecture: A Quantitative Approach', 'John L. Hennessy', '978-0128119051', 'IT-063', 'BOOK-IT-063', 'Computer Architecture', 'Morgan Kaufmann', '2017', 936, 'The quantitative approach to computer architecture.', 'available', 3, 3, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(64, 'Digital Design and Computer Architecture', 'David Harris', '978-0128000564', 'IT-064', 'BOOK-IT-064', 'Computer Architecture', 'Morgan Kaufmann', '2015', 586, 'From gates to processors with ARM edition.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(65, 'Code: The Hidden Language of Computer Hardware and Software', 'Charles Petzold', '978-0735611313', 'IT-065', 'BOOK-IT-065', 'Computer Architecture', 'Microsoft Press', '2000', 400, 'Understanding how computers work at the fundamental level.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(66, 'Pro Git', 'Scott Chacon', '978-1484200773', 'IT-066', 'BOOK-IT-066', 'Tools', 'Apress', '2014', 456, 'Everything you need to know about Git.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(67, 'Learning the vi and Vim Editors', 'Arnold Robbins', '978-0596529833', 'IT-067', 'BOOK-IT-067', 'Tools', 'O\'Reilly Media', '2008', 494, 'Power and agility beyond just text editing.', 'available', 3, 3, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(68, 'Practical Vim', 'Drew Neil', '978-1680501278', 'IT-068', 'BOOK-IT-068', 'Tools', 'Pragmatic Bookshelf', '2015', 354, 'Edit text at the speed of thought.', 'available', 3, 3, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(69, 'Visual Studio Code Distilled', 'Alessandro Del Sole', '978-1484242230', 'IT-069', 'BOOK-IT-069', 'Tools', 'Apress', '2019', 126, 'Evolved code editing meets IDE.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(70, 'The Art of Command Line', 'Joshua Levy', '978-1098109974', 'IT-070', 'BOOK-IT-070', 'Tools', 'O\'Reilly Media', '2022', 200, 'Master the command line in one page.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(71, 'Test Driven Development: By Example', 'Kent Beck', '978-0321146533', 'IT-071', 'BOOK-IT-071', 'Testing', 'Addison-Wesley', '2002', 240, 'The definitive guide to test-driven development.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(72, 'The Art of Software Testing', 'Glenford J. Myers', '978-1118031964', 'IT-072', 'BOOK-IT-072', 'Testing', 'Wiley', '2011', 256, 'Fundamental testing concepts and techniques.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(73, 'Continuous Delivery', 'Jez Humble', '978-0321601919', 'IT-073', 'BOOK-IT-073', 'DevOps', 'Addison-Wesley', '2010', 512, 'Reliable software releases through automation.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(74, 'Growing Object-Oriented Software, Guided by Tests', 'Steve Freeman', '978-0321503626', 'IT-074', 'BOOK-IT-074', 'Testing', 'Addison-Wesley', '2009', 384, 'Using tests to guide software development.', 'available', 3, 3, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(75, 'Unit Testing Principles, Practices, and Patterns', 'Vladimir Khorikov', '978-1617296277', 'IT-075', 'BOOK-IT-075', 'Testing', 'Manning', '2020', 304, 'Effective testing practices for developers.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(76, 'Python for Data Analysis', 'Wes McKinney', '978-1491957660', 'IT-076', 'BOOK-IT-076', 'Data Science', 'O\'Reilly Media', '2017', 550, 'Data wrangling with Pandas, NumPy, and IPython.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(77, 'R for Data Science', 'Hadley Wickham', '978-1491910399', 'IT-077', 'BOOK-IT-077', 'Data Science', 'O\'Reilly Media', '2017', 522, 'Import, tidy, transform, visualize, and model data.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(78, 'Data Science from Scratch', 'Joel Grus', '978-1492041139', 'IT-078', 'BOOK-IT-078', 'Data Science', 'O\'Reilly Media', '2019', 406, 'First principles with Python for data science.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(79, 'Storytelling with Data', 'Cole Nussbaumer Knaflic', '978-1119002253', 'IT-079', 'BOOK-IT-079', 'Data Science', 'Wiley', '2015', 288, 'A data visualization guide for business professionals.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(80, 'The Data Warehouse Toolkit', 'Ralph Kimball', '978-1118530801', 'IT-080', 'BOOK-IT-080', 'Data Science', 'Wiley', '2013', 600, 'The definitive guide to dimensional modeling.', 'available', 3, 3, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(81, 'Game Programming Patterns', 'Robert Nystrom', '978-0990582908', 'IT-081', 'BOOK-IT-081', 'Game Development', 'Genever Benning', '2014', 354, 'Design patterns for game development.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(82, 'Unity in Action', 'Joe Hocking', '978-1617299339', 'IT-082', 'BOOK-IT-082', 'Game Development', 'Manning', '2022', 400, 'Multiplatform game development with Unity.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(83, 'Beginning C++ Through Game Programming', 'Michael Dawson', '978-1305109919', 'IT-083', 'BOOK-IT-083', 'Game Development', 'Cengage Learning', '2014', 432, 'Learn C++ through game programming concepts.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(84, 'Real-Time Rendering', 'Tomas Akenine-Moller', '978-1138627000', 'IT-084', 'BOOK-IT-084', 'Game Development', 'CRC Press', '2018', 1198, 'Comprehensive guide to real-time 3D graphics.', 'available', 3, 3, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(85, 'Unreal Engine 4 Game Development Essentials', 'Satheesh PV', '978-1784391966', 'IT-085', 'BOOK-IT-085', 'Game Development', 'Packt Publishing', '2016', 244, 'Master Unreal Engine 4 game development.', 'available', 3, 3, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(86, 'The Complete Software Developer\'s Career Guide', 'John Sonmez', '978-0999081419', 'IT-086', 'BOOK-IT-086', 'Career', 'Simple Programmer', '2017', 798, 'Career advice for software developers.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(87, 'Soft Skills: The Software Developer\'s Life Manual', 'John Sonmez', '978-1617292392', 'IT-087', 'BOOK-IT-087', 'Career', 'Manning', '2014', 504, 'Life advice for software developers.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(88, 'The Mythical Man-Month', 'Frederick P. Brooks Jr.', '978-0201835953', 'IT-088', 'BOOK-IT-088', 'Software Engineering', 'Addison-Wesley', '1995', 336, 'Essays on software engineering and project management.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(89, 'Peopleware: Productive Projects and Teams', 'Tom DeMarco', '978-0321934116', 'IT-089', 'BOOK-IT-089', 'Career', 'Addison-Wesley', '2013', 272, 'The human side of software development.', 'available', 3, 3, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(90, 'The Phoenix Project', 'Gene Kim', '978-1942788294', 'IT-090', 'BOOK-IT-090', 'DevOps', 'IT Revolution Press', '2018', 432, 'A novel about IT, DevOps, and helping your business win.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(91, 'Mastering Bitcoin', 'Andreas M. Antonopoulos', '978-1491954386', 'IT-091', 'BOOK-IT-091', 'Blockchain', 'O\'Reilly Media', '2017', 416, 'Programming the open blockchain with Bitcoin.', 'available', 3, 3, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(92, 'Mastering Ethereum', 'Andreas M. Antonopoulos', '978-1491971949', 'IT-092', 'BOOK-IT-092', 'Blockchain', 'O\'Reilly Media', '2018', 424, 'Building smart contracts and DApps on Ethereum.', 'available', 3, 3, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(93, 'Blockchain Basics', 'Daniel Drescher', '978-1484226032', 'IT-093', 'BOOK-IT-093', 'Blockchain', 'Apress', '2017', 276, 'A non-technical introduction to blockchain.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(94, 'The Internet of Things', 'Samuel Greengard', '978-0262527736', 'IT-094', 'BOOK-IT-094', 'IoT', 'MIT Press', '2015', 232, 'Understanding the connected world of IoT.', 'available', 3, 3, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(95, 'Building the Web of Things', 'Dominique Guinard', '978-1617292682', 'IT-095', 'BOOK-IT-095', 'IoT', 'Manning', '2016', 344, 'Connect smart things to the web.', 'available', 3, 3, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(96, 'Discrete Mathematics and Its Applications', 'Kenneth H. Rosen', '978-0073383095', 'IT-096', 'BOOK-IT-096', 'Mathematics', 'McGraw-Hill', '2018', 1104, 'Foundations of discrete math for computer science.', 'available', 5, 5, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(97, 'Linear Algebra and Its Applications', 'David C. Lay', '978-0321982384', 'IT-097', 'BOOK-IT-097', 'Mathematics', 'Pearson', '2015', 576, 'Modern introduction to linear algebra.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(98, 'Concrete Mathematics', 'Ronald L. Graham', '978-0201558029', 'IT-098', 'BOOK-IT-098', 'Mathematics', 'Addison-Wesley', '1994', 672, 'A foundation for computer science mathematics.', 'available', 3, 3, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(99, 'Statistics for Machine Learning', 'Pratap Dangeti', '978-1788295758', 'IT-099', 'BOOK-IT-099', 'Mathematics', 'Packt Publishing', '2017', 442, 'Statistical techniques for machine learning.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(100, 'Mathematics for Computer Science', 'Eric Lehman', '978-1680921229', 'IT-100', 'BOOK-IT-100', 'Mathematics', 'Samurai Media', '2017', 988, 'Mathematical foundations for CS students.', 'available', 4, 4, '2026-01-24 06:00:52', '2026-01-24 06:00:52'),
(101, 'Structure and Interpretation of Computer Programs', 'Harold Abelson', '978-0262510875', 'IT-101', 'BOOK-IT-101', 'Programming', 'MIT Press', '1996', 657, 'Classic text on computer science fundamentals using Scheme.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(102, 'Programming Pearls', 'Jon Bentley', '978-0201657883', 'IT-102', 'BOOK-IT-102', 'Programming', 'Addison-Wesley', '1999', 256, 'A collection of essays on programming problems and solutions.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(103, 'The C++ Programming Language', 'Bjarne Stroustrup', '978-0321958327', 'IT-103', 'BOOK-IT-103', 'Programming', 'Addison-Wesley', '2013', 1376, 'The definitive guide to C++ by its creator.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(104, 'Effective Modern C++', 'Scott Meyers', '978-1491903995', 'IT-104', 'BOOK-IT-104', 'Programming', 'O\'Reilly Media', '2014', 334, '42 specific ways to improve your use of C++11 and C++14.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(105, 'Go Programming Language', 'Alan A. A. Donovan', '978-0134190440', 'IT-105', 'BOOK-IT-105', 'Programming', 'Addison-Wesley', '2015', 400, 'Authoritative guide to the Go programming language.', 'available', 5, 5, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(106, 'Rust Programming Language', 'Steve Klabnik', '978-1718500440', 'IT-106', 'BOOK-IT-106', 'Programming', 'No Starch Press', '2019', 560, 'The official book on Rust programming.', 'available', 5, 5, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(107, 'Programming in Scala', 'Martin Odersky', '978-0981531687', 'IT-107', 'BOOK-IT-107', 'Programming', 'Artima', '2021', 892, 'Comprehensive guide to Scala programming.', 'available', 3, 3, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(108, 'Functional Programming in Scala', 'Paul Chiusano', '978-1617290657', 'IT-108', 'BOOK-IT-108', 'Programming', 'Manning', '2014', 320, 'Learn functional programming with Scala.', 'available', 3, 3, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(109, 'TypeScript Quickly', 'Yakov Fain', '978-1617295942', 'IT-109', 'BOOK-IT-109', 'Programming', 'Manning', '2020', 488, 'Practical guide to TypeScript development.', 'available', 5, 5, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(110, 'Fluent Python', 'Luciano Ramalho', '978-1492056355', 'IT-110', 'BOOK-IT-110', 'Programming', 'O\'Reilly Media', '2022', 1014, 'Clear, concise, and effective programming in Python.', 'available', 5, 5, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(111, 'Fullstack React', 'Anthony Accomazzo', '978-0991344628', 'IT-111', 'BOOK-IT-111', 'Web Development', 'Fullstack.io', '2019', 836, 'The complete guide to ReactJS and friends.', 'available', 5, 5, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(112, 'Next.js in Action', 'Adam Boduch', '978-1617299193', 'IT-112', 'BOOK-IT-112', 'Web Development', 'Manning', '2023', 352, 'Build server-rendered React applications with Next.js.', 'available', 5, 5, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(113, 'Svelte and Sapper in Action', 'Mark Volkmann', '978-1617297946', 'IT-113', 'BOOK-IT-113', 'Web Development', 'Manning', '2020', 456, 'Build fast web applications with Svelte.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(114, 'GraphQL in Action', 'Samer Buna', '978-1617295683', 'IT-114', 'BOOK-IT-114', 'Web Development', 'Manning', '2021', 384, 'Build data-driven applications with GraphQL.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(115, 'Django for Professionals', 'William S. Vincent', '978-1735467238', 'IT-115', 'BOOK-IT-115', 'Web Development', 'WelcomeToCode', '2022', 380, 'Production websites with Python and Django.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(116, 'Flask Web Development', 'Miguel Grinberg', '978-1491991732', 'IT-116', 'BOOK-IT-116', 'Web Development', 'O\'Reilly Media', '2018', 316, 'Developing web applications with Python and Flask.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(117, 'Spring Boot in Action', 'Craig Walls', '978-1617292545', 'IT-117', 'BOOK-IT-117', 'Web Development', 'Manning', '2015', 264, 'Build Spring applications faster with Spring Boot.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(118, 'ASP.NET Core in Action', 'Andrew Lock', '978-1617298301', 'IT-118', 'BOOK-IT-118', 'Web Development', 'Manning', '2021', 832, 'Build web applications with ASP.NET Core.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(119, 'Ruby on Rails Tutorial', 'Michael Hartl', '978-0134598628', 'IT-119', 'BOOK-IT-119', 'Web Development', 'Addison-Wesley', '2020', 816, 'Learn web development with Rails.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(120, 'Laravel: Up & Running', 'Matt Stauffer', '978-1492041214', 'IT-120', 'BOOK-IT-120', 'Web Development', 'O\'Reilly Media', '2019', 558, 'A framework for building modern PHP apps.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(121, 'Pattern Recognition and Machine Learning', 'Christopher M. Bishop', '978-0387310732', 'IT-121', 'BOOK-IT-121', 'Machine Learning', 'Springer', '2006', 738, 'Comprehensive introduction to pattern recognition and ML.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(122, 'Machine Learning: A Probabilistic Perspective', 'Kevin P. Murphy', '978-0262018029', 'IT-122', 'BOOK-IT-122', 'Machine Learning', 'MIT Press', '2012', 1104, 'Unified, probabilistic approach to machine learning.', 'available', 3, 3, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(123, 'Reinforcement Learning: An Introduction', 'Richard S. Sutton', '978-0262039246', 'IT-123', 'BOOK-IT-123', 'Machine Learning', 'MIT Press', '2018', 552, 'The definitive introduction to reinforcement learning.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(124, 'Deep Learning with Python', 'Francois Chollet', '978-1617296864', 'IT-124', 'BOOK-IT-124', 'Machine Learning', 'Manning', '2021', 504, 'Deep learning with Keras by its creator.', 'available', 5, 5, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(125, 'Generative Deep Learning', 'David Foster', '978-1492041948', 'IT-125', 'BOOK-IT-125', 'Machine Learning', 'O\'Reilly Media', '2019', 330, 'Teaching machines to paint, write, compose, and play.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(126, 'Building Machine Learning Powered Applications', 'Emmanuel Ameisen', '978-1492045113', 'IT-126', 'BOOK-IT-126', 'Machine Learning', 'O\'Reilly Media', '2020', 260, 'Going from idea to product with ML applications.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(127, 'Practical Deep Learning for Cloud, Mobile, and Edge', 'Anirudh Koul', '978-1492034865', 'IT-127', 'BOOK-IT-127', 'Machine Learning', 'O\'Reilly Media', '2019', 620, 'Real-world AI and computer vision projects.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(128, 'TinyML', 'Pete Warden', '978-1492052043', 'IT-128', 'BOOK-IT-128', 'Machine Learning', 'O\'Reilly Media', '2019', 504, 'Machine learning with TensorFlow Lite on microcontrollers.', 'available', 3, 3, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(129, 'Transformers for Natural Language Processing', 'Denis Rothman', '978-1803247335', 'IT-129', 'BOOK-IT-129', 'Machine Learning', 'Packt Publishing', '2022', 564, 'Build and deploy transformer models for NLP.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(130, 'Computer Vision: Algorithms and Applications', 'Richard Szeliski', '978-3030343712', 'IT-130', 'BOOK-IT-130', 'Artificial Intelligence', 'Springer', '2022', 925, 'Comprehensive guide to computer vision algorithms.', 'available', 3, 3, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(131, 'Cloud Native Patterns', 'Cornelia Davis', '978-1617294297', 'IT-131', 'BOOK-IT-131', 'Cloud Computing', 'Manning', '2019', 400, 'Designing change-tolerant software for cloud applications.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(132, 'Terraform: Up & Running', 'Yevgeniy Brikman', '978-1492046905', 'IT-132', 'BOOK-IT-132', 'DevOps', 'O\'Reilly Media', '2022', 458, 'Writing infrastructure as code with Terraform.', 'available', 5, 5, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(133, 'Ansible: Up and Running', 'Bas Meijer', '978-1098109158', 'IT-133', 'BOOK-IT-133', 'DevOps', 'O\'Reilly Media', '2022', 524, 'Automating configuration management with Ansible.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(134, 'Google Cloud Platform in Action', 'JJ Geewax', '978-1617293528', 'IT-134', 'BOOK-IT-134', 'Cloud Computing', 'Manning', '2018', 632, 'Build applications on Google Cloud Platform.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(135, 'Azure in Action', 'Chris Hay', '978-1617295997', 'IT-135', 'BOOK-IT-135', 'Cloud Computing', 'Manning', '2021', 472, 'Build and manage cloud applications on Azure.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(136, 'Prometheus: Up & Running', 'Brian Brazil', '978-1492034148', 'IT-136', 'BOOK-IT-136', 'DevOps', 'O\'Reilly Media', '2018', 372, 'Infrastructure and application performance monitoring.', 'available', 3, 3, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(137, 'Istio in Action', 'Christian E. Posta', '978-1617295829', 'IT-137', 'BOOK-IT-137', 'DevOps', 'Manning', '2022', 480, 'Service mesh for microservices with Istio.', 'available', 3, 3, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(138, 'Cloud Native DevOps with Kubernetes', 'John Arundel', '978-1492040767', 'IT-138', 'BOOK-IT-138', 'DevOps', 'O\'Reilly Media', '2019', 346, 'Building, deploying, and scaling modern applications.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(139, 'Learning Helm', 'Matt Butcher', '978-1492083658', 'IT-139', 'BOOK-IT-139', 'DevOps', 'O\'Reilly Media', '2021', 262, 'Managing apps on Kubernetes with Helm.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(140, 'GitOps and Kubernetes', 'Billy Yuen', '978-1617297274', 'IT-140', 'BOOK-IT-140', 'DevOps', 'Manning', '2021', 280, 'Continuous deployment with Argo CD, Jenkins X, and Flux.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(141, 'Serious Cryptography', 'Jean-Philippe Aumasson', '978-1593278267', 'IT-141', 'BOOK-IT-141', 'Cybersecurity', 'No Starch Press', '2017', 312, 'A practical introduction to modern encryption.', 'available', 4, 4, '2026-01-24 06:12:48', '2026-01-24 06:12:48'),
(142, 'Black Hat Python', 'Justin Seitz', '978-1718501126', 'IT-142', 'BOOK-IT-142', 'Cybersecurity', 'No Starch Press', '2021', 216, 'Python programming for hackers and pentesters.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(143, 'Bug Bounty Bootcamp', 'Vickie Li', '978-1718501546', 'IT-143', 'BOOK-IT-143', 'Cybersecurity', 'No Starch Press', '2021', 416, 'The guide to finding and reporting web vulnerabilities.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(144, 'Penetration Testing', 'Georgia Weidman', '978-1593275648', 'IT-144', 'BOOK-IT-144', 'Cybersecurity', 'No Starch Press', '2014', 528, 'A hands-on introduction to hacking.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(145, 'The Tangled Web', 'Michal Zalewski', '978-1593273880', 'IT-145', 'BOOK-IT-145', 'Cybersecurity', 'No Starch Press', '2011', 320, 'A guide to securing modern web applications.', 'available', 3, 3, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(146, 'Real-World Cryptography', 'David Wong', '978-1617296710', 'IT-146', 'BOOK-IT-146', 'Cybersecurity', 'Manning', '2021', 400, 'Applied cryptography for developers.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(147, 'Designing Secure Software', 'Loren Kohnfelder', '978-1718501928', 'IT-147', 'BOOK-IT-147', 'Cybersecurity', 'No Starch Press', '2021', 312, 'A guide for developers to build secure software.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(148, 'Threat Modeling', 'Adam Shostack', '978-1118809990', 'IT-148', 'BOOK-IT-148', 'Cybersecurity', 'Wiley', '2014', 624, 'Designing for security in software systems.', 'available', 3, 3, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(149, 'Blue Team Handbook', 'Don Murdoch', '978-1726273985', 'IT-149', 'BOOK-IT-149', 'Cybersecurity', 'Independently Published', '2018', 254, 'Incident response edition for security defenders.', 'available', 3, 3, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(150, 'Attacking Network Protocols', 'James Forshaw', '978-1593277505', 'IT-150', 'BOOK-IT-150', 'Cybersecurity', 'No Starch Press', '2017', 408, 'A hacker\'s guide to capture, analysis, and exploitation.', 'available', 3, 3, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(151, 'Designing Data-Intensive Applications', 'Martin Kleppmann', '978-1449373320', 'IT-151', 'BOOK-IT-151', 'Software Engineering', 'O\'Reilly Media', '2017', 616, 'The big ideas behind reliable, scalable systems.', 'available', 6, 6, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(152, 'System Design Interview', 'Alex Xu', '978-1736049112', 'IT-152', 'BOOK-IT-152', 'Software Engineering', 'Byte Code LLC', '2020', 320, 'An insider\'s guide to system design interviews.', 'available', 6, 6, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(153, 'System Design Interview Volume 2', 'Alex Xu', '978-1736049129', 'IT-153', 'BOOK-IT-153', 'Software Engineering', 'Byte Code LLC', '2022', 424, 'Advanced system design interview questions.', 'available', 5, 5, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(154, 'Building Microservices', 'Sam Newman', '978-1492034025', 'IT-154', 'BOOK-IT-154', 'Software Engineering', 'O\'Reilly Media', '2021', 616, 'Designing fine-grained systems.', 'available', 5, 5, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(155, 'Microservices Patterns', 'Chris Richardson', '978-1617294549', 'IT-155', 'BOOK-IT-155', 'Software Engineering', 'Manning', '2018', 520, 'With examples in Java for microservices architecture.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(156, 'Release It!', 'Michael T. Nygard', '978-1680502398', 'IT-156', 'BOOK-IT-156', 'Software Engineering', 'Pragmatic Bookshelf', '2018', 376, 'Design and deploy production-ready software.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(157, 'Software Architecture: The Hard Parts', 'Neal Ford', '978-1492086895', 'IT-157', 'BOOK-IT-157', 'Software Engineering', 'O\'Reilly Media', '2021', 459, 'Modern trade-off analyses for distributed architectures.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(158, 'Fundamentals of Software Architecture', 'Mark Richards', '978-1492043454', 'IT-158', 'BOOK-IT-158', 'Software Engineering', 'O\'Reilly Media', '2020', 422, 'An engineering approach to software architecture.', 'available', 5, 5, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(159, 'Clean Architecture', 'Robert C. Martin', '978-0134494166', 'IT-159', 'BOOK-IT-159', 'Software Engineering', 'Prentice Hall', '2017', 432, 'A craftsman\'s guide to software structure and design.', 'available', 5, 5, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(160, 'Patterns of Enterprise Application Architecture', 'Martin Fowler', '978-0321127426', 'IT-160', 'BOOK-IT-160', 'Software Engineering', 'Addison-Wesley', '2002', 560, 'Classic patterns for enterprise applications.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(161, 'SwiftUI by Tutorials', 'raywenderlich Team', '978-1950325542', 'IT-161', 'BOOK-IT-161', 'Mobile Development', 'Razeware LLC', '2022', 450, 'Declarative app development for iOS with SwiftUI.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(162, 'Jetpack Compose by Tutorials', 'raywenderlich Team', '978-1950325603', 'IT-162', 'BOOK-IT-162', 'Mobile Development', 'Razeware LLC', '2022', 424, 'Building Android UI with Jetpack Compose.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(163, 'Flutter Complete Reference', 'Alberto Miola', '978-8894601817', 'IT-163', 'BOOK-IT-163', 'Mobile Development', 'Independently Published', '2021', 782, 'Complete guide to Flutter development.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(164, 'React Native for Mobile Development', 'Akshat Paul', '978-1484244531', 'IT-164', 'BOOK-IT-164', 'Mobile Development', 'Apress', '2019', 274, 'Harness the power of React Native.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(165, 'iOS Programming Fundamentals with Swift', 'Matt Neuburg', '978-1492092094', 'IT-165', 'BOOK-IT-165', 'Mobile Development', 'O\'Reilly Media', '2021', 648, 'Swift, Xcode, and Cocoa basics.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(166, 'Redis in Action', 'Josiah L. Carlson', '978-1617290855', 'IT-166', 'BOOK-IT-166', 'Database', 'Manning', '2013', 320, 'Build scalable applications with Redis.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(167, 'Elasticsearch in Action', 'Radu Gheorghe', '978-1617299858', 'IT-167', 'BOOK-IT-167', 'Database', 'Manning', '2023', 480, 'Build search and analytics applications with Elasticsearch.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(168, 'Cassandra: The Definitive Guide', 'Jeff Carpenter', '978-1492097143', 'IT-168', 'BOOK-IT-168', 'Database', 'O\'Reilly Media', '2022', 410, 'Distributed data at web scale with Cassandra.', 'available', 3, 3, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(169, 'Streaming Systems', 'Tyler Akidau', '978-1491983874', 'IT-169', 'BOOK-IT-169', 'Data Engineering', 'O\'Reilly Media', '2018', 378, 'The what, where, when, and how of large-scale data processing.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(170, 'Kafka: The Definitive Guide', 'Neha Narkhede', '978-1492043089', 'IT-170', 'BOOK-IT-170', 'Data Engineering', 'O\'Reilly Media', '2021', 488, 'Real-time data and stream processing at scale.', 'available', 5, 5, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(171, 'Spark: The Definitive Guide', 'Bill Chambers', '978-1491912218', 'IT-171', 'BOOK-IT-171', 'Data Engineering', 'O\'Reilly Media', '2018', 602, 'Big data processing made simple with Spark.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(172, 'Designing Event-Driven Systems', 'Ben Stopford', '978-1492038221', 'IT-172', 'BOOK-IT-172', 'Data Engineering', 'O\'Reilly Media', '2018', 172, 'Concepts and patterns for streaming services with Kafka.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(173, 'Fundamentals of Data Engineering', 'Joe Reis', '978-1098108304', 'IT-173', 'BOOK-IT-173', 'Data Engineering', 'O\'Reilly Media', '2022', 452, 'Plan and build robust data systems.', 'available', 5, 5, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(174, 'Data Pipelines Pocket Reference', 'James Densmore', '978-1492087830', 'IT-174', 'BOOK-IT-174', 'Data Engineering', 'O\'Reilly Media', '2021', 276, 'Moving and processing data for analytics.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(175, 'Graph Databases', 'Ian Robinson', '978-1491930892', 'IT-175', 'BOOK-IT-175', 'Database', 'O\'Reilly Media', '2015', 238, 'New opportunities for connected data.', 'available', 3, 3, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(176, 'Software Testing: A Craftsman\'s Approach', 'Paul C. Jorgensen', '978-0367358495', 'IT-176', 'BOOK-IT-176', 'Testing', 'CRC Press', '2021', 494, 'Comprehensive guide to software testing.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(177, 'Exploratory Software Testing', 'James A. Whittaker', '978-0321636416', 'IT-177', 'BOOK-IT-177', 'Testing', 'Addison-Wesley', '2009', 256, 'Tips, tricks, tours, and techniques.', 'available', 3, 3, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(178, 'BDD in Action', 'John Ferguson Smart', '978-1617291654', 'IT-178', 'BOOK-IT-178', 'Testing', 'Manning', '2014', 384, 'Behavior-driven development for the whole team.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(179, 'Agile Testing', 'Lisa Crispin', '978-0321534460', 'IT-179', 'BOOK-IT-179', 'Testing', 'Addison-Wesley', '2008', 576, 'A practical guide for testers and agile teams.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(180, 'Testing JavaScript Applications', 'Lucas da Costa', '978-1617297915', 'IT-180', 'BOOK-IT-180', 'Testing', 'Manning', '2021', 512, 'Building reliable JavaScript applications with testing.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(181, 'Compilers: Principles, Techniques, and Tools', 'Alfred V. Aho', '978-0321486813', 'IT-181', 'BOOK-IT-181', 'Computer Science', 'Pearson', '2006', 1000, 'The dragon book on compiler construction.', 'available', 3, 3, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(182, 'Crafting Interpreters', 'Robert Nystrom', '978-0990582939', 'IT-182', 'BOOK-IT-182', 'Computer Science', 'Genever Benning', '2021', 640, 'A handbook for making programming languages.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(183, 'Writing An Interpreter In Go', 'Thorsten Ball', '978-3982016115', 'IT-183', 'BOOK-IT-183', 'Computer Science', 'Independently Published', '2018', 286, 'Build your own interpreter in Go.', 'available', 3, 3, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(184, 'Engineering a Compiler', 'Keith D. Cooper', '978-0128154120', 'IT-184', 'BOOK-IT-184', 'Computer Science', 'Morgan Kaufmann', '2022', 824, 'Modern compiler construction techniques.', 'available', 3, 3, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(185, 'Types and Programming Languages', 'Benjamin C. Pierce', '978-0262162098', 'IT-185', 'BOOK-IT-185', 'Computer Science', 'MIT Press', '2002', 648, 'Foundation of type systems in programming.', 'available', 3, 3, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(186, 'Network Warrior', 'Gary A. Donahue', '978-1449387860', 'IT-186', 'BOOK-IT-186', 'Networking', 'O\'Reilly Media', '2011', 788, 'Everything you need to know about network infrastructure.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(187, 'HTTP: The Definitive Guide', 'David Gourley', '978-1565925090', 'IT-187', 'BOOK-IT-187', 'Networking', 'O\'Reilly Media', '2002', 658, 'Complete reference for HTTP protocol.', 'available', 3, 3, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(188, 'High Performance Browser Networking', 'Ilya Grigorik', '978-1449344764', 'IT-188', 'BOOK-IT-188', 'Networking', 'O\'Reilly Media', '2013', 400, 'What every web developer should know about networking.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(189, 'DNS and BIND', 'Cricket Liu', '978-0596100575', 'IT-189', 'BOOK-IT-189', 'Networking', 'O\'Reilly Media', '2006', 642, 'The comprehensive guide to DNS systems.', 'available', 3, 3, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(190, 'BGP: Building Reliable Networks with BGP', 'Iljitsch van Beijnum', '978-1491983416', 'IT-190', 'BOOK-IT-190', 'Networking', 'O\'Reilly Media', '2018', 334, 'The Border Gateway Protocol explained.', 'available', 3, 3, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(191, 'Quantum Computing: An Applied Approach', 'Jack D. Hidary', '978-3030832735', 'IT-191', 'BOOK-IT-191', 'Emerging Tech', 'Springer', '2021', 422, 'Practical introduction to quantum computing.', 'available', 3, 3, '2026-01-24 06:12:49', '2026-01-24 06:12:49');
INSERT INTO `books` (`id`, `title`, `author`, `isbn`, `number_code`, `barcode`, `category`, `publisher`, `publication_year`, `pages`, `description`, `status`, `book_copies`, `available_copies`, `created_at`, `updated_at`) VALUES
(192, 'Programming Quantum Computers', 'Eric R. Johnston', '978-1492039686', 'IT-192', 'BOOK-IT-192', 'Emerging Tech', 'O\'Reilly Media', '2019', 336, 'Essential algorithms and code samples for quantum computing.', 'available', 3, 3, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(193, 'Augmented Reality: Principles and Practice', 'Dieter Schmalstieg', '978-0321883575', 'IT-193', 'BOOK-IT-193', 'Emerging Tech', 'Addison-Wesley', '2016', 528, 'Foundations of augmented reality development.', 'available', 3, 3, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(194, 'Edge Computing', 'Jie Cao', '978-1108493499', 'IT-194', 'BOOK-IT-194', 'Emerging Tech', 'Cambridge Press', '2021', 350, 'A primer on edge computing concepts.', 'available', 3, 3, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(195, '5G NR: The Next Generation Wireless Access', 'Erik Dahlman', '978-0128223208', 'IT-195', 'BOOK-IT-195', 'Emerging Tech', 'Academic Press', '2020', 494, 'Technology and specifications for 5G networks.', 'available', 3, 3, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(196, 'Staff Engineer: Leadership Beyond Management', 'Will Larson', '978-1736417911', 'IT-196', 'BOOK-IT-196', 'Career', 'Independently Published', '2021', 400, 'Guide to the staff engineer role.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(197, 'An Elegant Puzzle: Systems of Engineering Management', 'Will Larson', '978-1732265189', 'IT-197', 'BOOK-IT-197', 'Career', 'Stripe Press', '2019', 288, 'Engineering management wisdom and frameworks.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(198, 'The Manager\'s Path', 'Camille Fournier', '978-1491973899', 'IT-198', 'BOOK-IT-198', 'Career', 'O\'Reilly Media', '2017', 244, 'A guide for tech leaders navigating growth.', 'available', 5, 5, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(199, 'Team Topologies', 'Matthew Skelton', '978-1942788812', 'IT-199', 'BOOK-IT-199', 'Career', 'IT Revolution Press', '2019', 240, 'Organizing business and technology teams.', 'available', 4, 4, '2026-01-24 06:12:49', '2026-01-24 06:12:49'),
(200, 'Accelerate', 'Nicole Forsgren', '978-1942788331', 'IT-200', 'BOOK-IT-200', 'DevOps', 'IT Revolution Press', '2018', 288, 'The science of lean software and DevOps.', 'available', 5, 5, '2026-01-24 06:12:49', '2026-01-24 06:12:49');

--
-- Triggers `books`
--
DELIMITER $$
CREATE TRIGGER `generate_book_barcode_on_insert` BEFORE INSERT ON `books` FOR EACH ROW BEGIN
    IF NEW.barcode IS NULL OR NEW.barcode = '' THEN
        SET NEW.barcode = generate_book_barcode(NEW.number_code);
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `set_book_status_on_insert` BEFORE INSERT ON `books` FOR EACH ROW BEGIN
    IF NEW.available_copies = 0 THEN
        SET NEW.status = 'borrowed';
    ELSEIF NEW.available_copies >= 1 THEN
        SET NEW.status = 'available';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_book_status_on_available_copies_change` BEFORE UPDATE ON `books` FOR EACH ROW BEGIN
    IF NEW.available_copies = 0 THEN
        SET NEW.status = 'borrowed';
    ELSEIF NEW.available_copies >= 1 THEN
        SET NEW.status = 'available';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `borrowing_transactions`
--

CREATE TABLE `borrowing_transactions` (
  `id` int(11) NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `borrowing_transactions`
--

INSERT INTO `borrowing_transactions` (`id`, `student_id_number`, `book_id`, `borrowed_date`, `due_date`, `returned_date`, `status`, `borrowed_by_admin`, `returned_by_admin`, `semester_id`, `academic_year_id`, `created_at`, `updated_at`) VALUES
(1, 'C22-0044', 2, '2026-01-24', '2026-01-31', '2026-01-24', 'returned', 1, 1, 6, 6, '2026-01-24 06:23:08', '2026-01-24 06:27:11'),
(2, 'C22-0044', 1, '2026-01-24', '2026-01-31', '2026-01-24', 'returned', 1, 1, 6, 6, '2026-01-24 06:23:30', '2026-01-24 06:27:13'),
(3, 'C22-0044', 3, '2026-01-24', '2026-01-31', '2026-01-24', 'returned', 1, 1, 6, 6, '2026-01-24 06:23:30', '2026-01-24 06:27:15');

--
-- Triggers `borrowing_transactions`
--
DELIMITER $$
CREATE TRIGGER `create_fine_on_overdue` AFTER UPDATE ON `borrowing_transactions` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_book_status_on_borrow` AFTER INSERT ON `borrowing_transactions` FOR EACH ROW BEGIN
    UPDATE books
    SET available_copies = available_copies - 1
    WHERE id = NEW.book_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_book_status_on_return` AFTER UPDATE ON `borrowing_transactions` FOR EACH ROW BEGIN
    IF NEW.status = 'returned' AND OLD.status != 'returned' THEN
        UPDATE books
        SET available_copies = available_copies + 1
        WHERE id = NEW.book_id;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `fines`
--

CREATE TABLE `fines` (
  `id` int(11) NOT NULL,
  `student_id_number` varchar(10) NOT NULL,
  `transaction_id` int(11) NOT NULL,
  `fine_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `paid_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `days_overdue` int(11) NOT NULL DEFAULT 0,
  `fine_date` date NOT NULL,
  `status` enum('unpaid','paid','partial') DEFAULT 'unpaid',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fine_payments`
--

CREATE TABLE `fine_payments` (
  `id` int(11) NOT NULL,
  `fine_id` int(11) NOT NULL,
  `payment_amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','card','online') DEFAULT 'cash',
  `processed_by` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `login_logs`
--

CREATE TABLE `login_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_type` enum('student','admin') NOT NULL,
  `login_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `login_logs`
--

INSERT INTO `login_logs` (`id`, `user_id`, `user_type`, `login_time`, `ip_address`, `user_agent`) VALUES
(1, 1, 'admin', '2026-01-24 01:42:41', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 OPR/125.0.0.0'),
(2, 1, 'admin', '2026-01-24 05:45:18', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 OPR/125.0.0.0'),
(3, 2, 'student', '2026-01-24 05:56:43', '127.0.0.1', 'okhttp/4.9.2'),
(4, 2, 'student', '2026-01-24 06:26:09', '127.0.0.1', 'okhttp/4.9.2');

-- --------------------------------------------------------

--
-- Table structure for table `notification_logs`
--

CREATE TABLE `notification_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `transaction_id` int(11) NOT NULL,
  `notification_type` enum('due_soon','due_today','overdue') NOT NULL,
  `sent_via` enum('push','email','both','in_app') NOT NULL,
  `book_title` varchar(255) DEFAULT NULL,
  `days_until_due` int(11) DEFAULT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `sent_date` date GENERATED ALWAYS AS (cast(`sent_at` as date)) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification_preferences`
--

CREATE TABLE `notification_preferences` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `notifications_enabled` tinyint(1) DEFAULT 1,
  `push_enabled` tinyint(1) DEFAULT 1,
  `email_enabled` tinyint(1) DEFAULT 1,
  `days_before_due` int(11) DEFAULT 3,
  `notify_overdue` tinyint(1) DEFAULT 1,
  `notify_due_today` tinyint(1) DEFAULT 1,
  `notify_due_soon` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `overdue_books_with_fines`
-- (See below for the actual view)
--
CREATE TABLE `overdue_books_with_fines` (
`transaction_id` int(11)
,`student_id_number` varchar(10)
,`first_name` varchar(100)
,`last_name` varchar(100)
,`email` varchar(255)
,`book_id` int(11)
,`book_title` varchar(255)
,`book_author` varchar(255)
,`book_code` varchar(20)
,`borrowed_date` date
,`due_date` date
,`days_overdue` int(7)
,`fine_amount` decimal(10,2)
,`paid_amount` decimal(10,2)
,`balance` decimal(11,2)
,`fine_status` enum('unpaid','paid','partial')
,`transaction_status` enum('borrowed','returned','overdue')
);

-- --------------------------------------------------------

--
-- Table structure for table `overdue_history`
--

CREATE TABLE `overdue_history` (
  `id` int(11) NOT NULL,
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `return_transactions`
--

CREATE TABLE `return_transactions` (
  `id` int(11) NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `return_transactions`
--

INSERT INTO `return_transactions` (`id`, `transaction_id`, `student_id_number`, `book_id`, `returned_at`, `returned_by_admin`, `return_condition`, `condition_notes`, `fine_applied`, `fine_reason`, `processing_notes`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'C22-0044', 2, '2026-01-24 06:27:11', 1, 'good', '', 0.00, '', '', 'completed', '2026-01-24 06:27:11', '2026-01-24 06:27:11'),
(2, 2, 'C22-0044', 1, '2026-01-24 06:27:13', 1, 'good', '', 0.00, '', '', 'completed', '2026-01-24 06:27:13', '2026-01-24 06:27:13'),
(3, 3, 'C22-0044', 3, '2026-01-24 06:27:15', 1, 'good', '', 0.00, '', '', 'completed', '2026-01-24 06:27:15', '2026-01-24 06:27:15');

-- --------------------------------------------------------

--
-- Table structure for table `semesters`
--

CREATE TABLE `semesters` (
  `id` int(11) NOT NULL,
  `academic_year_id` int(11) NOT NULL,
  `semester_number` int(11) NOT NULL,
  `semester_name` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_current` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `semesters`
--

INSERT INTO `semesters` (`id`, `academic_year_id`, `semester_number`, `semester_name`, `start_date`, `end_date`, `is_current`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'First Semester', '2020-08-01', '2020-12-20', 0, '2026-01-23 09:13:55', '2026-01-23 09:13:55'),
(2, 2, 1, 'First Semester', '2021-08-01', '2021-12-20', 0, '2026-01-23 09:13:55', '2026-01-23 09:13:55'),
(3, 3, 1, 'First Semester', '2022-08-01', '2022-12-20', 0, '2026-01-23 09:13:55', '2026-01-23 09:13:55'),
(4, 4, 1, 'First Semester', '2023-08-01', '2023-12-20', 0, '2026-01-23 09:13:55', '2026-01-23 09:13:55'),
(5, 5, 1, 'First Semester', '2024-08-01', '2024-12-20', 0, '2026-01-23 09:13:55', '2026-01-23 09:13:55'),
(6, 6, 1, 'First Semester', '2025-08-01', '2025-12-20', 1, '2026-01-23 09:13:55', '2026-01-23 09:13:55'),
(7, 1, 2, 'Second Semester', '2021-01-01', '2021-05-31', 0, '2026-01-23 09:13:55', '2026-01-23 09:13:55'),
(8, 2, 2, 'Second Semester', '2022-01-01', '2022-05-31', 0, '2026-01-23 09:13:55', '2026-01-23 09:13:55'),
(9, 3, 2, 'Second Semester', '2023-01-01', '2023-05-31', 0, '2026-01-23 09:13:55', '2026-01-23 09:13:55'),
(10, 4, 2, 'Second Semester', '2024-01-01', '2024-05-31', 0, '2026-01-23 09:13:55', '2026-01-23 09:13:55'),
(11, 5, 2, 'Second Semester', '2025-01-01', '2025-05-31', 0, '2026-01-23 09:13:55', '2026-01-23 09:13:55'),
(12, 6, 2, 'Second Semester', '2026-01-01', '2026-05-31', 0, '2026-01-23 09:13:55', '2026-01-23 09:13:55');

-- --------------------------------------------------------

--
-- Table structure for table `semester_clearances`
--

CREATE TABLE `semester_clearances` (
  `id` int(11) NOT NULL,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `semester_clearances`
--

INSERT INTO `semester_clearances` (`id`, `user_id`, `semester_id`, `books_borrowed`, `books_required`, `total_fines`, `fines_paid`, `is_cleared`, `cleared_date`, `cleared_by`, `remarks`, `created_at`, `updated_at`) VALUES
(1, 2, 6, 3, 20, 0.00, 0.00, 0, NULL, NULL, NULL, '2026-01-24 06:23:08', '2026-01-24 06:23:30');

-- --------------------------------------------------------

--
-- Table structure for table `semester_fine_payments`
--

CREATE TABLE `semester_fine_payments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `borrowing_id` int(11) DEFAULT NULL,
  `semester_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','card','online') DEFAULT 'cash',
  `received_by` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `semester_tracking`
--

CREATE TABLE `semester_tracking` (
  `id` int(11) NOT NULL,
  `student_id_number` varchar(10) NOT NULL,
  `semester_start_date` date NOT NULL,
  `semester_end_date` date NOT NULL,
  `books_borrowed_count` int(11) DEFAULT 0,
  `max_books_allowed` int(11) DEFAULT 5,
  `status` enum('active','completed','suspended') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `semester_tracking`
--

INSERT INTO `semester_tracking` (`id`, `student_id_number`, `semester_start_date`, `semester_end_date`, `books_borrowed_count`, `max_books_allowed`, `status`, `created_at`, `updated_at`) VALUES
(1, 'C22-0044', '2026-01-24', '2026-06-24', 3, 5, 'active', '2026-01-24 06:23:08', '2026-01-24 06:23:30');

-- --------------------------------------------------------

--
-- Table structure for table `student_borrowing_status`
--

CREATE TABLE `student_borrowing_status` (
  `id` int(11) NOT NULL,
  `student_id_number` varchar(10) NOT NULL,
  `can_borrow` tinyint(1) DEFAULT 1,
  `reason` text DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_borrowing_status`
--

INSERT INTO `student_borrowing_status` (`id`, `student_id_number`, `can_borrow`, `reason`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'C22-0044', 1, NULL, 1, '2026-01-24 05:56:44', '2026-01-24 06:27:28');

-- --------------------------------------------------------

--
-- Table structure for table `student_year_history`
--

CREATE TABLE `student_year_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `academic_year_id` int(11) NOT NULL,
  `year_level` int(11) NOT NULL,
  `status` enum('enrolled','graduated','dropped','on_leave') DEFAULT 'enrolled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `description` text DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `description`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'fine_per_day', '5', 'Fine amount per day for overdue books', 1, '2026-01-23 09:13:55', '2026-01-24 06:24:25'),
(2, 'max_borrow_days', '7', 'Maximum number of days a book can be borrowed', 1, '2026-01-23 09:13:55', '2026-01-24 06:24:26'),
(3, 'max_books_per_student', '5', 'Maximum number of books a student can borrow at once', 1, '2026-01-23 09:13:55', '2026-01-24 06:24:26'),
(4, 'semester_books_required', '20', 'Minimum books required to borrow per semester for clearance', 1, '2026-01-23 09:13:55', '2026-01-24 06:24:26'),
(5, 'borrowing_period_days', '1', NULL, 1, '2026-01-24 06:24:26', '2026-01-24 06:24:26');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
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
  `verification_expires` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `id_number`, `student_barcode`, `email`, `password_hash`, `first_name`, `last_name`, `role`, `is_verified`, `email_verified`, `last_login`, `created_at`, `updated_at`, `reset_code`, `reset_expires`, `verification_code`, `verification_expires`) VALUES
(1, 'admin', 'STU-admin', 'admin@library.com', '$2a$10$i1Y//f1RlsDtvD5KWcKUdu4uCihfX/zYEIrE0rSClQ2nMOQLv.bQu', 'Admin', 'User', 'admin', 1, 1, NULL, '2026-01-24 01:40:49', '2026-01-24 01:40:49', NULL, NULL, NULL, NULL),
(2, 'C22-0044', 'STU-C22-0044', 'rhodcelisterduallo.sol@my.smciligan.edu.ph', '$2a$10$FYRmoav4FwPBL.YsFdek8.6Zi5wDUkYn4hHY/0oEQGs5yGEAiKu0C', 'Rhod Celister', 'Sol', 'student', 1, 1, NULL, '2026-01-24 05:56:14', '2026-01-24 06:27:00', NULL, NULL, NULL, NULL);

--
-- Triggers `users`
--
DELIMITER $$
CREATE TRIGGER `generate_student_barcode_on_insert` BEFORE INSERT ON `users` FOR EACH ROW BEGIN
    IF NEW.student_barcode IS NULL OR NEW.student_barcode = '' THEN
        SET NEW.student_barcode = generate_student_barcode(NEW.id_number);
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_books_needing_notifications`
-- (See below for the actual view)
--
CREATE TABLE `v_books_needing_notifications` (
`transaction_id` int(11)
,`user_id` int(11)
,`id_number` varchar(10)
,`email` varchar(255)
,`first_name` varchar(100)
,`last_name` varchar(100)
,`book_id` int(11)
,`book_title` varchar(255)
,`author` varchar(255)
,`due_date` date
,`days_until_due` int(7)
,`notification_type` varchar(9)
,`reminder_days` int(11)
,`push_enabled` int(4)
,`email_enabled` int(4)
,`notify_overdue` int(4)
,`notify_due_today` int(4)
,`notify_due_soon` int(4)
);

-- --------------------------------------------------------

--
-- Structure for view `active_borrowing_status`
--
DROP TABLE IF EXISTS `active_borrowing_status`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `active_borrowing_status`  AS SELECT `u`.`id_number` AS `id_number`, `u`.`email` AS `email`, `u`.`first_name` AS `first_name`, `u`.`last_name` AS `last_name`, count(distinct case when `bt`.`status` = 'borrowed' then `bt`.`id` end) AS `currently_borrowed`, count(distinct case when `bt`.`status` = 'overdue' then `bt`.`id` end) AS `overdue_count`, coalesce(sum(case when `f`.`status` = 'unpaid' then `f`.`fine_amount` - `f`.`paid_amount` else 0 end),0) AS `unpaid_fine_amount`, coalesce(`sbs`.`can_borrow`,1) AS `can_borrow`, `sbs`.`reason` AS `borrowing_restriction_reason` FROM (((`users` `u` left join `borrowing_transactions` `bt` on(`u`.`id_number` = `bt`.`student_id_number` and `bt`.`status` in ('borrowed','overdue') and `bt`.`returned_date` is null)) left join `fines` `f` on(`bt`.`id` = `f`.`transaction_id` and `f`.`status` = 'unpaid')) left join `student_borrowing_status` `sbs` on(`u`.`id_number` = `sbs`.`student_id_number`)) WHERE `u`.`role` = 'student' GROUP BY `u`.`id_number`, `u`.`email`, `u`.`first_name`, `u`.`last_name`, `sbs`.`can_borrow`, `sbs`.`reason` ;

-- --------------------------------------------------------

--
-- Structure for view `barcode_lookup`
--
DROP TABLE IF EXISTS `barcode_lookup`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `barcode_lookup`  AS SELECT 'book' AS `type`, `b`.`id` AS `item_id`, `b`.`barcode` AS `barcode`, `b`.`number_code` AS `code`, `b`.`title` AS `name`, `b`.`author` AS `author`, `b`.`status` AS `status`, `b`.`available_copies` AS `available_copies`, `b`.`book_copies` AS `book_copies` FROM `books` AS `b`union all select 'student' AS `type`,`u`.`id` AS `item_id`,`u`.`student_barcode` AS `barcode`,`u`.`id_number` AS `code`,concat(`u`.`first_name`,' ',`u`.`last_name`) AS `name`,NULL AS `author`,case when `u`.`is_verified` = 1 then 'active' else 'inactive' end AS `status`,NULL AS `available_copies`,NULL AS `book_copies` from `users` `u` where `u`.`role` = 'student'  ;

-- --------------------------------------------------------

--
-- Structure for view `overdue_books_with_fines`
--
DROP TABLE IF EXISTS `overdue_books_with_fines`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `overdue_books_with_fines`  AS SELECT `bt`.`id` AS `transaction_id`, `u`.`id_number` AS `student_id_number`, `u`.`first_name` AS `first_name`, `u`.`last_name` AS `last_name`, `u`.`email` AS `email`, `b`.`id` AS `book_id`, `b`.`title` AS `book_title`, `b`.`author` AS `book_author`, `b`.`number_code` AS `book_code`, `bt`.`borrowed_date` AS `borrowed_date`, `bt`.`due_date` AS `due_date`, to_days(curdate()) - to_days(`bt`.`due_date`) AS `days_overdue`, `f`.`fine_amount` AS `fine_amount`, `f`.`paid_amount` AS `paid_amount`, `f`.`fine_amount`- `f`.`paid_amount` AS `balance`, `f`.`status` AS `fine_status`, `bt`.`status` AS `transaction_status` FROM (((`borrowing_transactions` `bt` join `users` `u` on(`bt`.`student_id_number` = `u`.`id_number`)) join `books` `b` on(`bt`.`book_id` = `b`.`id`)) left join `fines` `f` on(`bt`.`id` = `f`.`transaction_id`)) WHERE `bt`.`status` = 'overdue' AND `bt`.`returned_date` is null ;

-- --------------------------------------------------------

--
-- Structure for view `v_books_needing_notifications`
--
DROP TABLE IF EXISTS `v_books_needing_notifications`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_books_needing_notifications`  AS SELECT `bt`.`id` AS `transaction_id`, `u`.`id` AS `user_id`, `u`.`id_number` AS `id_number`, `u`.`email` AS `email`, `u`.`first_name` AS `first_name`, `u`.`last_name` AS `last_name`, `b`.`id` AS `book_id`, `b`.`title` AS `book_title`, `b`.`author` AS `author`, `bt`.`due_date` AS `due_date`, to_days(`bt`.`due_date`) - to_days(curdate()) AS `days_until_due`, CASE WHEN to_days(`bt`.`due_date`) - to_days(curdate()) < 0 THEN 'overdue' WHEN to_days(`bt`.`due_date`) - to_days(curdate()) = 0 THEN 'due_today' ELSE 'due_soon' END AS `notification_type`, coalesce(`np`.`days_before_due`,3) AS `reminder_days`, coalesce(`np`.`push_enabled`,1) AS `push_enabled`, coalesce(`np`.`email_enabled`,1) AS `email_enabled`, coalesce(`np`.`notify_overdue`,1) AS `notify_overdue`, coalesce(`np`.`notify_due_today`,1) AS `notify_due_today`, coalesce(`np`.`notify_due_soon`,1) AS `notify_due_soon` FROM (((`borrowing_transactions` `bt` join `users` `u` on(`bt`.`student_id_number` = `u`.`id_number`)) join `books` `b` on(`bt`.`book_id` = `b`.`id`)) left join `notification_preferences` `np` on(`u`.`id` = `np`.`user_id`)) WHERE `bt`.`status` in ('borrowed','overdue') AND `bt`.`returned_date` is null AND `u`.`is_verified` = 1 ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academic_years`
--
ALTER TABLE `academic_years`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `year_name` (`year_name`),
  ADD KEY `idx_year_name` (`year_name`),
  ADD KEY `idx_is_current` (`is_current`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_table` (`table_name`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `number_code` (`number_code`),
  ADD UNIQUE KEY `isbn` (`isbn`),
  ADD UNIQUE KEY `barcode` (`barcode`),
  ADD KEY `idx_title` (`title`),
  ADD KEY `idx_author` (`author`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_category` (`category`);

--
-- Indexes for table `borrowing_transactions`
--
ALTER TABLE `borrowing_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student_id` (`student_id_number`),
  ADD KEY `idx_book_id` (`book_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_due_date` (`due_date`),
  ADD KEY `idx_borrowed_date` (`borrowed_date`),
  ADD KEY `idx_borrowed_admin` (`borrowed_by_admin`),
  ADD KEY `idx_returned_admin` (`returned_by_admin`),
  ADD KEY `idx_semester` (`semester_id`),
  ADD KEY `idx_academic_year` (`academic_year_id`);

--
-- Indexes for table `fines`
--
ALTER TABLE `fines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`student_id_number`),
  ADD KEY `idx_transaction` (`transaction_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_fine_date` (`fine_date`);

--
-- Indexes for table `fine_payments`
--
ALTER TABLE `fine_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_fine` (`fine_id`),
  ADD KEY `idx_processed_by` (`processed_by`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `login_logs`
--
ALTER TABLE `login_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_login_time` (`login_time`),
  ADD KEY `idx_user_type` (`user_type`);

--
-- Indexes for table `notification_logs`
--
ALTER TABLE `notification_logs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_daily_notification` (`user_id`,`transaction_id`,`notification_type`,`sent_date`),
  ADD KEY `idx_user_sent` (`user_id`,`sent_at`),
  ADD KEY `idx_type_sent` (`notification_type`,`sent_at`),
  ADD KEY `fk_nl_transaction` (`transaction_id`);

--
-- Indexes for table `notification_preferences`
--
ALTER TABLE `notification_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_prefs` (`user_id`);

--
-- Indexes for table `overdue_history`
--
ALTER TABLE `overdue_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`student_id_number`),
  ADD KEY `idx_transaction` (`transaction_id`),
  ADD KEY `idx_returned_at` (`returned_at`),
  ADD KEY `fk_oh_returned_admin` (`returned_by_admin`);

--
-- Indexes for table `return_transactions`
--
ALTER TABLE `return_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_transaction` (`transaction_id`),
  ADD KEY `idx_student` (`student_id_number`),
  ADD KEY `idx_returned_at` (`returned_at`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `fk_rt_book` (`book_id`),
  ADD KEY `fk_rt_admin` (`returned_by_admin`);

--
-- Indexes for table `semesters`
--
ALTER TABLE `semesters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_semester` (`academic_year_id`,`semester_number`),
  ADD KEY `idx_academic_year` (`academic_year_id`),
  ADD KEY `idx_is_current` (`is_current`);

--
-- Indexes for table `semester_clearances`
--
ALTER TABLE `semester_clearances`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_semester` (`user_id`,`semester_id`),
  ADD KEY `idx_user_semester` (`user_id`,`semester_id`),
  ADD KEY `idx_is_cleared` (`is_cleared`),
  ADD KEY `fk_sc_semester` (`semester_id`),
  ADD KEY `fk_sc_cleared_by` (`cleared_by`);

--
-- Indexes for table `semester_fine_payments`
--
ALTER TABLE `semester_fine_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_borrowing` (`borrowing_id`),
  ADD KEY `idx_semester` (`semester_id`),
  ADD KEY `idx_received_by` (`received_by`);

--
-- Indexes for table `semester_tracking`
--
ALTER TABLE `semester_tracking`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`student_id_number`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_semester_dates` (`semester_start_date`,`semester_end_date`);

--
-- Indexes for table `student_borrowing_status`
--
ALTER TABLE `student_borrowing_status`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id_number` (`student_id_number`),
  ADD KEY `idx_can_borrow` (`can_borrow`),
  ADD KEY `fk_sbs_updated_by` (`updated_by`);

--
-- Indexes for table `student_year_history`
--
ALTER TABLE `student_year_history`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_year` (`user_id`,`academic_year_id`),
  ADD KEY `idx_user_year` (`user_id`,`academic_year_id`),
  ADD KEY `fk_syh_academic_year` (`academic_year_id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `fk_ss_updated_by` (`updated_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_number` (`id_number`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `student_barcode` (`student_barcode`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_id_number` (`id_number`),
  ADD KEY `idx_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academic_years`
--
ALTER TABLE `academic_years`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=201;

--
-- AUTO_INCREMENT for table `borrowing_transactions`
--
ALTER TABLE `borrowing_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `fines`
--
ALTER TABLE `fines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fine_payments`
--
ALTER TABLE `fine_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `login_logs`
--
ALTER TABLE `login_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `notification_logs`
--
ALTER TABLE `notification_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notification_preferences`
--
ALTER TABLE `notification_preferences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `overdue_history`
--
ALTER TABLE `overdue_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `return_transactions`
--
ALTER TABLE `return_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `semesters`
--
ALTER TABLE `semesters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `semester_clearances`
--
ALTER TABLE `semester_clearances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `semester_fine_payments`
--
ALTER TABLE `semester_fine_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `semester_tracking`
--
ALTER TABLE `semester_tracking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `student_borrowing_status`
--
ALTER TABLE `student_borrowing_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `student_year_history`
--
ALTER TABLE `student_year_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_al_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `borrowing_transactions`
--
ALTER TABLE `borrowing_transactions`
  ADD CONSTRAINT `fk_bt_academic_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_bt_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_bt_borrowed_admin` FOREIGN KEY (`borrowed_by_admin`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_bt_returned_admin` FOREIGN KEY (`returned_by_admin`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_bt_semester` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_bt_student` FOREIGN KEY (`student_id_number`) REFERENCES `users` (`id_number`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `fines`
--
ALTER TABLE `fines`
  ADD CONSTRAINT `fk_fines_student` FOREIGN KEY (`student_id_number`) REFERENCES `users` (`id_number`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_fines_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `borrowing_transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `fine_payments`
--
ALTER TABLE `fine_payments`
  ADD CONSTRAINT `fk_fp_fine` FOREIGN KEY (`fine_id`) REFERENCES `fines` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_fp_processed_by` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `login_logs`
--
ALTER TABLE `login_logs`
  ADD CONSTRAINT `fk_ll_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notification_logs`
--
ALTER TABLE `notification_logs`
  ADD CONSTRAINT `fk_nl_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `borrowing_transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_nl_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notification_preferences`
--
ALTER TABLE `notification_preferences`
  ADD CONSTRAINT `fk_np_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `overdue_history`
--
ALTER TABLE `overdue_history`
  ADD CONSTRAINT `fk_oh_returned_admin` FOREIGN KEY (`returned_by_admin`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_oh_student` FOREIGN KEY (`student_id_number`) REFERENCES `users` (`id_number`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_oh_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `borrowing_transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `return_transactions`
--
ALTER TABLE `return_transactions`
  ADD CONSTRAINT `fk_rt_admin` FOREIGN KEY (`returned_by_admin`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rt_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rt_student` FOREIGN KEY (`student_id_number`) REFERENCES `users` (`id_number`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rt_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `borrowing_transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `semesters`
--
ALTER TABLE `semesters`
  ADD CONSTRAINT `fk_sem_academic_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `semester_clearances`
--
ALTER TABLE `semester_clearances`
  ADD CONSTRAINT `fk_sc_cleared_by` FOREIGN KEY (`cleared_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sc_semester` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sc_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `semester_fine_payments`
--
ALTER TABLE `semester_fine_payments`
  ADD CONSTRAINT `fk_sfp_borrowing` FOREIGN KEY (`borrowing_id`) REFERENCES `borrowing_transactions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sfp_received_by` FOREIGN KEY (`received_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sfp_semester` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sfp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `semester_tracking`
--
ALTER TABLE `semester_tracking`
  ADD CONSTRAINT `fk_st_student` FOREIGN KEY (`student_id_number`) REFERENCES `users` (`id_number`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `student_borrowing_status`
--
ALTER TABLE `student_borrowing_status`
  ADD CONSTRAINT `fk_sbs_student` FOREIGN KEY (`student_id_number`) REFERENCES `users` (`id_number`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_sbs_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `student_year_history`
--
ALTER TABLE `student_year_history`
  ADD CONSTRAINT `fk_syh_academic_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_syh_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD CONSTRAINT `fk_ss_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
