/**
 * Semester Tracking Migration Script
 *
 * This script adds semester tracking to the borrowing system:
 * 1. Creates/ensures academic_years and semesters tables with data
 * 2. Adds semester_id and academic_year_id columns to borrowing_transactions
 * 3. Links existing borrowings to appropriate semesters based on borrowed_date
 * 4. Creates student year history based on borrowing patterns
 *
 * Usage: node migrations/run_semester_migration.js
 */

require('dotenv').config({ path: './config.env' });
const mysql = require('mysql2/promise');

async function runMigration() {
    console.log('🚀 Starting Semester Tracking Migration...\n');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'capstone_system_optimized',
        port: process.env.DB_PORT || 3306,
        multipleStatements: true
    });

    try {
        // Step 1: Create academic_years table
        console.log('📅 Step 1: Creating/updating academic_years table...');
        await connection.execute(`
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

        // Insert academic years
        const academicYears = [
            ['2020-2021', '2020-08-01', '2021-05-31', 0],
            ['2021-2022', '2021-08-01', '2022-05-31', 0],
            ['2022-2023', '2022-08-01', '2023-05-31', 0],
            ['2023-2024', '2023-08-01', '2024-05-31', 0],
            ['2024-2025', '2024-08-01', '2025-05-31', 1]
        ];

        for (const year of academicYears) {
            await connection.execute(`
                INSERT INTO academic_years (year_name, start_date, end_date, is_current)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE is_current = VALUES(is_current)
            `, year);
        }
        console.log('   ✅ Academic years created/updated\n');

        // Step 2: Create semesters table
        console.log('📚 Step 2: Creating/updating semesters table...');
        await connection.execute(`
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

        // Get academic year IDs and insert semesters
        const [years] = await connection.execute('SELECT id, year_name FROM academic_years ORDER BY start_date');

        const semesterData = {
            '2020-2021': [
                [1, 'First Semester', '2020-08-01', '2020-12-20', 0],
                [2, 'Second Semester', '2021-01-10', '2021-05-31', 0]
            ],
            '2021-2022': [
                [1, 'First Semester', '2021-08-01', '2021-12-20', 0],
                [2, 'Second Semester', '2022-01-10', '2022-05-31', 0]
            ],
            '2022-2023': [
                [1, 'First Semester', '2022-08-01', '2022-12-20', 0],
                [2, 'Second Semester', '2023-01-10', '2023-05-31', 0]
            ],
            '2023-2024': [
                [1, 'First Semester', '2023-08-01', '2023-12-20', 0],
                [2, 'Second Semester', '2024-01-10', '2024-05-31', 0]
            ],
            '2024-2025': [
                [1, 'First Semester', '2024-08-01', '2024-12-20', 1],
                [2, 'Second Semester', '2025-01-10', '2025-05-31', 0]
            ]
        };

        for (const year of years) {
            const semesters = semesterData[year.year_name];
            if (semesters) {
                for (const sem of semesters) {
                    await connection.execute(`
                        INSERT INTO semesters (academic_year_id, semester_number, semester_name, start_date, end_date, is_current)
                        VALUES (?, ?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE semester_name = VALUES(semester_name), is_current = VALUES(is_current)
                    `, [year.id, ...sem]);
                }
            }
        }
        console.log('   ✅ Semesters created/updated\n');

        // Step 3: Add columns to borrowing_transactions
        console.log('🔧 Step 3: Adding semester columns to borrowing_transactions...');

        // Check if columns exist
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME FROM information_schema.columns
            WHERE table_schema = DATABASE()
            AND table_name = 'borrowing_transactions'
            AND column_name IN ('semester_id', 'academic_year_id')
        `);

        const existingColumns = columns.map(c => c.COLUMN_NAME);

        if (!existingColumns.includes('semester_id')) {
            await connection.execute('ALTER TABLE borrowing_transactions ADD COLUMN semester_id INT NULL');
            console.log('   ✅ Added semester_id column');
        } else {
            console.log('   ⏭️ semester_id column already exists');
        }

        if (!existingColumns.includes('academic_year_id')) {
            await connection.execute('ALTER TABLE borrowing_transactions ADD COLUMN academic_year_id INT NULL');
            console.log('   ✅ Added academic_year_id column');
        } else {
            console.log('   ⏭️ academic_year_id column already exists');
        }
        console.log('');

        // Step 4: Link existing borrowings to semesters
        console.log('🔗 Step 4: Linking existing borrowings to semesters...');

        // Get count of borrowings without semester data
        const [beforeCount] = await connection.execute(`
            SELECT COUNT(*) as count FROM borrowing_transactions
            WHERE semester_id IS NULL AND borrowed_date IS NOT NULL AND borrowed_date != '0000-00-00'
        `);
        console.log(`   Found ${beforeCount[0].count} borrowings to update`);

        // Link borrowings to semesters based on borrowed_date
        const [updateResult] = await connection.execute(`
            UPDATE borrowing_transactions bt
            JOIN semesters s ON bt.borrowed_date BETWEEN s.start_date AND s.end_date
            SET bt.semester_id = s.id, bt.academic_year_id = s.academic_year_id
            WHERE bt.semester_id IS NULL AND bt.borrowed_date IS NOT NULL AND bt.borrowed_date != '0000-00-00'
        `);
        console.log(`   ✅ Updated ${updateResult.affectedRows} borrowings with exact semester match`);

        // For any remaining borrowings, find closest semester
        const [remainingCount] = await connection.execute(`
            SELECT COUNT(*) as count FROM borrowing_transactions
            WHERE semester_id IS NULL AND borrowed_date IS NOT NULL AND borrowed_date != '0000-00-00'
        `);

        if (remainingCount[0].count > 0) {
            console.log(`   📌 ${remainingCount[0].count} borrowings need closest semester assignment...`);

            // Get borrowings without semester
            const [borrowingsToUpdate] = await connection.execute(`
                SELECT id, borrowed_date FROM borrowing_transactions
                WHERE semester_id IS NULL AND borrowed_date IS NOT NULL AND borrowed_date != '0000-00-00'
            `);

            // Get all semesters
            const [allSemesters] = await connection.execute('SELECT id, academic_year_id, start_date FROM semesters ORDER BY start_date');

            // Update each borrowing with closest semester
            for (const bt of borrowingsToUpdate) {
                // Find closest semester by start_date
                let closestSemester = allSemesters[0];
                let minDiff = Math.abs(new Date(bt.borrowed_date) - new Date(allSemesters[0].start_date));

                for (const sem of allSemesters) {
                    const diff = Math.abs(new Date(bt.borrowed_date) - new Date(sem.start_date));
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestSemester = sem;
                    }
                }

                await connection.execute(`
                    UPDATE borrowing_transactions
                    SET semester_id = ?, academic_year_id = ?
                    WHERE id = ?
                `, [closestSemester.id, closestSemester.academic_year_id, bt.id]);
            }
            console.log(`   ✅ Updated remaining borrowings with closest semester match`);
        }
        console.log('');

        // Step 5: Create student_year_history table
        console.log('👤 Step 5: Creating student_year_history table...');
        await connection.execute(`
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
        console.log('   ✅ student_year_history table created/exists\n');

        // Step 6: Generate student year history from borrowing data
        console.log('📊 Step 6: Generating student year history...');

        // Get unique student-academic year combinations from borrowings
        const [studentYears] = await connection.execute(`
            SELECT DISTINCT
                u.id as user_id,
                bt.academic_year_id
            FROM borrowing_transactions bt
            JOIN users u ON bt.student_id_number = u.id_number
            WHERE bt.academic_year_id IS NOT NULL
            AND u.role = 'student'
            ORDER BY u.id, bt.academic_year_id
        `);

        // Group by user to calculate year levels
        const userYears = {};
        for (const row of studentYears) {
            if (!userYears[row.user_id]) {
                userYears[row.user_id] = [];
            }
            userYears[row.user_id].push(row.academic_year_id);
        }

        let historyInserted = 0;
        for (const [userId, academicYearIds] of Object.entries(userYears)) {
            // Sort academic years and assign year levels
            academicYearIds.sort((a, b) => a - b);

            for (let i = 0; i < academicYearIds.length; i++) {
                const yearLevel = Math.min(i + 1, 4); // Cap at year 4
                try {
                    await connection.execute(`
                        INSERT IGNORE INTO student_year_history (user_id, academic_year_id, year_level, status)
                        VALUES (?, ?, ?, 'enrolled')
                    `, [userId, academicYearIds[i], yearLevel]);
                    historyInserted++;
                } catch (err) {
                    // Ignore duplicate key errors
                }
            }
        }
        console.log(`   ✅ Created ${historyInserted} student year history records\n`);

        // Step 7: Create semester_clearances table
        console.log('📋 Step 7: Creating semester_clearances table...');
        await connection.execute(`
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
        console.log('   ✅ semester_clearances table created/exists\n');

        // Step 8: Populate semester_clearances
        console.log('📝 Step 8: Populating semester clearances...');
        const [clearanceResult] = await connection.execute(`
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
            WHERE bt.semester_id IS NOT NULL
            AND u.role = 'student'
            GROUP BY u.id, bt.semester_id
        `);
        console.log(`   ✅ Created/updated clearance records\n`);

        // Final verification
        console.log('✅ Migration completed! Verification:');

        const [ayCount] = await connection.execute('SELECT COUNT(*) as count FROM academic_years');
        console.log(`   Academic Years: ${ayCount[0].count}`);

        const [semCount] = await connection.execute('SELECT COUNT(*) as count FROM semesters');
        console.log(`   Semesters: ${semCount[0].count}`);

        const [btWithSem] = await connection.execute(`
            SELECT COUNT(*) as total,
                   SUM(CASE WHEN semester_id IS NOT NULL THEN 1 ELSE 0 END) as with_semester
            FROM borrowing_transactions
        `);
        console.log(`   Borrowings with semester: ${btWithSem[0].with_semester}/${btWithSem[0].total}`);

        const [syhCount] = await connection.execute('SELECT COUNT(*) as count FROM student_year_history');
        console.log(`   Student Year History: ${syhCount[0].count}`);

        const [scCount] = await connection.execute('SELECT COUNT(*) as count FROM semester_clearances');
        console.log(`   Semester Clearances: ${scCount[0].count}`);

        console.log('\n🎉 Migration completed successfully!');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

// Run the migration
runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
