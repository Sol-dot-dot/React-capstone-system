const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { logger } = require('../config/logger');
const auditService = require('../services/auditService');
const performanceService = require('../services/performanceService');
const { healthCheck } = require('../middleware/monitoring');

/**
 * Health check endpoint
 */
router.get('/health', healthCheck);

/**
 * Get audit logs (Admin only)
 */
router.get('/audit-logs', auth, async (req, res) => {
  try {
    const {
      userId,
      category,
      action,
      startDate,
      endDate,
      limit = 100,
      page = 1
    } = req.query;
    
    const filters = {
      userId: userId ? parseInt(userId) : undefined,
      category,
      action,
      startDate,
      endDate,
      limit: parseInt(limit)
    };
    
    const logs = await auditService.getAuditLogs(filters);
    
    // Log the audit log access
    await auditService.logAdminOperation(req.user.id, 'view_audit_logs', {
      filters,
      resultCount: logs.length
    });
    
    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: logs.length
      }
    });
    
  } catch (error) {
    logger.error('Failed to get audit logs', { error: error.message, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit logs'
    });
  }
});

/**
 * Get audit statistics (Admin only)
 */
router.get('/audit-statistics', auth, async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    const statistics = await auditService.getAuditStatistics(period);
    
    // Log the statistics access
    await auditService.logAdminOperation(req.user.id, 'view_audit_statistics', {
      period
    });
    
    res.json({
      success: true,
      data: statistics
    });
    
  } catch (error) {
    logger.error('Failed to get audit statistics', { error: error.message, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit statistics'
    });
  }
});

/**
 * Get performance metrics (Admin only)
 */
router.get('/performance', auth, async (req, res) => {
  try {
    const { period = '1h' } = req.query;
    
    const metrics = await performanceService.getPerformanceStatistics(period);
    
    // Log the performance metrics access
    await auditService.logAdminOperation(req.user.id, 'view_performance_metrics', {
      period
    });
    
    res.json({
      success: true,
      data: metrics
    });
    
  } catch (error) {
    logger.error('Failed to get performance metrics', { error: error.message, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve performance metrics'
    });
  }
});

/**
 * Get system logs (Admin only)
 */
router.get('/logs', auth, async (req, res) => {
  try {
    const { level = 'info', limit = 100 } = req.query;
    
    // This would typically read from log files
    // For now, we'll return a placeholder response
    const logs = {
      message: 'Log file reading not implemented yet',
      level,
      limit: parseInt(limit)
    };
    
    // Log the log access
    await auditService.logAdminOperation(req.user.id, 'view_system_logs', {
      level,
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: logs
    });
    
  } catch (error) {
    logger.error('Failed to get system logs', { error: error.message, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve system logs'
    });
  }
});

/**
 * Get error logs (Admin only)
 */
router.get('/errors', auth, async (req, res) => {
  try {
    const pool = require('../config/database');
    const { limit = 50, resolved = false } = req.query;
    
    const [errors] = await pool.execute(`
      SELECT 
        el.*,
        u.id_number as student_id,
        u.email as user_email,
        a.email as admin_email
      FROM error_logs el
      LEFT JOIN users u ON el.user_id = u.id
      LEFT JOIN admins a ON el.user_id = a.id
      WHERE el.resolved = ?
      ORDER BY el.created_at DESC
      LIMIT ?
    `, [resolved === 'true', parseInt(limit)]);
    
    // Log the error logs access
    await auditService.logAdminOperation(req.user.id, 'view_error_logs', {
      limit: parseInt(limit),
      resolved: resolved === 'true'
    });
    
    res.json({
      success: true,
      data: errors
    });
    
  } catch (error) {
    logger.error('Failed to get error logs', { error: error.message, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve error logs'
    });
  }
});

/**
 * Mark error as resolved (Admin only)
 */
router.patch('/errors/:id/resolve', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = require('../config/database');
    
    await pool.execute(`
      UPDATE error_logs 
      SET resolved = TRUE, resolved_at = NOW(), resolved_by = ?
      WHERE id = ?
    `, [req.user.id, id]);
    
    // Log the error resolution
    await auditService.logAdminOperation(req.user.id, 'resolve_error', {
      errorId: id
    });
    
    res.json({
      success: true,
      message: 'Error marked as resolved'
    });
    
  } catch (error) {
    logger.error('Failed to resolve error', { error: error.message, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Failed to resolve error'
    });
  }
});

