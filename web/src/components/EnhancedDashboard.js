


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUsers, FiUserCheck, FiLogIn, FiBook, FiActivity, FiTrendingUp } from 'react-icons/fi';
import designSystem from '../styles/designSystem';

const EnhancedDashboard = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [bookStats, setBookStats] = useState(null);
  const [aiAnalytics, setAiAnalytics] = useState(null);
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

      // Try to fetch book statistics (optional - won't break dashboard if it fails)
      try {
        const bookStatsResponse = await axios.get('/api/books/stats/overview', config);
        setBookStats(bookStatsResponse.data.data);
      } catch (bookError) {
        console.warn('Book statistics not available:', bookError.message);
        setBookStats({ totalBooks: 0, statusStats: [], genreStats: [], monthlyAdded: 0 });
      }

      // Try to fetch AI analytics (optional - won't break dashboard if it fails)
      try {
        const aiAnalyticsResponse = await axios.get('/api/chatbot/analytics', config);
        setAiAnalytics(aiAnalyticsResponse.data.data);
      } catch (aiError) {
        console.warn('AI analytics not available:', aiError.message);
        setAiAnalytics(null);
      }
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

  const dashboardStyles = {
    container: {
      padding: designSystem.spacing[6],
    },
    header: {
      marginBottom: designSystem.spacing[8],
    },
    title: {
      fontSize: designSystem.typography.fontSize['3xl'],
      fontWeight: designSystem.typography.fontWeight.bold,
      color: designSystem.colors.semantic.text.primary,
      margin: 0,
    },
    subtitle: {
      fontSize: designSystem.typography.fontSize.lg,
      color: designSystem.colors.semantic.text.secondary,
      margin: `${designSystem.spacing[2]} 0 0 0`,
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: designSystem.spacing[6],
      marginBottom: designSystem.spacing[8],
    },
    statCard: {
      backgroundColor: designSystem.colors.semantic.surfaceElevated,
      borderRadius: designSystem.borderRadius.xl,
      padding: designSystem.spacing[6],
      boxShadow: designSystem.shadows.md,
      border: `1px solid ${designSystem.colors.semantic.border}`,
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: designSystem.shadows.lg,
      },
    },
    statHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: designSystem.spacing[4],
    },
    statIcon: {
      width: '48px',
      height: '48px',
      borderRadius: designSystem.borderRadius.lg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      color: designSystem.colors.neutral.white,
    },
    statValue: {
      fontSize: designSystem.typography.fontSize['3xl'],
      fontWeight: designSystem.typography.fontWeight.bold,
      color: designSystem.colors.semantic.text.primary,
      margin: 0,
    },
    statLabel: {
      fontSize: designSystem.typography.fontSize.sm,
      fontWeight: designSystem.typography.fontWeight.medium,
      color: designSystem.colors.semantic.text.secondary,
      margin: `${designSystem.spacing[2]} 0 0 0`,
    },
    statDescription: {
      fontSize: designSystem.typography.fontSize.xs,
      color: designSystem.colors.semantic.text.tertiary,
      margin: `${designSystem.spacing[1]} 0 0 0`,
    },
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      description: 'All registered users',
      icon: FiUsers,
      color: designSystem.colors.primary[600],
    },
    {
      title: 'Verified Users',
      value: stats?.verifiedUsers || 0,
      description: 'Email verified accounts',
      icon: FiUserCheck,
      color: designSystem.colors.accent.success,
    },
    {
      title: "Today's Logins",
      value: stats?.todayLogins || 0,
      description: 'Login activity today',
      icon: FiLogIn,
      color: designSystem.colors.accent.warning,
    },
    {
      title: 'Total Books',
      value: bookStats?.totalBooks || 0,
      description: 'Books in library',
      icon: FiBook,
      color: designSystem.colors.primary[800],
    },
  ];

  return (
    <div style={dashboardStyles.container}>
      <div style={dashboardStyles.header}>
        <h1 style={dashboardStyles.title}>SMC Library System Dashboard</h1>
        <p style={dashboardStyles.subtitle}>St. Michael's College Library Management System Overview</p>
      </div>

      {/* Statistics Cards */}
      <div style={dashboardStyles.statsGrid}>
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} style={dashboardStyles.statCard}>
              <div style={dashboardStyles.statHeader}>
                <div style={{ ...dashboardStyles.statIcon, backgroundColor: card.color }}>
                  <Icon />
                </div>
                <div style={dashboardStyles.statValue}>{card.value}</div>
              </div>
              <h3 style={dashboardStyles.statLabel}>{card.title}</h3>
              <p style={dashboardStyles.statDescription}>{card.description}</p>
            </div>
          );
        })}
      </div>

      {/* System Health */}
      <div style={{
        ...dashboardStyles.statCard,
        marginBottom: designSystem.spacing[8],
      }}>
        <div style={dashboardStyles.statHeader}>
          <div style={{ ...dashboardStyles.statIcon, backgroundColor: designSystem.colors.accent.success }}>
            <FiActivity />
          </div>
          <h2 style={{ ...dashboardStyles.statLabel, fontSize: designSystem.typography.fontSize.xl, margin: 0 }}>
            System Health Overview
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: designSystem.spacing[4],
        }}>
          <div style={{ 
            padding: designSystem.spacing[4], 
            backgroundColor: designSystem.colors.semantic.surface, 
            borderRadius: designSystem.borderRadius.lg,
            textAlign: 'center',
          }}>
            <h4 style={{ ...dashboardStyles.statLabel, marginBottom: designSystem.spacing[2] }}>User Verification Rate</h4>
            <div style={{ 
              fontSize: designSystem.typography.fontSize['2xl'], 
              fontWeight: designSystem.typography.fontWeight.bold, 
              color: designSystem.colors.accent.success,
              marginBottom: designSystem.spacing[1],
            }}>
              {stats?.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0}%
            </div>
            <small style={{ ...dashboardStyles.statDescription }}>
              {stats?.verifiedUsers || 0} of {stats?.totalUsers || 0} users verified
            </small>
          </div>
          <div style={{ 
            padding: designSystem.spacing[4], 
            backgroundColor: designSystem.colors.semantic.surface, 
            borderRadius: designSystem.borderRadius.lg,
            textAlign: 'center',
          }}>
            <h4 style={{ ...dashboardStyles.statLabel, marginBottom: designSystem.spacing[2] }}>Daily Activity</h4>
            <div style={{ 
              fontSize: designSystem.typography.fontSize['2xl'], 
              fontWeight: designSystem.typography.fontWeight.bold, 
              color: designSystem.colors.primary[600],
              marginBottom: designSystem.spacing[1],
            }}>
              {stats?.todayLogins || 0}
            </div>
            <small style={{ ...dashboardStyles.statDescription }}>Login attempts today</small>
          </div>
          <div style={{ 
            padding: designSystem.spacing[4], 
            backgroundColor: designSystem.colors.semantic.surface, 
            borderRadius: designSystem.borderRadius.lg,
            textAlign: 'center',
          }}>
            <h4 style={{ ...dashboardStyles.statLabel, marginBottom: designSystem.spacing[2] }}>System Status</h4>
            <div style={{ 
              fontSize: designSystem.typography.fontSize['2xl'], 
              fontWeight: designSystem.typography.fontWeight.bold, 
              color: designSystem.colors.accent.success,
              marginBottom: designSystem.spacing[1],
            }}>
              ✅ Online
            </div>
            <small style={{ ...dashboardStyles.statDescription }}>All systems operational</small>
          </div>
        </div>
      </div>

      {/* AI Reading Analytics */}
      {aiAnalytics && (
        <div style={{
          ...dashboardStyles.statCard,
          marginBottom: designSystem.spacing[8],
        }}>
          <div style={dashboardStyles.statHeader}>
            <div style={{ ...dashboardStyles.statIcon, backgroundColor: designSystem.colors.accent.warning }}>
              <FiBook />
            </div>
            <h2 style={{ ...dashboardStyles.statLabel, fontSize: designSystem.typography.fontSize.xl, margin: 0 }}>
              AI Reading Analytics
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: designSystem.spacing[4],
            marginBottom: designSystem.spacing[6],
          }}>
            <div style={{ 
              padding: designSystem.spacing[4], 
              backgroundColor: designSystem.colors.semantic.surface, 
              borderRadius: designSystem.borderRadius.lg,
              textAlign: 'center',
            }}>
              <h4 style={{ ...dashboardStyles.statLabel, marginBottom: designSystem.spacing[2] }}>Total Borrows</h4>
              <div style={{ 
                fontSize: designSystem.typography.fontSize['2xl'], 
                fontWeight: designSystem.typography.fontWeight.bold, 
                color: designSystem.colors.primary[600],
                marginBottom: designSystem.spacing[1],
              }}>
                {aiAnalytics.overall?.total_borrows || 0}
              </div>
              <small style={{ ...dashboardStyles.statDescription }}>All-time book borrows</small>
            </div>
            <div style={{ 
              padding: designSystem.spacing[4], 
              backgroundColor: designSystem.colors.semantic.surface, 
              borderRadius: designSystem.borderRadius.lg,
              textAlign: 'center',
            }}>
              <h4 style={{ ...dashboardStyles.statLabel, marginBottom: designSystem.spacing[2] }}>Active Readers</h4>
              <div style={{ 
                fontSize: designSystem.typography.fontSize['2xl'], 
                fontWeight: designSystem.typography.fontWeight.bold, 
                color: designSystem.colors.accent.success,
                marginBottom: designSystem.spacing[1],
              }}>
                {aiAnalytics.overall?.active_readers || 0}
              </div>
              <small style={{ ...dashboardStyles.statDescription }}>Unique users who borrowed</small>
            </div>
            <div style={{ 
              padding: designSystem.spacing[4], 
              backgroundColor: designSystem.colors.semantic.surface, 
              borderRadius: designSystem.borderRadius.lg,
              textAlign: 'center',
            }}>
              <h4 style={{ ...dashboardStyles.statLabel, marginBottom: designSystem.spacing[2] }}>Completed Reads</h4>
              <div style={{ 
                fontSize: designSystem.typography.fontSize['2xl'], 
                fontWeight: designSystem.typography.fontWeight.bold, 
                color: designSystem.colors.accent.info,
                marginBottom: designSystem.spacing[1],
              }}>
                {aiAnalytics.overall?.completed_reads || 0}
              </div>
              <small style={{ ...dashboardStyles.statDescription }}>Books returned</small>
            </div>
            <div style={{ 
              padding: designSystem.spacing[4], 
              backgroundColor: designSystem.colors.semantic.surface, 
              borderRadius: designSystem.borderRadius.lg,
              textAlign: 'center',
            }}>
              <h4 style={{ ...dashboardStyles.statLabel, marginBottom: designSystem.spacing[2] }}>Avg. Reading Time</h4>
              <div style={{ 
                fontSize: designSystem.typography.fontSize['2xl'], 
                fontWeight: designSystem.typography.fontWeight.bold, 
                color: designSystem.colors.accent.warning,
                marginBottom: designSystem.spacing[1],
              }}>
                {aiAnalytics.overall?.avg_days_kept ? Math.round(aiAnalytics.overall.avg_days_kept) : 0} days
              </div>
              <small style={{ ...dashboardStyles.statDescription }}>Average per book</small>
            </div>
          </div>

          {/* Popular Genres */}
          {aiAnalytics.popularGenres && aiAnalytics.popularGenres.length > 0 && (
            <div style={{ marginBottom: designSystem.spacing[6] }}>
              <h3 style={{ ...dashboardStyles.statLabel, marginBottom: designSystem.spacing[4] }}>Most Popular Genres</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: designSystem.spacing[3],
              }}>
                {aiAnalytics.popularGenres.slice(0, 6).map((genre, index) => (
                  <div key={index} style={{ 
                    padding: designSystem.spacing[3], 
                    backgroundColor: designSystem.colors.semantic.surface, 
                    borderRadius: designSystem.borderRadius.md,
                    border: `2px solid ${designSystem.colors.primary[100]}`,
                  }}>
                    <div style={{ 
                      fontSize: designSystem.typography.fontSize.lg, 
                      fontWeight: designSystem.typography.fontWeight.semibold, 
                      color: designSystem.colors.text.primary,
                      marginBottom: designSystem.spacing[1],
                    }}>
                      {genre.genre}
                    </div>
                    <div style={{ 
                      fontSize: designSystem.typography.fontSize.sm, 
                      color: designSystem.colors.text.secondary,
                    }}>
                      {genre.borrow_count} borrows • {genre.unique_readers} readers
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Authors */}
          {aiAnalytics.popularAuthors && aiAnalytics.popularAuthors.length > 0 && (
            <div>
              <h3 style={{ ...dashboardStyles.statLabel, marginBottom: designSystem.spacing[4] }}>Most Popular Authors</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: designSystem.spacing[3],
              }}>
                {aiAnalytics.popularAuthors.slice(0, 6).map((author, index) => (
                  <div key={index} style={{ 
                    padding: designSystem.spacing[3], 
                    backgroundColor: designSystem.colors.semantic.surface, 
                    borderRadius: designSystem.borderRadius.md,
                    border: `2px solid ${designSystem.colors.accent.info}20`,
                  }}>
                    <div style={{ 
                      fontSize: designSystem.typography.fontSize.lg, 
                      fontWeight: designSystem.typography.fontWeight.semibold, 
                      color: designSystem.colors.text.primary,
                      marginBottom: designSystem.spacing[1],
                    }}>
                      {author.author}
                    </div>
                    <div style={{ 
                      fontSize: designSystem.typography.fontSize.sm, 
                      color: designSystem.colors.text.secondary,
                    }}>
                      {author.borrow_count} borrows • {author.unique_readers} readers
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Login Activity */}
      <div style={dashboardStyles.statCard}>
        <div style={dashboardStyles.statHeader}>
          <div style={{ ...dashboardStyles.statIcon, backgroundColor: designSystem.colors.primary[600] }}>
            <FiTrendingUp />
          </div>
          <h2 style={{ ...dashboardStyles.statLabel, fontSize: designSystem.typography.fontSize.xl, margin: 0 }}>
            Recent Login Activity
          </h2>
        </div>
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
          <button className="btn btn-warning" onClick={() => window.location.href = '/books'}>
            📚 Manage Books
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
