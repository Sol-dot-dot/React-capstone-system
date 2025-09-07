# 🔍 Monitoring & Logging System

## 📊 **Overview**

The React Capstone System now includes a comprehensive monitoring and logging system that provides real-time insights into system performance, user activities, and system health. This system enables administrators to track errors, monitor performance, and maintain system security.

## 🏗️ **System Architecture**

### **Core Components:**

1. **Winston Logging Framework** - Structured logging with multiple levels
2. **Audit Service** - Tracks all user actions and system events
3. **Performance Service** - Monitors API and database performance
4. **Error Tracking** - Comprehensive error logging and alerting
5. **Monitoring Dashboard** - Real-time web interface for administrators

## 📁 **File Structure**

```
backend/
├── config/
│   └── logger.js                 # Winston logging configuration
├── services/
│   ├── auditService.js          # Audit logging service
│   └── performanceService.js    # Performance monitoring service
├── middleware/
│   └── monitoring.js            # Monitoring middleware
├── routes/
│   └── monitoring.js            # Monitoring API endpoints
├── logs/                        # Log files directory
│   ├── application-*.log        # Application logs
│   ├── error-*.log             # Error logs
│   ├── audit-*.log             # Audit logs
│   └── performance-*.log       # Performance logs
└── monitoring-system.sql        # Database schema

web/src/components/
└── MonitoringDashboard.js       # Web monitoring dashboard
```

## 🗄️ **Database Schema**

### **Tables Created:**

1. **`audit_logs`** - User actions and system events
2. **`performance_metrics`** - System performance data
3. **`error_logs`** - Error tracking and resolution
4. **`health_checks`** - System health monitoring
5. **`system_alerts`** - Alert management
6. **`api_usage_stats`** - API endpoint statistics
7. **`database_query_stats`** - Database performance
8. **`user_activity_summary`** - User activity analytics

## 🔧 **Features Implemented**

### **1. Logging Framework (Winston)**

- **Multiple Log Levels**: info, warn, error, audit, performance
- **Log Rotation**: Daily rotation with size limits
- **Multiple Transports**: Console, file, and database logging
- **Structured Logging**: JSON format with metadata
- **Exception Handling**: Automatic uncaught exception logging

```javascript
// Usage Examples
logger.info('User logged in', { userId: 123 });
logger.audit('Book borrowed', { userId: 123, bookId: 456 });
logger.performance('Slow API call', { endpoint: '/api/books', duration: 2000 });
logger.error('Database error', { error: error.message, query: 'SELECT * FROM users' });
```

### **2. Audit Logging Service**

- **User Actions**: Login, logout, book operations, borrowing
- **Admin Operations**: User management, system configuration
- **System Events**: Server startup, maintenance, errors
- **Security Events**: Failed logins, suspicious activity
- **Detailed Context**: IP addresses, user agents, timestamps

```javascript
// Audit Logging Examples
await auditService.logAuthentication(userId, 'login', { ipAddress: '192.168.1.1' });
await auditService.logBookOperation(userId, 'borrow', bookId, { bookTitle: 'The Great Gatsby' });
await auditService.logAdminOperation(adminId, 'create_user', { newUserId: 123 });
await auditService.logSecurityEvent('failed_login', { userId, ipAddress, attempts: 3 });
```

### **3. Performance Monitoring**

- **API Response Times**: Track endpoint performance
- **Database Query Performance**: Monitor query execution times
- **Memory Usage**: Track heap and system memory
- **CPU Usage**: Monitor system resource utilization
- **Slow Query Detection**: Automatic alerts for slow operations

```javascript
// Performance Monitoring Examples
performanceService.recordAPICall('/api/books', 'GET', 150, 200, userId);
performanceService.recordDatabaseQuery('SELECT * FROM books', 50, 100);
performanceService.recordMemoryUsage(); // Automatic every 30 seconds
```

### **4. Error Tracking**

- **Comprehensive Error Logging**: All errors with stack traces
- **Error Categorization**: API, database, system, security errors
- **Resolution Tracking**: Mark errors as resolved
- **Alert Generation**: Automatic alerts for critical errors
- **Error Analytics**: Error rates and trends

### **5. Security Monitoring**

- **Failed Login Attempts**: Track authentication failures
- **Suspicious Activity**: Detect unusual patterns
- **Rate Limiting**: Monitor for abuse
- **IP Tracking**: Log all requests with IP addresses
- **Security Alerts**: Automatic security event notifications

## 🌐 **API Endpoints**

### **Monitoring Endpoints:**

- `GET /api/monitoring/health` - System health check
- `GET /api/monitoring/dashboard` - Dashboard data
- `GET /api/monitoring/audit-logs` - Audit logs (Admin only)
- `GET /api/monitoring/performance` - Performance metrics (Admin only)
- `GET /api/monitoring/errors` - Error logs (Admin only)
- `GET /api/monitoring/alerts` - System alerts (Admin only)
- `POST /api/monitoring/alerts` - Create alert (Admin only)
- `PATCH /api/monitoring/errors/:id/resolve` - Resolve error (Admin only)

### **Example API Usage:**

```bash
# Health Check
curl http://localhost:5000/api/monitoring/health

# Get Audit Logs (with admin token)
curl -H "Authorization: Bearer <admin_token>" \
     http://localhost:5000/api/monitoring/audit-logs?limit=10

# Get Performance Metrics
curl -H "Authorization: Bearer <admin_token>" \
     http://localhost:5000/api/monitoring/performance
```

