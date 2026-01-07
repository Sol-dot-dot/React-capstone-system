-- Fast cleanup of duplicate fines
-- This SQL script removes all duplicate fines, keeping only the minimum ID for each transaction

-- Step 1: Create a temporary table with fines to keep (one per transaction)
CREATE TEMPORARY TABLE fines_to_keep AS
SELECT MIN(id) as keep_id, transaction_id
FROM fines
GROUP BY transaction_id;

-- Step 2: Delete all fines that are NOT in the keep list
DELETE FROM fines
WHERE id NOT IN (
    SELECT keep_id FROM fines_to_keep
);

-- Step 3: Verify - this should return 0 rows
SELECT transaction_id, COUNT(*) as count
FROM fines
GROUP BY transaction_id
HAVING COUNT(*) > 1;

-- Step 4: Show cleanup results
SELECT
    (SELECT COUNT(*) FROM fines) as total_fines_remaining,
    (SELECT COUNT(DISTINCT transaction_id) FROM fines) as unique_transactions;

-- Cleanup
DROP TEMPORARY TABLE IF EXISTS fines_to_keep;
