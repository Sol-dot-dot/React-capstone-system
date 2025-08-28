@echo off
echo ========================================
echo Capstone System Setup Script
echo ========================================
echo.

echo Installing root dependencies...
npm install

echo.
echo Installing backend dependencies...
cd backend
npm install
cd ..

echo.
echo Installing web dependencies...
cd web
npm install
cd ..

echo.
echo Installing mobile dependencies...
cd mobile
npm install
cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Set up MySQL database using backend/database.sql
echo 2. Configure backend/config.env with your settings
echo 3. Start backend: cd backend && npm run dev
echo 4. Start web: cd web && npm start
echo 5. Start mobile: cd mobile && npx react-native run-android
echo.
pause
