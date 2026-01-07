const { logger } = require('../config/logger');
const pool = require('../config/database');

class PerformanceService {
  constructor() {
    this.metrics = {
      apiCalls: new Map(),
      databaseQueries: new Map(),
      responseTimes: [],
      errorRates: new Map(),
      memoryUsage: [],
      cpuUsage: []
    };

    // Start performance monitoring
    this.startMonitoring();
  }

  /**
   * Start system monitoring
   */
  startMonitoring() {
    // Monitor memory usage every 30 seconds
    setInterval(() => {
      this.recordMemoryUsage();
    }, 30000);

    // Monitor CPU usage every minute
    setInterval(() => {
      this.recordCPUUsage();
    }, 60000);

    // Log performance metrics every 5 minutes
    setInterval(() => {
      this.logPerformanceMetrics();
    }, 300000);

    logger.info('Performance monitoring started');
  }

  /**
   * Record API call performance
   */
  recordAPICall(endpoint, method, duration, statusCode, userId = null) {
    const key = `${method} ${endpoint}`;

    if (!this.metrics.apiCalls.has(key)) {
      this.metrics.apiCalls.set(key, {
        endpoint,
        method,
        totalCalls: 0,
        totalDuration: 0,
        avgDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        successCount: 0,
        errorCount: 0,
        lastCalled: null
      });
    }

    const stats = this.metrics.apiCalls.get(key);
    stats.totalCalls++;
    stats.totalDuration += duration;
    stats.avgDuration = stats.totalDuration / stats.totalCalls;
    stats.minDuration = Math.min(stats.minDuration, duration);
    stats.maxDuration = Math.max(stats.maxDuration, duration);
    stats.lastCalled = new Date();

    if (statusCode >= 200 && statusCode < 400) {
      stats.successCount++;
    } else {
      stats.errorCount++;
    }

    // Log slow API calls
    if (duration > 2000) {
      logger.performance('Slow API Call Detected', {
        endpoint,
        method,
        duration: `${duration}ms`,
        statusCode,
        userId,
        threshold: '2000ms'
      });
    }

    // Log high error rate
    const errorRate = stats.errorCount / stats.totalCalls;
    if (stats.totalCalls > 10 && errorRate > 0.1) {
      logger.performance('High Error Rate Detected', {
        endpoint,
        method,
        errorRate: `${(errorRate * 100).toFixed(2)}%`,
        totalCalls: stats.totalCalls,
        errorCount: stats.errorCount
      });
    }
  }

  /**
   * Record database query performance
   */
  recordDatabaseQuery(query, duration, rowsAffected = 0, error = null) {
    const key = this.sanitizeQuery(query);

    if (!this.metrics.databaseQueries.has(key)) {
      this.metrics.databaseQueries.set(key, {
        query: key,
        totalQueries: 0,
        totalDuration: 0,
        avgDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        totalRowsAffected: 0,
        errorCount: 0,
        lastExecuted: null
      });
    }

    const stats = this.metrics.databaseQueries.get(key);
    stats.totalQueries++;
    stats.totalDuration += duration;
    stats.avgDuration = stats.totalDuration / stats.totalQueries;
    stats.minDuration = Math.min(stats.minDuration, duration);
    stats.maxDuration = Math.max(stats.maxDuration, duration);
    stats.totalRowsAffected += rowsAffected;
    stats.lastExecuted = new Date();

    if (error) {
      stats.errorCount++;
    }

    // Log slow database queries
    if (duration > 1000) {
      logger.performance('Slow Database Query Detected', {
        query: key,
        duration: `${duration}ms`,
        rowsAffected,
        error: error?.message || null,
        threshold: '1000ms'
      });
    }

    // Log database errors
    if (error) {
      logger.performance('Database Query Error', {
        query: key,
        duration: `${duration}ms`,
        error: error.message,
        stack: error.stack
      });
    }
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage() {
    const memUsage = process.memoryUsage();
    const memoryData = {
      timestamp: new Date(),
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      arrayBuffers: Math.round(memUsage.arrayBuffers / 1024 / 1024) // MB
    };

    this.metrics.memoryUsage.push(memoryData);

    // Keep only last 100 records
    if (this.metrics.memoryUsage.length > 100) {
      this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-100);
    }

    // Log high memory usage
    if (memoryData.heapUsed > 500) { // 500MB threshold
      logger.performance('High Memory Usage Detected', {
        heapUsed: `${memoryData.heapUsed}MB`,
        heapTotal: `${memoryData.heapTotal}MB`,
        threshold: '500MB'
      });
    }
  }

