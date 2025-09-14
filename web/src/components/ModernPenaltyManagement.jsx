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
      const response = await axios.get('/api/penalty/students-detailed', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          search: searchTerm || undefined,
          status: 'unpaid'
        }
      });
      
      if (response.data.success) {
        setStudents(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading students with fines:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Update each setting individually
      for (const [key, value] of Object.entries(settings)) {
        if (value !== undefined && value !== '') {
          await axios.put('/api/penalty/settings', {
            setting_key: key,
            setting_value: value
          }, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      }
      
      setMessage('Settings saved successfully!');
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
      // Reload settings to get updated values
      await loadData();
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings');
    } finally {
      setLoading(false);
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

  const handleSearch = (e) => {
    e.preventDefault();
    loadStudentsWithFines();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Auto-search as user types (with debounce)
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      loadStudentsWithFines();
    }, 500);
  };



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


        {/* Message Display */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-green-100 border border-green-200 text-green-800"
          >
            {message}
          </motion.div>
        )}

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
                        placeholder="Search by Student ID, Email, or Book Title..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
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
                  ) : students.length > 0 ? (
                    students.map((student, index) => (
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
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                  <h4 className="font-medium text-slate-900">Student Information</h4>
                                  <div className="text-sm text-slate-600">
                                    <p><strong>ID:</strong> {student.id_number}</p>
                                    <p><strong>Name:</strong> {student.first_name} {student.last_name}</p>
                                    <p><strong>Email:</strong> {student.email}</p>
                                    <p><strong>Status:</strong> {student.is_verified ? 'Verified' : 'Unverified'}</p>
                                    <p><strong>Email Verified:</strong> {student.email_verified ? 'Yes' : 'No'}</p>
                                    <p><strong>Last Login:</strong> {student.last_login ? new Date(student.last_login).toLocaleDateString() : 'Never'}</p>
                                    <p><strong>Registered:</strong> {new Date(student.registration_date).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <h4 className="font-medium text-slate-900">Fine Summary</h4>
                                  <div className="text-sm text-slate-600">
                                    <p><strong>Total Fines:</strong> {student.total_fines || 0}</p>
                                    <p><strong>Unpaid Fines:</strong> {student.unpaid_fines || 0}</p>
                                    <p><strong>Paid Fines:</strong> {student.paid_fines || 0}</p>
                                    <p><strong>Total Amount:</strong> ₱{student.total_amount || 0}</p>
                                    <p><strong>Unpaid Amount:</strong> ₱{student.unpaid_amount || 0}</p>
                                    <p><strong>Paid Amount:</strong> ₱{student.paid_amount || 0}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Overdue Books Section */}
                              {student.overdue_books && student.overdue_books.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                                    <Book className="h-4 w-4" />
                                    Overdue Books ({student.overdue_books.length})
                                  </h4>
                                  <div className="space-y-3">
                                    {student.overdue_books.map((book, bookIndex) => (
                                      <div key={bookIndex} className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <h5 className="font-medium text-slate-900">{book.title}</h5>
                                            <p className="text-sm text-slate-600">by {book.author}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                                              <span><strong>Code:</strong> {book.number_code}</span>
                                              <span><strong>Category:</strong> {book.category}</span>
                                              <span><strong>Borrowed:</strong> {new Date(book.borrowed_date).toLocaleDateString()}</span>
                                              <span><strong>Due:</strong> {new Date(book.due_date).toLocaleDateString()}</span>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <Badge variant="destructive" className="mb-1">
                                              {book.days_past_due} days overdue
                                            </Badge>
                                            <div className="text-sm">
                                              <p><strong>Fine:</strong> ₱{book.fine_amount || 0}</p>
                                              <p><strong>Paid:</strong> ₱{book.paid_amount || 0}</p>
                                              <p><strong>Remaining:</strong> ₱{(book.fine_amount || 0) - (book.paid_amount || 0)}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
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
                            value={settings.fine_per_day || ''}
                            onChange={(e) => setSettings(prev => ({ ...prev, fine_per_day: e.target.value }))}
                            className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Borrowing Period (Days)
                          </label>
                          <Input
                            value={settings.borrowing_period_days || ''}
                            onChange={(e) => setSettings(prev => ({ ...prev, borrowing_period_days: e.target.value }))}
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
                            value={settings.books_required_per_semester || ''}
                            onChange={(e) => setSettings(prev => ({ ...prev, books_required_per_semester: e.target.value }))}
                            className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Semester Duration (Months)
                          </label>
                          <Input
                            value={settings.semester_duration_months || ''}
                            onChange={(e) => setSettings(prev => ({ ...prev, semester_duration_months: e.target.value }))}
                            className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Max Books per Borrowing
                          </label>
                          <Input
                            value={settings.max_books_per_borrowing || ''}
                            onChange={(e) => setSettings(prev => ({ ...prev, max_books_per_borrowing: e.target.value }))}
                            className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={saveSettings}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Settings'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => loadData()}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
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
                <div className="text-center py-12">
                  <DollarSign className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Penalty Data</h3>
                  <p className="text-slate-500">Penalty statistics will appear here once students have overdue books.</p>
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
