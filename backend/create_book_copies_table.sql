-- Create book_copies table to track individual copies of books
CREATE TABLE IF NOT EXISTS book_copies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    copy_number VARCHAR(20) NOT NULL, -- e.g., "001", "002", "A", "B"
    barcode VARCHAR(50) UNIQUE, -- Unique barcode for each copy
    status ENUM('available', 'borrowed', 'reserved', 'maintenance', 'lost') DEFAULT 'available',
    condition_status ENUM('excellent', 'good', 'fair', 'poor', 'damaged') DEFAULT 'good',
    location VARCHAR(100), -- e.g., "Shelf A-1", "Reference Section"
    notes TEXT, -- Additional notes about the copy
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_book_id (book_id),
    INDEX idx_status (status),
    INDEX idx_barcode (barcode)
);

-- Insert sample book copies for existing books
-- This will create 2-3 copies for each book in the database
INSERT INTO book_copies (book_id, copy_number, barcode, status, condition_status, location) VALUES
-- For book_id 1 (Introduction to Programming with Python)
(1, '001', 'BC001001', 'available', 'excellent', 'Shelf A-1'),
(1, '002', 'BC001002', 'borrowed', 'good', 'Shelf A-1'),
(1, '003', 'BC001003', 'available', 'good', 'Shelf A-1'),

-- For book_id 2 (Java: The Complete Reference)
(2, '001', 'BC002001', 'borrowed', 'excellent', 'Shelf A-2'),
(2, '002', 'BC002002', 'available', 'good', 'Shelf A-2'),

-- For book_id 3 (C++ Programming)
(3, '001', 'BC003001', 'borrowed', 'good', 'Shelf A-3'),
(3, '002', 'BC003002', 'available', 'excellent', 'Shelf A-3'),
(3, '003', 'BC003003', 'available', 'good', 'Shelf A-3'),

-- For book_id 4 (Data Structures and Algorithms)
(4, '001', 'BC004001', 'borrowed', 'excellent', 'Shelf A-4'),
(4, '002', 'BC004002', 'available', 'good', 'Shelf A-4'),

-- For book_id 5 (Web Development with HTML, CSS, and JavaScript)
(5, '001', 'BC005001', 'available', 'excellent', 'Shelf B-1'),
(5, '002', 'BC005002', 'available', 'good', 'Shelf B-1'),

-- For book_id 6 (React: Up & Running)
(6, '001', 'BC006001', 'borrowed', 'good', 'Shelf B-2'),
(6, '002', 'BC006002', 'available', 'excellent', 'Shelf B-2'),

-- For book_id 7 (Node.js in Action)
(7, '001', 'BC007001', 'available', 'good', 'Shelf B-3'),
(7, '002', 'BC007002', 'available', 'excellent', 'Shelf B-3'),

-- For book_id 8 (MongoDB: The Definitive Guide)
(8, '001', 'BC008001', 'available', 'good', 'Shelf C-1'),
(8, '002', 'BC008002', 'available', 'good', 'Shelf C-1'),

-- For book_id 9 (MySQL Cookbook)
(9, '001', 'BC009001', 'available', 'excellent', 'Shelf C-2'),
(9, '002', 'BC009002', 'available', 'good', 'Shelf C-2'),

-- For book_id 10 (Android Programming: The Big Nerd Ranch Guide)
(10, '001', 'BC010001', 'available', 'excellent', 'Shelf D-1'),
(10, '002', 'BC010002', 'available', 'good', 'Shelf D-1'),
(10, '003', 'BC010003', 'available', 'good', 'Shelf D-1'),

-- For book_id 11 (iOS Programming: The Big Nerd Ranch Guide)
(11, '001', 'BC011001', 'available', 'excellent', 'Shelf D-2'),
(11, '002', 'BC011002', 'available', 'good', 'Shelf D-2'),

-- For book_id 12 (Game Programming Patterns)
(12, '001', 'BC012001', 'available', 'excellent', 'Shelf E-1'),
(12, '002', 'BC012002', 'available', 'good', 'Shelf E-1'),

-- For book_id 13 (Clean Code)
(13, '001', 'BC013001', 'available', 'excellent', 'Shelf E-2'),
(13, '002', 'BC013002', 'available', 'good', 'Shelf E-2'),

-- For book_id 14 (Design Patterns)
(14, '001', 'BC014001', 'available', 'excellent', 'Shelf E-3'),
(14, '002', 'BC014002', 'available', 'good', 'Shelf E-3'),

-- For book_id 15 (Agile Project Management)
(15, '001', 'BC015001', 'available', 'excellent', 'Shelf F-1'),
(15, '002', 'BC015002', 'available', 'good', 'Shelf F-1');

-- Update the books table to add a total_copies column
ALTER TABLE books ADD COLUMN total_copies INT DEFAULT 1 AFTER status;

-- Update the total_copies count for each book
UPDATE books SET total_copies = (
    SELECT COUNT(*) FROM book_copies WHERE book_id = books.id
);

-- Add an available_copies column to show how many copies are currently available
ALTER TABLE books ADD COLUMN available_copies INT DEFAULT 1 AFTER total_copies;

-- Update the available_copies count for each book
UPDATE books SET available_copies = (
    SELECT COUNT(*) FROM book_copies 
    WHERE book_id = books.id AND status = 'available'
);
