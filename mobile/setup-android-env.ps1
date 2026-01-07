# Android Development Environment Setup Script
# This script sets up environment variables for React Native Android development

Write-Host "Setting up Android development environment..." -ForegroundColor Green

# Android SDK Path
$env:ANDROID_HOME = "C:\Users\rhodc\AppData\Local\Android\Sdk"
Write-Host "ANDROID_HOME set to: $env:ANDROID_HOME" -ForegroundColor Yellow

# Java JDK Path (bundled with Android Studio)
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
Write-Host "JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Yellow

# Add Android SDK tools to PATH
$env:PATH = "$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\tools\bin;$env:JAVA_HOME\bin;$env:PATH"
Write-Host "PATH updated with Android SDK tools" -ForegroundColor Yellow

Write-Host "`nEnvironment setup complete!" -ForegroundColor Green
Write-Host "`nVerifying installations:" -ForegroundColor Cyan

# Test commands
Write-Host "`nChecking adb..." -ForegroundColor Cyan
adb version

Write-Host "`nChecking Java..." -ForegroundColor Cyan
java -version

Write-Host "`nListing available emulators..." -ForegroundColor Cyan
emulator -list-avds

Write-Host "`nNOTE: These environment variables are only set for this PowerShell session." -ForegroundColor Yellow
Write-Host "To make them permanent, you need to set them in System Environment Variables." -ForegroundColor Yellow
Write-Host "`nRun this script before starting your React Native development:" -ForegroundColor Cyan
Write-Host "  . .\setup-android-env.ps1" -ForegroundColor White
