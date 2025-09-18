const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sendDueDateReminderEmail, sendBulkDueDateReminders } = require('../utils/emailService');
const pool = require('../config/database');

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
        console.error('Error generating notifications:', error);
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

// GET /api/notifications - Get real-time notifications from existing data
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.role === 'admin' ? null : req.user.id;
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
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications'
        });
    }
});

// GET /api/notifications/count - Get notification count
router.get('/count', auth, async (req, res) => {
    try {
        const userId = req.user.role === 'admin' ? null : req.user.id;
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
        console.error('Error fetching notification count:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notification count'
        });
    }
});

// GET /api/notifications/overdue - Get overdue books details
router.get('/overdue', auth, async (req, res) => {
    try {
        const userId = req.user.role === 'admin' ? null : req.user.id;
        
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
            LEFT JOIN fines f ON bt.id = f.transaction_id AND f.status = 'unpaid'
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
        console.error('Error fetching overdue books:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching overdue books'
        });
    }
});

// GET /api/notifications/fines - Get unpaid fines details
router.get('/fines', auth, async (req, res) => {
    try {
        const userId = req.user.role === 'admin' ? null : req.user.id;
        
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
        console.error('Error fetching unpaid fines:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching unpaid fines'
        });
    }
});

module.exports = router;
