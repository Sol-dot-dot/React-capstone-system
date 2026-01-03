const db = require('../config/database');

// Centralized function to calculate overdue days consistently
function calculateOverdueDays(dueDate, currentDate = new Date()) {
    const due = new Date(dueDate);
    const now = new Date(currentDate);
    
    // Reset time to compare only dates (avoid timezone issues)
    due.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    // If due date is in the future or today, not overdue
    if (due >= now) {
        return 0;
    }
    
    // Calculate days overdue
    const timeDiff = now - due;
    const daysOverdue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    return Math.max(0, daysOverdue);
}

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
                bt.returned_date,
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

        if (transaction.status === 'returned') {
            return { fineAmount: 0, daysOverdue: 0 };
        }

        const daysOverdue = calculateOverdueDays(transaction.due_date);
        
        if (daysOverdue === 0) {
            return { fineAmount: 0, daysOverdue: 0 };
        }

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

// Get student's fines with real-time recalculation
async function getStudentFines(studentIdNumber, status = null, recalculate = true) {
    try {
        // If recalculate is true, update fines before fetching
        if (recalculate) {
            await recalculateStudentFines(studentIdNumber);
        }

        let query = `
            SELECT 
                f.id,
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

// Recalculate fines for a specific student
async function recalculateStudentFines(studentIdNumber) {
    try {
        // Get all unpaid fines for the student
        const [unpaidFines] = await db.execute(`
            SELECT f.id, f.transaction_id, f.fine_amount, f.days_overdue
            FROM fines f
            JOIN borrowing_transactions bt ON f.transaction_id = bt.id
            WHERE f.student_id_number = ? AND f.status = 'unpaid'
        `, [studentIdNumber]);

        for (const fine of unpaidFines) {
            try {
                // Calculate current fine amount
                const fineCalculation = await calculateFine(fine.transaction_id);
                
                if (fineCalculation.fineAmount > 0) {
                    // Update fine if amount has changed
                    if (fine.fine_amount !== fineCalculation.fineAmount || 
                        fine.days_overdue !== fineCalculation.daysOverdue) {
                        
                        await db.execute(`
                            UPDATE fines 
                            SET fine_amount = ?, 
                                days_overdue = ?, 
                                updated_at = CURRENT_TIMESTAMP
                            WHERE id = ?
                        `, [fineCalculation.fineAmount, fineCalculation.daysOverdue, fine.id]);
                    }
                }
            } catch (error) {
                console.error(`Error recalculating fine ${fine.id}:`, error);
            }
        }
    } catch (error) {
        console.error('Error recalculating student fines:', error);
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
                 SET paid_amount = ?, status = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [newPaidAmount, newStatus, fineId]
            );

            // If fine is fully paid, return the book and create return transaction
            if (newStatus === 'paid') {
                // Get transaction details
                const [transactionRows] = await connection.execute(
                    `SELECT bt.*, b.title, b.author, b.number_code
                     FROM borrowing_transactions bt
                     JOIN books b ON bt.book_id = b.id
                     WHERE bt.id = ? AND bt.status = 'overdue'`,
                    [fine.transaction_id]
                );

                if (transactionRows.length > 0) {
                    const transaction = transactionRows[0];
                    
                    // Update borrowing transaction to returned
                    await connection.execute(
                        `UPDATE borrowing_transactions 
                         SET status = 'returned', 
                             returned_date = CURDATE(),
                             returned_by_admin = ?
                         WHERE id = ?`,
                        [adminId, fine.transaction_id]
                    );

                    // Update book status to available
                    await connection.execute(
                        `UPDATE books 
                         SET status = 'available'
                         WHERE id = ?`,
                        [transaction.book_id]
                    );

                    // Create return transaction record
                    const { createReturnTransaction } = require('./borrowingUtils');
                    await createReturnTransaction(
                        fine.transaction_id, 
                        adminId, 
                        'good', 
                        'Overdue book returned after fine payment', 
                        'Fine fully paid - book returned'
                    );
                    
                    console.log('[OK] Book returned after fine payment:', transaction.title);
                }

                // Check if student can now borrow (if all fines are paid)
                await checkAndUpdateStudentBorrowingStatus(fine.student_id_number, connection);
            }

            await connection.commit();

            return {
                success: true,
                newPaidAmount,
                remainingAmount,
                status: newStatus,
                bookReturned: newStatus === 'paid'
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
             (student_id_number, can_borrow, reason, updated_by) 
             VALUES (?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE 
             can_borrow = VALUES(can_borrow), 
             reason = VALUES(reason), 
             updated_by = VALUES(updated_by),
             updated_at = CURRENT_TIMESTAMP`,
            [studentIdNumber, canBorrow, reasonBlocked, 1]
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
        const maxBooksAllowed = parseInt(settings.max_books_per_student || 5);

        // Check if active semester exists
        const [existingSemester] = await db.execute(
            'SELECT id FROM semester_tracking WHERE student_id_number = ? AND status = "active"',
            [studentIdNumber]
        );

        if (existingSemester.length > 0) {
            // Update existing semester
            await db.execute(
                `UPDATE semester_tracking 
                 SET semester_start_date = ?, semester_end_date = ?, max_books_allowed = ?
                 WHERE student_id_number = ? AND status = "active"`,
                [semesterStartDate, semesterEndDate, maxBooksAllowed, studentIdNumber]
            );
        } else {
            // Create new semester
            await db.execute(
                `INSERT INTO semester_tracking 
                 (student_id_number, semester_start_date, semester_end_date, max_books_allowed) 
                 VALUES (?, ?, ?, ?)`,
                [studentIdNumber, semesterStartDate, semesterEndDate, maxBooksAllowed]
            );
        }

        return true;
    } catch (error) {
        console.error('Error creating/updating semester tracking:', error);
        throw error;
    }
}

