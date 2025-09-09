import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  RefreshCw,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Calendar,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import axios from 'axios';

const ModernReturningManagement = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Returning Management state
  const [returnSearchId, setReturnSearchId] = useState('');
  const [searchedStudent, setSearchedStudent] = useState(null);
  const [studentBooks, setStudentBooks] = useState([]);
  const [returnLoading, setReturnLoading] = useState(false);
  
  // Return condition tracking
  const [returnConditions, setReturnConditions] = useState({});
  const [conditionNotes, setConditionNotes] = useState({});
  const [processingNotes, setProcessingNotes] = useState({});



  // Listen for payment processed events to refresh data
  useEffect(() => {
    const handlePaymentProcessed = (event) => {
      console.log('Payment processed, refreshing returning data:', event.detail);
      // If we have a searched student, refresh their data
      if (searchedStudent && searchedStudent.idNumber === event.detail.studentId) {
        console.log('Refreshing student data after payment...');
        setTimeout(() => {
          searchStudentBooks();
        }, 500); // Small delay to ensure backend has processed
      }
    };

    window.addEventListener('paymentProcessed', handlePaymentProcessed);
    
    return () => {
      window.removeEventListener('paymentProcessed', handlePaymentProcessed);
    };
  }, [searchedStudent]);


  // Returning Management functions
  const searchStudentBooks = async () => {
    if (!returnSearchId.trim()) {
      setMessage('Please enter a student ID number');
      return;
    }

    try {
      setReturnLoading(true);
      setMessage(''); // Clear previous messages
      const token = localStorage.getItem('token');
      
      console.log('Searching for student:', returnSearchId.trim());
      console.log('Token present:', !!token);
      
      const response = await axios.get(`/api/borrowing/admin/search/${returnSearchId.trim()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('Search response:', response.data);

      if (response.data.success) {
        const student = response.data.data.student;
        const borrowedBooks = response.data.data.borrowedBooks || [];
        
        setSearchedStudent(student);
        setStudentBooks(borrowedBooks);
        
        const activeBooks = borrowedBooks.filter(book => book.status !== 'returned');
        const returnedBooks = borrowedBooks.filter(book => book.status === 'returned');
        
        if (activeBooks.length === 0 && returnedBooks.length === 0) {
          setMessage(`Student ${student.idNumber} found but has no book history.`);
        } else if (activeBooks.length === 0) {
          setMessage(`Student ${student.idNumber} has no currently borrowed books. ${returnedBooks.length} book(s) recently returned.`);
        } else {
          setMessage(`Found ${activeBooks.length} borrowed book(s) for student ${student.idNumber}${returnedBooks.length > 0 ? ` (${returnedBooks.length} recently returned)` : ''}`);
        }
      } else {
        setMessage(response.data.message || 'Student not found');
        setSearchedStudent(null);
        setStudentBooks([]);
      }
    } catch (error) {
      console.error('Error searching student books:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 404) {
        setMessage(`Student ${returnSearchId} not found in the system.`);
      } else if (error.response?.status === 403) {
        setMessage('Access denied. Admin privileges required.');
      } else {
        setMessage(`Error searching student books: ${error.response?.data?.message || error.message}`);
      }
      
      setSearchedStudent(null);
      setStudentBooks([]);
    } finally {
      setReturnLoading(false);
    }
  };

  const handleBookReturn = async (transactionId, bookTitle, isOverdue) => {
    if (isOverdue) {
      setMessage('Cannot return overdue book. Student must pay fines first in Penalty Management.');
      return;
    }

    // Get return condition and notes for this transaction
    const condition = returnConditions[transactionId] || 'good';
    const notes = conditionNotes[transactionId] || '';
    const procNotes = processingNotes[transactionId] || '';

    if (!window.confirm(`Are you sure you want to mark "${bookTitle}" as returned?\n\nReturn Condition: ${condition}\nNotes: ${notes || 'None'}`)) return;

    try {
      setReturnLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/borrowing/admin/return', {
        transactionId: transactionId,
        returnCondition: condition,
        conditionNotes: notes,
        processingNotes: procNotes
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setMessage(response.data.message);
        
        // Clear the condition data for this transaction
        setReturnConditions(prev => {
          const newConditions = { ...prev };
          delete newConditions[transactionId];
          return newConditions;
        });
        setConditionNotes(prev => {
          const newNotes = { ...prev };
          delete newNotes[transactionId];
          return newNotes;
        });
        setProcessingNotes(prev => {
          const newNotes = { ...prev };
          delete newNotes[transactionId];
          return newNotes;
        });
        
        // Refresh the student's books
        await searchStudentBooks();
      } else {
        if (response.data.requiresPayment) {
          setMessage(`Cannot return book. Student has unpaid fines. Please process payment in Penalty Management for student ${response.data.studentId}.`);
        } else {
          setMessage(response.data.message || 'Failed to return book');
        }
      }
    } catch (error) {
      console.error('Error returning book:', error);
      if (error.response?.data?.requiresPayment) {
        setMessage(`Cannot return book. Student has unpaid fines. Please process payment in Penalty Management for student ${error.response.data.studentId}.`);
      } else {
        setMessage('Error returning book');
      }
    } finally {
      setReturnLoading(false);
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
        duration: 0.5
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
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Returning Management
          </h1>
          <p className="text-slate-600 text-lg">
            Process book returns and manage student borrowing status
          </p>
        </motion.div>


        {/* Main Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" />
                Book Return Processing
              </CardTitle>
              <CardDescription>
                Search for students and process their book returns
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

              {/* Student Search Section */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Search Student by ID Number
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter student ID (e.g., C22-0044)"
                      value={returnSearchId}
                      onChange={(e) => setReturnSearchId(e.target.value)}
                      className="flex-1 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && searchStudentBooks()}
                    />
                    <Button
                      onClick={searchStudentBooks}
                      disabled={returnLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {returnLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                    {searchedStudent && (
                      <Button
                        onClick={searchStudentBooks}
                        disabled={returnLoading}
                        variant="outline"
                        className="ml-2"
                        title="Refresh student data"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Payment Info */}
                {searchedStudent && studentBooks.some(book => book.isOverdue) && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-yellow-700">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          This student has overdue books. Process payment in Penalty Management first to enable book returns.
                        </span>
                      </div>
                      <Button
                        onClick={searchStudentBooks}
                        variant="outline"
                        size="sm"
                        className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                        title="Refresh after payment processing"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                )}

                {/* Student Info and Borrowed Books */}
                {searchedStudent && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Student Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">ID Number:</span>
                          <p className="font-medium">{searchedStudent.idNumber}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Email:</span>
                          <p className="font-medium">{searchedStudent.email}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Status:</span>
                          <Badge variant={searchedStudent.isVerified ? "default" : "secondary"}>
                            {searchedStudent.isVerified ? "Verified" : "Not Verified"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Borrowed Books List */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-slate-900">
                        Book History ({studentBooks.length})
                      </h3>
                      
                      {studentBooks.length > 0 ? (
                        studentBooks.map((book, index) => (
                          <motion.div
                            key={book.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className={`p-2 rounded-lg ${
                                  book.status === 'returned' ? 'bg-green-100' :
                                  book.isOverdue ? 'bg-red-100' : 'bg-blue-100'
                                }`}>
                                  <BookOpen className={`h-5 w-5 ${
                                    book.status === 'returned' ? 'text-green-600' :
                                    book.isOverdue ? 'text-red-600' : 'text-blue-600'
                                  }`} />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-slate-900">
                                    {book.title}
                                  </h4>
                                  <p className="text-sm text-slate-600">
                                    by {book.author}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge 
                                      variant={book.status === 'returned' ? 'default' : book.isOverdue ? 'destructive' : 'secondary'}
                                      className={
                                        book.status === 'returned'
                                          ? 'bg-green-100 text-green-700'
                                          : book.isOverdue 
                                          ? 'bg-red-100 text-red-700' 
                                          : book.dueStatus === 'due_today'
                                          ? 'bg-orange-100 text-orange-700'
                                          : 'bg-blue-100 text-blue-700'
                                      }
                                    >
                                      {book.status === 'returned' && <CheckCircle className="h-3 w-3 mr-1" />}
                                      {book.isOverdue && <AlertCircle className="h-3 w-3 mr-1" />}
                                      {book.dueStatus === 'due_today' && <Clock className="h-3 w-3 mr-1" />}
                                      {!book.isOverdue && book.dueStatus === 'normal' && <CheckCircle className="h-3 w-3 mr-1" />}
                                      {book.status === 'returned'
                                        ? `Returned ${book.returned_at ? new Date(book.returned_at).toLocaleDateString() : ''}`
                                        : book.isOverdue 
                                        ? `Overdue (${book.daysUntilDue} days)` 
                                        : book.dueStatus === 'due_today'
                                        ? 'Due Today'
                                        : `Due in ${book.daysUntilDue} days`
                                      }
                                    </Badge>
                                    <span className="text-xs text-slate-500">
                                      Due: {new Date(book.due_date).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {!book.isOverdue && (
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={returnConditions[book.id] || 'good'}
                                      onChange={(e) => setReturnConditions(prev => ({
                                        ...prev,
                                        [book.id]: e.target.value
                                      }))}
                                      className="text-xs px-2 py-1 border rounded-md bg-white"
                                    >
                                      <option value="excellent">Excellent</option>
                                      <option value="good">Good</option>
                                      <option value="fair">Fair</option>
                                      <option value="poor">Poor</option>
                                      <option value="damaged">Damaged</option>
                                    </select>
                                    <input
                                      type="text"
                                      placeholder="Condition notes..."
                                      value={conditionNotes[book.id] || ''}
                                      onChange={(e) => setConditionNotes(prev => ({
                                        ...prev,
                                        [book.id]: e.target.value
                                      }))}
                                      className="text-xs px-2 py-1 border rounded-md w-32"
                                    />
                                  </div>
                                )}
                                {book.status === 'returned' ? (
                                  <div className="text-sm text-green-600 font-medium">
                                    ✓ Returned
                                  </div>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleBookReturn(book.id, book.title, book.isOverdue)}
                                    disabled={book.isOverdue || returnLoading}
                                    className={book.isOverdue 
                                      ? 'text-slate-400 cursor-not-allowed' 
                                      : 'text-green-600 hover:text-green-700'
                                    }
                                    title={book.isOverdue 
                                      ? 'Cannot return overdue book. Student must pay fines first.' 
                                      : 'Mark book as returned'
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    {book.isOverdue ? 'Overdue' : 'Return'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-slate-900 mb-2">No borrowed books</h3>
                          <p className="text-slate-600">
                            This student currently has no books borrowed.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Help Text */}
                {!searchedStudent && (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Search for a Student</h3>
                    <p className="text-slate-600">
                      Enter a student ID number to view their borrowed books and process returns.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ModernReturningManagement;
