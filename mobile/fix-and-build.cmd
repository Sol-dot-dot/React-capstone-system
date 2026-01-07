@echo off
echo Fixing Gradle build issue...
echo.

REM Set environment variables
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set ANDROID_HOME=C:\Users\rhodc\AppData\Local\Android\Sdk
set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator;%PATH%

echo JAVA_HOME: %JAVA_HOME%
echo ANDROID_HOME: %ANDROID_HOME%
echo.

echo Cleaning Gradle cache...
if exist "%USERPROFILE%\.gradle\caches" (
    rd /s /q "%USERPROFILE%\.gradle\caches"
    echo Gradle cache cleared
)
echo.

echo Cleaning Android build...
cd android
call gradlew.bat clean
cd ..
echo.

echo Build cleaned! Now running: npm run android
npm run android
