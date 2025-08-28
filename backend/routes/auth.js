const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { sendVerificationEmail } = require('../utils/emailService');
require('dotenv').config({ path: './config.env' });

const router = express.Router();

// Admin Login
router.post('/admin/login', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        const [admins] = await pool.execute(
            'SELECT * FROM admins WHERE username = ?',
            [username]
        );

        if (admins.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const admin = admins[0];
        const isValidPassword = await bcrypt.compare(password, admin.password);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Log admin login
        await pool.execute(
            'INSERT INTO login_logs (user_type, ip_address, user_agent) VALUES (?, ?, ?)',
            ['admin', req.ip, req.get('User-Agent')]
        );

        const token = jwt.sign(
            { id: admin.id, username: admin.username, type: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.json({
            message: 'Admin login successful',
            token,
            user: {
                id: admin.id,
                username: admin.username,
                email: admin.email
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Step 1: Check ID Number
router.post('/user/check-id', [
    body('idNumber').matches(/^[A-Z]\d{2}-\d{4}$/).withMessage('ID Number must be in format XXX-XXXX')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: errors.array() 
            });
        }

        const { idNumber } = req.body;

        // Check if ID number already exists
        const [existingUsers] = await pool.execute(
            'SELECT * FROM users WHERE id_number = ?',
            [idNumber]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'ID Number already registered' });
        }

        res.json({ 
            success: true,
            message: 'ID Number is available'
        });
    } catch (error) {
        console.error('ID check error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Step 2: Check Email and Send Verification Code
router.post('/user/check-email', [
    body('idNumber').matches(/^[A-Z]\d{2}-\d{4}$/).withMessage('ID Number must be in format XXX-XXXX'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('email').matches(/@my\.smciligan\.edu\.ph$/).withMessage('Email must be from @my.smciligan.edu.ph domain')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: errors.array() 
            });
        }

        const { idNumber, email } = req.body;

        // Check if email already exists
        const [existingUsers] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Check if there's an existing incomplete registration
        const [incompleteUsers] = await pool.execute(
            'SELECT * FROM users WHERE id_number = ? AND is_verified = FALSE',
            [idNumber]
        );

        let userId;
        let verificationCode;

        if (incompleteUsers.length > 0) {
            // Update existing incomplete registration
            userId = incompleteUsers[0].id;
            verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            await pool.execute(
                'UPDATE users SET email = ?, verification_code = ?, verification_expires = ? WHERE id = ?',
                [email, verificationCode, verificationExpires, userId]
            );
        } else {
            // Create new incomplete registration
            verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            const [result] = await pool.execute(
                'INSERT INTO users (id_number, email, verification_code, verification_expires, is_verified) VALUES (?, ?, ?, ?, FALSE)',
                [idNumber, email, verificationCode, verificationExpires]
            );
            userId = result.insertId;
        }

        // Send verification email
        const emailSent = await sendVerificationEmail(email, verificationCode);

        if (!emailSent) {
            return res.status(500).json({ message: 'Failed to send verification email' });
        }

        res.json({
            success: true,
            message: 'Verification code sent to your email',
            userId: userId
        });
    } catch (error) {
        console.error('Email check error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Step 3: Verify Email Code
router.post('/user/verify-code', [
    body('idNumber').matches(/^[A-Z]\d{2}-\d{4}$/).withMessage('ID Number must be in format XXX-XXXX'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('verificationCode').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: errors.array() 
            });
        }

        const { idNumber, email, verificationCode } = req.body;

        const [users] = await pool.execute(
            'SELECT * FROM users WHERE id_number = ? AND email = ? AND verification_code = ? AND verification_expires > NOW()',
            [idNumber, email, verificationCode]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        const user = users[0];

        // Mark user as verified
        await pool.execute(
            'UPDATE users SET is_verified = TRUE, verification_code = NULL, verification_expires = NULL WHERE id = ?',
            [user.id]
        );

        res.json({
            success: true,
            message: 'Email verified successfully',
            userId: user.id
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Step 4: Complete Registration with Password
router.post('/user/complete-registration', [
    body('userId').isInt().withMessage('Valid user ID is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: errors.array() 
            });
        }

        const { userId, password } = req.body;

        // Check if user exists and is verified
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE id = ? AND is_verified = TRUE',
            [userId]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'User not found or not verified' });
        }

        // Hash password and complete registration
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        res.json({
            success: true,
            message: 'Registration completed successfully'
        });
    } catch (error) {
        console.error('Registration completion error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Legacy registration endpoint (for backward compatibility)
router.post('/user/register', [
    body('idNumber').matches(/^[A-Z]\d{2}-\d{4}$/).withMessage('ID Number must be in format XXX-XXXX'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('email').matches(/@my\.smciligan\.edu\.ph$/).withMessage('Email must be from @my.smciligan.edu.ph domain'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        console.log('Legacy registration request received:', req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: errors.array() 
            });
        }

        const { idNumber, email, password } = req.body;

        // Check if user already exists
        const [existingUsers] = await pool.execute(
            'SELECT * FROM users WHERE id_number = ? OR email = ?',
            [idNumber, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await pool.execute(
            'INSERT INTO users (id_number, email, password, verification_code, verification_expires, is_verified) VALUES (?, ?, ?, ?, ?, TRUE)',
            [idNumber, email, hashedPassword, verificationCode, verificationExpires]
        );

        res.json({
            success: true,
            message: 'Registration successful',
            userId: result.insertId
        });
    } catch (error) {
        console.error('User registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify Email
router.post('/user/verify', [
    body('userId').isInt().withMessage('Valid user ID is required'),
    body('verificationCode').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, verificationCode } = req.body;

        const [users] = await pool.execute(
            'SELECT * FROM users WHERE id = ? AND verification_code = ? AND verification_expires > NOW()',
            [userId, verificationCode]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        // Mark user as verified
        await pool.execute(
            'UPDATE users SET is_verified = TRUE, verification_code = NULL, verification_expires = NULL WHERE id = ?',
            [userId]
        );

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// User Login
router.post('/user/login', [
    body('idNumber').matches(/^[A-Z]\d{2}-\d{4}$/).withMessage('ID Number must be in format XXX-XXXX'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { idNumber, password } = req.body;

        const [users] = await pool.execute(
            'SELECT * FROM users WHERE id_number = ?',
            [idNumber]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        if (!user.is_verified) {
            return res.status(401).json({ message: 'Please verify your email first' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Log user login
        await pool.execute(
            'INSERT INTO login_logs (user_id, user_type, ip_address, user_agent) VALUES (?, ?, ?, ?)',
            [user.id, 'user', req.ip, req.get('User-Agent')]
        );

        const token = jwt.sign(
            { id: user.id, idNumber: user.id_number, type: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.json({
            success: true,
            message: 'User login successful',
            token,
            user: {
                id: user.id,
                idNumber: user.id_number,
                email: user.email
            }
        });
    } catch (error) {
        console.error('User login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
