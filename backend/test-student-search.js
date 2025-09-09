const mysql = require('mysql2/promise');
const { checkStudentExists } = require('./utils/borrowingUtils');

async function testStudentSearch() {
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
        const testStudentId = 'C22-0046';
        console.log(`🔍 Testing student lookup for: ${testStudentId}`);
        
        const student = await checkStudentExists(testStudentId);
        console.log('📚 Student lookup result:', student);

        if (!student) {
            console.log('❌ Student not found. Let\'s check what students exist...');
            
            const [allStudents] = await connection.execute(
                'SELECT id_number, email, is_verified FROM users LIMIT 10'
            );
            console.log('📋 Available students:', allStudents);
        } else {
            console.log('✅ Student found!');
            
            // Check if student has borrowed books
            const [borrowedBooks] = await connection.execute(
                `SELECT 
                    bt.id,
                    bt.borrowed_at,
                    bt.due_date,
                    bt.status,
                    b.title,
                    b.author,
                    b.number_code
                 FROM borrowing_transactions bt
                 JOIN books b ON bt.book_id = b.id
                 WHERE bt.student_id_number = ? 
                 AND bt.status IN ('borrowed', 'overdue')
                 ORDER BY bt.due_date ASC`,
                [testStudentId]
            );
            
            console.log('📖 Borrowed books:', borrowedBooks);
        }

    } catch (error) {
        console.error('❌ Test error:', error.message);
        console.error('Error details:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testStudentSearch();
