import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ user }) => {
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

      const [statsResponse, logsResponse] = await Promise.all([
        axios.get('/api/admin/user-stats', config),
        axios.get('/api/admin/login-logs', config)
      ]);

      setStats(statsResponse.data.stats);
      setLogs(logsResponse.data.logs);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
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

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats?.totalUsers || 0}</h3>
          <p>Total Users</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.verifiedUsers || 0}</h3>
          <p>Verified Users</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.todayLogins || 0}</h3>
          <p>Today's Logins</p>
        </div>
      </div>

      {/* Login Logs */}
      <div className="card">
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
                {logs.map((log) => (
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

      <button 
        className="btn btn-secondary" 
        onClick={fetchData}
        style={{ marginTop: '20px' }}
      >
        Refresh Data
      </button>
    </div>
  );
};

export default Dashboard;
