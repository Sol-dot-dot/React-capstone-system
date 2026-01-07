const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    validateBorrowingRequest,
    processBorrowing,
    getBorrowingStats,
    checkStudentExists,
    getStudentBorrowedCount,
    createReturnTransaction
} = require('../utils/borrowingUtils');
const { createOrUpdateFine, updateSemesterBooksCount, calculateOverdueDays, checkAndUpdateStudentBorrowingStatus, getSystemSettings } = require('../utils/penaltyUtils');
const pool = require('../config/database');

const { logger } = require('../config/logger');
// GET /api/borrowing/stats - Get borrowing statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const stats = await getBorrowingStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        logger.error('Error fetching borrowing stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch borrowing statistics'
        });
    }
});

// GET /api/borrowing/check-eligibility/:idNumber - Check student borrowing eligibility
router.get('/check-eligibility/:idNumber', auth, async (req, res) => {
    try {
        const { idNumber } = req.params;

        if (!idNumber) {
            return res.status(400).json({
                success: false,
                message: 'Student ID number is required'
            });
        }

        // Check if student exists
        const student = await checkStudentExists(idNumber);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Check borrowing status
        const borrowingStatus = await checkAndUpdateStudentBorrowingStatus(idNumber);
        const currentBorrowed = await getStudentBorrowedCount(idNumber);

        // Get system settings for borrowing limits
        const settings = await getSystemSettings();
        const maxBooks = parseInt(settings.max_books_per_borrowing || 3);

        const canBorrow = borrowingStatus.canBorrow && currentBorrowed < maxBooks;

        res.json({
            success: true,
            data: {
                student: student,
                currentBorrowed: currentBorrowed,
                maxBooks: maxBooks,
                canBorrow: canBorrow,
                borrowingStatus: {
                    hasOverdueBooks: !borrowingStatus.canBorrow && borrowingStatus.reasonBlocked === 'Overdue books',
                    hasUnpaidFines: !borrowingStatus.canBorrow && borrowingStatus.reasonBlocked === 'Unpaid fines',
                    withinLimit: currentBorrowed < maxBooks,
                    reasonBlocked: borrowingStatus.reasonBlocked
                }
            }
        });
    } catch (error) {
        logger.error('Error checking borrowing eligibility:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check borrowing eligibility'
        });
    }
});

// POST /api/borrowing/validate - Validate borrowing request
router.post('/validate', auth, async (req, res) => {
    try {
        const { studentIdNumber, bookCodes } = req.body;

        if (!studentIdNumber || !bookCodes || !Array.isArray(bookCodes)) {
            return res.status(400).json({
                success: false,
                message: 'Student ID number and book codes array are required'
            });
        }

        const validation = await validateBorrowingRequest(studentIdNumber, bookCodes);

        if (validation.valid) {
            const currentBorrowed = await getStudentBorrowedCount(studentIdNumber);
            res.json({
                success: true,
                message: 'Borrowing request is valid',
                data: {
                    student: validation.student,
                    validBooks: validation.validations,
                    currentBorrowed: currentBorrowed,
                    canBorrow: true,
                    borrowingStatus: {
                        hasOverdueBooks: false,
                        hasUnpaidFines: false,
                        withinLimit: true
                    }
                }
            });
        } else {
            const currentBorrowed = await getStudentBorrowedCount(studentIdNumber);
            res.status(400).json({
                success: false,
                message: 'Borrowing request validation failed',
                errors: validation.errors,
                data: {
                    student: validation.student,
                    currentBorrowed: currentBorrowed,
                    canBorrow: false
                }
            });
        }
    } catch (error) {
        logger.error('Error validating borrowing request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate borrowing request'
        });
    }
});

// POST /api/borrowing/borrow - Process book borrowing
router.post('/borrow', auth, async (req, res) => {
    try {
        const { studentIdNumber, bookCodes, dueDate } = req.body;
        const adminId = req.user.id;

        if (!studentIdNumber || !bookCodes || !Array.isArray(bookCodes)) {
            return res.status(400).json({
                success: false,
                message: 'Student ID number and book codes array are required'
            });
        }

        // Validate the borrowing request
        const validation = await validateBorrowingRequest(studentIdNumber, bookCodes);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: 'Borrowing request validation failed',
                errors: validation.errors
            });
        }

        // Process the borrowing
        const result = await processBorrowing(studentIdNumber, bookCodes, adminId, dueDate);

        res.json({
            success: true,
            message: `Successfully borrowed ${bookCodes.length} book(s)`,
            data: {
                student: validation.student,
                borrowedBooks: result.borrowedBooks,
                dueDate: result.dueDate,
                transactionId: result.transactionId
            }
        });

    } catch (error) {
        logger.error('[ERROR] Error processing borrowing:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process borrowing transaction'
        });
    }
});

