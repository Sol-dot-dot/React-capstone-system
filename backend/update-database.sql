-- Database Update Script for Chatbot Integration
-- This script will update your books table to work with the chatbot

USE capstone_system;

-- Check current table structure
DESCRIBE books;

-- Add missing columns if they don't exist
-- Note: These commands will only add columns if they don't already exist

-- Add genre column if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'capstone_system' 
     AND TABLE_NAME = 'books' 
     AND COLUMN_NAME = 'genre') = 0,
    'ALTER TABLE books ADD COLUMN genre VARCHAR(100) DEFAULT "General"',
    'SELECT "genre column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add description column if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'capstone_system' 
     AND TABLE_NAME = 'books' 
     AND COLUMN_NAME = 'description') = 0,
    'ALTER TABLE books ADD COLUMN description TEXT DEFAULT "No description available"',
    'SELECT "description column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add availability column if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'capstone_system' 
     AND TABLE_NAME = 'books' 
     AND COLUMN_NAME = 'availability') = 0,
    'ALTER TABLE books ADD COLUMN availability BOOLEAN DEFAULT TRUE',
    'SELECT "availability column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Show updated table structure
DESCRIBE books;

-- Update existing books with sample data if columns were just added
UPDATE books SET 
    genre = COALESCE(genre, 'General'),
    description = COALESCE(description, 'A great book to read'),
    availability = COALESCE(availability, TRUE)
WHERE genre IS NULL OR description IS NULL OR availability IS NULL;

-- Show sample data
SELECT id, title, author, genre, LEFT(description, 50) as description_preview, availability 
FROM books 
LIMIT 5;

-- Count total books
SELECT COUNT(*) as total_books FROM books;
