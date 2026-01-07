# MySQL Setup Guide

## Current Issue
The backend is getting `ETIMEDOUT` errors when trying to connect to MySQL. This means MySQL is running but the connection is taking too long.

## Quick Fix Steps

### Step 1: Verify MySQL is Running

Open **MySQL Workbench** or **Services** (Windows + R → `services.msc`) and check if MySQL service is running.

**OR** check via command line:
```powershell
# Check if MySQL is running on port 3306
netstat -ano | findstr :3306
```

### Step 2: Try Connecting to MySQL

Open **MySQL Workbench** and try to connect with:
- **Host**: localhost
- **Port**: 3306
- **Username**: root
- **Password**: (leave empty if you didn't set one)

If you can connect, the issue is with the database setup.

### Step 3: Create the Database

**Option A: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Run this command:
   ```sql
   CREATE DATABASE IF NOT EXISTS capstone_system_optimized;
   ```
4. Then import the schema:
   - File → Run SQL Script
   - Select: `backend/capstone_system_optimized.sql`
   - Execute

**Option B: Using Command Line**
```powershell
# Navigate to backend directory
cd C:\Projects\capstone_2\React-capstone-system\backend

# Create database (you'll be prompted for MySQL root password)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS capstone_system_optimized;"

# Import schema
mysql -u root -p capstone_system_optimized < capstone_system_optimized.sql
```

### Step 4: Restart Backend

After setting up the database, restart your backend:
```powershell
# Stop the current backend (Ctrl+C if running)
# Then start it again
npm start
```

## Alternative: Using 127.0.0.1 instead of localhost

Sometimes Windows has issues resolving `localhost`. Try this:

1. Edit `backend/config.env`:
   ```env
   DB_HOST=127.0.0.1
   ```

2. Restart the backend

## Troubleshooting

### Error: "Access denied for user 'root'@'localhost'"
Your MySQL root user has a password. Update `backend/config.env`:
```env
DB_PASSWORD=your_mysql_password
```

### Error: "Unknown database 'capstone_system_optimized'"
The database doesn't exist. Follow Step 3 above to create it.

### MySQL is not installed
Download and install MySQL from:
https://dev.mysql.com/downloads/mysql/

**OR** install via Chocolatey:
```powershell
choco install mysql
```

### Can't find MySQL in PATH
Add MySQL to your PATH:
1. Find your MySQL installation (usually `C:\Program Files\MySQL\MySQL Server X.X\bin`)
2. Add it to System Environment Variables PATH
3. Restart PowerShell

## Testing the Connection

I've updated the database config to test the connection on startup. When you restart the backend, you should see either:
- `[OK] MySQL database connected successfully` ✅
- OR an error message telling you what's wrong ❌

## Common MySQL Connection Issues

1. **MySQL service not started** → Start it in Services or MySQL Workbench
2. **Wrong port** → Default is 3306, check your MySQL configuration
3. **Wrong password** → Update `DB_PASSWORD` in config.env
4. **Database doesn't exist** → Create it using the SQL script
5. **Firewall blocking connection** → Allow MySQL through Windows Firewall
