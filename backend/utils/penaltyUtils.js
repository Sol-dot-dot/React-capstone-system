const db = require('../config/database');

// Get system settings
async function getSystemSettings() {
    try {
        const [rows] = await db.execute(
            'SELECT setting_key, setting_value FROM system_settings'
        );
        
        const settings = {};
        rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });
        
        return settings;
    } catch (error) {
        console.error('Error getting system settings:', error);
        throw error;
    }
}

// Update system setting
async function updateSystemSetting(key, value, adminId) {
    try {
        await db.execute(
            `INSERT INTO system_settings (setting_key, setting_value, updated_by) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE 
             setting_value = VALUES(setting_value), 
             updated_by = VALUES(updated_by), 
             updated_at = CURRENT_TIMESTAMP`,
            [key, value, adminId]
        );
        return true;
    } catch (error) {
        console.error('Error updating system setting:', error);
        throw error;
    }
}

// Calculate fine for overdue book
async function calculateFine(transactionId) {
    try {
        const [rows] = await db.execute(
            `SELECT 
                bt.id,
                bt.student_id_number,
                bt.due_date,
                bt.returned_at,
                bt.status,
                b.title,
                b.number_code
             FROM borrowing_transactions bt
             JOIN books b ON bt.book_id = b.id
             WHERE bt.id = ?`,
            [transactionId]
        );

        if (rows.length === 0) {
            throw new Error('Transaction not found');
        }

        const transaction = rows[0];
        const dueDate = new Date(transaction.due_date);
        const now = new Date();

        if (dueDate >= now || transaction.status === 'returned') {
            return { fineAmount: 0, daysOverdue: 0 };
        }

        const daysOverdue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
        const settings = await getSystemSettings();
        const finePerDay = parseFloat(settings.fine_per_day || 5);
        const fineAmount = daysOverdue * finePerDay;

        return {
            fineAmount,
            daysOverdue,
            transaction: transaction
        };
    } catch (error) {
        console.error('Error calculating fine:', error);
        throw error;
    }
}

