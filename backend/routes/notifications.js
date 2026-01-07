const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sendDueDateReminderEmail, sendBulkDueDateReminders } = require('../utils/emailService');
const pool = require('../config/database');

const { logger } = require('../config/logger');
// Helper function to format time ago
const getTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

// Generate notifications from existing data
const generateNotifications = async (userId = null) => {
    const notifications = [];

    try {
        // 1. Overdue books notifications
        const overdueQuery = `
            SELECT
                bt.id as transaction_id,
                bt.student_id_number,
                u.first_name,
                u.last_name,
                b.title,
                b.author,
                bt.due_date,
                DATEDIFF(CURDATE(), bt.due_date) as days_overdue
            FROM borrowing_transactions bt
            JOIN users u ON bt.student_id_number = u.id_number
            JOIN books b ON bt.book_id = b.id
            WHERE bt.status = 'overdue'
            AND bt.due_date < CURDATE()
            ${userId ? 'AND u.id = ?' : ''}
            ORDER BY bt.due_date ASC
            LIMIT 10
        `;

        const overdueParams = userId ? [userId] : [];
        const [overdueBooks] = await pool.execute(overdueQuery, overdueParams);

        if (overdueBooks.length > 0) {
            notifications.push({
                id: 'overdue_books',
                title: 'Overdue Books',
                message: `${overdueBooks.length} book(s) are overdue and need attention`,
                type: 'warning',
                unread: true,
                time: getTimeAgo(overdueBooks[0].due_date),
                data: overdueBooks
            });
        }

        // 2. Books due today notifications
        const dueTodayQuery = `
            SELECT
                bt.id as transaction_id,
                bt.student_id_number,
                u.first_name,
                u.last_name,
                b.title,
                b.author,
                bt.due_date
            FROM borrowing_transactions bt
            JOIN users u ON bt.student_id_number = u.id_number
            JOIN books b ON bt.book_id = b.id
            WHERE bt.status = 'borrowed'
            AND bt.due_date = CURDATE()
            ${userId ? 'AND u.id = ?' : ''}
            ORDER BY bt.due_date ASC
            LIMIT 10
        `;

        const [dueTodayBooks] = await pool.execute(dueTodayQuery, overdueParams);

        if (dueTodayBooks.length > 0) {
            notifications.push({
                id: 'due_today',
                title: 'Books Due Today',
                message: `${dueTodayBooks.length} book(s) are due today`,
                type: 'info',
                unread: true,
                time: 'Today',
                data: dueTodayBooks
            });
        }

        // 3. Unpaid fines notifications
        const unpaidFinesQuery = `
            SELECT
                f.id as fine_id,
                f.student_id_number,
                u.first_name,
                u.last_name,
                f.fine_amount,
                f.paid_amount,
                (f.fine_amount - f.paid_amount) as unpaid_amount,
                f.fine_date
            FROM fines f
            JOIN users u ON f.student_id_number = u.id_number
            WHERE f.status = 'unpaid'
            ${userId ? 'AND u.id = ?' : ''}
            ORDER BY f.fine_date DESC
            LIMIT 10
        `;

        const [unpaidFines] = await pool.execute(unpaidFinesQuery, overdueParams);

        if (unpaidFines.length > 0) {
            const totalUnpaid = unpaidFines.reduce((sum, fine) => sum + parseFloat(fine.unpaid_amount), 0);
            notifications.push({
                id: 'unpaid_fines',
                title: 'Unpaid Fines',
                message: `$${totalUnpaid.toFixed(2)} in unpaid fines from ${unpaidFines.length} transaction(s)`,
                type: 'error',
                unread: true,
                time: getTimeAgo(unpaidFines[0].fine_date),
                data: unpaidFines
            });
        }

        // 4. Recent user registrations (for admins only)
        if (!userId) {
            const recentUsersQuery = `
                SELECT
                    u.id,
                    u.id_number,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.created_at
                FROM users u
                WHERE u.role = 'student'
                AND u.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAYS)
                ORDER BY u.created_at DESC
                LIMIT 5
            `;

            const [recentUsers] = await pool.execute(recentUsersQuery);

            if (recentUsers.length > 0) {
                notifications.push({
                    id: 'new_registrations',
                    title: 'New User Registrations',
                    message: `${recentUsers.length} new user(s) registered this week`,
                    type: 'success',
                    unread: true,
                    time: getTimeAgo(recentUsers[0].created_at),
                    data: recentUsers
                });
            }
        }

        // 5. Books due soon (within 3 days)
        const dueSoonQuery = `
            SELECT
                bt.id as transaction_id,
                bt.student_id_number,
                u.first_name,
                u.last_name,
                b.title,
                b.author,
                bt.due_date,
                DATEDIFF(bt.due_date, CURDATE()) as days_until_due
            FROM borrowing_transactions bt
            JOIN users u ON bt.student_id_number = u.id_number
            JOIN books b ON bt.book_id = b.id
            WHERE bt.status = 'borrowed'
            AND bt.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY)
            ${userId ? 'AND u.id = ?' : ''}
            ORDER BY bt.due_date ASC
            LIMIT 10
        `;

        const [dueSoonBooks] = await pool.execute(dueSoonQuery, overdueParams);

        if (dueSoonBooks.length > 0) {
            notifications.push({
                id: 'due_soon',
                title: 'Books Due Soon',
                message: `${dueSoonBooks.length} book(s) are due within 3 days`,
                type: 'info',
                unread: true,
                time: 'Upcoming',
                data: dueSoonBooks
            });
        }

        return notifications;
    } catch (error) {
        logger.error('Error generating notifications:', error);
        return [];
    }
};

