import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  User, 
  Activity, 
  Search, 
  X,
  Clock,
  AlertCircle,
  CheckCircle,
  UserCheck,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Separator } from './separator';

const SearchResults = ({ 
  searchQuery, 
  searchResults, 
  isSearching, 
  showResults, 
  onClose, 
  onItemClick 
}) => {
  const navigate = useNavigate();
  
  if (!showResults || !searchQuery.trim()) return null;

  const handleItemClick = (type, item) => {
    // Navigate to the appropriate page based on the item type
    switch (type) {
      case 'book':
        navigate('/books', { 
          state: { 
            highlightBook: item.id,
            searchQuery: searchQuery 
          } 
        });
        break;
      case 'user':
        navigate('/users', { 
          state: { 
            highlightUser: item.id_number,
            searchQuery: searchQuery 
          } 
        });
        break;
      case 'activity':
        // Navigate to borrowing management and highlight the transaction
        navigate('/borrowing', { 
          state: { 
            highlightTransaction: item.id,
            searchQuery: searchQuery 
          } 
        });
        break;
      default:
        console.log('Unknown item type:', type);
    }
    
    // Close search results and clear query
    onClose();
    onItemClick(type, item);
  };

  const { books, users, activities, total } = searchResults;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'borrowed': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'unverified': return 'bg-yellow-100 text-yellow-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (type, status) => {
    if (type === 'user') {
      return status === 'verified' ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />;
    }
    if (type === 'book') {
      return status === 'overdue' ? <AlertCircle className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />;
    }
    return <Activity className="h-3 w-3" />;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">
                Search results for "{searchQuery}"
              </span>
              {isSearching && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {total === 0 && !isSearching ? (
            <div className="text-center py-8 text-slate-500">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No results found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Books Results */}
              {books.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-semibold text-slate-700">Books ({books.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {books.map((book) => (
                      <motion.div
                        key={book.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 hover:bg-blue-50 rounded-lg cursor-pointer border border-slate-100 transition-colors group"
                        onClick={() => handleItemClick('book', book)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-slate-900">{book.title}</h4>
                              <ExternalLink className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-sm text-slate-600">by {book.author}</p>
                            <p className="text-xs text-slate-500">Code: {book.number_code}</p>
                            <p className="text-xs text-blue-600 mt-1">Click to view in Book Management</p>
                          </div>
                          <Badge className={`text-xs ${getStatusColor(book.status)}`}>
                            {getStatusIcon('book', book.status)}
                            <span className="ml-1">{book.statusText}</span>
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users Results */}
              {users.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-green-600" />
                    <h3 className="text-sm font-semibold text-slate-700">Users ({users.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {users.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 hover:bg-green-50 rounded-lg cursor-pointer border border-slate-100 transition-colors group"
                        onClick={() => handleItemClick('user', user)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-slate-900">{user.username}</h4>
                              <ExternalLink className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-sm text-slate-600">{user.email}</p>
                            <p className="text-xs text-slate-500">ID: {user.id_number}</p>
                            <p className="text-xs text-green-600 mt-1">Click to view in User Management</p>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <Badge className={`text-xs ${getStatusColor(user.is_verified ? 'verified' : 'unverified')}`}>
                              {getStatusIcon('user', user.is_verified ? 'verified' : 'unverified')}
                              <span className="ml-1">{user.statusText}</span>
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {user.roleText}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activities Results */}
              {activities.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="h-4 w-4 text-purple-600" />
                    <h3 className="text-sm font-semibold text-slate-700">Activities ({activities.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {activities.map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 hover:bg-purple-50 rounded-lg cursor-pointer border border-slate-100 transition-colors group"
                        onClick={() => handleItemClick('activity', activity)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-slate-900">{activity.book_title}</h4>
                              <ExternalLink className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-sm text-slate-600">by {activity.book_author}</p>
                            <p className="text-xs text-slate-500">
                              Student: {activity.student_name} ({activity.student_id_number})
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <span className="text-xs text-slate-500">
                                Borrowed: {formatDate(activity.borrowed_date)}
                              </span>
                            </div>
                            <p className="text-xs text-purple-600 mt-1">Click to view in Borrowing Management</p>
                          </div>
                          <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                            {getStatusIcon('activity', activity.status)}
                            <span className="ml-1">{activity.statusText}</span>
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchResults;
