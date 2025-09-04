# PowerShell script to set up penalty system tables
Write-Host "Setting up Penalty System Database Tables..." -ForegroundColor Green

# Read the SQL file content
$sqlContent = Get-Content -Path "penalty-system.sql" -Raw

# Split by semicolon to get individual statements
$statements = $sqlContent -split ';' | Where-Object { $_.Trim() -ne '' }

# MySQL connection parameters (you may need to adjust these)
$mysqlUser = "root"
$mysqlPassword = Read-Host "Enter MySQL root password" -AsSecureString
$mysqlPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($mysqlPassword))

Write-Host "Connecting to MySQL..." -ForegroundColor Yellow

try {
    # Execute each SQL statement
    foreach ($statement in $statements) {
        if ($statement.Trim() -ne '') {
            Write-Host "Executing: $($statement.Substring(0, [Math]::Min(50, $statement.Length)))..." -ForegroundColor Cyan
            $result = mysql -u $mysqlUser -p$mysqlPasswordPlain -D capstone_system -e $statement
            if ($LASTEXITCODE -ne 0) {
                Write-Host "Error executing statement: $statement" -ForegroundColor Red
            }
        }
    }
    
    Write-Host "✅ Penalty system tables created successfully!" -ForegroundColor Green
    Write-Host "You can now refresh phpMyAdmin to see the new tables." -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Error setting up penalty system: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
