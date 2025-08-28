import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, login, registration
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(20);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      console.log('Fetching activity logs from:', '/api/admin/activity-logs');
      const response = await axios.get('/api/admin/activity-logs', config);
      console.log('Activity logs response:', response.data);
      
      setLogs(response.data.logs);
    } catch (err) {
      console.error('Activity logs fetch error:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      
      if (err.code === 'ECONNREFUSED') {
        setError('Cannot connect to server. Please ensure the backend server is running on port 5000.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to fetch activity logs. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'login':
        return '🔐';
      case 'registration':
        return '👤';
      default:
        return '📝';
    }
  };

  const getActivityColor = (activityType) => {
    switch (activityType) {
      case 'login':
        return '#28a745';
      case 'registration':
        return '#007bff';
      default:
        return '#6c757d';
    }
  };

  // Filter logs based on activity type and search term
  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.activity_type === filter;
    const matchesSearch = searchTerm === '' || 
      (log.id_number && log.id_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.email && log.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div className="loading">Loading activity logs...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error Loading Activity Logs</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchActivityLogs} style={{ marginTop: '10px' }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>System Activity Logs</h1>

      {/* Filter Controls and Stats */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h3>Total Activities: {logs.length}</h3>
            <p>Logins: {logs.filter(log => log.activity_type === 'login').length} | Registrations: {logs.filter(log => log.activity_type === 'registration').length}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="all">All Activities</option>
              <option value="login">Logins Only</option>
              <option value="registration">Registrations Only</option>
            </select>
            <input
              type="text"
              placeholder="Search by user ID or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '200px' }}
            />
            <button className="btn btn-secondary" onClick={fetchActivityLogs}>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="card">
        <h2>Recent System Activity ({filteredLogs.length})</h2>
        {currentLogs.length > 0 ? (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Activity</th>
                    <th>User</th>
                    <th>IP Address</th>
                    <th>User Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLogs.map((log, index) => (
                    <tr key={index}>
                      <td>{formatDate(log.timestamp)}</td>
                      <td>
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: getActivityColor(log.activity_type),
                          color: 'white'
                        }}>
                          {getActivityIcon(log.activity_type)}
                          {log.activity_type.charAt(0).toUpperCase() + log.activity_type.slice(1)}
                        </span>
                      </td>
                      <td>
                        {log.id_number || log.email || 'N/A'}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '10px' }}>
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    className={`btn btn-sm ${currentPage === number ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => paginate(number)}
                  >
                    {number}
                  </button>
                ))}
                
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            {searchTerm || filter !== 'all' ? 'No activities found matching your criteria.' : 'No activity logs found.'}
          </p>
        )}
      </div>

      {/* Activity Summary */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Activity Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
              {logs.filter(log => log.activity_type === 'registration').length}
            </div>
            <div>Total Registrations</div>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {logs.filter(log => log.activity_type === 'login').length}
            </div>
            <div>Total Logins</div>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6c757d' }}>
              {logs.length}
            </div>
            <div>Total Activities</div>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
              {logs.filter(log => new Date(log.timestamp).toDateString() === new Date().toDateString()).length}
            </div>
            <div>Today's Activities</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