// POST /api/notifications/send-email - Send email notification (mobile app)
router.post('/send-email', async (req, res) => {
    try {
        const { email, userData, books, reminderType } = req.body;

        if (!email || !userData || !books || !reminderType) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: email, userData, books, reminderType'
            });
        }

        const result = await sendDueDateReminderEmail(email, userData, books, reminderType);

        if (result.success) {
            res.json({
                success: true,
                message: 'Email notification sent successfully',
                messageId: result.messageId
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send email notification',
                error: result.error
            });
        }
    } catch (error) {
        logger.error('Error sending email notification:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// POST /api/notifications/send-bulk - Send bulk email notifications (admin)
router.post('/send-bulk', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { notifications } = req.body;

        if (!notifications || !Array.isArray(notifications)) {
            return res.status(400).json({
                success: false,
                message: 'Notifications array is required'
            });
        }

        const results = await sendBulkDueDateReminders(notifications);

        res.json({
            success: true,
            message: `Bulk notifications processed. ${results.length} notifications sent.`,
            results: results
        });
    } catch (error) {
        logger.error('Error sending bulk notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// GET /api/notifications/due-date-reminders - Get users who need due date reminders (admin)
router.get('/due-date-reminders', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { reminderType } = req.query; // '1_day_before', 'due_today', 'overdue'

        let whereClause = '';
        let params = [];

        // Calculate dates for different reminder types
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        switch (reminderType) {
            case '1_day_before':
                whereClause = 'DATE(bt.due_date) = DATE(?)';
                params.push(tomorrow);
                break;
            case 'due_today':
                whereClause = 'DATE(bt.due_date) = DATE(?)';
                params.push(today);
                break;
            case 'overdue':
                whereClause = 'DATE(bt.due_date) < DATE(?) AND bt.return_date IS NULL';
                params.push(today);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid reminder type. Use: 1_day_before, due_today, or overdue'
                });
        }

        const query = `
            SELECT DISTINCT
                u.id_number,
                u.email,
                u.id as user_id,
                bt.id as transaction_id,
                b.title,
                b.author,
                bt.due_date,
                DATEDIFF(bt.due_date, CURDATE()) as days_until_due
            FROM borrowing_transactions bt
            JOIN users u ON bt.student_id_number = u.id_number
            JOIN books b ON bt.book_id = b.id
            WHERE ${whereClause}
            AND u.is_verified = 1
            ORDER BY u.id_number, bt.due_date
        `;

        const [rows] = await pool.execute(query, params);

        // Group by user
        const userNotifications = {};
        rows.forEach(row => {
            const userId = row.id_number;
            if (!userNotifications[userId]) {
                userNotifications[userId] = {
                    userData: {
                        idNumber: row.id_number,
                        email: row.email,
                        userId: row.user_id
                    },
                    books: []
                };
            }

            userNotifications[userId].books.push({
                title: row.title,
                author: row.author,
                dueDate: row.due_date,
                daysUntilDue: row.days_until_due,
                transactionId: row.transaction_id
            });
        });

        // Convert to array format
        const notifications = Object.values(userNotifications).map(notification => ({
            ...notification,
            reminderType: reminderType
        }));

        res.json({
            success: true,
            data: {
                reminderType: reminderType,
                totalUsers: notifications.length,
                notifications: notifications
            }
        });
    } catch (error) {
        logger.error('Error fetching due date reminders:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// POST /api/notifications/process-due-date-reminders - Process and send due date reminders (admin)
router.post('/process-due-date-reminders', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { reminderType } = req.body;

        if (!reminderType) {
            return res.status(400).json({
                success: false,
                message: 'Reminder type is required'
            });
        }

        // Get users who need reminders
        const remindersResponse = await fetch(`http://localhost:5000/api/notifications/due-date-reminders?reminderType=${reminderType}`, {
            headers: {
                'Authorization': req.headers.authorization
            }
        });

        if (!remindersResponse.ok) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch reminder data'
            });
        }

        const remindersData = await remindersResponse.json();
        const notifications = remindersData.data.notifications;

        if (notifications.length === 0) {
            return res.json({
                success: true,
                message: `No users need ${reminderType} reminders at this time`,
                results: []
            });
        }

        // Send bulk email notifications
        const results = await sendBulkDueDateReminders(notifications);

        res.json({
            success: true,
            message: `Processed ${reminderType} reminders for ${notifications.length} users`,
            data: {
                reminderType: reminderType,
                totalUsers: notifications.length,
                results: results
            }
        });
    } catch (error) {
        logger.error('Error processing due date reminders:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// GET /api/notifications/stats - Get notification statistics (admin)
router.get('/stats', auth, async (req, res) => {
    try {
        if (req.user.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get counts for different reminder types
        const [overdueCount] = await pool.execute(`
            SELECT COUNT(DISTINCT bt.student_id_number) as count
            FROM borrowing_transactions bt
            JOIN users u ON bt.student_id_number = u.id_number
            WHERE DATE(bt.due_date) < DATE(?) AND bt.return_date IS NULL AND u.is_verified = 1
        `, [today]);

        const [dueTodayCount] = await pool.execute(`
            SELECT COUNT(DISTINCT bt.student_id_number) as count
            FROM borrowing_transactions bt
            JOIN users u ON bt.student_id_number = u.id_number
            WHERE DATE(bt.due_date) = DATE(?) AND bt.return_date IS NULL AND u.is_verified = 1
        `, [today]);

        const [dueTomorrowCount] = await pool.execute(`
            SELECT COUNT(DISTINCT bt.student_id_number) as count
            FROM borrowing_transactions bt
            JOIN users u ON bt.student_id_number = u.id_number
            WHERE DATE(bt.due_date) = DATE(?) AND bt.return_date IS NULL AND u.is_verified = 1
        `, [tomorrow]);

        res.json({
            success: true,
            data: {
                overdue: overdueCount[0].count,
                dueToday: dueTodayCount[0].count,
                dueTomorrow: dueTomorrowCount[0].count,
                total: overdueCount[0].count + dueTodayCount[0].count + dueTomorrowCount[0].count
            }
        });
    } catch (error) {
        logger.error('Error fetching notification stats:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// GET /api/notifications/settings/:idNumber - Get user's notification preferences (mobile app)
router.get('/settings/:idNumber', async (req, res) => {
    try {
        const { idNumber } = req.params;

        // Get user ID from id_number
        const [users] = await pool.execute(
            'SELECT id FROM users WHERE id_number = ?',
            [idNumber]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const userId = users[0].id;

        // Get preferences from database
        const [prefs] = await pool.execute(
            'SELECT * FROM notification_preferences WHERE user_id = ?',
            [userId]
        );

        if (prefs.length === 0) {
            // Return default settings if no preferences saved
            return res.json({
                success: true,
                data: {
                    enabled: true,
                    pushNotifications: true,
                    emailNotifications: true,
                    daysBefore: 3,
                    reminderTiming: {
                        oneDayBefore: true,
                        dueToday: true,
                        overdue: true
                    }
                }
            });
        }

        const pref = prefs[0];
        res.json({
            success: true,
            data: {
                enabled: Boolean(pref.notifications_enabled),
                pushNotifications: Boolean(pref.push_enabled),
                emailNotifications: Boolean(pref.email_enabled),
                daysBefore: pref.days_before_due || 3,
                reminderTiming: {
                    oneDayBefore: Boolean(pref.notify_due_soon),
                    dueToday: Boolean(pref.notify_due_today),
                    overdue: Boolean(pref.notify_overdue)
                }
            }
        });
    } catch (error) {
        // Table might not exist yet - return defaults
        res.json({
            success: true,
            data: {
                enabled: true,
                pushNotifications: true,
                emailNotifications: true,
                daysBefore: 3,
                reminderTiming: {
                    oneDayBefore: true,
                    dueToday: true,
                    overdue: true
                }
            }
        });
    }
});

// PUT /api/notifications/settings/:idNumber - Update user's notification preferences (mobile app)
router.put('/settings/:idNumber', async (req, res) => {
    try {
        const { idNumber } = req.params;
        const { settings } = req.body;

        // Get user ID from id_number
        const [users] = await pool.execute(
            'SELECT id FROM users WHERE id_number = ?',
            [idNumber]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const userId = users[0].id;

        // Upsert preferences
        await pool.execute(`
            INSERT INTO notification_preferences
                (user_id, notifications_enabled, push_enabled, email_enabled, days_before_due, notify_overdue, notify_due_today, notify_due_soon)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                notifications_enabled = VALUES(notifications_enabled),
                push_enabled = VALUES(push_enabled),
                email_enabled = VALUES(email_enabled),
                days_before_due = VALUES(days_before_due),
                notify_overdue = VALUES(notify_overdue),
                notify_due_today = VALUES(notify_due_today),
                notify_due_soon = VALUES(notify_due_soon),
                updated_at = CURRENT_TIMESTAMP
        `, [
            userId,
            settings.enabled !== false ? 1 : 0,
            settings.pushNotifications ? 1 : 0,
            settings.emailNotifications ? 1 : 0,
            settings.daysBefore || 3,
            settings.reminderTiming?.overdue ? 1 : 0,
            settings.reminderTiming?.dueToday ? 1 : 0,
            settings.reminderTiming?.oneDayBefore ? 1 : 0
        ]);

        res.json({
            success: true,
            message: 'Notification preferences updated successfully',
            data: settings
        });
    } catch (error) {
        // If table doesn't exist, just return success (settings stored locally)
        res.json({
            success: true,
            message: 'Notification preferences saved locally',
            data: req.body.settings
        });
    }
});

// GET /api/notifications/near-overdue - Get books needing notifications (for scheduler)
router.get('/near-overdue', async (req, res) => {
    try {
        // Get books that need notifications based on user preferences
        const query = `
            SELECT
                bt.id AS transaction_id,
                u.id AS user_id,
                u.id_number,
                u.email,
                u.first_name,
                u.last_name,
                b.id AS book_id,
                b.title AS book_title,
                b.author,
                bt.due_date,
                DATEDIFF(bt.due_date, CURDATE()) AS days_until_due,
                CASE
                    WHEN DATEDIFF(bt.due_date, CURDATE()) < 0 THEN 'overdue'
                    WHEN DATEDIFF(bt.due_date, CURDATE()) = 0 THEN 'due_today'
                    ELSE 'due_soon'
                END AS notification_type,
                COALESCE(np.days_before_due, 3) AS reminder_days,
                COALESCE(np.push_enabled, 1) AS push_enabled,
                COALESCE(np.email_enabled, 1) AS email_enabled
            FROM borrowing_transactions bt
            JOIN users u ON bt.student_id_number = u.id_number
            JOIN books b ON bt.book_id = b.id
            LEFT JOIN notification_preferences np ON u.id = np.user_id
            WHERE bt.status IN ('borrowed', 'overdue')
                AND bt.return_date IS NULL
                AND u.is_verified = 1
                AND (
                    DATEDIFF(bt.due_date, CURDATE()) < 0  -- overdue
                    OR DATEDIFF(bt.due_date, CURDATE()) = 0  -- due today
                    OR DATEDIFF(bt.due_date, CURDATE()) <= COALESCE(np.days_before_due, 3)  -- due soon
                )
            ORDER BY days_until_due ASC, u.id_number
        `;

        const [rows] = await pool.execute(query);

        // Group by user
        const userNotifications = {};
        rows.forEach(row => {
            const key = row.id_number;
            if (!userNotifications[key]) {
                userNotifications[key] = {
                    userId: row.user_id,
                    idNumber: row.id_number,
                    email: row.email,
                    firstName: row.first_name,
                    lastName: row.last_name,
                    pushEnabled: Boolean(row.push_enabled),
                    emailEnabled: Boolean(row.email_enabled),
                    books: []
                };
            }
            userNotifications[key].books.push({
                transactionId: row.transaction_id,
                bookId: row.book_id,
                title: row.book_title,
                author: row.author,
                dueDate: row.due_date,
                daysUntilDue: row.days_until_due,
                notificationType: row.notification_type
            });
        });

        res.json({
            success: true,
            data: {
                users: Object.values(userNotifications),
                totalUsers: Object.keys(userNotifications).length,
                totalBooks: rows.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching near-overdue books'
        });
    }
});

// POST /api/notifications/log - Log a sent notification
router.post('/log', async (req, res) => {
    try {
        const { userId, transactionId, notificationType, sentVia, bookTitle, daysUntilDue } = req.body;

        await pool.execute(`
            INSERT IGNORE INTO notification_logs
                (user_id, transaction_id, notification_type, sent_via, book_title, days_until_due)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [userId, transactionId, notificationType, sentVia, bookTitle, daysUntilDue]);

        res.json({
            success: true,
            message: 'Notification logged'
        });
    } catch (error) {
        // Silent fail - logging shouldn't break notifications
        res.json({ success: true });
    }
});

// GET /api/notifications/check-sent - Check if notification was already sent today
router.get('/check-sent/:transactionId/:type', async (req, res) => {
    try {
        const { transactionId, type } = req.params;

        const [logs] = await pool.execute(`
            SELECT id FROM notification_logs
            WHERE transaction_id = ?
                AND notification_type = ?
                AND DATE(sent_at) = CURDATE()
            LIMIT 1
        `, [transactionId, type]);

        res.json({
            success: true,
            alreadySent: logs.length > 0
        });
    } catch (error) {
        res.json({ success: true, alreadySent: false });
    }
});

// GET /api/notifications - Get real-time notifications from existing data
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.type === 'admin' ? null : req.user.id;
        const notifications = await generateNotifications(userId);

        res.json({
            success: true,
            data: {
                notifications: notifications,
                total: notifications.length,
                unread: notifications.filter(n => n.unread).length
            }
        });
    } catch (error) {
        logger.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications'
        });
    }
});

// GET /api/notifications/count - Get notification count
router.get('/count', auth, async (req, res) => {
    try {
        const userId = req.user.type === 'admin' ? null : req.user.id;
        const notifications = await generateNotifications(userId);
        const unreadCount = notifications.filter(n => n.unread).length;

        res.json({
            success: true,
            data: {
                total: notifications.length,
                unread: unreadCount
            }
        });
    } catch (error) {
        logger.error('Error fetching notification count:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notification count'
        });
    }
});

// GET /api/notifications/overdue - Get overdue books details
router.get('/overdue', auth, async (req, res) => {
    try {
        const userId = req.user.type === 'admin' ? null : req.user.id;

        const overdueQuery = `
            SELECT
                bt.id as transaction_id,
                bt.student_id_number,
                u.first_name,
                u.last_name,
                u.email,
                b.title,
                b.author,
                b.number_code,
                bt.due_date,
                DATEDIFF(CURDATE(), bt.due_date) as days_overdue,
                f.fine_amount,
                f.paid_amount,
                (f.fine_amount - f.paid_amount) as unpaid_amount
            FROM borrowing_transactions bt
            JOIN users u ON bt.student_id_number = u.id_number
            JOIN books b ON bt.book_id = b.id
            LEFT JOIN (
                SELECT
                    transaction_id,
                    fine_amount,
                    paid_amount,
                    ROW_NUMBER() OVER (PARTITION BY transaction_id ORDER BY id DESC) as rn
                FROM fines
                WHERE status = 'unpaid'
            ) f ON bt.id = f.transaction_id AND f.rn = 1
            WHERE bt.status = 'overdue'
            AND bt.due_date < CURDATE()
            ${userId ? 'AND u.id = ?' : ''}
            ORDER BY bt.due_date ASC
        `;

        const overdueParams = userId ? [userId] : [];
        const [overdueBooks] = await pool.execute(overdueQuery, overdueParams);

        res.json({
            success: true,
            data: {
                overdueBooks: overdueBooks,
                total: overdueBooks.length
            }
        });
    } catch (error) {
        logger.error('Error fetching overdue books:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching overdue books'
        });
    }
});

// GET /api/notifications/fines - Get unpaid fines details
router.get('/fines', auth, async (req, res) => {
    try {
        const userId = req.user.type === 'admin' ? null : req.user.id;

        const finesQuery = `
            SELECT
                f.id as fine_id,
                f.student_id_number,
                u.first_name,
                u.last_name,
                u.email,
                f.fine_amount,
                f.paid_amount,
                (f.fine_amount - f.paid_amount) as unpaid_amount,
                f.fine_date,
                f.days_overdue,
                b.title,
                b.author
            FROM fines f
            JOIN users u ON f.student_id_number = u.id_number
            LEFT JOIN borrowing_transactions bt ON f.transaction_id = bt.id
            LEFT JOIN books b ON bt.book_id = b.id
            WHERE f.status = 'unpaid'
            ${userId ? 'AND u.id = ?' : ''}
            ORDER BY f.fine_date DESC
        `;

        const finesParams = userId ? [userId] : [];
        const [unpaidFines] = await pool.execute(finesQuery, finesParams);

        const totalUnpaid = unpaidFines.reduce((sum, fine) => sum + parseFloat(fine.unpaid_amount), 0);

        res.json({
            success: true,
            data: {
                unpaidFines: unpaidFines,
                total: unpaidFines.length,
                totalAmount: totalUnpaid
            }
        });
    } catch (error) {
        logger.error('Error fetching unpaid fines:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching unpaid fines'
        });
    }
});

// POST /api/notifications/test-email - Send a test email to verify email service works
router.post('/test-email', async (req, res) => {
    try {
        const { email, firstName, idNumber } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required'
            });
        }

        const nodemailer = require('nodemailer');

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'SMC Library - Test Email Notification',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #28a745; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">Test Email Successful!</h1>
                    </div>

                    <div style="background-color: white; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
                        <p>Hello <strong>${firstName || idNumber || 'Student'}</strong>,</p>

                        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; margin: 20px 0;">
                            <h3 style="color: #155724; margin: 0 0 10px 0;">Email notifications are working!</h3>
                            <p style="color: #155724; margin: 0;">You will receive email reminders when your borrowed books are due.</p>
                        </div>

                        <h3 style="color: #333; margin: 20px 0 10px 0;">Email Notification Types:</h3>
                        <ul style="color: #666;">
                            <li><strong>Due Soon</strong> - Reminder before your book is due</li>
                            <li><strong>Due Today</strong> - Alert when your book is due today</li>
                            <li><strong>Overdue</strong> - Notice when your book is overdue</li>
                        </ul>

                        <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 5px; padding: 15px; margin: 20px 0;">
                            <p style="color: #0c5460; margin: 0;">
                                <strong>Tip:</strong> You can customize your notification preferences in the app settings.
                            </p>
                        </div>

                        <hr style="margin: 20px 0;">
                        <p style="color: #666; font-size: 12px; text-align: center;">
                            This is a test message from SMC Library Management System.<br>
                            Sent at: ${new Date().toLocaleString()}
                        </p>
                    </div>
                </div>
            `,
            text: `Test Email Successful!\n\nHello ${firstName || idNumber || 'Student'},\n\nEmail notifications are working! You will receive email reminders when your borrowed books are due.\n\nThis is a test message from SMC Library Management System.\nSent at: ${new Date().toLocaleString()}`
        };

        const result = await transporter.sendMail(mailOptions);
        logger.info('Test email sent successfully:', result.messageId);

        res.json({
            success: true,
            message: 'Test email sent successfully! Check your inbox.',
            messageId: result.messageId
        });
    } catch (error) {
        logger.error('Test email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send test email: ' + error.message
        });
    }
});

module.exports = router;
