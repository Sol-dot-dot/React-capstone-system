const axios = require('axios');

async function testPaymentEndpoint() {
  try {
    console.log('🧪 Testing payment endpoint...');
    
    // First, let's try to login to get a token
    console.log('🔐 Attempting to login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@capstone.com',
      password: 'admin123'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      const token = loginResponse.data.token;
      
      // Now test the payment endpoint
      console.log('💳 Testing payment endpoint for C22-0045...');
      const paymentResponse = await axios.post(
        'http://localhost:5000/api/penalty/mark-paid/C22-0045',
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Payment response:', paymentResponse.data);
      
    } else {
      console.log('❌ Login failed:', loginResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.details) {
      console.error('❌ Error details:', error.response.data.details);
    }
  }
}

testPaymentEndpoint();
