-- Add books table to existing database
USE capstone_system;

-- Create books table
CREATE TABLE IF NOT EXISTS books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(13),
    publisher VARCHAR(255),
    publication_year INT,
    genre VARCHAR(100),
    description TEXT,
    barcode VARCHAR(50) UNIQUE NOT NULL,
    number_code VARCHAR(20) UNIQUE NOT NULL,
    status ENUM('available', 'borrowed', 'lost', 'maintenance') DEFAULT 'available',
    location VARCHAR(100),
    added_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (added_by) REFERENCES admins(id)
);

-- Add indexes for better performance
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_barcode ON books(barcode);
CREATE INDEX idx_books_number_code ON books(number_code);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_books_created_at ON books(created_at);
