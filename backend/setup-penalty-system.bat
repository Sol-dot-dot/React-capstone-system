@echo off
echo Setting up Penalty and Rules System...
echo.

echo Step 1: Installing additional dependencies...
npm install

echo.
echo Step 2: Setting up database tables for penalty system...
echo Please make sure your MySQL server is running and the database is accessible.
echo.

mysql -u root -p capstone_system < penalty-system.sql

if %errorlevel% equ 0 (
    echo.
    echo ✅ Penalty system database setup completed successfully!
    echo.
    echo The following features have been added:
    echo - System settings for configurable borrowing rules
    echo - Fines tracking for overdue books (5 pesos per day)
    echo - Semester tracking for 20 books requirement
    echo - Student borrowing status management
    echo - Fine payment processing
    echo.
    echo You can now:
    echo 1. Start the backend server: npm start
    echo 2. Access the admin panel to manage penalty settings
    echo 3. Use the mobile app to view penalty information
    echo.
) else (
    echo.
    echo ❌ Error setting up penalty system database.
    echo Please check your MySQL connection and try again.
    echo.
)

pause
