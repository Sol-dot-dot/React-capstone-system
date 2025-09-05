@echo off
echo Setting up Smart Notifications System...
echo.

echo Installing backend dependencies...
cd backend
npm install
echo.

echo Installing mobile dependencies...
cd ..\mobile
npm install
echo.

echo Smart Notifications System Setup Complete!
echo.
echo Features implemented:
echo - Email notifications with HTML templates
echo - Smart scheduling (1 day before, due today, overdue)
echo - Notification settings management
echo - Bulk notification processing for admins
echo - In-app alerts for urgent notifications
echo.
echo Next steps:
echo 1. Run: cd backend && npm run dev
echo 2. Run: cd mobile && npm install
echo 3. For Android: npx react-native run-android
echo 4. Configure email settings in backend/config.env
echo.
pause
