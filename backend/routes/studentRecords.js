const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

const { logger } = require('../config/logger');
// GET /api/student-records/search
// Search students by ID, name
router.get('/search', auth, async (req, res) => {
    try {
        const { q, status } = req.query;

        logger.info(`[Student Search] Query: "${q}", Status: "${status}"`);

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

        // Log the search results for debugging
        logger.info(`[Student Search] Found ${students.length} students: ${JSON.stringify(students.map(s => ({ id: s.id, id_number: s.id_number, name: s.first_name + ' ' + s.last_name })))}`);

        res.json({
            success: true,
            data: students
        });
    } catch (error) {
        logger.error('Student search error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search students',
            error: error.message
        });
    }
});

// GET /api/student-records/:identifier
// Get complete student library record
// identifier can be either the user id or id_number
router.get('/:identifier', auth, async (req, res) => {
    try {
        const { identifier } = req.params;

        logger.info(`[Student Record] Fetching record for identifier: ${identifier}`);

        // Get student profile - search by id_number first (more reliable), then by id
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
            WHERE (u.id_number = ? OR u.id = ?) AND u.role = 'student'
            LIMIT 1
        `, [identifier, identifier]);

        logger.info(`[Student Record] Query returned ${students.length} student(s) for identifier ${identifier}: ${JSON.stringify(students.map(s => ({ id: s.id, id_number: s.id_number, name: s.first_name + ' ' + s.last_name })))}`);

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

        // Get admin settings for max books per semester
        const [settingsResult] = await db.query(`
            SELECT setting_key, setting_value FROM system_settings
            WHERE setting_key IN ('books_required_per_semester', 'max_books_per_borrowing')
        `);

        const settings = {};
        settingsResult.forEach(s => {
            settings[s.setting_key] = parseInt(s.setting_value) || 20;
        });
        const maxBooksPerSemester = settings.books_required_per_semester || 20;

        // Get all borrowings grouped by academic year (June to May pattern)
        // Academic year runs from June of year X to May of year X+1
        const [allBorrowings] = await db.query(`
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
                COALESCE(f.paid_amount, 0) as paid_amount,
                YEAR(bt.borrowed_date) as borrow_year,
                MONTH(bt.borrowed_date) as borrow_month
            FROM borrowing_transactions bt
            JOIN books b ON bt.book_id = b.id
            LEFT JOIN fines f ON bt.id = f.transaction_id
            WHERE bt.student_id_number = ?
            ORDER BY bt.borrowed_date
        `, [student.id_number]);

        // Determine the student's starting academic year based on their account creation date
        const createdAt = new Date(student.created_at);
        const createdMonth = createdAt.getMonth() + 1; // 1-12
        const createdYear = createdAt.getFullYear();

        // Academic year starts in June. If created before June, they started the previous academic year
        let startingAcademicYear;
        if (createdMonth >= 6) {
            startingAcademicYear = createdYear;
        } else {
            startingAcademicYear = createdYear - 1;
        }

        // Determine current academic year
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        let currentAcademicYear;
        if (currentMonth >= 6) {
            currentAcademicYear = currentYear;
        } else {
            currentAcademicYear = currentYear - 1;
        }

        // Determine current semester (1 = 1st sem Jun-Oct, 2 = 2nd sem Nov-Mar)
        let currentSemester;
        if (currentMonth >= 6 && currentMonth <= 10) {
            currentSemester = 1;
        } else {
            currentSemester = 2;
        }

        // Group borrowings by academic year (June to May)
        // Academic year 2024-2025 = June 2024 to May 2025
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

            // Determine semester: 1st sem = June-Oct, 2nd sem = Nov-March
            let semesterNumber, semesterName;
            if (b.borrow_month >= 6 && b.borrow_month <= 10) {
                semesterNumber = 1;
                semesterName = '1st Semester';
            } else {
                semesterNumber = 2;
                semesterName = '2nd Semester';
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

            borrowingsByYear[academicYearName].semesters[semesterNumber].borrowings.push({
                id: b.id,
                bookTitle: b.book_title,
                author: b.author,
                borrowDate: b.borrowed_date,
                dueDate: b.due_date,
                returnDate: b.returned_date,
                status: b.returned_date
                    ? (b.days_late > 0 ? 'returned_late' : 'returned_on_time')
                    : (new Date(b.due_date) < new Date() ? 'overdue' : 'active'),
                daysLate: b.days_late,
                fine: parseFloat(b.fine || 0),
                paidAmount: parseFloat(b.paid_amount || 0)
            });
        }

        // Build complete 4-year structure from student's starting year
        const yearLevelNames = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
        const yearsData = [];

        for (let yearIndex = 0; yearIndex < 4; yearIndex++) {
            const yearStartYear = startingAcademicYear + yearIndex;
            const academicYearName = `${yearStartYear}-${yearStartYear + 1}`;
            const yearLevel = yearIndex + 1;

            // Check if this year has any borrowing data
            const yearData = borrowingsByYear[academicYearName];

            // Determine if this is the current academic year
            const isCurrent = yearStartYear === currentAcademicYear;

            // Build semesters for this year (always show both semesters)
            const semestersData = [];
            for (let semNum = 1; semNum <= 2; semNum++) {
                const semesterName = semNum === 1 ? '1st Semester' : '2nd Semester';

                // Determine semester period
                let periodStart, periodEnd;
                if (semNum === 1) {
                    periodStart = `Jun ${yearStartYear}`;
                    periodEnd = `Oct ${yearStartYear}`;
                } else {
                    periodStart = `Nov ${yearStartYear}`;
                    periodEnd = `Mar ${yearStartYear + 1}`;
                }

                // Check if this semester is current
                const isCurrentSemester = isCurrent && semNum === currentSemester;

                // Get borrowings for this semester if they exist
                const semesterBorrowings = yearData?.semesters?.[semNum]?.borrowings || [];
                const borrowings = semesterBorrowings.slice(-maxBooksPerSemester);

                const onTimeReturns = borrowings.filter(b => b.returnDate && b.daysLate === 0).length;
                const lateReturns = borrowings.filter(b => b.daysLate > 0).length;
                const finesIncurred = borrowings.reduce((sum, b) => sum + b.fine, 0);
                const finesPaid = borrowings.reduce((sum, b) => sum + b.paidAmount, 0);

                semestersData.push({
                    semesterId: `${academicYearName}-${semNum}`,
                    semesterNumber: semNum,
                    semesterName,
                    period: `${periodStart} - ${periodEnd}`,
                    booksBorrowed: borrowings.length,
                    booksRequired: maxBooksPerSemester,
                    onTimeReturns,
                    lateReturns,
                    finesIncurred,
                    finesPaid,
                    isCleared: finesIncurred === finesPaid && borrowings.every(b => b.returnDate),
                    isCurrent: isCurrentSemester,
                    borrowings
                });
            }

            yearsData.push({
                academicYear: academicYearName,
                academicYearId: yearStartYear,
                yearLevel,
                yearLevelName: yearLevelNames[yearIndex],
                isCurrent,
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
        logger.error('Student record fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch student record',
            error: error.message
        });
    }
});

// GET /api/student-records/:userId/semester/:semesterId
// Get detailed records for a specific semester
// semesterId format: "YYYY-YYYY-N" where N is semester number (1, 2, or 3)
router.get('/:userId/semester/:semesterId', auth, async (req, res) => {
    try {
        const { userId, semesterId } = req.params;

        const [students] = await db.query('SELECT id_number FROM users WHERE id = ?', [userId]);
        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const idNumber = students[0].id_number;

        // Parse semesterId (format: "2024-2025-1")
        const parts = semesterId.split('-');
        if (parts.length < 3) {
            return res.status(400).json({ success: false, message: 'Invalid semester ID format' });
        }

        const startYear = parseInt(parts[0]);
        const semesterNumber = parseInt(parts[2]);

        // Determine date range for the semester
        let startDate, endDate;
        if (semesterNumber === 1) {
            startDate = `${startYear}-06-01`;
            endDate = `${startYear}-10-31`;
        } else if (semesterNumber === 2) {
            startDate = `${startYear}-11-01`;
            endDate = `${startYear + 1}-03-31`;
        } else {
            startDate = `${startYear + 1}-04-01`;
            endDate = `${startYear + 1}-05-31`;
        }

        const semesterNames = ['1st Semester', '2nd Semester', 'Summer'];
        const semester = {
            id: semesterId,
            semester_number: semesterNumber,
            semester_name: semesterNames[semesterNumber - 1] || 'Unknown',
            year_name: `${startYear}-${startYear + 1}`,
            start_date: startDate,
            end_date: endDate
        };

        // Get borrowings within this date range
        const [borrowings] = await db.query(`
            SELECT
                bt.*,
                b.title,
                b.author,
                b.isbn,
                COALESCE(f.fine_amount, 0) as fine_amount,
                COALESCE(f.paid_amount, 0) as paid_amount
            FROM borrowing_transactions bt
            JOIN books b ON bt.book_id = b.id
            LEFT JOIN fines f ON bt.id = f.transaction_id
            WHERE bt.student_id_number = ?
            AND bt.borrowed_date >= ? AND bt.borrowed_date <= ?
            ORDER BY bt.borrowed_date DESC
        `, [idNumber, startDate, endDate]);

        // Get payments within this date range
        const [payments] = await db.query(`
            SELECT fp.*
            FROM fine_payments fp
            JOIN users u ON fp.user_id = u.id
            WHERE u.id = ?
            AND fp.payment_date >= ? AND fp.payment_date <= ?
            ORDER BY fp.payment_date DESC
        `, [userId, startDate, endDate]);

        res.json({
            success: true,
            data: {
                semester,
                borrowings,
                payments
            }
        });
    } catch (error) {
        logger.error('Semester detail fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch semester details',
            error: error.message
        });
    }
});

// POST /api/student-records/:userId/clear-semester
// Mark semester as cleared (admin only)
// Note: Clearance is now calculated dynamically based on borrowings and fines
router.post('/:userId/clear-semester', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        const { semesterId, remarks } = req.body;

        // Verify student exists
        const [students] = await db.query('SELECT id_number FROM users WHERE id = ?', [userId]);
        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const idNumber = students[0].id_number;

        // Parse semesterId to get date range
        const parts = semesterId.split('-');
        if (parts.length < 3) {
            return res.status(400).json({ success: false, message: 'Invalid semester ID format' });
        }

        const startYear = parseInt(parts[0]);
        const semesterNumber = parseInt(parts[2]);

        let startDate, endDate;
        if (semesterNumber === 1) {
            startDate = `${startYear}-06-01`;
            endDate = `${startYear}-10-31`;
        } else if (semesterNumber === 2) {
            startDate = `${startYear}-11-01`;
            endDate = `${startYear + 1}-03-31`;
        } else {
            startDate = `${startYear + 1}-04-01`;
            endDate = `${startYear + 1}-05-31`;
        }

        // Check if all books are returned and fines paid for this semester
        const [pendingBorrowings] = await db.query(`
            SELECT COUNT(*) as count
            FROM borrowing_transactions
            WHERE student_id_number = ?
            AND borrowed_date >= ? AND borrowed_date <= ?
            AND returned_date IS NULL
        `, [idNumber, startDate, endDate]);

        const [unpaidFines] = await db.query(`
            SELECT COALESCE(SUM(f.fine_amount - f.paid_amount), 0) as balance
            FROM fines f
            JOIN borrowing_transactions bt ON f.transaction_id = bt.id
            WHERE bt.student_id_number = ?
            AND bt.borrowed_date >= ? AND bt.borrowed_date <= ?
        `, [idNumber, startDate, endDate]);

        if (pendingBorrowings[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot clear semester: ${pendingBorrowings[0].count} book(s) still borrowed`
            });
        }

        if (parseFloat(unpaidFines[0].balance) > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot clear semester: ₱${parseFloat(unpaidFines[0].balance).toFixed(2)} in unpaid fines`
            });
        }

        // Log the clearance action
        await db.query(`
            INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values, ip_address)
            VALUES (?, 'SEMESTER_CLEARED', 'student_records', ?, ?, ?)
        `, [
            req.user.userId,
            userId,
            JSON.stringify({ semesterId, remarks, clearedAt: new Date() }),
            req.ip || 'unknown'
        ]);

        res.json({
            success: true,
            message: 'Semester cleared successfully'
        });
    } catch (error) {
        logger.error('Clear semester error:', error);
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
        logger.error('Clearance status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get clearance status',
            error: error.message
        });
    }
});

module.exports = router;
