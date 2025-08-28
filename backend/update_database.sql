-- Update existing users table to add password reset fields
USE capstone_system;

-- Add password reset fields to users table
ALTER TABLE users 
ADD COLUMN reset_code VARCHAR(6) NULL,
ADD COLUMN reset_expires TIMESTAMP NULL;

-- Verify the changes
DESCRIBE users;