/**
 * Get system alerts (Admin only)
 */
router.get('/alerts', auth, async (req, res) => {
  try {
    const pool = require('../config/database');
    const { severity, resolved = false, limit = 50 } = req.query;
    
    let query = `
      SELECT 
        sa.*,
        a.email as resolved_by_email
      FROM system_alerts sa
      LEFT JOIN admins a ON sa.resolved_by = a.id
      WHERE sa.resolved = ?
    `;
    const params = [resolved === 'true'];
    
    if (severity) {
      query += ' AND sa.severity = ?';
      params.push(severity);
    }
    
    query += ' ORDER BY sa.created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const [alerts] = await pool.execute(query, params);
    
    // Log the alerts access
    await auditService.logAdminOperation(req.user.id, 'view_system_alerts', {
      severity,
      resolved: resolved === 'true',
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: alerts
    });
    
  } catch (error) {
    logger.error('Failed to get system alerts', { error: error.message, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve system alerts'
    });
  }
});

/**
 * Create system alert (Admin only)
 */
router.post('/alerts', auth, async (req, res) => {
  try {
    const { alert_type, severity, title, message, metadata } = req.body;
    
    if (!alert_type || !severity || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: alert_type, severity, title, message'
      });
    }
    
    const pool = require('../config/database');
    
    await pool.execute(`
      INSERT INTO system_alerts (alert_type, severity, title, message, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [alert_type, severity, title, message, JSON.stringify(metadata || {})]);
    
    // Log the alert creation
    await auditService.logAdminOperation(req.user.id, 'create_system_alert', {
      alert_type,
      severity,
      title
    });
    
    res.json({
      success: true,
      message: 'System alert created successfully'
    });
    
  } catch (error) {
    logger.error('Failed to create system alert', { error: error.message, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Failed to create system alert'
    });
  }
});

/**
 * Reset performance metrics (Admin only)
 */
router.post('/performance/reset', auth, async (req, res) => {
  try {
    performanceService.resetMetrics();
    
    // Log the metrics reset
    await auditService.logAdminOperation(req.user.id, 'reset_performance_metrics');
    
    res.json({
      success: true,
      message: 'Performance metrics reset successfully'
    });
    
  } catch (error) {
    logger.error('Failed to reset performance metrics', { error: error.message, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Failed to reset performance metrics'
    });
  }
});

/**
 * Get monitoring dashboard data (Admin only)
 */
router.get('/dashboard', auth, async (req, res) => {
  try {
    const pool = require('../config/database');
    
    // Get recent audit activity
    const [recentActivity] = await pool.execute(`
      SELECT * FROM recent_audit_activity 
      LIMIT 20
    `);
    
    // Get system performance summary
    const [performanceSummary] = await pool.execute(`
      SELECT * FROM system_performance_summary 
      LIMIT 7
    `);
    
    // Get error statistics
    const [errorStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_errors,
        COUNT(CASE WHEN resolved = FALSE THEN 1 END) as unresolved_errors,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as errors_last_24h
      FROM error_logs
    `);
    
    // Get alert statistics
    const [alertStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_alerts,
        COUNT(CASE WHEN resolved = FALSE THEN 1 END) as unresolved_alerts,
        COUNT(CASE WHEN severity = 'critical' AND resolved = FALSE THEN 1 END) as critical_alerts
      FROM system_alerts
    `);
    
    // Log the dashboard access
    await auditService.logAdminOperation(req.user.id, 'view_monitoring_dashboard');
    
    res.json({
      success: true,
      data: {
        recentActivity,
        performanceSummary,
        errorStats: errorStats[0],
        alertStats: alertStats[0],
        systemHealth: {
          status: 'healthy',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date().toISOString()
        }
      }
    });
    
  } catch (error) {
    logger.error('Failed to get monitoring dashboard data', { error: error.message, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve monitoring dashboard data'
    });
  }
});

module.exports = router;
