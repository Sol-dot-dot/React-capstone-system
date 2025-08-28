const nodemailer = require('nodemailer');
require('dotenv').config({ path: './config.env' });

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationEmail = async (email, verificationCode) => {
    console.log('Attempting to send verification email to:', email);
    console.log('Email configuration:', {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS ? '***' : 'NOT_SET'
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification Code - Capstone System',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333; text-align: center;">Email Verification</h2>
                <p>Hello!</p>
                <p>Thank you for registering with the Capstone System. Your verification code is:</p>
                <h1 style="color: #007bff; font-size: 32px; text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 5px; margin: 20px 0;">${verificationCode}</h1>
                <p><strong>This code will expire in 10 minutes.</strong></p>
                <p>If you didn't request this code, please ignore this email.</p>
                <hr style="margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">This is an automated message from the Capstone System.</p>
            </div>
        `,
        text: `Your verification code is: ${verificationCode}. This code will expire in 10 minutes.`
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);
        return true;
    } catch (error) {
        console.error('Email sending error:', error.message);
        console.error('Full error:', error);
        return false;
    }
};

const sendPasswordResetEmail = async (email, resetCode) => {
    console.log('Attempting to send password reset email to:', email);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Code - Capstone System',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333; text-align: center;">Password Reset</h2>
                <p>Hello!</p>
                <p>You have requested to reset your password for the Capstone System. Your reset code is:</p>
                <h1 style="color: #dc3545; font-size: 32px; text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 5px; margin: 20px 0;">${resetCode}</h1>
                <p><strong>This code will expire in 10 minutes.</strong></p>
                <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
                <hr style="margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">This is an automated message from the Capstone System.</p>
            </div>
        `,
        text: `Your password reset code is: ${resetCode}. This code will expire in 10 minutes.`
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully:', result.messageId);
        return true;
    } catch (error) {
        console.error('Password reset email sending error:', error.message);
        console.error('Full error:', error);
        return false;
    }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
