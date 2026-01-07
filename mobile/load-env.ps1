# Load Android Environment Variables into Current Session
# Run this with: . .\load-env.ps1

Write-Host "Loading Android environment variables..." -ForegroundColor Green

$env:ANDROID_HOME = "C:\Users\rhodc\AppData\Local\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:Path = "$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\tools\bin;$env:JAVA_HOME\bin;$env:Path"

Write-Host "Environment variables loaded!" -ForegroundColor Green
Write-Host ""
Write-Host "Verifying..." -ForegroundColor Cyan
Write-Host "ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor Yellow
Write-Host "JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Yellow
Write-Host ""
Write-Host "Testing adb..." -ForegroundColor Cyan
adb version
Write-Host ""
Write-Host "You can now run: npm run android" -ForegroundColor Green
