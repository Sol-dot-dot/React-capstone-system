const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function testMySQLConnection() {
    console.log('Testing MySQL connection...\n');
    console.log('Configuration:');
    console.log('  Host:', process.env.DB_HOST);
    console.log('  User:', process.env.DB_USER);
    console.log('  Password:', process.env.DB_PASSWORD ? '***' : '(empty)');
    console.log('  Database:', process.env.DB_NAME);
    console.log('  Port:', process.env.DB_PORT || 3306);
    console.log('\n');

    try {
        // Test connection without database first
        console.log('[1/3] Testing connection to MySQL server...');
        const connectionWithoutDB = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 3306,
            connectTimeout: 5000
        });
        console.log('✓ Connected to MySQL server successfully!\n');

        // Check if database exists
        console.log('[2/3] Checking if database exists...');
        const [databases] = await connectionWithoutDB.query(
            'SHOW DATABASES LIKE ?',
            [process.env.DB_NAME]
        );

        if (databases.length === 0) {
            console.log('✗ Database "' + process.env.DB_NAME + '" does not exist\n');
            console.log('To create it, run:');
            console.log('  mysql -u root -p -e "CREATE DATABASE ' + process.env.DB_NAME + ';"');
            console.log('  mysql -u root -p ' + process.env.DB_NAME + ' < capstone_system_optimized.sql');
            await connectionWithoutDB.end();
            process.exit(1);
        }

        console.log('✓ Database exists!\n');
        await connectionWithoutDB.end();

        // Test connection with database
        console.log('[3/3] Testing connection to database...');
        const connectionWithDB = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            connectTimeout: 5000
        });

        // Test a simple query
        const [rows] = await connectionWithDB.query('SELECT 1 as test');
        console.log('✓ Database connection successful!\n');

        // Check for tables
        const [tables] = await connectionWithDB.query('SHOW TABLES');
        console.log(`Found ${tables.length} tables in database`);

        if (tables.length === 0) {
            console.log('\n⚠️  Warning: Database is empty. You may need to import the schema:');
            console.log('  mysql -u root -p ' + process.env.DB_NAME + ' < capstone_system_optimized.sql');
        } else {
            console.log('Sample tables:', tables.slice(0, 5).map(t => Object.values(t)[0]).join(', '));
        }

        await connectionWithDB.end();

        console.log('\n✅ All MySQL connection tests passed!');
        console.log('Your backend should be able to connect to the database.');

    } catch (error) {
        console.error('\n❌ MySQL connection failed!');
        console.error('Error:', error.message);
        console.error('\nCommon solutions:');

        if (error.code === 'ECONNREFUSED') {
            console.error('  → MySQL is not running. Start MySQL service.');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('  → Wrong username or password. Check your config.env file.');
        } else if (error.code === 'ETIMEDOUT') {
            console.error('  → Connection timeout. Try using 127.0.0.1 instead of localhost in config.env');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('  → Database does not exist. Create it first.');
        }

        console.error('\nFor detailed help, see: MYSQL_SETUP.md');
        process.exit(1);
    }
}

testMySQLConnection();
