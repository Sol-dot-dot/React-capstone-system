const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    calculateOverdueDays,
    getSystemSettings,
    updateSystemSetting,
    getStudentFines,
    recalculateStudentFines,
    processFinePayment,
    checkAndUpdateStudentBorrowingStatus,
    getSemesterTracking,
    createOrUpdateSemesterTracking,
    updateSemesterBooksCount,
    recalculateAllSemesterCounts,
    processAllOverdueFines,
    cleanupDuplicateFines,
    getPenaltyStats,
    calculateFine
} = require('../utils/penaltyUtils');
const { ensureReturnTransactionRecords } = require('../utils/borrowingUtils');
const { createReturnTransaction } = require('../utils/borrowingUtils');
const pool = require('../config/database');

// GET /api/penalty/settings - Get system settings (admin only)
router.get('/settings', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const settings = await getSystemSettings();
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error fetching system settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch system settings'
        });
    }
});

// PUT /api/penalty/settings - Update system settings (admin only)
router.put('/settings', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { settings, setting_key, setting_value } = req.body;
        const adminId = req.user.id;

        // Handle both formats: individual setting or settings object
        if (setting_key && setting_value !== undefined) {
            // Individual setting update
            await updateSystemSetting(setting_key, setting_value.toString(), adminId);
        } else if (settings && typeof settings === 'object') {
            // Multiple settings update
            for (const [key, value] of Object.entries(settings)) {
                await updateSystemSetting(key, value.toString(), adminId);
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'Either settings object or setting_key/setting_value is required'
            });
        }

        res.json({
            success: true,
            message: 'System settings updated successfully'
        });
    } catch (error) {
        console.error('Error updating system settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update system settings'
        });
    }
});

// GET /api/penalty/stats - Get penalty system statistics (admin only)
router.get('/stats', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const stats = await getPenaltyStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching penalty stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch penalty statistics'
        });
    }
});

// POST /api/penalty/process-overdue - Process all overdue fines (admin only)
router.post('/process-overdue', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const results = await processAllOverdueFines();
        res.json({
            success: true,
            message: 'Overdue fines processed successfully',
            data: results
        });
    } catch (error) {
        console.error('Error processing overdue fines:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process overdue fines'
        });
    }
});

// POST /api/penalty/recalculate-semester-counts - Recalculate semester counts for all students (admin only)
router.post('/recalculate-semester-counts', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const results = await recalculateAllSemesterCounts();
        res.json({
            success: true,
            message: `Semester counts recalculated for ${results.updatedCount} out of ${results.totalStudents} students`,
            data: results
        });
    } catch (error) {
        console.error('Error recalculating semester counts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to recalculate semester counts'
        });
    }
});

// GET /api/penalty/students-with-fines - Get students with fines (admin only)
router.get('/students-with-fines', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const [students] = await pool.execute(`
            SELECT 
                u.id_number,
                u.email,
                u.is_verified,
                COUNT(f.id) as total_fines,
                COUNT(CASE WHEN f.status = 'unpaid' THEN 1 END) as unpaid_fines,
                COALESCE(SUM(f.fine_amount), 0) as total_amount,
                COALESCE(SUM(CASE WHEN f.status = 'unpaid' THEN f.fine_amount - COALESCE(f.paid_amount, 0) ELSE 0 END), 0) as unpaid_amount
            FROM users u
            LEFT JOIN fines f ON u.id_number = f.student_id_number
            GROUP BY u.id_number, u.email, u.is_verified
            HAVING total_fines > 0
            ORDER BY unpaid_amount DESC
        `);

        res.json({
            success: true,
            data: students
        });
    } catch (error) {
        console.error('Error fetching students with fines:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch students with fines'
        });
    }
});

