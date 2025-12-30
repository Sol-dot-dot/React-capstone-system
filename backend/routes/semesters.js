const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/semesters/academic-years - Get all academic years
router.get('/academic-years', auth, async (req, res) => {
    try {
        const [years] = await db.query(`
            SELECT
                ay.*,
                (SELECT COUNT(*) FROM semesters WHERE academic_year_id = ay.id) as semester_count
            FROM academic_years ay
            ORDER BY ay.start_date DESC
        `);

        res.json({
            success: true,
            data: years
        });
    } catch (error) {
        console.error('Error fetching academic years:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch academic years',
            error: error.message
        });
    }
});

// GET /api/semesters - Get all semesters
router.get('/', auth, async (req, res) => {
    try {
        const { academicYearId } = req.query;

        let query = `
            SELECT
                s.*,
                ay.year_name as academic_year_name
            FROM semesters s
            JOIN academic_years ay ON s.academic_year_id = ay.id
        `;

        const params = [];
        if (academicYearId) {
            query += ' WHERE s.academic_year_id = ?';
            params.push(academicYearId);
        }

        query += ' ORDER BY ay.start_date DESC, s.semester_number ASC';

        const [semesters] = await db.query(query, params);

        res.json({
            success: true,
            data: semesters
        });
    } catch (error) {
        console.error('Error fetching semesters:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch semesters',
            error: error.message
        });
    }
});

// GET /api/semesters/current - Get current semester
router.get('/current', auth, async (req, res) => {
    try {
        const [semesters] = await db.query(`
            SELECT
                s.*,
                ay.year_name as academic_year_name,
                ay.start_date as year_start_date,
                ay.end_date as year_end_date
            FROM semesters s
            JOIN academic_years ay ON s.academic_year_id = ay.id
            WHERE s.is_current = TRUE
            LIMIT 1
        `);

        if (semesters.length === 0) {
            // Try to find based on current date
            const [dateSemesters] = await db.query(`
                SELECT
                    s.*,
                    ay.year_name as academic_year_name,
                    ay.start_date as year_start_date,
                    ay.end_date as year_end_date
                FROM semesters s
                JOIN academic_years ay ON s.academic_year_id = ay.id
                WHERE CURDATE() BETWEEN s.start_date AND s.end_date
                LIMIT 1
            `);

            if (dateSemesters.length > 0) {
                return res.json({
                    success: true,
                    data: dateSemesters[0],
                    note: 'No current semester set, using date-based match'
                });
            }

            return res.json({
                success: false,
                message: 'No current semester found',
                data: null
            });
        }

        res.json({
            success: true,
            data: semesters[0]
        });
    } catch (error) {
        console.error('Error fetching current semester:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch current semester',
            error: error.message
        });
    }
});

// POST /api/semesters/academic-years - Create academic year
router.post('/academic-years', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { year_name, start_date, end_date, is_current } = req.body;

        if (!year_name || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'year_name, start_date, and end_date are required'
            });
        }

        // If setting as current, unset all others
        if (is_current) {
            await db.query('UPDATE academic_years SET is_current = FALSE');
        }

        const [result] = await db.query(`
            INSERT INTO academic_years (year_name, start_date, end_date, is_current)
            VALUES (?, ?, ?, ?)
        `, [year_name, start_date, end_date, is_current || false]);

        res.json({
            success: true,
            message: 'Academic year created successfully',
            data: { id: result.insertId, year_name, start_date, end_date, is_current }
        });
    } catch (error) {
        console.error('Error creating academic year:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create academic year',
            error: error.message
        });
    }
});

