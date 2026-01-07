const pool = require('../config/database');
const { logger } = require('../config/logger');

class AuditService {
  /**
   * Log user authentication events
   */
  async logAuthentication(userId, action, details = {}) {
    try {
      await this.logEvent({
        userId,
        action: `auth_${action}`,
        category: 'authentication',
        details: {
          ...details,
          timestamp: new Date().toISOString()
        }
      });

      logger.audit(`Authentication ${action}`, {
        userId,
        action,
        details
      });
    } catch (error) {
      logger.error('Failed to log authentication event', { error: error.message, userId, action });
    }
  }

  /**
   * Log book-related operations
   */
  async logBookOperation(userId, action, bookId, details = {}) {
    try {
      await this.logEvent({
        userId,
        action: `book_${action}`,
        category: 'book_management',
        resourceId: bookId,
        details: {
          ...details,
          timestamp: new Date().toISOString()
        }
      });

      logger.audit(`Book ${action}`, {
        userId,
        bookId,
        action,
        details
      });
    } catch (error) {
      logger.error('Failed to log book operation', { error: error.message, userId, action, bookId });
    }
  }

  /**
   * Log borrowing operations
   */
  async logBorrowingOperation(userId, action, borrowingId, details = {}) {
    try {
      await this.logEvent({
        userId,
        action: `borrowing_${action}`,
        category: 'borrowing',
        resourceId: borrowingId,
        details: {
          ...details,
          timestamp: new Date().toISOString()
        }
      });

      logger.audit(`Borrowing ${action}`, {
        userId,
        borrowingId,
        action,
        details
      });
    } catch (error) {
      logger.error('Failed to log borrowing operation', { error: error.message, userId, action, borrowingId });
    }
  }

  /**
   * Log penalty operations
   */
  async logPenaltyOperation(userId, action, penaltyId, details = {}) {
    try {
      await this.logEvent({
        userId,
        action: `penalty_${action}`,
        category: 'penalty',
        resourceId: penaltyId,
        details: {
          ...details,
          timestamp: new Date().toISOString()
        }
      });

      logger.audit(`Penalty ${action}`, {
        userId,
        penaltyId,
        action,
        details
      });
    } catch (error) {
      logger.error('Failed to log penalty operation', { error: error.message, userId, action, penaltyId });
    }
  }

  /**
   * Log admin operations
   */
  async logAdminOperation(adminId, action, details = {}) {
    try {
      await this.logEvent({
        userId: adminId,
        action: `admin_${action}`,
        category: 'admin',
        details: {
          ...details,
          timestamp: new Date().toISOString()
        }
      });

      logger.audit(`Admin ${action}`, {
        adminId,
        action,
        details
      });
    } catch (error) {
      logger.error('Failed to log admin operation', { error: error.message, adminId, action });
    }
  }

  /**
   * Log system events
   */
  async logSystemEvent(event, details = {}) {
    try {
      await this.logEvent({
        userId: null,
        action: `system_${event}`,
        category: 'system',
        details: {
          ...details,
          timestamp: new Date().toISOString()
        }
      });

      logger.audit(`System Event: ${event}`, {
        event,
        details
      });
    } catch (error) {
      logger.error('Failed to log system event', { error: error.message, event });
    }
  }

  /**
   * Log security events
   */
  async logSecurityEvent(event, details = {}) {
    try {
      await this.logEvent({
        userId: details.userId || null,
        action: `security_${event}`,
        category: 'security',
        details: {
          ...details,
          timestamp: new Date().toISOString()
        }
      });

      logger.security(`Security Event: ${event}`, {
        event,
        details
      });
    } catch (error) {
      logger.error('Failed to log security event', { error: error.message, event });
    }
  }

  /**
   * Core method to log events to database
   */
  async logEvent({ userId, action, category, resourceId = null, details = {} }) {
    try {
      await pool.execute(`
        INSERT INTO audit_logs (
          user_id, action, category, resource_id, details, ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        userId,
        action,
        category,
        resourceId,
        JSON.stringify(details),
        details.ipAddress || null,
        details.userAgent || null
      ]);
    } catch (error) {
      logger.error('Failed to insert audit log', { error: error.message, userId, action, category });
      throw error;
    }
  }

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(filters = {}) {
    try {
      let query = `
        SELECT
          al.id,
          al.user_id,
          al.action,
          al.category,
          al.resource_id,
          al.details,
          al.ip_address,
          al.user_agent,
          al.created_at,
          u.id_number as student_id,
          u.email as user_email,
          a.email as admin_email
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        LEFT JOIN users a ON al.user_id = a.id AND a.role = 'admin'
        WHERE 1=1
      `;

      const params = [];

      if (filters.userId) {
        query += ' AND al.user_id = ?';
        params.push(filters.userId);
      }

      if (filters.category) {
        query += ' AND al.category = ?';
        params.push(filters.category);
      }

      if (filters.action) {
        query += ' AND al.action LIKE ?';
        params.push(`%${filters.action}%`);
      }

      if (filters.startDate) {
        query += ' AND al.created_at >= ?';
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        query += ' AND al.created_at <= ?';
        params.push(filters.endDate);
      }

      query += ' ORDER BY al.created_at DESC';

      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
      }

      const [logs] = await pool.execute(query, params);

      // Parse JSON details
      return logs.map(log => ({
        ...log,
        details: JSON.parse(log.details || '{}')
      }));

    } catch (error) {
      logger.error('Failed to get audit logs', { error: error.message, filters });
      throw error;
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics(period = '7d') {
    try {
      let dateFilter = '';
      const params = [];

      switch (period) {
        case '1d':
          dateFilter = 'AND al.created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)';
          break;
        case '7d':
          dateFilter = 'AND al.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
          break;
        case '30d':
          dateFilter = 'AND al.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
          break;
        case '90d':
          dateFilter = 'AND al.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
          break;
      }

      // Get category statistics
      const [categoryStats] = await pool.execute(`
        SELECT
          category,
          COUNT(*) as count,
          COUNT(DISTINCT user_id) as unique_users
        FROM audit_logs al
        WHERE 1=1 ${dateFilter}
        GROUP BY category
        ORDER BY count DESC
      `, params);

      // Get action statistics
      const [actionStats] = await pool.execute(`
        SELECT
          action,
          COUNT(*) as count
        FROM audit_logs al
        WHERE 1=1 ${dateFilter}
        GROUP BY action
        ORDER BY count DESC
        LIMIT 20
      `, params);

      // Get daily activity
      const [dailyActivity] = await pool.execute(`
        SELECT
          DATE(al.created_at) as date,
          COUNT(*) as count,
          COUNT(DISTINCT user_id) as unique_users
        FROM audit_logs al
        WHERE 1=1 ${dateFilter}
        GROUP BY DATE(al.created_at)
        ORDER BY date DESC
      `, params);

      return {
        categoryStats,
        actionStats,
        dailyActivity,
        period
      };

    } catch (error) {
      logger.error('Failed to get audit statistics', { error: error.message, period });
      throw error;
    }
  }
}

module.exports = new AuditService();