// GET /api/penalty/students-detailed - Get detailed student penalty information (admin only)
router.get('/students-detailed', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { search, status = 'unpaid' } = req.query;
        let whereClause = '';
        let params = [];

        if (search) {
            whereClause = 'WHERE (u.id_number LIKE ? OR u.email LIKE ? OR b.title LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (status) {
            const statusWhere = whereClause ? 'AND' : 'WHERE';
            whereClause += `${statusWhere} f.status = ?`;
            params.push(status);
        }

        const [students] = await pool.execute(`
            SELECT 
                u.id_number,
                u.email,
                u.first_name,
                u.last_name,
                u.is_verified,
                u.email_verified,
                u.last_login,
                u.created_at as registration_date,
                COUNT(f.id) as total_fines,
                COUNT(CASE WHEN f.status = 'unpaid' THEN 1 END) as unpaid_fines,
                COUNT(CASE WHEN f.status = 'paid' THEN 1 END) as paid_fines,
                COALESCE(SUM(f.fine_amount), 0) as total_amount,
                COALESCE(SUM(CASE WHEN f.status = 'unpaid' THEN f.fine_amount - COALESCE(f.paid_amount, 0) ELSE 0 END), 0) as unpaid_amount,
                COALESCE(SUM(CASE WHEN f.status = 'paid' THEN f.paid_amount ELSE 0 END), 0) as paid_amount,
                MAX(f.fine_date) as latest_fine_date,
                MIN(f.fine_date) as earliest_fine_date
            FROM users u
            LEFT JOIN fines f ON u.id_number = f.student_id_number
            ${whereClause}
            GROUP BY u.id_number, u.email, u.first_name, u.last_name, u.is_verified, u.email_verified, u.last_login, u.created_at
            HAVING total_fines > 0
            ORDER BY unpaid_amount DESC, total_amount DESC
        `, params);

        // Get detailed overdue books for each student
        for (let student of students) {
            const [overdueBooks] = await pool.execute(`
                SELECT 
                    bt.id as transaction_id,
                    bt.borrowed_date,
                    bt.due_date,
                    bt.status as transaction_status,
                    b.title,
                    b.author,
                    b.number_code,
                    b.category,
                    f.id as fine_id,
                    f.fine_amount,
                    f.paid_amount,
                    f.days_overdue,
                    f.fine_date,
                    f.status as fine_status,
                    CASE 
                        WHEN bt.status = 'overdue' THEN 'Overdue'
                        WHEN bt.status = 'borrowed' AND bt.due_date < CURDATE() THEN 'Overdue'
                        WHEN bt.status = 'returned' THEN 'Returned'
                        ELSE 'Borrowed'
                    END as current_status,
                    DATEDIFF(CURDATE(), bt.due_date) as days_past_due
                FROM borrowing_transactions bt
                JOIN books b ON bt.book_id = b.id
                LEFT JOIN fines f ON bt.id = f.transaction_id
                WHERE bt.student_id_number = ? 
                AND (bt.status = 'overdue' OR (bt.status = 'borrowed' AND bt.due_date < CURDATE()))
                ORDER BY bt.due_date ASC
            `, [student.id_number]);

            student.overdue_books = overdueBooks;
        }

        res.json({
            success: true,
            data: students,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching detailed student penalty information:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch detailed student penalty information'
        });
    }
});

