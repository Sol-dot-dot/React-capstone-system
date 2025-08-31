import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BorrowingManagement.css';

const BorrowingManagement = ({ user }) => {
  const [activeTab, setActiveTab] = useState('borrow');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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

  // Statistics state
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
    if (activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [activeTab, currentPage, searchTerm, statusFilter]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/borrowing/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await axios.get(`/api/borrowing/transactions?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTransactions(response.data.data.transactions);
      setTotalPages(response.data.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateBorrowing = async () => {
    if (!studentIdNumber.trim()) {
      setError('Please enter student ID number');
      return;
    }

    const validBookCodes = bookCodes.filter(code => code.trim() !== '');
    if (validBookCodes.length === 0) {
      setError('Please enter at least one book code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/borrowing/validate', {
        studentIdNumber: studentIdNumber.trim(),
        bookCodes: validBookCodes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setValidationResult(response.data.data);
      setMessage('Validation successful! You can now proceed with borrowing.');
    } catch (error) {
      setError(error.response?.data?.message || 'Validation failed');
      setValidationResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowBooks = async () => {
    if (!validationResult) {
      setError('Please validate the borrowing request first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const token = localStorage.getItem('token');
      const validBookCodes = bookCodes.filter(code => code.trim() !== '');
      
      console.log('🔍 Frontend: Attempting to borrow books...');
      console.log('🔍 Student ID:', studentIdNumber.trim());
      console.log('🔍 Book Codes:', validBookCodes);
      console.log('🔍 Due Date:', dueDate || null);
      console.log('🔍 Token exists:', !!token);
      
      const response = await axios.post('/api/borrowing/borrow', {
        studentIdNumber: studentIdNumber.trim(),
        bookCodes: validBookCodes,
        dueDate: dueDate || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Frontend: Borrowing successful:', response.data);

      setMessage(`Successfully borrowed ${validBookCodes.length} book(s)!`);
      setValidationResult(null);
      setStudentIdNumber('');
      setBookCodes(['', '', '']);
      setDueDate('');
      fetchStats();
    } catch (error) {
      console.error('❌ Frontend: Borrowing failed:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to process borrowing');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBooks = async (transactionIds) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.post('/api/borrowing/return', {
        transactionIds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage(`Successfully returned ${transactionIds.length} book(s)!`);
      fetchTransactions();
      fetchStats();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to return books');
    } finally {
      setLoading(false);
    }
  };

  const updateBookCode = (index, value) => {
    const newBookCodes = [...bookCodes];
    newBookCodes[index] = value;
    setBookCodes(newBookCodes);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      borrowed: 'badge-warning',
      returned: 'badge-success',
      overdue: 'badge-danger'
    };
    return <span className={`badge ${statusClasses[status] || 'badge-secondary'}`}>{status}</span>;
  };

  return (
    <div className="borrowing-management">
      <div className="borrowing-header">
        <h2>📚 Book Borrowing Management</h2>
        <p>Manage book borrowing and returns for students</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.totalBorrowed}</div>
            <div className="stat-label">Currently Borrowed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.overdueBooks}</div>
            <div className="stat-label">Overdue Books</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.todayBorrowings}</div>
            <div className="stat-label">Today's Borrowings</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.todayReturns}</div>
            <div className="stat-label">Today's Returns</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'borrow' ? 'active' : ''}`}
          onClick={() => setActiveTab('borrow')}
        >
          📖 Borrow Books
        </button>
        <button 
          className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          📋 View Transactions
        </button>
      </div>

      {/* Messages */}
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Borrow Books Tab */}
      {activeTab === 'borrow' && (
        <div className="borrow-section">
          <div className="borrow-form">
            <h3>Borrow Books</h3>
            
            <div className="form-group">
              <label>Student ID Number *</label>
              <input
                type="text"
                value={studentIdNumber}
                onChange={(e) => setStudentIdNumber(e.target.value)}
                placeholder="Enter student ID (e.g., C22-0044)"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Book Codes (up to 3 books) *</label>
              {bookCodes.map((code, index) => (
                <input
                  key={index}
                  type="text"
                  value={code}
                  onChange={(e) => updateBookCode(index, e.target.value)}
                  placeholder={`Book code ${index + 1}`}
                  className="form-control mb-2"
                />
              ))}
            </div>

            <div className="form-group">
              <label>Due Date (optional)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="form-control"
              />
              <small className="form-text text-muted">Default: 14 days from today</small>
            </div>

            <div className="button-group">
              <button
                className="btn btn-primary"
                onClick={handleValidateBorrowing}
                disabled={loading}
              >
                {loading ? 'Validating...' : 'Validate Request'}
              </button>
              
              {validationResult && (
                <button
                  className="btn btn-success"
                  onClick={handleBorrowBooks}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Borrow Books'}
                </button>
              )}
            </div>
          </div>

          {/* Validation Results */}
          {validationResult && (
            <div className="validation-results">
              <h4>Validation Results</h4>
              
              <div className="student-info">
                <h5>Student Information</h5>
                <p><strong>ID Number:</strong> {validationResult.student.id_number}</p>
                <p><strong>Email:</strong> {validationResult.student.email}</p>
                <p><strong>Currently Borrowed:</strong> {validationResult.currentBorrowed} books</p>
              </div>

              <div className="books-info">
                <h5>Books to Borrow</h5>
                {validationResult.validBooks.map((book, index) => (
                  <div key={index} className="book-item">
                    <p><strong>Title:</strong> {book.book.title}</p>
                    <p><strong>Author:</strong> {book.book.author}</p>
                    <p><strong>Code:</strong> {book.book.number_code}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="transactions-section">
          <div className="transactions-header">
            <h3>Borrowing Transactions</h3>
            
            <div className="filters">
              <input
                type="text"
                placeholder="Search by student ID, book title, or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
              />
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-control"
              >
                <option value="">All Status</option>
                <option value="borrowed">Borrowed</option>
                <option value="returned">Returned</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading transactions...</div>
          ) : (
            <>
              <div className="transactions-table">
                <table>
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Book Title</th>
                      <th>Book Code</th>
                      <th>Borrowed Date</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{transaction.student_id_number}</td>
                        <td>{transaction.title}</td>
                        <td>{transaction.number_code}</td>
                        <td>{formatDate(transaction.borrowed_at)}</td>
                        <td>{formatDate(transaction.due_date)}</td>
                        <td>{getStatusBadge(transaction.status)}</td>
                        <td>
                          {transaction.status === 'borrowed' && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleReturnBooks([transaction.id])}
                            >
                              Return
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  
                  <span className="page-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BorrowingManagement;

