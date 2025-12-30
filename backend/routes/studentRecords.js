const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/student-records/search
// Search students by ID, name
router.get('/search', auth, async (req, res) => {
    try {
        const { q, status } = req.query;

        let query = `
            SELECT DISTINCT
                u.id,
                u.id_number,
                u.first_name,
                u.last_name,
                u.email,
                u.is_verified,
                (SELECT COUNT(*) FROM borrowing_transactions WHERE student_id_number = u.id_number) as total_borrowed,
                (SELECT COALESCE(SUM(fine_amount - paid_amount), 0) FROM fines WHERE student_id_number = u.id_number) as outstanding_balance
            FROM users u
            WHERE u.role = 'student'
        `;

        const params = [];

        if (q) {
            query += ` AND (u.id_number LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR CONCAT(u.first_name, ' ', u.last_name) LIKE ?)`;
            const searchTerm = `%${q}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (status === 'active') {
            query += ` AND u.is_verified = 1`;
        } else if (status === 'inactive') {
            query += ` AND u.is_verified = 0`;
        }

        query += ` ORDER BY u.last_name, u.first_name LIMIT 50`;

        const [students] = await db.query(query, params);

        res.json({
            success: true,
            data: students
        });
    } catch (error) {
        console.error('Student search error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search students',
            error: error.message
        });
    }
});

// GET /api/student-records/:userId
// Get complete student library record
router.get('/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;

        // Get student profile
        const [students] = await db.query(`
            SELECT
                u.id,
                u.id_number,
                u.first_name,
                u.last_name,
                u.email,
                u.is_verified,
                u.created_at
            FROM users u
            WHERE u.id = ? AND u.role = 'student'
        `, [userId]);

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const student = students[0];

        // Get summary statistics
        const [summaryStats] = await db.query(`
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
        `, [student.id_number]);

        const summary = {
            total_borrowed: parseInt(summaryStats[0].total_borrowed) || 0,
            total_returned: parseInt(summaryStats[0].total_returned) || 0,
            currently_borrowed: parseInt(summaryStats[0].currently_borrowed) || 0,
            total_fines_incurred: parseFloat(summaryStats[0].total_fines_incurred) || 0,
            total_fines_paid: parseFloat(summaryStats[0].total_fines_paid) || 0,
            outstanding_balance: parseFloat(summaryStats[0].outstanding_balance) || 0
        };

        // Determine account status
        let accountStatus = 'good_standing';
        if (summary.outstanding_balance > 0) {
            accountStatus = 'has_pending';
        }
        if (summary.currently_borrowed > 3) {
            accountStatus = 'blocked';
        }

        // Get academic years with data and year level
        const [academicYears] = await db.query(`
            SELECT DISTINCT
                ay.id,
                ay.year_name,
                ay.start_date,
                ay.end_date,
                ay.is_current,
                COALESCE(syh.year_level,
                    (SELECT COUNT(DISTINCT ay2.id)
                     FROM academic_years ay2
                     JOIN borrowing_transactions bt2 ON ay2.id = bt2.academic_year_id
                     WHERE bt2.student_id_number = bt.student_id_number
                     AND ay2.start_date <= ay.start_date)
                ) as year_level
            FROM academic_years ay
            JOIN borrowing_transactions bt ON ay.id = bt.academic_year_id
            LEFT JOIN users u ON bt.student_id_number = u.id_number
            LEFT JOIN student_year_history syh ON u.id = syh.user_id AND ay.id = syh.academic_year_id
            WHERE bt.student_id_number = ?
            ORDER BY ay.start_date
        `, [student.id_number]);

        // For each academic year, get semesters with data
        const yearsData = [];
        for (const year of academicYears) {
            const [semesters] = await db.query(`
                SELECT
                    s.id,
                    s.semester_number,
                    s.semester_name,
                    s.start_date,
                    s.end_date,
                    s.is_current
                FROM semesters s
                WHERE s.academic_year_id = ?
                ORDER BY s.semester_number
            `, [year.id]);

            const semestersData = [];
            for (const semester of semesters) {
                // Get borrowings for this semester
                const [borrowings] = await db.query(`
                    SELECT
                        bt.id,
                        b.title as book_title,
                        b.author,
                        bt.borrowed_date,
                        bt.due_date,
                        bt.returned_date,
                        bt.status,
                        CASE
                            WHEN bt.returned_date IS NULL AND bt.due_date < NOW() THEN DATEDIFF(NOW(), bt.due_date)
                            WHEN bt.returned_date IS NOT NULL AND bt.returned_date > bt.due_date THEN DATEDIFF(bt.returned_date, bt.due_date)
                            ELSE 0
                        END as days_late,
                        COALESCE(f.fine_amount, 0) as fine,
                        COALESCE(f.paid_amount, 0) as paid_amount
                    FROM borrowing_transactions bt
                    JOIN books b ON bt.book_id = b.id
                    LEFT JOIN fines f ON bt.id = f.transaction_id
                    WHERE bt.student_id_number = ? AND bt.semester_id = ?
                    ORDER BY bt.borrowed_date
                `, [student.id_number, semester.id]);

                // Calculate semester stats
                const onTimeReturns = borrowings.filter(b => b.returned_date && b.days_late === 0).length;
                const lateReturns = borrowings.filter(b => b.days_late > 0).length;
                const finesIncurred = borrowings.reduce((sum, b) => sum + parseFloat(b.fine || 0), 0);
                const finesPaid = borrowings.reduce((sum, b) => sum + parseFloat(b.paid_amount || 0), 0);

                // Get clearance status
                const [clearances] = await db.query(`
                    SELECT * FROM semester_clearances
                    WHERE user_id = ? AND semester_id = ?
                `, [userId, semester.id]);

                const clearance = clearances[0] || {
                    is_cleared: false,
                    books_borrowed: borrowings.length,
                    books_required: 20,
                    total_fines: finesIncurred,
                    fines_paid: finesPaid
                };

                semestersData.push({
                    semesterId: semester.id,
                    semesterNumber: semester.semester_number,
                    semesterName: semester.semester_name,
                    period: `${new Date(semester.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${new Date(semester.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
                    startDate: semester.start_date,
                    endDate: semester.end_date,
                    isCurrent: semester.is_current,
                    booksBorrowed: borrowings.length,
                    booksRequired: clearance.books_required,
                    onTimeReturns,
                    lateReturns,
                    finesIncurred,
                    finesPaid,
                    isCleared: clearance.is_cleared,
                    borrowings: borrowings.map(b => ({
                        id: b.id,
                        bookTitle: b.book_title,
                        author: b.author,
                        borrowDate: b.borrowed_date,
                        dueDate: b.due_date,
                        returnDate: b.returned_date,
                        status: b.returned_date
                            ? (b.days_late > 0 ? 'returned_late' : 'returned_on_time')
                            : (b.due_date < new Date() ? 'overdue' : 'active'),
                        daysLate: b.days_late,
                        fine: parseFloat(b.fine || 0)
                    }))
                });
            }

            yearsData.push({
                academicYear: year.year_name,
                academicYearId: year.id,
                yearLevel: year.year_level || 1,
                startDate: year.start_date,
                endDate: year.end_date,
                isCurrent: year.is_current,
                semesters: semestersData
            });
        }

        // Get overall clearance status
        const canClear = summary.currently_borrowed === 0 && summary.outstanding_balance === 0;

        res.json({
            success: true,
            data: {
                student,
                summary: {
                    ...summary,
                    accountStatus
                },
                academicYears: yearsData,
                clearance: {
                    isCleared: canClear,
                    pendingRequirements: [
                        ...((summary.currently_borrowed > 0) ? [`Return ${summary.currently_borrowed} borrowed book(s)`] : []),
                        ...((summary.outstanding_balance > 0) ? [`Pay outstanding balance: ₱${summary.outstanding_balance.toFixed(2)}`] : [])
                    ],
                    canPrintCertificate: canClear
                }
            }
        });
    } catch (error) {
        console.error('Student record fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch student record',
            error: error.message
        });
    }
});

