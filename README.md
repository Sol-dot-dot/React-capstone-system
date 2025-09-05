# Capstone Library Management System

A comprehensive library management system with web admin panel and mobile application for students and administrators.

## System Architecture

- **Backend**: Node.js + Express API
- **Database**: MySQL (managed with phpMyAdmin)
- **Web Admin**: React.js
- **Mobile App**: React Native
- **AI Integration**: OpenAI GPT-3.5 + FAISS Vector Database

## 🚀 Complete Feature List

### 📱 Mobile Application Features

#### Authentication & User Management
- **User Registration**: Step-by-step registration with ID number validation
- **Email Verification**: Real email integration with 6-digit verification codes
- **User Login**: Secure login with ID number and password
- **Password Reset**: Complete password reset workflow with email verification
- **Profile Management**: View and update user profile information
- **Change Password**: Secure password change functionality

#### Library Features
- **Borrowed Books Screen**: View all currently borrowed books with due dates
- **Penalty Information**: Check borrowing status, fines, and semester progress
- **AI Chatbot Assistant**: Get book recommendations using AI-powered RAG system
- **Smart Notifications**: Advanced push + email notification system with customizable timing
- **Real-time Updates**: Pull-to-refresh functionality for all data

#### User Experience
- **Modern UI**: Clean, responsive design with intuitive navigation
- **Loading States**: Proper loading indicators and error handling
- **Form Validation**: Comprehensive input validation and error messages
- **Offline Support**: Local storage for authentication tokens

### 🌐 Web Admin Panel Features

#### Dashboard & Analytics
- **Enhanced Dashboard**: Comprehensive statistics and real-time data
- **User Statistics**: Total users, verified users, login trends
- **Book Statistics**: Total books, status distribution, genre analytics
- **Activity Logs**: Complete system activity monitoring
- **Login Logs**: Track all user and admin login activities

#### Book Management
- **Add Books**: Complete book cataloging with auto-generated barcodes
- **Edit Books**: Update book information and status
- **Search & Filter**: Advanced search by title, author, ISBN, barcode
- **Status Management**: Available, borrowed, lost, maintenance status
- **Genre Management**: Organize books by categories
- **Bulk Operations**: Mass book operations and imports

#### User Management
- **User Overview**: View all registered users with detailed information
- **User Verification**: Approve or reject user accounts
- **User Details**: Complete user profiles with login history
- **Account Management**: Enable/disable user accounts
- **User Statistics**: Registration trends and user analytics

#### Borrowing Management
- **Borrowing Transactions**: Process book borrowing and returns
- **Due Date Tracking**: Monitor overdue books and send reminders
- **Borrowing Statistics**: Track borrowing patterns and popular books
- **Student Validation**: Verify student eligibility for borrowing
- **Transaction History**: Complete borrowing history for all users

#### Penalty System
- **Fine Management**: Track and process overdue book fines
- **System Settings**: Configure borrowing limits and fine amounts
- **Payment Processing**: Record fine payments (cash, online, waived)
- **Semester Tracking**: Monitor student borrowing requirements
- **Borrowing Restrictions**: Block students with unpaid fines
- **Statistics Dashboard**: Fine analytics and overdue book tracking

#### AI Chatbot Integration
- **Book Recommendations**: AI-powered book suggestions using RAG
- **Natural Language Processing**: Conversational interface for book queries
- **Vector Search**: FAISS-powered similarity search for books
- **Real-time Chat**: Interactive chatbot widget for both web and mobile
- **Admin Controls**: Refresh AI database and manage chatbot settings

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

## 🔌 Complete API Endpoints

### Authentication & Authorization
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

### Book Management
- `GET /api/books` - Get all books with pagination and search
- `POST /api/books` - Add new book
- `GET /api/books/:id` - Get book details
- `PUT /api/books/:id` - Update book information
- `DELETE /api/books/:id` - Delete book
- `GET /api/books/stats/overview` - Get book statistics
- `GET /api/books/search` - Search books with filters

### Borrowing Management
- `GET /api/borrowing/stats` - Get borrowing statistics
- `POST /api/borrowing/validate` - Validate borrowing request
- `POST /api/borrowing/borrow` - Process book borrowing
- `POST /api/borrowing/return` - Process book return
- `GET /api/borrowing/user/:studentId` - Get user's borrowed books
- `GET /api/borrowing/overdue` - Get overdue books
- `GET /api/borrowing/transactions` - Get borrowing transactions