// GET /api/borrowing/student/:idNumber - Get student's borrowing history
router.get('/student/:idNumber', auth, async (req, res) => {
    try {
        const { idNumber } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        // Check if student exists
        const student = await checkStudentExists(idNumber);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Get current borrowed count
        const currentBorrowed = await getStudentBorrowedCount(idNumber);

        // Get borrowing history
        const [transactions] = await pool.execute(
            `SELECT
                bt.id,
                bt.student_id_number,
                bt.borrowed_date,
                bt.due_date,
                bt.returned_date,
                bt.status,
                b.title,
                b.author,
                b.number_code,
                COALESCE(a1.email, 'Unknown Admin') as borrowed_by,
                COALESCE(a2.email, NULL) as returned_by
             FROM borrowing_transactions bt
             JOIN books b ON bt.book_id = b.id
             LEFT JOIN users a1 ON bt.borrowed_by_admin = a1.id AND a1.role = 'admin'
             LEFT JOIN users a2 ON bt.returned_by_admin = a2.id AND a2.role = 'admin'
             WHERE bt.student_id_number = ?
             ORDER BY bt.borrowed_date DESC
             LIMIT ? OFFSET ?`,
            [idNumber, parseInt(limit), offset]
        );

        // Get total count
        const [totalRows] = await pool.execute(
            'SELECT COUNT(*) as count FROM borrowing_transactions WHERE student_id_number = ?',
            [idNumber]
        );

        res.json({
            success: true,
            data: {
                student,
                currentBorrowed,
                transactions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalRows[0].count,
                    pages: Math.ceil(totalRows[0].count / limit)
                }
            }
        });

    } catch (error) {
        logger.error('Error fetching student borrowing history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch student borrowing history'
        });
    }
});

// GET /api/borrowing/transactions - Get all borrowing transactions
router.get('/transactions', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let params = [];

        if (status) {
            whereClause += ' WHERE bt.status = ?';
            params.push(status);
        }

        if (search) {
            const searchWhere = whereClause ? ' AND' : ' WHERE';
            whereClause += `${searchWhere} (bt.student_id_number LIKE ? OR b.title LIKE ? OR b.number_code LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Get transactions
        const [transactions] = await pool.execute(
            `SELECT
                bt.id,
                bt.student_id_number,
                bt.borrowed_date,
                bt.due_date,
                bt.returned_date,
                bt.status,
                b.title,
                b.author,
                b.number_code,
                COALESCE(a1.email, 'Unknown Admin') as borrowed_by,
                COALESCE(a2.email, NULL) as returned_by
             FROM borrowing_transactions bt
             JOIN books b ON bt.book_id = b.id
             LEFT JOIN users a1 ON bt.borrowed_by_admin = a1.id AND a1.role = 'admin'
             LEFT JOIN users a2 ON bt.returned_by_admin = a2.id AND a2.role = 'admin'
             ${whereClause}
             ORDER BY bt.borrowed_date DESC
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        // Get total count
        const [totalRows] = await pool.execute(
            `SELECT COUNT(*) as count FROM borrowing_transactions bt
             JOIN books b ON bt.book_id = b.id
             LEFT JOIN users a1 ON bt.borrowed_by_admin = a1.id AND a1.role = 'admin'
             LEFT JOIN users a2 ON bt.returned_by_admin = a2.id AND a2.role = 'admin'
             ${whereClause}`,
            params
        );

        res.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalRows[0].count,
                    pages: Math.ceil(totalRows[0].count / limit)
                }
            }
        });

    } catch (error) {
        logger.error('Error fetching borrowing transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch borrowing transactions'
        });
    }
});

