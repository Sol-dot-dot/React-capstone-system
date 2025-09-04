# Penalty and Rules System

This document describes the penalty and rules system implemented for the Capstone Library Management System.

## Overview

The penalty system enforces library rules and tracks student borrowing behavior with the following features:

- **Borrowing Limits**: Students can borrow up to 3 books at once (configurable)
- **Borrowing Period**: Books must be returned within 7 days (configurable)
- **Fine System**: 5 pesos per day for overdue books (configurable)
- **Semester Tracking**: Students must borrow at least 20 books per semester (5 months)
- **Borrowing Restrictions**: Students with unpaid fines or overdue books cannot borrow new books

## Database Schema

### New Tables Added

1. **system_settings** - Stores configurable system rules
2. **fines** - Tracks student fines for overdue books
3. **semester_tracking** - Monitors student borrowing progress per semester
4. **student_borrowing_status** - Manages student borrowing eligibility
5. **fine_payments** - Records fine payment transactions

### Key Features

- **Configurable Rules**: All borrowing limits and fine amounts can be modified by admins
- **Automatic Fine Calculation**: Fines are calculated automatically when books are overdue
- **Real-time Status Updates**: Student borrowing status is updated in real-time
- **Semester Progress Tracking**: Monitors student progress toward 20-book requirement
- **Payment Processing**: Admins can process fine payments with multiple payment methods

## API Endpoints

### Penalty Management (`/api/penalty`)

- `GET /settings` - Get system settings (admin only)
- `PUT /settings` - Update system settings (admin only)
- `GET /stats` - Get penalty system statistics (admin only)
- `POST /process-overdue` - Process all overdue fines (admin only)
- `GET /fines/:studentId` - Get student's fines (admin only)
- `POST /pay` - Process fine payment (admin only)
- `GET /semester/:studentId` - Get semester tracking (admin only)
- `POST /semester` - Create/update semester tracking (admin only)
- `GET /student-status/:studentId` - Get student borrowing status (admin only)
- `GET /all-fines` - Get all fines with pagination (admin only)
- `GET /user/:studentId` - Get user's penalty data (mobile app)

## Admin Interface

### System Settings Panel
- Configure maximum books per borrowing (default: 3)
- Set borrowing period in days (default: 7)
- Adjust fine amount per day (default: 5 pesos)
- Set books required per semester (default: 20)
- Configure semester duration in months (default: 5)

### Fines Management Panel
- View all fines with search and filtering
- Process overdue fines automatically
- Record fine payments (cash, online, waived)
- Track payment history

### Statistics Dashboard
- Total fines and unpaid fines count
- Total fine amounts (paid and unpaid)
- Overdue books count
- Blocked students count

## Mobile App Integration

### Penalty Information Screen
- **Borrowing Status**: Shows if student can borrow books
- **Semester Progress**: Displays progress toward 20-book requirement
- **Fines Overview**: Lists unpaid fines with details
- **Important Notes**: Displays library rules and policies

### Features
- Real-time penalty data updates
- Pull-to-refresh functionality
- Clear visual indicators for borrowing status
- Detailed fine information with book details

## Business Rules Implementation

### Borrowing Validation
1. Check if student exists and is verified
2. Verify student has no unpaid fines
3. Confirm student has no overdue books
4. Validate borrowing limits (max 3 books)
5. Ensure books are available

### Fine Calculation
- Fines are calculated at 5 pesos per day per book
- Fine calculation starts the day after due date
- Fines are automatically created when books are returned overdue
- Partial payments are supported

### Semester Tracking
- Each student has an active semester record
- Semester duration is 5 months (configurable)
- Students must borrow at least 20 books per semester
- Progress is tracked automatically when books are borrowed

### Borrowing Restrictions
- Students with unpaid fines cannot borrow new books
- Students with overdue books cannot borrow new books
- Borrowing status is updated automatically when fines are paid or books are returned

## Setup Instructions

### 1. Database Setup
```bash
# Run the penalty system setup script
cd backend
./setup-penalty-system.bat
```

### 2. Backend Configuration
The penalty system is automatically integrated into the existing backend. No additional configuration is required.

### 3. Frontend Integration
The admin panel includes a new "Penalty Management" section accessible from the main navigation.

### 4. Mobile App
The mobile app includes a new "Penalty Information" screen accessible from the dashboard.

## Usage Examples

### Admin Operations

#### Update System Settings
```javascript
// Update borrowing period to 10 days
PUT /api/penalty/settings
{
  "settings": {
    "borrowing_period_days": "10"
  }
}
```

#### Process Fine Payment
```javascript
// Record a cash payment of 50 pesos
POST /api/penalty/pay
{
  "fineId": 123,
  "paymentAmount": 50.00,
  "paymentMethod": "cash",
  "notes": "Cash payment received"
}
```

### Student Experience

#### Check Penalty Status
Students can view their penalty information through the mobile app, including:
- Current borrowing status
- Unpaid fines with details
- Semester progress
- Library rules and policies

## Monitoring and Maintenance

### Daily Tasks
- Process overdue fines using the "Process Overdue Fines" button
- Monitor penalty statistics dashboard
- Review blocked students list

### Weekly Tasks
- Review fine payment reports
- Check semester progress for all students
- Update system settings if needed

### Monthly Tasks
- Generate penalty reports
- Review and adjust fine amounts if necessary
- Monitor semester completion rates

## Troubleshooting

### Common Issues

1. **Fines not being calculated**
   - Check if the "Process Overdue Fines" function is being run
   - Verify system settings are correctly configured

2. **Students unable to borrow despite no fines**
   - Check student borrowing status in the admin panel
   - Verify no overdue books exist

3. **Semester tracking not updating**
   - Ensure semester records are created for new students
   - Check if borrowing transactions are being recorded correctly

### Support

For technical support or questions about the penalty system, please refer to the system documentation or contact the development team.

## Future Enhancements

Potential improvements for the penalty system:

1. **Email Notifications**: Send automatic emails for overdue books and fines
2. **Fine Waiver System**: Allow admins to waive fines with approval workflow
3. **Advanced Reporting**: Generate detailed penalty reports and analytics
4. **Integration with Payment Gateways**: Support online fine payments
5. **Mobile Notifications**: Push notifications for overdue books and fines
6. **Bulk Operations**: Process multiple fines or payments at once
7. **Fine Categories**: Different fine rates for different types of violations
8. **Grace Periods**: Configurable grace periods before fines start accruing
