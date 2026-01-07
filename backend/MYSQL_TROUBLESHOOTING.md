# MySQL Connection Timeout Troubleshooting

## Current Status
- ✅ MySQL is running (Process ID: 21908, Port: 3306)
- ✅ Backend is running (Port: 5000)
- ❌ Connection timing out (ETIMEDOUT)

## Issue
The Node.js backend cannot connect to MySQL even though MySQL is running. The connection times out after 30 seconds.

## Most Likely Causes

### 1. MySQL Root Password Required
If you set a password during MySQL installation, the empty password won't work.

**Fix:**
1. Open MySQL Workbench
2. Try to connect
3. If it asks for a password, update `backend/config.env`:
   ```env
   DB_PASSWORD=your_mysql_password
   ```

### 2. Database Doesn't Exist Yet
The `capstone_system_optimized` database hasn't been created.

**Fix - Using MySQL Workbench:**
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Run these commands:
   ```sql
   CREATE DATABASE IF NOT EXISTS capstone_system_optimized;
   USE capstone_system_optimized;
   SOURCE C:/Projects/capstone_2/React-capstone-system/backend/capstone_system_optimized.sql;
   ```

**OR - Using Command Line:**
```powershell
# Navigate to backend directory
cd C:\Projects\capstone_2\React-capstone-system\backend

# If mysql command is not found, use full path:
# "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p

mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS capstone_system_optimized;"
mysql -u root -p capstone_system_optimized < capstone_system_optimized.sql
```

### 3. MySQL Bind Address Issue
MySQL might be configured to only accept connections from certain addresses.

**Fix:**
1. Find your MySQL configuration file (my.ini):
   - Common locations:
     - `C:\ProgramData\MySQL\MySQL Server 8.0\my.ini`
     - `C:\Program Files\MySQL\MySQL Server 8.0\my.ini`
     - Check MySQL Workbench → Server → Options File

2. Look for `bind-address` setting
3. It should be either:
   - `bind-address = 0.0.0.0` (accepts all connections)
   - `bind-address = 127.0.0.1` (local only)
   - Commented out with `#` (default behavior)

4. If it's set to something else, change it to `0.0.0.0`
5. Restart MySQL service

### 4. Too Many Connections
MySQL might have reached its connection limit.

**Check in MySQL Workbench:**
```sql
SHOW STATUS LIKE 'Max_used_connections';
SHOW VARIABLES LIKE 'max_connections';
SHOW PROCESSLIST;
```

**Kill stuck connections:**
```sql
-- Find connection IDs
SHOW PROCESSLIST;

-- Kill specific connections (replace XXX with ID)
KILL XXX;
```

### 5. Windows Firewall Blocking
Windows Firewall might be blocking local MySQL connections.

**Fix:**
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Find MySQL or add it manually
4. Make sure both Private and Public are checked

**OR temporarily disable firewall to test:**
```powershell
# Run as Administrator
netsh advfirewall set allprofiles state off
# Test connection
# Then re-enable:
netsh advfirewall set allprofiles state on
```

## Step-by-Step Debugging

### Step 1: Verify MySQL Works Manually
1. Open **MySQL Workbench**
2. Create a new connection:
   - Connection Name: Local Test
   - Hostname: 127.0.0.1
   - Port: 3306
   - Username: root
3. Click "Test Connection"
4. Enter password if prompted

**Result:**
- ✅ If successful → MySQL works, issue is with Node.js config or database
- ❌ If failed → MySQL has authentication or configuration issues

### Step 2: Check if Database Exists
In MySQL Workbench, run:
```sql
SHOW DATABASES LIKE 'capstone_system_optimized';
```

**Result:**
- Shows 1 row → Database exists
- Shows 0 rows → Database needs to be created (see Fix #2 above)

### Step 3: Create Database and Import Schema
```sql
CREATE DATABASE IF NOT EXISTS capstone_system_optimized;
USE capstone_system_optimized;

-- Then use: File → Run SQL Script → Select capstone_system_optimized.sql
```

### Step 4: Restart Backend
After fixing MySQL issues:
```powershell
# Stop current backend (Ctrl+C)
npm start
```

Look for:
```
[OK] MySQL database connected successfully
```

## Quick Commands Reference

```powershell
# Check MySQL service status
Get-Service MySQL* | Select-Object Name, Status

# Start MySQL service
net start MySQL80

# Stop MySQL service
net stop MySQL80

# Restart MySQL service
net stop MySQL80 && net start MySQL80

# Check what's using port 3306
netstat -ano | findstr :3306

# Test backend connection
cd backend
node test-mysql.js
```

## Still Not Working?

If none of the above works:

1. **Check MySQL Error Log:**
   - Location: `C:\ProgramData\MySQL\MySQL Server 8.0\Data\*.err`
   - Look for recent errors

2. **Try connecting with different tool:**
   ```powershell
   # Using MySQL command line
   mysql -h 127.0.0.1 -P 3306 -u root -p
   ```

3. **Verify MySQL is actually listening:**
   ```powershell
   telnet 127.0.0.1 3306
   # Should connect (press Ctrl+] then type 'quit')
   ```

4. **Last resort - Reinstall MySQL:**
   - Uninstall MySQL completely
   - Delete `C:\ProgramData\MySQL`
   - Reinstall MySQL
   - During installation, note the root password!
