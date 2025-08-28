# Capstone System - Web & Mobile Demo

A simple system to verify the connection and API between a web admin panel and mobile application.

## System Architecture

- **Backend**: Node.js + Express API
- **Database**: MySQL (managed with phpMyAdmin)
- **Web Admin**: React.js
- **Mobile App**: React Native

## Features

### Web Admin Panel
- Admin login (fixed account)
- View user statistics
- Monitor login logs from mobile users
- Clean, responsive dashboard

### Mobile App
- User registration with email verification
- User login
- Password reset functionality
- Welcome screen after authentication
- Real email integration for verification codes

## Prerequisites

- Node.js (v16 or higher)
- MySQL Server
- phpMyAdmin (for database management)
- Android Studio (for mobile development)
- React Native CLI

## Setup Instructions

### 1. Database Setup

1. Open phpMyAdmin
2. Create a new database named `capstone_system`
3. Import the database schema from `backend/database.sql`

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `config.env` and update with your settings:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=capstone_system
   DB_PORT=3306

   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=24h

   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password

   PORT=5000
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:5000`

### 3. Web Admin Panel Setup

1. Navigate to the web directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The web app will be available at `http://localhost:3000`

### 4. Mobile App Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. For Android development:
   ```bash
   npx react-native run-android
   ```

   Make sure you have:
   - Android Studio installed
   - Android emulator running
   - ANDROID_HOME environment variable set

## Default Credentials

### Admin Panel
- **Username**: admin
- **Password**: password

### Test User Registration
- **ID Number Format**: XXX-XXXX (e.g., C22-0044)
- **Email Domain**: @my.smciligan.edu.ph
- **Password**: Minimum 6 characters

## API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/user/register` - User registration
- `POST /api/auth/user/verify` - Email verification
- `POST /api/auth/user/login` - User login
- `POST /api/auth/user/request-password-reset` - Request password reset
- `POST /api/auth/user/verify-reset-code` - Verify password reset code
- `POST /api/auth/user/reset-password` - Reset password with code

### User Profile Management
- `GET /api/user/profile/:idNumber` - Get user profile
- `PUT /api/user/profile/:idNumber` - Update user profile
- `PUT /api/user/change-password/:idNumber` - Change user password
- `DELETE /api/user/profile/:idNumber` - Delete user account

### Admin (Protected)
- `GET /api/admin/login-logs` - Get login logs
- `GET /api/admin/user-stats` - Get user statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:idNumber` - Get user details with login history
- `PUT /api/admin/users/:idNumber/verify` - Update user verification status
- `DELETE /api/admin/users/:idNumber` - Delete user account
- `GET /api/admin/activity-logs` - Get system activity logs
- `GET /api/admin/dashboard-stats` - Get comprehensive dashboard statistics

### Health Check
- `GET /api/health` - Server health check

## Email Configuration

To enable email verification:

1. Use a Gmail account
2. Enable 2-factor authentication
3. Generate an App Password
4. Update the email settings in `backend/config.env`

## Testing the System

1. **Start all services**:
   - Backend API (port 5000)
   - Web admin panel (port 3000)
   - Mobile app (Android emulator)

2. **Test Admin Panel**:
   - Visit `http://localhost:3000`
   - Login with admin/password
   - View dashboard and statistics

3. **Test Mobile App**:
   - Register a new user with valid email
   - Check email for verification code
   - Verify email and login
   - Test password reset functionality
   - View welcome screen

4. **Verify Connection**:
   - Login from mobile app
   - Check admin panel for new login logs
   - Verify statistics update

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Verify MySQL is running
   - Check database credentials in `config.env`
   - Ensure database `capstone_system` exists

2. **Email Not Sending**:
   - Check Gmail app password
   - Verify email settings in `config.env`
   - Check firewall/network settings

3. **Mobile App Connection Error**:
   - Ensure backend is running on port 5000
   - Check Android emulator network settings
   - Verify API URL in mobile app (should be `http://10.0.2.2:5000`)

4. **React Native Build Issues**:
   - Clear Metro cache: `npx react-native start --reset-cache`
   - Clean Android build: `cd android && ./gradlew clean`
   - Rebuild: `npx react-native run-android`

## Project Structure

```
├── backend/                 # Node.js API server
│   ├── config/             # Database configuration
│   ├── middleware/         # Authentication middleware
│   ├── routes/             # API routes
│   ├── utils/              # Email service
│   ├── server.js           # Main server file
│   └── database.sql        # Database schema
├── web/                    # React.js admin panel
│   ├── public/             # Static files
│   ├── src/                # React components
│   └── package.json        # Web dependencies
├── mobile/                 # React Native app
│   ├── src/                # Mobile components
│   ├── screens/            # Mobile screens
│   └── package.json        # Mobile dependencies
└── README.md               # This file
```

## Development Notes

- The system uses JWT tokens for authentication
- Email verification codes expire after 10 minutes
- Login logs are automatically created for both admin and user logins
- The mobile app uses AsyncStorage for token persistence
- CORS is enabled for cross-origin requests

## Password Reset Feature ✅

The mobile app now includes a complete password reset workflow that has been successfully implemented and tested:

1. **Request Reset**: User enters their email address
2. **Email Verification**: System sends a 6-digit reset code to the user's email
3. **Code Verification**: User enters the reset code
4. **Password Reset**: User sets a new password

### Password Reset Flow:
- Reset codes expire after 10 minutes
- Only verified users can request password resets
- Email must be from the @my.smciligan.edu.ph domain
- New password must be at least 6 characters long
- Complete mobile app integration with state-based navigation

### Mobile App Features:
- ✅ Welcome screen with login/register options
- ✅ User registration with step-by-step process
- ✅ User login with ID number and password
- ✅ Password reset functionality
- ✅ Dashboard screen after successful login
- ✅ User profile management
- ✅ Change password functionality
- ✅ Responsive design with modern UI
- ✅ Error handling and validation
- ✅ Loading states and user feedback

## Next Steps

This is a minimal demo system. For production, consider adding:

- Push notifications
- Enhanced security measures
- Error logging and monitoring
- Unit and integration tests
- Advanced analytics and reporting
- Multi-factor authentication
- Role-based access control
