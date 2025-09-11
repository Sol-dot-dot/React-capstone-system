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
const { createOrUpdateFine, updateSemesterBooksCount } = require('../utils/penaltyUtils');
const pool = require('../config/database');

// GET /api/borrowing/stats - Get borrowing statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const stats = await getBorrowingStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching borrowing stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch borrowing statistics'
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
            res.json({
                success: true,
                message: 'Borrowing request is valid',
                data: {
                    student: validation.student,
                    validBooks: validation.validations,
                    currentBorrowed: await getStudentBorrowedCount(studentIdNumber)
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Borrowing request validation failed',
                errors: validation.errors
            });
        }
    } catch (error) {
        console.error('Error validating borrowing request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate borrowing request'
        });
    }
});

// POST /api/borrowing/borrow - Process book borrowing
router.post('/borrow', auth, async (req, res) => {
    try {
        console.log('🔍 Borrowing API called with:', req.body);
        console.log('🔍 Admin ID:', req.user.id);
        
        const { studentIdNumber, bookCodes, dueDate } = req.body;
        const adminId = req.user.id;

        if (!studentIdNumber || !bookCodes || !Array.isArray(bookCodes)) {
            console.log('❌ Invalid request data');
            return res.status(400).json({
                success: false,
                message: 'Student ID number and book codes array are required'
            });
        }

        console.log('✅ Request data validated, proceeding with validation...');

        // Validate the borrowing request
        const validation = await validateBorrowingRequest(studentIdNumber, bookCodes);
        
        if (!validation.valid) {
            console.log('❌ Validation failed:', validation.errors);
            return res.status(400).json({
                success: false,
                message: 'Borrowing request validation failed',
                errors: validation.errors
            });
        }

        console.log('✅ Validation successful, processing borrowing...');

        // Process the borrowing
        const result = await processBorrowing(studentIdNumber, bookCodes, adminId, dueDate);

        console.log('✅ Borrowing processed successfully:', result);

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
        console.error('❌ Error processing borrowing:', error);
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
        console.error('Error fetching student borrowing history:', error);
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
        console.error('Error fetching borrowing transactions:', error);
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
                        console.error(`Error processing fine for transaction ${transactionId}:`, fineError);
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

                // Update book status to available
                await connection.execute(
                    'UPDATE books SET status = "available" WHERE id = ?',
                    [transaction.book_id]
                );

                // Create return transaction record
                try {
                    await createReturnTransaction(
                        transactionId, 
                        adminId, 
                        'good', 
                        null, 
                        transaction.status === 'overdue' ? 'Overdue book returned' : 'Book returned on time'
                    );
                    console.log('✅ Return transaction record created for transaction:', transactionId);
                } catch (returnError) {
                    console.error('❌ Error creating return transaction record:', returnError);
                    // Continue processing even if return transaction creation fails
                }

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
        console.error('Error processing book return:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to process book return'
        });
    }
});

// GET /api/borrowing/admin/search/:idNumber - Get student's borrowed books (admin only)
router.get('/admin/search/:idNumber', auth, async (req, res) => {
    try {
        console.log('🔍 Admin search request for student:', req.params.idNumber);
        console.log('🔍 User type:', req.user.type);
        
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { idNumber } = req.params;

        // Check if student exists
        console.log('🔍 Checking if student exists:', idNumber);
        const student = await checkStudentExists(idNumber);
        console.log('🔍 Student lookup result:', student);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Get all borrowed books (including overdue)
        console.log('🔍 Querying borrowed books for student:', idNumber);
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
        console.log('🔍 Borrowed books query result:', borrowedBooks);

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
        console.error('Error fetching student borrowed books:', error);
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

        if (!transactionId) {
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
            const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
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

        // Update book status to available
        await connection.execute(
            `UPDATE books 
             SET status = 'available'
             WHERE id = ?`,
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
        console.error('Error processing book return:', error);
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
        console.error('Error fetching return transactions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch return transactions'
        });
    }
});

// GET /api/borrowing/user/:idNumber - Get user's own borrowed books (for mobile app)
router.get('/user/:idNumber', async (req, res) => {
    try {
        const { idNumber } = req.params;

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
        console.error('Error fetching user borrowed books:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch borrowed books'
        });
    }
});

module.exports = router;

