import React, { useState, useEffect } from 'react';
import './PenaltyManagement.css';

const PenaltyManagement = () => {
    const [activeTab, setActiveTab] = useState('settings');
    const [settings, setSettings] = useState({});
    const [fines, setFines] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFine, setSelectedFine] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');

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
                const response = await fetch('/api/penalty/all-fines', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    setFines(data.data.fines);
                }
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

    const processPayment = async () => {
        if (!selectedFine || !paymentAmount) {
            setMessage('Please select a fine and enter payment amount');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/penalty/pay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fineId: selectedFine.id,
                    paymentAmount: parseFloat(paymentAmount),
                    paymentMethod,
                    notes: `Payment of ${paymentAmount} pesos via ${paymentMethod}`
                })
            });
            
            const data = await response.json();
            if (data.success) {
                setMessage('Payment processed successfully');
                setSelectedFine(null);
                setPaymentAmount('');
                loadData();
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Error processing payment');
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            setMessage('Error processing payment');
        } finally {
            setLoading(false);
        }
    };

    const filteredFines = fines.filter(fine => 
        fine.student_id_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fine.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fine.number_code.toLowerCase().includes(searchTerm.toLowerCase())
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
                <h2>Penalty & Rules Management</h2>
                {message && (
                    <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
                        {message}
                    </div>
                )}
            </div>

            <div className="penalty-tabs">
                <button 
                    className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    System Settings
                </button>
                <button 
                    className={`tab-button ${activeTab === 'fines' ? 'active' : ''}`}
                    onClick={() => setActiveTab('fines')}
                >
                    Fines Management
                </button>
                <button 
                    className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stats')}
                >
                    Statistics
                </button>
            </div>

            <div className="penalty-content">
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
                            {loading ? 'Updating...' : 'Update Settings'}
                        </button>
                    </div>
                )}

                {activeTab === 'fines' && (
                    <div className="fines-panel">
                        <div className="fines-header">
                            <h3>Fines Management</h3>
                            <div className="fines-actions">
                                <input
                                    type="text"
                                    placeholder="Search fines..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                                <button 
                                    className="btn btn-warning"
                                    onClick={processOverdueFines}
                                    disabled={loading}
                                >
                                    Process Overdue Fines
                                </button>
                                <button 
                                    className="btn btn-info"
                                    onClick={recalculateSemesterCounts}
                                    disabled={loading}
                                >
                                    Recalculate Semester Counts
                                </button>
                            </div>
                        </div>

                        <div className="fines-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Student ID</th>
                                        <th>Book</th>
                                        <th>Fine Amount</th>
                                        <th>Paid Amount</th>
                                        <th>Days Overdue</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFines.map(fine => (
                                        <tr key={fine.id}>
                                            <td>{fine.student_id_number}</td>
                                            <td>
                                                <div>
                                                    <strong>{fine.title}</strong>
                                                    <br />
                                                    <small>{fine.number_code}</small>
                                                </div>
                                            </td>
                                            <td>{formatCurrency(fine.fine_amount)}</td>
                                            <td>{formatCurrency(fine.paid_amount)}</td>
                                            <td>{fine.days_overdue}</td>
                                            <td>
                                                <span className={`badge ${getStatusBadge(fine.status)}`}>
                                                    {fine.status}
                                                </span>
                                            </td>
                                            <td>
                                                {fine.status === 'unpaid' && (
                                                    <button 
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => setSelectedFine(fine)}
                                                    >
                                                        Pay
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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

            {/* Payment Modal */}
            {selectedFine && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Process Fine Payment</h3>
                            <button 
                                className="close-btn"
                                onClick={() => setSelectedFine(null)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="fine-details">
                                <p><strong>Student:</strong> {selectedFine.student_id_number}</p>
                                <p><strong>Book:</strong> {selectedFine.title}</p>
                                <p><strong>Total Fine:</strong> {formatCurrency(selectedFine.fine_amount)}</p>
                                <p><strong>Already Paid:</strong> {formatCurrency(selectedFine.paid_amount)}</p>
                                <p><strong>Remaining:</strong> {formatCurrency(selectedFine.fine_amount - selectedFine.paid_amount)}</p>
                            </div>
                            <div className="payment-form">
                                <div className="form-group">
                                    <label>Payment Amount:</label>
                                    <input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        max={selectedFine.fine_amount - selectedFine.paid_amount}
                                        step="0.50"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Payment Method:</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="online">Online</option>
                                        <option value="waived">Waived</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn btn-secondary"
                                onClick={() => setSelectedFine(null)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn btn-primary"
                                onClick={processPayment}
                                disabled={loading || !paymentAmount}
                            >
                                {loading ? 'Processing...' : 'Process Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PenaltyManagement;