// POST /api/penalty/mark-paid/:studentId - Mark all fines as paid and return books (admin only)
router.post('/mark-paid/:studentId', auth, async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { studentId } = req.params;
        const adminId = req.user.id;

        // 1. Get all unpaid fines for this student with their associated transactions
        console.log('🔍 Processing payment for student:', studentId);
        const [unpaidFines] = await connection.execute(
            `SELECT f.*, bt.id as transaction_id, bt.book_id, bt.status as transaction_status
             FROM fines f
             LEFT JOIN borrowing_transactions bt ON f.transaction_id = bt.id
             WHERE f.student_id_number = ? AND f.status = 'unpaid'`,
            [studentId]
        );
        console.log('🔍 Unpaid fines found:', unpaidFines);

        if (unpaidFines.length === 0) {
            await connection.rollback();
            return res.json({
                success: true,
                message: `No unpaid fines found for student ${studentId}`,
                data: {
                    studentId,
                    finesUpdated: 0,
                    booksReturned: 0
                }
            });
        }

        // 2. Mark all unpaid fines as paid and create payment records
        const [fineResult] = await connection.execute(
            `UPDATE fines 
             SET status = 'paid', 
                 paid_amount = fine_amount,
                 updated_at = CURRENT_TIMESTAMP
             WHERE student_id_number = ? AND status = 'unpaid'`,
            [studentId]
        );

        // Create payment records for each paid fine
        for (const fine of unpaidFines) {
            const remainingAmount = fine.fine_amount - (fine.paid_amount || 0);
            if (remainingAmount > 0) {
                await connection.execute(
                    `INSERT INTO fine_payments 
                     (fine_id, payment_amount, payment_method, processed_by, notes) 
                     VALUES (?, ?, 'cash', ?, 'Full payment - All fines paid at once')`,
                    [fine.id, remainingAmount, adminId]
                );
            }
        }

        // 3. Return any borrowed books associated with these fines
        let booksReturned = 0;
        console.log('🔍 Processing book returns for fines:', unpaidFines.length);
        
        for (const fine of unpaidFines) {
            console.log('🔍 Processing fine:', fine);
            if (fine.transaction_id && (fine.transaction_status === 'borrowed' || fine.transaction_status === 'overdue')) {
                console.log('🔍 Returning book for transaction:', fine.transaction_id, 'Status:', fine.transaction_status);
                
                // Return the book (handle both borrowed and overdue status)
                await connection.execute(
                    `UPDATE borrowing_transactions 
                     SET status = 'returned', 
                         returned_date = CURDATE(),
                         returned_by_admin = ?
                     WHERE id = ? AND status IN ('borrowed', 'overdue')`,
                    [adminId, fine.transaction_id]
                );

                // Update book status to available
                await connection.execute(
                    `UPDATE books 
                     SET status = 'available'
                     WHERE id = ?`,
                    [fine.book_id]
                );

                booksReturned++;
                console.log('✅ Book returned successfully');
            } else {
                console.log('⚠️ Fine not linked to borrowed/overdue book or book already returned');
            }
        }

        // 4. Return ALL remaining overdue books for this student (regardless of fines)
        console.log('🔍 Checking for any remaining overdue books...');
        const [overdueBooks] = await connection.execute(
            `SELECT bt.id, bt.book_id, b.title
             FROM borrowing_transactions bt
             JOIN books b ON bt.book_id = b.id
             WHERE bt.student_id_number = ? AND bt.status = 'overdue'`,
            [studentId]
        );
        
        console.log('🔍 Found remaining overdue books:', overdueBooks);
        
        for (const book of overdueBooks) {
                // Return the overdue book
                await connection.execute(
                    `UPDATE borrowing_transactions 
                     SET status = 'returned', 
                         returned_date = CURDATE(),
                         returned_by_admin = ?
                     WHERE id = ?`,
                    [adminId, book.id]
                );

            // Update book status to available
            await connection.execute(
                `UPDATE books 
                 SET status = 'available'
                 WHERE id = ?`,
                [book.book_id]
            );

            // Create return transaction record
            await createReturnTransaction(
                book.id, 
                adminId, 
                'good', 
                'Overdue book returned after fine payment', 
                'Overdue book processed - fine payment completed'
            );
            console.log('✅ Return transaction record created for overdue book:', book.title);

            booksReturned++;
            console.log('✅ Overdue book returned:', book.title);
        }

        await connection.commit();

        res.json({
            success: true,
            message: `Successfully processed payment for student ${studentId}. ${fineResult.affectedRows} fine(s) marked as paid and ${booksReturned} book(s) returned. Student can now borrow again.`,
            data: {
                studentId,
                finesUpdated: fineResult.affectedRows,
                booksReturned: booksReturned
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('❌ Error processing payment and book return:', error);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Error details:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage
        });
        res.status(500).json({
            success: false,
            message: 'Failed to process payment and book return',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        connection.release();
    }
});

// GET /api/penalty/fines/:studentId - Get student's fines (admin only)
router.get('/fines/:studentId', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { studentId } = req.params;
        const { status, recalculate = 'true' } = req.query;

        // Get student basic information
        const [studentInfo] = await pool.execute(`
            SELECT 
                u.id_number,
                u.email,
                u.first_name,
                u.last_name,
                u.is_verified,
                u.email_verified,
                u.last_login,
                u.created_at as registration_date
            FROM users u
            WHERE u.id_number = ?
        `, [studentId]);

        if (studentInfo.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Get student's fines with detailed book information
        const fines = await getStudentFines(studentId, status, recalculate === 'true');
        
        // Get current borrowing status
        const [borrowingStatus] = await pool.execute(`
            SELECT 
                COUNT(*) as total_borrowed,
                COUNT(CASE WHEN status = 'borrowed' THEN 1 END) as currently_borrowed,
                COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count,
                COUNT(CASE WHEN status = 'returned' THEN 1 END) as returned_count
            FROM borrowing_transactions 
            WHERE student_id_number = ?
        `, [studentId]);

        // Get overdue books details
        const [overdueBooks] = await pool.execute(`
            SELECT 
                bt.id as transaction_id,
                bt.borrowed_date,
                bt.due_date,
                bt.status as transaction_status,
                b.title,
                b.author,
                b.number_code,
                b.category,
                f.id as fine_id,
                f.fine_amount,
                f.paid_amount,
                f.days_overdue,
                f.fine_date,
                f.status as fine_status,
                DATEDIFF(CURDATE(), bt.due_date) as days_past_due
            FROM borrowing_transactions bt
            JOIN books b ON bt.book_id = b.id
            LEFT JOIN fines f ON bt.id = f.transaction_id
            WHERE bt.student_id_number = ? 
            AND (bt.status = 'overdue' OR (bt.status = 'borrowed' AND bt.due_date < CURDATE()))
            ORDER BY bt.due_date ASC
        `, [studentId]);

        // Calculate summary statistics
        const totalFines = fines.length;
        const unpaidFines = fines.filter(fine => fine.status === 'unpaid');
        const paidFines = fines.filter(fine => fine.status === 'paid');
        const totalAmount = fines.reduce((sum, fine) => sum + parseFloat(fine.fine_amount), 0);
        const unpaidAmount = unpaidFines.reduce((sum, fine) => sum + (parseFloat(fine.fine_amount) - parseFloat(fine.paid_amount || 0)), 0);
        const paidAmount = paidFines.reduce((sum, fine) => sum + parseFloat(fine.paid_amount || 0), 0);

        res.json({
            success: true,
            data: {
                student: studentInfo[0],
                fines: fines,
                overdue_books: overdueBooks,
                borrowing_status: borrowingStatus[0],
                summary: {
                    total_fines: totalFines,
                    unpaid_fines: unpaidFines.length,
                    paid_fines: paidFines.length,
                    total_amount: totalAmount,
                    unpaid_amount: unpaidAmount,
                    paid_amount: paidAmount
                }
            },
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching student fines:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch student fines'
        });
    }
});

// POST /api/penalty/pay - Process fine payment (admin only)
router.post('/pay', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { fineId, paymentAmount, paymentMethod, notes } = req.body;
        const adminId = req.user.id;

        if (!fineId || !paymentAmount || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Fine ID, payment amount, and payment method are required'
            });
        }

        const result = await processFinePayment(fineId, paymentAmount, paymentMethod, adminId, notes);
        res.json({
            success: true,
            message: 'Fine payment processed successfully',
            data: result
        });
    } catch (error) {
        console.error('Error processing fine payment:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to process fine payment'
        });
    }
});

