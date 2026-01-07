@echo off
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot
set ANDROID_HOME=C:\Users\rhodc\AppData\Local\Android\Sdk
set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%

echo Building Android app...
echo JAVA_HOME: %JAVA_HOME%
echo.

call "%~dp0gradlew.bat" assembleDebug
