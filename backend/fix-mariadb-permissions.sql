-- Fix MariaDB Root User Permissions
-- This grants the root user permission to connect from localhost

-- Create/Update root user for localhost
CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY '';

-- Grant all privileges
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Show current users to verify
SELECT User, Host FROM mysql.user WHERE User='root';
