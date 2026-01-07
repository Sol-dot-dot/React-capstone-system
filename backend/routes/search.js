const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../config/database');

const { logger } = require('../config/logger');
// GET /api/search - Global search across books, users, and activities
router.get('/', auth, async (req, res) => {
    try {
        const { q: query, type, limit = 10 } = req.query;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters long'
            });
        }

        const searchTerm = `%${query.trim()}%`;
        const searchLimit = Math.min(parseInt(limit), 50); // Max 50 results per type

        const results = {
            books: [],
            users: [],
            activities: [],
            total: 0
        };

        // Search Books
        if (!type || type === 'books') {
            const [books] = await pool.execute(`
                SELECT
                    b.id,
                    b.title,
                    b.author,
                    b.number_code,
                    b.category,
                    b.status,
                    b.pages,
                    b.book_copies,
                    b.created_at,
                    'book' as type
                FROM books b
                WHERE
                    b.title LIKE ? OR
                    b.author LIKE ? OR
                    b.number_code LIKE ? OR
                    b.category LIKE ?
                ORDER BY
                    CASE
                        WHEN b.title LIKE ? THEN 1
                        WHEN b.author LIKE ? THEN 2
                        WHEN b.number_code LIKE ? THEN 3
                        ELSE 4
                    END,
                    b.title ASC
                LIMIT ?
            `, [
                searchTerm, searchTerm, searchTerm, searchTerm,
                `%${query.trim()}%`, `%${query.trim()}%`, `%${query.trim()}%`,
                searchLimit
            ]);

            results.books = books.map(book => ({
                ...book,
                status: book.status,
                statusText: getBookStatusText(book.status)
            }));
        }

        // Search Users
        if (!type || type === 'users') {
            const [users] = await pool.execute(`
                SELECT
                    u.id,
                    u.id_number,
                    u.username,
                    u.email,
                    u.role,
                    u.is_verified,
                    u.created_at,
                    'user' as type,
                    (SELECT COUNT(*) FROM borrowing_transactions
                     WHERE student_id_number = u.id_number
                     AND status IN ('borrowed', 'overdue')) as currently_borrowed
                FROM users u
                WHERE
                    u.id_number LIKE ? OR
                    u.username LIKE ? OR
                    u.email LIKE ?
                ORDER BY
                    CASE
                        WHEN u.id_number LIKE ? THEN 1
                        WHEN u.username LIKE ? THEN 2
                        WHEN u.email LIKE ? THEN 3
                        ELSE 4
                    END,
                    u.username ASC
                LIMIT ?
            `, [
                searchTerm, searchTerm, searchTerm,
                `%${query.trim()}%`, `%${query.trim()}%`, `%${query.trim()}%`,
                searchLimit
            ]);

            results.users = users.map(user => ({
                ...user,
                roleText: getRoleText(user.role),
                statusText: user.is_verified ? 'Verified' : 'Unverified'
            }));
        }

        // Search Activities (Borrowing Transactions)
        if (!type || type === 'activities') {
            const [activities] = await pool.execute(`
                SELECT
                    bt.id,
                    bt.student_id_number,
                    bt.borrowed_date,
                    bt.due_date,
                    bt.returned_date,
                    bt.status,
                    b.title as book_title,
                    b.author as book_author,
                    b.number_code as book_code,
                    u.username as student_name,
                    u.email as student_email,
                    'activity' as type
                FROM borrowing_transactions bt
                JOIN books b ON bt.book_id = b.id
                JOIN users u ON bt.student_id_number = u.id_number
                WHERE
                    bt.student_id_number LIKE ? OR
                    b.title LIKE ? OR
                    b.author LIKE ? OR
                    b.number_code LIKE ? OR
                    u.username LIKE ? OR
                    u.email LIKE ?
                ORDER BY bt.borrowed_date DESC
                LIMIT ?
            `, [
                searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,
                searchLimit
            ]);

            results.activities = activities.map(activity => ({
                ...activity,
                statusText: getActivityStatusText(activity.status),
                daysOverdue: activity.status === 'overdue' ?
                    Math.max(0, Math.floor((new Date() - new Date(activity.due_date)) / (1000 * 60 * 60 * 24))) : 0
            }));
        }

        // Calculate total results
        results.total = results.books.length + results.users.length + results.activities.length;

        res.json({
            success: true,
            data: results,
            query: query.trim(),
            total: results.total
        });

    } catch (error) {
        logger.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Search failed'
        });
    }
});

// Helper functions
function getBookStatusText(status) {
    switch (status) {
        case 'available': return 'Available';
        case 'borrowed': return 'Borrowed';
        case 'overdue': return 'Overdue';
        case 'maintenance': return 'Under Maintenance';
        default: return 'Unknown';
    }
}

function getRoleText(role) {
    switch (role) {
        case 'admin': return 'Administrator';
        case 'student': return 'Student';
        default: return 'User';
    }
}

function getActivityStatusText(status) {
    switch (status) {
        case 'borrowed': return 'Currently Borrowed';
        case 'overdue': return 'Overdue';
        case 'returned': return 'Returned';
        default: return 'Unknown';
    }
}

module.exports = router;
