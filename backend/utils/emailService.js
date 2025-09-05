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

// Smart notification email functions for due date reminders
const sendDueDateReminderEmail = async (email, userData, books, reminderType) => {
    console.log(`Attempting to send ${reminderType} reminder email to:`, email);

    let subject, title, color, urgency;
    let bookListHtml = '';
    let penaltyInfo = '';

    // Configure email based on reminder type
    switch (reminderType) {
        case '1_day_before':
            subject = '📚 Book Due Tomorrow - Capstone Library';
            title = 'Book Due Tomorrow Reminder';
            color = '#ffc107';
            urgency = 'Your book is due tomorrow!';
            break;
        case 'due_today':
            subject = '⚠️ Book Due Today - Capstone Library';
            title = 'Book Due Today Alert';
            color = '#fd7e14';
            urgency = 'Your book is due TODAY!';
            break;
        case 'overdue':
            subject = '🚨 Overdue Book - Capstone Library';
            title = 'Overdue Book Notice';
            color = '#dc3545';
            urgency = 'Your book is OVERDUE!';
            penaltyInfo = `
                <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 15px; margin: 20px 0;">
                    <h3 style="color: #721c24; margin: 0 0 10px 0;">⚠️ Penalty Information</h3>
                    <p style="color: #721c24; margin: 0;">Fine: 5 pesos per day per book</p>
                    <p style="color: #721c24; margin: 0;">Please return your books immediately to avoid additional charges.</p>
                </div>
            `;
            break;
    }

    // Generate book list HTML
    books.forEach(book => {
        const daysText = book.daysUntilDue < 0 ? `${Math.abs(book.daysUntilDue)} days overdue` : 
                        book.daysUntilDue === 0 ? 'due today' : 
                        book.daysUntilDue === 1 ? 'due tomorrow' : 
                        `due in ${book.daysUntilDue} days`;
        
        bookListHtml += `
            <div style="background-color: #f8f9fa; border-left: 4px solid ${color}; padding: 15px; margin: 10px 0; border-radius: 5px;">
                <h4 style="color: #333; margin: 0 0 5px 0;">${book.title}</h4>
                <p style="color: #666; margin: 0 0 5px 0;"><strong>Author:</strong> ${book.author}</p>
                <p style="color: #666; margin: 0 0 5px 0;"><strong>Due Date:</strong> ${new Date(book.dueDate).toLocaleDateString()}</p>
                <p style="color: ${color}; font-weight: bold; margin: 0;"><strong>Status:</strong> ${daysText}</p>
            </div>
        `;
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: ${color}; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">${title}</h1>
                </div>
                
                <div style="background-color: white; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
                    <p>Hello <strong>${userData.idNumber}</strong>,</p>
                    
                    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                        <h3 style="color: #856404; margin: 0 0 10px 0;">${urgency}</h3>
                        <p style="color: #856404; margin: 0;">Please return your borrowed books to avoid penalties.</p>
                    </div>

                    <h3 style="color: #333; margin: 20px 0 10px 0;">📚 Your Borrowed Books:</h3>
                    ${bookListHtml}

                    ${penaltyInfo}

                    <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 5px; padding: 15px; margin: 20px 0;">
                        <h3 style="color: #0c5460; margin: 0 0 10px 0;">📱 What to do next:</h3>
                        <ul style="color: #0c5460; margin: 0;">
                            <li>Return your books to the library as soon as possible</li>
                            <li>Check the mobile app for more details</li>
                            <li>Contact the library if you have any questions</li>
                        </ul>
                    </div>

                    <hr style="margin: 20px 0;">
                    <p style="color: #666; font-size: 12px; text-align: center;">
                        This is an automated message from the Capstone Library Management System.<br>
                        Please do not reply to this email.
                    </p>
                </div>
            </div>
        `,
        text: `${title}\n\nHello ${userData.idNumber},\n\n${urgency}\n\nYour borrowed books:\n${books.map(book => `- ${book.title} by ${book.author} (${book.daysUntilDue < 0 ? `${Math.abs(book.daysUntilDue)} days overdue` : book.daysUntilDue === 0 ? 'due today' : book.daysUntilDue === 1 ? 'due tomorrow' : `due in ${book.daysUntilDue} days`})`).join('\n')}\n\nPlease return your books to avoid penalties.\n\nThis is an automated message from the Capstone Library Management System.`
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log(`${reminderType} reminder email sent successfully:`, result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error(`${reminderType} reminder email sending error:`, error.message);
        return { success: false, error: error.message };
    }
};

const sendBulkDueDateReminders = async (notifications) => {
    console.log(`Sending bulk due date reminders for ${notifications.length} users`);
    
    const results = [];
    
    for (const notification of notifications) {
        try {
            const result = await sendDueDateReminderEmail(
                notification.email,
                notification.userData,
                notification.books,
                notification.reminderType
            );
            results.push({
                userId: notification.userData.idNumber,
                email: notification.email,
                reminderType: notification.reminderType,
                ...result
            });
        } catch (error) {
            console.error(`Error sending reminder to ${notification.email}:`, error);
            results.push({
                userId: notification.userData.idNumber,
                email: notification.email,
                reminderType: notification.reminderType,
                success: false,
                error: error.message
            });
        }
    }
    
    return results;
};

module.exports = { 
    sendVerificationEmail, 
    sendPasswordResetEmail,
    sendDueDateReminderEmail,
    sendBulkDueDateReminders
};
