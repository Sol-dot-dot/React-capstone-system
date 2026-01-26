# Database Schema Import Guide

## Overview
This guide will help you import the complete database schema for your Capstone Library Management System into phpMyAdmin.

## File Information
- **File**: `capstone_system_complete_schema.sql`
- **Database Name**: `capstone_system_optimized`
- **Generated**: 2026-01-16
- **Status**: Production-ready, complete with all tables, relationships, triggers, and views

## What's Included

### Core Tables (5)
1. **users** - Student and admin accounts
2. **books** - Book inventory
3. **borrowing_transactions** - Book borrowing records
4. **fines** - Overdue fines
5. **fine_payments** - Fine payment records

### Academic Structure (6)
6. **academic_years** - Academic year periods
7. **semesters** - Semester periods within academic years
8. **student_year_history** - Student enrollment history
9. **semester_clearances** - Semester clearance tracking
10. **semester_fine_payments** - Semester-specific fine payments
11. **semester_tracking** - Legacy semester tracking

### History & Logs (4)
12. **overdue_history** - Historical overdue records
13. **return_transactions** - Book return details
14. **audit_logs** - System audit trail
15. **login_logs** - User login history

### Notifications (2)
16. **notification_preferences** - User notification settings
17. **notification_logs** - Sent notification records

### Settings & Status (2)
18. **student_borrowing_status** - Student borrowing permissions
19. **system_settings** - Global system configuration

### Additional Features
- **2 Functions**: `generate_book_barcode()`, `generate_student_barcode()`
- **7 Triggers**: Auto-generate barcodes, update book status, create fines
- **4 Views**: Active borrowing status, barcode lookup, overdue books, notification needs
- **All Foreign Keys**: Complete referential integrity with CASCADE/SET NULL rules

## How to Import

### Method 1: Using phpMyAdmin (Recommended)

1. **Open phpMyAdmin**
   - Navigate to: http://localhost/phpmyadmin/

2. **Create or Select Database**
   - If database exists: Click on `capstone_system_optimized` in the left sidebar
   - If creating new: Click "New" → Enter `capstone_system_optimized` → Click "Create"

3. **Import the Schema**
   - Click on the "Import" tab
   - Click "Choose File" and select: `capstone_system_complete_schema.sql`
   - Scroll down and click "Go"

4. **Wait for Completion**
   - The import may take 30-60 seconds
   - You should see: "Import has been successfully finished"

5. **Verify Installation**
   - Click on `capstone_system_optimized` in the left sidebar
   - You should see 19 tables listed
   - Check "Designer" tab to see relationships visually

### Method 2: Using MySQL Command Line

```bash
# Navigate to backend folder
cd c:\Projects\capstone_2\React-capstone-system\backend

# Import the schema
mysql -u root -p < capstone_system_complete_schema.sql

# If you need to specify database:
mysql -u root -p capstone_system_optimized < capstone_system_complete_schema.sql
```

## Default Data Included

### Academic Years (Pre-populated)
- 2020-2021
- 2021-2022
- 2022-2023
- 2023-2024
- 2024-2025
- 2025-2026 (marked as current)

### Semesters (Pre-populated)
- First Semester and Second Semester for each academic year
- Dates follow Philippine school calendar (August-May)

### System Settings
- `fine_per_day`: 5 pesos
- `max_borrow_days`: 7 days
- `max_books_per_student`: 5 books
- `semester_books_required`: 20 books for clearance

## After Import

### 1. Create an Admin User
You'll need to create at least one admin user to access the system:

```sql
INSERT INTO users (id_number, email, password_hash, first_name, last_name, role, is_verified, email_verified)
VALUES ('ADMIN001', 'admin@example.com', '$2b$10$hashed_password_here', 'Admin', 'User', 'admin', 1, 1);
```

**Note**: Replace `$2b$10$hashed_password_here` with a properly hashed password from your backend.

### 2. Test the Database
Run these queries to verify everything works:

```sql
-- Check all tables exist
SHOW TABLES;

-- Check foreign keys are in place
SELECT TABLE_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'capstone_system_optimized'
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Check triggers exist
SHOW TRIGGERS;

-- Check views exist
SHOW FULL TABLES WHERE TABLE_TYPE = 'VIEW';
```

### 3. Update Your config.env
Make sure your backend configuration matches:

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=capstone_system_optimized
DB_PORT=3306
```

## Troubleshooting

### Error: "Table already exists"
If you get errors about existing tables:

**Option 1**: Drop the entire database first
```sql
DROP DATABASE IF EXISTS capstone_system_optimized;
```
Then re-import the schema.

**Option 2**: Drop individual tables
The schema file includes `DROP TABLE IF EXISTS` statements, so it should handle this automatically.

### Error: "Cannot add foreign key constraint"
This usually means:
1. Tables are not using InnoDB engine (the schema sets this automatically)
2. Column data types don't match between parent and child tables
3. Referenced column doesn't have an index

The provided schema file handles all of these automatically.

### Error: "Access denied"
Make sure your MySQL user has sufficient privileges:

```sql
GRANT ALL PRIVILEGES ON capstone_system_optimized.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

## Important Notes

1. **Backup First**: If you have existing data, export it before importing this schema
2. **Data Loss**: This schema will DROP existing tables, so all current data will be lost
3. **Foreign Keys**: All relationships are properly configured with CASCADE and SET NULL rules
4. **Triggers**: Automatic barcode generation and fine calculation are enabled
5. **Views**: Four helpful views are created for common queries

## Next Steps

After successful import:

1. ✅ Start your backend server
2. ✅ Create admin and test student accounts
3. ✅ Add some test books
4. ✅ Test borrowing workflow
5. ✅ Verify fine calculation works
6. ✅ Test notification system

## Support

If you encounter any issues:
1. Check phpMyAdmin error log
2. Check MySQL error log
3. Verify all prerequisites are met
4. Ensure MariaDB/MySQL is running

## Schema Summary

```
Total Tables: 19
Total Foreign Keys: 21
Total Triggers: 7
Total Functions: 2
Total Views: 4
Database Engine: InnoDB (for all tables)
Character Set: utf8mb4
Collation: utf8mb4_general_ci
```

---

**Created**: 2026-01-16
**Version**: 1.0
**Compatible with**: MariaDB 10.4+, MySQL 8.0+
