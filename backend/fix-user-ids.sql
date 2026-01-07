-- ============================================
-- FIX USER IDs - Run this in phpMyAdmin SQL tab
-- ============================================
-- Problem: All students have id=0, which breaks lookups
-- Solution: Assign unique sequential IDs to each user
-- ============================================

-- Step 1: Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Step 2: Set all current IDs to negative (to avoid duplicate key errors)
UPDATE users SET id = -(id) - 1000 WHERE id >= 0;

-- Step 3: Assign new sequential IDs (admin=1, then students by id_number)
SET @counter = 0;
UPDATE users
SET id = (@counter := @counter + 1)
ORDER BY CASE WHEN role = 'admin' THEN 0 ELSE 1 END, id_number ASC;

-- Step 4: Reset AUTO_INCREMENT to continue from the highest ID + 1
SET @max_id = (SELECT COALESCE(MAX(id), 0) + 1 FROM users);
SET @sql = CONCAT('ALTER TABLE users AUTO_INCREMENT = ', @max_id);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 5: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Step 6: Verify the fix - each user should have a unique positive ID
SELECT id, id_number, CONCAT(first_name, ' ', last_name) AS name, role
FROM users
ORDER BY id;
