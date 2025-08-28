const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get login logs (admin only)
router.get('/login-logs', authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.type !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const [logs] = await pool.execute(`
            SELECT 
                ll.id,
                ll.user_type,
                ll.login_time,
                ll.ip_address,
                ll.user_agent,
                u.id_number,
                u.email
            FROM login_logs ll
            LEFT JOIN users u ON ll.user_id = u.id
            ORDER BY ll.login_time DESC
            LIMIT 100
        `);

        res.json({
            message: 'Login logs retrieved successfully',
            logs
        });
    } catch (error) {
        console.error('Get login logs error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user statistics (admin only)
router.get('/user-stats', authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.type !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const [totalUsers] = await pool.execute('SELECT COUNT(*) as total FROM users');
        const [verifiedUsers] = await pool.execute('SELECT COUNT(*) as verified FROM users WHERE is_verified = TRUE');
        const [todayLogins] = await pool.execute(`
            SELECT COUNT(*) as today FROM login_logs 
            WHERE DATE(login_time) = CURDATE()
        `);

        res.json({
            message: 'User statistics retrieved successfully',
            stats: {
                totalUsers: totalUsers[0].total,
                verifiedUsers: verifiedUsers[0].verified,
                todayLogins: todayLogins[0].today
            }
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
