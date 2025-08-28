# Password Reset Feature Setup Guide

This guide explains how to set up and use the new password reset functionality in the Capstone System.

## Backend Setup

### 1. Update Database Schema

If you have an existing database, run the following SQL commands:

```sql
USE capstone_system;

-- Add password reset fields to users table
ALTER TABLE users 
ADD COLUMN reset_code VARCHAR(6) NULL,
ADD COLUMN reset_expires TIMESTAMP NULL;
```

Or import the updated `backend/database.sql` file which includes these fields.

### 2. Backend Dependencies

The backend already includes the necessary dependencies:
- `nodemailer` for email sending
- `bcryptjs` for password hashing
- `express-validator` for input validation

### 3. Email Configuration

Ensure your email settings are configured in `backend/config.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## Mobile App Setup

### 1. Install Dependencies

Navigate to the mobile directory and install the new dependencies:

```bash
cd mobile
npm install
```

This will install:
- `@react-navigation/native`
- `@react-navigation/stack`
- `react-native-screens`
- `react-native-safe-area-context`
- `react-native-gesture-handler`

### 2. New Screens Added

The following new screens have been added to the mobile app:

- `ForgotPasswordScreen.js` - Request password reset
- `ResetPasswordScreen.js` - Reset password with code
- Updated `LoginScreen.js` - Added "Forgot Password?" link
- Updated `App.js` - Added React Navigation

## How to Use Password Reset

### 1. From Login Screen

1. Open the mobile app
2. Navigate to the Login screen
3. Tap "Forgot Password?" link
4. Enter your email address
5. Tap "Send Reset Code"

### 2. Check Email

1. Check your email for a reset code
2. The code will be a 6-digit number
3. The code expires in 10 minutes

### 3. Reset Password

1. Enter the 6-digit reset code
2. Enter your new password
3. Confirm your new password
4. Tap "Reset Password"

### 4. Login with New Password

1. Return to the Login screen
2. Enter your ID Number and new password
3. Tap "Login"

## API Endpoints

The following new API endpoints have been added:

### Request Password Reset
```
POST /api/auth/user/request-password-reset
Content-Type: application/json

{
  "email": "user@my.smciligan.edu.ph"
}
```

### Verify Reset Code
```
POST /api/auth/user/verify-reset-code
Content-Type: application/json

{
  "email": "user@my.smciligan.edu.ph",
  "resetCode": "123456"
}
```

### Reset Password
```
POST /api/auth/user/reset-password
Content-Type: application/json

{
  "email": "user@my.smciligan.edu.ph",
  "resetCode": "123456",
  "newPassword": "newpassword123"
}
```

## Security Features

- Reset codes expire after 10 minutes
- Only verified users can request password resets
- Email must be from @my.smciligan.edu.ph domain
- New password must be at least 6 characters
- Reset codes are cleared after successful password reset

## Testing

1. **Test with existing user**:
   - Login with existing credentials
   - Use "Forgot Password?" feature
   - Verify email receives reset code
   - Reset password successfully

2. **Test with non-verified user**:
   - Try to reset password for unverified email
   - Should receive "User not found or email not verified" error

3. **Test with invalid email**:
   - Try to reset password with non-institutional email
   - Should receive domain validation error

4. **Test expired code**:
   - Wait more than 10 minutes after requesting reset
   - Try to use the expired code
   - Should receive "Invalid or expired reset code" error

## Troubleshooting

### Email Not Received
- Check spam folder
- Verify email configuration in backend
- Check Gmail app password settings

### Reset Code Not Working
- Ensure code is entered exactly as received
- Check if code has expired (10 minutes)
- Verify email address matches the one used for reset request

### Mobile App Navigation Issues
- Clear React Native cache: `npx react-native start --reset-cache`
- Rebuild the app: `npx react-native run-android`

### Database Issues
- Verify the `reset_code` and `reset_expires` columns exist in users table
- Check database connection settings
