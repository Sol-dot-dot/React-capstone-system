# Memory Issue Fix - Fine Calculation Service

## Problem
The backend was crashing with "JavaScript heap out of memory" error due to the fine calculation service trying to process 645,000+ overdue transactions at once every 5 seconds.

## Changes Made

### 1. Reduced Processing Frequency
- Changed interval from **5 seconds** to **60 seconds** (1 minute)
- This reduces the load on the system significantly

### 2. Added Batch Processing
- Added `batchSize` property set to **100 transactions per run**
- Changed query to use `LIMIT` to only fetch 100 transactions at a time
- This prevents loading all 645,000+ transactions into memory at once

### 3. Added Concurrency Protection
- Added `isProcessing` flag to prevent concurrent processing
- If a batch is already being processed, new requests will skip until it's done

### 4. Disabled Overdue History Population
- Temporarily disabled the `populateOverdueHistory()` function
- This function was also trying to load all overdue transactions without limit
- This can be re-enabled later with proper batch processing or run as a one-time migration script

## Impact
- Backend should no longer crash due to memory issues
- Fine calculations will still happen, but in smaller, manageable batches
- Processing will be slower but more stable
- The system will process 100 transactions per minute instead of all at once

## Future Improvements
1. Consider adding a database index on `due_date` for faster queries
2. Consider archiving very old overdue transactions
3. Add monitoring for the fine calculation service performance
4. Create a separate batch job for historical data processing
