// Test script for analytics endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAnalytics() {
  try {
    console.log('Testing Analytics Endpoints...\n');

    // Test dashboard analytics
    console.log('1. Testing Dashboard Analytics...');
    const dashboardResponse = await axios.get(`${BASE_URL}/api/analytics/dashboard?range=3months`);
    console.log('Dashboard Analytics Status:', dashboardResponse.status);
    console.log('Dashboard Data Keys:', Object.keys(dashboardResponse.data.data));
    console.log('User Growth Sample:', dashboardResponse.data.data.userGrowth?.slice(0, 2));
    console.log('Book Categories Sample:', dashboardResponse.data.data.bookCategories?.slice(0, 2));
    console.log('');

    // Test user analytics
    console.log('2. Testing User Analytics...');
    const userResponse = await axios.get(`${BASE_URL}/api/analytics/users?range=3months`);
    console.log('User Analytics Status:', userResponse.status);
    console.log('User Data Keys:', Object.keys(userResponse.data.data));
    console.log('Registration Trends Sample:', userResponse.data.data.registrationTrends?.slice(0, 2));
    console.log('');

    // Test book analytics
    console.log('3. Testing Book Analytics...');
    const bookResponse = await axios.get(`${BASE_URL}/api/analytics/books?range=3months&category=all`);
    console.log('Book Analytics Status:', bookResponse.status);
    console.log('Book Data Keys:', Object.keys(bookResponse.data.data));
    console.log('Borrowing Trends Sample:', bookResponse.data.data.borrowingTrends?.slice(0, 2));
    console.log('');

    console.log('✅ All analytics endpoints are working!');

  } catch (error) {
    console.error('❌ Error testing analytics:', error.response?.data || error.message);
  }
}

// Run the test
testAnalytics();
