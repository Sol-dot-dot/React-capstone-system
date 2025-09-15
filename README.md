# Capstone Library Management System

A comprehensive, AI-powered library management system with modern web admin panel and mobile application for students and administrators. Built with cutting-edge technologies and featuring advanced AI integration, real-time monitoring, and smart notification systems.

## 🏗️ System Architecture

- **Backend**: Node.js + Express.js API with comprehensive middleware
- **Database**: MySQL with optimized schema and connection pooling
- **Web Admin**: React.js with modern UI components and real-time updates
- **Mobile App**: React Native with cross-platform compatibility
- **AI Integration**: OpenAI GPT-3.5 + FAISS Vector Database for intelligent recommendations
- **Monitoring**: Comprehensive performance monitoring and audit logging
- **Notifications**: Smart email and push notification system
- **Security**: JWT authentication with role-based access control

## 🛠️ Technology Stack

### Backend Technologies
- **Runtime**: Node.js (v16+)
- **Framework**: Express.js with comprehensive middleware
- **Database**: MySQL with connection pooling and optimized queries
- **Authentication**: JWT (JSON Web Tokens) with role-based access control
- **Email Service**: Nodemailer with Gmail SMTP integration
- **AI Integration**: OpenAI GPT-3.5 + FAISS Vector Database
- **Monitoring**: Custom performance monitoring and audit logging
- **Security**: bcrypt for password hashing, CORS protection
- **Validation**: Input validation and sanitization

### Frontend Technologies
- **Web Admin**: React.js with modern hooks and context API
- **UI Components**: Custom design system with responsive layouts
- **State Management**: React Context API and local state
- **Styling**: CSS3 with modern design patterns
- **Charts**: Data visualization for analytics and reporting
- **Mobile App**: React Native with cross-platform compatibility
- **Navigation**: React Navigation for mobile app routing
- **Storage**: AsyncStorage for mobile data persistence

### AI & Machine Learning
- **Language Model**: OpenAI GPT-3.5 for natural language processing
- **Vector Database**: FAISS for similarity search and recommendations
- **RAG System**: Retrieval-Augmented Generation for accurate responses
- **Embeddings**: OpenAI text-embedding-ada-002 for book content analysis
- **Recommendation Engine**: Personalized book suggestions based on user history

### Database Schema
- **Users**: Authentication, profiles, and role management
- **Books**: Catalog management with metadata and status tracking
- **Borrowing**: Transaction records and due date management
- **Penalties**: Fine calculations and payment processing
- **System Settings**: Configurable rules and parameters
- **Activity Logs**: Comprehensive audit trail and monitoring
- **Notifications**: Email templates and user preferences

## 🚀 Complete Feature List

### 📱 Mobile Application Features

#### Authentication & User Management
- **User Registration**: Step-by-step registration with ID number validation and email verification
- **Email Verification**: Real email integration with 6-digit verification codes (10-minute expiry)
- **User Login**: Secure login with ID number and password using JWT tokens
- **Password Reset**: Complete password reset workflow with email verification
- **Profile Management**: View and update user profile information with real-time validation
- **Change Password**: Secure password change functionality with current password verification
- **Account Security**: Session management and automatic token refresh

#### Library Features
- **Borrowed Books Screen**: View all currently borrowed books with due dates and status
- **Penalty Information**: Check borrowing status, fines, and semester progress tracking
- **AI Chatbot Assistant**: Get intelligent book recommendations using AI-powered RAG system
- **Smart Notifications**: Advanced push + email notification system with customizable timing
- **Real-time Updates**: Pull-to-refresh functionality for all data with loading states
- **Reading History**: Track personal reading patterns and preferences
- **Book Search**: Advanced search functionality with filters and categories

#### User Experience
- **Modern UI**: Clean, responsive design with intuitive navigation and animations
- **Loading States**: Proper loading indicators and error handling throughout the app
- **Form Validation**: Comprehensive input validation and user-friendly error messages
- **Offline Support**: Local storage for authentication tokens and cached data
- **Multiple UI Themes**: Simple, Modern, and Ultra-Modern UI variants
- **Accessibility**: Screen reader support and keyboard navigation
- **Performance**: Optimized rendering and efficient state management

### 🌐 Web Admin Panel Features

