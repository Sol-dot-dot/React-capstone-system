import React, { useState } from 'react';
import axios from 'axios';
import { Search, User, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const StudentRecords = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentRecord, setStudentRecord] = useState(null);
  const [expandedYear, setExpandedYear] = useState(null);
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
  const loadStudentRecord = async (studentId, studentIdNumber) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/student-records/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const returnedStudent = response.data.data.student;
        if (returnedStudent.id_number === studentIdNumber) {
          setStudentRecord(response.data.data);
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
    loadStudentRecord(student.id_number, student.id_number);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedStudent(null);
    setStudentRecord(null);
    setSearchQuery('');
    setSearchResults([]);
    setExpandedYear(null);
  };

  // Toggle year expansion
  const toggleYear = (academicYear) => {
    setExpandedYear(expandedYear === academicYear ? null : academicYear);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Student Library Records</h1>
          <p className="text-sm text-gray-500">Borrowing history by school year</p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Student ID or Name..."
                value={searchQuery}
                onChange={(e) => {
                  const newQuery = e.target.value;
                  setSearchQuery(newQuery);
                  if (selectedStudent) {
                    setSelectedStudent(null);
                    setStudentRecord(null);
                  }
                  handleSearch(newQuery);
                }}
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {selectedStudent && (
                <button
                  onClick={clearSelection}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  ✕
                </button>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && !selectedStudent && (
                <div className="mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto absolute left-0 right-0 top-full z-20">
                  {searchResults.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => selectStudent(student)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b last:border-b-0 text-sm flex justify-between"
                    >
                      <span>{student.first_name} {student.last_name}</span>
                      <span className="text-blue-600 font-mono">{student.id_number}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {loading && !studentRecord && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Student Record */}
        {studentRecord && selectedStudent && studentRecord.student.id_number === selectedStudent.id_number && (
          <div className="space-y-4">
            {/* Student Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {studentRecord.student.first_name} {studentRecord.student.last_name}
                      </h2>
                      <p className="text-sm text-gray-500">{studentRecord.student.id_number}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div>Total Borrowed: <span className="font-semibold">{studentRecord.summary.total_borrowed}</span></div>
                    <div>Outstanding: <span className="font-semibold text-red-600">₱{studentRecord.summary.outstanding_balance.toFixed(2)}</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Records Table */}
            {studentRecord.academicYears.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-100 border-b text-xs font-semibold text-gray-600 uppercase">
                    <div className="col-span-3">School Year</div>
                    <div className="col-span-2 text-center">1st Sem</div>
                    <div className="col-span-2 text-center">2nd Sem</div>
                    <div className="col-span-2 text-center">Total</div>
                    <div className="col-span-3 text-right">Fines</div>
                  </div>

                  {/* Table Body */}
                  {studentRecord.academicYears.map((year) => {
                    const sem1Books = year.firstSemester?.booksBorrowed || 0;
                    const sem2Books = year.secondSemester?.booksBorrowed || 0;
                    const totalBooks = sem1Books + sem2Books;
                    const totalFines = (year.firstSemester?.fines || 0) + (year.secondSemester?.fines || 0);
                    const totalPaid = (year.firstSemester?.finesPaid || 0) + (year.secondSemester?.finesPaid || 0);
                    const isExpanded = expandedYear === year.academicYear;

                    return (
                      <div key={year.academicYear} className="border-b last:border-b-0">
                        {/* Row */}
                        <button
                          onClick={() => toggleYear(year.academicYear)}
                          className="w-full grid grid-cols-12 gap-2 px-4 py-3 hover:bg-gray-50 text-sm items-center"
                        >
                          <div className="col-span-3 flex items-center space-x-2">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="font-medium">{year.academicYear}</span>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className={sem1Books >= 20 ? 'text-green-600 font-medium' : ''}>
                              {sem1Books}
                            </span>
                            <span className="text-gray-400">/20</span>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className={sem2Books >= 20 ? 'text-green-600 font-medium' : ''}>
                              {sem2Books}
                            </span>
                            <span className="text-gray-400">/20</span>
                          </div>
                          <div className="col-span-2 text-center font-medium">
                            {totalBooks}
                          </div>
                          <div className="col-span-3 text-right">
                            {totalFines > 0 ? (
                              <span className={totalFines === totalPaid ? 'text-green-600' : 'text-red-600'}>
                                ₱{totalFines.toFixed(2)}
                                {totalFines === totalPaid && ' (Paid)'}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </button>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="bg-gray-50 px-4 py-3 border-t">
                            <div className="grid grid-cols-2 gap-4">
                              {/* 1st Semester */}
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 mb-2">1ST SEMESTER</h4>
                                {year.firstSemester?.borrowings?.length > 0 ? (
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="text-gray-500">
                                        <th className="text-left py-1">Book</th>
                                        <th className="text-left py-1">Date</th>
                                        <th className="text-right py-1">Fine</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {year.firstSemester.borrowings.map((b, idx) => (
                                        <tr key={idx} className="border-t border-gray-200">
                                          <td className="py-1 truncate max-w-[150px]" title={b.bookTitle}>
                                            {b.bookTitle}
                                          </td>
                                          <td className="py-1 text-gray-500">
                                            {new Date(b.borrowDate).toLocaleDateString()}
                                          </td>
                                          <td className="py-1 text-right">
                                            {b.fine > 0 ? `₱${b.fine.toFixed(2)}` : '-'}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <p className="text-xs text-gray-400 italic">No records</p>
                                )}
                              </div>

                              {/* 2nd Semester */}
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 mb-2">2ND SEMESTER</h4>
                                {year.secondSemester?.borrowings?.length > 0 ? (
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="text-gray-500">
                                        <th className="text-left py-1">Book</th>
                                        <th className="text-left py-1">Date</th>
                                        <th className="text-right py-1">Fine</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {year.secondSemester.borrowings.map((b, idx) => (
                                        <tr key={idx} className="border-t border-gray-200">
                                          <td className="py-1 truncate max-w-[150px]" title={b.bookTitle}>
                                            {b.bookTitle}
                                          </td>
                                          <td className="py-1 text-gray-500">
                                            {new Date(b.borrowDate).toLocaleDateString()}
                                          </td>
                                          <td className="py-1 text-right">
                                            {b.fine > 0 ? `₱${b.fine.toFixed(2)}` : '-'}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <p className="text-xs text-gray-400 italic">No records</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No borrowing records found</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty State */}
        {!selectedStudent && !loading && !error && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Search for a student to view their records</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRecords;
