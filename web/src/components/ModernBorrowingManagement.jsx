import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Plus, 
  Search, 
  RefreshCw,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  User,
  Book,
  ArrowRight,
  ArrowLeft,
  Eye,
  Filter,
  List,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import axios from 'axios';

const ModernBorrowingManagement = ({ user }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('borrow');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Get search highlight from navigation state
  const highlightTransactionId = location.state?.highlightTransaction;
  const searchQuery = location.state?.searchQuery;

  // Borrow form state
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [bookCodes, setBookCodes] = useState(['', '', '']);
  const [validationResult, setValidationResult] = useState(null);
  const [dueDate, setDueDate] = useState('');

  // Transactions state
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');



  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions();
    }
    
    // Set search term if coming from search
    if (searchQuery) {
      setSearchTerm(searchQuery);
      setActiveTab('transactions'); // Switch to transactions tab to show the result
    }
  }, [activeTab, currentPage, searchTerm, statusFilter]);

  // Listen for payment processed events to refresh data
  useEffect(() => {
    const handlePaymentProcessed = (event) => {
      console.log('Payment processed, refreshing borrowing data:', event.detail);
      if (activeTab === 'transactions') {
        fetchTransactions();
      }
    };

    window.addEventListener('paymentProcessed', handlePaymentProcessed);
    
    return () => {
      window.removeEventListener('paymentProcessed', handlePaymentProcessed);
    };
  }, [activeTab]);


  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await axios.get(`/api/borrowing/transactions?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTransactions(response.data.data.transactions || []);
        setTotalPages(response.data.data.pagination.pages || 1);
      } else {
        setTransactions([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const validateStudent = async () => {
    if (!studentIdNumber.trim()) {
      setValidationResult({ valid: false, message: 'Please enter a student ID number' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Validating student borrowing eligibility:', studentIdNumber);
      
      // First get student info
      const userResponse = await axios.get(`/api/admin/users/${studentIdNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!userResponse.data.user) {
        setValidationResult({
          valid: false,
          message: 'Student not found'
        });
        return;
      }

      // Then check borrowing eligibility using the dedicated endpoint
      const eligibilityResponse = await axios.get(`/api/borrowing/check-eligibility/${studentIdNumber.trim()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Borrowing eligibility response:', eligibilityResponse.data);

      if (eligibilityResponse.data.success && eligibilityResponse.data.data) {
        const { currentBorrowed, maxBooks, canBorrow, borrowingStatus } = eligibilityResponse.data.data;
        
        setValidationResult({
          valid: true,
          user: userResponse.data.user,
          currentBorrowed: currentBorrowed,
          canBorrow: canBorrow,
          message: canBorrow ? 'Student is eligible to borrow books' : 'Student cannot borrow books',
          details: {
            currentBorrowed: currentBorrowed,
            maxAllowed: maxBooks,
            canBorrow: canBorrow,
            borrowingStatus: borrowingStatus
          }
        });
      } else {
        // If eligibility check fails, show the error
        setValidationResult({
          valid: false,
          user: userResponse.data.user,
          message: eligibilityResponse.data.message || 'Student cannot borrow books',
          details: []
        });
      }
    } catch (error) {
      console.error('Validation error:', error.response?.data || error.message);
      
      // If it's a borrowing validation error, show specific message
      if (error.response?.data?.errors) {
        setValidationResult({
          valid: false,
          message: 'Student cannot borrow books',
          details: error.response.data.errors
        });
      } else {
        setValidationResult({
          valid: false,
          message: error.response?.data?.message || 'Student not found or not verified'
        });
      }
    }
  };

  const handleBorrow = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const validBookCodes = bookCodes.filter(code => code.trim() !== '');
      
      if (validBookCodes.length === 0) {
        setError('Please enter at least one book code');
        return;
      }

      const borrowData = {
        studentIdNumber: studentIdNumber,
        bookCodes: validBookCodes,
        dueDate: dueDate || null
      };

      console.log('Sending borrow request:', borrowData);
      console.log('Token:', token ? 'Present' : 'Missing');

      const response = await axios.post('/api/borrowing/borrow', borrowData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('Books borrowed successfully!');
      setStudentIdNumber('');
      setBookCodes(['', '', '']);
      setDueDate('');
      setValidationResult(null);
    } catch (error) {
      console.error('Borrow error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.data?.errors) {
        setError(error.response.data.errors.join(', '));
      } else {
        setError(error.response?.data?.message || 'Failed to borrow books');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (transactionId) => {
    if (!window.confirm('Are you sure you want to return this book?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/borrowing/return', {
        transactionIds: [transactionId]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('Book returned successfully!');
      fetchTransactions();
    } catch (error) {
      console.error('Return error:', error);
      setError(error.response?.data?.message || 'Failed to return book');
    }
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
                Book Borrowing Management
              </h1>
              <p className="text-slate-600 text-lg">
                Manage book borrowing and returns for students
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setActiveTab('borrow')}
                variant={activeTab === 'borrow' ? 'default' : 'outline'}
                className={activeTab === 'borrow' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <Book className="h-4 w-4 mr-2" />
                Borrow Books
              </Button>
              <Button 
                onClick={() => setActiveTab('transactions')}
                variant={activeTab === 'transactions' ? 'default' : 'outline'}
                className={activeTab === 'transactions' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <List className="h-4 w-4 mr-2" />
                View Transactions
              </Button>
            </div>
          </div>
        </motion.div>


        {/* Main Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab === 'borrow' ? (
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Borrow Books
                </CardTitle>
                <CardDescription>
                  Process book borrowing requests for students
                </CardDescription>
              </CardHeader>
              <CardContent>
                {message && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-600">{message}</p>
                  </div>
                )}
                
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                  </div>
                )}

                <form onSubmit={handleBorrow} className="space-y-6">
                  {/* Student ID Section */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Student ID Number *
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter student ID (e.g., C22-0044)"
                          value={studentIdNumber}
                          onChange={(e) => setStudentIdNumber(e.target.value)}
                          className="flex-1 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <Button
                          type="button"
                          onClick={validateStudent}
                          variant="outline"
                          className="whitespace-nowrap"
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Validate
                        </Button>
                      </div>
                    </div>

                    {validationResult ? (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border ${
                          validationResult.valid && validationResult.canBorrow
                            ? 'bg-green-50 border-green-200 text-green-700' 
                            : 'bg-red-50 border-red-200 text-red-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {validationResult.valid && validationResult.canBorrow ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                          <span className="text-sm font-medium">{validationResult.message}</span>
                        </div>
                        
                        {validationResult.user && (
                          <div className="mt-3 text-sm space-y-1">
                            <p><strong>Email:</strong> {validationResult.user.email}</p>
                            <p><strong>Status:</strong> {validationResult.user.is_verified ? 'Verified' : 'Unverified'}</p>
                            
                            {validationResult.details && (
                              <div className="mt-2 p-2 bg-white/50 rounded border">
                                <p><strong>Currently Borrowed:</strong> {validationResult.currentBorrowed || 0} books</p>
                                <p><strong>Max Allowed:</strong> {validationResult.details.maxAllowed || 3} books</p>
                                <p><strong>Can Borrow:</strong> {validationResult.canBorrow ? 'Yes' : 'No'}</p>
                                
                                {validationResult.details.borrowingStatus && (
                                  <div className="mt-2 text-xs">
                                    {validationResult.details.borrowingStatus.hasOverdueBooks && (
                                      <p className="text-red-600">⚠️ Has overdue books</p>
                                    )}
                                    {validationResult.details.borrowingStatus.hasUnpaidFines && (
                                      <p className="text-red-600">⚠️ Has unpaid fines</p>
                                    )}
                                    {!validationResult.details.borrowingStatus.withinLimit && (
                                      <p className="text-red-600">⚠️ Exceeded borrowing limit</p>
                                    )}
                                    {validationResult.details.borrowingStatus.reasonBlocked && (
                                      <p className="text-red-600">🚫 {validationResult.details.borrowingStatus.reasonBlocked}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {validationResult.details && Array.isArray(validationResult.details) && validationResult.details.length > 0 && (
                              <div className="mt-2">
                                <p className="font-medium text-red-600">Issues found:</p>
                                <ul className="list-disc list-inside text-xs mt-1">
                                  {validationResult.details.map((error, index) => (
                                    <li key={index}>{error}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <div className="p-3 rounded-lg border bg-blue-50 border-blue-200 text-blue-700">
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          <span className="text-sm font-medium">Click "Validate" to check student borrowing eligibility</span>
                        </div>
                        <p className="text-xs mt-1 text-blue-600">
                          Checks for overdue books, unpaid fines, and borrowing limits
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Book Codes Section */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-700">
                      Book Codes (up to 3 books) *
                    </label>
                    {bookCodes.map((code, index) => (
                      <div key={index}>
                        <Input
                          placeholder={`Book code ${index + 1}`}
                          value={code}
                          onChange={(e) => {
                            const newCodes = [...bookCodes];
                            newCodes[index] = e.target.value;
                            setBookCodes(newCodes);
                          }}
                          className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Due Date Section */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Due Date (optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <Input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Default: 14 days from today
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      disabled={loading || (!studentIdNumber.trim() || bookCodes.every(code => !code.trim()) || !validationResult?.canBorrow)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Borrow Books
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setStudentIdNumber('');
                        setBookCodes(['', '', '']);
                        setDueDate('');
                        setValidationResult(null);
                        setError('');
                        setMessage('');
                      }}
                    >
                      Clear Form
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  Borrowing Transactions
                </CardTitle>
                <CardDescription>
                  View and manage all borrowing transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          placeholder="Search by student ID or book title..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Status</option>
                        <option value="borrowed">Borrowed</option>
                        <option value="returned">Returned</option>
                        <option value="overdue">Overdue</option>
                      </select>
                      <Button
                        onClick={fetchTransactions}
                        variant="outline"
                        size="sm"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 text-slate-400 mx-auto mb-4 animate-spin" />
                      <p className="text-slate-600">Loading transactions...</p>
                    </div>
                  ) : transactions.length > 0 ? (
                    transactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
                          highlightTransactionId === transaction.id ? 'bg-purple-50 border-purple-200' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <BookOpen className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">
                                {transaction.student_id_number}
                              </h3>
                              <p className="text-sm text-slate-600">
                                {transaction.title} - {transaction.author}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant={transaction.status === 'returned' ? 'default' : 'secondary'}
                                  className={
                                    transaction.status === 'returned' 
                                      ? 'bg-green-100 text-green-700' 
                                      : transaction.status === 'overdue'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-orange-100 text-orange-700'
                                  }
                                >
                                  {transaction.status === 'returned' && <CheckCircle className="h-3 w-3 mr-1" />}
                                  {transaction.status === 'overdue' && <AlertCircle className="h-3 w-3 mr-1" />}
                                  {transaction.status === 'borrowed' && <Clock className="h-3 w-3 mr-1" />}
                                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                </Badge>
                                <span className="text-xs text-slate-500">
                                  Due: {new Date(transaction.due_date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {transaction.status === 'borrowed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReturn(transaction.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Return
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <List className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">No transactions found</h3>
                      <p className="text-slate-600">
                        {searchTerm ? 'Try adjusting your search terms' : 'No borrowing transactions yet'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-slate-600">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ModernBorrowingManagement;
