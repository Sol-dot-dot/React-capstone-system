const bcrypt = require('bcryptjs');
const pool = require('./config/database');

async function resetAdminPassword() {
    const username = 'admin';
    const password = 'password1';

    try {
        // Generate password hash
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        console.log('Generated password hash:', passwordHash);

        // Update admin user in database
        const [result] = await pool.execute(
            `UPDATE users
             SET password_hash = ?,
                 id_number = ?,
                 email = ?
             WHERE role = 'admin' AND id = 1`,
            [passwordHash, 'ADMIN001', 'admin@library.com']
        );

        if (result.affectedRows > 0) {
            console.log('\n✓ Admin credentials updated successfully!');
            console.log('Username: admin@library.com');
            console.log('Password: password1');
        } else {
            console.log('\n✗ No admin user found to update');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error resetting admin password:', error.message);
        process.exit(1);
    }
}

resetAdminPassword();
