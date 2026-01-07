/**
 * Notification Scheduler Service
 * Automatically sends due date reminders to users
 */

const cron = require('node-cron');
const pool = require('../config/database');
const { sendDueDateReminderEmail } = require('../utils/emailService');

const { logger } = require('../config/logger');
// Notification message templates
const templates = {
    due_soon: {
        title: 'Book Due Soon',
        body: (bookTitle, days) =>
            `"${bookTitle}" is due in ${days} day${days > 1 ? 's' : ''}. Please return it on time to avoid penalties.`
    },
    due_today: {
        title: 'Book Due Today',
        body: (bookTitle) =>
            `"${bookTitle}" is due TODAY. Please return it to avoid late fees.`
    },
    overdue: {
        title: 'Book Overdue',
        body: (bookTitle, days) =>
            `"${bookTitle}" is ${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''} overdue. Late fees are being applied.`
    }
};

/**
 * Get all books needing notifications
 */
async function getBooksNeedingNotifications() {
    try {
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
                COALESCE(np.email_enabled, 1) AS email_enabled,
                COALESCE(np.notify_overdue, 1) AS notify_overdue,
                COALESCE(np.notify_due_today, 1) AS notify_due_today,
                COALESCE(np.notify_due_soon, 1) AS notify_due_soon
            FROM borrowing_transactions bt
            JOIN users u ON bt.student_id_number = u.id_number
            JOIN books b ON bt.book_id = b.id
            LEFT JOIN notification_preferences np ON u.id = np.user_id
            WHERE bt.status IN ('borrowed', 'overdue')
                AND bt.return_date IS NULL
                AND u.is_verified = 1
                AND (
                    DATEDIFF(bt.due_date, CURDATE()) < 0
                    OR DATEDIFF(bt.due_date, CURDATE()) = 0
                    OR DATEDIFF(bt.due_date, CURDATE()) <= COALESCE(np.days_before_due, 3)
                )
            ORDER BY days_until_due ASC
        `;

        const [rows] = await pool.execute(query);
        return rows;
    } catch (error) {
        logger.error('[NotificationScheduler] Error getting books:', error.message);
        return [];
    }
}

/**
 * Check if notification was already sent today
 */
async function wasNotificationSentToday(transactionId, notificationType) {
    try {
        const [logs] = await pool.execute(`
            SELECT id FROM notification_logs
            WHERE transaction_id = ?
                AND notification_type = ?
                AND DATE(sent_at) = CURDATE()
            LIMIT 1
        `, [transactionId, notificationType]);

        return logs.length > 0;
    } catch (error) {
        // If table doesn't exist, assume not sent
        return false;
    }
}

/**
 * Log a sent notification
 */
async function logNotification(userId, transactionId, notificationType, sentVia, bookTitle, daysUntilDue) {
    try {
        await pool.execute(`
            INSERT IGNORE INTO notification_logs
                (user_id, transaction_id, notification_type, sent_via, book_title, days_until_due)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [userId, transactionId, notificationType, sentVia, bookTitle, daysUntilDue]);
    } catch (error) {
        // Silent fail - logging shouldn't break notifications
    }
}

/**
 * Send email notification for a book
 */
async function sendBookNotificationEmail(user, book, notificationType) {
    try {
        const template = templates[notificationType];
        const days = book.days_until_due;

        const reminderType = notificationType === 'overdue' ? 'overdue' :
                            notificationType === 'due_today' ? 'due_today' : '1_day_before';

        const result = await sendDueDateReminderEmail(
            user.email,
            { firstName: user.first_name, lastName: user.last_name, idNumber: user.id_number },
            [{
                title: book.book_title,
                author: book.author,
                dueDate: book.due_date,
                daysUntilDue: days
            }],
            reminderType
        );

        return result.success;
    } catch (error) {
        logger.error('[NotificationScheduler] Email error:', error.message);
        return false;
    }
}

/**
 * Main function to process and send all notifications
 */
async function sendNearOverdueNotifications() {
    logger.info('[NotificationScheduler] Starting notification check...');

    const books = await getBooksNeedingNotifications();
    logger.info(`[NotificationScheduler] Found ${books.length} books needing attention`);

    let emailsSent = 0;
    let skipped = 0;

    for (const book of books) {
        const notificationType = book.notification_type;

        // Check user preferences
        const shouldNotify =
            (notificationType === 'overdue' && book.notify_overdue) ||
            (notificationType === 'due_today' && book.notify_due_today) ||
            (notificationType === 'due_soon' && book.notify_due_soon);

        if (!shouldNotify) {
            skipped++;
            continue;
        }

        // Check if already sent today
        const alreadySent = await wasNotificationSentToday(book.transaction_id, notificationType);
        if (alreadySent) {
            skipped++;
            continue;
        }

        // Send email if enabled
        if (book.email_enabled) {
            const success = await sendBookNotificationEmail(
                {
                    email: book.email,
                    first_name: book.first_name,
                    last_name: book.last_name,
                    id_number: book.id_number
                },
                book,
                notificationType
            );

            if (success) {
                emailsSent++;
                await logNotification(
                    book.user_id,
                    book.transaction_id,
                    notificationType,
                    'email',
                    book.book_title,
                    book.days_until_due
                );
            }
        }
    }

    logger.info(`[NotificationScheduler] Complete. Emails sent: ${emailsSent}, Skipped: ${skipped}`);

    return {
        totalBooks: books.length,
        emailsSent,
        skipped
    };
}

/**
 * Initialize the scheduler
 * Runs daily at 8:00 AM
 */
function initializeScheduler() {
    // Run every day at 8:00 AM
    cron.schedule('0 8 * * *', async () => {
        logger.info('[NotificationScheduler] Running scheduled notification check...');
        await sendNearOverdueNotifications();
    });

    logger.info('[NotificationScheduler] Scheduler initialized - will run daily at 8:00 AM');
}

/**
 * Manual trigger for testing
 */
async function runManually() {
    return await sendNearOverdueNotifications();
}

module.exports = {
    initializeScheduler,
    sendNearOverdueNotifications,
    runManually,
    templates
};
