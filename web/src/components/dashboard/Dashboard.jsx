import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Users,
  UserCheck,
  LogIn,
  BookOpen,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  BookMarked,
  DollarSign,
  BookX,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const ModernDashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState({
    users: { total: 0, verified: 0, todayLogins: 0, students: 0, admins: 0, verificationRate: 0 },
    books: { total: 0, available: 0, borrowed: 0, overdue: 0, addedToday: 0 },
    borrowing: { currentlyBorrowed: 0, overdueBooks: 0, todayBorrowings: 0, todayReturns: 0 },
    penalties: { totalFines: 0, unpaidFines: 0, totalAmount: 0, unpaidAmount: 0, finesToday: 0 }
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('/api/dashboard/stats', config);
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

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
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-lg"></div>
              ))}
            </div>
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
          className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
              SMC Library Management Dashboard
            </h1>
            <p className="text-slate-600 text-sm sm:text-base lg:text-lg">
              St. Michael's College Library System - Comprehensive Overview
            </p>
          </div>
          <Button 
            onClick={fetchDashboardStats}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </motion.div>

        {/* User Management Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">User Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={itemVariants}>
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-blue-500 group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Users</p>
                        <p className="text-xs text-slate-500">All registered users</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900">
                        {dashboardData.users.total}
                      </div>
                      <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-700">
                        Active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-green-500 group-hover:scale-110 transition-transform duration-300">
                        <UserCheck className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Verified Users</p>
                        <p className="text-xs text-slate-500">Email verified accounts</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900">
                        {dashboardData.users.verified}
                      </div>
                      <Badge variant="secondary" className="mt-1 bg-green-100 text-green-700">
                        {dashboardData.users.verificationRate}% verified
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-orange-500 group-hover:scale-110 transition-transform duration-300">
                        <LogIn className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Today's Logins</p>
                        <p className="text-xs text-slate-500">Login activity today</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900">
                        {dashboardData.users.todayLogins}
                      </div>
                      <Badge variant="secondary" className="mt-1 bg-orange-100 text-orange-700">
                        Today
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </motion.div>

        {/* Book Management Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">Book Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={itemVariants}>
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-indigo-500 group-hover:scale-110 transition-transform duration-300">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Books</p>
                        <p className="text-xs text-slate-500">Books in library</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900">
                        {dashboardData.books.total}
                      </div>
                      <Badge variant="secondary" className="mt-1 bg-indigo-100 text-indigo-700">
                        {dashboardData.books.addedToday > 0 ? `+${dashboardData.books.addedToday} today` : 'In catalog'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-green-500 group-hover:scale-110 transition-transform duration-300">
                        <BookMarked className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Available Books</p>
                        <p className="text-xs text-slate-500">Books ready to borrow</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900">
                        {dashboardData.books.available}
                      </div>
                      <Badge variant="secondary" className="mt-1 bg-green-100 text-green-700">
                        {dashboardData.books.total > 0 ? Math.round((dashboardData.books.available / dashboardData.books.total) * 100) : 0}% available
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-blue-500 group-hover:scale-110 transition-transform duration-300">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Borrowed Books</p>
                        <p className="text-xs text-slate-500">Currently borrowed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900">
                        {dashboardData.books.borrowed}
                      </div>
                      <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-700">
                        In circulation
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-red-500 group-hover:scale-110 transition-transform duration-300">
                        <BookX className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Overdue Books</p>
                        <p className="text-xs text-slate-500">Books past due date</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900">
                        {dashboardData.books.overdue}
                      </div>
                      <Badge variant="secondary" className={`mt-1 ${dashboardData.books.overdue > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {dashboardData.books.overdue > 0 ? 'Needs attention' : 'All on time'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Borrowing Management Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">Borrowing Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={itemVariants}>
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-blue-500 group-hover:scale-110 transition-transform duration-300">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Currently Borrowed</p>
                        <p className="text-xs text-slate-500">Books currently borrowed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900">
                        {dashboardData.borrowing.currentlyBorrowed}
                      </div>
                      <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-700">
                        Active loans
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-red-500 group-hover:scale-110 transition-transform duration-300">
                        <AlertCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Overdue Books</p>
                        <p className="text-xs text-slate-500">Books past due date</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900">
                        {dashboardData.borrowing.overdueBooks}
                      </div>
                      <Badge variant="secondary" className={`mt-1 ${dashboardData.borrowing.overdueBooks > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {dashboardData.borrowing.overdueBooks > 0 ? 'Action required' : 'None overdue'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-green-500 group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Today's Borrowings</p>
                        <p className="text-xs text-slate-500">Books borrowed today</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900">
                        {dashboardData.borrowing.todayBorrowings}
                      </div>
                      <Badge variant="secondary" className="mt-1 bg-green-100 text-green-700">
                        Today
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-purple-500 group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Today's Returns</p>
                        <p className="text-xs text-slate-500">Books returned today</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900">
                        {dashboardData.borrowing.todayReturns}
                      </div>
                      <Badge variant="secondary" className="mt-1 bg-purple-100 text-purple-700">
                        Today
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Penalty Management Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">Penalty Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={itemVariants}>
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-blue-500 group-hover:scale-110 transition-transform duration-300">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Fines</p>
                        <p className="text-xs text-slate-500">All penalty records</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900">
                        {dashboardData.penalties.totalFines}
                      </div>
                      <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-700">
                        All records
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-red-500 group-hover:scale-110 transition-transform duration-300">
                        <AlertCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Unpaid Fines</p>
                        <p className="text-xs text-slate-500">Pending payments</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900">
                        {dashboardData.penalties.unpaidFines}
                      </div>
                      <Badge variant="secondary" className={`mt-1 ${dashboardData.penalties.unpaidFines > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {dashboardData.penalties.unpaidFines > 0 ? 'Pending' : 'All paid'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-green-500 group-hover:scale-110 transition-transform duration-300">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Amount</p>
                        <p className="text-xs text-slate-500">All penalty amounts</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900">
                        ₱{dashboardData.penalties.totalAmount}
                      </div>
                      <Badge variant="secondary" className="mt-1 bg-green-100 text-green-700">
                        Collected
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-orange-500 group-hover:scale-110 transition-transform duration-300">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Unpaid Amount</p>
                        <p className="text-xs text-slate-500">Outstanding payments</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900">
                        ₱{dashboardData.penalties.unpaidAmount}
                      </div>
                      <Badge variant="secondary" className={`mt-1 ${dashboardData.penalties.unpaidAmount > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {dashboardData.penalties.unpaidAmount > 0 ? 'Outstanding' : 'Cleared'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default ModernDashboard;