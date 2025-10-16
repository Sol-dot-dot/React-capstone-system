// Test the analytics endpoint directly
const axios = require('axios');

async function testAnalyticsEndpoint() {
  try {
    console.log('🧪 Testing Analytics Endpoint...\n');
    
    // Test the books analytics endpoint
    const response = await axios.get('http://localhost:5000/api/analytics/books', {
      headers: {
        'Authorization': 'Bearer test-token' // You might need a real token
      }
    });
    
    console.log('✅ Analytics endpoint response:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    
    if (response.data.success && response.data.data) {
      const data = response.data.data;
      
      console.log('\n📊 Key Metrics:');
      if (data.keyMetrics) {
        console.log('- Total Books:', data.keyMetrics.totalBooks);
        console.log('- Available Books:', data.keyMetrics.availableBooks);
        console.log('- Borrowed Books:', data.keyMetrics.borrowedBooks);
        console.log('- Overdue Books:', data.keyMetrics.overdueBooks);
      }
      
      console.log('\n📚 Book Status:');
      if (data.bookStatus) {
        data.bookStatus.forEach(status => {
          console.log(`- ${status.status}: ${status.count} (${status.percentage}%)`);
        });
      }
      
      console.log('\n📈 Borrowing Trends:');
      if (data.borrowingTrends) {
        console.log('Recent trends:', data.borrowingTrends.slice(-2));
      }
      
    } else {
      console.log('❌ No data returned or error in response');
      console.log('Response:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Error testing analytics endpoint:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testAnalyticsEndpoint();
