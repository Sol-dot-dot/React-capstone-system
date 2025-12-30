import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

const SimplifiedDashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    overdueBooks: 0,
    totalUsers: 0,
    activeBorrowers: 0
  });
  const [booksByCategory, setBooksByCategory] = useState([]);
  const [bookStatus, setBookStatus] = useState([]);
  const [monthlyBorrowing, setMonthlyBorrowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch all data in parallel
      const [statsRes, categoryRes, statusRes, monthlyRes] = await Promise.all([
        axios.get('/api/simple-analytics/dashboard-stats', config),
        axios.get('/api/simple-analytics/books-by-category', config),
        axios.get('/api/simple-analytics/book-status-distribution', config),
        axios.get('/api/simple-analytics/monthly-borrowing', config)
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (categoryRes.data.success) {
        setBooksByCategory(categoryRes.data.data);
      }
      if (statusRes.data.success) {
        setBookStatus(statusRes.data.data);
      }
      if (monthlyRes.data.success) {
        setMonthlyBorrowing(monthlyRes.data.data);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <motion.div variants={itemVariants}>
      <Card className={`${bgColor} border-none`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
              <p className={`text-3xl font-bold ${color}`}>{value.toLocaleString()}</p>
            </div>
            <div className={`${color} bg-white bg-opacity-20 p-4 rounded-lg`}>
              <Icon className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard Data Unavailable</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <Button
              onClick={fetchDashboardData}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Library Dashboard</h1>
          <p className="text-slate-600">Overview of library statistics and metrics</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <StatCard
            icon={BookOpen}
            title="Total Books"
            value={stats.totalBooks}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={CheckCircle}
            title="Available Books"
            value={stats.availableBooks}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
            icon={Clock}
            title="Borrowed Books"
            value={stats.borrowedBooks}
            color="text-indigo-600"
            bgColor="bg-indigo-50"
          />
          <StatCard
            icon={AlertCircle}
            title="Overdue Books"
            value={stats.overdueBooks}
            color="text-red-600"
            bgColor="bg-red-50"
          />
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats.totalUsers}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
          <StatCard
            icon={UserCheck}
            title="Active Borrowers"
            value={stats.activeBorrowers}
            color="text-cyan-600"
            bgColor="bg-cyan-50"
          />
        </motion.div>

        {/* Books by Category Chart */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Books by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={booksByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Book Status Distribution */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Book Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={bookStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.status}: ${entry.count}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {bookStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Monthly Borrowing */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Monthly Borrowing (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyBorrowing}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedDashboard;