// POST /api/borrowing/return - Return borrowed books
router.post('/return', auth, async (req, res) => {
    try {
        const { transactionIds } = req.body;
        const adminId = req.user.id;

        if (!transactionIds || !Array.isArray(transactionIds)) {
            return res.status(400).json({
                success: false,
                message: 'Transaction IDs array is required'
            });
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const returnedBooks = [];
            const finesProcessed = [];

            for (const transactionId of transactionIds) {
                // Get transaction details
                const [transactionRows] = await connection.execute(
                    `SELECT bt.*, b.title, b.number_code
                     FROM borrowing_transactions bt
                     JOIN books b ON bt.book_id = b.id
                     WHERE bt.id = ? AND bt.status IN ('borrowed', 'overdue')`,
                    [transactionId]
                );

                if (transactionRows.length === 0) {
                    throw new Error(`Transaction ${transactionId} not found or already returned`);
                }

                const transaction = transactionRows[0];

                // Process fine if book is overdue
                if (transaction.status === 'overdue') {
                    try {
                        const fineResult = await createOrUpdateFine(transactionId, adminId);
                        if (fineResult.created) {
                            finesProcessed.push({
                                transactionId,
                                fineAmount: fineResult.fineAmount,
                                daysOverdue: fineResult.daysOverdue
                            });
                        }
                    } catch (fineError) {
                        logger.error(`Error processing fine for transaction ${transactionId}:`, fineError);
                        // Continue with return even if fine processing fails
                    }
                }

                // Update transaction status
                await connection.execute(
                    `UPDATE borrowing_transactions
                     SET status = 'returned', returned_date = CURDATE(), returned_by_admin = ?
                     WHERE id = ?`,
                    [adminId, transactionId]
                );

                // Increment available_copies (trigger will update status automatically)
                await connection.execute(
                    'UPDATE books SET available_copies = available_copies + 1 WHERE id = ? AND available_copies < book_copies',
                    [transaction.book_id]
                );

                // Create return transaction record
                await createReturnTransaction(
                    transactionId,
                    adminId,
                    'good',
                    transaction.status === 'overdue' ? 'Overdue book returned' : 'Book returned on time',
                    transaction.status === 'overdue' ? 'Overdue book processed' : 'Normal return processed'
                );

                returnedBooks.push({
                    transactionId,
                    bookTitle: transaction.title,
                    bookCode: transaction.number_code,
                    returnedAt: new Date(),
                    wasOverdue: transaction.status === 'overdue'
                });
            }

            await connection.commit();

            res.json({
                success: true,
                message: `Successfully returned ${returnedBooks.length} book(s)`,
                data: {
                    returnedBooks,
                    finesProcessed
                }
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        logger.error('Error processing book return:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to process book return'
        });
    }
});

// GET /api/borrowing/admin/search/:idNumber - Get student's borrowed books (admin only)
router.get('/admin/search/:idNumber', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { idNumber } = req.params;

        // Check if student exists
        const student = await checkStudentExists(idNumber);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Get all borrowed books (including overdue)
        const [borrowedBooks] = await pool.execute(
            `SELECT
                bt.id,
                bt.borrowed_date,
                bt.due_date,
                bt.returned_date,
                bt.status,
                b.title,
                b.author,
                b.number_code,
                b.id as book_id
             FROM borrowing_transactions bt
             JOIN books b ON bt.book_id = b.id
             WHERE bt.student_id_number = ?
             AND bt.status IN ('borrowed', 'overdue', 'returned')
             ORDER BY
                CASE
                    WHEN bt.status = 'borrowed' THEN 1
                    WHEN bt.status = 'overdue' THEN 2
                    WHEN bt.status = 'returned' THEN 3
                END,
                bt.due_date ASC`,
            [idNumber]
        );

        // Calculate due date status for each book
        const booksWithStatus = borrowedBooks.map(book => {
            const dueDate = new Date(book.due_date);
            const today = new Date();

            // Reset time to compare only dates
            today.setHours(0, 0, 0, 0);
            dueDate.setHours(0, 0, 0, 0);

            let dueStatus = 'normal';
            let daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            let isOverdue = false;

            if (book.status === 'returned') {
                dueStatus = 'returned';
                daysUntilDue = 0;
                isOverdue = false;
            } else if (dueDate < today) {
                dueStatus = 'overdue';
                daysUntilDue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
                isOverdue = true;
            } else if (dueDate.getTime() === today.getTime()) {
                dueStatus = 'due_today';
                daysUntilDue = 0;
            }

            return {
                ...book,
                dueStatus,
                daysUntilDue,
                isOverdue
            };
        });

        res.json({
            success: true,
            data: {
                student: {
                    idNumber: student.id_number,
                    email: student.email,
                    isVerified: student.is_verified
                },
                borrowedBooks: booksWithStatus,
                totalBorrowed: booksWithStatus.length,
                overdueCount: booksWithStatus.filter(book => book.isOverdue).length
            }
        });

    } catch (error) {
        logger.error('Error fetching student borrowed books:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch student borrowed books'
        });
    }
});