// Update semester books count - increment when book is borrowed (accumulative)
async function updateSemesterBooksCount(studentIdNumber, incrementBy = 1, connection = null) {
    try {
        const dbConnection = connection || db;
        
        // Increment the semester count by the specified amount (only when book is borrowed)
        await dbConnection.execute(
            `UPDATE semester_tracking 
             SET books_borrowed_count = books_borrowed_count + ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE student_id_number = ? AND status = "active"`,
            [incrementBy, studentIdNumber]
        );

        console.log(`[OK] Updated semester books count for ${studentIdNumber}: +${incrementBy}`);
        return true;
    } catch (error) {
        console.error('Error updating semester books count:', error);
        throw error;
    }
}

// Clean up duplicate fines for the same transaction
async function cleanupDuplicateFines() {
    try {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Find transactions with multiple fines
            const [duplicateFines] = await connection.execute(`
                SELECT transaction_id, COUNT(*) as count, 
                       MIN(id) as keep_id, 
                       SUM(fine_amount) as total_fine_amount,
                       MAX(days_overdue) as max_days_overdue
                FROM fines 
                WHERE status = 'unpaid'
                GROUP BY transaction_id 
                HAVING COUNT(*) > 1
            `);
            
            console.log(`[INFO] Found ${duplicateFines.length} transactions with duplicate fines`);
            
            for (const duplicate of duplicateFines) {
                // Keep the first fine record and update it with the correct total
                await connection.execute(`
                    UPDATE fines 
                    SET fine_amount = ?, days_overdue = ?
                    WHERE id = ?
                `, [duplicate.total_fine_amount, duplicate.max_days_overdue, duplicate.keep_id]);
                
                // Delete all other duplicate fines for this transaction
                await connection.execute(`
                    DELETE FROM fines 
                    WHERE transaction_id = ? AND id != ?
                `, [duplicate.transaction_id, duplicate.keep_id]);
                
                console.log(`[OK] Cleaned up ${duplicate.count - 1} duplicate fines for transaction ${duplicate.transaction_id}`);
            }
            
            await connection.commit();
            console.log(`[OK] Cleanup completed. Processed ${duplicateFines.length} transactions`);
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error cleaning up duplicate fines:', error);
        throw error;
    }
}

