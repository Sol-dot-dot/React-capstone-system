import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  Settings, 
  Users, 
  Search, 
  ChevronDown, 
  ChevronUp,
  Check,
  RefreshCw,
  Book,
  Clock,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Calculator,
  CreditCard,
  User,
  Mail,
  Calendar,
  Eye,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import axios from 'axios';

const ModernPenaltyManagement = ({ user }) => {
  const [activeTab, setActiveTab] = useState('fines');
  const [settings, setSettings] = useState({});
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalFines: 0,
    unpaidFines: 0,
    totalAmount: 0,
    unpaidAmount: 0
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentFines, setStudentFines] = useState([]);
  const [expandedStudents, setExpandedStudents] = useState(new Set());

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (activeTab === 'settings') {
        const response = await axios.get('/api/penalty/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data.success) {
          setSettings(response.data.data);
        }
      } else if (activeTab === 'fines') {
        await loadStudentsWithFines();
      } else if (activeTab === 'stats') {
        const response = await axios.get('/api/penalty/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data.success) {
          setStats(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsWithFines = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/penalty/students-with-fines', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setStudents(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading students with fines:', error);
    }
  };

  const processOverdueFines = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/penalty/process-overdue', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setMessage('Overdue fines processed successfully!');
        await loadStudentsWithFines();
      }
    } catch (error) {
      console.error('Error processing overdue fines:', error);
      setMessage('Error processing overdue fines');
    } finally {
      setLoading(false);
    }
  };

  const recalculateSemesterCounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/penalty/recalculate-semester', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setMessage('Semester counts recalculated successfully!');
        await loadStudentsWithFines();
      }
    } catch (error) {
      console.error('Error recalculating semester counts:', error);
      setMessage('Error recalculating semester counts');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (studentIdNumber) => {
    if (!window.confirm(`Are you sure you want to process payment for student ${studentIdNumber}?\n\nThis will:\n• Mark all fines as paid\n• Return any borrowed books\n• Allow the student to borrow again`)) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/penalty/mark-paid/${studentIdNumber}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setMessage(response.data.message || `Payment processed successfully for student ${studentIdNumber}!`);
        await loadStudentsWithFines();
        await loadData(); // Refresh stats
        
        // Trigger a custom event to notify other components to refresh
        window.dispatchEvent(new CustomEvent('paymentProcessed', {
          detail: { studentId: studentIdNumber, booksReturned: response.data.data?.booksReturned || 0 }
        }));
      } else {
        setMessage(response.data.message || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setMessage('Error processing payment');
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentExpansion = (studentId) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedStudents(newExpanded);
  };

  const filteredStudents = students.filter(student =>
    student.id_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statCards = [
    {
      title: 'Total Fines',
      value: stats.totalFines || 0,
      description: 'All penalty records',
      icon: DollarSign,
      color: 'bg-blue-500',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Unpaid Fines',
      value: stats.unpaidFines || 0,
      description: 'Pending payments',
      icon: AlertCircle,
      color: 'bg-red-500',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Total Amount',
      value: `₱${stats.totalAmount || 0}`,
      description: 'All penalty amounts',
      icon: Calculator,
      color: 'bg-green-500',
      change: '+15%',
      trend: 'up'
    },
    {
      title: 'Unpaid Amount',
      value: `₱${stats.unpaidAmount || 0}`,
      description: 'Outstanding payments',
      icon: CreditCard,
      color: 'bg-orange-500',
      change: '+10%',
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
                Student Fines Management
              </h1>
              <p className="text-slate-600 text-lg">
                Manage penalty system and student fine calculations
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setActiveTab('fines')}
                variant={activeTab === 'fines' ? 'default' : 'outline'}
                className={activeTab === 'fines' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Student Fines
              </Button>
              <Button 
                onClick={() => setActiveTab('settings')}
                variant={activeTab === 'settings' ? 'default' : 'outline'}
                className={activeTab === 'settings' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <Settings className="h-4 w-4 mr-2" />
                System Settings
              </Button>
              <Button 
                onClick={() => setActiveTab('stats')}
                variant={activeTab === 'stats' ? 'default' : 'outline'}
                className={activeTab === 'stats' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Statistics
              </Button>
            </div>
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

        {/* Main Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab === 'fines' && (
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Student Fines Management
                </CardTitle>
                <CardDescription>
                  View and manage student penalty records and fine calculations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {message && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-600">{message}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        placeholder="Search by Student ID or Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={processOverdueFines}
                      disabled={loading}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Process Overdue Fines
                    </Button>
                    <Button
                      onClick={recalculateSemesterCounts}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Recalculate Semester Counts
                    </Button>
                  </div>
                </div>

                {/* Students with Fines */}
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 text-slate-400 mx-auto mb-4 animate-spin" />
                      <p className="text-slate-600">Loading student fines...</p>
                    </div>
                  ) : filteredStudents.length > 0 ? (
                    filteredStudents.map((student, index) => (
                      <motion.div
                        key={student.id_number}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">
                                {student.id_number}
                              </h3>
                              <p className="text-sm text-slate-600">{student.email}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="text-sm">
                                  <span className="font-medium text-slate-700">TOTAL FINES:</span>
                                  <span className="ml-1 text-blue-600 font-semibold">{student.total_fines || 0}</span>
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium text-slate-700">UNPAID:</span>
                                  <span className="ml-1 text-red-600 font-semibold">{student.unpaid_fines || 0}</span>
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium text-slate-700">TOTAL AMOUNT:</span>
                                  <span className="ml-1 text-green-600 font-semibold">₱{student.total_amount || 0}</span>
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium text-slate-700">UNPAID AMOUNT:</span>
                                  <span className="ml-1 text-orange-600 font-semibold">₱{student.unpaid_amount || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleStudentExpansion(student.id_number)}
                            >
                              {expandedStudents.has(student.id_number) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                            {student.unpaid_fines > 0 ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                                onClick={() => handleMarkAsPaid(student.id_number)}
                                title="Mark fines as paid and return books"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Paid
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                title="View student details"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {expandedStudents.has(student.id_number) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-4 pt-4 border-t border-slate-200"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <h4 className="font-medium text-slate-900">Student Information</h4>
                                  <div className="text-sm text-slate-600">
                                    <p><strong>ID:</strong> {student.id_number}</p>
                                    <p><strong>Email:</strong> {student.email}</p>
                                    <p><strong>Status:</strong> {student.is_verified ? 'Verified' : 'Unverified'}</p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <h4 className="font-medium text-slate-900">Fine Summary</h4>
                                  <div className="text-sm text-slate-600">
                                    <p><strong>Total Fines:</strong> {student.total_fines || 0}</p>
                                    <p><strong>Unpaid Fines:</strong> {student.unpaid_fines || 0}</p>
                                    <p><strong>Total Amount:</strong> ₱{student.total_amount || 0}</p>
                                    <p><strong>Unpaid Amount:</strong> ₱{student.unpaid_amount || 0}</p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">No student fines found</h3>
                      <p className="text-slate-600">
                        {searchTerm ? 'Try adjusting your search terms' : 'No students have penalty records yet'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'settings' && (
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Penalty System Settings
                </CardTitle>
                <CardDescription>
                  Configure penalty calculation rules and system parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">Fine Calculation</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Daily Fine Rate (₱)
                          </label>
                          <Input
                            value={settings.daily_fine_rate || ''}
                            className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Maximum Fine Amount (₱)
                          </label>
                          <Input
                            value={settings.max_fine_amount || ''}
                            className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">Semester Requirements</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Required Books per Semester
                          </label>
                          <Input
                            value={settings.required_books_per_semester || ''}
                            className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Penalty per Missing Book (₱)
                          </label>
                          <Input
                            value={settings.penalty_per_missing_book || ''}
                            className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Check className="h-4 w-4 mr-2" />
                      Save Settings
                    </Button>
                    <Button variant="outline">
                      Reset to Default
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'stats' && (
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Penalty Statistics
                </CardTitle>
                <CardDescription>
                  View comprehensive penalty system statistics and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {statCards.map((stat, index) => (
                    <motion.div
                      key={stat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center p-6 bg-slate-50 rounded-lg"
                    >
                      <div className={`inline-flex p-3 rounded-xl ${stat.color} mb-4`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                      <p className="text-sm text-slate-600">{stat.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ModernPenaltyManagement;