// GET /api/penalty/semester/:studentId - Get student's semester tracking (admin only)
router.get('/semester/:studentId', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { studentId } = req.params;
        const tracking = await getSemesterTracking(studentId);
        res.json({
            success: true,
            data: tracking
        });
    } catch (error) {
        console.error('Error fetching semester tracking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch semester tracking'
        });
    }
});

// POST /api/penalty/semester - Create or update semester tracking (admin only)
router.post('/semester', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { studentIdNumber, semesterStartDate, semesterEndDate } = req.body;

        if (!studentIdNumber || !semesterStartDate || !semesterEndDate) {
            return res.status(400).json({
                success: false,
                message: 'Student ID, semester start date, and end date are required'
            });
        }

        await createOrUpdateSemesterTracking(studentIdNumber, semesterStartDate, semesterEndDate);
        res.json({
            success: true,
            message: 'Semester tracking updated successfully'
        });
    } catch (error) {
        console.error('Error updating semester tracking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update semester tracking'
        });
    }
});

// GET /api/penalty/student-status/:studentId - Get student borrowing status (admin only)
router.get('/student-status/:studentId', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { studentId } = req.params;
        const status = await checkAndUpdateStudentBorrowingStatus(studentId);
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('Error checking student status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check student status'
        });
    }
});

// GET /api/penalty/all-fines - Get all fines with pagination (admin only)
router.get('/all-fines', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { page = 1, limit = 20, status, search } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let params = [];

        if (status) {
            whereClause += ' WHERE f.status = ?';
            params.push(status);
        }

        if (search) {
            const searchWhere = whereClause ? ' AND' : ' WHERE';
            whereClause += `${searchWhere} (f.student_id_number LIKE ? OR b.title LIKE ? OR b.number_code LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Get fines
        const [fines] = await pool.execute(
            `SELECT 
                f.id,
                f.student_id_number,
                f.transaction_id,
                f.fine_amount,
                f.paid_amount,
                f.days_overdue,
                f.fine_date,
                f.updated_at as paid_date,
                f.status,
                bt.borrowed_date,
                bt.due_date,
                bt.returned_date,
                b.title,
                b.number_code,
                b.author,
                u.email
             FROM fines f
             JOIN borrowing_transactions bt ON f.transaction_id = bt.id
             JOIN books b ON bt.book_id = b.id
             JOIN users u ON f.student_id_number = u.id_number
             ${whereClause}
             ORDER BY f.fine_date DESC
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        // Get total count
        const [totalRows] = await pool.execute(
            `SELECT COUNT(*) as count FROM fines f
             JOIN borrowing_transactions bt ON f.transaction_id = bt.id
             JOIN books b ON bt.book_id = b.id
             ${whereClause}`,
            params
        );

        res.json({
            success: true,
            data: {
                fines,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalRows[0].count,
                    pages: Math.ceil(totalRows[0].count / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching all fines:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch fines'
        });
    }
});

// GET /api/penalty/user/:studentId - Get user's own fines and status (for mobile app)
router.get('/user/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const { recalculate = 'true' } = req.query;

        // Get student's fines with real-time recalculation
        const fines = await getStudentFines(studentId, null, recalculate === 'true');
        
        // Get student's borrowing status
        const borrowingStatus = await checkAndUpdateStudentBorrowingStatus(studentId);
        
        // Get semester tracking
        const semesterTracking = await getSemesterTracking(studentId);
        
        // Get current borrowed books count
        const [currentBorrowed] = await pool.execute(
            'SELECT COUNT(*) as count FROM borrowing_transactions WHERE student_id_number = ? AND status = "borrowed"',
            [studentId]
        );

        // Calculate total unpaid fine amount
        const unpaidFines = fines.filter(fine => fine.status === 'unpaid');
        const totalUnpaidAmount = unpaidFines.reduce((sum, fine) => sum + (fine.fine_amount - fine.paid_amount), 0);

        res.json({
            success: true,
            data: {
                fines: unpaidFines, // Only show unpaid fines to user
                totalUnpaidAmount,
                borrowingStatus,
                semesterTracking: semesterTracking[0] || null,
                currentBorrowedCount: currentBorrowed[0].count,
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error fetching user penalty data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch penalty data'
        });
    }
});

// POST /api/penalty/recalculate/:studentId - Force recalculation of student's fines
router.post('/recalculate/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;

        // Force recalculation of student's fines
        await recalculateStudentFines(studentId);
        
        // Get updated fines
        const fines = await getStudentFines(studentId, null, false); // Don't recalculate again
        
        // Calculate total unpaid fine amount
        const unpaidFines = fines.filter(fine => fine.status === 'unpaid');
        const totalUnpaidAmount = unpaidFines.reduce((sum, fine) => sum + (fine.fine_amount - fine.paid_amount), 0);

        res.json({
            success: true,
            message: 'Fines recalculated successfully',
            data: {
                fines: unpaidFines,
                totalUnpaidAmount,
                recalculatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error recalculating student fines:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to recalculate fines'
        });
    }
});

