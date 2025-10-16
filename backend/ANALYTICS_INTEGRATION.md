# Analytics Integration Guide

## Overview
This guide explains how to integrate the analytics dashboard with real database data instead of mock data.

## Database Setup

### 1. Create Analytics Tables
Run the database setup script to create necessary tables:

```bash
cd backend
node setup-analytics.js
```

This will create the following tables:
- `activity_logs` - Track user actions and system events
- `search_logs` - Track search queries and results
- `book_ratings` - Store book ratings and reviews
- `user_sessions` - Track user engagement metrics
- `system_metrics` - Store system performance data

### 2. Database Schema

#### activity_logs
```sql
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    response_time INT DEFAULT 0,
    status ENUM('success', 'error') DEFAULT 'success',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### search_logs
```sql
CREATE TABLE search_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    search_term VARCHAR(255) NOT NULL,
    result_count INT DEFAULT 0,
    clicked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### book_ratings
```sql
CREATE TABLE book_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### 1. Dashboard Analytics
**GET** `/api/analytics/dashboard?range=3months`

Returns comprehensive analytics data including:
- User growth trends
- Book category distribution
- Borrowing patterns
- Penalty analysis
- System metrics
- Top books
- Monthly statistics

### 2. User Analytics
**GET** `/api/analytics/users?range=3months`

Returns user-specific analytics:
- Registration trends
- User type distribution
- Activity patterns
- Verification statistics
- User engagement metrics
- Top active users

### 3. Book Analytics
**GET** `/api/analytics/books?range=3months&category=all`

Returns book-specific analytics:
- Borrowing trends
- Category distribution
- Top books
- Book status
- Search analytics

## Data Transformation

The backend automatically transforms raw database data into chart-ready formats:

### User Growth Data
```javascript
{
  month: "Jan",
  users: 45,
  verified: 42,
  active: 38
}
```

### Book Categories
```javascript
{
  name: "Fiction",
  value: 245,
  count: 245,
  percentage: 35.0,
  color: "#3B82F6"
}
```

### Borrowing Trends
```javascript
{
  month: "Jan",
  borrowed: 120,
  returned: 115,
  overdue: 5
}
```

## Frontend Integration

### 1. Error Handling
The frontend components now include:
- Loading states with skeleton screens
- Error handling with retry functionality
- Fallback data when API fails
- User-friendly error messages

### 2. Real-time Updates
- Auto-refresh capabilities
- Time range selection (1 month, 3 months, 6 months, 1 year)
- Category filtering for book analytics
- Responsive design for all screen sizes

### 3. Data Validation
- Type checking for all numeric values
- Default values for missing data
- Color coding for different categories
- Proper date formatting

## Testing

### 1. Test Analytics Endpoints
```bash
cd backend
node test-analytics.js
```

### 2. Manual Testing
1. Start the backend server: `npm start`
2. Start the frontend: `cd web && npm start`
3. Navigate to `/analytics` in the browser
4. Check that charts load with real data
5. Test different time ranges and filters

## Performance Optimization

### 1. Database Indexes
The setup script creates optimized indexes:
- `idx_activity_logs_user_id` - Fast user activity queries
- `idx_activity_logs_created_at` - Time-based filtering
- `idx_search_logs_search_term` - Search analytics
- `idx_book_ratings_book_id` - Book rating queries

### 2. Query Optimization
- Efficient JOIN operations
- Proper WHERE clauses for date filtering
- LIMIT clauses for large datasets
- Aggregation functions for metrics

### 3. Caching Strategy
- Consider implementing Redis for frequently accessed data
- Cache aggregated metrics for better performance
- Use database views for complex queries

## Monitoring

### 1. Error Tracking
- All API errors are logged to console
- Frontend errors are displayed to users
- Database connection errors are handled gracefully

### 2. Performance Metrics
- Response time tracking in activity_logs
- System metrics collection
- User engagement monitoring

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check database credentials in `.env`
   - Ensure MySQL server is running
   - Verify database exists

2. **Empty Analytics Data**
   - Check if tables have data
   - Verify date ranges in queries
   - Check user authentication

3. **Chart Rendering Issues**
   - Check browser console for JavaScript errors
   - Verify data format matches chart expectations
   - Check for missing dependencies

### Debug Steps

1. Check database tables:
```sql
SELECT COUNT(*) FROM activity_logs;
SELECT COUNT(*) FROM search_logs;
SELECT COUNT(*) FROM book_ratings;
```

2. Test API endpoints:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/analytics/dashboard
```

3. Check frontend console for errors
4. Verify backend logs for database errors

## Future Enhancements

### 1. Real-time Analytics
- WebSocket integration for live updates
- Real-time dashboard refresh
- Live user activity monitoring

### 2. Advanced Analytics
- Machine learning predictions
- User behavior analysis
- Predictive maintenance alerts
- Custom dashboard creation

### 3. Export Features
- PDF report generation
- Excel data export
- Chart image downloads
- Scheduled report emails

## Security Considerations

### 1. Data Privacy
- User data anonymization
- GDPR compliance
- Data retention policies
- Access control for sensitive data

### 2. API Security
- Rate limiting for analytics endpoints
- Authentication for all requests
- Input validation and sanitization
- SQL injection prevention

## Maintenance

### 1. Regular Tasks
- Monitor database performance
- Clean up old analytics data
- Update indexes as needed
- Backup analytics data

### 2. Data Archival
- Archive old activity logs
- Compress historical data
- Maintain data integrity
- Regular performance tuning

This integration provides a robust, scalable analytics system that can handle real-world data and provide valuable insights into library operations.
