-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 18, 2025 at 04:21 AM
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
,`can_borrow` tinyint(1)
,`borrowing_restriction_reason` text
);

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
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
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `number_code` varchar(20) NOT NULL,
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

INSERT INTO `books` (`id`, `title`, `author`, `isbn`, `number_code`, `category`, `publisher`, `publication_year`, `pages`, `description`, `status`, `book_copies`, `available_copies`, `created_at`, `updated_at`) VALUES
(1, 'Introduction to Programming with Python', 'John Smith', '978-0134444321', 'IT001', 'Programming', 'Pearson Education', '2023', 450, 'Comprehensive guide to Python programming for beginners. Covers variables, loops, functions, and object-oriented programming.', 'available', 3, 2, '2025-09-10 14:39:05', '2025-09-15 05:13:45'),
(2, 'Java: The Complete Reference', 'Herbert Schildt', '978-1260440249', 'IT002', 'Programming', 'McGraw-Hill', '2022', 1200, 'Complete guide to Java programming language. Includes Java 17 features, collections, multithreading, and GUI development.', 'available', 2, 1, '2025-09-10 14:39:05', '2025-09-15 05:13:45'),
(3, 'C++ Programming: From Problem Analysis to Program Design', 'D.S. Malik', '978-1337102087', 'IT003', 'Programming', 'Cengage Learning', '2023', 1400, 'Comprehensive C++ programming textbook covering data structures, algorithms, and object-oriented design principles.', 'available', 3, 2, '2025-09-10 14:39:05', '2025-09-15 05:13:45'),
(4, 'JavaScript: The Definitive Guide', 'David Flanagan', '978-1491952023', 'IT004', 'Web Development', 'O\'Reilly Media', '2022', 1096, 'Complete reference for JavaScript programming. Covers ES6+, DOM manipulation, and modern web development practices.', 'available', 2, 1, '2025-09-10 14:39:05', '2025-09-15 05:13:45'),
(5, 'HTML and CSS: Design and Build Websites', 'Jon Duckett', '978-1118008188', 'IT005', 'Web Development', 'Wiley', '2021', 490, 'Beautifully designed guide to HTML5 and CSS3. Perfect for beginners learning web design and development.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-14 03:52:53'),
(6, 'React: Up & Running', 'Stoyan Stefanov', '978-1491931820', 'IT006', 'Web Development', 'O\'Reilly Media', '2022', 300, 'Learn React.js from the ground up. Covers components, hooks, state management, and modern React patterns.', 'available', 2, 2, '2025-09-10 14:39:05', '2025-09-15 05:15:47'),
(7, 'Node.js in Action', 'Mike Cantelon', '978-1617290572', 'IT007', 'Web Development', 'Manning Publications', '2021', 400, 'Complete guide to server-side JavaScript with Node.js. Covers Express.js, databases, and deployment.', 'available', 2, 2, '2025-09-10 14:39:05', '2025-09-15 04:49:19'),
(8, 'Full-Stack Web Development with Vue.js and Node.js', 'Aneeta Sharma', '978-1788831147', 'IT008', 'Web Development', 'Packt Publishing', '2022', 350, 'Build complete web applications using Vue.js frontend and Node.js backend with MongoDB database.', 'available', 2, 2, '2025-09-10 14:39:05', '2025-09-15 04:49:19'),
(9, 'Database System Concepts', 'Abraham Silberschatz', '978-0078022159', 'IT009', 'Database', 'McGraw-Hill', '2023', 1344, 'Comprehensive textbook on database systems. Covers relational databases, SQL, normalization, and transaction management.', 'borrowed', 2, 0, '2025-09-10 14:39:05', '2025-09-15 05:15:57'),
(10, 'MySQL Cookbook', 'Paul DuBois', '978-1449374020', 'IT010', 'Database', 'O\'Reilly Media', '2022', 800, 'Practical solutions for MySQL database administration and development. Includes performance tuning and optimization.', 'available', 3, 3, '2025-09-10 14:39:05', '2025-09-15 04:49:19'),
(11, 'MongoDB: The Definitive Guide', 'Kristina Chodorow', '978-1491954461', 'IT011', 'Database', 'O\'Reilly Media', '2021', 400, 'Complete guide to MongoDB NoSQL database. Covers document design, indexing, and aggregation pipelines.', 'available', 2, 2, '2025-09-10 14:39:05', '2025-09-15 04:49:19'),
(12, 'SQL for Data Analysis', 'Cathy Tanimura', '978-1492088776', 'IT012', 'Database', 'O\'Reilly Media', '2022', 350, 'Advanced SQL techniques for data analysis and business intelligence. Includes window functions and complex queries.', 'available', 2, 2, '2025-09-10 14:39:05', '2025-09-15 04:49:19'),
(13, 'Android Programming: The Big Nerd Ranch Guide', 'Bill Phillips', '978-0135245125', 'IT013', 'Mobile Development', 'Big Nerd Ranch', '2023', 600, 'Comprehensive guide to Android app development using Kotlin. Covers UI design, networking, and data persistence.', 'available', 2, 2, '2025-09-10 14:39:05', '2025-09-15 04:49:19'),
(14, 'iOS Programming: The Big Nerd Ranch Guide', 'Christian Keur', '978-0135264027', 'IT014', 'Mobile Development', 'Big Nerd Ranch', '2023', 700, 'Complete iOS app development guide using Swift and SwiftUI. Covers UIKit, Core Data, and app store deployment.', 'available', 2, 2, '2025-09-10 14:39:05', '2025-09-15 04:49:19'),
(15, 'React Native: Building Mobile Apps', 'Nader Dabit', '978-1492049043', 'IT015', 'Mobile Development', 'O\'Reilly Media', '2022', 400, 'Cross-platform mobile app development with React Native. Build iOS and Android apps with JavaScript.', 'available', 2, 2, '2025-09-10 14:39:05', '2025-09-15 04:49:19'),
(16, 'Flutter in Action', 'Eric Windmill', '978-1617296147', 'IT016', 'Mobile Development', 'Manning Publications', '2021', 350, 'Learn Flutter framework for building beautiful mobile apps. Covers Dart language and widget development.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(17, 'Cybersecurity Essentials', 'Charles J. Brooks', '978-1119362395', 'IT017', 'Cybersecurity', 'Wiley', '2022', 500, 'Fundamental concepts of cybersecurity including threats, vulnerabilities, and defense strategies.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(18, 'Network Security Essentials', 'William Stallings', '978-0134527336', 'IT018', 'Cybersecurity', 'Pearson', '2023', 600, 'Comprehensive guide to network security protocols, encryption, and secure communication.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(19, 'Ethical Hacking: A Hands-On Introduction', 'Daniel G. Graham', '978-1718501874', 'IT019', 'Cybersecurity', 'No Starch Press', '2022', 400, 'Learn ethical hacking techniques and penetration testing methodologies in a legal and ethical framework.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(20, 'Applied Cryptography', 'Bruce Schneier', '978-1119096726', 'IT020', 'Cybersecurity', 'Wiley', '2021', 800, 'Classic text on cryptographic algorithms and their practical applications in computer security.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(21, 'AWS Certified Solutions Architect Study Guide', 'Ben Piper', '978-1119504645', 'IT021', 'Cloud Computing', 'Wiley', '2023', 600, 'Complete study guide for AWS Solutions Architect certification. Covers EC2, S3, RDS, and cloud architecture patterns.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(22, 'Microsoft Azure Fundamentals', 'Timothy L. Warner', '978-1119689809', 'IT022', 'Cloud Computing', 'Wiley', '2022', 400, 'Introduction to Microsoft Azure cloud platform. Covers virtual machines, storage, and cloud services.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(23, 'Google Cloud Platform in Action', 'JJ Geewax', '978-1617293528', 'IT023', 'Cloud Computing', 'Manning Publications', '2021', 500, 'Comprehensive guide to Google Cloud Platform services and deployment strategies.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(24, 'Docker in Action', 'Jeff Nickoloff', '978-1617294761', 'IT024', 'Cloud Computing', 'Manning Publications', '2022', 350, 'Learn containerization with Docker. Covers container orchestration and microservices architecture.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(25, 'Python for Data Analysis', 'Wes McKinney', '978-1098104030', 'IT025', 'Data Science', 'O\'Reilly Media', '2023', 550, 'Data manipulation and analysis with Python using pandas, NumPy, and matplotlib libraries.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(26, 'Hands-On Machine Learning', 'Aurélien Géron', '978-1492032649', 'IT026', 'Machine Learning', 'O\'Reilly Media', '2022', 800, 'Practical machine learning with Scikit-Learn, Keras, and TensorFlow. Covers supervised and unsupervised learning.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(27, 'Deep Learning', 'Ian Goodfellow', '978-0262035613', 'IT027', 'Machine Learning', 'MIT Press', '2021', 800, 'Comprehensive textbook on deep learning algorithms and neural network architectures.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(28, 'Artificial Intelligence: A Modern Approach', 'Stuart Russell', '978-0134610993', 'IT028', 'Artificial Intelligence', 'Pearson', '2023', 1100, 'Classic AI textbook covering search algorithms, knowledge representation, and machine learning.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(29, 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '978-0132350884', 'IT029', 'Software Engineering', 'Prentice Hall', '2021', 400, 'Best practices for writing clean, maintainable code. Essential reading for professional developers.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(30, 'Design Patterns: Elements of Reusable Object-Oriented Software', 'Gang of Four', '978-0201633610', 'IT030', 'Software Engineering', 'Addison-Wesley', '2022', 400, 'Classic book on software design patterns. Covers creational, structural, and behavioral patterns.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(31, 'The Pragmatic Programmer', 'David Thomas', '978-0135957059', 'IT031', 'Software Engineering', 'Addison-Wesley', '2020', 350, 'Practical advice for becoming a more effective programmer. Covers career development and best practices.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(32, 'Refactoring: Improving the Design of Existing Code', 'Martin Fowler', '978-0134757599', 'IT032', 'Software Engineering', 'Addison-Wesley', '2021', 450, 'Techniques for improving code quality through systematic refactoring methods.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(33, 'Computer Networks', 'Andrew S. Tanenbaum', '978-0132126953', 'IT033', 'Networking', 'Pearson', '2023', 1000, 'Comprehensive textbook on computer networking principles, protocols, and technologies.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(34, 'TCP/IP Illustrated', 'W. Richard Stevens', '978-0321336315', 'IT034', 'Networking', 'Addison-Wesley', '2022', 800, 'Detailed explanation of TCP/IP protocol suite with practical examples and implementations.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(35, 'Network+ Guide to Networks', 'Jill West', '978-0357123382', 'IT035', 'Networking', 'Cengage Learning', '2023', 700, 'CompTIA Network+ certification study guide covering network fundamentals and troubleshooting.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(36, 'Linux Administration Handbook', 'Evi Nemeth', '978-0134277554', 'IT036', 'System Administration', 'Addison-Wesley', '2022', 1200, 'Complete guide to Linux system administration. Covers Red Hat, Ubuntu, and other distributions.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(37, 'Windows Server 2022 Administration', 'William Panek', '978-1119789850', 'IT037', 'System Administration', 'Wiley', '2023', 600, 'Comprehensive guide to Windows Server 2022 administration and configuration.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(38, 'Docker and Kubernetes for System Administrators', 'Bret Fisher', '978-1492040760', 'IT038', 'System Administration', 'O\'Reilly Media', '2022', 400, 'Container orchestration and management for system administrators using Docker and Kubernetes.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(39, 'The DevOps Handbook', 'Gene Kim', '978-1942788003', 'IT039', 'DevOps', 'IT Revolution Press', '2021', 500, 'How to create world-class agility, reliability, and security in technology organizations.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(40, 'Continuous Delivery', 'Jez Humble', '978-0321601919', 'IT040', 'DevOps', 'Addison-Wesley', '2022', 400, 'Reliable software releases through build, test, and deployment automation.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(41, 'Infrastructure as Code', 'Kief Morris', '978-1491924358', 'IT041', 'DevOps', 'O\'Reilly Media', '2021', 350, 'Managing and provisioning infrastructure through code and automation tools.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(42, 'Unity in Action', 'Joe Hocking', '978-1617294969', 'IT042', 'Game Development', 'Manning Publications', '2022', 400, 'Learn Unity game development with C#. Covers 2D and 3D game creation.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(43, 'Game Programming Patterns', 'Robert Nystrom', '978-0990582908', 'IT043', 'Game Development', 'Genever Benning', '2021', 300, 'Programming patterns specific to game development. Covers architecture and performance optimization.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(44, 'Mastering Bitcoin', 'Andreas M. Antonopoulos', '978-1491954386', 'IT044', 'Blockchain', 'O\'Reilly Media', '2022', 400, 'Technical guide to Bitcoin and cryptocurrency technologies.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(45, 'Blockchain Basics', 'Daniel Drescher', '978-1484226032', 'IT045', 'Blockchain', 'Apress', '2021', 250, 'Non-technical introduction to blockchain technology and its applications.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(46, 'IT Project Management', 'Kathy Schwalbe', '978-1337406521', 'IT046', 'Project Management', 'Cengage Learning', '2023', 600, 'Comprehensive guide to managing IT projects using PMI standards and best practices.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(47, 'Agile Project Management', 'Jim Highsmith', '978-0321658395', 'IT047', 'Project Management', 'Addison-Wesley', '2022', 400, 'Agile methodologies for software development projects and team management.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(48, 'Ethics in Information Technology', 'George Reynolds', '978-1337405876', 'IT048', 'IT Ethics', 'Cengage Learning', '2023', 400, 'Ethical issues in information technology including privacy, security, and intellectual property.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(49, 'Cyber Law and Ethics', 'Mark Grabowski', '978-1138334663', 'IT049', 'IT Law', 'Routledge', '2022', 350, 'Legal and ethical aspects of cyberspace, digital rights, and online behavior.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(50, 'Internet of Things (IoT) Fundamentals', 'David Hanes', '978-1587144561', 'IT050', 'IoT', 'Cisco Press', '2022', 500, 'Introduction to IoT technologies, protocols, and implementation strategies.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05'),
(51, 'Augmented Reality Development', 'Jonathan Linowes', '978-1484238844', 'IT051', 'AR/VR', 'Apress', '2021', 300, 'Building augmented reality applications using Unity and AR Foundation.', 'available', 1, 1, '2025-09-10 14:39:05', '2025-09-10 14:39:05');

--
-- Triggers `books`
--
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
  `borrowed_by_admin` int(11) NOT NULL,
  `returned_by_admin` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `borrowing_transactions`
--

INSERT INTO `borrowing_transactions` (`id`, `student_id_number`, `book_id`, `borrowed_date`, `due_date`, `returned_date`, `status`, `borrowed_by_admin`, `returned_by_admin`, `created_at`, `updated_at`) VALUES
(1, 'C22-0044', 1, '0000-00-00', '2025-09-17', '2025-09-10', 'returned', 1, 1, '2025-09-10 15:28:47', '2025-09-10 15:40:54'),
(2, 'C22-0044', 1, '0000-00-00', '2025-09-11', '2025-09-11', 'returned', 1, 1, '2025-09-10 15:41:34', '2025-09-11 13:24:55'),
(3, 'C22-0044', 2, '0000-00-00', '2025-09-11', '2025-09-11', 'returned', 1, 1, '2025-09-10 15:41:34', '2025-09-11 13:24:55'),
(4, 'C22-0044', 3, '0000-00-00', '2025-09-11', '2025-09-11', 'returned', 1, 1, '2025-09-10 15:41:34', '2025-09-11 13:24:55'),
(5, 'C22-0044', 1, '2025-09-11', '2025-09-12', '2025-09-14', 'returned', 1, 1, '2025-09-11 13:29:47', '2025-09-14 03:40:56'),
(6, 'C22-0044', 3, '2025-09-11', '2025-09-12', '2025-09-14', 'returned', 1, 1, '2025-09-11 13:29:47', '2025-09-14 03:40:56'),
(7, 'C22-0044', 5, '2025-09-11', '2025-09-12', '2025-09-14', 'returned', 1, 1, '2025-09-11 13:29:47', '2025-09-14 03:40:56'),
(8, 'C22-0044', 1, '2025-09-14', '2025-09-15', '2025-09-14', 'returned', 1, 1, '2025-09-14 03:46:23', '2025-09-14 03:46:54'),
(9, 'C22-0044', 2, '2025-09-14', '2025-09-15', '2025-09-14', 'returned', 1, 1, '2025-09-14 03:46:23', '2025-09-14 03:49:21'),
(10, 'C22-0044', 2, '2025-09-14', '2025-09-15', NULL, 'overdue', 1, NULL, '2025-09-14 03:49:48', '2025-09-16 04:32:24'),
(11, 'C22-0044', 1, '2025-09-14', '2025-09-15', NULL, 'overdue', 1, NULL, '2025-09-14 03:51:20', '2025-09-16 04:32:24'),
(12, 'C22-0044', 3, '2025-09-14', '2025-09-15', NULL, 'overdue', 1, NULL, '2025-09-14 03:51:20', '2025-09-16 04:32:24'),
(13, 'C22-0045', 4, '2025-09-14', '2025-09-15', NULL, 'overdue', 1, NULL, '2025-09-14 03:52:13', '2025-09-16 04:32:24'),
(14, 'C22-0045', 5, '2025-09-14', '2025-09-15', '2025-09-14', 'returned', 1, 1, '2025-09-14 03:52:13', '2025-09-14 03:52:53'),
(15, 'C22-0045', 6, '2025-09-14', '2025-09-16', '2025-09-15', 'returned', 1, 1, '2025-09-14 03:53:02', '2025-09-15 05:15:47'),
(16, 'C22-0045', 9, '2025-09-15', '2025-09-16', '2025-09-15', 'returned', 1, 1, '2025-09-15 04:59:43', '2025-09-15 05:14:51'),
(17, 'C22-0045', 9, '2025-09-15', '2025-09-16', NULL, 'overdue', 1, NULL, '2025-09-15 05:15:15', '2025-09-17 14:19:39'),
(18, 'C22-0045', 9, '2025-09-15', '2025-09-16', NULL, 'overdue', 1, NULL, '2025-09-15 05:15:57', '2025-09-17 14:19:39');

--
-- Triggers `borrowing_transactions`
--
DELIMITER $$
CREATE TRIGGER `create_fine_on_overdue` AFTER UPDATE ON `borrowing_transactions` FOR EACH ROW BEGIN
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
            1, -- Default admin ID
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
    UPDATE books SET status = 'borrowed' WHERE id = NEW.book_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_book_status_on_return` AFTER UPDATE ON `borrowing_transactions` FOR EACH ROW BEGIN
    IF NEW.status = 'returned' AND OLD.status != 'returned' THEN
        UPDATE books SET status = 'available' WHERE id = NEW.book_id;
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

--
-- Dumping data for table `fines`
--

INSERT INTO `fines` (`id`, `student_id_number`, `transaction_id`, `fine_amount`, `paid_amount`, `days_overdue`, `fine_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 'C22-0044', 2, 5.00, 5.00, 1, '2025-09-11', 'paid', '2025-09-10 22:27:54', '2025-09-11 13:24:55'),
(2, 'C22-0044', 2, 5.00, 5.00, 1, '2025-09-11', 'paid', '2025-09-10 22:27:54', '2025-09-11 13:24:55'),
(3, 'C22-0044', 3, 5.00, 5.00, 1, '2025-09-11', 'paid', '2025-09-10 22:27:54', '2025-09-11 13:24:55'),
(4, 'C22-0044', 3, 5.00, 5.00, 1, '2025-09-11', 'paid', '2025-09-10 22:27:54', '2025-09-11 13:24:55'),
(5, 'C22-0044', 4, 5.00, 5.00, 1, '2025-09-11', 'paid', '2025-09-10 22:27:54', '2025-09-11 13:24:55'),
(6, 'C22-0044', 4, 5.00, 5.00, 1, '2025-09-11', 'paid', '2025-09-10 22:27:54', '2025-09-11 13:24:55'),
(7, 'C22-0044', 5, 10.00, 10.00, 2, '2025-09-12', 'paid', '2025-09-11 16:00:04', '2025-09-14 03:40:56'),
(9, 'C22-0044', 6, 10.00, 10.00, 2, '2025-09-12', 'paid', '2025-09-11 16:00:04', '2025-09-14 03:40:56'),
(13, 'C22-0044', 7, 10.00, 10.00, 2, '2025-09-14', 'paid', '2025-09-14 03:27:49', '2025-09-14 03:40:56'),
(14, 'C22-0044', 10, 10.00, 0.00, 2, '2025-09-16', 'unpaid', '2025-09-16 04:32:24', '2025-09-17 14:28:10'),
(15, 'C22-0044', 10, 10.00, 0.00, 2, '2025-09-16', 'unpaid', '2025-09-16 04:32:24', '2025-09-17 14:28:10'),
(16, 'C22-0044', 11, 10.00, 0.00, 2, '2025-09-16', 'unpaid', '2025-09-16 04:32:24', '2025-09-17 14:28:10'),
(17, 'C22-0044', 11, 10.00, 0.00, 2, '2025-09-16', 'unpaid', '2025-09-16 04:32:24', '2025-09-17 14:28:10'),
(18, 'C22-0044', 12, 10.00, 0.00, 2, '2025-09-16', 'unpaid', '2025-09-16 04:32:24', '2025-09-17 14:28:10'),
(19, 'C22-0044', 12, 10.00, 0.00, 2, '2025-09-16', 'unpaid', '2025-09-16 04:32:24', '2025-09-17 14:28:10'),
(20, 'C22-0045', 13, 10.00, 0.00, 2, '2025-09-16', 'unpaid', '2025-09-16 04:32:24', '2025-09-17 14:28:10'),
(21, 'C22-0045', 13, 10.00, 0.00, 2, '2025-09-16', 'unpaid', '2025-09-16 04:32:24', '2025-09-17 14:28:10'),
(22, 'C22-0045', 17, 5.00, 0.00, 1, '2025-09-17', 'unpaid', '2025-09-17 14:19:39', '2025-09-17 14:28:10'),
(23, 'C22-0045', 17, 5.00, 0.00, 1, '2025-09-17', 'unpaid', '2025-09-17 14:19:39', '2025-09-17 14:28:10'),
(24, 'C22-0045', 18, 5.00, 0.00, 1, '2025-09-17', 'unpaid', '2025-09-17 14:19:39', '2025-09-17 14:28:10'),
(25, 'C22-0045', 18, 5.00, 0.00, 1, '2025-09-17', 'unpaid', '2025-09-17 14:19:39', '2025-09-17 14:28:10');

-- --------------------------------------------------------

--
-- Table structure for table `fine_payments`
--

CREATE TABLE `fine_payments` (
  `id` int(11) NOT NULL,
  `fine_id` int(11) NOT NULL,
  `payment_amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','card','online') DEFAULT 'cash',
  `processed_by` int(11) NOT NULL,
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
(1, 1, 'admin', '2025-09-10 14:44:43', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'),
(2, 1, 'admin', '2025-09-10 14:56:43', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'),
(4, 4, '', '2025-09-10 15:12:02', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(5, 1, 'admin', '2025-09-10 15:25:30', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'),
(6, 1, 'admin', '2025-09-11 13:09:04', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'),
(7, 4, '', '2025-09-11 13:11:50', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(8, 4, '', '2025-09-12 03:27:31', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(9, 4, '', '2025-09-12 03:47:52', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(10, 4, '', '2025-09-12 05:51:00', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(11, 1, 'admin', '2025-09-13 06:15:28', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'),
(12, 1, 'admin', '2025-09-13 10:59:19', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'),
(13, 4, '', '2025-09-13 12:05:16', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(14, 5, '', '2025-09-13 12:16:18', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(15, 5, '', '2025-09-13 12:24:19', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(16, 4, '', '2025-09-13 12:32:21', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(17, 4, '', '2025-09-14 02:43:26', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(18, 4, '', '2025-09-14 02:45:54', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(19, 4, '', '2025-09-14 02:57:18', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(20, 1, 'admin', '2025-09-15 02:54:51', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'),
(21, 4, '', '2025-09-15 03:05:17', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(22, 4, '', '2025-09-15 03:08:22', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(23, 4, '', '2025-09-15 03:16:30', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(24, 4, '', '2025-09-15 03:26:23', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(25, 4, '', '2025-09-15 03:38:25', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(26, 4, '', '2025-09-15 03:44:46', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(27, 4, '', '2025-09-15 03:52:01', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(28, 4, '', '2025-09-15 03:57:39', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(29, 5, '', '2025-09-15 04:00:25', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(30, 4, '', '2025-09-15 04:07:40', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(31, 4, '', '2025-09-15 04:31:31', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(32, 4, '', '2025-09-15 05:29:05', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(33, 4, '', '2025-09-15 05:31:16', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(34, 4, '', '2025-09-15 05:37:10', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(35, 4, '', '2025-09-15 05:41:58', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(36, 4, '', '2025-09-15 06:00:03', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(37, 1, 'admin', '2025-09-17 14:21:23', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'),
(38, 4, '', '2025-09-17 14:27:47', '::ffff:127.0.0.1', 'okhttp/4.9.2');

-- --------------------------------------------------------

--
-- Stand-in structure for view `overdue_books_with_fines`
-- (See below for the actual view)
--
CREATE TABLE `overdue_books_with_fines` (
`transaction_id` int(11)
,`student_id_number` varchar(10)
,`student_email` varchar(255)
,`first_name` varchar(100)
,`last_name` varchar(100)
,`book_id` int(11)
,`book_title` varchar(255)
,`book_author` varchar(255)
,`book_code` varchar(20)
,`borrowed_date` date
,`due_date` date
,`days_overdue` int(7)
,`fine_amount` decimal(10,2)
,`paid_amount` decimal(10,2)
,`fine_status` varchar(7)
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
  `returned_by_admin` int(11) NOT NULL,
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
  `returned_by_admin` int(11) NOT NULL,
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
(1, 1, 'C22-0044', 1, '2025-09-10 15:40:54', 1, 'good', '', 0.00, '', '', 'completed', '2025-09-10 15:40:54', '2025-09-10 15:40:54'),
(2, 8, 'C22-0044', 1, '2025-09-14 03:46:54', 1, 'good', '', 0.00, '', '', 'completed', '2025-09-14 03:46:54', '2025-09-14 03:46:54'),
(3, 9, 'C22-0044', 2, '2025-09-14 03:49:21', 1, 'good', '', 0.00, '', '', 'completed', '2025-09-14 03:49:21', '2025-09-14 03:49:21'),
(4, 14, 'C22-0045', 5, '2025-09-14 03:52:53', 1, 'good', '', 0.00, '', '', 'completed', '2025-09-14 03:52:53', '2025-09-14 03:52:53'),
(5, 16, 'C22-0045', 9, '2025-09-15 05:14:51', 1, 'good', '', 0.00, '', '', 'completed', '2025-09-15 05:14:51', '2025-09-15 05:14:51'),
(6, 15, 'C22-0045', 6, '2025-09-15 05:15:47', 1, 'good', '', 0.00, '', '', 'completed', '2025-09-15 05:15:47', '2025-09-15 05:15:47');

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
(1, 'C22-0044', '2025-09-14', '2026-02-14', 12, 5, 'active', '2025-09-10 15:28:47', '2025-09-14 03:51:20'),
(2, 'C22-0045', '2025-09-15', '2026-02-15', 6, 5, 'active', '2025-09-14 03:52:13', '2025-09-15 05:15:57');

-- --------------------------------------------------------

--
-- Table structure for table `student_borrowing_status`
--

CREATE TABLE `student_borrowing_status` (
  `id` int(11) NOT NULL,
  `student_id_number` varchar(10) NOT NULL,
  `can_borrow` tinyint(1) DEFAULT 1,
  `reason` text DEFAULT NULL,
  `updated_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_borrowing_status`
--

INSERT INTO `student_borrowing_status` (`id`, `student_id_number`, `can_borrow`, `reason`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'C22-0044', 0, 'Unpaid fines', 1, '2025-09-10 15:25:09', '2025-09-17 14:27:47'),
(167, 'C22-0045', 1, NULL, 1, '2025-09-14 03:51:33', '2025-09-15 05:15:57');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `description` text DEFAULT NULL,
  `updated_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `description`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'fine_per_day', '5.00', 'Fine amount per day for overdue books', 1, '2025-09-10 14:15:50', '2025-09-14 03:53:23'),
(2, 'max_books_per_student', '5', 'Maximum books a student can borrow', 1, '2025-09-10 14:15:50', '2025-09-14 03:53:23'),
(3, 'borrowing_duration_days', '14', 'Number of days a book can be borrowed', 1, '2025-09-10 14:15:50', '2025-09-14 03:53:23'),
(4, 'system_name', 'Capstone Library Management System', 'Name of the library system', 1, '2025-09-10 14:15:50', '2025-09-14 03:53:23'),
(5, 'system_email', 'library@capstone.com', 'System email address', 1, '2025-09-10 14:15:50', '2025-09-14 03:53:24'),
(11, 'borrowing_period_days', '1', NULL, 1, '2025-09-10 15:36:47', '2025-09-14 03:53:24'),
(18, 'books_required_per_semester', '20', NULL, 1, '2025-09-10 15:37:20', '2025-09-14 03:53:24'),
(19, 'semester_duration_months', '5', NULL, 1, '2025-09-10 15:37:20', '2025-09-14 03:53:24'),
(20, 'max_books_per_borrowing', '3', NULL, 1, '2025-09-10 15:37:20', '2025-09-14 03:53:24');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `id_number` varchar(10) NOT NULL,
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

INSERT INTO `users` (`id`, `id_number`, `email`, `password_hash`, `first_name`, `last_name`, `role`, `is_verified`, `email_verified`, `last_login`, `created_at`, `updated_at`, `reset_code`, `reset_expires`, `verification_code`, `verification_expires`) VALUES
(1, 'ADMIN001', 'admin@library.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System', 'Administrator', 'admin', 1, 1, NULL, '2025-09-10 14:15:50', '2025-09-10 14:26:40', NULL, NULL, NULL, NULL),
(4, 'C22-0044', 'rhodcelisterduallo.sol@my.smciligan.edu.ph', '$2a$10$GUpMnNVGIqEa8f.Apu3uq.BK7RNglfbti77JqjtsiHN9cD..akomi', 'Rhod', 'Sol', 'student', 1, 1, NULL, '2025-09-10 15:11:29', '2025-09-15 04:28:34', NULL, NULL, NULL, NULL),
(5, 'C22-0045', 'kierrehagamann.vosotros@my.smciligan.edu.ph', '$2a$10$mR5apbDn414c19etgQm1oOVFJ3uiFDXAxSHME8Tyf3SFDqI16dxxi', 'Tabong', 'Vosotros', 'student', 1, 1, NULL, '2025-09-13 12:12:00', '2025-09-15 04:29:29', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure for view `active_borrowing_status`
--
DROP TABLE IF EXISTS `active_borrowing_status`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `active_borrowing_status`  AS SELECT `u`.`id_number` AS `id_number`, `u`.`email` AS `email`, `u`.`first_name` AS `first_name`, `u`.`last_name` AS `last_name`, count(`bt`.`id`) AS `currently_borrowed`, count(case when `bt`.`status` = 'overdue' then 1 end) AS `overdue_count`, coalesce(sum(`f`.`fine_amount` - `f`.`paid_amount`),0) AS `unpaid_fine_amount`, `sbs`.`can_borrow` AS `can_borrow`, `sbs`.`reason` AS `borrowing_restriction_reason` FROM (((`users` `u` left join `borrowing_transactions` `bt` on(`u`.`id_number` = `bt`.`student_id_number` and `bt`.`status` in ('borrowed','overdue'))) left join `fines` `f` on(`u`.`id_number` = `f`.`student_id_number` and `f`.`status` = 'unpaid')) left join `student_borrowing_status` `sbs` on(`u`.`id_number` = `sbs`.`student_id_number`)) WHERE `u`.`role` = 'student' GROUP BY `u`.`id_number`, `u`.`email`, `u`.`first_name`, `u`.`last_name`, `sbs`.`can_borrow`, `sbs`.`reason` ;

-- --------------------------------------------------------

--
-- Structure for view `overdue_books_with_fines`
--
DROP TABLE IF EXISTS `overdue_books_with_fines`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `overdue_books_with_fines`  AS SELECT `bt`.`id` AS `transaction_id`, `bt`.`student_id_number` AS `student_id_number`, `u`.`email` AS `student_email`, `u`.`first_name` AS `first_name`, `u`.`last_name` AS `last_name`, `bt`.`book_id` AS `book_id`, `b`.`title` AS `book_title`, `b`.`author` AS `book_author`, `b`.`number_code` AS `book_code`, `bt`.`borrowed_date` AS `borrowed_date`, `bt`.`due_date` AS `due_date`, to_days(curdate()) - to_days(`bt`.`due_date`) AS `days_overdue`, coalesce(`f`.`fine_amount`,0) AS `fine_amount`, coalesce(`f`.`paid_amount`,0) AS `paid_amount`, coalesce(`f`.`status`,'unpaid') AS `fine_status`, `bt`.`status` AS `transaction_status` FROM (((`borrowing_transactions` `bt` join `users` `u` on(`bt`.`student_id_number` = `u`.`id_number`)) join `books` `b` on(`bt`.`book_id` = `b`.`id`)) left join `fines` `f` on(`bt`.`id` = `f`.`transaction_id`)) WHERE `bt`.`status` = 'overdue' AND `bt`.`due_date` < curdate() ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_table` (`table_name`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `number_code` (`number_code`),
  ADD UNIQUE KEY `isbn` (`isbn`),
  ADD KEY `idx_title` (`title`),
  ADD KEY `idx_author` (`author`),
  ADD KEY `idx_number_code` (`number_code`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_category` (`category`);

--
-- Indexes for table `borrowing_transactions`
--
ALTER TABLE `borrowing_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `borrowed_by_admin` (`borrowed_by_admin`),
  ADD KEY `returned_by_admin` (`returned_by_admin`),
  ADD KEY `idx_student` (`student_id_number`),
  ADD KEY `idx_book` (`book_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_due_date` (`due_date`),
  ADD KEY `idx_borrowed_date` (`borrowed_date`);

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
  ADD KEY `idx_payment_date` (`created_at`);

--
-- Indexes for table `login_logs`
--
ALTER TABLE `login_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_login_time` (`login_time`),
  ADD KEY `idx_user_type` (`user_type`);

--
-- Indexes for table `overdue_history`
--
ALTER TABLE `overdue_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `returned_by_admin` (`returned_by_admin`),
  ADD KEY `idx_student` (`student_id_number`),
  ADD KEY `idx_transaction` (`transaction_id`),
  ADD KEY `idx_returned_at` (`returned_at`);

--
-- Indexes for table `return_transactions`
--
ALTER TABLE `return_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `book_id` (`book_id`),
  ADD KEY `returned_by_admin` (`returned_by_admin`),
  ADD KEY `idx_transaction` (`transaction_id`),
  ADD KEY `idx_student` (`student_id_number`),
  ADD KEY `idx_returned_at` (`returned_at`),
  ADD KEY `idx_status` (`status`);

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
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `idx_student` (`student_id_number`),
  ADD KEY `idx_can_borrow` (`can_borrow`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `idx_setting_key` (`setting_key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_number` (`id_number`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_id_number` (`id_number`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `borrowing_transactions`
--
ALTER TABLE `borrowing_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `fines`
--
ALTER TABLE `fines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `fine_payments`
--
ALTER TABLE `fine_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `login_logs`
--
ALTER TABLE `login_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `overdue_history`
--
ALTER TABLE `overdue_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `return_transactions`
--
ALTER TABLE `return_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `semester_tracking`
--
ALTER TABLE `semester_tracking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `student_borrowing_status`
--
ALTER TABLE `student_borrowing_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=226;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `borrowing_transactions`
--
ALTER TABLE `borrowing_transactions`
  ADD CONSTRAINT `borrowing_transactions_ibfk_1` FOREIGN KEY (`student_id_number`) REFERENCES `users` (`id_number`) ON DELETE CASCADE,
  ADD CONSTRAINT `borrowing_transactions_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `borrowing_transactions_ibfk_3` FOREIGN KEY (`borrowed_by_admin`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `borrowing_transactions_ibfk_4` FOREIGN KEY (`returned_by_admin`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `fines`
--
ALTER TABLE `fines`
  ADD CONSTRAINT `fines_ibfk_1` FOREIGN KEY (`student_id_number`) REFERENCES `users` (`id_number`) ON DELETE CASCADE,
  ADD CONSTRAINT `fines_ibfk_2` FOREIGN KEY (`transaction_id`) REFERENCES `borrowing_transactions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `fine_payments`
--
ALTER TABLE `fine_payments`
  ADD CONSTRAINT `fine_payments_ibfk_1` FOREIGN KEY (`fine_id`) REFERENCES `fines` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fine_payments_ibfk_2` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `login_logs`
--
ALTER TABLE `login_logs`
  ADD CONSTRAINT `login_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `overdue_history`
--
ALTER TABLE `overdue_history`
  ADD CONSTRAINT `overdue_history_ibfk_1` FOREIGN KEY (`student_id_number`) REFERENCES `users` (`id_number`) ON DELETE CASCADE,
  ADD CONSTRAINT `overdue_history_ibfk_2` FOREIGN KEY (`transaction_id`) REFERENCES `borrowing_transactions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `overdue_history_ibfk_3` FOREIGN KEY (`returned_by_admin`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `return_transactions`
--
ALTER TABLE `return_transactions`
  ADD CONSTRAINT `return_transactions_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `borrowing_transactions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `return_transactions_ibfk_2` FOREIGN KEY (`student_id_number`) REFERENCES `users` (`id_number`) ON DELETE CASCADE,
  ADD CONSTRAINT `return_transactions_ibfk_3` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `return_transactions_ibfk_4` FOREIGN KEY (`returned_by_admin`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `semester_tracking`
--
ALTER TABLE `semester_tracking`
  ADD CONSTRAINT `semester_tracking_ibfk_1` FOREIGN KEY (`student_id_number`) REFERENCES `users` (`id_number`) ON DELETE CASCADE;

--
-- Constraints for table `student_borrowing_status`
--
ALTER TABLE `student_borrowing_status`
  ADD CONSTRAINT `student_borrowing_status_ibfk_1` FOREIGN KEY (`student_id_number`) REFERENCES `users` (`id_number`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_borrowing_status_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD CONSTRAINT `system_settings_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
