@echo off
echo ========================================
echo Installing Java 17 (Eclipse Temurin)
echo ========================================
echo.

echo Downloading Java 17 installer...
curl -L -o "%TEMP%\OpenJDK17.msi" "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.9%%2B9/OpenJDK17U-jdk_x64_windows_hotspot_17.0.9_9.msi"

if %ERRORLEVEL% NEQ 0 (
    echo Failed to download Java 17 installer.
    pause
    exit /b 1
)

echo.
echo Installing Java 17...
echo This will open the installer. Please follow the installation wizard.
echo IMPORTANT: Note the installation path (typically C:\Program Files\Eclipse Adoptium\jdk-17.0.9.9-hotspot\)
echo.
pause

msiexec /i "%TEMP%\OpenJDK17.msi"

echo.
echo ========================================
echo Installation complete!
echo ========================================
echo.
echo Next steps:
echo 1. Note the Java 17 installation path from the installer
echo 2. Press any key to continue configuration
pause

echo.
echo Please enter the Java 17 installation path (e.g., C:\Program Files\Eclipse Adoptium\jdk-17.0.9.9-hotspot):
set /p JAVA17_PATH="Path: "

echo.
echo Verifying Java 17 installation...
"%JAVA17_PATH%\bin\java" -version

if %ERRORLEVEL% NEQ 0 (
    echo Failed to verify Java 17 installation at: %JAVA17_PATH%
    echo Please check the path and try again.
    pause
    exit /b 1
)

echo.
echo Java 17 verified successfully!
echo Installation path: %JAVA17_PATH%
echo.
echo The gradle.properties file will be updated automatically.
pause
