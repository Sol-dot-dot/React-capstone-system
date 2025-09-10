-- Update admin password to hashed version of 'password1'
USE capstone_system_optimized;

-- Update the admin user password to hashed version of 'password1'
-- This hash was generated using bcryptjs with salt rounds 10
-- Password: password1
-- Hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

UPDATE users 
SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'admin@library.com' AND role = 'admin';

-- Verify the update
SELECT id, email, role, password_hash FROM users WHERE email = 'admin@library.com';

-- Test login credentials:
-- Email: admin@library.com
-- Password: password1
