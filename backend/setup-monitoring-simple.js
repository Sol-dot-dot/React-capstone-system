const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

async function setupMonitoringSystem() {
  try {
    console.log('🚀 Setting up Monitoring & Logging System...\n');
    
    // Create audit logs table
    console.log('📝 Creating audit_logs table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NULL,
        action VARCHAR(100) NOT NULL,
        category ENUM(
          'authentication',
          'book_management', 
          'borrowing',
          'penalty',
          'admin',
          'system',
          'security',
          'api',
          'database'
        ) NOT NULL,
        resource_id INT NULL,
        details JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_action (action),
        INDEX idx_category (category),
        INDEX idx_created_at (created_at),
        INDEX idx_resource_id (resource_id)
      )
    `);
    console.log('✅ audit_logs table created');
    
    // Create performance metrics table
    console.log('📝 Creating performance_metrics table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id INT PRIMARY KEY AUTO_INCREMENT,
        metric_type ENUM('api', 'database', 'system', 'memory', 'cpu') NOT NULL,
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(15,4) NOT NULL,
        unit VARCHAR(20),
        metadata JSON,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_metric_type (metric_type),
        INDEX idx_metric_name (metric_name),
        INDEX idx_recorded_at (recorded_at)
      )
    `);
    console.log('✅ performance_metrics table created');
    
    // Create error logs table
    console.log('📝 Creating error_logs table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS error_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        error_type VARCHAR(50) NOT NULL,
        error_message TEXT NOT NULL,
        error_stack TEXT,
        user_id INT NULL,
        endpoint VARCHAR(255),
        method VARCHAR(10),
        status_code INT,
        request_data JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        resolved BOOLEAN DEFAULT FALSE,
        resolved_at TIMESTAMP NULL,
        resolved_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_error_type (error_type),
        INDEX idx_user_id (user_id),
        INDEX idx_resolved (resolved),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ error_logs table created');
    
    // Create health checks table
    console.log('📝 Creating health_checks table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS health_checks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        check_name VARCHAR(100) NOT NULL,
        status ENUM('healthy', 'warning', 'critical') NOT NULL,
        message TEXT,
        response_time_ms INT,
        metadata JSON,
        checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_check_name (check_name),
        INDEX idx_status (status),
        INDEX idx_checked_at (checked_at)
      )
    `);
    console.log('✅ health_checks table created');
    
    // Create system alerts table
    console.log('📝 Creating system_alerts table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS system_alerts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        alert_type ENUM('error_rate', 'response_time', 'memory_usage', 'cpu_usage', 'database_performance', 'security') NOT NULL,
        severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        metadata JSON,
        resolved BOOLEAN DEFAULT FALSE,
        resolved_at TIMESTAMP NULL,
        resolved_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_alert_type (alert_type),
        INDEX idx_severity (severity),
        INDEX idx_resolved (resolved),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ system_alerts table created');
    
    // Create API usage stats table
    console.log('📝 Creating api_usage_stats table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS api_usage_stats (
        id INT PRIMARY KEY AUTO_INCREMENT,
        endpoint VARCHAR(255) NOT NULL,
        method VARCHAR(10) NOT NULL,
        total_requests INT DEFAULT 0,
        successful_requests INT DEFAULT 0,
        failed_requests INT DEFAULT 0,
        avg_response_time_ms DECIMAL(10,2) DEFAULT 0,
        min_response_time_ms INT DEFAULT 0,
        max_response_time_ms INT DEFAULT 0,
        total_response_time_ms BIGINT DEFAULT 0,
        last_request_at TIMESTAMP NULL,
        date_recorded DATE NOT NULL,
        UNIQUE KEY unique_endpoint_method_date (endpoint, method, date_recorded),
        INDEX idx_date_recorded (date_recorded),
        INDEX idx_endpoint (endpoint)
      )
    `);
    console.log('✅ api_usage_stats table created');
    
    // Create database query stats table
    console.log('📝 Creating database_query_stats table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS database_query_stats (
        id INT PRIMARY KEY AUTO_INCREMENT,
        query_hash VARCHAR(64) NOT NULL,
        query_template TEXT NOT NULL,
        total_executions INT DEFAULT 0,
        total_execution_time_ms BIGINT DEFAULT 0,
        avg_execution_time_ms DECIMAL(10,2) DEFAULT 0,
        min_execution_time_ms INT DEFAULT 0,
        max_execution_time_ms INT DEFAULT 0,
        total_rows_affected INT DEFAULT 0,
        error_count INT DEFAULT 0,
        last_executed_at TIMESTAMP NULL,
        date_recorded DATE NOT NULL,
        UNIQUE KEY unique_query_hash_date (query_hash, date_recorded),
        INDEX idx_date_recorded (date_recorded),
        INDEX idx_query_hash (query_hash)
      )
    `);
    console.log('✅ database_query_stats table created');
    
    // Create user activity summary table
    console.log('📝 Creating user_activity_summary table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_activity_summary (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        date_recorded DATE NOT NULL,
        login_count INT DEFAULT 0,
        api_calls_count INT DEFAULT 0,
        books_borrowed INT DEFAULT 0,
        books_returned INT DEFAULT 0,
        penalties_incurred INT DEFAULT 0,
        total_session_time_minutes INT DEFAULT 0,
        last_activity_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_date (user_id, date_recorded),
        INDEX idx_user_id (user_id),
        INDEX idx_date_recorded (date_recorded)
      )
    `);
    console.log('✅ user_activity_summary table created');
    
    // Insert initial health check
    console.log('📝 Inserting initial health check...');
    await pool.execute(`
      INSERT IGNORE INTO health_checks (check_name, status, message, checked_at) 
      VALUES ('Database Connection', 'healthy', 'Database connection is working properly', NOW())
    `);
    console.log('✅ Initial health check inserted');
    
    // Create logs directory
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
      console.log('📁 Created logs directory');
    }
    
    // Test the monitoring system
    console.log('\n🧪 Testing monitoring system...');
    
    // Test audit logs table
    const [auditTest] = await pool.execute('SELECT COUNT(*) as count FROM audit_logs');
    console.log(`✅ Audit logs table: ${auditTest[0].count} records`);
    
    // Test performance metrics table
    const [perfTest] = await pool.execute('SELECT COUNT(*) as count FROM performance_metrics');
    console.log(`✅ Performance metrics table: ${perfTest[0].count} records`);
    
    // Test error logs table
    const [errorTest] = await pool.execute('SELECT COUNT(*) as count FROM error_logs');
    console.log(`✅ Error logs table: ${errorTest[0].count} records`);
    
    // Test health checks table
    const [healthTest] = await pool.execute('SELECT COUNT(*) as count FROM health_checks');
    console.log(`✅ Health checks table: ${healthTest[0].count} records`);
    
    // Test system alerts table
    const [alertsTest] = await pool.execute('SELECT COUNT(*) as count FROM system_alerts');
    console.log(`✅ System alerts table: ${alertsTest[0].count} records`);
    
    console.log('\n🎉 Monitoring & Logging System setup completed successfully!');
    console.log('\n📊 Available monitoring features:');
    console.log('   • Audit logging for all user actions');
    console.log('   • Performance monitoring for API endpoints');
    console.log('   • Database query performance tracking');
    console.log('   • Error tracking and alerting');
    console.log('   • System health monitoring');
    console.log('   • Security event logging');
    console.log('   • Real-time monitoring dashboard');
    
    console.log('\n🔗 Access monitoring dashboard at: /api/monitoring/dashboard');
    console.log('🔗 Health check endpoint: /api/monitoring/health');
    
  } catch (error) {
    console.error('❌ Failed to setup monitoring system:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

setupMonitoringSystem();




