const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 30000, // 30 seconds
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test connection on startup
pool.getConnection()
    .then(connection => {
        console.log('[OK] MySQL database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('[ERROR] MySQL connection failed:', err.message);
        console.error('[INFO] Make sure MySQL is running and the database exists');
        console.error('[INFO] You can create the database by running:');
        console.error('  mysql -u root -p -e "CREATE DATABASE capstone_system_optimized;"');
        console.error('  mysql -u root -p capstone_system_optimized < capstone_system_optimized.sql');
    });

module.exports = pool;