#### Dashboard & Analytics
- **Enhanced Dashboard**: Comprehensive statistics and real-time data visualization
- **User Statistics**: Total users, verified users, login trends, and activity patterns
- **Book Statistics**: Total books, status distribution, genre analytics, and availability
- **Borrowing Analytics**: Popular books, borrowing patterns, and overdue tracking
- **Penalty Analytics**: Fine statistics, payment tracking, and blocked users
- **Activity Logs**: Complete system activity monitoring with detailed audit trails
- **Login Logs**: Track all user and admin login activities with IP tracking
- **Performance Metrics**: System health monitoring and response time tracking
- **Real-time Updates**: Live data refresh and notification system

#### Book Management
- **Add Books**: Complete book cataloging with auto-generated barcodes and ISBNs
- **Edit Books**: Update book information, status, and location details
- **Search & Filter**: Advanced search by title, author, ISBN, barcode, genre, and status
- **Status Management**: Available, borrowed, lost, maintenance status tracking
- **Genre Management**: Organize books by categories with custom genre creation
- **Bulk Operations**: Mass book operations, imports, and batch status updates
- **Book Statistics**: Overview of book distribution, availability, and usage patterns
- **Inventory Management**: Track book locations, conditions, and maintenance schedules

#### User Management
- **User Overview**: View all registered users with detailed information and search
- **User Verification**: Approve or reject user accounts with detailed review process
- **User Details**: Complete user profiles with login history and activity tracking
- **Account Management**: Enable/disable user accounts with bulk operations
- **User Analytics**: Registration trends, user activity statistics, and engagement metrics
- **User Search**: Advanced search by ID number, email, name, and registration date
- **Role Management**: Assign and manage user roles and permissions
- **User Activity**: Track user actions, borrowing history, and system interactions

#### Borrowing Management
- **Borrowing Transactions**: Process book borrowing and returns with validation
- **Due Date Tracking**: Monitor overdue books and send automated reminders
- **Borrowing Statistics**: Track borrowing patterns, popular books, and trends
- **Student Validation**: Verify student eligibility for borrowing with real-time checks
- **Transaction History**: Complete borrowing history for all users with filtering
- **Overdue Management**: Track and manage overdue books with penalty calculations
- **Borrowing Reports**: Generate comprehensive borrowing activity reports
- **Return Processing**: Streamlined book return process with condition assessment

#### Penalty Management System
- **Fine Management**: Track and process overdue book fines with automated calculations
- **System Settings**: Configure borrowing limits, fine amounts, and semester requirements
- **Payment Processing**: Record fine payments (cash, online, waived) with receipt generation
- **Semester Tracking**: Monitor student borrowing requirements and progress
- **Borrowing Restrictions**: Block students with unpaid fines or overdue books
- **Penalty Statistics**: Fine analytics, overdue book tracking, and payment trends
- **Payment History**: Complete payment transaction records with audit trails
- **Clearance Management**: Track student clearance requirements and status

#### AI Chatbot Management
- **Chatbot Interface**: Interactive AI assistant for book recommendations
- **Vector Database Management**: Refresh and manage AI embeddings for book search
- **Chat History**: Track chatbot interactions and recommendation patterns
- **AI Settings**: Configure chatbot parameters, responses, and behavior
- **Recommendation Analytics**: Analyze AI recommendation effectiveness and usage
- **Natural Language Processing**: Advanced conversational interface for book queries
- **Vector Search**: FAISS-powered similarity search for intelligent book matching

#### System Administration & Monitoring
- **Activity Logs**: Complete system activity monitoring with detailed audit trails
- **Login Logs**: Track all user and admin login activities with security monitoring
- **System Health**: Monitor system performance, status, and resource usage
- **Performance Monitoring**: Track API response times, database queries, and system metrics
- **Error Tracking**: Comprehensive error logging and monitoring with alerting
- **Data Export**: Export user and book data for reporting and backup purposes
- **Backup Management**: System backup and recovery options with automated scheduling
- **Security Monitoring**: Track suspicious activities and potential security threats

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
- `POST /api/auth/admin/login` - Admin login with JWT token generation
- `POST /api/auth/user/register` - User registration with email validation
- `POST /api/auth/user/verify` - Email verification with 6-digit code
- `POST /api/auth/user/login` - User login with JWT token generation
- `POST /api/auth/user/request-password-reset` - Request password reset via email
- `POST /api/auth/user/verify-reset-code` - Verify password reset code
- `POST /api/auth/user/reset-password` - Reset password with verified code
- `POST /api/auth/refresh-token` - Refresh JWT token for extended sessions