// Create or update fine record
async function createOrUpdateFine(transactionId, adminId) {
    try {
        const fineCalculation = await calculateFine(transactionId);
        
        if (fineCalculation.fineAmount === 0) {
            return { created: false, message: 'No fine needed' };
        }

        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Check if fine already exists
            const [existingFines] = await connection.execute(
                'SELECT id, fine_amount, paid_amount FROM fines WHERE transaction_id = ?',
                [transactionId]
            );

            if (existingFines.length > 0) {
                const existingFine = existingFines[0];
                const newTotalFine = fineCalculation.fineAmount;
                const remainingAmount = newTotalFine - existingFine.paid_amount;
                
                if (remainingAmount > 0) {
                    await connection.execute(
                        `UPDATE fines 
                         SET fine_amount = ?, days_overdue = ?, updated_at = CURRENT_TIMESTAMP
                         WHERE transaction_id = ?`,
                        [newTotalFine, fineCalculation.daysOverdue, transactionId]
                    );
                }
            } else {
                // Create new fine record
                await connection.execute(
                    `INSERT INTO fines 
                     (student_id_number, transaction_id, fine_amount, days_overdue, fine_date) 
                     VALUES (?, ?, ?, ?, CURDATE())`,
                    [
                        fineCalculation.transaction.student_id_number,
                        transactionId,
                        fineCalculation.fineAmount,
                        fineCalculation.daysOverdue
                    ]
                );
            }

            // Update transaction status to overdue if not returned
            if (fineCalculation.transaction.status === 'borrowed') {
                await connection.execute(
                    'UPDATE borrowing_transactions SET status = "overdue" WHERE id = ?',
                    [transactionId]
                );
            }

            await connection.commit();

            return {
                created: true,
                fineAmount: fineCalculation.fineAmount,
                daysOverdue: fineCalculation.daysOverdue
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error creating/updating fine:', error);
        throw error;
    }
}

// Get student's fines
async function getStudentFines(studentIdNumber, status = null) {
    try {
        let query = `
            SELECT 
                f.id,
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
                b.author
            FROM fines f
            JOIN borrowing_transactions bt ON f.transaction_id = bt.id
            JOIN books b ON bt.book_id = b.id
            WHERE f.student_id_number = ?
        `;
        
        const params = [studentIdNumber];
        
        if (status) {
            query += ' AND f.status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY f.fine_date DESC';
        
        const [rows] = await db.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Error getting student fines:', error);
        throw error;
    }
}

// Process fine payment
async function processFinePayment(fineId, paymentAmount, paymentMethod, adminId, notes = null) {
    try {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Get fine details
            const [fineRows] = await connection.execute(
                'SELECT * FROM fines WHERE id = ?',
                [fineId]
            );

            if (fineRows.length === 0) {
                throw new Error('Fine not found');
            }

            const fine = fineRows[0];
            const newPaidAmount = fine.paid_amount + paymentAmount;
            const remainingAmount = fine.fine_amount - newPaidAmount;

            // Record payment
            await connection.execute(
                `INSERT INTO fine_payments 
                 (fine_id, payment_amount, payment_method, processed_by, notes) 
                 VALUES (?, ?, ?, ?, ?)`,
                [fineId, paymentAmount, paymentMethod, adminId, notes]
            );

            // Update fine status
            let newStatus = 'unpaid';
            if (remainingAmount <= 0) {
                newStatus = 'paid';
            }

            await connection.execute(
                `UPDATE fines 
                 SET paid_amount = ?, status = ?, paid_date = CASE WHEN ? = 'paid' THEN NOW() ELSE paid_date END
                 WHERE id = ?`,
                [newPaidAmount, newStatus, newStatus, fineId]
            );

            // Check if student can now borrow (if all fines are paid)
            if (newStatus === 'paid') {
                await checkAndUpdateStudentBorrowingStatus(fine.student_id_number, connection);
            }

            await connection.commit();

            return {
                success: true,
                newPaidAmount,
                remainingAmount,
                status: newStatus
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error processing fine payment:', error);
        throw error;
    }
}

// Check and update student borrowing status
async function checkAndUpdateStudentBorrowingStatus(studentIdNumber, connection = null) {
    try {
        const dbConnection = connection || db;
        
        // Check if student has unpaid fines
        const [unpaidFines] = await dbConnection.execute(
            'SELECT COUNT(*) as count FROM fines WHERE student_id_number = ? AND status = "unpaid"',
            [studentIdNumber]
        );

        const hasUnpaidFines = unpaidFines[0].count > 0;

        // Check if student has overdue books
        const [overdueBooks] = await dbConnection.execute(
            'SELECT COUNT(*) as count FROM borrowing_transactions WHERE student_id_number = ? AND status = "overdue"',
            [studentIdNumber]
        );

        const hasOverdueBooks = overdueBooks[0].count > 0;

        const canBorrow = !hasUnpaidFines && !hasOverdueBooks;
        const reasonBlocked = hasUnpaidFines ? 'Unpaid fines' : hasOverdueBooks ? 'Overdue books' : null;

        // Update or insert borrowing status
        await dbConnection.execute(
            `INSERT INTO student_borrowing_status 
             (student_id_number, can_borrow, reason_blocked) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE 
             can_borrow = VALUES(can_borrow), 
             reason_blocked = VALUES(reason_blocked), 
             updated_at = CURRENT_TIMESTAMP`,
            [studentIdNumber, canBorrow, reasonBlocked]
        );

        return { canBorrow, reasonBlocked };

    } catch (error) {
        console.error('Error checking student borrowing status:', error);
        throw error;
    }
}

// Get semester tracking for student
async function getSemesterTracking(studentIdNumber) {
    try {
        const [rows] = await db.execute(
            `SELECT 
                st.*,
                u.email
             FROM semester_tracking st
             JOIN users u ON st.student_id_number = u.id_number
             WHERE st.student_id_number = ?
             ORDER BY st.semester_start_date DESC`,
            [studentIdNumber]
        );
        return rows;
    } catch (error) {
        console.error('Error getting semester tracking:', error);
        throw error;
    }
}

// Create or update semester tracking
async function createOrUpdateSemesterTracking(studentIdNumber, semesterStartDate, semesterEndDate) {
    try {
        const settings = await getSystemSettings();
        const booksRequired = parseInt(settings.books_required_per_semester || 20);

        // Check if active semester exists
        const [existingSemester] = await db.execute(
            'SELECT id FROM semester_tracking WHERE student_id_number = ? AND status = "active"',
            [studentIdNumber]
        );

        if (existingSemester.length > 0) {
            // Update existing semester
            await db.execute(
                `UPDATE semester_tracking 
                 SET semester_start_date = ?, semester_end_date = ?, books_required = ?
                 WHERE student_id_number = ? AND status = "active"`,
                [semesterStartDate, semesterEndDate, booksRequired, studentIdNumber]
            );
        } else {
            // Create new semester
            await db.execute(
                `INSERT INTO semester_tracking 
                 (student_id_number, semester_start_date, semester_end_date, books_required) 
                 VALUES (?, ?, ?, ?)`,
                [studentIdNumber, semesterStartDate, semesterEndDate, booksRequired]
            );
        }

        return true;
    } catch (error) {
        console.error('Error creating/updating semester tracking:', error);
        throw error;
    }
}

// Update semester books count - increment when book is borrowed (accumulative)
async function updateSemesterBooksCount(studentIdNumber, incrementBy = 1) {
    try {
        // Increment the semester count by the specified amount (only when book is borrowed)
        await db.execute(
            `UPDATE semester_tracking 
             SET books_borrowed_count = books_borrowed_count + ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE student_id_number = ? AND status = "active"`,
            [incrementBy, studentIdNumber]
        );

        return true;
    } catch (error) {
        console.error('Error updating semester books count:', error);
        throw error;
    }
}

// Get all overdue books and calculate fines
async function processAllOverdueFines() {
    try {
        const [overdueTransactions] = await db.execute(
            `SELECT id FROM borrowing_transactions 
             WHERE status = 'borrowed' AND due_date < NOW()`
        );

        const results = [];
        for (const transaction of overdueTransactions) {
            try {
                const result = await createOrUpdateFine(transaction.id);
                results.push({
                    transactionId: transaction.id,
                    ...result
                });
            } catch (error) {
                console.error(`Error processing fine for transaction ${transaction.id}:`, error);
                results.push({
                    transactionId: transaction.id,
                    error: error.message
                });
            }
        }

        return results;
    } catch (error) {
        console.error('Error processing all overdue fines:', error);
        throw error;
    }
}

// Recalculate semester counts for all students (useful for existing data)
async function recalculateAllSemesterCounts() {
    try {
        // Get all active semester records
        const [semesterRows] = await db.execute(
            'SELECT student_id_number, semester_start_date FROM semester_tracking WHERE status = "active"'
        );

        let updatedCount = 0;
        for (const semester of semesterRows) {
            try {
                // Count all books borrowed during this semester (accumulative count)
                const [countRows] = await db.execute(
                    `SELECT COUNT(*) as total_borrowed 
                     FROM borrowing_transactions 
                     WHERE student_id_number = ? 
                     AND borrowed_at >= ?`,
                    [semester.student_id_number, semester.semester_start_date]
                );

                const totalBorrowed = countRows[0].total_borrowed;

                // Update the semester tracking
                await db.execute(
                    `UPDATE semester_tracking 
                     SET books_borrowed_count = ?,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE student_id_number = ? AND status = "active"`,
                    [totalBorrowed, semester.student_id_number]
                );

                updatedCount++;
            } catch (error) {
                console.error(`Error updating semester count for student ${semester.student_id_number}:`, error);
            }
        }

        return { updatedCount, totalStudents: semesterRows.length };
    } catch (error) {
        console.error('Error recalculating semester counts:', error);
        throw error;
    }
}

// Get penalty system statistics
async function getPenaltyStats() {
    try {
        const [totalFines] = await db.execute('SELECT COUNT(*) as count FROM fines');
        const [unpaidFines] = await db.execute('SELECT COUNT(*) as count FROM fines WHERE status = "unpaid"');
        const [totalFineAmount] = await db.execute('SELECT SUM(fine_amount) as total FROM fines');
        const [unpaidFineAmount] = await db.execute('SELECT SUM(fine_amount - paid_amount) as total FROM fines WHERE status = "unpaid"');
        const [overdueBooks] = await db.execute('SELECT COUNT(*) as count FROM borrowing_transactions WHERE status = "overdue"');
        const [blockedStudents] = await db.execute('SELECT COUNT(*) as count FROM student_borrowing_status WHERE can_borrow = FALSE');

        return {
            totalFines: totalFines[0].count,
            unpaidFines: unpaidFines[0].count,
            totalFineAmount: totalFineAmount[0].total || 0,
            unpaidFineAmount: unpaidFineAmount[0].total || 0,
            overdueBooks: overdueBooks[0].count,
            blockedStudents: blockedStudents[0].count
        };
    } catch (error) {
        console.error('Error getting penalty stats:', error);
        throw error;
    }
}

module.exports = {
    getSystemSettings,
    updateSystemSetting,
    calculateFine,
    createOrUpdateFine,
    getStudentFines,
    processFinePayment,
    checkAndUpdateStudentBorrowingStatus,
    getSemesterTracking,
    createOrUpdateSemesterTracking,
    updateSemesterBooksCount,
    recalculateAllSemesterCounts,
    processAllOverdueFines,
    getPenaltyStats
};
