-- Add sample books to the database
USE capstone_system;

-- Insert sample books
INSERT INTO books (title, author, isbn, genre, status, added_by, created_at) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'Fiction', 'available', 1, NOW()),
('To Kill a Mockingbird', 'Harper Lee', '9780061120084', 'Fiction', 'available', 1, NOW()),
('1984', 'George Orwell', '9780451524935', 'Fiction', 'available', 1, NOW()),
('Pride and Prejudice', 'Jane Austen', '9780141439518', 'Fiction', 'available', 1, NOW()),
('The Hobbit', 'J.R.R. Tolkien', '9780547928227', 'Fantasy', 'available', 1, NOW()),
('Harry Potter and the Philosopher\'s Stone', 'J.K. Rowling', '9780747532699', 'Fantasy', 'available', 1, NOW()),
('The Catcher in the Rye', 'J.D. Salinger', '9780316769174', 'Fiction', 'available', 1, NOW()),
('Lord of the Flies', 'William Golding', '9780571056866', 'Fiction', 'available', 1, NOW()),
('Animal Farm', 'George Orwell', '9780451526342', 'Fiction', 'available', 1, NOW()),
('Brave New World', 'Aldous Huxley', '9780060850524', 'Fiction', 'available', 1, NOW()),
('The Chronicles of Narnia', 'C.S. Lewis', '9780064471190', 'Fantasy', 'available', 1, NOW()),
('The Lord of the Rings', 'J.R.R. Tolkien', '9780544003415', 'Fantasy', 'available', 1, NOW()),
('Jane Eyre', 'Charlotte Brontë', '9780141441146', 'Fiction', 'available', 1, NOW()),
('Wuthering Heights', 'Emily Brontë', '9780141439556', 'Fiction', 'available', 1, NOW()),
('Moby Dick', 'Herman Melville', '9780142437247', 'Fiction', 'available', 1, NOW());

-- Show the results
SELECT COUNT(*) as total_books FROM books;
SELECT status, COUNT(*) as count FROM books GROUP BY status;
