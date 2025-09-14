import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Search, 
  Filter,
  Users, 
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Eye,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Award,
  Target,
  Calendar,
  User,
  Mail,
  Book
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import axios from 'axios';

const ClearanceRequirements = ({ user }) => {
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [expandedStudents, setExpandedStudents] = useState(new Set());

  useEffect(() => {
    loadClearanceData();
  }, [searchTerm, statusFilter]);

  const loadClearanceData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/penalty/clearance-requirements', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          search: searchTerm || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });
      
      if (response.data.success) {
        setStudents(response.data.data.students || []);
        setSummary(response.data.data.summary || {});
      }
    } catch (error) {
      console.error('Error loading clearance data:', error);
      setMessage('Error loading clearance requirements data');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentDetails = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/penalty/clearance-requirements/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setStudentDetails(response.data.data);
        setSelectedStudent(studentId);
      }
    } catch (error) {
      console.error('Error loading student details:', error);
      setMessage('Error loading student details');
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
    loadClearanceData();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Auto-search as user types (with debounce)
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      loadClearanceData();
    }, 500);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'near_completion': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'needs_improvement': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'near_completion': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <TrendingUp className="h-4 w-4" />;
      case 'needs_improvement': return <AlertCircle className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'near_completion': return 'Near Completion';
      case 'in_progress': return 'In Progress';
      case 'needs_improvement': return 'Needs Improvement';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Clearance Requirements</h1>
          </div>
          <p className="text-slate-600">
            Monitor student progress towards the 20 books per semester requirement
          </p>
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

        {/* Summary Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
        >
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Students</p>
                  <p className="text-2xl font-bold text-slate-900">{summary.total || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{summary.completed || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Near Completion</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.near_completion || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-600">{summary.in_progress || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Needs Improvement</p>
                  <p className="text-2xl font-bold text-red-600">{summary.needs_improvement || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filter */}
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
                      placeholder="Search by Student ID, Name, or Email..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                      className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="near_completion">Near Completion</option>
                    <option value="in_progress">In Progress</option>
                    <option value="needs_improvement">Needs Improvement</option>
                  </select>
                  <Button
                    onClick={loadClearanceData}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Students List */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Student Clearance Status
              </CardTitle>
              <CardDescription>
                Track student progress towards semester book requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 text-slate-400 mx-auto mb-4 animate-spin" />
                  <p className="text-slate-600">Loading clearance requirements...</p>
                </div>
              ) : students.length > 0 ? (
                <div className="space-y-4">
                  {students.map((student, index) => (
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
                              {student.first_name} {student.last_name}
                            </h3>
                            <p className="text-sm text-slate-600">{student.id_number}</p>
                            <p className="text-sm text-slate-500">{student.email}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="text-sm">
                                <span className="font-medium text-slate-700">Books This Semester:</span>
                                <span className="ml-1 text-blue-600 font-semibold">
                                  {student.books_borrowed_count || 0}/20
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-slate-700">Remaining:</span>
                                <span className="ml-1 text-orange-600 font-semibold">
                                  {student.books_remaining || 0}
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-slate-700">Unpaid Fines:</span>
                                <span className="ml-1 text-red-600 font-semibold">
                                  ₱{student.unpaid_fines_amount || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(student.clearance_status)} flex items-center gap-1`}>
                            {getStatusIcon(student.clearance_status)}
                            {getStatusText(student.clearance_status)}
                          </Badge>
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadStudentDetails(student.id_number)}
                            className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
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
                                <h4 className="font-medium text-slate-900">Clearance Status</h4>
                                <div className="text-sm text-slate-600">
                                  <p><strong>Status:</strong> {student.clearance_message}</p>
                                  <p><strong>Books Borrowed:</strong> {student.books_borrowed_count || 0}</p>
                                  <p><strong>Max Books Allowed:</strong> {student.max_books_allowed || 5}</p>
                                  <p><strong>Semester Status:</strong> {student.semester_status || 'inactive'}</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium text-slate-900">Progress</h4>
                                <div className="text-sm text-slate-600">
                                  <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                      style={{ 
                                        width: `${Math.min(100, ((student.books_borrowed_count || 0) / 20) * 100)}%` 
                                      }}
                                    ></div>
                                  </div>
                                  <p><strong>Progress:</strong> {Math.round(((student.books_borrowed_count || 0) / 20) * 100)}%</p>
                                  <p><strong>Last Updated:</strong> {student.semester_updated ? new Date(student.semester_updated).toLocaleDateString() : 'Never'}</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No students found matching your criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Student Details Modal */}
        {selectedStudent && studentDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900">Student Clearance Details</h2>
                <Button
                  variant="outline"
                  onClick={() => setSelectedStudent(null)}
                >
                  Close
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Student Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-slate-900 mb-2">Student Information</h3>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p><strong>Name:</strong> {studentDetails.student.first_name} {studentDetails.student.last_name}</p>
                      <p><strong>ID:</strong> {studentDetails.student.id_number}</p>
                      <p><strong>Email:</strong> {studentDetails.student.email}</p>
                      <p><strong>Status:</strong> {studentDetails.student.is_verified ? 'Verified' : 'Unverified'}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 mb-2">Clearance Status</h3>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p><strong>Status:</strong> {studentDetails.clearanceMessage}</p>
                      <p><strong>Books This Semester:</strong> {studentDetails.semesterTracking.books_borrowed_count}/20</p>
                      <p><strong>Books Remaining:</strong> {studentDetails.booksRemaining}</p>
                      <p><strong>Max Books Allowed:</strong> {studentDetails.semesterTracking.max_books_allowed}</p>
                      <p><strong>Unpaid Fines:</strong> ₱{studentDetails.finesInfo.unpaid_amount}</p>
                    </div>
                  </div>
                </div>

                {/* Current Semester Books */}
                {studentDetails.currentSemesterBooks.length > 0 && (
                  <div>
                    <h3 className="font-medium text-slate-900 mb-3">Current Semester Books</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {studentDetails.currentSemesterBooks.map((book, index) => (
                        <div key={index} className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900">{book.title}</h4>
                              <p className="text-sm text-slate-600">by {book.author}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                                <span><strong>Code:</strong> {book.number_code}</span>
                                <span><strong>Category:</strong> {book.category}</span>
                                <span><strong>Borrowed:</strong> {new Date(book.borrowed_date).toLocaleDateString()}</span>
                                <span><strong>Due:</strong> {new Date(book.due_date).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <Badge 
                              className={
                                book.current_status === 'Returned' ? 'bg-green-100 text-green-800' :
                                book.current_status === 'Overdue' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }
                            >
                              {book.current_status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ClearanceRequirements;
