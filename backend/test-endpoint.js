const axios = require('axios');

async function testEndpoint() {
  try {
    console.log('Testing if backend server is running...');
    
    // Test if server is running
    const response = await axios.get('http://localhost:5000/api/penalty/stats', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('Server is running, response:', response.status);
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running on port 5000');
    } else {
      console.log('✅ Backend server is running, but got error:', error.response?.status, error.response?.data?.message);
    }
  }
}

testEndpoint();
