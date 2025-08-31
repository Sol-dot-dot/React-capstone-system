const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
    validateBorrowingRequest, 
    processBorrowing, 
    getBorrowingStats,
    checkStudentExists,
    getStudentBorrowedCount
} = require('../utils/borrowingUtils');
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
                bt.borrowed_at,
                bt.due_date,
                bt.returned_at,
                bt.status,
                bt.notes,
                b.title,
                b.author,
                b.number_code,
                b.barcode,
                a1.username as borrowed_by,
                a2.username as returned_by
             FROM borrowing_transactions bt
             JOIN books b ON bt.book_id = b.id
             JOIN admins a1 ON bt.borrowed_by_admin = a1.id
             LEFT JOIN admins a2 ON bt.returned_by_admin = a2.id
             WHERE bt.student_id_number = ?
             ORDER BY bt.borrowed_at DESC
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
                bt.borrowed_at,
                bt.due_date,
                bt.returned_at,
                bt.status,
                bt.notes,
                b.title,
                b.author,
                b.number_code,
                b.barcode,
                a1.username as borrowed_by,
                a2.username as returned_by
             FROM borrowing_transactions bt
             JOIN books b ON bt.book_id = b.id
             JOIN admins a1 ON bt.borrowed_by_admin = a1.id
             LEFT JOIN admins a2 ON bt.returned_by_admin = a2.id
             ${whereClause}
             ORDER BY bt.borrowed_at DESC
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        // Get total count
        const [totalRows] = await pool.execute(
            `SELECT COUNT(*) as count FROM borrowing_transactions bt
             JOIN books b ON bt.book_id = b.id
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

            for (const transactionId of transactionIds) {
                // Get transaction details
                const [transactionRows] = await connection.execute(
                    `SELECT bt.*, b.title, b.number_code 
                     FROM borrowing_transactions bt
                     JOIN books b ON bt.book_id = b.id
                     WHERE bt.id = ? AND bt.status = 'borrowed'`,
                    [transactionId]
                );

                if (transactionRows.length === 0) {
                    throw new Error(`Transaction ${transactionId} not found or already returned`);
                }

                const transaction = transactionRows[0];

                // Update transaction status
                await connection.execute(
                    `UPDATE borrowing_transactions 
                     SET status = 'returned', returned_at = NOW(), returned_by_admin = ?
                     WHERE id = ?`,
                    [adminId, transactionId]
                );

                // Update book status to available
                await connection.execute(
                    'UPDATE books SET status = "available" WHERE id = ?',
                    [transaction.book_id]
                );

                returnedBooks.push({
                    transactionId,
                    bookTitle: transaction.title,
                    bookCode: transaction.number_code,
                    returnedAt: new Date()
                });
            }

            await connection.commit();

            res.json({
                success: true,
                message: `Successfully returned ${returnedBooks.length} book(s)`,
                data: {
                    returnedBooks
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

module.exports = router;

