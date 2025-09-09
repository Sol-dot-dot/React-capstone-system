const mysql = require('mysql2/promise');
const { validateBorrowingRequest, processBorrowing } = require('./utils/borrowingUtils');

async function testBorrowing() {
    let connection;
    try {
        // Test database connection
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '', // Add password if needed
            database: 'capstone_system'
        });

        console.log('✅ Database connected successfully');

        // Test student lookup
        const [students] = await connection.execute(
            'SELECT id_number, email, is_verified FROM users WHERE id_number = ?',
            ['C22-0045']
        );

        console.log('📚 Student lookup result:', students);

        // Test book lookup
        const [books] = await connection.execute(
            'SELECT id, title, author, number_code, status FROM books WHERE number_code IN (?, ?, ?)',
            ['BK-8049', 'BK-583', 'BK-6360']
        );

        console.log('📖 Books lookup result:', books);

        // Test system settings
        const [settings] = await connection.execute(
            'SELECT setting_key, setting_value FROM system_settings'
        );

        console.log('⚙️ System settings:', settings);

        // Test validation
        console.log('\n🔍 Testing validation...');
        const validation = await validateBorrowingRequest('C22-0045', ['BK-8049', 'BK-583', 'BK-6360']);
        console.log('✅ Validation result:', validation);

    } catch (error) {
        console.error('❌ Test error:', error.message);
        console.error('Error details:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testBorrowing();