### Penalty System
- `GET /api/penalty/settings` - Get system settings (admin only)
- `PUT /api/penalty/settings` - Update system settings (admin only)
- `GET /api/penalty/stats` - Get penalty system statistics (admin only)
- `POST /api/penalty/process-overdue` - Process all overdue fines (admin only)
- `GET /api/penalty/fines/:studentId` - Get student's fines (admin only)
- `POST /api/penalty/pay` - Process fine payment (admin only)
- `GET /api/penalty/semester/:studentId` - Get semester tracking (admin only)
- `POST /api/penalty/semester` - Create/update semester tracking (admin only)
- `GET /api/penalty/student-status/:studentId` - Get student borrowing status (admin only)
- `GET /api/penalty/all-fines` - Get all fines with pagination (admin only)
- `GET /api/penalty/user/:studentId` - Get user's penalty data (mobile app)

### AI Chatbot System
- `POST /api/chatbot/recommend` - Get AI book recommendations
- `GET /api/chatbot/status` - Check vector database status
- `POST /api/chatbot/refresh-index` - Refresh book embeddings (admin only)
- `GET /api/chatbot/history` - Get chat history (if implemented)

### Admin Management (Protected)
- `GET /api/admin/login-logs` - Get login logs
- `GET /api/admin/user-stats` - Get user statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:idNumber` - Get user details with login history
- `PUT /api/admin/users/:idNumber/verify` - Update user verification status
- `DELETE /api/admin/users/:idNumber` - Delete user account
- `GET /api/admin/activity-logs` - Get system activity logs
- `GET /api/admin/dashboard-stats` - Get comprehensive dashboard statistics

### System Health
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

### 📱 Mobile App Screens & Features:

#### Authentication Screens
- ✅ **Welcome Screen**: Login/register options with modern UI
- ✅ **Registration Screen**: Step-by-step user registration process
- ✅ **Email Verification Screen**: 6-digit code verification
- ✅ **Login Screen**: Secure login with ID number and password
- ✅ **Forgot Password Screen**: Password reset request
- ✅ **Reset Password Screen**: New password setup with verification

#### Main Application Screens
- ✅ **Dashboard Screen**: Welcome screen with user info and action buttons
- ✅ **Profile Screen**: View and edit user profile information
- ✅ **Change Password Screen**: Secure password change functionality
- ✅ **Borrowed Books Screen**: View all currently borrowed books with due dates
- ✅ **Penalty Screen**: Check borrowing status, fines, and semester progress
- ✅ **AI Chatbot Screen**: Interactive book recommendation assistant

#### User Experience Features
- ✅ **Modern UI Design**: Clean, responsive design with intuitive navigation
- ✅ **Loading States**: Proper loading indicators and error handling
- ✅ **Form Validation**: Comprehensive input validation and error messages
- ✅ **Pull-to-Refresh**: Real-time data updates for all screens
- ✅ **Smart Notifications**: Push + email notifications with customizable settings
- ✅ **Offline Support**: Local storage for authentication tokens
- ✅ **Floating Chatbot Button**: Quick access to AI assistant
- ✅ **Error Handling**: User-friendly error messages and recovery options
- ✅ **Notification Settings**: Customizable notification preferences

### 🌐 Web Admin Panel Modules:

#### Dashboard & Analytics Module
- ✅ **Enhanced Dashboard**: Real-time statistics and comprehensive analytics
- ✅ **User Statistics**: Total users, verified users, registration trends
- ✅ **Book Statistics**: Total books, status distribution, genre analytics
- ✅ **Borrowing Analytics**: Popular books, borrowing patterns, overdue tracking
- ✅ **Penalty Analytics**: Fine statistics, payment tracking, blocked users
- ✅ **Activity Monitoring**: Complete system activity logs and user actions

#### Book Management Module
- ✅ **Book Catalog**: Complete book database with search and filtering
- ✅ **Add Books**: Full book cataloging with auto-generated barcodes and ISBNs
- ✅ **Edit Books**: Update book information, status, and location
- ✅ **Book Search**: Advanced search by title, author, ISBN, barcode, genre
- ✅ **Status Management**: Available, borrowed, lost, maintenance status tracking
- ✅ **Genre Management**: Organize and filter books by categories
- ✅ **Bulk Operations**: Mass book operations and data imports
- ✅ **Book Statistics**: Overview of book distribution and availability

#### User Management Module
- ✅ **User Overview**: Complete user database with detailed information
- ✅ **User Verification**: Approve or reject user registration requests
- ✅ **User Profiles**: Detailed user information with login history
- ✅ **Account Management**: Enable/disable user accounts
- ✅ **User Analytics**: Registration trends and user activity statistics
- ✅ **User Search**: Find users by ID number, email, or name

#### Borrowing Management Module
- ✅ **Borrowing Transactions**: Process book borrowing and returns
- ✅ **Due Date Tracking**: Monitor overdue books and send reminders
- ✅ **Borrowing Statistics**: Track borrowing patterns and popular books
- ✅ **Student Validation**: Verify student eligibility for borrowing
- ✅ **Transaction History**: Complete borrowing history for all users
- ✅ **Overdue Management**: Track and manage overdue books
- ✅ **Borrowing Reports**: Generate borrowing activity reports

#### Penalty Management Module
- ✅ **Fine Management**: Track and process overdue book fines
- ✅ **System Settings**: Configure borrowing limits and fine amounts
- ✅ **Payment Processing**: Record fine payments (cash, online, waived)
- ✅ **Semester Tracking**: Monitor student borrowing requirements
- ✅ **Borrowing Restrictions**: Block students with unpaid fines
- ✅ **Penalty Statistics**: Fine analytics and overdue book tracking
- ✅ **Payment History**: Complete payment transaction records

#### AI Chatbot Management
- ✅ **Chatbot Interface**: Interactive AI assistant for book recommendations
- ✅ **Vector Database Management**: Refresh and manage AI embeddings
- ✅ **Chat History**: Track chatbot interactions and recommendations
- ✅ **AI Settings**: Configure chatbot parameters and responses

#### System Administration
- ✅ **Activity Logs**: Complete system activity monitoring
- ✅ **Login Logs**: Track all user and admin login activities
- ✅ **System Health**: Monitor system performance and status
- ✅ **Data Export**: Export user and book data for reporting
- ✅ **Backup Management**: System backup and recovery options

## 🏛️ Penalty System Documentation

### System Overview
The penalty system enforces library rules and tracks student borrowing behavior with comprehensive fine management and semester tracking.

### Key Features
- **Borrowing Limits**: Students can borrow up to 3 books at once (configurable)
- **Borrowing Period**: Books must be returned within 7 days (configurable)
- **Fine System**: 5 pesos per day for overdue books (configurable)
- **Semester Tracking**: Students must borrow at least 20 books per semester (5 months)
- **Borrowing Restrictions**: Students with unpaid fines or overdue books cannot borrow new books

### Database Tables
- **system_settings**: Stores configurable system rules
- **fines**: Tracks student fines for overdue books
- **semester_tracking**: Monitors student borrowing progress per semester
- **student_borrowing_status**: Manages student borrowing eligibility
- **fine_payments**: Records fine payment transactions

### Business Rules
1. **Borrowing Validation**: Check student eligibility before allowing borrowing
2. **Fine Calculation**: Automatic fine calculation at 5 pesos per day per book
3. **Semester Progress**: Track student progress toward 20-book requirement
4. **Payment Processing**: Support for cash, online, and waived payments
5. **Status Updates**: Real-time borrowing status updates

## 🤖 AI Chatbot System Documentation

### Architecture Overview
```
User Query → OpenAI Embeddings → FAISS Vector Search → MySQL Book Data → GPT-3.5 → Natural Response
```

### Key Components
- **OpenAI Integration**: GPT-3.5 for natural language processing
- **FAISS Vector Database**: Fast similarity search for book recommendations
- **MySQL Integration**: Real book data from the library database
- **RAG Implementation**: Retrieval-Augmented Generation for accurate responses

### Features
- **Book Recommendations**: AI-powered suggestions based on user queries
- **Natural Language Processing**: Conversational interface for book queries
- **Vector Similarity Search**: Find similar books using embeddings
- **Real-time Chat**: Interactive chatbot widget for both web and mobile
- **Admin Controls**: Refresh AI database and manage chatbot settings

### Setup Requirements
- OpenAI API key for GPT-3.5 and embeddings
- FAISS vector database for similarity search
- Book data preprocessing and embedding generation
- Real-time chat interface integration

### Usage Examples
- "I want fantasy books like Harry Potter"
- "Show me mystery novels"
- "What are the most popular books?"
- "Recommend books for computer science students"

## 🔔 Smart Notifications System

### Overview
The smart notifications system provides comprehensive due date reminders with push notifications and email combinations for higher reliability.

### Key Features
- **Email Notifications**: Professional HTML email templates for maximum reach
- **Smart Timing**: 1 day before, due today, and overdue reminders
- **Customizable Settings**: Users can control notification preferences
- **Penalty Information**: Overdue notifications include fine details
- **Bulk Processing**: Admin tools for mass notification management
- **In-App Alerts**: Immediate alerts for urgent notifications

### Notification Types

#### 1. One Day Before Due
- **Email**: Professional HTML template with book details
- **In-App Alert**: Gentle reminder notification
- **Timing**: 24 hours before due date

#### 2. Due Today
- **Email**: Urgent reminder with clear call-to-action
- **In-App Alert**: Urgent notification with action buttons
- **Timing**: On the due date

#### 3. Overdue Books
- **Email**: Includes penalty information and fine details
- **In-App Alert**: Critical alert with penalty information
- **Timing**: Daily until books are returned

### Mobile App Features
- **Notification Settings Screen**: Customize notification preferences
- **In-App Alerts**: Immediate alerts for urgent notifications
- **Email Integration**: Seamless email notification system
- **Settings Management**: User-controlled notification preferences

### Backend API Endpoints
- `POST /api/notifications/send-email` - Send email notification
- `POST /api/notifications/send-bulk` - Send bulk notifications (admin)
- `GET /api/notifications/due-date-reminders` - Get users needing reminders
- `POST /api/notifications/process-due-date-reminders` - Process reminders
- `GET /api/notifications/stats` - Get notification statistics
- `GET /api/notifications/user/:idNumber` - Get user preferences
- `PUT /api/notifications/user/:idNumber` - Update user preferences

### Email Templates
- **Professional HTML Design**: Responsive email templates
- **Color-Coded Urgency**: Different colors for different reminder types
- **Book Details**: Complete book information with due dates
- **Penalty Information**: Clear fine details for overdue books
- **Action Items**: Clear next steps for users

### Setup Instructions
1. **Install Dependencies**: Run `setup-smart-notifications.bat`
2. **Configure Email**: Update email settings in `backend/config.env`
3. **Mobile Setup**: Run `npm install` in mobile directory
4. **Start Services**: Start backend and mobile app

### Configuration
```env
# Email Configuration (backend/config.env)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Usage Examples
- **User Experience**: Automatic email notifications based on borrowing activity
- **Admin Management**: Bulk notification processing for all users
- **Customization**: Users can enable/disable specific notification types
- **Reliability**: Email delivery ensures important reminders are received
- **In-App Alerts**: Immediate notifications for urgent situations

