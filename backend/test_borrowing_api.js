const axios = require('axios');

async function testBorrowingAPI() {
    try {
        console.log('Testing borrowing API...');
        
        // First, let's test the validation endpoint
        console.log('\n1. Testing validation endpoint...');
        const validationResponse = await axios.post('http://localhost:5000/api/borrowing/validate', {
            studentIdNumber: 'C22-0044',
            bookCodes: ['BK-5832']
        });
        
        console.log('Validation response:', validationResponse.data);
        
        // Now test the borrowing endpoint (this will fail without auth token)
        console.log('\n2. Testing borrowing endpoint...');
        try {
            const borrowResponse = await axios.post('http://localhost:5000/api/borrowing/borrow', {
                studentIdNumber: 'C22-0044',
                bookCodes: ['BK-5832'],
                dueDate: null
            });
            
            console.log('Borrowing response:', borrowResponse.data);
        } catch (error) {
            console.log('Borrowing endpoint error (expected without auth):', error.response?.data || error.message);
        }
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testBorrowingAPI();
