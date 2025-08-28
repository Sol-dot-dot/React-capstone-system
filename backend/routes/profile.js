const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const router = express.Router();
const pool = require('../config/database');

// Get user profile
router.get('/user/profile/:idNumber', async (req, res) => {
    try {
        const { idNumber } = req.params;

        const [users] = await pool.execute(
            'SELECT id, id_number, email, is_verified, created_at FROM users WHERE id_number = ?',
            [idNumber]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];
        res.json({
            success: true,
            user: {
                id: user.id,
                idNumber: user.id_number,
                email: user.email,
                isVerified: user.is_verified,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/user/profile/:idNumber', [
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('email').optional().matches(/@my\.smciligan\.edu\.ph$/).withMessage('Email must be from @my.smciligan.edu.ph domain')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: errors.array() 
            });
        }

        const { idNumber } = req.params;
        const { email } = req.body;

        // Check if user exists
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE id_number = ?',
            [idNumber]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is already taken by another user
        if (email && email !== users[0].email) {
            const [existingUsers] = await pool.execute(
                'SELECT * FROM users WHERE email = ? AND id_number != ?',
                [email, idNumber]
            );

            if (existingUsers.length > 0) {
                return res.status(400).json({ message: 'Email is already in use' });
            }
        }

        // Update user profile
        if (email) {
            await pool.execute(
                'UPDATE users SET email = ? WHERE id_number = ?',
                [email, idNumber]
            );
        }

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Change password
router.put('/user/change-password/:idNumber', [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: errors.array() 
            });
        }

        const { idNumber } = req.params;
        const { currentPassword, newPassword } = req.body;

        // Get user
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE id_number = ?',
            [idNumber]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await pool.execute(
            'UPDATE users SET password = ? WHERE id_number = ?',
            [hashedPassword, idNumber]
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete account
router.delete('/user/profile/:idNumber', [
    body('password').notEmpty().withMessage('Password is required for account deletion')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: errors.array() 
            });
        }

        const { idNumber } = req.params;
        const { password } = req.body;

        // Get user
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE id_number = ?',
            [idNumber]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Password is incorrect' });
        }

        // Delete user
        await pool.execute(
            'DELETE FROM users WHERE id_number = ?',
            [idNumber]
        );

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
