const { logger } = require('../config/logger');
const auditService = require('../services/auditService');
const performanceService = require('../services/performanceService');

/**
 * Performance monitoring middleware
 */
const performanceMonitoring = (req, res, next) => {
  const startTime = Date.now();

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;

    // Record API performance
    performanceService.recordAPICall(
      req.route?.path || req.path,
      req.method,
      duration,
      res.statusCode,
      req.user?.id || null
    );

    // Log slow requests
    if (duration > 1000) {
      logger.performance('Slow Request', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
        userId: req.user?.id || null
      });
    }

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Audit logging middleware
 */
const auditLogging = (req, res, next) => {
  // Skip logging for health checks and static files
  if (req.path.includes('/health') || req.path.includes('/static')) {
    return next();
  }

  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    // Log the request after response is sent
    setImmediate(async () => {
      try {
        const action = `${req.method.toLowerCase()}_${req.route?.name || req.path.replace(/\//g, '_')}`;
        const category = getCategoryFromPath(req.path);

        await auditService.logEvent({
          userId: req.user?.id || null,
          action,
          category,
          resourceId: req.params.id || null,
          details: {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            requestBody: sanitizeRequestBody(req.body),
            responseTime: Date.now() - req.startTime
          }
        });
      } catch (error) {
        logger.error('Failed to log audit event', { error: error.message });
      }
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Error tracking middleware
 */
const errorTracking = (err, req, res, next) => {
  // Log error to Winston
  logger.error('API Error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    userId: req.user?.id || null,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  });

  // Log security-related errors
  if (err.status === 401 || err.status === 403) {
    auditService.logSecurityEvent('unauthorized_access', {
      userId: req.user?.id || null,
      method: req.method,
      url: req.url,
      error: err.message,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });
  }

  next(err);
};

/**
 * Database query monitoring
 */
const databaseMonitoring = (req, res, next) => {
  // This will be used to wrap database calls
  next();
};

/**
 * Helper function to determine category from path
 */
function getCategoryFromPath(path) {
  if (path.includes('/auth')) return 'authentication';
  if (path.includes('/books')) return 'book_management';
  if (path.includes('/borrowing')) return 'borrowing';
  if (path.includes('/penalty')) return 'penalty';
  if (path.includes('/admin')) return 'admin';
  if (path.includes('/chatbot')) return 'api';
  return 'system';
}

/**
 * Helper function to sanitize request body for logging
 */
function sanitizeRequestBody(body) {
  if (!body) return null;

  const sanitized = { ...body };

  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Request timing middleware
 */
const requestTiming = (req, res, next) => {
  req.startTime = Date.now();
  next();
};

/**
 * Security monitoring middleware
 */
const securityMonitoring = (req, res, next) => {
  // Monitor for suspicious activity
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');

  // Check for suspicious patterns
  if (req.url.includes('..') || req.url.includes('script')) {
    auditService.logSecurityEvent('suspicious_request', {
      method: req.method,
      url: req.url,
      ipAddress: ip,
      userAgent,
      reason: 'Potential path traversal or XSS attempt'
    });
  }

  // Check for rapid requests (basic rate limiting detection)
  if (req.session && req.session.requestCount > 100) {
    auditService.logSecurityEvent('rate_limit_exceeded', {
      ipAddress: ip,
      userAgent,
      requestCount: req.session.requestCount
    });
  }

  next();
};

/**
 * Health check middleware
 */
const healthCheck = async (req, res, next) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      checks: {}
    };

    // Check database connection
    try {
      const pool = require('../config/database');
      await pool.execute('SELECT 1');
      health.checks.database = 'healthy';
    } catch (error) {
      health.checks.database = 'unhealthy';
      health.status = 'unhealthy';
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    if (memUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
      health.checks.memory = 'warning';
      if (health.status === 'healthy') health.status = 'warning';
    } else {
      health.checks.memory = 'healthy';
    }

    res.json(health);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
};

module.exports = {
  performanceMonitoring,
  auditLogging,
  errorTracking,
  databaseMonitoring,
  requestTiming,
  securityMonitoring,
  healthCheck
};
