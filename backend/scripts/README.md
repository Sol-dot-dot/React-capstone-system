# Backend Scripts Directory

This directory contains utility scripts and archived migrations for the capstone library system.

## Directory Structure

```
scripts/
├── utilities/          # Utility and maintenance scripts
├── archived-migrations/ # Completed migration scripts (historical reference)
└── README.md          # This file
```

## Utilities

### `convert-console-to-logger.js`
Converts all `console.log` statements to proper winston logger calls.

**Usage:**
```bash
node scripts/utilities/convert-console-to-logger.js
```

**What it does:**
- Scans routes/, services/, utils/, and middleware/ directories
- Replaces console.log → logger.info
- Replaces console.error → logger.error
- Replaces console.warn → logger.warn
- Replaces console.debug → logger.debug
- Automatically adds logger import if missing

### `cleanup-code.js`
Performs basic code formatting cleanup.

**Usage:**
```bash
node scripts/utilities/cleanup-code.js
```

**What it does:**
- Removes trailing whitespace
- Consolidates multiple blank lines (max 3 consecutive)
- Ensures files end with single newline
- Improves code readability

### `fix-logger-imports.js`
Fixes incorrect logger imports by adding proper destructuring.

**Usage:**
```bash
node scripts/utilities/fix-logger-imports.js
```

**What it does:**
- Finds incorrect logger imports: `const logger = require('../config/logger')`
- Replaces with correct destructured import: `const { logger } = require('../config/logger')`
- Fixes runtime error: "TypeError: logger.info is not a function"

**Note:** This was created to fix an issue from the initial logger conversion script.

### `reset-admin.js`
Resets the admin account credentials in the database.

**Usage:**
```bash
node scripts/utilities/reset-admin.js
```

**⚠️ Use with caution** - This modifies admin credentials in production.

### `test-mysql.js`
Tests MySQL/MariaDB database connection.

**Usage:**
```bash
node scripts/utilities/test-mysql.js
```

### `setup-analytics.js`
Sets up initial analytics tracking infrastructure.

**Usage:**
```bash
node scripts/utilities/setup-analytics.js
```

## Archived Migrations

The `archived-migrations/` directory contains one-time migration scripts that have already been executed. These are kept for historical reference and should **not** be run again unless explicitly needed.

### Migration Files:
- `migrate-student-records.js` - Student records migration
- `run-student-records-migration.js` - Student records migration runner
- `add_2025_2026_year.js` - Academic year addition
- `final_verification.js` - Final data verification
- `verify_all_borrowings.js` - Borrowing records verification
- `verify_migration.js` - General migration verification
- `run_semester_migration.js` - Semester tracking migration

## Notes

- All scripts assume they're run from the `backend/` directory
- Scripts use the same database configuration as the main application (`config.env`)
- Always test scripts in development before running in production
- Archived migrations are for reference only - do not execute unless you know what you're doing

## Maintenance

Regular maintenance tasks:
1. Run code cleanup before major releases
2. Review logger output levels periodically
3. Archive completed migration scripts
4. Document new utility scripts in this README
