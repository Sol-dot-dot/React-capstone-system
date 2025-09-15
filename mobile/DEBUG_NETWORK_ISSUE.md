# Debug Network Connectivity Issue

## Problem
The mobile app is showing "Network Error" when trying to load dashboard data. The error occurs in the `loadDashboardData` function when making API calls to the backend.

## Root Cause Analysis
The error is likely due to one of these issues:
1. **Network Configuration**: Mobile app can't reach `10.0.2.2:5000`
2. **Backend Server**: Server might not be accessible from mobile device/emulator
3. **CORS Issues**: Cross-origin requests might be blocked
4. **Firewall/Network**: Local network blocking the connection

## Debugging Steps

### 1. Check Backend Server Status
```bash
# In backend directory
cd backend
node server.js
```
Verify the server is running and accessible at `http://localhost:5000`

### 2. Test API Endpoints Directly
```bash
# Test the specific endpoint
curl -X GET "http://localhost:5000/api/borrowing/user/C22-0044"
```

### 3. Use the Network Test Component
I've added a temporary "Debug Network" section to the dashboard. Use this to:
- Test basic connectivity to `10.0.2.2:5000`
- Test the API URL building function
- See detailed error messages

### 4. Check Mobile App Configuration

#### For Android Emulator:
- `10.0.2.2` should map to `localhost` on your host machine
- Make sure the emulator is running

#### For Physical Device:
- Change the API base URL in `mobile/src/config/api.js`:
```javascript
BASE_URL: 'http://YOUR_COMPUTER_IP:5000', // Replace with your computer's IP
```

#### For iOS Simulator:
- Change the API base URL to:
```javascript
BASE_URL: 'http://localhost:5000',
```

### 5. Common Solutions

#### Solution 1: Update API Configuration
Edit `mobile/src/config/api.js` and try different base URLs:

```javascript
const API_CONFIG = {
  // Try these in order:
  BASE_URL: 'http://10.0.2.2:5000', // Android emulator
  // BASE_URL: 'http://localhost:5000', // iOS simulator
  // BASE_URL: 'http://192.168.1.100:5000', // Physical device (replace with your IP)
  // BASE_URL: 'http://172.20.10.2:5000', // Another common IP range
};
```

#### Solution 2: Check Your Computer's IP
```bash
# Windows
ipconfig

# Look for your local network IP (usually 192.168.x.x or 172.x.x.x)
```

#### Solution 3: Enable Network Access on Backend
Make sure your backend server is listening on all interfaces:

```javascript
// In server.js, make sure it's:
app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});
```

#### Solution 4: Check Firewall
- Windows Firewall might be blocking port 5000
- Antivirus software might be blocking the connection
- Try temporarily disabling firewall to test

### 6. Testing the Fix

1. **Open the mobile app** and go to the dashboard
2. **Look for the "Debug Network" section** (temporary)
3. **Tap "Test Connection"** to see detailed results
4. **Check the console logs** for detailed error information
5. **Try different API base URLs** based on the test results

### 7. Expected Results

After fixing the network issue, you should see:
- ✅ Connected status in the network test
- ✅ Real data loading in the dashboard stats
- ✅ No more "Network Error" alerts
- ✅ Pull-to-refresh working with real data

### 8. Remove Debug Components

Once the network issue is fixed, remove the debug components:
1. Remove `NetworkTest` import and component from `UltraModernDashboardScreen.js`
2. Remove the "Debug Network" section from the dashboard
3. Delete `mobile/src/components/NetworkTest.js`

## Additional Notes

- The app now has **graceful fallbacks** - it won't crash if the API is unavailable
- **Offline mode warning** will show when API is not accessible
- **Individual API failures** are handled gracefully without showing error alerts
- **Console logging** provides detailed debugging information

## Next Steps

1. Try the network test in the mobile app
2. Check the console logs for specific error details
3. Update the API configuration based on your setup
4. Test the pull-to-refresh functionality once connectivity is restored