// POST /api/borrowing/admin/return - Process individual book return (admin only)
router.post('/admin/return', auth, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const {
            transactionId,
            returnCondition = 'good',
            conditionNotes = '',
            processingNotes = ''
        } = req.body;
        const adminId = req.user.id;

        if (transactionId === undefined || transactionId === null) {
            return res.status(400).json({
                success: false,
                message: 'Transaction ID is required'
            });
        }

        // Get transaction details
        const [transactions] = await connection.execute(
            `SELECT bt.*, b.title, b.author, b.number_code, u.id_number, u.email
             FROM borrowing_transactions bt
             JOIN books b ON bt.book_id = b.id
             JOIN users u ON bt.student_id_number = u.id_number
             WHERE bt.id = ? AND bt.status IN ('borrowed', 'overdue')`,
            [transactionId]
        );

        if (transactions.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Transaction not found or already returned'
            });
        }

        const transaction = transactions[0];

        // Check if book is overdue
        const dueDate = new Date(transaction.due_date);
        const today = new Date();
        const isOverdue = dueDate < today;
        let fineApplied = 0;
        let fineReason = '';

        // If overdue, check if there are unpaid fines
        if (isOverdue) {
            const [unpaidFines] = await connection.execute(
                `SELECT COUNT(*) as count FROM fines
                 WHERE student_id_number = ? AND status = 'unpaid'`,
                [transaction.student_id_number]
            );

            if (unpaidFines[0].count > 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Cannot return overdue book. Student has unpaid fines. Please process payment in Penalty Management first.',
                    requiresPayment: true,
                    studentId: transaction.student_id_number
                });
            }

            // Calculate fine for overdue return
            const daysOverdue = calculateOverdueDays(transaction.due_date);
            const [settings] = await connection.execute(
                `SELECT setting_value FROM system_settings WHERE setting_key = 'fine_per_day'`
            );
            const finePerDay = settings.length > 0 ? parseFloat(settings[0].setting_value) : 5;
            fineApplied = daysOverdue * finePerDay;
            fineReason = `Overdue return: ${daysOverdue} days late`;
        }

        // Insert into return_transactions table
        const [returnResult] = await connection.execute(
            `INSERT INTO return_transactions (
                transaction_id,
                student_id_number,
                book_id,
                returned_at,
                returned_by_admin,
                return_condition,
                condition_notes,
                fine_applied,
                fine_reason,
                processing_notes,
                status
            ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)`,
            [
                transactionId, // active_borrowing_id (using transaction ID)
                transaction.student_id_number,
                transaction.book_id,
                adminId,
                returnCondition,
                conditionNotes,
                fineApplied,
                fineReason,
                processingNotes,
                fineApplied > 0 ? 'pending_fine' : 'completed'
            ]
        );

        // Process the return
        await connection.execute(
            `UPDATE borrowing_transactions
             SET status = 'returned',
                 returned_date = CURDATE(),
                 returned_by_admin = ?
             WHERE id = ?`,
            [adminId, transactionId]
        );

        // Increment available_copies (trigger will update status automatically)
        await connection.execute(
            `UPDATE books
             SET available_copies = available_copies + 1
             WHERE id = ? AND available_copies < book_copies`,
            [transaction.book_id]
        );

        // If there's a fine, create a fine record
        if (fineApplied > 0) {
            await connection.execute(
                `INSERT INTO fines (
                    student_id_number,
                    transaction_id,
                    fine_amount,
                    days_overdue,
                    fine_date,
                    status
                ) VALUES (?, ?, ?, ?, CURDATE(), 'unpaid')`,
                [
                    transaction.student_id_number,
                    transactionId,
                    fineApplied,
                    Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24))
                ]
            );
        }

        await connection.commit();

        res.json({
            success: true,
            message: `Book "${transaction.title}" by ${transaction.author} has been successfully returned by ${transaction.id_number}`,
            data: {
                returnTransactionId: returnResult.insertId,
                transactionId,
                bookTitle: transaction.title,
                bookAuthor: transaction.author,
                studentId: transaction.student_id_number,
                returnedAt: new Date().toISOString(),
                returnCondition,
                fineApplied,
                fineReason
            }
        });

    } catch (error) {
        await connection.rollback();
        logger.error('Error processing book return:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process book return'
        });
    } finally {
        connection.release();
    }
});

