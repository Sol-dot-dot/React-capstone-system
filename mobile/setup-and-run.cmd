@echo off
REM Android Environment Setup and Run Script

echo Setting up Android environment...

REM Set Android SDK Path
set ANDROID_HOME=C:\Users\rhodc\AppData\Local\Android\Sdk
echo ANDROID_HOME set to: %ANDROID_HOME%

REM Set Java JDK Path
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
echo JAVA_HOME set to: %JAVA_HOME%

REM Add to PATH
set PATH=%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator;%ANDROID_HOME%\tools;%ANDROID_HOME%\tools\bin;%JAVA_HOME%\bin;%PATH%

echo.
echo Environment setup complete!
echo.

REM Check if user wants to run the app
set /p RUNAPP="Do you want to run the Android app now? (y/n): "
if /i "%RUNAPP%"=="y" (
    echo.
    echo Starting Android app...
    npm run android
) else (
    echo.
    echo Environment is set up. You can now run: npm run android
)

pause
