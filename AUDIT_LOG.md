# SMC Library System - Project Audit Report
**Date:** December 30, 2025
**Auditor:** Claude Code AI Assistant
**Project:** St. Michael's College Library System (Capstone Project)

---

## Project Overview

### Architecture
- **Backend:** Node.js + Express.js + MySQL (mysql2/promise)
- **Frontend (Web Admin):** React.js with react-router-dom
- **Mobile App:** React Native

### Project Structure
```
React-capstone-system/
├── backend/
│   ├── config/
│   │   ├── database.js       # MySQL connection pool
│   │   └── logger.js         # Logging configuration
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   └── monitoring.js     # Performance monitoring
│   ├── routes/
│   │   ├── admin.js          # Admin management
│   │   ├── analytics.js      # Analytics endpoints
│   │   ├── auth.js           # Authentication (login/register)
│   │   ├── books.js          # Book management
│   │   ├── borrowing.js      # Borrowing transactions
│   │   ├── chatbot.js        # AI chatbot integration
│   │   ├── dashboard.js      # Dashboard data
│   │   ├── monitoring.js     # System monitoring (disabled)
│   │   ├── notifications.js  # User notifications
│   │   ├── penalty.js        # Fines and penalties
│   │   ├── profile.js        # User profiles
│   │   ├── reports.js        # Report generation
│   │   ├── search.js         # Search functionality
│   │   ├── semesters.js      # Semester management
│   │   ├── simple-analytics.js # Simplified analytics
│   │   └── studentRecords.js # Student records
│   ├── services/
│   │   ├── advancedRecommendationService.js
│   │   ├── auditService.js
│   │   ├── fineCalculationService.js
│   │   ├── performanceService.js
│   │   └── userKnowledgeService.js
│   ├── utils/
│   │   ├── bookUtils.js
│   │   ├── borrowingUtils.js
│   │   ├── chatbotService.js
│   │   ├── emailService.js
│   │   ├── penaltyUtils.js
│   │   ├── readingHistoryService.js
│   │   ├── vectorDBService.js
│   │   └── vectorStorage.js
│   ├── server.js             # Main entry point
│   └── config.env            # Environment configuration
├── web/                      # React Admin Frontend
│   └── src/
│       ├── components/       # React components
│       ├── contexts/         # React contexts
│       ├── pages/            # Page components
│       └── styles/           # Styling
├── mobile/                   # React Native App
│   └── src/
│       ├── components/       # RN components
│       ├── screens/          # Screen components
│       ├── config/api.js     # API configuration
│       └── services/         # Services
└── AUDIT_LOG.md              # This file
```

---

## Issues Found

### CRITICAL - Security Issues

#### 1. EXPOSED API KEYS AND CREDENTIALS IN VERSION CONTROL
**File:** `backend/config.env`
**Severity:** CRITICAL
**Status:** REQUIRES IMMEDIATE ACTION

**Issue:** The config.env file contains sensitive credentials that should NEVER be in source control:
- OpenAI API Key: `sk-proj-2jd5Uzhw...` (EXPOSED!)
- JWT Secret: `your_super_secret_jwt_key_here` (WEAK DEFAULT!)
- Email credentials: `bloodmaster125@gmail.com` with app password (EXPOSED!)

**Recommendation:**
1. Immediately rotate ALL exposed API keys
2. Add `config.env` to `.gitignore`
3. Use environment variables or a secrets manager
4. Create a `config.env.example` file with placeholder values
5. Never commit real credentials to version control

---

#### 2. MISSING AUTHENTICATION ON PUBLIC ROUTES
**Files:**
- `backend/routes/borrowing.js:847` - `/user/:idNumber`
- `backend/routes/borrowing.js:932` - `/user/:idNumber/semester-count`
- `backend/routes/penalty.js:976` - `/user/:studentId`
- `backend/routes/penalty.js:1022` - `/recalculate/:studentId`

**Severity:** HIGH
**Status:** NEEDS FIX

**Issue:** These routes allow access to student borrowing data without authentication.

**Current Code (borrowing.js:847):**
```javascript
router.get('/user/:idNumber', async (req, res) => {
    // NO AUTH MIDDLEWARE!
```

**Recommended Fix:**
```javascript
router.get('/user/:idNumber', auth, async (req, res) => {
    // Verify user can only access their own data
    if (req.user.type !== 'admin' && req.user.idNumber !== req.params.idNumber) {
        return res.status(403).json({ message: 'Access denied' });
    }
```

---

### HIGH - Functionality Bugs