## 📊 **Monitoring Dashboard**

### **Dashboard Features:**

1. **System Overview**
   - System status and uptime
   - Memory and CPU usage
   - Node.js version and platform info

2. **Audit Logs Tab**
   - Recent user activities
   - Action categorization
   - User identification
   - IP address tracking

3. **Performance Tab**
   - API response time metrics
   - Error rates by endpoint
   - Top performing/underperforming APIs
   - Database query performance

4. **Errors Tab**
   - Error logs with details
   - Error resolution status
   - Error categorization
   - Resolution actions

5. **Alerts Tab**
   - System alerts by severity
   - Alert resolution status
   - Alert creation and management

### **Accessing the Dashboard:**

1. **Web Interface**: Navigate to `/monitoring` in the admin panel
2. **API Access**: Use monitoring endpoints with admin authentication
3. **Real-time Updates**: Dashboard refreshes every 30 seconds

## 🔧 **Configuration**

### **Environment Variables:**

```env
# Logging Configuration
LOG_LEVEL=info                    # Log level (error, warn, info, debug)
NODE_ENV=development              # Environment (development, production)

# Monitoring Configuration
MONITORING_ENABLED=true           # Enable/disable monitoring
PERFORMANCE_THRESHOLD_MS=1000     # Slow request threshold
MEMORY_THRESHOLD_MB=500           # High memory usage threshold
```

### **Log Rotation Settings:**

- **File Size Limit**: 20MB per log file
- **Retention Period**: 
  - Application logs: 14 days
  - Error logs: 30 days
  - Audit logs: 90 days
  - Performance logs: 7 days

## 🚀 **Setup Instructions**

### **1. Install Dependencies:**

```bash
cd backend
npm install winston winston-daily-rotate-file express-winston morgan
```

### **2. Setup Database:**

```bash
node setup-monitoring-simple.js
```

### **3. Start Server:**

```bash
npm start
```

### **4. Access Monitoring:**

- **Web Dashboard**: `http://localhost:3000/monitoring`
- **Health Check**: `http://localhost:5000/api/monitoring/health`
- **API Documentation**: See endpoints above

## 📈 **Monitoring Metrics**

### **Key Performance Indicators (KPIs):**

1. **Response Time Metrics**
   - Average response time
   - 50th percentile (P50)
   - 95th percentile (P95)
   - 99th percentile (P99)

2. **Error Rates**
   - API error rate percentage
   - Database error rate percentage
   - System error rate percentage

3. **Throughput Metrics**
   - Total API calls per day
   - Database queries per day
   - User sessions per day

4. **System Health**
   - Memory usage percentage
   - CPU utilization
   - Disk space usage
   - Database connection health

## 🔔 **Alerting System**

### **Alert Types:**

1. **Error Rate Alerts**
   - High API error rate (>10%)
   - Database connection failures
   - System crashes

2. **Performance Alerts**
   - Slow API responses (>2 seconds)
   - High memory usage (>500MB)
   - Database query timeouts

3. **Security Alerts**
   - Multiple failed login attempts
   - Suspicious request patterns
   - Unauthorized access attempts

### **Alert Severity Levels:**

- **Critical**: System down, security breach
- **High**: Performance degradation, high error rates
- **Medium**: Warning conditions, minor issues
- **Low**: Informational alerts, maintenance reminders

## 🛠️ **Maintenance**

### **Log Management:**

- **Automatic Rotation**: Logs rotate daily and by size
- **Cleanup**: Old logs are automatically deleted
- **Backup**: Consider backing up audit logs for compliance

### **Performance Optimization:**

- **Database Indexing**: All monitoring tables are properly indexed
- **Query Optimization**: Monitoring queries are optimized for performance
- **Resource Usage**: Monitoring has minimal impact on system performance

### **Security Considerations:**

- **Access Control**: All monitoring endpoints require admin authentication
- **Data Privacy**: Sensitive data is redacted in logs
- **Audit Trail**: All monitoring access is logged

## 🎯 **Benefits**

### **For Administrators:**

1. **Proactive Monitoring**: Identify issues before they impact users
2. **Performance Optimization**: Track and improve system performance
3. **Security Monitoring**: Detect and respond to security threats
4. **Compliance**: Maintain audit trails for regulatory requirements
5. **Troubleshooting**: Detailed logs for faster issue resolution

### **For System Reliability:**

1. **Error Prevention**: Early detection of potential issues
2. **Performance Tuning**: Data-driven optimization decisions
3. **Capacity Planning**: Monitor resource usage trends
4. **Security**: Comprehensive security event tracking
5. **Compliance**: Detailed audit trails for all activities

## 🔮 **Future Enhancements**

### **Planned Features:**

1. **Real-time Notifications**: Email/SMS alerts for critical issues
2. **Custom Dashboards**: Configurable monitoring dashboards
3. **Machine Learning**: Anomaly detection and predictive alerts
4. **Integration**: Third-party monitoring tool integration
5. **Reporting**: Automated performance and security reports

---

## 📞 **Support**

For issues or questions about the monitoring system:

1. Check the logs in the `backend/logs/` directory
2. Review the monitoring dashboard for system status
3. Use the health check endpoint to verify system status
4. Check the audit logs for recent system activities

The monitoring system provides comprehensive visibility into your React Capstone System, enabling proactive management and optimal performance! 🚀
