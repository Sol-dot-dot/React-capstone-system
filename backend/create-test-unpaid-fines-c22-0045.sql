-- Create unpaid fines for C22-0045 to test payment process
USE capstone_system;

-- First, let's see what fines currently exist for C22-0045
SELECT 'Current fines for C22-0045:' as info;
SELECT 
    id, student_id_number, transaction_id, fine_amount, paid_amount, status, fine_date
FROM fines 
WHERE student_id_number = 'C22-0045';

-- Create some unpaid fines for C22-0045
INSERT IGNORE INTO fines (student_id_number, transaction_id, fine_amount, days_overdue, fine_date, status) VALUES
('C22-0045', 1, 30.00, 2, CURDATE(), 'unpaid'),
('C22-0045', 2, 25.00, 1, CURDATE(), 'unpaid');

-- Show updated fines
SELECT 'Updated fines for C22-0045:' as info;
SELECT 
    student_id_number, 
    COUNT(*) as total_fines,
    SUM(CASE WHEN status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_fines,
    SUM(fine_amount) as total_amount,
    SUM(CASE WHEN status = 'unpaid' THEN fine_amount ELSE 0 END) as unpaid_amount
FROM fines 
WHERE student_id_number = 'C22-0045'
GROUP BY student_id_number;
