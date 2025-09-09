-- Add Foreign Key Constraints to return_transactions table
-- This will ensure data integrity and proper relationships

USE capstone_system;

-- First, let's check if the table exists and its current structure
-- Then add the foreign key constraints

-- Add foreign key for return_request_id (if return_requests table exists)
-- ALTER TABLE return_transactions 
-- ADD CONSTRAINT fk_return_transactions_request 
-- FOREIGN KEY (return_request_id) REFERENCES return_requests(id) ON DELETE CASCADE;

-- Add foreign key for active_borrowing_id (if active_borrowings table exists)
-- ALTER TABLE return_transactions 
-- ADD CONSTRAINT fk_return_transactions_borrowing 
-- FOREIGN KEY (active_borrowing_id) REFERENCES active_borrowings(id) ON DELETE CASCADE;

-- Add foreign key for student_id_number
ALTER TABLE return_transactions 
ADD CONSTRAINT fk_return_transactions_student 
FOREIGN KEY (student_id_number) REFERENCES users(id_number) ON DELETE CASCADE;

-- Add foreign key for book_id
ALTER TABLE return_transactions 
ADD CONSTRAINT fk_return_transactions_book 
FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;

-- Add foreign key for returned_by_admin
ALTER TABLE return_transactions 
ADD CONSTRAINT fk_return_transactions_admin 
FOREIGN KEY (returned_by_admin) REFERENCES admins(id);

-- Add indexes for better performance
CREATE INDEX idx_return_transactions_student ON return_transactions(student_id_number);
CREATE INDEX idx_return_transactions_book ON return_transactions(book_id);
CREATE INDEX idx_return_transactions_admin ON return_transactions(returned_by_admin);
CREATE INDEX idx_return_transactions_date ON return_transactions(returned_at);
CREATE INDEX idx_return_transactions_status ON return_transactions(status);

-- Add a trigger to automatically update the books table when a return is processed
DELIMITER $$

CREATE TRIGGER tr_return_transactions_after_insert
AFTER INSERT ON return_transactions
FOR EACH ROW
BEGIN
    -- Update the book status to available when returned
    UPDATE books 
    SET status = 'available', 
        updated_at = NOW()
    WHERE id = NEW.book_id;
    
    -- Update the borrowing_transactions table to mark as returned
    UPDATE borrowing_transactions 
    SET status = 'returned',
        returned_at = NEW.returned_at,
        returned_by_admin = NEW.returned_by_admin,
        updated_at = NOW()
    WHERE student_id_number = NEW.student_id_number 
      AND book_id = NEW.book_id 
      AND status = 'borrowed';
END$$

DELIMITER ;

-- Create a view for return processing summary
CREATE OR REPLACE VIEW return_processing_summary AS
SELECT 
    rt.id,
    rt.student_id_number,
    u.email as student_email,
    rt.book_id,
    b.title as book_title,
    b.author as book_author,
    rt.returned_at,
    rt.return_condition,
    rt.condition_notes,
    rt.fine_applied,
    rt.fine_reason,
    rt.processing_notes,
    rt.status,
    a.username as processed_by_admin,
    bt.borrowed_at,
    bt.due_date,
    DATEDIFF(rt.returned_at, bt.due_date) as days_late,
    CASE 
        WHEN rt.returned_at > bt.due_date THEN 'overdue'
        WHEN DATEDIFF(bt.due_date, rt.returned_at) <= 1 THEN 'due_soon'
        ELSE 'normal'
    END as return_timing
FROM return_transactions rt
JOIN users u ON rt.student_id_number = u.id_number
JOIN books b ON rt.book_id = b.id
JOIN admins a ON rt.returned_by_admin = a.id
LEFT JOIN borrowing_transactions bt ON rt.student_id_number = bt.student_id_number 
    AND rt.book_id = bt.book_id 
    AND bt.status = 'returned'
    AND DATE(rt.returned_at) = DATE(bt.returned_at);
