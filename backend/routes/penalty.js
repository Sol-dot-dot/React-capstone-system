const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
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
    getPenaltyStats,
    calculateFine
} = require('../utils/penaltyUtils');
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

        const { settings } = req.body;
        const adminId = req.user.id;

        if (!settings || typeof settings !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Settings object is required'
            });
        }

        // Update each setting
        for (const [key, value] of Object.entries(settings)) {
            await updateSystemSetting(key, value.toString(), adminId);
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

        // 2. Mark all unpaid fines as paid
        const [fineResult] = await connection.execute(
            `UPDATE fines 
             SET status = 'paid', 
                 paid_amount = fine_amount,
                 paid_date = NOW(),
                 updated_at = NOW()
             WHERE student_id_number = ? AND status = 'unpaid'`,
            [studentId]
        );

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
                         returned_at = NOW(),
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
                         returned_at = NOW(),
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

        const fines = await getStudentFines(studentId, status, recalculate === 'true');
        res.json({
            success: true,
            data: fines,
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
                f.paid_date,
                f.status,
                bt.borrowed_at,
                bt.due_date,
                bt.returned_at,
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
                            paid_date = NOW(),
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
                            returned_at = CURRENT_TIMESTAMP,
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

module.exports = router;