// Get all overdue books and calculate fines - FIXED VERSION
async function processAllOverdueFines() {
    try {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Step 0: Clean up any existing duplicate fines
            await cleanupDuplicateFines();
            
            // Step 1: Update all borrowed books that are past due to overdue status
            const [updateResult] = await connection.execute(
                `UPDATE borrowing_transactions 
                 SET status = 'overdue' 
                 WHERE status = 'borrowed' 
                 AND due_date < CURDATE()`
            );
            
            console.log(`[OK] Updated ${updateResult.affectedRows} books to overdue status`);
            
            // Step 2: Get all overdue transactions
            const [overdueTransactions] = await connection.execute(
                `SELECT bt.id, bt.student_id_number, bt.due_date
                 FROM borrowing_transactions bt
                 WHERE bt.status = 'overdue' 
                 AND bt.due_date < CURDATE()`
            );
            
            console.log(`[INFO] Found ${overdueTransactions.length} overdue transactions`);
            
            // Step 3: Get fine per day setting
            const [settings] = await connection.execute(
                `SELECT setting_value FROM system_settings WHERE setting_key = 'fine_per_day'`
            );
            const finePerDay = settings.length > 0 ? parseFloat(settings[0].setting_value) : 5;
            
            const results = [];
            let finesCreated = 0;
            
            // Step 4: Create fines for all overdue books that don't have fines
            for (const transaction of overdueTransactions) {
                try {
                    // Check if fine already exists
                    const [existingFines] = await connection.execute(
                        `SELECT id FROM fines WHERE transaction_id = ?`,
                        [transaction.id]
                    );
                    
                    const daysOverdue = calculateOverdueDays(transaction.due_date);
                    const fineAmount = daysOverdue * finePerDay;
                    
                    if (existingFines.length > 0) {
                        // Fine already exists, just update it
                        await connection.execute(
                            `UPDATE fines 
                             SET fine_amount = ?, days_overdue = ?, updated_at = CURRENT_TIMESTAMP
                             WHERE transaction_id = ?`,
                            [fineAmount, daysOverdue, transaction.id]
                        );
                        
                        results.push({
                            transactionId: transaction.id,
                            action: 'updated',
                            fineAmount,
                            daysOverdue
                        });
                    } else {
                        // Create new fine
                        
                        await connection.execute(
                            `INSERT INTO fines (
                                student_id_number, 
                                transaction_id, 
                                fine_amount, 
                                days_overdue, 
                                fine_date, 
                                status
                            ) VALUES (?, ?, ?, ?, CURDATE(), 'unpaid')`,
                            [transaction.student_id_number, transaction.id, fineAmount, daysOverdue]
                        );
                        
                        finesCreated++;
                        results.push({
                            transactionId: transaction.id,
                            action: 'created',
                            fineAmount,
                            daysOverdue
                        });
                    }
                } catch (error) {
                    console.error(`Error processing fine for transaction ${transaction.id}:`, error);
                    results.push({
                        transactionId: transaction.id,
                        error: error.message
                    });
                }
            }
            
            await connection.commit();
            
            console.log(`[OK] Created ${finesCreated} new fines for overdue books`);
            
            return {
                booksUpdatedToOverdue: updateResult.affectedRows,
                finesCreated,
                totalProcessed: results.length,
                results
            };
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
        
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
                     AND borrowed_date >= ?`,
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
    calculateOverdueDays,
    getSystemSettings,
    updateSystemSetting,
    calculateFine,
    createOrUpdateFine,
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
    getPenaltyStats
};