// POST /api/semesters - Create semester
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { academic_year_id, semester_number, semester_name, start_date, end_date, is_current } = req.body;

        if (!academic_year_id || !semester_number || !semester_name || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: academic_year_id, semester_number, semester_name, start_date, end_date'
            });
        }

        // If setting as current, unset all others
        if (is_current) {
            await db.query('UPDATE semesters SET is_current = FALSE');
        }

        const [result] = await db.query(`
            INSERT INTO semesters (academic_year_id, semester_number, semester_name, start_date, end_date, is_current)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [academic_year_id, semester_number, semester_name, start_date, end_date, is_current || false]);

        res.json({
            success: true,
            message: 'Semester created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Error creating semester:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create semester',
            error: error.message
        });
    }
});

// PUT /api/semesters/:id/set-current - Set semester as current
router.put('/:id/set-current', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { id } = req.params;

        // Verify semester exists
        const [existing] = await db.query('SELECT * FROM semesters WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Semester not found'
            });
        }

        // Unset all current flags
        await db.query('UPDATE semesters SET is_current = FALSE');
        await db.query('UPDATE academic_years SET is_current = FALSE');

        // Set this semester as current
        await db.query('UPDATE semesters SET is_current = TRUE WHERE id = ?', [id]);

        // Also set its academic year as current
        await db.query('UPDATE academic_years SET is_current = TRUE WHERE id = ?', [existing[0].academic_year_id]);

        res.json({
            success: true,
            message: 'Semester set as current successfully'
        });
    } catch (error) {
        console.error('Error setting current semester:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to set current semester',
            error: error.message
        });
    }
});

// PUT /api/semesters/academic-years/:id - Update academic year
router.put('/academic-years/:id', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { id } = req.params;
        const { year_name, start_date, end_date, is_current } = req.body;

        // If setting as current, unset all others
        if (is_current) {
            await db.query('UPDATE academic_years SET is_current = FALSE');
        }

        await db.query(`
            UPDATE academic_years
            SET year_name = ?, start_date = ?, end_date = ?, is_current = ?
            WHERE id = ?
        `, [year_name, start_date, end_date, is_current || false, id]);

        res.json({
            success: true,
            message: 'Academic year updated successfully'
        });
    } catch (error) {
        console.error('Error updating academic year:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update academic year',
            error: error.message
        });
    }
});

// PUT /api/semesters/:id - Update semester
router.put('/:id', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { id } = req.params;
        const { semester_name, start_date, end_date, is_current } = req.body;

        // If setting as current, unset all others
        if (is_current) {
            await db.query('UPDATE semesters SET is_current = FALSE');
        }

        await db.query(`
            UPDATE semesters
            SET semester_name = ?, start_date = ?, end_date = ?, is_current = ?
            WHERE id = ?
        `, [semester_name, start_date, end_date, is_current || false, id]);

        res.json({
            success: true,
            message: 'Semester updated successfully'
        });
    } catch (error) {
        console.error('Error updating semester:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update semester',
            error: error.message
        });
    }
});

// GET /api/semesters/stats - Get semester statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const { semesterId } = req.query;

        let whereClause = '';
        const params = [];

        if (semesterId) {
            whereClause = 'WHERE bt.semester_id = ?';
            params.push(semesterId);
        }

        const [stats] = await db.query(`
            SELECT
                COUNT(DISTINCT bt.id) as total_borrowings,
                COUNT(DISTINCT bt.student_id_number) as unique_students,
                COUNT(DISTINCT bt.book_id) as unique_books,
                SUM(CASE WHEN bt.status = 'returned' THEN 1 ELSE 0 END) as returned_count,
                SUM(CASE WHEN bt.status IN ('borrowed', 'overdue') THEN 1 ELSE 0 END) as active_count,
                SUM(CASE WHEN bt.status = 'overdue' THEN 1 ELSE 0 END) as overdue_count
            FROM borrowing_transactions bt
            ${whereClause}
        `, params);

        res.json({
            success: true,
            data: stats[0]
        });
    } catch (error) {
        console.error('Error fetching semester stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch semester statistics',
            error: error.message
        });
    }
});

// POST /api/semesters/update-existing-borrowings - Update existing borrowings with semester data
router.post('/update-existing-borrowings', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        // Update existing borrowings to link with appropriate semester based on borrowed_date
        const [result] = await db.query(`
            UPDATE borrowing_transactions bt
            LEFT JOIN semesters s ON bt.borrowed_date BETWEEN s.start_date AND s.end_date
            LEFT JOIN academic_years ay ON s.academic_year_id = ay.id
            SET
                bt.semester_id = s.id,
                bt.academic_year_id = ay.id
            WHERE bt.semester_id IS NULL AND s.id IS NOT NULL
        `);

        res.json({
            success: true,
            message: 'Existing borrowings updated with semester data',
            data: {
                updatedRows: result.affectedRows
            }
        });
    } catch (error) {
        console.error('Error updating existing borrowings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update existing borrowings',
            error: error.message
        });
    }
});

// POST /api/semesters/run-migration - Run complete semester migration
router.post('/run-migration', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const results = {
            academicYears: 0,
            semesters: 0,
            columnsAdded: [],
            borrowingsUpdated: 0,
            studentYearHistory: 0,
            semesterClearances: 0
        };

        // Step 1: Ensure academic_years table exists with data
        await db.query(`
            CREATE TABLE IF NOT EXISTS academic_years (
                id INT PRIMARY KEY AUTO_INCREMENT,
                year_name VARCHAR(20) NOT NULL UNIQUE,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                is_current BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_year_name (year_name),
                INDEX idx_is_current (is_current)
            )
        `);

        const academicYears = [
            ['2020-2021', '2020-08-01', '2021-05-31', 0],
            ['2021-2022', '2021-08-01', '2022-05-31', 0],
            ['2022-2023', '2022-08-01', '2023-05-31', 0],
            ['2023-2024', '2023-08-01', '2024-05-31', 0],
            ['2024-2025', '2024-08-01', '2025-05-31', 1]
        ];

        for (const year of academicYears) {
            await db.query(`
                INSERT INTO academic_years (year_name, start_date, end_date, is_current)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE is_current = VALUES(is_current)
            `, year);
            results.academicYears++;
        }

        // Step 2: Ensure semesters table exists with data
        await db.query(`
            CREATE TABLE IF NOT EXISTS semesters (
                id INT PRIMARY KEY AUTO_INCREMENT,
                academic_year_id INT NOT NULL,
                semester_number INT NOT NULL,
                semester_name VARCHAR(50) NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                is_current BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_academic_year (academic_year_id),
                INDEX idx_is_current (is_current),
                UNIQUE KEY unique_semester (academic_year_id, semester_number)
            )
        `);

        const [years] = await db.query('SELECT id, year_name FROM academic_years ORDER BY start_date');
        const semesterData = {
            '2020-2021': [[1, 'First Semester', '2020-08-01', '2020-12-20', 0], [2, 'Second Semester', '2021-01-10', '2021-05-31', 0]],
            '2021-2022': [[1, 'First Semester', '2021-08-01', '2021-12-20', 0], [2, 'Second Semester', '2022-01-10', '2022-05-31', 0]],
            '2022-2023': [[1, 'First Semester', '2022-08-01', '2022-12-20', 0], [2, 'Second Semester', '2023-01-10', '2023-05-31', 0]],
            '2023-2024': [[1, 'First Semester', '2023-08-01', '2023-12-20', 0], [2, 'Second Semester', '2024-01-10', '2024-05-31', 0]],
            '2024-2025': [[1, 'First Semester', '2024-08-01', '2024-12-20', 1], [2, 'Second Semester', '2025-01-10', '2025-05-31', 0]]
        };

        for (const year of years) {
            const semesters = semesterData[year.year_name];
            if (semesters) {
                for (const sem of semesters) {
                    await db.query(`
                        INSERT INTO semesters (academic_year_id, semester_number, semester_name, start_date, end_date, is_current)
                        VALUES (?, ?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE semester_name = VALUES(semester_name), is_current = VALUES(is_current)
                    `, [year.id, ...sem]);
                    results.semesters++;
                }
            }
        }

        // Step 3: Add columns to borrowing_transactions if they don't exist
        const [columns] = await db.query(`
            SELECT COLUMN_NAME FROM information_schema.columns
            WHERE table_schema = DATABASE()
            AND table_name = 'borrowing_transactions'
            AND column_name IN ('semester_id', 'academic_year_id')
        `);
        const existingColumns = columns.map(c => c.COLUMN_NAME);

        if (!existingColumns.includes('semester_id')) {
            await db.query('ALTER TABLE borrowing_transactions ADD COLUMN semester_id INT NULL');
            results.columnsAdded.push('semester_id');
        }
        if (!existingColumns.includes('academic_year_id')) {
            await db.query('ALTER TABLE borrowing_transactions ADD COLUMN academic_year_id INT NULL');
            results.columnsAdded.push('academic_year_id');
        }

        // Step 4: Link borrowings to semesters
        const [updateResult] = await db.query(`
            UPDATE borrowing_transactions bt
            JOIN semesters s ON bt.borrowed_date BETWEEN s.start_date AND s.end_date
            SET bt.semester_id = s.id, bt.academic_year_id = s.academic_year_id
            WHERE bt.semester_id IS NULL AND bt.borrowed_date IS NOT NULL AND bt.borrowed_date != '0000-00-00'
        `);
        results.borrowingsUpdated = updateResult.affectedRows;

        // Step 5: Create student_year_history table
        await db.query(`
            CREATE TABLE IF NOT EXISTS student_year_history (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                academic_year_id INT NOT NULL,
                year_level INT NOT NULL,
                status ENUM('enrolled', 'graduated', 'dropped', 'on_leave') DEFAULT 'enrolled',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_user_year (user_id, academic_year_id),
                UNIQUE KEY unique_user_year (user_id, academic_year_id)
            )
        `);

        // Step 6: Generate student year history
        const [historyResult] = await db.query(`
            INSERT IGNORE INTO student_year_history (user_id, academic_year_id, year_level, status)
            SELECT DISTINCT
                u.id as user_id,
                bt.academic_year_id,
                1 as year_level,
                'enrolled'
            FROM borrowing_transactions bt
            JOIN users u ON bt.student_id_number = u.id_number
            WHERE bt.academic_year_id IS NOT NULL AND u.role = 'student'
        `);
        results.studentYearHistory = historyResult.affectedRows;

        // Step 7: Create semester_clearances table
        await db.query(`
            CREATE TABLE IF NOT EXISTS semester_clearances (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                semester_id INT NOT NULL,
                books_borrowed INT DEFAULT 0,
                books_required INT DEFAULT 20,
                total_fines DECIMAL(10,2) DEFAULT 0.00,
                fines_paid DECIMAL(10,2) DEFAULT 0.00,
                is_cleared BOOLEAN DEFAULT FALSE,
                cleared_date DATE,
                cleared_by INT,
                remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_user_semester (user_id, semester_id),
                INDEX idx_is_cleared (is_cleared),
                UNIQUE KEY unique_user_semester (user_id, semester_id)
            )
        `);

        // Step 8: Populate semester_clearances
        const [clearanceResult] = await db.query(`
            INSERT IGNORE INTO semester_clearances (user_id, semester_id, books_borrowed, total_fines, fines_paid)
            SELECT
                u.id as user_id,
                bt.semester_id,
                COUNT(DISTINCT bt.id) as books_borrowed,
                COALESCE(SUM(f.fine_amount), 0) as total_fines,
                COALESCE(SUM(f.paid_amount), 0) as fines_paid
            FROM borrowing_transactions bt
            JOIN users u ON bt.student_id_number = u.id_number
            LEFT JOIN fines f ON bt.id = f.transaction_id
            WHERE bt.semester_id IS NOT NULL AND u.role = 'student'
            GROUP BY u.id, bt.semester_id
        `);
        results.semesterClearances = clearanceResult.affectedRows;

        res.json({
            success: true,
            message: 'Migration completed successfully',
            data: results
        });

    } catch (error) {
        console.error('Error running migration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to run migration',
            error: error.message
        });
    }
});

module.exports = router;
