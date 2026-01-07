# Fix Gradle Java Version Issue and Run Android App

Write-Host "Fixing Gradle Java version issue..." -ForegroundColor Green

# Set JAVA_HOME to Android Studio's bundled JDK
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
Write-Host "JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Yellow

# Set Android environment variables
$env:ANDROID_HOME = "C:\Users\rhodc\AppData\Local\Android\Sdk"
Write-Host "ANDROID_HOME set to: $env:ANDROID_HOME" -ForegroundColor Yellow

# Add to PATH
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\tools\bin;$env:PATH"
Write-Host "PATH updated" -ForegroundColor Yellow

Write-Host "`nVerifying Java setup..." -ForegroundColor Cyan
java -version

Write-Host "`nClearing Gradle cache..." -ForegroundColor Cyan
if (Test-Path "$env:USERPROFILE\.gradle\caches") {
    Remove-Item -Path "$env:USERPROFILE\.gradle\caches" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Gradle cache cleared" -ForegroundColor Green
}

Write-Host "`nCleaning Android build..." -ForegroundColor Cyan
cd android
.\gradlew clean
cd ..

Write-Host "`nSetup complete! Running Android app..." -ForegroundColor Green
npm run android
