-- Create unpaid fines for testing the "Paid" button
-- Run this in your MySQL database

USE capstone_system;

-- First, let's see what fines currently exist
SELECT 
    student_id_number, 
    status, 
    COUNT(*) as count,
    SUM(amount) as total_amount
FROM fines 
GROUP BY student_id_number, status;

-- Reset some paid fines to unpaid for testing
UPDATE fines 
SET status = 'unpaid' 
WHERE student_id_number IN ('C22-0045', 'C22-0044') 
AND status = 'paid'
LIMIT 2;

-- Show the updated status
SELECT 
    student_id_number, 
    COUNT(*) as total_fines,
    SUM(CASE WHEN status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_fines,
    SUM(amount) as total_amount,
    SUM(CASE WHEN status = 'unpaid' THEN amount ELSE 0 END) as unpaid_amount
FROM fines 
WHERE student_id_number IN ('C22-0045', 'C22-0044')
GROUP BY student_id_number;
