const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getSystemSettings,
    updateSystemSetting,
    getStudentFines,
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
        const { status } = req.query;

        const fines = await getStudentFines(studentId, status);
        res.json({
            success: true,
            data: fines
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

        // Get student's fines
        const fines = await getStudentFines(studentId);
        
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
                currentBorrowedCount: currentBorrowed[0].count
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

module.exports = router;
