const fs = require('fs');
const path = require('path');
const db = require('./config/database');

async function runMigration() {
    try {
        console.log('========================================');
        console.log('  SMC Library System - Semester Tracking Migration');
        console.log('========================================\n');

        // Step 1: Create the base tables
        console.log('Step 1: Creating base tables...\n');

        // Read and execute the SQL file
        const sqlFile = path.join(__dirname, 'migrations', 'add_student_records_schema.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        // Split by statements and execute
        const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        console.log(`Found ${statements.length} SQL statements to execute\n`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement && !statement.match(/^(SELECT|SET)/i)) {
                try {
                    console.log(`  [${i + 1}/${statements.length}] Executing statement...`);
                    await db.query(statement);
                    console.log(`      OK`);
                } catch (error) {
                    if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
                        console.log(`      (Already exists - skipping)`);
                    } else {
                        console.warn(`      Warning: ${error.message}`);
                    }
                }
            }
        }

        // Step 2: Add semester columns to borrowing_transactions if they don't exist
        console.log('\nStep 2: Adding semester columns to borrowing_transactions...\n');

        try {
            // Check if columns exist
            const [columns] = await db.query(`
                SELECT COLUMN_NAME
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'borrowing_transactions'
                AND COLUMN_NAME IN ('semester_id', 'academic_year_id')
            `);

            const existingColumns = columns.map(c => c.COLUMN_NAME);

            if (!existingColumns.includes('semester_id')) {
                console.log('  Adding semester_id column...');
                await db.query('ALTER TABLE borrowing_transactions ADD COLUMN semester_id INT');
                console.log('      OK');
            } else {
                console.log('  semester_id column already exists');
            }

            if (!existingColumns.includes('academic_year_id')) {
                console.log('  Adding academic_year_id column...');
                await db.query('ALTER TABLE borrowing_transactions ADD COLUMN academic_year_id INT');
                console.log('      OK');
            } else {
                console.log('  academic_year_id column already exists');
            }

            // Add indexes if they don't exist
            console.log('  Adding indexes...');
            try {
                await db.query('CREATE INDEX idx_bt_semester ON borrowing_transactions(semester_id)');
                console.log('      Added idx_bt_semester');
            } catch (e) {
                if (e.message.includes('Duplicate')) {
                    console.log('      idx_bt_semester already exists');
                }
            }

            try {
                await db.query('CREATE INDEX idx_bt_academic_year ON borrowing_transactions(academic_year_id)');
                console.log('      Added idx_bt_academic_year');
            } catch (e) {
                if (e.message.includes('Duplicate')) {
                    console.log('      idx_bt_academic_year already exists');
                }
            }

        } catch (error) {
            console.error('  Error modifying borrowing_transactions:', error.message);
        }

        // Step 3: Update existing borrowings with semester data
        console.log('\nStep 3: Updating existing borrowings with semester data...\n');

        try {
            const [updateResult] = await db.query(`
                UPDATE borrowing_transactions bt
                JOIN semesters s ON bt.borrowed_date BETWEEN s.start_date AND s.end_date
                SET
                    bt.semester_id = s.id,
                    bt.academic_year_id = s.academic_year_id
                WHERE bt.semester_id IS NULL
            `);

            console.log(`  Updated ${updateResult.affectedRows} borrowing records with semester data`);
        } catch (error) {
            console.error('  Error updating borrowings:', error.message);
        }

        // Step 4: Verify tables were created
        console.log('\nStep 4: Verifying created tables...\n');

        const [tables] = await db.query(`
            SELECT TABLE_NAME
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME IN ('academic_years', 'semesters', 'student_year_history', 'semester_clearances', 'semester_fine_payments')
        `);

        console.log('  Created tables:');
        tables.forEach(t => console.log(`    - ${t.TABLE_NAME}`));

        // Step 5: Display current academic year and semester
        console.log('\nStep 5: Current semester information...\n');

        const [currentYear] = await db.query('SELECT * FROM academic_years WHERE is_current = TRUE');
        if (currentYear.length > 0) {
            console.log(`  Current Academic Year: ${currentYear[0].year_name}`);
        } else {
            console.log('  Warning: No current academic year set');
        }

        const [currentSemester] = await db.query(`
            SELECT s.*, ay.year_name
            FROM semesters s
            JOIN academic_years ay ON s.academic_year_id = ay.id
            WHERE s.is_current = TRUE
        `);
        if (currentSemester.length > 0) {
            console.log(`  Current Semester: ${currentSemester[0].semester_name} (${currentSemester[0].year_name})`);
        } else {
            console.log('  Warning: No current semester set');

            // Try to set a current semester based on date
            console.log('  Attempting to set current semester based on today\'s date...');
            const [dateSemester] = await db.query(`
                SELECT s.id, s.semester_name, ay.year_name
                FROM semesters s
                JOIN academic_years ay ON s.academic_year_id = ay.id
                WHERE CURDATE() BETWEEN s.start_date AND s.end_date
                LIMIT 1
            `);

            if (dateSemester.length > 0) {
                await db.query('UPDATE semesters SET is_current = FALSE');
                await db.query('UPDATE semesters SET is_current = TRUE WHERE id = ?', [dateSemester[0].id]);
                console.log(`  Set current semester to: ${dateSemester[0].semester_name} (${dateSemester[0].year_name})`);
            }
        }

        // Step 6: Display statistics
        console.log('\nStep 6: Statistics...\n');

        const [semesterCount] = await db.query('SELECT COUNT(*) as count FROM semesters');
        console.log(`  Total Semesters: ${semesterCount[0].count}`);

        const [borrowingsWithSemester] = await db.query(`
            SELECT COUNT(*) as count FROM borrowing_transactions WHERE semester_id IS NOT NULL
        `);
        const [totalBorrowings] = await db.query('SELECT COUNT(*) as count FROM borrowing_transactions');

        console.log(`  Borrowings with semester: ${borrowingsWithSemester[0].count} / ${totalBorrowings[0].count}`);

        console.log('\n========================================');
        console.log('  Migration Completed Successfully!');
        console.log('========================================\n');

        console.log('Next steps:');
        console.log('1. Restart your backend server');
        console.log('2. Access /api/semesters/current to verify the current semester');
        console.log('3. Use /api/student-records/:userId to view semester-based student records\n');

        process.exit(0);
    } catch (error) {
        console.error('\nMigration failed:', error);
        process.exit(1);
    }
}

runMigration();
