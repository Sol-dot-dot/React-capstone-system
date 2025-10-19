import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  Settings, 
  Users, 
  Search, 
  ChevronDown, 
  ChevronUp,
  Check,
  Book,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Calculator,
  CreditCard,
  User,
  Mail,
  Calendar,
  Eye,
  EyeOff,
  Filter,
  Printer
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import axios from 'axios';

// Debounce utility function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

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
  const [showPaidBooks, setShowPaidBooks] = useState(false);

  // Barcode scanner state
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Auto-focus the search input field when on fines tab
  useEffect(() => {
    if (activeTab === 'fines') {
      const field = document.getElementById('barcode-field-penalty-search');
      if (field) {
        field.focus();
        field.select();
      }
    }
  }, [activeTab]);

  // Handle barcode scanner input
  useEffect(() => {
    let scanTimeout;
    
    const handleKeyDown = (event) => {
      // Check if it's a barcode scanner input (usually ends with Enter)
      if (event.key === 'Enter' && isScanning && event.target.id === 'barcode-field-penalty-search') {
        event.preventDefault();
        handleBarcodeInput();
        return;
      }
      
      // Start scanning when user starts typing in barcode field
      if (event.target.id === 'barcode-field-penalty-search') {
        setIsScanning(true);
        clearTimeout(scanTimeout);
      }
    };

    const handleKeyUp = (event) => {
      // Reset scanning state after a delay
      if (event.target.id === 'barcode-field-penalty-search') {
        clearTimeout(scanTimeout);
        scanTimeout = setTimeout(() => setIsScanning(false), 500);
      }
    };

    // Handle rapid input (typical of barcode scanners)
    const handleInput = (event) => {
      if (event.target.id === 'barcode-field-penalty-search') {
        setIsScanning(true);
        clearTimeout(scanTimeout);
        scanTimeout = setTimeout(() => {
          setIsScanning(false);
          // Trigger live search when scanning stops
          const scannedValue = event.target.value.trim();
          if (scannedValue && scannedValue.length > 3) {
            setSearchTerm(scannedValue);
            clearTimeout(window.searchTimeout);
            window.searchTimeout = setTimeout(() => {
              loadStudentsWithFines();
            }, 100);
          }
        }, 300); // Shorter timeout for immediate processing
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('input', handleInput);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('input', handleInput);
      clearTimeout(scanTimeout);
    };
  }, [isScanning]);

  const handleBarcodeInput = () => {
    const field = document.getElementById('barcode-field-penalty-search');
    if (!field) return;

    const scannedValue = field.value.trim();
    if (scannedValue) {
      setSearchTerm(scannedValue);
      // Trigger debounced search for live search
      debouncedLoadStudentsWithFines(scannedValue);
    } else {
      // Clear students when search is empty
      setStudents([]);
    }
  };

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
        // Don't automatically load all students - only show when searched
        setStudents([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create debounced search function
  const debouncedLoadStudentsWithFines = useCallback(
    debounce(async (searchTerm) => {
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
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error('Error loading students with fines:', error);
        setStudents([]); // Clear students on error
      }
    }, 500),
    []
  );

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


  const printInvoice = (student) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    // Get current date
    const currentDate = new Date();
    const invoiceDate = currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    // Calculate due date (30 days from now)
    const dueDate = new Date(currentDate.getTime() + (30 * 24 * 60 * 60 * 1000));
    const dueDateFormatted = dueDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    // Generate invoice number
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    
    // Create the invoice HTML
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Penalty Invoice - ${student.id_number}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
          }
          .invoice-title {
            font-size: 48px;
            font-weight: bold;
            color: #374151;
            margin: 0;
          }
          .invoice-details {
            text-align: right;
            color: #000000;
          }
          .invoice-details p {
            margin: 5px 0;
            font-size: 14px;
          }
          .details-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .issued-to, .pay-to {
            flex: 1;
            margin-right: 20px;
          }
          .section-title {
            font-weight: bold;
            color: #000000;
            margin-bottom: 10px;
            font-size: 16px;
          }
          .section-content {
            color: #000000;
            line-height: 1.5;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .items-table th {
            background-color: #f9fafb;
            padding: 15px 10px;
            text-align: left;
            font-weight: bold;
            color: #000000;
            border-bottom: 2px solid #e5e7eb;
          }
          .items-table td {
            padding: 15px 10px;
            border-bottom: 1px solid #e5e7eb;
            color: #000000;
            vertical-align: top;
          }
          .items-table td:first-child {
            width: 60%;
            max-width: 400px;
          }
          .items-table td:not(:first-child) {
            width: 13%;
            text-align: right;
          }
          .items-table tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .summary {
            text-align: right;
            margin-top: 20px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
          }
          .summary-label {
            font-weight: bold;
            color: #000000;
          }
          .summary-value {
            color: #000000;
            min-width: 100px;
            text-align: right;
          }
          .total-row {
            border-top: 2px solid #e5e7eb;
            padding-top: 10px;
            margin-top: 10px;
            font-size: 18px;
            font-weight: bold;
            color: #000000;
          }
          .signature {
            text-align: center;
            margin-top: 50px;
            color: #000000;
            font-style: italic;
          }
          @media print {
            body { margin: 0; }
            .invoice-container { max-width: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div>
              <h1 class="invoice-title">INVOICE</h1>
            </div>
            <div class="invoice-details">
              <p><strong>ISSUE DATE:</strong> ${invoiceDate}</p>
              <p><strong>INVOICE NO:</strong> ${invoiceNumber}</p>
              <p><strong>DUE DATE:</strong> ${dueDateFormatted}</p>
            </div>
          </div>
          
          <div class="details-section">
            <div class="issued-to">
              <div class="section-title">ISSUED TO:</div>
              <div class="section-content">
                ${student.first_name} ${student.last_name}<br>
                Student ID: ${student.id_number}<br>
                ${student.email}
              </div>
            </div>
            <div class="pay-to">
              <div class="section-title">PAY TO:</div>
              <div class="section-content">
                SMC finance
              </div>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>DESCRIPTION</th>
                <th>UNIT PRICE</th>
                <th>QTY</th>
                <th>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${student.book_history && student.book_history.length > 0 ? 
                student.book_history
                  .filter(book => book.current_status === 'Overdue' && book.fine_status === 'unpaid')
                  .map(book => `
                    <tr>
                      <td>
                        <div style="font-weight: bold; color: #000000;">${book.title}</div>
                        <div style="font-size: 12px; color: #000000; margin-top: 2px;">by ${book.author}</div>
                        <div style="font-size: 11px; color: #000000; margin-top: 2px;">Code: ${book.number_code || 'N/A'} | Category: ${book.category || 'N/A'}</div>
                        <div style="font-size: 11px; color: #000000;">Borrowed: ${book.borrowed_date} | Due: ${book.due_date}</div>
                        <div style="font-size: 11px; color: #000000; font-weight: bold;">Status: ${book.days_past_due || 0} days overdue</div>
                      </td>
                      <td style="text-align: right; font-weight: bold; color: #000000;">₱${(book.fine_amount || 0) - (book.paid_amount || 0)}</td>
                      <td style="text-align: center;">1</td>
                      <td style="text-align: right; font-weight: bold; color: #000000;">₱${(book.fine_amount || 0) - (book.paid_amount || 0)}</td>
                    </tr>
                  `).join('') : 
                (student.unpaid_amount > 0 ? 
                  `<tr>
                    <td style="font-style: italic; color: #000000;">Library Penalty Fees (General)</td>
                    <td style="text-align: right; font-weight: bold; color: #000000;">₱${student.unpaid_amount}</td>
                    <td style="text-align: center;">1</td>
                    <td style="text-align: right; font-weight: bold; color: #000000;">₱${student.unpaid_amount}</td>
                  </tr>` :
                  `<tr>
                    <td style="font-style: italic; color: #000000;">No overdue books found</td>
                    <td style="text-align: right;">₱0.00</td>
                    <td style="text-align: center;">0</td>
                    <td style="text-align: right;">₱0.00</td>
                  </tr>`
                )
              }
            </tbody>
          </table>
          
          <div class="summary">
            <div class="summary-row">
              <span class="summary-label">SUBTOTAL:</span>
              <span class="summary-value">₱${student.unpaid_amount || 0}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Tax:</span>
              <span class="summary-value">0%</span>
            </div>
            <div class="summary-row total-row">
              <span class="summary-label">TOTAL:</span>
              <span class="summary-value">₱${student.unpaid_amount || 0}</span>
            </div>
          </div>
          
          <div class="signature">
            Library Administrator
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Write the HTML to the new window
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    
    // Wait for the content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  const resetSemester = async () => {
    if (!window.confirm('Are you sure you want to reset the semester? This will reset ALL student borrowing counts to 0 and set new semester dates. This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/penalty/reset-semester', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const data = response.data.data;
        setMessage(`Semester reset successfully! Reset ${data.studentsReset} students, created ${data.studentsCreated} new records. New semester: ${data.semesterStartDate} to ${data.semesterEndDate}`);
        await loadData(); // Reload all data
      }
    } catch (error) {
      console.error('Error resetting semester:', error);
      setMessage('Error resetting semester');
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
                
                {/* Barcode Scanner Status */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></div>
                      <span className="text-sm font-medium text-blue-700">
                        {isScanning ? 'Scanner Active' : 'Ready for Barcode Scan'}
                      </span>
                    </div>
                    <div className="text-xs text-blue-600">
                      <span>Current Field: Student Search</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-blue-600">
                    <p>💡 <strong>Barcode Scanner Tips:</strong></p>
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                      <li>Scan student ID barcode directly into the highlighted field</li>
                      <li>Press <kbd className="px-1 py-0.5 bg-white border rounded text-xs">Enter</kbd> to search automatically</li>
                      <li>Student fines will load automatically after scanning</li>
                    </ul>
                  </div>
                </div>
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
                        id="barcode-field-penalty-search"
                        placeholder="Search by Student ID, Email, or Book Title..."
                        value={searchTerm}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSearchTerm(value);
                          // Trigger live search for any input
                          if (value.trim().length > 0) {
                            debouncedLoadStudentsWithFines(value);
                          } else {
                            // Clear students when search is empty
                            setStudents([]);
                          }
                        }}
                        className={`pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 ${
                          isScanning ? 'ring-2 ring-blue-400 bg-blue-50' : ''
                        }`}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={loadStudentsWithFines}
                      disabled={loading}
                      variant="outline"
                      className="border-slate-300 hover:bg-slate-50"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Load All Students
                    </Button>
                  </div>
                </div>

                {/* Students with Fines */}
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="h-8 w-8 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
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
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                                onClick={() => printInvoice(student)}
                                title="Print penalty invoice"
                              >
                                <Printer className="h-4 w-4 mr-1" />
                                Print Invoice
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

                              {/* Book History Section */}
                              {student.book_history && student.book_history.length > 0 && (
                                <div className="mt-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium text-slate-900 flex items-center gap-2">
                                      <Book className="h-4 w-4" />
                                      Book History ({student.book_history.length})
                                    </h4>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setShowPaidBooks(!showPaidBooks)}
                                      className="flex items-center gap-2 text-xs"
                                    >
                                      {showPaidBooks ? (
                                        <>
                                          <EyeOff className="h-3 w-3" />
                                          Hide Paid
                                        </>
                                      ) : (
                                        <>
                                          <Eye className="h-3 w-3" />
                                          Show Paid
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                  <div className="space-y-3">
                                    {student.book_history
                                      .filter(book => {
                                        // Always show overdue books, conditionally show paid books
                                        if (book.current_status === 'Overdue') return true;
                                        if (book.current_status === 'Paid') return showPaidBooks;
                                        return true; // Show other statuses (like 'Returned')
                                      })
                                      .map((book, bookIndex) => (
                                      <motion.div
                                        key={book.transaction_id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: bookIndex * 0.1 }}
                                        className={`border rounded-lg p-3 hover:shadow-md transition-all duration-200 ${
                                          book.current_status === 'Overdue' 
                                            ? 'bg-red-50 border-red-200' 
                                            : book.current_status === 'Paid'
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-slate-50 border-slate-200'
                                        }`}
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg ${
                                              book.current_status === 'Overdue' ? 'bg-red-100' :
                                              book.current_status === 'Paid' ? 'bg-green-100' : 'bg-slate-100'
                                            }`}>
                                              <Book className={`h-4 w-4 ${
                                                book.current_status === 'Overdue' ? 'text-red-600' :
                                                book.current_status === 'Paid' ? 'text-green-600' : 'text-slate-600'
                                              }`} />
                                            </div>
                                            <div className="flex-1">
                                              <h5 className="font-medium text-slate-900">{book.title}</h5>
                                              <p className="text-sm text-slate-600">by {book.author}</p>
                                              <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                                                <span><strong>Code:</strong> {book.number_code}</span>
                                                <span><strong>Category:</strong> {book.category}</span>
                                                <span><strong>Borrowed:</strong> {new Date(book.borrowed_date).toLocaleDateString()}</span>
                                                <span><strong>Due:</strong> {new Date(book.due_date).toLocaleDateString()}</span>
                                                {book.returned_date && (
                                                  <span><strong>Returned:</strong> {new Date(book.returned_date).toLocaleDateString()}</span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <Badge 
                                              variant={book.current_status === 'Overdue' ? 'destructive' : 'default'}
                                              className={`mb-1 ${
                                                book.current_status === 'Overdue' 
                                                  ? 'bg-red-100 text-red-700' 
                                                  : book.current_status === 'Paid'
                                                  ? 'bg-green-100 text-green-700'
                                                  : 'bg-slate-100 text-slate-700'
                                              }`}
                                            >
                                              {book.current_status === 'Overdue' && (
                                                <>
                                                  <AlertCircle className="h-3 w-3 mr-1" />
                                                  {book.days_past_due} days overdue
                                                </>
                                              )}
                                              {book.current_status === 'Paid' && (
                                                <>
                                                  <Check className="h-3 w-3 mr-1" />
                                                  Paid
                                                </>
                                              )}
                                              {book.current_status === 'Returned' && (
                                                <>
                                                  <Check className="h-3 w-3 mr-1" />
                                                  Returned
                                                </>
                                              )}
                                            </Badge>
                                            <div className="text-sm">
                                              <p><strong>Fine:</strong> ₱{book.fine_amount || 0}</p>
                                              <p><strong>Paid:</strong> ₱{book.paid_amount || 0}</p>
                                              {book.current_status === 'Overdue' && (
                                                <p><strong>Remaining:</strong> ₱{(book.fine_amount || 0) - (book.paid_amount || 0)}</p>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Payment History for paid books */}
                                        {book.payment_history && book.payment_history.length > 0 && (
                                          <div className="mt-3 pt-3 border-t border-green-200">
                                            <h6 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                                              <Check className="h-3 w-3" />
                                              Payment History ({book.payment_history.length} payment{book.payment_history.length !== 1 ? 's' : ''})
                                            </h6>
                                            <div className="space-y-2">
                                              {book.payment_history.map((payment, paymentIndex) => (
                                                <div key={paymentIndex} className="bg-green-50 border border-green-200 rounded-lg p-2">
                                                  <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                      <div className="flex items-center gap-2 text-xs text-green-700">
                                                        <span><strong>Amount:</strong> ₱{payment.payment_amount}</span>
                                                        <span><strong>Method:</strong> {payment.payment_method}</span>
                                                        <span><strong>Date:</strong> {new Date(payment.payment_date).toLocaleDateString()}</span>
                                                      </div>
                                                      {payment.notes && (
                                                        <p className="text-xs text-green-600 mt-1">{payment.notes}</p>
                                                      )}
                                                      {payment.processed_by_admin && (
                                                        <p className="text-xs text-green-500 mt-1">Processed by: {payment.processed_by_admin}</p>
                                                      )}
                                                    </div>
                                                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                                      Paid
                                                    </Badge>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </motion.div>
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
                      <h3 className="text-lg font-medium text-slate-900 mb-2">
                        {searchTerm ? 'No students found' : 'Search for a Student'}
                      </h3>
                      <p className="text-slate-600">
                        {searchTerm 
                          ? `No students found matching "${searchTerm}". Try a different search term or click "Load All Students" to see all students with fines.`
                          : 'Enter a student ID, email, or book title to search for students with fines, or click "Load All Students" to view all students.'
                        }
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

                  {/* Semester Management Section */}
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Semester Management
                    </h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-800 mb-1">Reset Semester</h4>
                          <p className="text-sm text-yellow-700">
                            This will reset ALL student borrowing counts to 0 and set new semester dates based on current date and duration settings. 
                            This action cannot be undone and will affect all students.
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={resetSemester}
                      disabled={loading}
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
                    >
                      <div className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}>
                        {loading ? (
                          <div className="h-4 w-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                        ) : (
                          <div className="h-4 w-4 border-2 border-red-600 rounded"></div>
                        )}
                      </div>
                      {loading ? 'Resetting...' : 'Reset Semester'}
                    </Button>
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
                      <div className="h-4 w-4 mr-2 border-2 border-slate-600 rounded"></div>
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
