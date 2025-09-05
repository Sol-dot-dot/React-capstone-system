const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sendDueDateReminderEmail, sendBulkDueDateReminders } = require('../utils/emailService');
const pool = require('../config/database');

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
        console.error('Error sending email notification:', error);
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
        console.error('Error sending bulk notifications:', error);
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
        console.error('Error fetching due date reminders:', error);
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
        console.error('Error processing due date reminders:', error);
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
        console.error('Error fetching notification stats:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// GET /api/notifications/user/:idNumber - Get user's notification preferences (mobile app)
router.get('/user/:idNumber', async (req, res) => {
    try {
        const { idNumber } = req.params;

        // For now, return default settings
        // In a real implementation, you might store user preferences in the database
        res.json({
            success: true,
            data: {
                enabled: true,
                pushNotifications: true,
                emailNotifications: true,
                reminderTiming: {
                    oneDayBefore: true,
                    dueToday: true,
                    overdue: true
                }
            }
        });
    } catch (error) {
        console.error('Error fetching user notification preferences:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// PUT /api/notifications/user/:idNumber - Update user's notification preferences (mobile app)
router.put('/user/:idNumber', async (req, res) => {
    try {
        const { idNumber } = req.params;
        const { settings } = req.body;

        // For now, just return success
        // In a real implementation, you would store these preferences in the database
        res.json({
            success: true,
            message: 'Notification preferences updated successfully',
            data: settings
        });
    } catch (error) {
        console.error('Error updating user notification preferences:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
