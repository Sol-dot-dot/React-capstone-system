-- Add borrowing transactions table to existing database
USE capstone_system;

-- Create borrowing transactions table
CREATE TABLE IF NOT EXISTS borrowing_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id_number VARCHAR(10) NOT NULL,
    book_id INT NOT NULL,
    borrowed_by_admin INT NOT NULL,
    borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    returned_at TIMESTAMP NULL,
    returned_by_admin INT NULL,
    status ENUM('borrowed', 'returned', 'overdue') DEFAULT 'borrowed',
    notes TEXT,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (borrowed_by_admin) REFERENCES admins(id),
    FOREIGN KEY (returned_by_admin) REFERENCES admins(id)
);

-- Add indexes for better performance
CREATE INDEX idx_borrowing_student_id ON borrowing_transactions(student_id_number);
CREATE INDEX idx_borrowing_book_id ON borrowing_transactions(book_id);
CREATE INDEX idx_borrowing_status ON borrowing_transactions(status);
CREATE INDEX idx_borrowing_due_date ON borrowing_transactions(due_date);
CREATE INDEX idx_borrowing_borrowed_at ON borrowing_transactions(borrowed_at);

