
-- --------------------------------------------------------
-- Fixed version of capstone_system schema with corrected barcode_lookup view
-- --------------------------------------------------------

CREATE OR REPLACE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `barcode_lookup` AS
SELECT 
    'book' AS `type`,
    b.id AS `item_id`,
    b.barcode AS `barcode`,
    b.number_code AS `code`,
    b.title AS `name`,
    b.author AS `author`,
    b.status AS `status`,
    b.available_copies AS `available_copies`,
    b.book_copies AS `book_copies`
FROM books b
WHERE b.barcode IS NOT NULL

UNION ALL

SELECT 
    'student' AS `type`,
    u.id AS `item_id`,
    u.student_barcode AS `barcode`,
    u.id_number AS `code`,
    CONCAT(u.first_name, ' ', u.last_name) AS `name`,
    u.email AS `author`,
    CASE 
        WHEN u.is_verified = 1 THEN 'verified'
        ELSE 'unverified'
    END AS `status`,
    NULL AS `available_copies`,
    NULL AS `book_copies`
FROM users u
WHERE u.student_barcode IS NOT NULL
  AND u.role = 'student';

-- --------------------------------------------------------
-- Structure for view `overdue_books_with_fines`
-- --------------------------------------------------------

CREATE OR REPLACE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `overdue_books_with_fines` AS
SELECT 
    bt.id AS transaction_id,
    bt.student_id_number AS student_id_number,
    u.email AS student_email,
    u.first_name AS first_name,
    u.last_name AS last_name,
    bt.book_id AS book_id,
    b.title AS book_title,
    b.author AS book_author,
    b.number_code AS book_code,
    bt.borrowed_date AS borrowed_date,
    bt.due_date AS due_date,
    TO_DAYS(CURDATE()) - TO_DAYS(bt.due_date) AS days_overdue,
    COALESCE(f.fine_amount, 0) AS fine_amount,
    COALESCE(f.paid_amount, 0) AS paid_amount,
    COALESCE(f.status, 'unpaid') AS fine_status,
    bt.status AS transaction_status
FROM borrowing_transactions bt
JOIN users u ON bt.student_id_number = u.id_number
JOIN books b ON bt.book_id = b.id
LEFT JOIN fines f ON bt.id = f.transaction_id
WHERE bt.status = 'overdue'
  AND bt.due_date < CURDATE();