// POST /api/penalty/pay-all/:studentId - Pay all unpaid fines for a student
router.post('/pay-all/:studentId', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { studentId } = req.params;
        const adminId = req.user.id;

        // Get all unpaid fines for the student
        const fines = await getStudentFines(studentId, 'unpaid', true);
        
        if (fines.length === 0) {
            return res.json({
                success: true,
                message: 'No unpaid fines found for this student',
                data: { paidFines: 0, returnedBooks: 0 }
            });
        }

        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            let paidFinesCount = 0;
            let returnedBooksCount = 0;

            // Process each unpaid fine
            for (const fine of fines) {
                const remainingAmount = fine.fine_amount - fine.paid_amount;
                
                if (remainingAmount > 0) {
                    // Update fine to paid
                    await connection.execute(`
                        UPDATE fines 
                        SET paid_amount = fine_amount, 
                            status = 'paid', 
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `, [fine.id]);

                    // Add payment record
                    await connection.execute(`
                        INSERT INTO fine_payments 
                        (fine_id, payment_amount, payment_method, processed_by, notes) 
                        VALUES (?, ?, 'cash', ?, 'Full payment - All fines paid at once')
                    `, [fine.id, remainingAmount, adminId]);

                    // Return the book to available status
                    await connection.execute(`
                        UPDATE borrowing_transactions 
                        SET status = 'returned', 
                            returned_date = CURDATE(),
                            returned_by_admin = ?
                        WHERE id = ?
                    `, [adminId, fine.transaction_id]);

                    // Update book status to available
                    await connection.execute(`
                        UPDATE books 
                        SET status = 'available'
                        WHERE id = (
                            SELECT book_id FROM borrowing_transactions WHERE id = ?
                        )
                    `, [fine.transaction_id]);

                    // Create return transaction record
                    await createReturnTransaction(
                        fine.transaction_id, 
                        adminId, 
                        'good', 
                        'Book returned after fine payment', 
                        'All fines paid at once - book returned'
                    );
                    console.log('✅ Return transaction record created for transaction:', fine.transaction_id);

                    paidFinesCount++;
                    returnedBooksCount++;
                }
            }

            // Update student borrowing status
            await checkAndUpdateStudentBorrowingStatus(studentId);

            await connection.commit();

            res.json({
                success: true,
                message: `Successfully paid ${paidFinesCount} fines and returned ${returnedBooksCount} books`,
                data: {
                    paidFines: paidFinesCount,
                    returnedBooks: returnedBooksCount,
                    totalAmount: fines.reduce((sum, fine) => sum + (fine.fine_amount - fine.paid_amount), 0)
                }
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error paying all fines for student:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process payment for all fines'
        });
    }
});

// GET /api/penalty/overdue-books - Get all overdue books (admin only)
router.get('/overdue-books', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { page = 1, limit = 50, search } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let params = [];

        if (search) {
            whereClause = `WHERE (student_id_number LIKE ? OR title LIKE ? OR number_code LIKE ? OR email LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Get all overdue books using the view
        const [overdueBooks] = await pool.execute(
            `SELECT * FROM overdue_books_with_fines
             ${whereClause}
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        // Get total count
        const [totalRows] = await pool.execute(
            `SELECT COUNT(*) as count FROM overdue_books_with_fines ${whereClause}`,
            params
        );

        // Group by student for better organization
        const studentMap = new Map();
        
        overdueBooks.forEach(book => {
            const studentId = book.student_id_number;
            if (!studentMap.has(studentId)) {
                studentMap.set(studentId, {
                    studentId,
                    email: book.email,
                    totalOverdueBooks: 0,
                    totalUnpaidFines: 0,
                    totalUnpaidAmount: 0,
                    overdueBooks: []
                });
            }
            
            const student = studentMap.get(studentId);
            student.overdueBooks.push(book);
            student.totalOverdueBooks++;
            
            if (book.fine_id && book.fine_status === 'unpaid') {
                student.totalUnpaidFines++;
                student.totalUnpaidAmount += (book.fine_amount - book.paid_amount);
            }
        });

        res.json({
            success: true,
            data: {
                students: Array.from(studentMap.values()),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalRows[0].count,
                    pages: Math.ceil(totalRows[0].count / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching overdue books:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch overdue books'
        });
    }
});

// POST /api/penalty/fix-overdue-fines - Fix missing fines for overdue books
router.post('/fix-overdue-fines', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        console.log('🔧 Admin requested to fix overdue fines...');
        const results = await processAllOverdueFines();
        
        res.json({
            success: true,
            message: 'Overdue fines fixed successfully',
            data: results
        });
    } catch (error) {
        console.error('Error fixing overdue fines:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fix overdue fines'
        });
    }
});

