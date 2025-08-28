import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.id_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div>
      <h1 style={{ marginBottom: '30px' }}>User Management</h1>

      {/* Search and Stats */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h3>Total Users: {users.length}</h3>
            <p>Verified: {users.filter(u => u.is_verified).length} | Unverified: {users.filter(u => !u.is_verified).length}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search by ID or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '200px' }}
            />
            <button className="btn btn-secondary" onClick={fetchUsers}>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="card">
        <h2>All Users ({filteredUsers.length})</h2>
        {filteredUsers.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID Number</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Login Count</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id_number}</td>
                    <td>{user.email}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: user.is_verified ? '#28a745' : '#dc3545',
                        color: 'white'
                      }}>
                        {user.is_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td>{user.login_count || 0}</td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => fetchUserDetails(user.id_number)}
                        >
                          Details
                        </button>
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => updateUserVerification(user.id_number, !user.is_verified)}
                        >
                          {user.is_verified ? 'Unverify' : 'Verify'}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteUser(user.id_number)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            {searchTerm ? 'No users found matching your search.' : 'No users found.'}
          </p>
        )}
      </div>

      {/* User Details Modal */}
      {showDetails && userDetails && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details - {userDetails.id_number}</h3>
              <button 
                className="btn btn-sm btn-secondary" 
                onClick={() => setShowDetails(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="user-info">
                <p><strong>ID Number:</strong> {userDetails.id_number}</p>
                <p><strong>Email:</strong> {userDetails.email}</p>
                <p><strong>Status:</strong> 
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: userDetails.is_verified ? '#28a745' : '#dc3545',
                    color: 'white',
                    marginLeft: '10px'
                  }}>
                    {userDetails.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                </p>
                <p><strong>Created:</strong> {formatDate(userDetails.created_at)}</p>
              </div>

              {userDetails.loginHistory && userDetails.loginHistory.length > 0 && (
                <div className="login-history">
                  <h4>Recent Login History</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table">
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
                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {login.user_agent || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button
                  className="btn btn-warning"
                  onClick={() => {
                    updateUserVerification(userDetails.id_number, !userDetails.is_verified);
                    setShowDetails(false);
                  }}
                >
                  {userDetails.is_verified ? 'Unverify User' : 'Verify User'}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    deleteUser(userDetails.id_number);
                  }}
                >
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