### User Profile Management
- `GET /api/user/profile/:idNumber` - Get user profile with complete information
- `PUT /api/user/profile/:idNumber` - Update user profile with validation
- `PUT /api/user/change-password/:idNumber` - Change user password securely
- `DELETE /api/user/profile/:idNumber` - Delete user account (soft delete)
- `GET /api/user/activity/:idNumber` - Get user activity history
- `GET /api/user/reading-history/:idNumber` - Get personalized reading history

### Book Management
- `GET /api/books` - Get all books with pagination, search, and filters
- `POST /api/books` - Add new book with auto-generated barcode
- `GET /api/books/:id` - Get detailed book information
- `PUT /api/books/:id` - Update book information and status
- `DELETE /api/books/:id` - Delete book (soft delete with archive)
- `GET /api/books/stats/overview` - Get comprehensive book statistics
- `GET /api/books/search` - Advanced search with multiple filters
- `GET /api/books/genres` - Get all available book genres
- `POST /api/books/bulk-import` - Bulk import books from CSV/Excel
- `GET /api/books/popular` - Get most popular books by borrowing count

### Borrowing Management
- `GET /api/borrowing/stats` - Get comprehensive borrowing statistics
- `POST /api/borrowing/validate` - Validate borrowing request with eligibility checks
- `POST /api/borrowing/borrow` - Process book borrowing with transaction logging
- `POST /api/borrowing/return` - Process book return with condition assessment
- `GET /api/borrowing/user/:studentId` - Get user's borrowed books with details
- `GET /api/borrowing/overdue` - Get all overdue books with penalty calculations
- `GET /api/borrowing/transactions` - Get borrowing transactions with pagination
- `GET /api/borrowing/history/:studentId` - Get complete borrowing history
- `POST /api/borrowing/extend` - Request book renewal (if eligible)
- `GET /api/borrowing/trends` - Get borrowing trends and analytics

### Penalty Management System
- `GET /api/penalty/settings` - Get system settings and configuration (admin only)
- `PUT /api/penalty/settings` - Update system settings and rules (admin only)
- `GET /api/penalty/stats` - Get comprehensive penalty system statistics (admin only)
- `POST /api/penalty/process-overdue` - Process all overdue fines automatically (admin only)
- `GET /api/penalty/fines/:studentId` - Get student's fines and payment history (admin only)
- `POST /api/penalty/pay` - Process fine payment with receipt generation (admin only)
- `GET /api/penalty/semester/:studentId` - Get semester tracking and progress (admin only)
- `POST /api/penalty/semester` - Create/update semester tracking (admin only)
- `GET /api/penalty/student-status/:studentId` - Get student borrowing status (admin only)
- `GET /api/penalty/all-fines` - Get all fines with pagination and filters (admin only)
- `GET /api/penalty/user/:studentId` - Get user's penalty data for mobile app
- `POST /api/penalty/waive` - Waive fine with reason and approval (admin only)
- `GET /api/penalty/payment-history` - Get payment history and receipts (admin only)

### AI Chatbot System
- `POST /api/chatbot/recommend` - Get AI-powered book recommendations
- `GET /api/chatbot/status` - Check vector database status and health
- `POST /api/chatbot/refresh-index` - Refresh book embeddings and vector database (admin only)
- `GET /api/chatbot/history` - Get chat history and interaction logs
- `POST /api/chatbot/feedback` - Submit feedback on recommendations
- `GET /api/chatbot/analytics` - Get chatbot usage analytics (admin only)
- `POST /api/chatbot/query` - Process natural language book queries

### Notification System
- `POST /api/notifications/send-email` - Send email notification to user
- `POST /api/notifications/send-bulk` - Send bulk notifications (admin only)
- `GET /api/notifications/due-date-reminders` - Get users needing reminders
- `POST /api/notifications/process-due-date-reminders` - Process automated reminders
- `GET /api/notifications/stats` - Get notification statistics and delivery rates
- `GET /api/notifications/user/:idNumber` - Get user notification preferences
- `PUT /api/notifications/user/:idNumber` - Update user notification preferences
- `POST /api/notifications/test` - Test notification system (admin only)