// GET /api/borrowing/admin/returns - Get return transaction history (admin only)
router.get('/admin/returns', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { page = 1, limit = 20, studentId, bookId, status, condition } = req.query;
        const offset = (page - 1) * limit;

        let whereConditions = [];
        let queryParams = [];

        if (studentId) {
            whereConditions.push('rt.student_id_number = ?');
            queryParams.push(studentId);
        }

        if (bookId) {
            whereConditions.push('rt.book_id = ?');
            queryParams.push(bookId);
        }

        if (status) {
            whereConditions.push('rt.status = ?');
            queryParams.push(status);
        }

        if (condition) {
            whereConditions.push('rt.return_condition = ?');
            queryParams.push(condition);
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        // Get return transactions with details
        const [returns] = await pool.execute(
            `SELECT
                rt.*,
                u.email as student_email,
                b.title as book_title,
                b.author as book_author,
                b.number_code as book_code,
                a.username as processed_by_admin,
                bt.borrowed_date,
                bt.due_date,
                DATEDIFF(rt.returned_date, bt.due_date) as days_late
             FROM return_transactions rt
             JOIN users u ON rt.student_id_number = u.id_number
             JOIN books b ON rt.book_id = b.id
             JOIN users a ON rt.returned_by_admin = a.id AND a.role = 'admin'
             LEFT JOIN borrowing_transactions bt ON rt.transaction_id = bt.id
             ${whereClause}
             ORDER BY rt.returned_date DESC
             LIMIT ? OFFSET ?`,
            [...queryParams, parseInt(limit), parseInt(offset)]
        );

        // Get total count
        const [countResult] = await pool.execute(
            `SELECT COUNT(*) as total
             FROM return_transactions rt
             ${whereClause}`,
            queryParams
        );

        const total = countResult[0].total;

        res.json({
            success: true,
            data: {
                returns,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        logger.error('Error fetching return transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch return transactions'
        });
    }
});

// GET /api/borrowing/user/:idNumber - Get user's own borrowed books (for mobile app)
router.get('/user/:idNumber', auth, async (req, res) => {
    try {
        const { idNumber } = req.params;

        // Security: Verify user can only access their own data (or admin can access any)
        if (req.user.type !== 'admin' && req.user.idNumber !== idNumber) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own borrowed books.'
            });
        }

        // Check if student exists
        const student = await checkStudentExists(idNumber);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Get current borrowed books (only active/not returned)
        const [borrowedBooks] = await pool.execute(
            `SELECT
                bt.id,
                bt.borrowed_date,
                bt.due_date,
                bt.status,
                b.title,
                b.author,
                b.number_code
             FROM borrowing_transactions bt
             JOIN books b ON bt.book_id = b.id
             WHERE bt.student_id_number = ?
             AND bt.status IN ('borrowed', 'overdue')
             ORDER BY bt.due_date ASC`,
            [idNumber]
        );

        // Calculate due date status for each book
        const booksWithStatus = borrowedBooks.map(book => {
            const dueDate = new Date(book.due_date);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Reset time to compare only dates
            today.setHours(0, 0, 0, 0);
            tomorrow.setHours(0, 0, 0, 0);
            dueDate.setHours(0, 0, 0, 0);

            let dueStatus = 'normal';
            let daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

            if (dueDate < today) {
                dueStatus = 'overdue';
                daysUntilDue = Math.abs(daysUntilDue);
            } else if (dueDate.getTime() === today.getTime()) {
                dueStatus = 'today';
                daysUntilDue = 0;
            } else if (dueDate.getTime() === tomorrow.getTime()) {
                dueStatus = 'tomorrow';
                daysUntilDue = 1;
            } else if (daysUntilDue <= 3) {
                dueStatus = 'near';
            }

            return {
                ...book,
                dueStatus,
                daysUntilDue
            };
        });

        res.json({
            success: true,
            data: {
                student,
                borrowedBooks: booksWithStatus,
                totalBorrowed: booksWithStatus.length
            }
        });

    } catch (error) {
        logger.error('Error fetching user borrowed books:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch borrowed books'
        });
    }
});

