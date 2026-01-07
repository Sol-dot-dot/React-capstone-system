# Android Development Setup Guide

## Current Issue
Your React Native mobile app cannot run because:
- ✖ Android SDK environment variables not configured
- ✖ No Android Virtual Device (emulator) created
- ✖ Java JDK not in PATH

## Quick Fix (Temporary - For This Session Only)

Run this command in PowerShell:
```powershell
cd mobile
. .\setup-android-env.ps1
```

Then try running the app again:
```powershell
npm run android
```

## Permanent Fix (Recommended)

### Step 1: Set Environment Variables Permanently

1. **Open System Environment Variables:**
   - Press `Windows + R`
   - Type: `sysdm.cpl`
   - Press Enter
   - Click "Environment Variables" button

2. **Add New System Variables:**
   Click "New" under "System variables" and add:

   **Variable 1:**
   - Name: `ANDROID_HOME`
   - Value: `C:\Users\rhodc\AppData\Local\Android\Sdk`

   **Variable 2:**
   - Name: `JAVA_HOME`
   - Value: `C:\Program Files\Android\Android Studio\jbr`

3. **Update PATH Variable:**
   - Find "Path" in System variables
   - Click "Edit"
   - Click "New" and add each of these lines:
     ```
     %ANDROID_HOME%\platform-tools
     %ANDROID_HOME%\emulator
     %ANDROID_HOME%\tools
     %ANDROID_HOME%\tools\bin
     %JAVA_HOME%\bin
     ```
   - Click "OK" on all dialogs

4. **Restart your terminal/PowerShell** for changes to take effect

### Step 2: Create an Android Virtual Device (Emulator)

1. **Open Android Studio**
2. Click on "More Actions" or "Configure" → "AVD Manager"
3. Click "Create Virtual Device"
4. Choose a device (recommended: Pixel 5 or Pixel 6)
5. Select a system image (recommended: API Level 33 or 34)
6. Click "Next" and "Finish"

**OR use command line:**
```powershell
# After setting up environment variables, run:
sdkmanager "system-images;android-34;google_apis;x86_64"
avdmanager create avd -n Pixel_5_API_34 -k "system-images;android-34;google_apis;x86_64" -d "pixel_5"
```

### Step 3: Verify Setup

After setting environment variables, restart PowerShell and run:
```powershell
adb version
java -version
emulator -list-avds
```

All commands should work without errors.

### Step 4: Run the Mobile App

```powershell
cd mobile
npm run android
```

## Alternative: Use Physical Android Device

If you don't want to use an emulator:

1. Enable Developer Options on your Android phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times

2. Enable USB Debugging:
   - Go to Settings → Developer Options
   - Enable "USB Debugging"

3. Connect your phone via USB

4. Run:
   ```powershell
   adb devices
   ```
   - You should see your device listed

5. Run the app:
   ```powershell
   npm run android
   ```

## Troubleshooting

### "adb is not recognized"
- Make sure you've set the environment variables
- Restart your terminal/PowerShell
- Check that `%ANDROID_HOME%\platform-tools` is in your PATH

### "No emulators found"
- Create an emulator using Android Studio AVD Manager
- Or use a physical device

### "Build failed"
- Make sure Java is in PATH (`java -version` should work)
- Try: `cd android && ./gradlew clean`
- Then run `npm run android` again

### Port 8081 already in use
- Kill the Metro bundler: `npx react-native start --reset-cache`
- Or kill the process using port 8081

## Quick Commands Reference

```powershell
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Clear cache
npx react-native start --reset-cache

# List connected devices
adb devices

# List emulators
emulator -list-avds

# Start specific emulator
emulator -avd Pixel_5_API_34
```