### Admin Management (Protected Routes)
- `GET /api/admin/login-logs` - Get comprehensive login logs with filtering
- `GET /api/admin/user-stats` - Get detailed user statistics and analytics
- `GET /api/admin/users` - Get all users with pagination and search
- `GET /api/admin/users/:idNumber` - Get user details with complete history
- `PUT /api/admin/users/:idNumber/verify` - Update user verification status
- `DELETE /api/admin/users/:idNumber` - Delete user account (admin only)
- `GET /api/admin/activity-logs` - Get system activity logs with filtering
- `GET /api/admin/dashboard-stats` - Get comprehensive dashboard statistics
- `GET /api/admin/performance` - Get system performance metrics
- `GET /api/admin/export/users` - Export user data to CSV/Excel
- `GET /api/admin/export/books` - Export book data to CSV/Excel
- `GET /api/admin/export/transactions` - Export transaction data to CSV/Excel

### System Health & Monitoring
- `GET /api/health` - Server health check with detailed status
- `GET /api/monitoring/performance` - Get performance metrics and statistics
- `GET /api/monitoring/errors` - Get error logs and system issues
- `GET /api/monitoring/database` - Get database health and connection status
- `GET /api/monitoring/ai` - Get AI system status and vector database health

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
- **AI Enhancements**: Personalized recommendations, reading history analysis
- **Performance Monitoring**: System health tracking and performance metrics
- **Audit Logging**: Comprehensive activity tracking and security monitoring

## 🔮 Future Enhancement Recommendations

### 🚀 High Priority Enhancements

#### Security & Authentication
- **Multi-Factor Authentication (MFA)**: Add TOTP/SMS-based 2FA for enhanced security
- **Role-Based Access Control (RBAC)**: Implement granular permissions for different user types
- **Session Management**: Advanced session handling with device tracking and remote logout
- **Password Policies**: Enforce stronger password requirements and password history
- **Account Lockout**: Implement account lockout after failed login attempts
- **API Rate Limiting**: Add rate limiting to prevent abuse and DDoS attacks

#### Mobile App Enhancements
- **Offline Mode**: Allow users to view cached data when offline
- **Push Notifications**: Real-time push notifications for due dates and system updates
- **Biometric Authentication**: Fingerprint/Face ID login for enhanced security
- **Book Scanning**: QR code/barcode scanning for quick book identification
- **Location Services**: GPS-based library location and book availability
- **Dark Mode**: Implement dark theme for better user experience
- **Accessibility**: Enhanced accessibility features for users with disabilities

#### AI & Machine Learning
- **Advanced Recommendations**: Implement collaborative filtering and content-based filtering
- **Reading Pattern Analysis**: Analyze user reading patterns for better recommendations
- **Predictive Analytics**: Predict book demand and optimize inventory
- **Natural Language Processing**: Enhanced chatbot with better understanding of queries
- **Sentiment Analysis**: Analyze user feedback and reviews for book quality assessment
- **Automated Categorization**: AI-powered book categorization and tagging

### 🔧 Medium Priority Enhancements

#### Integration & Hardware
- **RFID Integration**: RFID reader integration for automated book checkout/return
- **Barcode Scanner**: Hardware barcode scanner integration for quick book management
- **External Library Systems**: Integration with other library management systems
- **Payment Gateway**: Online payment integration for fine payments
- **SMS Integration**: SMS notifications for users without email access
- **API Webhooks**: Webhook support for third-party integrations

#### Performance & Scalability
- **Caching System**: Redis-based caching for improved performance
- **Database Optimization**: Query optimization and database indexing
- **Load Balancing**: Implement load balancing for high availability
- **CDN Integration**: Content delivery network for static assets
- **Microservices Architecture**: Break down monolithic backend into microservices
- **Containerization**: Docker containerization for easy deployment

#### Reporting & Analytics
- **Advanced Analytics**: Machine learning-powered insights and predictions
- **Custom Reports**: User-defined report generation with drag-and-drop interface
- **Data Visualization**: Interactive charts and graphs for better data understanding
- **Export Options**: Multiple export formats (PDF, Excel, CSV) with custom templates
- **Scheduled Reports**: Automated report generation and email delivery
- **Dashboard Customization**: User-customizable dashboard widgets

### 🎯 Low Priority Enhancements

