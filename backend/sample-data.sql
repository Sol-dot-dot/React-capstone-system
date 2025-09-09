-- Sample data for testing
USE capstone_system;

-- Insert sample users
INSERT INTO users (id_number, email, password, is_verified) VALUES
('C22-0044', 'rhodcelisterduallo.sol@my.smciligan.edu.ph', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE),
('C22-0045', 'kierrehagamann.vosotros@my.smciligan.edu.ph', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE),
('C22-0046', 'kerneilrommelsayaang.gocotano@my.smciligan.edu.ph', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', FALSE),
('C22-0047', 'michaelvincentbicoy.rendado@my.smciligan.edu.ph', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', FALSE);

-- Insert sample books
INSERT INTO books (title, author, isbn, publisher, publication_year, genre, description, barcode, number_code, status, location, added_by) VALUES
('JavaScript: The Good Parts', 'Douglas Crockford', '9780596517748', 'O\'Reilly Media', 2008, 'Programming', 'A guide to the good parts of JavaScript', 'JS001', 'JS-001', 'available', 'Shelf A1', 1),
('Eloquent JavaScript', 'Marijn Haverbeke', '9781593279509', 'No Starch Press', 2018, 'Programming', 'A modern introduction to programming', 'JS002', 'JS-002', 'available', 'Shelf A1', 1),
('You Don\'t Know JS', 'Kyle Simpson', '9781491924464', 'O\'Reilly Media', 2015, 'Programming', 'Up & Going - A book series on JavaScript', 'JS003', 'JS-003', 'borrowed', 'Shelf A1', 1),
('React: Up & Running', 'Stoyan Stefanov', '9781491931820', 'O\'Reilly Media', 2016, 'Web Development', 'Building Web Applications', 'REACT001', 'REACT-001', 'available', 'Shelf B1', 1),
('Vue.js: Up and Running', 'Callum Macrae', '9781491997239', 'O\'Reilly Media', 2018, 'Web Development', 'Building Accessible and Performant Web Apps', 'VUE001', 'VUE-001', 'available', 'Shelf B1', 1),
('Node.js Design Patterns', 'Mario Casciaro', '9781783287314', 'Packt Publishing', 2016, 'Programming', 'Master Node.js and build scalable applications', 'NODE001', 'NODE-001', 'available', 'Shelf C1', 1),
('Clean Code', 'Robert C. Martin', '9780132350884', 'Prentice Hall', 2008, 'Programming', 'A Handbook of Agile Software Craftsmanship', 'CLEAN001', 'CLEAN-001', 'available', 'Shelf C1', 1),
('Design Patterns', 'Gang of Four', '9780201633610', 'Addison-Wesley', 1994, 'Programming', 'Elements of Reusable Object-Oriented Software', 'DP001', 'DP-001', 'available', 'Shelf C1', 1);

-- Insert sample borrowing transactions
INSERT INTO borrowing_transactions (student_id_number, book_id, borrowed_at, due_date, status, borrowed_by_admin) VALUES
('C22-0044', 3, '2025-09-01', '2025-09-15', 'borrowed', 1),
('C22-0045', 1, '2025-09-02', '2025-09-16', 'returned', 1),
('C22-0044', 2, '2025-09-03', '2025-09-17', 'borrowed', 1),
('C22-0046', 1, '2025-09-05', '2025-09-19', 'borrowed', 1);

-- Insert sample login logs
INSERT INTO login_logs (user_id, user_type, login_time, ip_address, user_agent) VALUES
(1, 'admin', '2025-09-09 11:32:17', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(2, 'user', '2025-09-09 10:15:30', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(3, 'user', '2025-09-09 09:45:12', '::ffff:127.0.0.1', 'okhttp/4.9.2'),
(4, 'user', '2025-09-09 08:30:45', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

-- Insert sample fines
INSERT INTO fines (student_id_number, transaction_id, fine_amount, days_overdue, fine_date, status) VALUES
('C22-0044', 1, 15.00, 3, '2025-09-09', 'unpaid'),
('C22-0045', 2, 10.00, 2, '2025-09-08', 'paid');

-- Insert semester tracking
INSERT INTO semester_tracking (student_id_number, semester, books_borrowed_count, status, created_at) VALUES
('C22-0044', '2025-1', 21, 'active', '2025-09-01 00:00:00'),
('C22-0045', '2025-1', 3, 'active', '2025-09-01 00:00:00');