  /**
   * Record CPU usage
   */
  recordCPUUsage() {
    const cpuUsage = process.cpuUsage();
    const cpuData = {
      timestamp: new Date(),
      user: cpuUsage.user,
      system: cpuUsage.system
    };

    this.metrics.cpuUsage.push(cpuData);

    // Keep only last 100 records
    if (this.metrics.cpuUsage.length > 100) {
      this.metrics.cpuUsage = this.metrics.cpuUsage.slice(-100);
    }
  }

  /**
   * Log performance metrics
   */
  logPerformanceMetrics() {
    const metrics = this.getPerformanceMetrics();

    logger.performance('Performance Metrics Summary', {
      apiMetrics: metrics.apiMetrics,
      databaseMetrics: metrics.databaseMetrics,
      systemMetrics: metrics.systemMetrics
    });
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics() {
    const apiMetrics = Array.from(this.metrics.apiCalls.values())
      .sort((a, b) => b.totalCalls - a.totalCalls)
      .slice(0, 10);

    const databaseMetrics = Array.from(this.metrics.databaseQueries.values())
      .sort((a, b) => b.totalQueries - a.totalQueries)
      .slice(0, 10);

    const latestMemory = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
    const latestCPU = this.metrics.cpuUsage[this.metrics.cpuUsage.length - 1];

    return {
      apiMetrics,
      databaseMetrics,
      systemMetrics: {
        memory: latestMemory,
        cpu: latestCPU,
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform
      }
    };
  }

  /**
   * Get performance statistics for dashboard
   */
  async getPerformanceStatistics(period = '1h') {
    try {
      const metrics = this.getPerformanceMetrics();

      // Calculate response time percentiles
      const responseTimes = Array.from(this.metrics.apiCalls.values())
        .flatMap(api => [api.avgDuration]);

      const sortedResponseTimes = responseTimes.sort((a, b) => a - b);
      const p50 = this.percentile(sortedResponseTimes, 0.5);
      const p95 = this.percentile(sortedResponseTimes, 0.95);
      const p99 = this.percentile(sortedResponseTimes, 0.99);

      // Calculate error rates
      const totalAPICalls = Array.from(this.metrics.apiCalls.values())
        .reduce((sum, api) => sum + api.totalCalls, 0);
      const totalErrors = Array.from(this.metrics.apiCalls.values())
        .reduce((sum, api) => sum + api.errorCount, 0);
      const errorRate = totalAPICalls > 0 ? (totalErrors / totalAPICalls) * 100 : 0;

      // Calculate database performance
      const totalDBQueries = Array.from(this.metrics.databaseQueries.values())
        .reduce((sum, db) => sum + db.totalQueries, 0);
      const totalDBErrors = Array.from(this.metrics.databaseQueries.values())
        .reduce((sum, db) => sum + db.errorCount, 0);
      const dbErrorRate = totalDBQueries > 0 ? (totalDBErrors / totalDBQueries) * 100 : 0;

      return {
        responseTime: {
          average: metrics.apiMetrics.reduce((sum, api) => sum + api.avgDuration, 0) / metrics.apiMetrics.length || 0,
          p50,
          p95,
          p99
        },
        errorRates: {
          api: errorRate,
          database: dbErrorRate
        },
        throughput: {
          apiCalls: totalAPICalls,
          databaseQueries: totalDBQueries
        },
        system: metrics.systemMetrics,
        topAPIs: metrics.apiMetrics.slice(0, 5),
        topQueries: metrics.databaseMetrics.slice(0, 5)
      };

    } catch (error) {
      logger.error('Failed to get performance statistics', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate percentile
   */
  percentile(arr, p) {
    if (arr.length === 0) return 0;
    const sorted = arr.sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index] || 0;
  }

  /**
   * Sanitize SQL query for logging
   */
  sanitizeQuery(query) {
    return query
      .replace(/\s+/g, ' ')
      .replace(/\d+/g, '?')
      .replace(/'[^']*'/g, "'?'")
      .replace(/"[^"]*"/g, '"?"')
      .trim()
      .substring(0, 200);
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics.apiCalls.clear();
    this.metrics.databaseQueries.clear();
    this.metrics.responseTimes = [];
    this.metrics.errorRates.clear();
    this.metrics.memoryUsage = [];
    this.metrics.cpuUsage = [];

    logger.info('Performance metrics reset');
  }
}

module.exports = new PerformanceService();
