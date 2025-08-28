import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EnhancedDashboard = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch basic stats (this endpoint is working)
      const statsResponse = await axios.get('/api/admin/user-stats', config);
      
      // Fetch login logs (this endpoint is working)
      const logsResponse = await axios.get('/api/admin/login-logs', config);

      setStats(statsResponse.data.stats);
      setLogs(logsResponse.data.logs);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch data. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Admin Dashboard</h1>

      {/* Basic Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>
            {stats?.totalUsers || 0}
          </div>
          <p>Total Users</p>
          <small style={{ color: '#666' }}>All registered users</small>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
            {stats?.verifiedUsers || 0}
          </div>
          <p>Verified Users</p>
          <small style={{ color: '#666' }}>Email verified accounts</small>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>
            {stats?.todayLogins || 0}
          </div>
          <p>Today's Logins</p>
          <small style={{ color: '#666' }}>Login activity today</small>
        </div>
      </div>

      {/* System Health */}
      <div className="card" style={{ marginTop: '30px' }}>
        <h2>System Health Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h4>User Verification Rate</h4>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {stats?.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0}%
            </div>
            <small>{stats?.verifiedUsers || 0} of {stats?.totalUsers || 0} users verified</small>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h4>Daily Activity</h4>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
              {stats?.todayLogins || 0}
            </div>
            <small>Login attempts today</small>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h4>System Status</h4>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              ✅ Online
            </div>
            <small>All systems operational</small>
          </div>
        </div>
      </div>

      {/* Recent Login Activity */}
      <div className="card" style={{ marginTop: '30px' }}>
        <h2>Recent Login Activity</h2>
        {logs.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User Type</th>
                  <th>User ID/Email</th>
                  <th>IP Address</th>
                  <th>User Agent</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 10).map((log) => (
                  <tr key={log.id}>
                    <td>{formatDate(log.login_time)}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: log.user_type === 'admin' ? '#007bff' : '#28a745',
                        color: 'white'
                      }}>
                        {log.user_type}
                      </span>
                    </td>
                    <td>
                      {log.user_type === 'admin' ? 'Admin' : (log.id_number || log.email || 'N/A')}
                    </td>
                    <td>{log.ip_address || 'N/A'}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.user_agent || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            No login activity yet.
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: '30px' }}>
        <h2>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button className="btn btn-success" onClick={() => window.location.href = '/users'}>
            👥 Manage Users
          </button>
          <button className="btn btn-info" onClick={() => window.location.href = '/activity-logs'}>
            📝 View Activity Logs
          </button>
          <button className="btn btn-secondary" onClick={fetchData}>
            🔄 Refresh Data
          </button>
        </div>
      </div>

      <button 
        className="btn btn-secondary" 
        onClick={fetchData}
        style={{ marginTop: '20px' }}
      >
        Refresh Dashboard
      </button>
    </div>
  );
};

export default EnhancedDashboard;