// POST /api/penalty/return-paid-overdue - Return paid overdue books and store history
router.post('/return-paid-overdue', auth, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { studentId, transactionIds } = req.body;
        const adminId = req.user.id;

        if (!studentId || !transactionIds || !Array.isArray(transactionIds)) {
            return res.status(400).json({
                success: false,
                message: 'Student ID and transaction IDs are required'
            });
        }

        let returnedBooks = 0;
        let historyRecords = [];

        for (const transactionId of transactionIds) {
            // Get transaction details
            const [transactions] = await connection.execute(
                `SELECT bt.*, b.title, b.author, b.number_code, f.fine_amount, f.paid_amount
                 FROM borrowing_transactions bt
                 JOIN books b ON bt.book_id = b.id
                 LEFT JOIN fines f ON bt.id = f.transaction_id
                 WHERE bt.id = ? AND bt.student_id_number = ? AND bt.status = 'overdue'`,
                [transactionId, studentId]
            );

            if (transactions.length === 0) continue;

            const transaction = transactions[0];

            // Check if all fines are paid for this transaction
            const [unpaidFines] = await connection.execute(
                `SELECT COUNT(*) as count FROM fines 
                 WHERE transaction_id = ? AND status = 'unpaid'`,
                [transactionId]
            );

            if (unpaidFines[0].count > 0) {
                continue; // Skip if there are unpaid fines
            }

            // Return the book
            await connection.execute(
                `UPDATE borrowing_transactions 
                 SET status = 'returned', 
                     returned_date = CURDATE(),
                     returned_by_admin = ?
                 WHERE id = ?`,
                [adminId, transactionId]
            );

            // Update book status
            await connection.execute(
                `UPDATE books 
                 SET status = 'available'
                 WHERE id = ?`,
                [transaction.book_id]
            );

            // Store in overdue history
            await connection.execute(
                `INSERT INTO overdue_history 
                 (student_id_number, transaction_id, book_title, book_author, book_code,
                  borrowed_date, due_date, returned_date, days_overdue, fine_amount, paid_amount,
                  returned_by_admin, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, NOW())`,
                [
                    studentId,
                    transactionId,
                    transaction.title,
                    transaction.author,
                    transaction.number_code,
                    transaction.borrowed_date,
                    transaction.due_date,
                    calculateOverdueDays(transaction.due_date),
                    transaction.fine_amount || 0,
                    transaction.paid_amount || 0,
                    adminId
                ]
            );

            historyRecords.push({
                transactionId,
                bookTitle: transaction.title,
                daysOverdue: calculateOverdueDays(transaction.due_date),
                fineAmount: transaction.fine_amount || 0,
                paidAmount: transaction.paid_amount || 0
            });

            returnedBooks++;
        }

        await connection.commit();

        res.json({
            success: true,
            message: `Successfully returned ${returnedBooks} paid overdue books`,
            data: {
                returnedBooks,
                historyRecords
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error returning paid overdue books:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to return paid overdue books'
        });
    } finally {
        connection.release();
    }
});

// GET /api/penalty/overdue-history/:studentId - Get student's overdue history
router.get('/overdue-history/:studentId', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { studentId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const [history] = await pool.execute(
            `SELECT oh.*, a.email as returned_by_admin_name
             FROM overdue_history oh
             JOIN users a ON oh.returned_by_admin = a.id AND a.role = 'admin'
             WHERE oh.student_id_number = ?
             ORDER BY oh.returned_date DESC
             LIMIT ? OFFSET ?`,
            [studentId, parseInt(limit), offset]
        );

        const [totalRows] = await pool.execute(
            `SELECT COUNT(*) as count FROM overdue_history WHERE student_id_number = ?`,
            [studentId]
        );

        res.json({
            success: true,
            data: {
                history,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalRows[0].count,
                    pages: Math.ceil(totalRows[0].count / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching overdue history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch overdue history'
        });
    }
});

// POST /api/penalty/cleanup-duplicates - Clean up duplicate fines (admin only)
router.post('/cleanup-duplicates', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        await cleanupDuplicateFines();
        res.json({
            success: true,
            message: 'Duplicate fines cleaned up successfully'
        });
    } catch (error) {
        console.error('Error cleaning up duplicate fines:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clean up duplicate fines'
        });
    }
});

// POST /api/penalty/fix-return-records/:studentId - Fix missing return transaction records (admin only)
router.post('/fix-return-records/:studentId', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { studentId } = req.params;
        const adminId = req.user.id;

        const result = await ensureReturnTransactionRecords(studentId, adminId);
        res.json({
            success: true,
            message: `Fixed return transaction records for student ${studentId}`,
            data: result
        });
    } catch (error) {
        console.error('Error fixing return transaction records:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fix return transaction records'
        });
    }
});

