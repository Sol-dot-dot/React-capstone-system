// API Configuration
// Change the IP address here to easily switch between development and production environments

const API_CONFIG = {
  // Base URL - Change this IP address to match your backend server
  //BASE_URL: 'http://10.0.2.2:5000', // Android emulator - this is working
  // BASE_URL: 'http://localhost:5000', // Try localhost first
  //BASE_URL: 'http://172.27.128.1:5000', // Add http:// // For physical device (replace with your computer's IP)
  BASE_URL: 'https://api.sdd-ds.org', // For production
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication endpoints
    AUTH: {
      USER_LOGIN: '/api/auth/user/login',
      USER_CHECK_ID: '/api/auth/user/check-id',
      USER_CHECK_EMAIL: '/api/auth/user/check-email',
      USER_VERIFY_CODE: '/api/auth/user/verify-code',
      USER_COMPLETE_REGISTRATION: '/api/auth/user/complete-registration',
      USER_REQUEST_PASSWORD_RESET: '/api/auth/user/request-password-reset',
      USER_VERIFY_RESET_CODE: '/api/auth/user/verify-reset-code',
      USER_RESET_PASSWORD: '/api/auth/user/reset-password',
    },

    // User profile endpoints
    USER: {
      GET_PROFILE: (idNumber) => `/api/user/profile/${idNumber}`,
      UPDATE_PROFILE: (idNumber) => `/api/user/profile/${idNumber}`,
      CHANGE_PASSWORD: (idNumber) => `/api/user/change-password/${idNumber}`,
    },

    // Borrowing endpoints
    BORROWING: {
      GET_USER_BORROWED_BOOKS: (idNumber) => `/api/borrowing/user/${idNumber}`,
    },

    // Chatbot endpoints
    CHATBOT: {
      SEND_MESSAGE: '/api/chatbot/recommend',
      PERSONALIZED: '/api/chatbot/personalized',
      USER_KNOWLEDGE: (idNumber) => `/api/chatbot/user-knowledge/${idNumber}`,
      CONVERSATION_STARTER: (idNumber) => `/api/chatbot/conversation-starter/${idNumber}`,
    },

    // Notifications endpoints
    NOTIFICATIONS: {
      GET_SETTINGS: (idNumber) => `/api/notifications/settings/${idNumber}`,
      UPDATE_SETTINGS: (idNumber) => `/api/notifications/settings/${idNumber}`,
    },

    // Penalty endpoints
    PENALTY: {
      GET_USER_PENALTIES: (idNumber) => `/api/penalty/user/${idNumber}`,
    },
  },

  // Request timeout (in milliseconds)
  TIMEOUT: 10000,

  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Helper function to build full URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get endpoint with parameters
export const getEndpoint = (category, endpoint, ...params) => {
  const endpointPath = API_CONFIG.ENDPOINTS[category][endpoint];
  if (typeof endpointPath === 'function') {
    return endpointPath(...params);
  }
  return endpointPath;
};

// Export the main config
export default API_CONFIG;