// GET /api/borrowing/user/:idNumber/history - Get user's complete borrowing history (for mobile app)
router.get('/user/:idNumber/history', auth, async (req, res) => {
    try {
        const { idNumber } = req.params;

        // Security: Verify user can only access their own data (or admin can access any)
        if (req.user.type !== 'admin' && req.user.idNumber !== idNumber) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own borrowing history.'
            });
        }

        // Check if student exists
        const student = await checkStudentExists(idNumber);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Get summary statistics
        const [summaryStats] = await pool.execute(`
            SELECT
                COUNT(DISTINCT bt.id) as total_borrowed,
                SUM(CASE WHEN bt.returned_date IS NOT NULL THEN 1 ELSE 0 END) as total_returned,
                SUM(CASE WHEN bt.returned_date IS NULL THEN 1 ELSE 0 END) as currently_borrowed,
                COALESCE(SUM(f.fine_amount), 0) as total_fines_incurred,
                COALESCE(SUM(f.paid_amount), 0) as total_fines_paid,
                COALESCE(SUM(f.fine_amount - f.paid_amount), 0) as outstanding_balance
            FROM borrowing_transactions bt
            LEFT JOIN fines f ON bt.id = f.transaction_id
            WHERE bt.student_id_number = ?
        `, [idNumber]);

        const summary = {
            totalBorrowed: parseInt(summaryStats[0].total_borrowed) || 0,
            totalReturned: parseInt(summaryStats[0].total_returned) || 0,
            currentlyBorrowed: parseInt(summaryStats[0].currently_borrowed) || 0,
            totalFinesIncurred: parseFloat(summaryStats[0].total_fines_incurred) || 0,
            totalFinesPaid: parseFloat(summaryStats[0].total_fines_paid) || 0,
            outstandingBalance: parseFloat(summaryStats[0].outstanding_balance) || 0
        };

        // Get all borrowings with book details
        const [allBorrowings] = await pool.execute(`
            SELECT
                bt.id,
                b.title as book_title,
                b.author,
                b.number_code,
                bt.borrowed_date,
                bt.due_date,
                bt.returned_date,
                bt.status,
                CASE
                    WHEN bt.returned_date IS NULL AND bt.due_date < NOW() THEN DATEDIFF(NOW(), bt.due_date)
                    WHEN bt.returned_date IS NOT NULL AND bt.returned_date > bt.due_date THEN DATEDIFF(bt.returned_date, bt.due_date)
                    ELSE 0
                END as days_late,
                COALESCE(f.fine_amount, 0) as fine_amount,
                COALESCE(f.paid_amount, 0) as paid_amount,
                YEAR(bt.borrowed_date) as borrow_year,
                MONTH(bt.borrowed_date) as borrow_month
            FROM borrowing_transactions bt
            JOIN books b ON bt.book_id = b.id
            LEFT JOIN fines f ON bt.id = f.transaction_id
            WHERE bt.student_id_number = ?
            ORDER BY bt.borrowed_date DESC
        `, [idNumber]);

        // Group borrowings by academic year (June to May pattern)
        const borrowingsByYear = {};

        for (const b of allBorrowings) {
            // Determine academic year: if month is June-Dec, it's start of academic year
            // If month is Jan-May, it belongs to previous academic year
            let academicYearStart;
            if (b.borrow_month >= 6) {
                academicYearStart = b.borrow_year;
            } else {
                academicYearStart = b.borrow_year - 1;
            }

            const academicYearName = `${academicYearStart}-${academicYearStart + 1}`;

            // Determine semester
            let semesterNumber, semesterName;
            if (b.borrow_month >= 6 && b.borrow_month <= 10) {
                semesterNumber = 1;
                semesterName = '1st Semester';
            } else if (b.borrow_month >= 11 || b.borrow_month <= 3) {
                semesterNumber = 2;
                semesterName = '2nd Semester';
            } else {
                semesterNumber = 3;
                semesterName = 'Summer';
            }

            if (!borrowingsByYear[academicYearName]) {
                borrowingsByYear[academicYearName] = {
                    academicYear: academicYearName,
                    startYear: academicYearStart,
                    semesters: {}
                };
            }

            if (!borrowingsByYear[academicYearName].semesters[semesterNumber]) {
                borrowingsByYear[academicYearName].semesters[semesterNumber] = {
                    semesterNumber,
                    semesterName,
                    borrowings: []
                };
            }

            // Determine book status
            let bookStatus = 'returned';
            if (!b.returned_date) {
                bookStatus = b.days_late > 0 ? 'overdue' : 'borrowed';
            } else if (b.days_late > 0) {
                bookStatus = 'returned_late';
            }

            borrowingsByYear[academicYearName].semesters[semesterNumber].borrowings.push({
                id: b.id,
                bookTitle: b.book_title,
                author: b.author,
                numberCode: b.number_code,
                borrowedDate: b.borrowed_date,
                dueDate: b.due_date,
                returnedDate: b.returned_date,
                status: bookStatus,
                daysLate: b.days_late,
                fineAmount: parseFloat(b.fine_amount || 0),
                paidAmount: parseFloat(b.paid_amount || 0)
            });
        }

        // Convert to array and sort by year (most recent first)
        const sortedYears = Object.values(borrowingsByYear).sort((a, b) => b.startYear - a.startYear);

        // Build final academic years data
        const academicYears = sortedYears.map((year) => {
            const semestersData = Object.values(year.semesters)
                .sort((a, b) => b.semesterNumber - a.semesterNumber) // Most recent semester first
                .map(semester => ({
                    semesterNumber: semester.semesterNumber,
                    semesterName: semester.semesterName,
                    booksCount: semester.borrowings.length,
                    borrowings: semester.borrowings
                }));

            const totalBooksInYear = semestersData.reduce((sum, sem) => sum + sem.booksCount, 0);

            return {
                academicYear: year.academicYear,
                totalBooks: totalBooksInYear,
                semesters: semestersData
            };
        });

        res.json({
            success: true,
            data: {
                student: {
                    idNumber: student.id_number,
                    firstName: student.first_name,
                    lastName: student.last_name,
                    email: student.email
                },
                summary,
                academicYears
            }
        });

    } catch (error) {
        logger.error('Error fetching user borrowing history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch borrowing history'
        });
    }
});

