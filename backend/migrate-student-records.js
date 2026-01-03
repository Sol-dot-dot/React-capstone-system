const db = require('./config/database');

async function runMigration() {
    try {
        console.log('[INFO] Creating Student Records Schema...\n');

        // 1. Create academic_years table
        console.log('Creating academic_years table...');
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

        // 2. Create semesters table
        console.log('Creating semesters table...');
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
                FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
                INDEX idx_academic_year (academic_year_id),
                INDEX idx_is_current (is_current),
                UNIQUE KEY unique_semester (academic_year_id, semester_number)
            )
        `);

        // 3. Create student_year_history table
        console.log('Creating student_year_history table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS student_year_history (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                academic_year_id INT NOT NULL,
                year_level INT NOT NULL,
                status ENUM('enrolled', 'graduated', 'dropped', 'on_leave') DEFAULT 'enrolled',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
                INDEX idx_user_year (user_id, academic_year_id),
                UNIQUE KEY unique_user_year (user_id, academic_year_id)
            )
        `);

        // 4. Create semester_clearances table
        console.log('Creating semester_clearances table...');
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
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
                INDEX idx_user_semester (user_id, semester_id),
                INDEX idx_is_cleared (is_cleared),
                UNIQUE KEY unique_user_semester (user_id, semester_id)
            )
        `);

        // 5. Create fine_payments table
        console.log('Creating fine_payments table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS fine_payments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                borrowing_id INT,
                semester_id INT,
                amount DECIMAL(10,2) NOT NULL,
                payment_date DATE NOT NULL,
                payment_method ENUM('cash', 'gcash', 'bank_transfer', 'other') DEFAULT 'cash',
                reference_number VARCHAR(100),
                received_by INT,
                remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE SET NULL,
                INDEX idx_user_id (user_id),
                INDEX idx_semester (semester_id),
                INDEX idx_payment_date (payment_date)
            )
        `);

        // 6. Add columns to borrowing_transactions if they don't exist
        console.log('Adding semester columns to borrowing_transactions...');

        // Check if columns exist
        const [columns] = await db.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'borrowing_transactions'
            AND COLUMN_NAME IN ('semester_id', 'academic_year_id')
        `);

        const existingColumns = columns.map(c => c.COLUMN_NAME);

        if (!existingColumns.includes('semester_id')) {
            await db.query('ALTER TABLE borrowing_transactions ADD COLUMN semester_id INT');
            await db.query('ALTER TABLE borrowing_transactions ADD INDEX idx_semester (semester_id)');
            console.log('  ✓ Added semester_id column');
        }

        if (!existingColumns.includes('academic_year_id')) {
            await db.query('ALTER TABLE borrowing_transactions ADD COLUMN academic_year_id INT');
            await db.query('ALTER TABLE borrowing_transactions ADD INDEX idx_academic_year (academic_year_id)');
            console.log('  ✓ Added academic_year_id column');
        }

        // 7. Insert sample academic years
        console.log('\nInserting sample academic years...');
        await db.query(`
            INSERT IGNORE INTO academic_years (year_name, start_date, end_date, is_current) VALUES
            ('2021-2022', '2021-08-01', '2022-05-31', FALSE),
            ('2022-2023', '2022-08-01', '2023-05-31', FALSE),
            ('2023-2024', '2023-08-01', '2024-05-31', FALSE),
            ('2024-2025', '2024-08-01', '2025-05-31', TRUE)
        `);

        // 8. Insert semesters for each academic year
        console.log('Inserting semesters...');
        const [years] = await db.query('SELECT * FROM academic_years');

        for (const year of years) {
            // First Semester (Aug-Dec)
            await db.query(`
                INSERT IGNORE INTO semesters (academic_year_id, semester_number, semester_name, start_date, end_date, is_current)
                VALUES (?, 1, 'First Semester', ?, DATE_ADD(?, INTERVAL 4 MONTH), ?)
            `, [
                year.id,
                year.start_date,
                year.start_date,
                year.is_current && new Date().getMonth() >= 7 && new Date().getMonth() <= 11
            ]);

            // Second Semester (Jan-May)
            await db.query(`
                INSERT IGNORE INTO semesters (academic_year_id, semester_number, semester_name, start_date, end_date, is_current)
                VALUES (?, 2, 'Second Semester', DATE_ADD(?, INTERVAL 5 MONTH), ?, ?)
            `, [
                year.id,
                year.start_date,
                year.end_date,
                year.is_current && new Date().getMonth() >= 0 && new Date().getMonth() <= 4
            ]);
        }

        // 9. Update existing borrowings with semester info
        console.log('Updating existing borrowings with semester information...');
        await db.query(`
            UPDATE borrowing_transactions bt
            LEFT JOIN semesters s ON bt.borrowed_date BETWEEN s.start_date AND s.end_date
            SET bt.semester_id = s.id,
                bt.academic_year_id = s.academic_year_id
            WHERE bt.semester_id IS NULL
        `);

        console.log('\n[OK] Migration completed successfully!\n');

        // Verify
        const [academicYears] = await db.query('SELECT COUNT(*) as count FROM academic_years');
        const [semesters] = await db.query('SELECT COUNT(*) as count FROM semesters');
        const [currentYear] = await db.query('SELECT * FROM academic_years WHERE is_current = TRUE LIMIT 1');

        console.log('[INFO] Summary:');
        console.log(`   Academic Years: ${academicYears[0].count}`);
        console.log(`   Semesters: ${semesters[0].count}`);
        if (currentYear.length > 0) {
            console.log(`   Current Year: ${currentYear[0].year_name}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('[ERROR] Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
