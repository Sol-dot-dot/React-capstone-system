# Local Development Guide

## 🏠 **Mobile App is Now Configured for Local Development**

Your mobile app is now configured to use the local backend server instead of the production server.

### 📱 **Current Configuration**
- **API Base URL**: `http://10.0.2.2:5000` (Android emulator)
- **Backend Server**: Running locally on port 5000
- **Status**: ✅ Ready for local development

### 🚀 **How to Test**

#### **1. Start the Backend Server**
```bash
cd C:\clone-local\React-capstone-system\backend
npm start
# or
node server.js
```

#### **2. Start the Mobile App**
```bash
cd C:\clone-local\React-capstone-system\mobile
npx react-native run-android
```

#### **3. Test Login**
- Use any valid credentials from your local database
- The app will now connect to your local backend server
- Check console logs for detailed information

### 🔧 **IP Address Options**

If you need to change the IP address, update `mobile/src/config/api.js`:

```javascript
// For Android Emulator (current setting)
BASE_URL: 'http://10.0.2.2:5000'

// For Physical Device - use your computer's IP
BASE_URL: 'http://192.168.254.100:5000'  // Your main IP
// or
BASE_URL: 'http://172.21.112.1:5000'     // Alternative IP

// For Web Development
BASE_URL: 'http://localhost:5000'

// For Production
BASE_URL: 'https://api.sdd-ds.org'
```

### 🐛 **Troubleshooting**

#### **If login still shows "Signing In..." loading:**

1. **Check Backend Server**: Make sure it's running on port 5000
2. **Check Network**: Ensure your device/emulator can reach the server
3. **Check Console Logs**: Look for network errors in React Native logs
4. **Try Different IP**: Switch to your computer's actual IP address

#### **For Physical Device Testing:**
1. Make sure your phone and computer are on the same WiFi network
2. Use your computer's IP address (192.168.254.100 or 172.21.112.1)
3. Ensure Windows Firewall allows connections on port 5000

### 📊 **Expected Behavior**

- ✅ **Valid Login**: Should work with existing user credentials
- ✅ **Invalid Login**: Should show "Invalid credentials" message
- ✅ **Network Error**: Should show appropriate error message
- ❌ **No More Infinite Loading**: The app should respond properly

### 🔄 **Switching Back to Production**

To switch back to the production server, simply change the BASE_URL in `api.js`:

```javascript
BASE_URL: 'https://api.sdd-ds.org', // Production
// BASE_URL: 'http://10.0.2.2:5000', // Local (commented out)
```

### 📝 **Next Steps**

1. **Test the app** with the local backend
2. **Verify login works** with your local database
3. **Check all features** are working properly
4. **Deploy to production** when ready

The mobile app should now work properly with your local backend server!






