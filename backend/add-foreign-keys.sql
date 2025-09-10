-- Add foreign key constraints to return_transactions table
USE capstone_system;

-- Add foreign key constraints to return_transactions table
ALTER TABLE return_transactions 
ADD CONSTRAINT fk_return_student 
FOREIGN KEY (student_id_number) REFERENCES users(id_number) ON DELETE CASCADE;

ALTER TABLE return_transactions 
ADD CONSTRAINT fk_return_book 
FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;

ALTER TABLE return_transactions 
ADD CONSTRAINT fk_return_admin 
FOREIGN KEY (returned_by_admin) REFERENCES admins(id) ON DELETE CASCADE;

ALTER TABLE return_transactions 
ADD CONSTRAINT fk_return_borrowing 
FOREIGN KEY (active_borrowing_id) REFERENCES borrowing_transactions(id) ON DELETE CASCADE;

-- Add indexes for better performance
ALTER TABLE return_transactions 
ADD INDEX idx_student_return (student_id_number);

ALTER TABLE return_transactions 
ADD INDEX idx_return_date (returned_at);

ALTER TABLE return_transactions 
ADD INDEX idx_status (status);

-- Show the foreign key constraints
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'capstone_system' 
AND TABLE_NAME = 'return_transactions' 
AND REFERENCED_TABLE_NAME IS NOT NULL;