// GET /api/student-records/:userId/semester/:semesterId
// Get detailed records for a specific semester
router.get('/:userId/semester/:semesterId', auth, async (req, res) => {
    try {
        const { userId, semesterId } = req.params;

        const [students] = await db.query('SELECT id_number FROM users WHERE id = ?', [userId]);
        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const idNumber = students[0].id_number;

        // Get semester info
        const [semesters] = await db.query(`
            SELECT s.*, ay.year_name
            FROM semesters s
            JOIN academic_years ay ON s.academic_year_id = ay.id
            WHERE s.id = ?
        `, [semesterId]);

        if (semesters.length === 0) {
            return res.status(404).json({ success: false, message: 'Semester not found' });
        }

        const semester = semesters[0];

        // Get borrowings
        const [borrowings] = await db.query(`
            SELECT
                bt.*,
                b.title,
                b.author,
                b.isbn,
                f.fine_amount,
                f.paid_amount
            FROM borrowing_transactions bt
            JOIN books b ON bt.book_id = b.id
            LEFT JOIN fines f ON bt.id = f.transaction_id
            WHERE bt.student_id_number = ? AND bt.semester_id = ?
            ORDER BY bt.borrowed_date DESC
        `, [idNumber, semesterId]);

        // Get payments for this semester
        const [payments] = await db.query(`
            SELECT *
            FROM fine_payments
            WHERE user_id = ? AND semester_id = ?
            ORDER BY payment_date DESC
        `, [userId, semesterId]);

        res.json({
            success: true,
            data: {
                semester,
                borrowings,
                payments
            }
        });
    } catch (error) {
        console.error('Semester detail fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch semester details',
            error: error.message
        });
    }
});

