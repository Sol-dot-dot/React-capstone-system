@echo off
echo ========================================
echo Fixing Gradle Java Version Issue
echo ========================================
echo.

REM Set environment variables
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set ANDROID_HOME=C:\Users\rhodc\AppData\Local\Android\Sdk
set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator;%PATH%

echo [1/5] Environment variables set
echo JAVA_HOME: %JAVA_HOME%
echo.

echo [2/5] Stopping all Gradle daemons...
cd android
call gradlew.bat --stop
cd ..
timeout /t 3 /nobreak >nul
echo.

echo [3/5] Killing any remaining Java processes...
taskkill /F /IM java.exe /T 2>nul
timeout /t 2 /nobreak >nul
echo.

echo [4/5] Clearing Gradle cache...
rd /s /q "%USERPROFILE%\.gradle\caches" 2>nul
rd /s /q "%USERPROFILE%\.gradle\daemon" 2>nul
echo Gradle cache cleared
echo.

echo [5/5] Cleaning Android build folder...
rd /s /q "android\build" 2>nul
rd /s /q "android\app\build" 2>nul
echo Build folders cleaned
echo.

echo ========================================
echo Verifying Java version...
echo ========================================
"%JAVA_HOME%\bin\java" -version
echo.

echo ========================================
echo Setup complete! Now building app...
echo ========================================
echo.

cd android
gradlew.bat assembleDebug
cd ..
