import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiUsers, 
  FiUserCheck, 
  FiUserX, 
  FiTrash2, 
  FiRefreshCw, 
  FiSearch, 
  FiChevronDown, 
  FiChevronUp,
  FiEye,
  FiCheck,
  FiX,
  FiUser,
  FiBook,
  FiDollarSign,
  FiActivity,
  FiClock,
  FiTrendingUp
} from 'react-icons/fi';
import designSystem from '../styles/designSystem';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
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

      console.log('Fetching users from:', '/api/admin/users');
      const response = await axios.get('/api/admin/users', config);
      console.log('Users response:', response.data);
      
      setUsers(response.data.users);
    } catch (err) {
      console.error('User fetch error:', err);
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
        setError('Failed to fetch users. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (idNumber) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(`/api/admin/users/${idNumber}`, config);
      setUserDetails(response.data.user);
      setShowDetails(true);
    } catch (err) {
      console.error('User details error:', err);
      alert(err.response?.data?.message || 'Failed to fetch user details');
    }
  };

  const updateUserVerification = async (idNumber, isVerified) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(`/api/admin/users/${idNumber}/verify`, { isVerified }, config);
      alert(`User verification status updated to ${isVerified ? 'verified' : 'unverified'}`);
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Update verification error:', err);
      alert(err.response?.data?.message || 'Failed to update user verification');
    }
  };

  const deleteUser = async (idNumber) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`/api/admin/users/${idNumber}`, config);
      alert('User deleted successfully');
      fetchUsers(); // Refresh the list
      setShowDetails(false);
    } catch (err) {
      console.error('Delete user error:', err);
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount || 0).toFixed(2)}`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      'verified': { class: 'badge-success', text: 'Verified' },
      'unverified': { class: 'badge-danger', text: 'Unverified' },
      'borrowed': { class: 'badge-warning', text: 'Borrowed' },
      'returned': { class: 'badge-success', text: 'Returned' },
      'overdue': { class: 'badge-danger', text: 'Overdue' },
      'paid': { class: 'badge-success', text: 'Paid' },
      'unpaid': { class: 'badge-danger', text: 'Unpaid' }
    };
    return badges[status] || { class: 'badge-secondary', text: status };
  };

  // Filter and sort users
  const filteredAndSortedUsers = users
    .filter(user => 
    user.id_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'created_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const toggleUserExpansion = (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error Loading User Management</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchUsers} style={{ marginTop: '10px' }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-header">
        <h1>User Management</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchUsers}>
            <FiRefreshCw />
            Refresh
          </button>
        </div>
      </div>


      {/* Search and Filters */}
      <div className="search-filters">
        <div className="search-container">
            <input
              type="text"
            placeholder="Search by ID number or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <FiSearch className="search-icon" />
        </div>
        <div className="filter-options">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="created_at">Sort by Registration Date</option>
            <option value="id_number">Sort by ID Number</option>
            <option value="total_borrowed">Sort by Books Borrowed</option>
            <option value="unpaid_fines">Sort by Unpaid Fines</option>
            <option value="login_count">Sort by Login Count</option>
          </select>
          <button 
            className="btn btn-sm btn-outline"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <FiTrendingUp /> : <FiTrendingUp style={{ transform: 'rotate(180deg)' }} />}
            </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <div className="table-header">
          <h3>All Users ({filteredAndSortedUsers.length})</h3>
        </div>
        {filteredAndSortedUsers.length > 0 ? (
          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id_number')} className="sortable">
                    ID Number {sortBy === 'id_number' && (sortOrder === 'asc' ? <FiTrendingUp /> : <FiTrendingUp style={{ transform: 'rotate(180deg)' }} />)}
                  </th>
                  <th onClick={() => handleSort('email')} className="sortable">
                    Email {sortBy === 'email' && (sortOrder === 'asc' ? <FiTrendingUp /> : <FiTrendingUp style={{ transform: 'rotate(180deg)' }} />)}
                  </th>
                  <th onClick={() => handleSort('semester_books')} className="sortable">
                    Semester Progress {sortBy === 'semester_books' && (sortOrder === 'asc' ? <FiTrendingUp /> : <FiTrendingUp style={{ transform: 'rotate(180deg)' }} />)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedUsers.map((user) => (
                  <React.Fragment key={user.id}>
                    <tr className="user-row">
                      <td className="user-id">
                        <button 
                          className="user-name-button"
                          onClick={() => toggleUserExpansion(user.id)}
                        >
                          {user.id_number}
                          <span className={`expand-icon ${expandedUser === user.id ? 'expanded' : ''}`}>
                            {expandedUser === user.id ? <FiChevronUp /> : <FiChevronDown />}
                          </span>
                        </button>
                      </td>
                      <td className="user-email">{user.email}</td>
                      <td className="semester-progress">
                        {user.semester_books !== null ? (
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${Math.min((user.semester_books / 20) * 100, 100)}%` }}></div>
                            <span className="progress-text">{user.semester_books}/20</span>
                          </div>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </td>
                  </tr>
                    
                    {/* Expanded User Details */}
                    {expandedUser === user.id && (
                      <tr className="user-details-row">
                        <td colSpan="3" className="user-details-cell">
                          <div className="user-details-content">
                            <div className="user-details-grid">
                              <div className="detail-section">
                                <h5><FiUser /> Account Information</h5>
                                <div className="detail-item">
                                  <span className="detail-label">ID Number:</span>
                                  <span className="detail-value">{user.id_number}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Email:</span>
                                  <span className="detail-value">{user.email}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Registration Date:</span>
                                  <span className="detail-value">{formatDate(user.created_at)}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Login Count:</span>
                                  <span className="detail-value">{user.login_count || 0}</span>
                                </div>
                              </div>
                              
                              <div className="detail-section">
                                <h5><FiBook /> Borrowing Statistics</h5>
                                <div className="detail-item">
                                  <span className="detail-label">Total Borrowed:</span>
                                  <span className="detail-value">{user.total_borrowed || 0}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Currently Borrowed:</span>
                                  <span className="detail-value">{user.currently_borrowed || 0}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Overdue Books:</span>
                                  <span className="detail-value">{user.overdue_books || 0}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Semester Progress:</span>
                                  <span className="detail-value">{user.semester_books || 0}/20 books</span>
                                </div>
                              </div>
                              
                              <div className="detail-section">
                                <h5><FiDollarSign /> Financial Status</h5>
                                <div className="detail-item">
                                  <span className="detail-label">Total Fines:</span>
                                  <span className="detail-value">{user.total_fines || 0}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Unpaid Fines:</span>
                                  <span className="detail-value">{user.unpaid_fines || 0}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Unpaid Amount:</span>
                                  <span className="detail-value">{formatCurrency(user.unpaid_amount)}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Account Status:</span>
                                  <span className="detail-value">
                                    <span className={`badge ${getStatusBadge(user.is_verified ? 'verified' : 'unverified').class}`}>
                                      {getStatusBadge(user.is_verified ? 'verified' : 'unverified').text}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="user-action-buttons">
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => fetchUserDetails(user.id_number)}
                              >
                                <FiEye />
                                Details
                              </button>
                              <button
                                className="btn btn-sm btn-warning"
                                onClick={() => updateUserVerification(user.id_number, !user.is_verified)}
                              >
                                {user.is_verified ? <FiUserX /> : <FiUserCheck />}
                                {user.is_verified ? 'Unverify' : 'Verify'}
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => deleteUser(user.id_number)}
                              >
                                <FiTrash2 />
                                Delete
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data">
            <p>{searchTerm ? 'No users found matching your search.' : 'No users found.'}</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showDetails && userDetails && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content user-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Profile - {userDetails.id_number}</h3>
              <button 
                className="btn btn-sm btn-secondary" 
                onClick={() => setShowDetails(false)}
              >
                <FiX />
              </button>
            </div>
            
            <div className="modal-body">
              {/* User Overview */}
              <div className="user-overview">
                <div className="user-basic-info">
                  <h4>{userDetails.id_number}</h4>
                  <p className="user-email">{userDetails.email}</p>
                  <div className="user-status">
                    <span className={`badge ${getStatusBadge(userDetails.is_verified ? 'verified' : 'unverified').class}`}>
                      {getStatusBadge(userDetails.is_verified ? 'verified' : 'unverified').text}
                    </span>
                    {userDetails.borrowingStatus && (
                      <span className={`badge ${userDetails.borrowingStatus.can_borrow ? 'badge-success' : 'badge-danger'}`}>
                        {userDetails.borrowingStatus.can_borrow ? 'Can Borrow' : 'Blocked'}
                  </span>
                    )}
                  </div>
                </div>
                
                <div className="user-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Borrowed:</span>
                    <span className="stat-value">{userDetails.total_borrowed || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Currently Borrowed:</span>
                    <span className="stat-value">{userDetails.currently_borrowed || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Overdue Books:</span>
                    <span className="stat-value">{userDetails.overdue_books || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Unpaid Fines:</span>
                    <span className="stat-value">{formatCurrency(userDetails.unpaid_amount)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Semester Progress:</span>
                    <span className="stat-value">{userDetails.semester_books || 0}/20</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="tabs">
                <button 
                  className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <FiUser />
                  Overview
                </button>
                <button 
                  className={`tab-button ${activeTab === 'borrowing' ? 'active' : ''}`}
                  onClick={() => setActiveTab('borrowing')}
                >
                  <FiBook />
                  Borrowing History
                </button>
                <button 
                  className={`tab-button ${activeTab === 'fines' ? 'active' : ''}`}
                  onClick={() => setActiveTab('fines')}
                >
                  <FiDollarSign />
                  Fines History
                </button>
                <button 
                  className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
                  onClick={() => setActiveTab('activity')}
                >
                  <FiActivity />
                  Activity Log
                </button>
              </div>

              {/* Tab Content */}
              <div className="tab-content">
                {activeTab === 'overview' && (
                  <div className="overview-tab">
                    <div className="info-grid">
                      <div className="info-card">
                        <h5>Account Information</h5>
                        <p><strong>ID Number:</strong> {userDetails.id_number}</p>
                        <p><strong>Email:</strong> {userDetails.email}</p>
                        <p><strong>Registration Date:</strong> {formatDate(userDetails.created_at)}</p>
                        <p><strong>Login Count:</strong> {userDetails.login_count || 0}</p>
                      </div>
                      
                      <div className="info-card">
                        <h5>Borrowing Status</h5>
                        <p><strong>Can Borrow:</strong> {userDetails.borrowingStatus?.can_borrow ? 'Yes' : 'No'}</p>
                        {userDetails.borrowingStatus?.reason_blocked && (
                          <p><strong>Blocked Reason:</strong> {userDetails.borrowingStatus.reason_blocked}</p>
                        )}
                        {userDetails.borrowingStatus?.blocked_until && (
                          <p><strong>Blocked Until:</strong> {formatDate(userDetails.borrowingStatus.blocked_until)}</p>
                        )}
                      </div>
                      
                      <div className="info-card">
                        <h5>Semester Tracking</h5>
                        {userDetails.semesterTracking && userDetails.semesterTracking.length > 0 ? (
                          userDetails.semesterTracking.map((semester, index) => (
                            <div key={index} className="semester-info">
                              <p><strong>Semester:</strong> {new Date(semester.semester_start_date).toLocaleDateString()} - {new Date(semester.semester_end_date).toLocaleDateString()}</p>
                              <p><strong>Books Borrowed:</strong> {semester.books_borrowed_count}/{semester.books_required}</p>
                              <p><strong>Status:</strong> {semester.status}</p>
                            </div>
                          ))
                        ) : (
                          <p>No semester tracking data available</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'borrowing' && (
                  <div className="borrowing-tab">
                    <h5>Borrowing History</h5>
                    {userDetails.borrowingHistory && userDetails.borrowingHistory.length > 0 ? (
                      <div className="table-responsive">
                        <table className="history-table">
                          <thead>
                            <tr>
                              <th>Book</th>
                              <th>Borrowed Date</th>
                              <th>Due Date</th>
                              <th>Returned Date</th>
                              <th>Status</th>
                              <th>Days Overdue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userDetails.borrowingHistory.map((transaction) => (
                              <tr key={transaction.id}>
                                <td>
                                  <div>
                                    <strong>{transaction.title}</strong>
                                    <br />
                                    <small>{transaction.author} - {transaction.number_code}</small>
                                  </div>
                                </td>
                                <td>{formatDate(transaction.borrowed_at)}</td>
                                <td>{formatDate(transaction.due_date)}</td>
                                <td>{transaction.returned_at ? formatDate(transaction.returned_at) : 'Not returned'}</td>
                                <td>
                                  <span className={`badge ${getStatusBadge(transaction.status).class}`}>
                                    {getStatusBadge(transaction.status).text}
                                  </span>
                                </td>
                                <td>
                                  {transaction.days_overdue > 0 && (
                                    <span className="overdue-days">{transaction.days_overdue} days</span>
                                  )}
                                  {transaction.days_overdue <= 0 && <span className="text-muted">On time</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="no-data">No borrowing history found</p>
                    )}
                  </div>
                )}

                {activeTab === 'fines' && (
                  <div className="fines-tab">
                    <h5>Fines History</h5>
                    {userDetails.finesHistory && userDetails.finesHistory.length > 0 ? (
                      <div className="table-responsive">
                        <table className="history-table">
                          <thead>
                            <tr>
                              <th>Book</th>
                              <th>Fine Date</th>
                              <th>Fine Amount</th>
                              <th>Paid Amount</th>
                              <th>Days Overdue</th>
                              <th>Status</th>
                              <th>Paid Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userDetails.finesHistory.map((fine) => (
                              <tr key={fine.id}>
                                <td>
                                  <div>
                                    <strong>{fine.title}</strong>
                                    <br />
                                    <small>{fine.number_code}</small>
                                  </div>
                                </td>
                                <td>{formatDate(fine.fine_date)}</td>
                                <td>{formatCurrency(fine.fine_amount)}</td>
                                <td>{formatCurrency(fine.paid_amount)}</td>
                                <td>{fine.days_overdue}</td>
                                <td>
                                  <span className={`badge ${getStatusBadge(fine.status).class}`}>
                                    {getStatusBadge(fine.status).text}
                                  </span>
                                </td>
                                <td>{fine.paid_date ? formatDate(fine.paid_date) : 'Not paid'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="no-data">No fines history found</p>
                    )}
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="activity-tab">
                    <h5>Login Activity</h5>
                    {userDetails.loginHistory && userDetails.loginHistory.length > 0 ? (
                      <div className="table-responsive">
                        <table className="history-table">
                      <thead>
                        <tr>
                          <th>Login Time</th>
                          <th>IP Address</th>
                          <th>User Agent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userDetails.loginHistory.map((login, index) => (
                          <tr key={index}>
                            <td>{formatDate(login.login_time)}</td>
                            <td>{login.ip_address || 'N/A'}</td>
                                <td className="user-agent">{login.user_agent || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                    ) : (
                      <p className="no-data">No login activity found</p>
                    )}
                </div>
              )}
              </div>

              {/* Action Buttons */}
              <div className="modal-actions">
                <button
                  className="btn btn-warning"
                  onClick={() => {
                    updateUserVerification(userDetails.id_number, !userDetails.is_verified);
                    setShowDetails(false);
                  }}
                >
                  {userDetails.is_verified ? <FiUserX /> : <FiUserCheck />}
                  {userDetails.is_verified ? 'Unverify User' : 'Verify User'}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    deleteUser(userDetails.id_number);
                  }}
                >
                  <FiTrash2 />
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