#### User Experience
- **Multi-language Support**: Internationalization for different languages
- **Themes & Customization**: Multiple UI themes and user customization options
- **Social Features**: User reviews, ratings, and book recommendations sharing
- **Gamification**: Reading challenges, badges, and achievement system
- **Advanced Search**: Elasticsearch integration for powerful search capabilities
- **Book Reviews**: User-generated book reviews and ratings system

#### Administrative Features
- **Bulk Operations**: Enhanced bulk operations for books, users, and transactions
- **Backup & Recovery**: Automated backup system with point-in-time recovery
- **System Maintenance**: Maintenance mode and system update management
- **Audit Trail**: Enhanced audit logging with detailed change tracking
- **Configuration Management**: Dynamic system configuration without restarts
- **Plugin System**: Extensible plugin architecture for custom features

#### Testing & Quality Assurance
- **Automated Testing**: Comprehensive unit, integration, and end-to-end tests
- **Performance Testing**: Load testing and performance benchmarking
- **Security Testing**: Automated security vulnerability scanning
- **Code Quality**: Code quality metrics and automated code review
- **Continuous Integration**: CI/CD pipeline for automated testing and deployment
- **Monitoring & Alerting**: Advanced monitoring with alerting and incident management

### 📊 Implementation Roadmap

#### Phase 1 (Immediate - 1-2 months)
- Multi-factor authentication
- Push notifications
- Offline mode for mobile app
- Enhanced security features

#### Phase 2 (Short-term - 3-6 months)
- RFID integration
- Advanced AI recommendations
- Performance optimization
- Enhanced reporting system

#### Phase 3 (Medium-term - 6-12 months)
- Microservices architecture
- Advanced analytics
- Payment gateway integration
- Social features

#### Phase 4 (Long-term - 12+ months)
- Machine learning predictions
- Advanced integrations
- Scalability improvements
- Enterprise features

### 💡 Innovation Opportunities

#### Emerging Technologies
- **Blockchain**: Implement blockchain for immutable transaction records
- **IoT Integration**: Smart shelf sensors for real-time book location tracking
- **Voice Interface**: Voice-activated book search and recommendations
- **AR/VR**: Augmented reality for book discovery and virtual library tours
- **Edge Computing**: Edge-based processing for faster response times
- **5G Integration**: Leverage 5G for enhanced mobile app performance

#### Advanced Features
- **Predictive Maintenance**: AI-powered system maintenance predictions
- **Smart Inventory**: Automated inventory management with demand forecasting
- **Digital Library**: E-book integration and digital content management
- **Virtual Assistant**: Advanced AI assistant for library operations
- **Smart Notifications**: Context-aware notifications based on user behavior
- **Automated Workflows**: Workflow automation for common library tasks

## 🎯 System Capabilities Summary

### Current System Strengths
- **Complete End-to-End Solution**: Full library management from user registration to book return
- **AI-Powered Intelligence**: Advanced book recommendations using OpenAI and vector databases
- **Multi-Platform Support**: Web admin panel and mobile app with consistent functionality
- **Real-Time Monitoring**: Comprehensive system health monitoring and performance tracking
- **Smart Notifications**: Automated email reminders and notification system
- **Comprehensive Analytics**: Detailed statistics and reporting for all system aspects
- **Security-First Design**: JWT authentication, audit logging, and secure data handling
- **Scalable Architecture**: Built with modern technologies for easy scaling and maintenance

### Key Differentiators
- **AI Integration**: Unique RAG-based book recommendation system
- **Modern UI/UX**: Clean, intuitive interfaces for both web and mobile
- **Comprehensive Monitoring**: Built-in performance monitoring and audit trails
- **Flexible Configuration**: Easily configurable system settings and rules
- **Multi-Theme Support**: Multiple UI variants for different user preferences
- **Real-Time Updates**: Live data refresh and real-time notifications
- **Comprehensive API**: Well-documented REST API for integrations

### Production Readiness
- **Security**: JWT authentication, password hashing, input validation
- **Performance**: Optimized database queries, connection pooling, monitoring
- **Reliability**: Error handling, logging, health checks, backup systems
- **Maintainability**: Clean code structure, comprehensive documentation, modular design
- **Scalability**: Designed for horizontal scaling and high availability
- **Monitoring**: Built-in performance monitoring and alerting systems

This library management system represents a modern, comprehensive solution that combines traditional library operations with cutting-edge AI technology, providing an exceptional user experience for both administrators and library users.
