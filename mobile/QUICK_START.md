# Quick Start - Mobile App

## ✅ Good News!
- Android Studio: **Installed**
- Android SDK: **Installed**
- Java JDK: **Installed** (bundled with Android Studio)
- Android Emulator: **Already Created** (Medium_Phone)

## ❌ Issue
Environment variables are not configured, so the system can't find the Android tools.

## 🚀 Quick Solution (Choose One)

### Option 1: Run with Setup Script (Easiest)

**In PowerShell (in the mobile directory):**
```powershell
.\setup-and-run.cmd
```

This will:
1. Set up environment variables for this session
2. Ask if you want to run the app
3. Launch the Android app

### Option 2: Manual Setup (Permanent)

1. **Set Environment Variables:**
   - Press `Windows + R`
   - Type `sysdm.cpl` and press Enter
   - Click "Environment Variables"
   - Add these System Variables:
     - `ANDROID_HOME` = `C:\Users\rhodc\AppData\Local\Android\Sdk`
     - `JAVA_HOME` = `C:\Program Files\Android\Android Studio\jbr`
   - Edit PATH and add:
     - `%ANDROID_HOME%\platform-tools`
     - `%ANDROID_HOME%\emulator`
     - `%JAVA_HOME%\bin`

2. **Restart PowerShell**

3. **Run the app:**
   ```powershell
   npm run android
   ```

## 📱 Running the App

### With Emulator (Automatic)
```powershell
npm run android
```
The emulator will start automatically if not already running.

### With Physical Device
1. Enable USB Debugging on your Android phone
2. Connect via USB
3. Run: `npm run android`

## 🔍 Verify Setup

After setting up environment variables, test:
```powershell
adb version          # Should show ADB version
java -version        # Should show Java version
emulator -list-avds  # Should list: Medium_Phone
```

## 📋 Available Scripts

```powershell
npm start            # Start Metro bundler
npm run android      # Run on Android device/emulator
npm run ios          # Run on iOS (macOS only)
npm run lint         # Run linter
npm test             # Run tests
```

## ⚠️ Common Issues

### "adb is not recognized"
→ Environment variables not set. Use `setup-and-run.cmd` or set them manually.

### "No emulators found"
→ Your emulator exists! The environment just needs to be configured.

### "BUILD FAILED"
→ Run: `cd android && .\gradlew clean && cd ..` then try again.

### Metro bundler port 8081 in use
→ Run: `npx react-native start --reset-cache`

## 📞 Next Steps

1. Run the setup script: `.\setup-and-run.cmd`
2. Wait for the emulator to start (first time takes 2-3 minutes)
3. The app will automatically install and launch
4. You should see the mobile app running!

**Need help?** Check [ANDROID_SETUP_GUIDE.md](./ANDROID_SETUP_GUIDE.md) for detailed instructions.
