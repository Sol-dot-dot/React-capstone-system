import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Package,
  User,
  Download,
  Printer,
  Search,
  Filter,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState('currently-borrowed');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: '',
    endDate: '',
    period: 'all',
    searchQuery: ''
  });

  const reports = [
    {
      id: 'currently-borrowed',
      title: 'Currently Borrowed Books',
      icon: FileText,
      color: 'blue',
      description: 'Books currently checked out'
    },
    {
      id: 'overdue-books',
      title: 'Overdue Books',
      icon: AlertTriangle,
      color: 'red',
      description: 'Books past due date'
    },
    {
      id: 'returned-books',
      title: 'Returned Books History',
      icon: CheckCircle,
      color: 'green',
      description: 'Recently returned books'
    },
    {
      id: 'most-borrowed',
      title: 'Most Borrowed Books',
      icon: TrendingUp,
      color: 'purple',
      description: 'Top 10 most popular books'
    },
    {
      id: 'inventory-summary',
      title: 'Books Inventory Summary',
      icon: Package,
      color: 'orange',
      description: 'Inventory by category'
    },
    {
      id: 'user-history',
      title: 'User Borrowing History',
      icon: User,
      color: 'cyan',
      description: 'Individual user lookup'
    }
  ];

  const fetchReportData = async (reportId = activeReport) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      let url = `/api/reports/${reportId}`;
      const params = new URLSearchParams();

      // Add filters based on report type
      if (reportId === 'currently-borrowed') {
        if (filters.status && filters.status !== 'all') params.append('status', filters.status);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
      } else if (reportId === 'returned-books') {
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
      } else if (reportId === 'most-borrowed') {
        if (filters.period) params.append('period', filters.period);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, config);

      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeReport]);

  const handleReportChange = (reportId) => {
    setActiveReport(reportId);
    setFilters({ status: 'all', startDate: '', endDate: '', period: 'all', searchQuery: '' });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // In a real implementation, you would use a library like jsPDF or html2pdf
    alert('Export to PDF functionality would be implemented here using jsPDF library');
  };

  const getColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700',
      red: 'bg-red-100 text-red-700',
      green: 'bg-green-100 text-green-700',
      purple: 'bg-purple-100 text-purple-700',
      orange: 'bg-orange-100 text-orange-700',
      cyan: 'bg-cyan-100 text-cyan-700'
    };
    return colors[color] || colors.blue;
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-slate-600">{error}</p>
        </div>
      );
    }

    if (!reportData || (Array.isArray(reportData) && reportData.length === 0)) {
      return (
        <div className="text-center py-12">
          <div className="text-slate-400 text-4xl mb-4">📋</div>
          <p className="text-slate-600">No data available for this report</p>
        </div>
      );
    }

    // Render based on active report
    switch (activeReport) {
      case 'currently-borrowed':
        if (!Array.isArray(reportData)) return null;
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Book Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Borrower</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Borrowed Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {reportData.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{row.book_title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.author}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.borrower_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.borrower_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(row.borrowed_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(row.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={row.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'overdue-books':
        if (!Array.isArray(reportData)) return null;
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Book Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Borrower</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Days Overdue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Penalty</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {reportData.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{row.book_title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.borrower_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.borrower_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.borrower_contact}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(row.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className="bg-red-100 text-red-700">
                        {row.days_overdue} days
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">
                      ₱{parseFloat(row.penalty_amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'returned-books':
        if (!Array.isArray(reportData)) return null;
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Book Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Borrower</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Borrowed Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Returned Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Return Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {reportData.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{row.book_title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.borrower_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(row.borrowed_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(row.returned_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={row.return_status === 'On-time' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                        {row.return_status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'most-borrowed':
        if (!Array.isArray(reportData)) return null;
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Book Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Times Borrowed</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {reportData.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-400 text-white' :
                        index === 1 ? 'bg-slate-300 text-white' :
                        index === 2 ? 'bg-orange-400 text-white' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {row.rank || index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{row.book_title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.author}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className="bg-purple-100 text-purple-700">
                        {row.times_borrowed} times
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'inventory-summary':
        if (reportData.categoryBreakdown) {
          return (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Books</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Available</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Borrowed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Lost/Damaged</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {reportData.categoryBreakdown.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{row.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.total_books}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className="bg-green-100 text-green-700">{row.available}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className="bg-blue-100 text-blue-700">{row.borrowed}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className="bg-red-100 text-red-700">{row.lost_damaged}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return null;

      case 'user-history':
        // This report requires an ID number input from the user
        // For now, show a message prompting for input
        return (
          <div className="text-center py-12">
            <div className="text-blue-500 text-4xl mb-4">🔍</div>
            <p className="text-slate-600 mb-4">Enter a user ID number to view their borrowing history</p>
            <div className="max-w-md mx-auto">
              <input
                type="text"
                placeholder="Enter ID Number (e.g., 2021-1234)"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    // Fetch user history with the entered ID
                    const fetchUserHistory = async () => {
                      try {
                        setLoading(true);
                        const token = localStorage.getItem('token');
                        const response = await axios.get(`/api/reports/user-history/${e.target.value}`, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        if (response.data.success) {
                          setReportData(response.data.data);
                        }
                      } catch (error) {
                        setError('User not found or error fetching data');
                      } finally {
                        setLoading(false);
                      }
                    };
                    fetchUserHistory();
                  }
                }}
              />
            </div>
            {reportData && reportData.userInfo && (
              <div className="mt-8 max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">User Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Name</p>
                      <p className="font-medium">{reportData.userInfo.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">ID Number</p>
                      <p className="font-medium">{reportData.userInfo.id_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium">{reportData.userInfo.email}</p>
                    </div>
                  </div>
                </div>

                {reportData.currentBorrows && reportData.currentBorrows.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Current Borrows</h3>
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Book</th>
                          <th className="text-left py-2">Borrowed Date</th>
                          <th className="text-left py-2">Due Date</th>
                          <th className="text-left py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.currentBorrows.map((borrow, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="py-2">{borrow.title}</td>
                            <td className="py-2">{new Date(borrow.borrowed_date).toLocaleDateString()}</td>
                            <td className="py-2">{new Date(borrow.due_date).toLocaleDateString()}</td>
                            <td className="py-2">
                              <span className={`px-2 py-1 rounded text-sm ${
                                borrow.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {borrow.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return <div>Select a report type</div>;
    }
  };

  const renderFilters = () => {
    switch (activeReport) {
      case 'currently-borrowed':
        return (
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => fetchReportData()}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        );

      case 'returned-books':
        return (
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => fetchReportData()}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        );

      case 'most-borrowed':
        return (
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time Period</label>
              <select
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
                value={filters.period}
                onChange={(e) => setFilters({ ...filters, period: e.target.value })}
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="semester">This Semester (6 months)</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => fetchReportData()}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Library Reports</h1>
          <p className="text-slate-600">Generate and export various library reports</p>
        </motion.div>

        {/* Report Type Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => handleReportChange(report.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  activeReport === report.id
                    ? `${getColorClass(report.color)} border-current`
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className={`h-6 w-6 mx-auto mb-2 ${
                  activeReport === report.id ? 'text-current' : 'text-slate-400'
                }`} />
                <p className={`text-xs font-medium text-center ${
                  activeReport === report.id ? 'text-current' : 'text-slate-600'
                }`}>
                  {report.title}
                </p>
              </button>
            );
          })}
        </div>

        {/* Report Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl">
                  {reports.find(r => r.id === activeReport)?.title}
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  {reports.find(r => r.id === activeReport)?.description}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="border-slate-300"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button
                  onClick={handleExportPDF}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            {renderFilters() && (
              <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                {renderFilters()}
              </div>
            )}

            {/* Table */}
            {renderTable()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