#### 3. INCONSISTENT USER TYPE CHECKING
**Files:** Multiple route files
**Severity:** HIGH
**Status:** NEEDS REVIEW

**Issue:** The codebase uses two different properties to check admin role:
- `req.user.type` (used in most routes)
- `req.user.role` (used in penalty.js lines 1421, 1517)

This inconsistency could lead to authorization bypasses.

**Examples:**
- `penalty.js:28` uses `req.user.type !== 'admin'`
- `penalty.js:1421` uses `req.user.role !== 'admin'`

**Recommendation:** Standardize to use ONE property throughout the codebase.

---

#### 4. DATA INTEGRITY ISSUE - INVALID DATES IN DATABASE
**File:** `backend/capstone_system_optimized.sql`
**Severity:** MEDIUM-HIGH
**Status:** DATA ISSUE

**Issue:** Some borrowing transactions have invalid `borrowed_date` values of `'0000-00-00'`:
```sql
(1, 'C22-0044', 1, '0000-00-00', '2025-09-17', '2025-09-10', 'returned', ...),
(2, 'C22-0044', 1, '0000-00-00', '2025-09-11', '2025-09-11', 'returned', ...),
```

**Recommendation:**
1. Add validation to prevent `0000-00-00` dates
2. Consider adding a database constraint
3. Clean up existing invalid data

---

### MEDIUM - Performance & Code Quality

#### 5. EXCESSIVE DEBUG LOGGING
**Files:** Multiple route files
**Severity:** MEDIUM
**Status:** CLEANUP NEEDED

**Issue:** Production code contains many `console.log` statements for debugging:

**borrowing.js:**
- Lines 143-144, 150, 157, 171, 176, 190-191
- Lines 463-465, 477, 479, 489, 514, 423

**penalty.js:**
- Lines 228, 241-248, 253-255, 261, 265, 343-346, 349-351, 465, 473, 513-518, etc.

**auth.js:**
- Lines 290, 293

**Recommendation:** Replace with proper logging service (winston is already set up in `config/logger.js` but disabled).

---

#### 6. COMMENTED OUT MONITORING FEATURES
**File:** `backend/server.js`
**Severity:** LOW-MEDIUM
**Status:** REVIEW NEEDED

**Issue:** Monitoring middleware is disabled:
```javascript
// Line 40: app.use('/api/monitoring', require('./routes/monitoring'));
// Lines 13-17: All monitoring middleware commented out
// Lines 78-79: Error tracking middleware commented out
```

**Recommendation:** Either:
1. Re-enable monitoring if needed for production
2. Remove the commented code completely if not needed

---

#### 7. POTENTIAL N+1 QUERY PATTERNS
**File:** `backend/routes/penalty.js`
**Severity:** MEDIUM
**Status:** PERFORMANCE CONCERN

**Issue:** Several routes have loops that execute database queries:
- Lines 354-430: Loop fetching book history for each student
- Lines 409-427: Nested loop fetching payment history for each book

**Example (lines 354-430):**
```javascript
for (let student of students) {
    const [bookHistory] = await pool.execute(...);  // Query in loop
    for (let book of bookHistory) {
        const [paymentHistory] = await pool.execute(...);  // Nested query
    }
}
```

**Recommendation:** Use JOINs to fetch data in fewer queries.

---

### LOW - Code Cleanup

#### 8. UNUSED IMPORTS/EXPORTS
**Status:** MINOR CLEANUP

Some files may have unused imports. A full ESLint check is recommended.

---

#### 9. INCONSISTENT ERROR RESPONSE FORMAT
**Status:** CONSISTENCY ISSUE

Most routes return:
```javascript
{ success: true/false, message: '...', data: {...} }
```

But some return:
```javascript
{ message: '...' }  // Missing success field
```

---

## What's Working Well

### Security Positives
- [x] **Parameterized SQL queries** - No SQL injection vulnerabilities found
- [x] **Password hashing** - Using bcrypt with salt rounds of 10
- [x] **JWT authentication** - Properly implemented token-based auth
- [x] **Input validation** - Using express-validator for request validation
- [x] **CORS enabled** - Cross-origin requests are handled

### Code Quality Positives
- [x] **Clean separation of concerns** - Routes, middleware, utils, services
- [x] **Database connection pooling** - Efficient MySQL connections
- [x] **Transaction support** - Proper use of database transactions for complex operations
- [x] **Error handling** - Most routes have try-catch blocks
- [x] **Mobile API configuration** - Centralized endpoint management

---

## Files Modified During Audit

### Phase 2: CRITICAL Security Fixes (December 30, 2025)

