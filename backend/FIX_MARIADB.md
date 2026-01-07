# Fix MariaDB Connection Error

## Error
```
Host 'localhost' is not allowed to connect to this MariaDB server
Error Code: ER_HOST_NOT_PRIVILEGED (1130)
```

## Cause
The MariaDB root user doesn't have permission to connect from 'localhost'. This happens when:
1. MariaDB was installed with restricted root access
2. Root user only has privileges for specific hosts (like 127.0.0.1 or ::1)
3. Root user was deleted/modified

## Solution

### Option 1: Using MySQL Workbench (Easiest)

1. **Open MySQL Workbench**

2. **Connect using the connection that works** (might need to use a different host)
   - Try these combinations:
     - Host: `127.0.0.1`, User: `root`
     - Host: `::1`, User: `root`
     - Or whatever connection you have configured

3. **Run the fix script:**
   - File → Run SQL Script
   - Select: `fix-mariadb-permissions.sql`
   - Execute

4. **Verify the fix:**
   ```sql
   SELECT User, Host FROM mysql.user WHERE User='root';
   ```
   You should see a row with `root | localhost`

### Option 2: Using Command Line

```powershell
# Navigate to backend directory
cd C:\Projects\capstone_2\React-capstone-system\backend

# Connect to MariaDB (adjust path if needed)
mysql -u root -p

# Run these commands in the MariaDB prompt:
```

```sql
CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
exit;
```

### Option 3: If You Can't Connect at All

If you can't connect to MariaDB with any method:

1. **Stop MariaDB Service:**
   ```powershell
   net stop MariaDB
   # Or: net stop MySQL
   ```

2. **Start MariaDB in safe mode (skip grant tables):**
   - Find your MariaDB installation directory
   - Usually: `C:\Program Files\MariaDB X.X\bin\`
   - Run:
   ```powershell
   cd "C:\Program Files\MariaDB X.X\bin"
   .\mysqld.exe --skip-grant-tables --skip-networking
   ```

3. **In a NEW terminal, connect without password:**
   ```powershell
   mysql -u root
   ```

4. **Fix privileges:**
   ```sql
   FLUSH PRIVILEGES;
   CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY '';
   GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
   FLUSH PRIVILEGES;
   exit;
   ```

5. **Stop the safe mode server (Ctrl+C in first terminal)**

6. **Start MariaDB normally:**
   ```powershell
   net start MariaDB
   ```

## After Fixing Permissions

1. **Create the database:**
   ```sql
   CREATE DATABASE IF NOT EXISTS capstone_system_optimized;
   ```

2. **Import the schema:**
   - In MySQL Workbench: File → Run SQL Script → `capstone_system_optimized.sql`
   - OR command line:
   ```powershell
   mysql -u root -p capstone_system_optimized < capstone_system_optimized.sql
   ```

3. **Restart your backend:**
   ```powershell
   npm start
   ```

You should see: `[OK] MySQL database connected successfully`

## Alternative: Create a New User

If you don't want to fix root, create a new user:

```sql
CREATE USER 'capstone'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON capstone_system_optimized.* TO 'capstone'@'localhost';
FLUSH PRIVILEGES;
```

Then update `backend/config.env`:
```env
DB_USER=capstone
DB_PASSWORD=your_password
```

## Verify Current Users

To see what users exist and from where they can connect:

```sql
SELECT User, Host, plugin FROM mysql.user;
```

Common outputs:
- `root | localhost` - Can connect from localhost ✅
- `root | 127.0.0.1` - Can connect from 127.0.0.1 only
- `root | %` - Can connect from anywhere (not recommended for production)
