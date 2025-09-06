import React, { useState, useEffect } from 'react';
import { 
  FiDollarSign, 
  FiSettings, 
  FiUsers, 
  FiSearch, 
  FiChevronDown, 
  FiChevronUp,
  FiCheck,
  FiRefreshCw,
  FiBook,
  FiClock,
  FiAlertCircle
} from 'react-icons/fi';
import designSystem from '../styles/designSystem';
import './PenaltyManagement.css';

const PenaltyManagement = () => {
    const [activeTab, setActiveTab] = useState('fines');
    const [settings, setSettings] = useState({});
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState({});
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
                const response = await fetch('/api/penalty/settings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    setSettings(data.data);
                }
            } else if (activeTab === 'fines') {
                await loadStudentsWithFines();
            } else if (activeTab === 'stats') {
                const response = await fetch('/api/penalty/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    setStats(data.data);
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
            setMessage('Error loading data');
        } finally {
            setLoading(false);
        }
    };

    const loadStudentsWithFines = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Get all fines grouped by student
            const response = await fetch('/api/penalty/all-fines', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (data.success) {
                const fines = data.data.fines;
                
                // Group fines by student
                const studentMap = new Map();
                
                fines.forEach(fine => {
                    const studentId = fine.student_id_number;
                    if (!studentMap.has(studentId)) {
                        studentMap.set(studentId, {
                            studentId,
                            email: fine.email,
                            totalFines: 0,
                            unpaidFines: 0,
                            totalAmount: 0,
                            unpaidAmount: 0,
                            fines: []
                        });
                    }
                    
                    const student = studentMap.get(studentId);
                    student.fines.push(fine);
                    student.totalFines++;
                    student.totalAmount += parseFloat(fine.fine_amount);
                    
                    if (fine.status === 'unpaid') {
                        student.unpaidFines++;
                        student.unpaidAmount += parseFloat(fine.fine_amount - fine.paid_amount);
                    }
                });
                
                setStudents(Array.from(studentMap.values()));
            }
        } catch (error) {
            console.error('Error loading students with fines:', error);
            setMessage('Error loading students data');
        }
    };

    const updateSettings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/penalty/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ settings })
            });
            
            const data = await response.json();
            if (data.success) {
                setMessage('Settings updated successfully');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Error updating settings');
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            setMessage('Error updating settings');
        } finally {
            setLoading(false);
        }
    };

    const processOverdueFines = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/penalty/process-overdue', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await response.json();
            if (data.success) {
                setMessage('Overdue fines processed successfully');
                loadData();
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Error processing overdue fines');
            }
        } catch (error) {
            console.error('Error processing overdue fines:', error);
            setMessage('Error processing overdue fines');
        } finally {
            setLoading(false);
        }
    };

    const recalculateSemesterCounts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/penalty/recalculate-semester-counts', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await response.json();
            if (data.success) {
                setMessage(data.message);
                loadData();
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Error recalculating semester counts');
            }
        } catch (error) {
            console.error('Error recalculating semester counts:', error);
            setMessage('Error recalculating semester counts');
        } finally {
            setLoading(false);
        }
    };

    const confirmAllPayments = async (studentId) => {
        if (!window.confirm('Are you sure you want to confirm payment for ALL unpaid fines for this student? This will return all books and allow the student to borrow again.')) {
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            // Process payment for all unpaid fines
            const response = await fetch(`/api/penalty/pay-all/${studentId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                setMessage(`Payment confirmed successfully! Paid ${data.data.paidFines} fines, returned ${data.data.returnedBooks} books. Total amount: ₱${data.data.totalAmount.toFixed(2)}`);
                loadStudentsWithFines();
                setTimeout(() => setMessage(''), 5000);
            } else {
                setMessage('Error confirming payment');
            }
        } catch (error) {
            console.error('Error confirming payment:', error);
            setMessage('Error confirming payment');
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
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status) => {
        const badges = {
            'unpaid': 'badge-danger',
            'paid': 'badge-success',
            'waived': 'badge-warning'
        };
        return badges[status] || 'badge-secondary';
    };

    const formatCurrency = (amount) => {
        return `₱${parseFloat(amount).toFixed(2)}`;
    };

    return (
        <div className="penalty-management">
            <div className="penalty-header">
                <h2>Student Fines Management</h2>
                {message && (
                    <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
                        {message}
                    </div>
                )}
            </div>

            <div className="penalty-tabs">
                <button 
                    className={`tab-button ${activeTab === 'fines' ? 'active' : ''}`}
                    onClick={() => setActiveTab('fines')}
                >
                    <FiDollarSign />
                    Student Fines
                </button>
                <button 
                    className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    <FiSettings />
                    System Settings
                </button>
                <button 
                    className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stats')}
                >
                    <FiUsers />
                    Statistics
                </button>
            </div>

            <div className="penalty-content">
                {activeTab === 'fines' && (
                    <div className="fines-panel">
                        <div className="fines-header">
                            <h3>Student Fines Management</h3>
                            <div className="fines-actions">
                                <div className="search-container">
                                    <input
                                        type="text"
                                        placeholder="Search by Student ID or Email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="search-input"
                                    />
                                    <FiSearch className="search-icon" />
                                </div>
                                <div className="action-buttons">
                                    <button 
                                        className="btn btn-warning"
                                        onClick={processOverdueFines}
                                        disabled={loading}
                                    >
                                        <FiRefreshCw />
                                        Process Overdue Fines
                                    </button>
                                    <button 
                                        className="btn btn-info"
                                        onClick={recalculateSemesterCounts}
                                        disabled={loading}
                                    >
                                        <FiClock />
                                        Recalculate Semester Counts
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="students-list">
                            {loading ? (
                                <div className="loading">Loading students...</div>
                            ) : filteredStudents.length === 0 ? (
                                <div className="no-data">No students with fines found</div>
                            ) : (
                                filteredStudents.map(student => (
                                    <div key={student.studentId} className="student-card">
                                        <div className="student-header" onClick={() => toggleStudentExpansion(student.studentId)}>
                                            <div className="student-info">
                                                <h4>{student.studentId}</h4>
                                                <p className="student-email">{student.email}</p>
                                            </div>
                                            <div className="student-summary">
                                                <div className="summary-item">
                                                    <span className="label">Total Fines:</span>
                                                    <span className="value">{student.totalFines}</span>
                                                </div>
                                                <div className="summary-item">
                                                    <span className="label">Unpaid:</span>
                                                    <span className="value unpaid">{student.unpaidFines}</span>
                                                </div>
                                                <div className="summary-item">
                                                    <span className="label">Total Amount:</span>
                                                    <span className="value amount">{formatCurrency(student.totalAmount)}</span>
                                                </div>
                                                <div className="summary-item">
                                                    <span className="label">Unpaid Amount:</span>
                                                    <span className="value amount unpaid">{formatCurrency(student.unpaidAmount)}</span>
                                                </div>
                                            </div>
                                            <div className="expand-icon">
                                                {expandedStudents.has(student.studentId) ? <FiChevronDown /> : <FiChevronUp />}
                                            </div>
                                        </div>

                                        {expandedStudents.has(student.studentId) && (
                                            <div className="student-details">
                                                <div className="student-actions">
                                                    {student.unpaidFines > 0 && (
                                                        <div className="payment-summary">
                                                            <div className="payment-info">
                                                                <h5>Payment Summary</h5>
                                                                <p>Total unpaid amount: <strong>{formatCurrency(student.unpaidAmount)}</strong></p>
                                                                <p>Number of unpaid fines: <strong>{student.unpaidFines}</strong></p>
                                                                <p className="payment-note">Clicking "Confirm All Payments" will pay all fines and return all books to available status.</p>
                                                            </div>
                                                            <button 
                                                                className="btn btn-success btn-lg"
                                                                onClick={() => confirmAllPayments(student.studentId)}
                                                                disabled={loading}
                                                            >
                                                                <FiCheck />
                                                                {loading ? 'Processing...' : 'Confirm All Payments'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="fines-list">
                                                    <h5>Borrowed Books & Fines</h5>
                                                    {student.fines.map(fine => (
                                                        <div key={fine.id} className="fine-item">
                                                            <div className="book-info">
                                                                <h6>{fine.title}</h6>
                                                                <p className="book-code">{fine.number_code}</p>
                                                                <p className="book-author">by {fine.author}</p>
                                                            </div>
                                                            <div className="fine-details">
                                                                <div className="fine-amounts">
                                                                    <div className="amount-item">
                                                                        <span className="label">Total Fine:</span>
                                                                        <span className="value">{formatCurrency(fine.fine_amount)}</span>
                                                                    </div>
                                                                    <div className="amount-item">
                                                                        <span className="label">Paid:</span>
                                                                        <span className="value">{formatCurrency(fine.paid_amount)}</span>
                                                                    </div>
                                                                    <div className="amount-item">
                                                                        <span className="label">Remaining:</span>
                                                                        <span className="value remaining">{formatCurrency(fine.fine_amount - fine.paid_amount)}</span>
                                                                    </div>
                                                                    <div className="amount-item">
                                                                        <span className="label">Days Overdue:</span>
                                                                        <span className="value">{fine.days_overdue}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="fine-status">
                                                                    <span className={`badge ${getStatusBadge(fine.status)}`}>
                                                                        {fine.status.toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="settings-panel">
                        <h3>System Settings</h3>
                        <div className="settings-grid">
                            <div className="setting-item">
                                <label>Max Books Per Borrowing:</label>
                                <input
                                    type="number"
                                    value={settings.max_books_per_borrowing || 3}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        max_books_per_borrowing: e.target.value
                                    })}
                                    min="1"
                                    max="10"
                                />
                            </div>
                            <div className="setting-item">
                                <label>Borrowing Period (Days):</label>
                                <input
                                    type="number"
                                    value={settings.borrowing_period_days || 7}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        borrowing_period_days: e.target.value
                                    })}
                                    min="1"
                                    max="30"
                                />
                            </div>
                            <div className="setting-item">
                                <label>Fine Per Day (Pesos):</label>
                                <input
                                    type="number"
                                    value={settings.fine_per_day || 5}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        fine_per_day: e.target.value
                                    })}
                                    min="1"
                                    max="100"
                                    step="0.50"
                                />
                            </div>
                            <div className="setting-item">
                                <label>Books Required Per Semester:</label>
                                <input
                                    type="number"
                                    value={settings.books_required_per_semester || 20}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        books_required_per_semester: e.target.value
                                    })}
                                    min="1"
                                    max="100"
                                />
                            </div>
                            <div className="setting-item">
                                <label>Semester Duration (Months):</label>
                                <input
                                    type="number"
                                    value={settings.semester_duration_months || 5}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        semester_duration_months: e.target.value
                                    })}
                                    min="1"
                                    max="12"
                                />
                            </div>
                        </div>
                        <button 
                            className="btn btn-primary"
                            onClick={updateSettings}
                            disabled={loading}
                        >
                            <FiCheck />
                            {loading ? 'Updating...' : 'Update Settings'}
                        </button>
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div className="stats-panel">
                        <h3>Penalty System Statistics</h3>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h4>Total Fines</h4>
                                <p className="stat-number">{stats.totalFines || 0}</p>
                            </div>
                            <div className="stat-card">
                                <h4>Unpaid Fines</h4>
                                <p className="stat-number">{stats.unpaidFines || 0}</p>
                            </div>
                            <div className="stat-card">
                                <h4>Total Fine Amount</h4>
                                <p className="stat-number">{formatCurrency(stats.totalFineAmount || 0)}</p>
                            </div>
                            <div className="stat-card">
                                <h4>Unpaid Fine Amount</h4>
                                <p className="stat-number">{formatCurrency(stats.unpaidFineAmount || 0)}</p>
                            </div>
                            <div className="stat-card">
                                <h4>Overdue Books</h4>
                                <p className="stat-number">{stats.overdueBooks || 0}</p>
                            </div>
                            <div className="stat-card">
                                <h4>Blocked Students</h4>
                                <p className="stat-number">{stats.blockedStudents || 0}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PenaltyManagement;
