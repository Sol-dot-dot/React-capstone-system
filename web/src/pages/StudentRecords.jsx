import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Search,
  User,
  BookOpen,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  FileText,
  Calendar,
  Download,
  Printer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const StudentRecords = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentRecord, setStudentRecord] = useState(null);
  const [activeYear, setActiveYear] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search students
  const handleSearch = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/student-records/search', {
        params: { q: query },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSearchResults(response.data.data);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search students');
    } finally {
      setLoading(false);
    }
  };

  // Load student record
  const loadStudentRecord = async (studentId) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/student-records/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStudentRecord(response.data.data);
        if (response.data.data.academicYears.length > 0) {
          setActiveYear(response.data.data.academicYears[0].academicYearId);
        }
      }
    } catch (error) {
      console.error('Load record error:', error);
      setError('Failed to load student record');
    } finally {
      setLoading(false);
    }
  };

  // Handle student selection
  const selectStudent = (student) => {
    setSelectedStudent(student);
    setSearchResults([]);
    setSearchQuery(`${student.first_name} ${student.last_name}`);
    loadStudentRecord(student.id);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedStudent(null);
    setStudentRecord(null);
    setSearchQuery('');
    setSearchResults([]);
    setActiveYear(null);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'good_standing':
        return 'bg-green-100 text-green-700';
      case 'has_pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'blocked':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'good_standing':
        return 'Good Standing';
      case 'has_pending':
        return 'Has Pending';
      case 'blocked':
        return 'Blocked';
      default:
        return 'Unknown';
    }
  };

  // Print clearance
  const handlePrintClearance = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Student Library Records
          </h1>
          <p className="text-gray-600">
            Complete academic library history for students
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Student ID, Name, or Course..."
                value={searchQuery}
                onChange={(e) => {
                  const newQuery = e.target.value;
                  setSearchQuery(newQuery);
                  // Clear selected student when user starts typing a new search
                  if (selectedStudent) {
                    setSelectedStudent(null);
                    setStudentRecord(null);
                    setActiveYear(null);
                  }
                  handleSearch(newQuery);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {selectedStudent && (
                <button
                  onClick={clearSelection}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && !selectedStudent && (
              <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {searchResults.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => selectStudent(student)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">
                      {student.first_name} {student.last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {student.id_number} | {student.course} - Year {student.year_level}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && !studentRecord && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading student record...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Student Record */}
        {studentRecord && selectedStudent && (
          <div className="space-y-6">
            {/* Student Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {studentRecord.student.first_name} {studentRecord.student.last_name}
                      </h2>
                      <p className="text-gray-600">
                        ID: {studentRecord.student.id_number} | {studentRecord.student.course} - Year {studentRecord.student.year_level}
                      </p>
                      <p className="text-sm text-gray-500">{studentRecord.student.email}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(studentRecord.summary.accountStatus)}>
                    {getStatusLabel(studentRecord.summary.accountStatus)}
                  </Badge>
                </div>

                {/* Summary Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {studentRecord.summary.total_borrowed || 0}
                    </div>
                    <div className="text-xs text-gray-600">Total Borrowed</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {studentRecord.summary.total_returned || 0}
                    </div>
                    <div className="text-xs text-gray-600">Returned</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {studentRecord.summary.currently_borrowed || 0}
                    </div>
                    <div className="text-xs text-gray-600">Currently Borrowed</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      ₱{parseFloat(studentRecord.summary.total_fines_incurred || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600">Fines Incurred</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      ₱{parseFloat(studentRecord.summary.total_fines_paid || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600">Fines Paid</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      ₱{parseFloat(studentRecord.summary.outstanding_balance || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600">Balance</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Years */}
            {studentRecord.academicYears.length > 0 ? (
              <div className="space-y-4">
                {studentRecord.academicYears.map((year) => (
                  <Card key={year.academicYearId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5" />
                          <span>
                            {year.yearLevel ? `${getYearLevelLabel(year.yearLevel)} - ` : ''}
                            {year.academicYear}
                            {year.isCurrent && <Badge className="ml-2 bg-blue-500">Current</Badge>}
                          </span>
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {year.semesters.map((semester) => (
                          <div
                            key={semester.semesterId}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-900">
                                {semester.semesterName}
                                {semester.isCurrent && <span className="ml-2 text-xs text-blue-600">● Ongoing</span>}
                              </h4>
                              {semester.isCleared ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                              )}
                            </div>

                            <p className="text-sm text-gray-600 mb-3">{semester.period}</p>

                            <div className="space-y-2 mb-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Books Borrowed:</span>
                                <span className="font-medium">
                                  {semester.booksBorrowed}/{semester.booksRequired}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${Math.min((semester.booksBorrowed / semester.booksRequired) * 100, 100)}%`
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                              <div>
                                <span className="text-gray-600">On-Time:</span>{' '}
                                <span className="text-green-600 font-medium">{semester.onTimeReturns}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Late:</span>{' '}
                                <span className="text-red-600 font-medium">{semester.lateReturns}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Fines:</span>{' '}
                                <span className="font-medium">₱{semester.finesIncurred.toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Paid:</span>{' '}
                                <span className="font-medium">₱{semester.finesPaid.toFixed(2)}</span>
                              </div>
                            </div>

                            {/* Borrowings Table */}
                            {semester.borrowings.length > 0 && (
                              <details className="mt-3">
                                <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium">
                                  View {semester.borrowings.length} Transaction(s)
                                </summary>
                                <div className="mt-3 overflow-x-auto">
                                  <table className="min-w-full text-xs">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-2 py-1 text-left">Book</th>
                                        <th className="px-2 py-1 text-left">Borrowed</th>
                                        <th className="px-2 py-1 text-left">Due</th>
                                        <th className="px-2 py-1 text-left">Status</th>
                                        <th className="px-2 py-1 text-right">Fine</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {semester.borrowings.map((b, idx) => (
                                        <tr key={idx}>
                                          <td className="px-2 py-1">{b.bookTitle}</td>
                                          <td className="px-2 py-1">{new Date(b.borrowDate).toLocaleDateString()}</td>
                                          <td className="px-2 py-1">{new Date(b.dueDate).toLocaleDateString()}</td>
                                          <td className="px-2 py-1">
                                            <span
                                              className={`px-1 py-0.5 rounded text-xs ${
                                                b.status === 'returned_on_time'
                                                  ? 'bg-green-100 text-green-700'
                                                  : b.status === 'returned_late'
                                                  ? 'bg-orange-100 text-orange-700'
                                                  : b.status === 'overdue'
                                                  ? 'bg-red-100 text-red-700'
                                                  : 'bg-blue-100 text-blue-700'
                                              }`}
                                            >
                                              {b.status.replace('_', ' ')}
                                            </span>
                                          </td>
                                          <td className="px-2 py-1 text-right">₱{b.fine.toFixed(2)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </details>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No academic records found for this student</p>
                </CardContent>
              </Card>
            )}

            {/* Clearance Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Clearance Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    {studentRecord.clearance.isCleared ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    )}
                    <span className="text-lg font-semibold">
                      Library Clearance:{' '}
                      <span className={studentRecord.clearance.isCleared ? 'text-green-600' : 'text-yellow-600'}>
                        {studentRecord.clearance.isCleared ? 'CLEARED' : 'NOT CLEARED'}
                      </span>
                    </span>
                  </div>
                </div>

                {studentRecord.clearance.pendingRequirements.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                    <ul className="space-y-1">
                      {studentRecord.clearance.pendingRequirements.map((req, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                          <span className="text-red-500">⚠</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {studentRecord.clearance.isCleared && (
                  <div className="flex space-x-3">
                    <Button onClick={handlePrintClearance} className="flex items-center space-x-2">
                      <Printer className="h-4 w-4" />
                      <span>Print Clearance</span>
                    </Button>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Export PDF</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!selectedStudent && !loading && !error && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">Search for a student to view their library records</p>
            <p className="text-gray-500 text-sm">Enter a student ID, name, or course to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get year level label
const getYearLevelLabel = (level) => {
  switch (level) {
    case 1:
      return '1st Year';
    case 2:
      return '2nd Year';
    case 3:
      return '3rd Year';
    case 4:
      return '4th Year';
    default:
      return `Year ${level}`;
  }
};

export default StudentRecords;