// GET /api/borrowing/user/:idNumber/semester-count - Get user's semester book count
router.get('/user/:idNumber/semester-count', auth, async (req, res) => {
    try {
        const { idNumber } = req.params;

        // Security: Verify user can only access their own data (or admin can access any)
        if (req.user.type !== 'admin' && req.user.idNumber !== idNumber) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own semester data.'
            });
        }

        // Get required books from system settings
        const [settingsData] = await pool.execute(`
            SELECT setting_value FROM system_settings
            WHERE setting_key = 'books_required_per_semester'
        `);
        const requiredBooks = settingsData.length > 0 ? parseInt(settingsData[0].setting_value) || 20 : 20;

        // Get semester tracking data
        const [semesterData] = await pool.execute(`
            SELECT
                books_borrowed_count,
                max_books_allowed,
                status as semester_status
            FROM semester_tracking
            WHERE student_id_number = ?
            ORDER BY created_at DESC
            LIMIT 1
        `, [idNumber]);

        if (semesterData.length === 0) {
            // If no semester tracking data, return 0
            return res.json({
                success: true,
                data: {
                    booksThisSemester: 0,
                    requiredBooks,
                    booksRemaining: requiredBooks,
                    clearanceStatus: 'needs_improvement'
                }
            });
        }

        const semester = semesterData[0];
        const booksThisSemester = semester.books_borrowed_count || 0;
        const booksRemaining = Math.max(0, requiredBooks - booksThisSemester);

        const clearanceStatus = booksThisSemester >= requiredBooks ? 'completed' :
                               booksThisSemester >= Math.ceil(requiredBooks * 0.75) ? 'near_completion' :
                               booksThisSemester >= Math.ceil(requiredBooks * 0.5) ? 'in_progress' : 'needs_improvement';

        res.json({
            success: true,
            data: {
                booksThisSemester,
                requiredBooks,
                booksRemaining,
                clearanceStatus
            }
        });

    } catch (error) {
        logger.error('Error fetching semester count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch semester count'
        });
    }
});

module.exports = router;
