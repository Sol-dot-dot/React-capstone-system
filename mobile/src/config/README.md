# API Configuration

This folder contains the centralized API configuration for the mobile app.

## Files

- `api.js` - Main API configuration file

## How to Change the IP Address

To change the API server IP address, simply edit the `BASE_URL` in `mobile/src/config/api.js`:

```javascript
const API_CONFIG = {
  // Change this line to your desired IP address
  BASE_URL: 'http://10.0.2.2:5000', // Android emulator default
  // BASE_URL: 'http://localhost:5000', // For iOS simulator
  // BASE_URL: 'http://192.168.1.100:5000', // For physical device (replace with your computer's IP)
  // BASE_URL: 'https://your-production-domain.com', // For production
  // ... rest of config
};
```

## Common IP Addresses

- **Android Emulator**: `http://10.0.2.2:5000`
- **iOS Simulator**: `http://localhost:5000`
- **Physical Device**: `http://YOUR_COMPUTER_IP:5000` (e.g., `http://192.168.1.100:5000`)
- **Production**: `https://your-domain.com`

## How to Find Your Computer's IP Address

### Windows:
1. Open Command Prompt
2. Type: `ipconfig`
3. Look for "IPv4 Address" under your network adapter

### Mac/Linux:
1. Open Terminal
2. Type: `ifconfig` or `ip addr show`
3. Look for your network interface IP address

## Usage in Components

Import the configuration in your components:

```javascript
import { buildApiUrl, getEndpoint } from '../config/api';

// For simple endpoints
const response = await axios.post(buildApiUrl(getEndpoint('AUTH', 'USER_LOGIN')), data);

// For endpoints with parameters
const response = await axios.get(buildApiUrl(getEndpoint('USER', 'GET_PROFILE', userId)));
```

## Benefits

- ✅ Easy to change IP address in one place
- ✅ Centralized endpoint management
- ✅ Type-safe endpoint references
- ✅ Easy to switch between development and production
- ✅ Consistent API structure across the app
