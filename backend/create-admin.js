/**
 * Create Admin User Script
 * Creates an admin user with proper password hashing
 */

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function createAdmin() {
  let connection;

  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });

    console.log('✓ Connected to database');

    // Admin credentials
    const adminData = {
      id_number: 'admin',
      email: 'admin@library.com',
      password: 'admin123',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin'
    };

    // Check if admin already exists
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE id_number = ? OR email = ?',
      [adminData.id_number, adminData.email]
    );

    if (existing.length > 0) {
      console.log('⚠ Admin user already exists!');
      console.log(`   ID Number: ${adminData.id_number}`);
      console.log(`   Email: ${adminData.email}`);

      // Ask if user wants to update password
      console.log('\nUpdating password...');
      const hashedPassword = await bcrypt.hash(adminData.password, 10);

      await connection.execute(
        'UPDATE users SET password_hash = ?, is_verified = 1, email_verified = 1 WHERE id_number = ?',
        [hashedPassword, adminData.id_number]
      );

      console.log('✓ Admin password updated successfully!');
    } else {
      // Hash the password
      console.log('Hashing password...');
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      console.log('✓ Password hashed');

      // Insert admin user
      console.log('Creating admin user...');
      const [result] = await connection.execute(
        `INSERT INTO users
        (id_number, email, password_hash, first_name, last_name, role, is_verified, email_verified)
        VALUES (?, ?, ?, ?, ?, ?, 1, 1)`,
        [
          adminData.id_number,
          adminData.email,
          hashedPassword,
          adminData.first_name,
          adminData.last_name,
          adminData.role
        ]
      );

      console.log('✓ Admin user created successfully!');
    }

    // Display login credentials
    console.log('\n================================');
    console.log('ADMIN LOGIN CREDENTIALS');
    console.log('================================');
    console.log(`Email/ID:  ${adminData.email}`);
    console.log(`ID Number: ${adminData.id_number}`);
    console.log(`Password:  ${adminData.password}`);
    console.log('================================\n');

    // Verify the user was created
    const [users] = await connection.execute(
      'SELECT id, id_number, email, first_name, last_name, role, is_verified FROM users WHERE role = "admin"'
    );

    console.log('Current admin users:');
    console.table(users);

  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✓ Database connection closed');
    }
  }
}

// Run the script
createAdmin();
