-- Monitoring & Logging System Database Schema
-- This file contains the database tables for audit logs, performance metrics, and system monitoring

-- Audit logs table for tracking user actions and system events
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
);

-- Performance metrics table for storing aggregated performance data
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
);

-- Error logs table for tracking system errors
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
);

-- System health checks table
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
);

-- API usage statistics table
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
);

-- Database query performance table
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
);

-- System alerts table
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
);

-- User activity summary table (for dashboard)
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
);

-- Create indexes for better performance
CREATE INDEX idx_audit_logs_composite ON audit_logs (category, created_at, user_id);
CREATE INDEX idx_performance_metrics_composite ON performance_metrics (metric_type, recorded_at);
CREATE INDEX idx_error_logs_composite ON error_logs (error_type, created_at, resolved);

-- Insert initial health check
INSERT INTO health_checks (check_name, status, message, checked_at) 
VALUES ('Database Connection', 'healthy', 'Database connection is working properly', NOW())
ON DUPLICATE KEY UPDATE 
    status = 'healthy', 
    message = 'Database connection is working properly',
    checked_at = NOW();

-- Create a view for recent audit activity
CREATE OR REPLACE VIEW recent_audit_activity AS
SELECT 
    al.id,
    al.action,
    al.category,
    al.created_at,
    al.ip_address,
    COALESCE(u.id_number, a.email) as user_identifier,
    CASE 
        WHEN u.id_number IS NOT NULL THEN 'student'
        WHEN a.email IS NOT NULL THEN 'admin'
        ELSE 'system'
    END as user_type
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
LEFT JOIN admins a ON al.user_id = a.id
WHERE al.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY al.created_at DESC;

-- Create a view for system performance summary
CREATE OR REPLACE VIEW system_performance_summary AS
SELECT 
    DATE(recorded_at) as date,
    COUNT(*) as total_metrics,
    AVG(CASE WHEN metric_type = 'api' THEN metric_value END) as avg_api_response_time,
    AVG(CASE WHEN metric_type = 'database' THEN metric_value END) as avg_db_response_time,
    AVG(CASE WHEN metric_type = 'memory' THEN metric_value END) as avg_memory_usage,
    MAX(CASE WHEN metric_type = 'memory' THEN metric_value END) as max_memory_usage
FROM performance_metrics 
WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(recorded_at)
ORDER BY date DESC;