## 🚀 System Status & Future Enhancements

### ✅ Currently Implemented
This is a **comprehensive library management system** with the following fully implemented features:

- **Complete Authentication System**: User registration, login, password reset, email verification
- **Full Book Management**: Add, edit, search, and manage books with auto-generated barcodes
- **Advanced Borrowing System**: Process borrowing, returns, and track due dates
- **Comprehensive Penalty System**: Fine management, semester tracking, and borrowing restrictions
- **AI-Powered Chatbot**: RAG-based book recommendations with OpenAI integration
- **Mobile Application**: Complete React Native app with all library features
- **Web Admin Panel**: Full-featured admin interface with all management modules
- **Real-time Notifications**: Due date reminders and system notifications
- **Analytics & Reporting**: Comprehensive statistics and activity monitoring

### 🔮 Future Enhancement Opportunities
For production deployment, consider adding:

- **Advanced Security**: Multi-factor authentication, role-based access control
- **Enhanced Notifications**: Push notifications, email alerts, SMS integration
- **Reporting System**: Advanced analytics, custom reports, data export
- **Integration Features**: RFID integration, barcode scanning, external library systems
- **Performance Optimization**: Caching, database optimization, load balancing
- **Testing Suite**: Unit tests, integration tests, automated testing
- **Monitoring & Logging**: Error tracking, performance monitoring, audit logs
- **Mobile Features**: Offline mode, book scanning, location services
- **AI Enhancements**: Personalized recommendations, reading history analysis
- **Multi-language Support**: Internationalization for different languages