// POST /api/penalty/reset-semester - Reset semester and clear all borrowing counts (admin only)
router.post('/reset-semester', auth, async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        await connection.beginTransaction();

        // Get semester duration from settings
        const [durationSetting] = await connection.execute(
            'SELECT setting_value FROM system_settings WHERE setting_key = ?',
            ['semester_duration_months']
        );
        
        const semesterDurationMonths = durationSetting.length > 0 ? 
            parseInt(durationSetting[0].setting_value) : 5; // Default to 5 months

        // Calculate new semester dates
        const currentDate = new Date();
        const semesterStartDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        const semesterEndDate = new Date(currentDate);
        semesterEndDate.setMonth(semesterEndDate.getMonth() + semesterDurationMonths);
        const semesterEndDateStr = semesterEndDate.toISOString().split('T')[0];

        console.log(`🔄 Resetting semester: ${semesterStartDate} to ${semesterEndDateStr} (${semesterDurationMonths} months)`);

        // Get all active students
        const [activeStudents] = await connection.execute(
            'SELECT id_number FROM users WHERE type = "student" AND is_verified = 1'
        );

        console.log(`📊 Found ${activeStudents.length} active students to reset`);

        let resetCount = 0;
        let createdCount = 0;

        // Reset or create semester tracking for each student
        for (const student of activeStudents) {
            // Check if student has existing semester tracking
            const [existingTracking] = await connection.execute(
                'SELECT id FROM semester_tracking WHERE student_id_number = ? AND status = "active"',
                [student.id_number]
            );

            if (existingTracking.length > 0) {
                // Update existing tracking - reset counts and update dates
                await connection.execute(
                    `UPDATE semester_tracking 
                     SET books_borrowed_count = 0,
                         semester_start_date = ?,
                         semester_end_date = ?,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE student_id_number = ? AND status = "active"`,
                    [semesterStartDate, semesterEndDateStr, student.id_number]
                );
                resetCount++;
                console.log(`✅ Reset semester tracking for student: ${student.id_number}`);
            } else {
                // Create new semester tracking
                await connection.execute(
                    `INSERT INTO semester_tracking 
                     (student_id_number, semester_start_date, semester_end_date, books_borrowed_count, max_books_allowed, status) 
                     VALUES (?, ?, ?, 0, 5, 'active')`,
                    [student.id_number, semesterStartDate, semesterEndDateStr]
                );
                createdCount++;
                console.log(`✅ Created new semester tracking for student: ${student.id_number}`);
            }
        }

        // Update system settings with new semester start date
        await connection.execute(
            `INSERT INTO system_settings (setting_key, setting_value, description, updated_at) 
             VALUES ('current_semester_start', ?, 'Current semester start date', CURRENT_TIMESTAMP)
             ON DUPLICATE KEY UPDATE 
             setting_value = VALUES(setting_value), 
             updated_at = CURRENT_TIMESTAMP`,
            [semesterStartDate]
        );

        await connection.execute(
            `INSERT INTO system_settings (setting_key, setting_value, description, updated_at) 
             VALUES ('current_semester_end', ?, 'Current semester end date', CURRENT_TIMESTAMP)
             ON DUPLICATE KEY UPDATE 
             setting_value = VALUES(setting_value), 
             updated_at = CURRENT_TIMESTAMP`,
            [semesterEndDateStr]
        );

        await connection.commit();

        console.log(`🎉 Semester reset completed successfully!`);
        console.log(`📊 Reset: ${resetCount} students, Created: ${createdCount} students`);

        res.json({
            success: true,
            message: 'Semester reset successfully! All student borrowing counts have been reset to 0.',
            data: {
                semesterStartDate,
                semesterEndDate: semesterEndDateStr,
                semesterDurationMonths,
                studentsReset: resetCount,
                studentsCreated: createdCount,
                totalStudents: activeStudents.length
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error resetting semester:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset semester'
        });
    } finally {
        connection.release();
    }
});

// GET /api/penalty/clearance-requirements - Get student clearance requirements (admin only)
router.get('/clearance-requirements', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { search, semester, status } = req.query;
        let whereClause = '';
        let params = [];

        console.log('🔍 Clearance Requirements Query:', { search, semester, status });

        if (search) {
            whereClause = 'WHERE (u.id_number LIKE ? OR u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (semester) {
            const semesterWhere = whereClause ? 'AND' : 'WHERE';
            whereClause += `${semesterWhere} st.semester = ?`;
            params.push(semester);
        }

        // Get students with their semester tracking and clearance status
        const [students] = await pool.execute(`
            SELECT 
                u.id_number,
                u.email,
                u.first_name,
                u.last_name,
                u.is_verified,
                u.email_verified,
                u.created_at as registration_date,
                st.semester_start_date,
                st.semester_end_date,
                st.books_borrowed_count,
                st.max_books_allowed,
                st.status as semester_status,
                st.created_at as semester_created,
                st.updated_at as semester_updated,
                CASE 
                    WHEN st.books_borrowed_count >= 20 THEN 'completed'
                    WHEN st.books_borrowed_count >= 15 THEN 'near_completion'
                    WHEN st.books_borrowed_count >= 10 THEN 'in_progress'
                    ELSE 'needs_improvement'
                END as clearance_status,
                CASE 
                    WHEN st.books_borrowed_count >= 20 THEN 'Eligible for Clearance'
                    WHEN st.books_borrowed_count >= 15 THEN CONCAT('Near Completion (', (20 - st.books_borrowed_count), ' books remaining)')
                    WHEN st.books_borrowed_count >= 10 THEN CONCAT('In Progress (', (20 - st.books_borrowed_count), ' books remaining)')
                    ELSE CONCAT('Needs Improvement (', (20 - st.books_borrowed_count), ' books remaining)')
                END as clearance_message,
                (20 - st.books_borrowed_count) as books_remaining,
                COALESCE(f.unpaid_fines, 0) as unpaid_fines_count,
                COALESCE(f.unpaid_amount, 0) as unpaid_fines_amount
            FROM users u
            LEFT JOIN semester_tracking st ON u.id_number = st.student_id_number
            LEFT JOIN (
                SELECT 
                    student_id_number,
                    COUNT(*) as unpaid_fines,
                    SUM(fine_amount - COALESCE(paid_amount, 0)) as unpaid_amount
                FROM fines 
                WHERE status = 'unpaid'
                GROUP BY student_id_number
            ) f ON u.id_number = f.student_id_number
            ${whereClause}
            ORDER BY 
                CASE 
                    WHEN st.books_borrowed_count >= 20 THEN 1
                    WHEN st.books_borrowed_count >= 15 THEN 2
                    WHEN st.books_borrowed_count >= 10 THEN 3
                    ELSE 4
                END,
                st.books_borrowed_count DESC,
                u.last_name ASC
        `, params);

        console.log('📊 Found students:', students.length);

        // Filter by status if provided
        let filteredStudents = students;
        if (status) {
            filteredStudents = students.filter(student => student.clearance_status === status);
        }

        console.log('📊 Filtered students:', filteredStudents.length);

        // Get summary statistics
        const totalStudents = filteredStudents.length;
        const completedStudents = filteredStudents.filter(s => s.clearance_status === 'completed').length;
        const nearCompletionStudents = filteredStudents.filter(s => s.clearance_status === 'near_completion').length;
        const inProgressStudents = filteredStudents.filter(s => s.clearance_status === 'in_progress').length;
        const needsImprovementStudents = filteredStudents.filter(s => s.clearance_status === 'needs_improvement').length;

        res.json({
            success: true,
            data: {
                students: filteredStudents,
                summary: {
                    total: totalStudents,
                    completed: completedStudents,
                    near_completion: nearCompletionStudents,
                    in_progress: inProgressStudents,
                    needs_improvement: needsImprovementStudents,
                    completion_rate: totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0
                }
            },
            lastUpdated: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching clearance requirements:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch clearance requirements'
        });
    }
});

