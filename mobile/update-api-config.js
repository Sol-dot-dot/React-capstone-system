#!/usr/bin/env node

/**
 * Script to help update remaining files to use the new API configuration
 * 
 * This script will show you which files still need to be updated and provide
 * the exact changes needed.
 */

const fs = require('fs');
const path = require('path');

// Files that need to be updated
const filesToUpdate = [
  'src/screens/ModernRegisterScreen.js',
  'src/screens/ModernVerificationScreen.js',
  'src/screens/BorrowedBooksScreen.js',
  'src/screens/UltraModernLoginScreen.js',
  'src/screens/ModernLoginScreen.js',
  'src/screens/ModernDashboardScreen.js',
  'src/screens/ModernProfileScreen.js',
  'src/screens/ModernPenaltyScreen.js',
  'src/screens/ModernBorrowedBooksScreen.js',
  'src/screens/ModernForgotPasswordScreen.js',
  'src/screens/PenaltyScreen.js',
  'src/components/ModernChatbotWidget.js',
  'src/components/ChatbotWidget.js',
  'src/services/NotificationService.js',
  'src/services/SimpleNotificationService.js',
];

console.log('📋 Files that need API configuration updates:');
console.log('==============================================\n');

filesToUpdate.forEach((file, index) => {
  const fullPath = path.join(__dirname, file);
  const exists = fs.existsSync(fullPath);
  
  console.log(`${index + 1}. ${file} ${exists ? '✅' : '❌ (not found)'}`);
});

console.log('\n📝 Steps to update each file:');
console.log('=============================\n');

console.log('1. Add import at the top of the file:');
console.log('   import { buildApiUrl, getEndpoint } from \'../config/api\';');
console.log('   (adjust the relative path as needed)\n');

console.log('2. Replace hardcoded URLs like:');
console.log('   \'http://10.0.2.2:5000/api/auth/user/login\'');
console.log('   with:');
console.log('   buildApiUrl(getEndpoint(\'AUTH\', \'USER_LOGIN\'))\n');

console.log('3. For URLs with parameters like:');
console.log('   `http://10.0.2.2:5000/api/user/profile/${userId}`');
console.log('   use:');
console.log('   buildApiUrl(getEndpoint(\'USER\', \'GET_PROFILE\', userId))\n');

console.log('🎯 Quick Reference:');
console.log('===================');
console.log('Available endpoint categories: AUTH, USER, BORROWING, CHATBOT, NOTIFICATIONS');
console.log('See mobile/src/config/api.js for all available endpoints\n');

console.log('💡 Tip: Use your IDE\'s find and replace feature to speed up the process!');
console.log('   Find: http://10.0.2.2:5000');
console.log('   Replace with: buildApiUrl(getEndpoint(\'...\', \'...\'))');
