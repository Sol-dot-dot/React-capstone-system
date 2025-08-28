const express = require('express');
const { body, validationResult } = require('express-validator');
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

// Get all users (admin only)
router.get('/users', authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.type !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const [users] = await pool.execute(`
            SELECT 
                id,
                id_number,
                email,
                is_verified,
                created_at,
                (SELECT COUNT(*) FROM login_logs WHERE user_id = users.id) as login_count
            FROM users 
            ORDER BY created_at DESC
        `);

        res.json({
            message: 'Users retrieved successfully',
            users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user details (admin only)
router.get('/users/:idNumber', authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.type !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { idNumber } = req.params;

        const [users] = await pool.execute(`
            SELECT 
                id,
                id_number,
                email,
                is_verified,
                created_at
            FROM users 
            WHERE id_number = ?
        `, [idNumber]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        // Get user's login history
        const [loginHistory] = await pool.execute(`
            SELECT 
                login_time,
                ip_address,
                user_agent
            FROM login_logs 
            WHERE user_id = ?
            ORDER BY login_time DESC
            LIMIT 10
        `, [user.id]);

        res.json({
            message: 'User details retrieved successfully',
            user: {
                ...user,
                loginHistory
            }
        });
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user verification status (admin only)
router.put('/users/:idNumber/verify', authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.type !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { idNumber } = req.params;
        const { isVerified } = req.body;

        const [users] = await pool.execute(
            'SELECT * FROM users WHERE id_number = ?',
            [idNumber]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        await pool.execute(
            'UPDATE users SET is_verified = ? WHERE id_number = ?',
            [isVerified, idNumber]
        );

        res.json({
            message: `User verification status updated to ${isVerified ? 'verified' : 'unverified'}`
        });
    } catch (error) {
        console.error('Update user verification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete user (admin only)
router.delete('/users/:idNumber', authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.type !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { idNumber } = req.params;

        const [users] = await pool.execute(
            'SELECT * FROM users WHERE id_number = ?',
            [idNumber]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete user's login logs first
        await pool.execute(
            'DELETE FROM login_logs WHERE user_id = ?',
            [users[0].id]
        );

        // Delete user
        await pool.execute(
            'DELETE FROM users WHERE id_number = ?',
            [idNumber]
        );

        res.json({
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get system activity logs (admin only)
router.get('/activity-logs', authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.type !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const [logs] = await pool.execute(`
            SELECT 
                'login' as activity_type,
                login_time as timestamp,
                ip_address,
                user_agent,
                u.id_number,
                u.email
            FROM login_logs ll
            LEFT JOIN users u ON ll.user_id = u.id
            UNION ALL
            SELECT 
                'registration' as activity_type,
                created_at as timestamp,
                NULL as ip_address,
                NULL as user_agent,
                id_number,
                email
            FROM users
            ORDER BY timestamp DESC
            LIMIT 200
        `);

        res.json({
            message: 'Activity logs retrieved successfully',
            logs
        });
    } catch (error) {
        console.error('Get activity logs error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get dashboard statistics (admin only)
router.get('/dashboard-stats', authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.type !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        // Total users
        const [totalUsers] = await pool.execute('SELECT COUNT(*) as total FROM users');
        
        // Verified users
        const [verifiedUsers] = await pool.execute('SELECT COUNT(*) as verified FROM users WHERE is_verified = TRUE');
        
        // Today's logins
        const [todayLogins] = await pool.execute(`
            SELECT COUNT(*) as today FROM login_logs 
            WHERE DATE(login_time) = CURDATE()
        `);
        
        // This week's registrations
        const [weekRegistrations] = await pool.execute(`
            SELECT COUNT(*) as week FROM users 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `);
        
        // Recent activity (last 24 hours)
        const [recentActivity] = await pool.execute(`
            SELECT COUNT(*) as recent FROM login_logs 
            WHERE login_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        `);

        res.json({
            message: 'Dashboard statistics retrieved successfully',
            stats: {
                totalUsers: totalUsers[0].total,
                verifiedUsers: verifiedUsers[0].verified,
                todayLogins: todayLogins[0].today,
                weekRegistrations: weekRegistrations[0].week,
                recentActivity: recentActivity[0].recent
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