| File | Change | Status |
|------|--------|--------|
| `backend/config.env.example` | **CREATED** - Template file with safe placeholder values | Done |
| `backend/routes/borrowing.js:847` | Added `auth` middleware + authorization check to `/user/:idNumber` | Done |
| `backend/routes/borrowing.js:940` | Added `auth` middleware + authorization check to `/user/:idNumber/semester-count` | Done |
| `backend/routes/penalty.js:976` | Added `auth` middleware + authorization check to `/user/:studentId` | Done |
| `backend/routes/penalty.js:1030` | Added `auth` middleware + authorization check to `/recalculate/:studentId` | Done |

### Changes Made in Detail

**1. Created `backend/config.env.example`**
- Template file with placeholder values
- Instructions for generating secure JWT secret
- Safe to commit to version control

**2. Fixed Authentication on borrowing.js routes**
```javascript
// BEFORE (vulnerable)
router.get('/user/:idNumber', async (req, res) => {

// AFTER (secured)
router.get('/user/:idNumber', auth, async (req, res) => {
    // Security: Verify user can only access their own data (or admin can access any)
    if (req.user.type !== 'admin' && req.user.idNumber !== idNumber) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. You can only view your own borrowed books.'
        });
    }
```

**3. Fixed Authentication on penalty.js routes**
- Same pattern applied to `/user/:studentId` and `/recalculate/:studentId`
- Users can only access their own data
- Admins can access any user's data

### Phase 3: HIGH Priority Fixes (December 30, 2025)

| File | Change | Status |
|------|--------|--------|
| `backend/routes/notifications.js` | Fixed 4 occurrences of `req.user.role` to `req.user.type` | Done |
| `backend/routes/penalty.js:1437` | Fixed `req.user.role` to `req.user.type` | Done |
| `backend/routes/penalty.js:1533` | Fixed `req.user.role` to `req.user.type` | Done |
| `backend/routes/penalty.js:1560` | Fixed `req.user.role` to `req.user.type` | Done |

### Phase 4: MEDIUM Priority Fixes (December 30, 2025)

| File | Change | Status |
|------|--------|--------|
| `backend/server.js` | Enabled winston logger (requestLogger, errorLogger) | Done |
| `backend/server.js` | Replaced console.log with logger.info for startup | Done |
| `backend/routes/borrowing.js` | Removed 14 debug console.log statements | Done |
| `backend/routes/penalty.js` | Removed 17 debug console.log statements | Done |

**Summary of console.log cleanup:**
- Before: 62 debug console.log statements
- After: 31 remaining (some may be legitimate, need review)
- Removed: emoji-prefixed debug logs (🔍, ✅, ❌, ⚠️, etc.)

---

## Recommended Actions (Priority Order)

### Immediate (Do Now) - MANUAL ACTION REQUIRED
1. [ ] **CRITICAL:** Rotate all exposed API keys (OpenAI, Email)
2. [x] ~~**CRITICAL:** Add `config.env` to `.gitignore`~~ (Already in .gitignore)
3. [ ] **CRITICAL:** Generate new JWT secret (use strong random string)
4. [x] ~~**HIGH:** Add auth middleware to unprotected routes~~ (Done)

### Short Term - COMPLETED
5. [x] ~~Standardize `req.user.type` vs `req.user.role` checking~~ (Done - 7 fixes)
6. [x] ~~Enable proper logging instead of console.log~~ (Done - winston enabled)
7. [ ] Review and fix N+1 query patterns (pending - needs careful review)
8. [ ] Clean up invalid date data in database (pending)

### Long Term
9. [ ] Add comprehensive error logging
10. [ ] Add rate limiting to authentication endpoints
11. [ ] Consider adding request logging for audit trail
12. [ ] Set up automated security scanning

---

## Database Tables Identified

From SQL schema analysis:
- `users` - User accounts (students and admins)
- `books` - Book inventory
- `borrowing_transactions` - Borrowing records
- `fines` - Penalty records
- `fine_payments` - Payment tracking
- `login_logs` - Authentication logs
- `audit_logs` - System audit trail
- `system_settings` - Configuration
- `semester_tracking` - Semester progress
- `return_transactions` - Return records
- `overdue_history` - Overdue tracking

**Views identified:**
- `active_borrowing_status`
- `barcode_lookup`
- `overdue_books_with_fines`

---

## Next Steps

**Awaiting user confirmation before proceeding to Phase 2: Bug Fixing**

Please review these findings and confirm:
1. Which issues should be fixed first?
2. Are there any issues you want to skip?
3. Any specific areas you want to focus on?

---

*This audit was performed following the user's detailed instructions to be cautious and document everything before making changes.*
