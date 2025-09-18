import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  RefreshCw, 
  ChevronDown,
  ChevronUp,
  Eye,
  Check,
  X,
  TrendingUp,
  Calendar,
  Mail,
  BookOpen,
  DollarSign,
  Activity,
  Edit,
  Trash2,
  Save,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import axios from 'axios';

const ModernUserManagement = ({ user }) => {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get search highlight from navigation state
  const highlightUserId = location.state?.highlightUser;
  const searchQuery = location.state?.searchQuery;
  const [sortBy, setSortBy] = useState('created_at');
  const [expandedUser, setExpandedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ email: '', isVerified: false });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    
    // Set search term if coming from search
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
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

      const response = await axios.get('/api/admin/users', config);
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('User fetch error:', err);
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

  const updateUserVerification = async (idNumber, isVerified) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(`/api/admin/users/${idNumber}/verify`, 
        { is_verified: isVerified }, 
        config
      );
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id_number === idNumber 
            ? { ...u, is_verified: isVerified }
            : u
        )
      );
    } catch (err) {
      console.error('Verification update error:', err);
      alert(err.response?.data?.message || 'Failed to update user verification');
    } finally {
      setActionLoading(false);
    }
  };

  const startEditUser = (user) => {
    setEditingUser(user.id_number);
    setEditForm({
      email: user.email,
      isVerified: user.is_verified
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditForm({ email: '', isVerified: false });
  };

  const saveUserEdit = async (idNumber) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(`/api/admin/users/${idNumber}`, 
        { 
          email: editForm.email,
          isVerified: editForm.isVerified
        }, 
        config
      );
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id_number === idNumber 
            ? { ...u, email: editForm.email, is_verified: editForm.isVerified }
            : u
        )
      );
      
      setEditingUser(null);
      setEditForm({ email: '', isVerified: false });
      alert('User updated successfully!');
    } catch (err) {
      console.error('User update error:', err);
      alert(err.response?.data?.message || 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDeleteUser = (idNumber) => {
    setShowDeleteConfirm(idNumber);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const deleteUser = async (idNumber) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`/api/admin/users/${idNumber}`, config);
      
      // Remove from local state
      setUsers(prevUsers => prevUsers.filter(u => u.id_number !== idNumber));
      
      setShowDeleteConfirm(null);
      alert('User deleted successfully!');
    } catch (err) {
      console.error('User deletion error:', err);
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.id_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                User Management
              </h1>
              <p className="text-slate-600 text-lg">
                Manage and monitor user accounts and verification status
              </p>
            </div>
            <Button 
              onClick={fetchUsers}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>


        {/* Search and Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search by ID number or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="created_at">Sort by Registration Date</option>
                    <option value="id_number">Sort by ID Number</option>
                    <option value="email">Sort by Email</option>
                    <option value="is_verified">Sort by Verification Status</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Users ({filteredUsers.length})
              </CardTitle>
              <CardDescription>
                Manage user accounts, verification status, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}
              
              <div className="space-y-4">
                {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id_number}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
                      highlightUserId === user.id_number ? 'bg-green-50 border-green-200' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                            {user.id_number.slice(-2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {user.id_number}
                          </h3>
                          <p className="text-sm text-slate-600">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={user.is_verified ? "default" : "secondary"}
                              className={user.is_verified ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}
                            >
                              {user.is_verified ? (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Verified
                                </>
                              ) : (
                                <>
                                  <X className="h-3 w-3 mr-1" />
                                  Unverified
                                </>
                              )}
                            </Badge>
                            {user.semester_progress && (
                              <Badge variant="outline" className="text-xs">
                                {user.semester_progress} books
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateUserVerification(user.id_number, !user.is_verified)}
                          className={user.is_verified ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                        >
                          {user.is_verified ? (
                            <>
                              <UserX className="h-4 w-4 mr-1" />
                              Unverify
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-1" />
                              Verify
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedUser(expandedUser === user.id_number ? null : user.id_number)}
                        >
                          {expandedUser === user.id_number ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {expandedUser === user.id_number && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 pt-4 border-t border-slate-200"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <h4 className="font-medium text-slate-900">Registration Info</h4>
                              <div className="text-sm text-slate-600">
                                <p>Created: {new Date(user.created_at).toLocaleDateString()}</p>
                                {user.last_login && (
                                  <p>Last Login: {new Date(user.last_login).toLocaleDateString()}</p>
                                )}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-medium text-slate-900">Activity</h4>
                              <div className="text-sm text-slate-600">
                                <p>Books Borrowed: {user.books_currently_borrowed || 0}</p>
                                <p>Total Borrowed: {user.total_borrowed || 0}</p>
                                <p>Status: {user.is_verified ? 'Active' : 'Pending'}</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-medium text-slate-900">Actions</h4>
                              <div className="flex gap-2 flex-wrap">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => startEditUser(user)}
                                  disabled={actionLoading}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit User
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => confirmDeleteUser(user.id_number)}
                                  disabled={actionLoading}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Remove User
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No users found</h3>
                  <p className="text-slate-600">
                    {searchTerm ? 'Try adjusting your search terms' : 'No users have been registered yet'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold mb-4">Edit User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="user@my.smciligan.edu.ph"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isVerified"
                    checked={editForm.isVerified}
                    onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="isVerified" className="text-sm font-medium text-slate-700">
                    Verified User
                  </label>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button
                  onClick={() => saveUserEdit(editingUser)}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={cancelEdit}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                <h3 className="text-lg font-semibold text-red-600">Confirm Deletion</h3>
              </div>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete this user? This action cannot be undone and will remove all user data including borrowing history and fines.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => deleteUser(showDeleteConfirm)}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete User
                </Button>
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModernUserManagement;
