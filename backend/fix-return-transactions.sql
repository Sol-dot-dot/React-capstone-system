-- Fix return_transactions table structure
-- This table is needed for the returning management system

USE capstone_system;

-- Create return_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS return_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    return_request_id INT NULL,
    active_borrowing_id INT NOT NULL,
    student_id_number VARCHAR(10) NOT NULL,
    book_id INT NOT NULL,
    returned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    returned_by_admin INT NOT NULL,
    return_condition ENUM('good', 'damaged', 'lost') DEFAULT 'good',
    condition_notes TEXT,
    fine_applied DECIMAL(10,2) DEFAULT 0.00,
    fine_reason TEXT,
    processing_notes TEXT,
    status ENUM('completed', 'pending_fine', 'disputed') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id_number) REFERENCES users(id_number) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (returned_by_admin) REFERENCES admins(id) ON DELETE CASCADE,
    FOREIGN KEY (active_borrowing_id) REFERENCES borrowing_transactions(id) ON DELETE CASCADE,
    INDEX idx_student_return (student_id_number),
    INDEX idx_return_date (returned_at),
    INDEX idx_status (status)
);

-- Show table structure
DESCRIBE return_transactions;
