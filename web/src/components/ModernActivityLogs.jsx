import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Search, 
  RefreshCw,
  TrendingUp,
  Activity,
  LogIn,
  UserPlus,
  BookOpen,
  DollarSign,
  Clock,
  User,
  Globe,
  Monitor,
  Filter,
  Eye,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import axios from 'axios';

const ModernActivityLogs = ({ user }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(20);
  const [stats, setStats] = useState({
    totalLogs: 0,
    todayLogins: 0,
    totalUsers: 0,
    systemActivity: 0
  });

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

      const response = await axios.get('/api/admin/activity-logs', config);
      setLogs(response.data.logs || []);
      
      // Calculate stats
      const logs = response.data.logs || [];
      const total = logs.length;
      const today = new Date().toDateString();
      const todayLogins = logs.filter(log => 
        log.activity_type === 'login' && new Date(log.timestamp).toDateString() === today
      ).length;
      const uniqueUsers = new Set(logs.map(log => log.id_number)).size;
      
      setStats({
        totalLogs: total,
        todayLogins: todayLogins,
        totalUsers: uniqueUsers,
        systemActivity: total
      });
    } catch (err) {
      console.error('Activity logs fetch error:', err);
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

  const getActivityIcon = (activity) => {
    switch (activity?.toLowerCase()) {
      case 'login':
        return LogIn;
      case 'registration':
      case 'register':
        return UserPlus;
      case 'borrow':
      case 'borrowing':
        return BookOpen;
      case 'return':
      case 'returning':
        return BookOpen;
      case 'penalty':
      case 'fine':
        return DollarSign;
      default:
        return Activity;
    }
  };

  const getActivityColor = (activity) => {
    switch (activity?.toLowerCase()) {
      case 'login':
        return 'bg-green-100 text-green-700';
      case 'registration':
      case 'register':
        return 'bg-blue-100 text-blue-700';
      case 'borrow':
      case 'borrowing':
        return 'bg-orange-100 text-orange-700';
      case 'return':
      case 'returning':
        return 'bg-purple-100 text-purple-700';
      case 'penalty':
      case 'fine':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.activity_type?.toLowerCase() === filter.toLowerCase();
    const matchesSearch = !searchTerm || 
      log.id_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.activity_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const statCards = [
    {
      title: 'Total Logs',
      value: stats.totalLogs,
      description: 'All activity records',
      icon: FileText,
      color: 'bg-blue-500',
      change: '+12%',
      trend: 'up'
    },
    {
      title: "Today's Logins",
      value: stats.todayLogins,
      description: 'Login activities today',
      icon: LogIn,
      color: 'bg-green-500',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Active Users',
      value: stats.totalUsers,
      description: 'Users with activity',
      icon: User,
      color: 'bg-orange-500',
      change: '+15%',
      trend: 'up'
    },
    {
      title: 'System Activity',
      value: stats.systemActivity,
      description: 'Total system events',
      icon: Activity,
      color: 'bg-purple-500',
      change: '+20%',
      trend: 'up'
    }
  ];

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
                Activity Logs
              </h1>
              <p className="text-slate-600 text-lg">
                Monitor system activities and user interactions
              </p>
            </div>
            <Button 
              onClick={fetchActivityLogs}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statCards.map((stat, index) => (
            <motion.div key={stat.title} variants={itemVariants}>
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          {stat.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {stat.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                        className="text-3xl font-bold text-slate-900"
                      >
                        {stat.value}
                      </motion.div>
                      <Badge variant="secondary" className="mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
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
                      placeholder="Search by user ID or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Activities</option>
                    <option value="login">Login</option>
                    <option value="registration">Registration</option>
                    <option value="borrow">Borrowing</option>
                    <option value="return">Returns</option>
                    <option value="penalty">Penalties</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Logs Table */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                System Activity Logs ({filteredLogs.length})
              </CardTitle>
              <CardDescription>
                Detailed log of all system activities and user interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}
              
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 text-slate-400 mx-auto mb-4 animate-spin" />
                  <p className="text-slate-600">Loading activity logs...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">Activity</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">User</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">IP Address</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">User Agent</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedLogs.map((log, index) => {
                        const ActivityIcon = getActivityIcon(log.activity_type);
                        return (
                          <motion.tr
                            key={log.id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <Badge className={`${getActivityColor(log.activity_type)} border-0`}>
                                <ActivityIcon className="h-3 w-3 mr-1" />
                                {log.activity_type || 'Unknown'}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-slate-400" />
                                <div>
                                  <p className="font-medium text-slate-900">
                                    {log.id_number || 'N/A'}
                                  </p>
                                  {log.email && (
                                    <p className="text-sm text-slate-500">{log.email}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-slate-400" />
                                <span className="font-mono text-sm text-slate-600">
                                  {log.ip_address || 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Monitor className="h-4 w-4 text-slate-400" />
                                <span className="text-sm text-slate-600 max-w-xs truncate">
                                  {log.user_agent || 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <span className="text-sm text-slate-600">
                                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                                </span>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              
              {!loading && filteredLogs.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No activity logs found</h3>
                  <p className="text-slate-600">
                    {searchTerm || filter !== 'all' ? 'Try adjusting your search terms or filters' : 'No activity logs have been recorded yet'}
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-slate-600">
                    Showing {((currentPage - 1) * logsPerPage) + 1} to {Math.min(currentPage * logsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="px-3 py-2 text-sm text-slate-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ModernActivityLogs;
