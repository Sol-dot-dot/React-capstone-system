# Real-Time Fine Calculation System

This document describes the enhanced fine calculation system that automatically updates overdue fines in real-time, even when the server is not continuously running.

## Problem Solved

Previously, the fine system only calculated fines when:
- The `process-overdue-fines.js` script was manually run
- The `/api/penalty/process-overdue` endpoint was called
- Individual fine calculations were triggered

This meant that if the server wasn't running continuously, fine amounts would become outdated and not reflect the actual days overdue.

## Solution

The new system includes:

1. **Background Fine Calculation Service** - Runs every 5 seconds to check and update fines
2. **Real-Time API Endpoints** - Automatically recalculate fines when accessed
3. **Graceful Server Integration** - Starts/stops with the server automatically

## Components

### 1. Fine Calculation Service (`services/fineCalculationService.js`)

A background service that:
- Runs every 5 seconds (configurable)
- Checks all overdue books
- Updates fine amounts based on current time
- Creates new fines for newly overdue books
- Updates existing fines with new amounts
- Handles graceful startup/shutdown

**Key Methods:**
- `start()` - Start the background service
- `stop()` - Stop the background service
- `processFines()` - Process all overdue fines
- `getStatus()` - Get service status
- `forceProcess()` - Force immediate processing

### 2. Enhanced Penalty Utilities (`utils/penaltyUtils.js`)

Updated functions with real-time calculation:
- `getStudentFines()` - Now includes optional real-time recalculation
- `recalculateStudentFines()` - New function to recalculate specific student's fines

### 3. Updated API Endpoints (`routes/penalty.js`)

Enhanced endpoints:
- `GET /api/penalty/user/:studentId` - Now includes real-time recalculation
- `GET /api/penalty/fines/:studentId` - Admin endpoint with real-time calculation
- `POST /api/penalty/recalculate/:studentId` - Force recalculation endpoint

### 4. Server Integration (`server.js`)

- Automatically starts the fine calculation service when server starts
- Graceful shutdown handling
- New endpoints for service monitoring

## API Endpoints

### Fine Service Status
```
GET /api/fine-service/status
```
Returns the current status of the fine calculation service.

### Force Fine Processing
```
POST /api/fine-service/force-process
```
Forces immediate processing of all overdue fines.

### Enhanced User Fines
```
GET /api/penalty/user/:studentId?recalculate=true
```
Gets user's fines with optional real-time recalculation (default: true).

### Force Student Fine Recalculation
```
POST /api/penalty/recalculate/:studentId
```
Forces recalculation of a specific student's fines.

## How It Works

1. **Background Processing**: The service runs every 5 seconds and:
   - Finds all overdue books
   - Calculates current fine amounts based on days overdue
   - Updates existing fines or creates new ones
   - Updates transaction status to 'overdue' if needed

2. **Real-Time API Calls**: When API endpoints are called:
   - Optionally recalculate fines before returning data
   - Ensure users always see current fine amounts
   - Provide timestamp of last update

3. **Fine Calculation Logic**:
   ```javascript
   const daysOverdue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
   const fineAmount = daysOverdue * finePerDay;
   ```

## Configuration

The fine calculation service can be configured:

```javascript
// Change interval (minimum 1000ms)
fineCalculationService.setInterval(10000); // 10 seconds

// Get current status
const status = fineCalculationService.getStatus();
```

## Testing

Run the test script to verify the system:

```bash
node test-fine-calculation.js
```

This will:
- Check for overdue books
- Test fine calculations
- Verify service status
- Show current fines in database

## Benefits

1. **Always Accurate**: Fines are always up-to-date regardless of server uptime
2. **Automatic**: No manual intervention required
3. **Efficient**: Only processes changes, not all data
4. **Configurable**: Interval can be adjusted as needed
5. **Monitoring**: Service status can be checked via API
6. **Graceful**: Handles server restarts properly

## Example Usage

### Check Service Status
```bash
curl http://localhost:5000/api/fine-service/status
```

### Get User Fines (with real-time calculation)
```bash
curl http://localhost:5000/api/penalty/user/C22-0045
```

### Force Fine Recalculation
```bash
curl -X POST http://localhost:5000/api/penalty/recalculate/C22-0045
```

## Monitoring

The system provides several ways to monitor fine calculation:

1. **Server Health Check**: `GET /api/health` includes fine service status
2. **Service Status**: `GET /api/fine-service/status` for detailed status
3. **Console Logs**: Service logs all processing activities
4. **Database**: Check `fines` table for updated amounts and timestamps

## Troubleshooting

### Service Not Running
- Check server logs for startup messages
- Verify service status via API
- Restart server if needed

### Fines Not Updating
- Check if there are overdue books
- Verify fine calculation logic
- Run test script to diagnose issues

### Performance Issues
- Increase interval time if needed
- Check database performance
- Monitor server resources

## Future Enhancements

Potential improvements:
- Configurable fine calculation intervals per environment
- Fine calculation history/audit trail
- Email notifications for new fines
- Batch processing for large datasets
- Fine calculation analytics and reporting
