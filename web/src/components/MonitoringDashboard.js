import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MonitoringDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [errorLogs, setErrorLogs] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch dashboard overview
      const dashboardResponse = await axios.get('/api/monitoring/dashboard', config);
      setDashboardData(dashboardResponse.data.data);

      // Fetch audit logs
      const auditResponse = await axios.get('/api/monitoring/audit-logs?limit=20', config);
      setAuditLogs(auditResponse.data.data);

      // Fetch performance metrics
      const performanceResponse = await axios.get('/api/monitoring/performance', config);
      setPerformanceMetrics(performanceResponse.data.data);

      // Fetch error logs
      const errorResponse = await axios.get('/api/monitoring/errors?limit=10', config);
      setErrorLogs(errorResponse.data.data);

      // Fetch system alerts
      const alertsResponse = await axios.get('/api/monitoring/alerts?limit=10', config);
      setSystemAlerts(alertsResponse.data.data);

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return '#28a745';
      case 'warning': return '#ffc107';
      case 'critical': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p>Loading monitoring data...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2>🔍 System Monitoring Dashboard</h2>
        <p>Real-time monitoring of system performance, logs, and alerts</p>
      </div>

      {/* Tab Navigation */}
      <ul className="nav nav-tabs" style={{ marginBottom: '20px' }}>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            📝 Audit Logs
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            ⚡ Performance
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'errors' ? 'active' : ''}`}
            onClick={() => setActiveTab('errors')}
          >
            🚨 Errors
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            🔔 Alerts
          </button>
        </li>
      </ul>

      {/* Overview Tab */}
      {activeTab === 'overview' && dashboardData && (
        <div>
          {/* System Health Cards */}
          <div className="row" style={{ marginBottom: '20px' }}>
            <div className="col-md-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">System Status</h5>
                  <p className="card-text">
                    <span 
                      className="badge" 
                      style={{ 
                        backgroundColor: getStatusColor(dashboardData.systemHealth.status),
                        color: 'white'
                      }}
                    >
                      {dashboardData.systemHealth.status.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Uptime</h5>
                  <p className="card-text">{formatUptime(dashboardData.systemHealth.uptime)}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Memory Usage</h5>
                  <p className="card-text">
                    {formatBytes(dashboardData.systemHealth.memory.heapUsed)} / {formatBytes(dashboardData.systemHealth.memory.heapTotal)}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Node Version</h5>
                  <p className="card-text">{dashboardData.systemHealth.version}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error and Alert Statistics */}
          <div className="row" style={{ marginBottom: '20px' }}>
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5>Error Statistics</h5>
                </div>
                <div className="card-body">
                  <p><strong>Total Errors:</strong> {dashboardData.errorStats.total_errors}</p>
                  <p><strong>Unresolved:</strong> {dashboardData.errorStats.unresolved_errors}</p>
                  <p><strong>Last 24h:</strong> {dashboardData.errorStats.errors_last_24h}</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5>Alert Statistics</h5>
                </div>
                <div className="card-body">
                  <p><strong>Total Alerts:</strong> {dashboardData.alertStats.total_alerts}</p>
                  <p><strong>Unresolved:</strong> {dashboardData.alertStats.unresolved_alerts}</p>
                  <p><strong>Critical:</strong> {dashboardData.alertStats.critical_alerts}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <h5>Recent Activity (Last 24 Hours)</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Action</th>
                      <th>Category</th>
                      <th>User</th>
                      <th>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentActivity.map((activity, index) => (
                      <tr key={index}>
                        <td>{new Date(activity.created_at).toLocaleString()}</td>
                        <td>{activity.action}</td>
                        <td>
                          <span className="badge badge-secondary">{activity.category}</span>
                        </td>
                        <td>
                          {activity.user_identifier || 'System'}
                          <small className="text-muted d-block">{activity.user_type}</small>
                        </td>
                        <td>{activity.ip_address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="card">
          <div className="card-header">
            <h5>Audit Logs</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Category</th>
                    <th>User</th>
                    <th>IP Address</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log, index) => (
                    <tr key={index}>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                      <td>{log.action}</td>
                      <td>
                        <span className="badge badge-info">{log.category}</span>
                      </td>
                      <td>{log.student_id || log.user_email || log.admin_email || 'System'}</td>
                      <td>{log.ip_address}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-info"
                          onClick={() => alert(JSON.stringify(log.details, null, 2))}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && performanceMetrics && (
        <div>
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5>Response Time Metrics</h5>
                </div>
                <div className="card-body">
                  <p><strong>Average:</strong> {performanceMetrics.responseTime.average.toFixed(2)}ms</p>
                  <p><strong>P50:</strong> {performanceMetrics.responseTime.p50.toFixed(2)}ms</p>
                  <p><strong>P95:</strong> {performanceMetrics.responseTime.p95.toFixed(2)}ms</p>
                  <p><strong>P99:</strong> {performanceMetrics.responseTime.p99.toFixed(2)}ms</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5>Error Rates</h5>
                </div>
                <div className="card-body">
                  <p><strong>API Error Rate:</strong> {performanceMetrics.errorRates.api.toFixed(2)}%</p>
                  <p><strong>Database Error Rate:</strong> {performanceMetrics.errorRates.database.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '20px' }}>
            <div className="card-header">
              <h5>Top API Endpoints</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Endpoint</th>
                      <th>Method</th>
                      <th>Total Calls</th>
                      <th>Avg Response Time</th>
                      <th>Error Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceMetrics.topAPIs.map((api, index) => (
                      <tr key={index}>
                        <td>{api.endpoint}</td>
                        <td>{api.method}</td>
                        <td>{api.totalCalls}</td>
                        <td>{api.avgDuration.toFixed(2)}ms</td>
                        <td>
                          <span 
                            className="badge" 
                            style={{ 
                              backgroundColor: api.errorCount > 0 ? '#dc3545' : '#28a745',
                              color: 'white'
                            }}
                          >
                            {((api.errorCount / api.totalCalls) * 100).toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Errors Tab */}
      {activeTab === 'errors' && (
        <div className="card">
          <div className="card-header">
            <h5>Error Logs</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Error Type</th>
                    <th>Message</th>
                    <th>User</th>
                    <th>Endpoint</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {errorLogs.map((error, index) => (
                    <tr key={index}>
                      <td>{new Date(error.created_at).toLocaleString()}</td>
                      <td>
                        <span className="badge badge-danger">{error.error_type}</span>
                      </td>
                      <td>{error.error_message.substring(0, 100)}...</td>
                      <td>{error.student_id || error.user_email || error.admin_email || 'N/A'}</td>
                      <td>{error.endpoint}</td>
                      <td>
                        <span 
                          className="badge" 
                          style={{ 
                            backgroundColor: error.resolved ? '#28a745' : '#dc3545',
                            color: 'white'
                          }}
                        >
                          {error.resolved ? 'Resolved' : 'Unresolved'}
                        </span>
                      </td>
                      <td>
                        {!error.resolved && (
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={() => {
                              // Implement resolve error functionality
                              console.log('Resolve error:', error.id);
                            }}
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="card">
          <div className="card-header">
            <h5>System Alerts</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Title</th>
                    <th>Message</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {systemAlerts.map((alert, index) => (
                    <tr key={index}>
                      <td>{new Date(alert.created_at).toLocaleString()}</td>
                      <td>
                        <span className="badge badge-info">{alert.alert_type}</span>
                      </td>
                      <td>
                        <span 
                          className="badge" 
                          style={{ 
                            backgroundColor: getSeverityColor(alert.severity),
                            color: 'white'
                          }}
                        >
                          {alert.severity.toUpperCase()}
                        </span>
                      </td>
                      <td>{alert.title}</td>
                      <td>{alert.message.substring(0, 100)}...</td>
                      <td>
                        <span 
                          className="badge" 
                          style={{ 
                            backgroundColor: alert.resolved ? '#28a745' : '#ffc107',
                            color: 'white'
                          }}
                        >
                          {alert.resolved ? 'Resolved' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoringDashboard;

