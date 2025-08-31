const db = require('../config/database');

// Calculate due date (default 14 days from now)
function calculateDueDate(borrowDate = new Date(), days = 14) {
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate;
}

// Validate student ID number format
function validateStudentId(idNumber) {
    const idPattern = /^[A-Z]\d{2}-\d{4}$/;
    return idPattern.test(idNumber);
}

// Check if student exists in database
async function checkStudentExists(idNumber) {
    try {
        const [rows] = await db.execute(
            'SELECT id, id_number, email FROM users WHERE id_number = ?',
            [idNumber]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error checking student existence:', error);
        throw error;
    }
}

// Check if book exists and is available
async function checkBookAvailability(bookCode) {
    try {
        const [rows] = await db.execute(
            'SELECT id, title, author, number_code, status FROM books WHERE number_code = ?',
            [bookCode]
        );
        
        if (rows.length === 0) {
            return { exists: false, message: 'Book not found' };
        }
        
        const book = rows[0];
        if (book.status !== 'available') {
            return { 
                exists: true, 
                available: false, 
                message: `Book is currently ${book.status}`,
                book 
            };
        }
        
        return { exists: true, available: true, book };
    } catch (error) {
        console.error('Error checking book availability:', error);
        throw error;
    }
}

// Check how many books a student currently has borrowed
async function getStudentBorrowedCount(studentIdNumber) {
    try {
        const [rows] = await db.execute(
            `SELECT COUNT(*) as count 
             FROM borrowing_transactions 
             WHERE student_id_number = ? AND status = 'borrowed'`,
            [studentIdNumber]
        );
        return rows[0].count;
    } catch (error) {
        console.error('Error getting student borrowed count:', error);
        throw error;
    }
}

// Validate borrowing request
async function validateBorrowingRequest(studentIdNumber, bookCodes) {
    const errors = [];
    const validations = [];

    // Validate student ID format
    if (!validateStudentId(studentIdNumber)) {
        errors.push('Invalid student ID format. Must be in format XXX-XXXX (e.g., C22-0044)');
        return { valid: false, errors };
    }

    // Check if student exists
    const student = await checkStudentExists(studentIdNumber);
    if (!student) {
        errors.push('Student ID not found in the system');
        return { valid: false, errors };
    }

    // Check number of books (max 3)
    if (bookCodes.length > 3) {
        errors.push('Maximum 3 books can be borrowed at once');
        return { valid: false, errors };
    }

    // Check current borrowed count
    const currentBorrowed = await getStudentBorrowedCount(studentIdNumber);
    if (currentBorrowed + bookCodes.length > 3) {
        errors.push(`Student already has ${currentBorrowed} books borrowed. Cannot borrow ${bookCodes.length} more books.`);
        return { valid: false, errors };
    }

    // Validate each book
    for (const bookCode of bookCodes) {
        const bookValidation = await checkBookAvailability(bookCode);
        validations.push({ bookCode, ...bookValidation });
        
        if (!bookValidation.exists) {
            errors.push(`Book with code ${bookCode} not found`);
        } else if (!bookValidation.available) {
            errors.push(`Book "${bookValidation.book.title}" (${bookCode}) is not available: ${bookValidation.message}`);
        }
    }

    // Check for duplicate book codes
    const uniqueCodes = [...new Set(bookCodes)];
    if (uniqueCodes.length !== bookCodes.length) {
        errors.push('Duplicate book codes are not allowed');
    }

    return {
        valid: errors.length === 0,
        errors,
        student,
        validations: validations.filter(v => v.exists && v.available)
    };
}

// Process borrowing transaction
async function processBorrowing(studentIdNumber, bookCodes, adminId, dueDate = null) {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        const actualDueDate = dueDate || calculateDueDate();
        const borrowedBooks = [];

        for (const bookCode of bookCodes) {
            // Get book details
            const [bookRows] = await connection.execute(
                'SELECT id, title, number_code FROM books WHERE number_code = ?',
                [bookCode]
            );

            if (bookRows.length === 0) {
                throw new Error(`Book with code ${bookCode} not found`);
            }

            const book = bookRows[0];

            // Create borrowing transaction
            await connection.execute(
                `INSERT INTO borrowing_transactions 
                 (student_id_number, book_id, borrowed_by_admin, due_date) 
                 VALUES (?, ?, ?, ?)`,
                [studentIdNumber, book.id, adminId, actualDueDate]
            );

            // Update book status to borrowed
            await connection.execute(
                'UPDATE books SET status = "borrowed" WHERE id = ?',
                [book.id]
            );

            borrowedBooks.push({
                id: book.id,
                title: book.title,
                number_code: book.number_code
            });
        }

        await connection.commit();
        return {
            success: true,
            borrowedBooks,
            dueDate: actualDueDate
        };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Get borrowing statistics
async function getBorrowingStats() {
    try {
        // Total borrowed books
        const [totalBorrowed] = await db.execute(
            "SELECT COUNT(*) as count FROM borrowing_transactions WHERE status = 'borrowed'"
        );

        // Overdue books
        const [overdueBooks] = await db.execute(
            "SELECT COUNT(*) as count FROM borrowing_transactions WHERE status = 'borrowed' AND due_date < NOW()"
        );

        // Today's borrowings
        const [todayBorrowings] = await db.execute(
            "SELECT COUNT(*) as count FROM borrowing_transactions WHERE DATE(borrowed_at) = CURDATE()"
        );

        // Today's returns
        const [todayReturns] = await db.execute(
            "SELECT COUNT(*) as count FROM borrowing_transactions WHERE DATE(returned_at) = CURDATE()"
        );

        return {
            totalBorrowed: totalBorrowed[0].count,
            overdueBooks: overdueBooks[0].count,
            todayBorrowings: todayBorrowings[0].count,
            todayReturns: todayReturns[0].count
        };
    } catch (error) {
        console.error('Error getting borrowing stats:', error);
        throw error;
    }
}

module.exports = {
    calculateDueDate,
    validateStudentId,
    checkStudentExists,
    checkBookAvailability,
    getStudentBorrowedCount,
    validateBorrowingRequest,
    processBorrowing,
    getBorrowingStats
};