// GET /api/penalty/clearance-requirements/:studentId - Get specific student's clearance details (admin only)
router.get('/clearance-requirements/:studentId', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { studentId } = req.params;

        // Get student details
        const [studentInfo] = await pool.execute(`
            SELECT 
                u.id_number,
                u.email,
                u.first_name,
                u.last_name,
                u.is_verified,
                u.email_verified,
                u.created_at as registration_date,
                u.last_login
            FROM users u
            WHERE u.id_number = ?
        `, [studentId]);

        if (studentInfo.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Get semester tracking
        const [semesterTracking] = await pool.execute(`
            SELECT 
                semester_start_date,
                semester_end_date,
                books_borrowed_count,
                max_books_allowed,
                status as semester_status,
                created_at as semester_created,
                updated_at as semester_updated
            FROM semester_tracking
            WHERE student_id_number = ?
            ORDER BY created_at DESC
        `, [studentId]);

        // Get current semester books
        const [currentSemesterBooks] = await pool.execute(`
            SELECT 
                bt.id as transaction_id,
                bt.borrowed_date,
                bt.due_date,
                bt.returned_date,
                bt.status,
                b.title,
                b.author,
                b.number_code,
                b.category,
                CASE 
                    WHEN bt.status = 'returned' THEN 'Returned'
                    WHEN bt.status = 'overdue' THEN 'Overdue'
                    WHEN bt.due_date < CURDATE() AND bt.status = 'borrowed' THEN 'Overdue'
                    ELSE 'Borrowed'
                END as current_status
            FROM borrowing_transactions bt
            JOIN books b ON bt.book_id = b.id
            WHERE bt.student_id_number = ?
            AND bt.borrowed_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            ORDER BY bt.borrowed_date DESC
        `, [studentId]);

        // Get fines information
        const [finesInfo] = await pool.execute(`
            SELECT 
                COUNT(*) as total_fines,
                SUM(fine_amount - COALESCE(paid_amount, 0)) as unpaid_amount,
                COUNT(CASE WHEN status = 'unpaid' THEN 1 END) as unpaid_fines
            FROM fines
            WHERE student_id_number = ?
        `, [studentId]);

        const student = studentInfo[0];
        const currentSemester = semesterTracking[0] || {
            semester_start_date: null,
            semester_end_date: null,
            books_borrowed_count: 0,
            max_books_allowed: 5,
            semester_status: 'inactive',
            semester_created: null,
            semester_updated: null
        };

        const clearanceStatus = currentSemester.books_borrowed_count >= 20 ? 'completed' : 
                               currentSemester.books_borrowed_count >= 15 ? 'near_completion' :
                               currentSemester.books_borrowed_count >= 10 ? 'in_progress' : 'needs_improvement';

        res.json({
            success: true,
            data: {
                student: student,
                semesterTracking: currentSemester,
                currentSemesterBooks: currentSemesterBooks,
                finesInfo: finesInfo[0] || { total_fines: 0, unpaid_amount: 0, unpaid_fines: 0 },
                clearanceStatus: clearanceStatus,
                booksRemaining: Math.max(0, 20 - currentSemester.books_borrowed_count),
                clearanceMessage: currentSemester.books_borrowed_count >= 20 ? 
                    'Eligible for Clearance' : 
                    `${20 - currentSemester.books_borrowed_count} books remaining to complete clearance requirements`
            }
        });

    } catch (error) {
        console.error('Error fetching student clearance details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch student clearance details'
        });
    }
});

module.exports = router;
