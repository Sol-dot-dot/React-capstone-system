const db = require('../config/database');
const { 
    getSystemSettings, 
    checkAndUpdateStudentBorrowingStatus,
    updateSemesterBooksCount,
    createOrUpdateSemesterTracking
} = require('./penaltyUtils');

// Calculate due date (default from system settings)
async function calculateDueDate(borrowDate = new Date()) {
    try {
        const settings = await getSystemSettings();
        const days = parseInt(settings.borrowing_period_days || 7);
        const dueDate = new Date(borrowDate);
        dueDate.setDate(dueDate.getDate() + days);
        return dueDate;
    } catch (error) {
        console.error('Error getting system settings for due date calculation:', error);
        // Fallback to 7 days if settings can't be retrieved
        const dueDate = new Date(borrowDate);
        dueDate.setDate(dueDate.getDate() + 7);
        return dueDate;
    }
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

    // Check if student can borrow (no unpaid fines or overdue books)
    const borrowingStatus = await checkAndUpdateStudentBorrowingStatus(studentIdNumber);
    if (!borrowingStatus.canBorrow) {
        errors.push(`Student cannot borrow books: ${borrowingStatus.reasonBlocked}`);
        return { valid: false, errors };
    }

    // Get system settings for borrowing limits
    const settings = await getSystemSettings();
    const maxBooks = parseInt(settings.max_books_per_borrowing || 3);

    // Check number of books
    if (bookCodes.length > maxBooks) {
        errors.push(`Maximum ${maxBooks} books can be borrowed at once`);
        return { valid: false, errors };
    }

    // Check current borrowed count
    const currentBorrowed = await getStudentBorrowedCount(studentIdNumber);
    if (currentBorrowed + bookCodes.length > maxBooks) {
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

        const actualDueDate = dueDate || await calculateDueDate();
        const borrowedBooks = [];

        // Ensure student has active semester tracking
        const currentDate = new Date();
        const semesterEndDate = new Date(currentDate);
        semesterEndDate.setMonth(semesterEndDate.getMonth() + 5); // 5 months from now
        
        await createOrUpdateSemesterTracking(
            studentIdNumber, 
            currentDate.toISOString().split('T')[0], 
            semesterEndDate.toISOString().split('T')[0]
        );

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
                 (student_id_number, book_id, borrowed_date, borrowed_by_admin, due_date) 
                 VALUES (?, ?, CURDATE(), ?, ?)`,
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

        // Update semester books count (increment by number of books borrowed)
        await updateSemesterBooksCount(studentIdNumber, bookCodes.length);

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
            "SELECT COUNT(*) as count FROM borrowing_transactions WHERE DATE(borrowed_date) = CURDATE()"
        );

        // Today's returns
        const [todayReturns] = await db.execute(
            "SELECT COUNT(*) as count FROM borrowing_transactions WHERE DATE(returned_date) = CURDATE()"
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

// Create return transaction record
async function createReturnTransaction(transactionId, adminId, returnCondition = 'good', conditionNotes = null, processingNotes = null) {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        console.log(`🔄 Creating return transaction for borrowing transaction ID: ${transactionId}`);

        // Get the borrowing transaction details
        const [transactionRows] = await connection.execute(
            `SELECT bt.*, b.title as book_title, b.author as book_author, b.number_code as book_code
             FROM borrowing_transactions bt
             JOIN books b ON bt.book_id = b.id
             WHERE bt.id = ?`,
            [transactionId]
        );

        if (transactionRows.length === 0) {
            throw new Error(`Borrowing transaction ${transactionId} not found`);
        }

        const transaction = transactionRows[0];

        // Check if return transaction already exists
        const [existingReturns] = await connection.execute(
            'SELECT id FROM return_transactions WHERE transaction_id = ?',
            [transactionId]
        );

        if (existingReturns.length > 0) {
            console.log(`Return transaction already exists for borrowing transaction ${transactionId}`);
            return { created: false, returnId: existingReturns[0].id };
        }

        // Create return transaction record
        const [returnResult] = await connection.execute(
            `INSERT INTO return_transactions 
             (transaction_id, student_id_number, book_id, returned_at, returned_by_admin, 
              return_condition, condition_notes, processing_notes, status) 
             VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, 'completed')`,
            [
                transactionId,
                transaction.student_id_number,
                transaction.book_id,
                adminId,
                returnCondition,
                conditionNotes,
                processingNotes
            ]
        );

        await connection.commit();

        console.log(`✅ Return transaction created successfully! ID: ${returnResult.insertId}`);
        console.log(`📊 Book: ${transaction.book_title}, Student: ${transaction.student_id_number}`);
        
        return {
            created: true,
            returnId: returnResult.insertId,
            transactionId: transactionId,
            studentIdNumber: transaction.student_id_number,
            bookTitle: transaction.book_title
        };

    } catch (error) {
        await connection.rollback();
        console.error('Error creating return transaction:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Ensure all returned books have return transaction records
async function ensureReturnTransactionRecords(studentIdNumber, adminId) {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        console.log(`🔍 Checking for missing return transaction records for student: ${studentIdNumber}`);

        // Find all returned books that don't have return transaction records
        const [missingReturns] = await connection.execute(`
            SELECT bt.id as transaction_id, bt.student_id_number, bt.book_id, bt.returned_date, bt.due_date,
                   b.title as book_title, b.author as book_author, b.number_code as book_code
            FROM borrowing_transactions bt
            JOIN books b ON bt.book_id = b.id
            LEFT JOIN return_transactions rt ON bt.id = rt.transaction_id
            WHERE bt.student_id_number = ? 
            AND bt.status = 'returned' 
            AND rt.id IS NULL
        `, [studentIdNumber]);

        console.log(`📊 Found ${missingReturns.length} returned books without return transaction records`);

        let createdCount = 0;
        for (const book of missingReturns) {
            try {
                const wasOverdue = book.returned_date && book.due_date && new Date(book.returned_date) > new Date(book.due_date);
                
                await connection.execute(
                    `INSERT INTO return_transactions 
                     (transaction_id, student_id_number, book_id, returned_at, returned_by_admin, 
                      return_condition, condition_notes, processing_notes, status) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed')`,
                    [
                        book.transaction_id,
                        book.student_id_number,
                        book.book_id,
                        book.returned_date || new Date(),
                        adminId,
                        'good',
                        wasOverdue ? 'Overdue book returned (retroactive record)' : 'Book returned on time (retroactive record)',
                        wasOverdue ? 'Overdue book processed - retroactive record creation' : 'Normal return - retroactive record creation'
                    ]
                );

                createdCount++;
                console.log(`✅ Created retroactive return transaction for book: ${book.book_title}`);
            } catch (error) {
                console.error(`❌ Error creating retroactive return transaction for book ${book.book_title}:`, error);
            }
        }

        await connection.commit();
        
        console.log(`✅ Created ${createdCount} retroactive return transaction records for student ${studentIdNumber}`);
        return { created: createdCount, total: missingReturns.length };

    } catch (error) {
        await connection.rollback();
        console.error('Error ensuring return transaction records:', error);
        throw error;
    } finally {
        connection.release();
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
    getBorrowingStats,
    createReturnTransaction,
    ensureReturnTransactionRecords
};