// POST /api/student-records/:userId/clear-semester
// Mark semester as cleared (admin only)
router.post('/:userId/clear-semester', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        const { semesterId, remarks } = req.body;

        // Verify student exists
        const [students] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Get semester clearance or create it
        const [existing] = await db.query(`
            SELECT * FROM semester_clearances
            WHERE user_id = ? AND semester_id = ?
        `, [userId, semesterId]);

        if (existing.length > 0) {
            // Update existing
            await db.query(`
                UPDATE semester_clearances
                SET is_cleared = TRUE,
                    cleared_date = CURDATE(),
                    cleared_by = ?,
                    remarks = ?
                WHERE user_id = ? AND semester_id = ?
            `, [req.user.userId, remarks, userId, semesterId]);
        } else {
            // Create new
            await db.query(`
                INSERT INTO semester_clearances
                (user_id, semester_id, is_cleared, cleared_date, cleared_by, remarks)
                VALUES (?, ?, TRUE, CURDATE(), ?, ?)
            `, [userId, semesterId, req.user.userId, remarks]);
        }

        res.json({
            success: true,
            message: 'Semester cleared successfully'
        });
    } catch (error) {
        console.error('Clear semester error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear semester',
            error: error.message
        });
    }
});

// GET /api/student-records/:userId/clearance-status
// Get clearance status
router.get('/:userId/clearance-status', auth, async (req, res) => {
    try {
        const { userId } = req.params;

        const [students] = await db.query('SELECT id_number, CONCAT(first_name, " ", last_name) as name FROM users WHERE id = ?', [userId]);
        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const student = students[0];

        // Check current borrowings
        const [borrowings] = await db.query(`
            SELECT COUNT(*) as count
            FROM borrowing_transactions
            WHERE student_id_number = ? AND returned_date IS NULL
        `, [student.id_number]);

        // Check outstanding fines
        const [fines] = await db.query(`
            SELECT COALESCE(SUM(fine_amount - paid_amount), 0) as balance
            FROM fines
            WHERE student_id_number = ?
        `, [student.id_number]);

        const currentlyBorrowed = borrowings[0].count;
        const outstandingBalance = parseFloat(fines[0].balance);
        const isCleared = currentlyBorrowed === 0 && outstandingBalance === 0;

        res.json({
            success: true,
            data: {
                student: student.name,
                isCleared,
                currentlyBorrowed,
                outstandingBalance,
                requirements: [
                    {
                        item: 'Return all borrowed books',
                        status: currentlyBorrowed === 0 ? 'completed' : 'pending',
                        details: currentlyBorrowed > 0 ? `${currentlyBorrowed} book(s) still borrowed` : null
                    },
                    {
                        item: 'Pay all outstanding fines',
                        status: outstandingBalance === 0 ? 'completed' : 'pending',
                        details: outstandingBalance > 0 ? `₱${outstandingBalance.toFixed(2)} remaining` : null
                    }
                ]
            }
        });
    } catch (error) {
        console.error('Clearance status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get clearance status',
            error: error.message
        });
    }
});

module.exports = router;
