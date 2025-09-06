import React, { useState, useEffect } from 'react';
import { 
  FiBook, 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiSearch, 
  FiFilter,
  FiRefreshCw,
  FiSave,
  FiX,
  FiEye,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import designSystem from '../styles/designSystem';
import './BookManagement.css';

const BookManagement = ({ user }) => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [genreFilter, setGenreFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [genres, setGenres] = useState([]);
    const [stats, setStats] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        publisher: '',
        publication_year: '',
        genre: '',
        description: '',
        status: 'available',
        location: ''
    });

    const API_BASE = 'http://localhost:5000/api';

    useEffect(() => {
        fetchBooks();
        fetchStats();
    }, [currentPage, searchTerm, statusFilter, genreFilter]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            let url = `${API_BASE}/books?page=${currentPage}&limit=10`;
            if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
            if (statusFilter) url += `&status=${statusFilter}`;
            if (genreFilter) url += `&genre=${encodeURIComponent(genreFilter)}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch books');

            const data = await response.json();
            setBooks(data.data.books);
            setTotalPages(data.data.pagination.totalPages);
            setGenres(data.data.filters.genres);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/books/stats/overview`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data.data);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const handleAddBook = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/books`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add book');
            }

            const data = await response.json();
            alert(`Book added successfully!\nBarcode: ${data.data.barcode}\nNumber Code: ${data.data.number_code}`);
            
            setShowAddForm(false);
            resetForm();
            fetchBooks();
            fetchStats();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEditBook = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/books/${selectedBook.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update book');
            }

            alert('Book updated successfully!');
            setShowEditForm(false);
            setSelectedBook(null);
            resetForm();
            fetchBooks();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteBook = async (bookId) => {
        if (!window.confirm('Are you sure you want to delete this book?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/books/${bookId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to delete book');

            alert('Book deleted successfully!');
            fetchBooks();
            fetchStats();
        } catch (err) {
            alert(err.message);
        }
    };

    const openEditForm = (book) => {
        setSelectedBook(book);
        setFormData({
            title: book.title,
            author: book.author,
            isbn: book.isbn || '',
            publisher: book.publisher || '',
            publication_year: book.publication_year || '',
            genre: book.genre || '',
            description: book.description || '',
            status: book.status,
            location: book.location || ''
        });
        setShowEditForm(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            author: '',
            isbn: '',
            publisher: '',
            publication_year: '',
            genre: '',
            description: '',
            status: 'available',
            location: ''
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'green';
            case 'borrowed': return 'orange';
            case 'lost': return 'red';
            case 'maintenance': return 'blue';
            default: return 'gray';
        }
    };

    if (loading && books.length === 0) {
        return <div className="loading">Loading books...</div>;
    }

    return (
        <div className="book-management">
            <div className="header">
                <h2>Book Management</h2>
                <button 
                    className="add-book-btn"
                    onClick={() => setShowAddForm(true)}
                >
                    <FiPlus />
                    Add New Book
                </button>
            </div>

            {/* Statistics */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Books</h3>
                        <p className="stat-number">{stats.totalBooks}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Available</h3>
                        <p className="stat-number">
                            {stats.statusStats.find(s => s.status === 'available')?.count || 0}
                        </p>
                    </div>
                    <div className="stat-card">
                        <h3>Borrowed</h3>
                        <p className="stat-number">
                            {stats.statusStats.find(s => s.status === 'borrowed')?.count || 0}
                        </p>
                    </div>
                    <div className="stat-card">
                        <h3>Added This Month</h3>
                        <p className="stat-number">{stats.monthlyAdded}</p>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="filters">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search books..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FiSearch className="search-icon" />
                </div>
                <div className="filter-controls">
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="available">Available</option>
                        <option value="borrowed">Borrowed</option>
                        <option value="lost">Lost</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                    <select 
                        value={genreFilter} 
                        onChange={(e) => setGenreFilter(e.target.value)}
                    >
                        <option value="">All Genres</option>
                        {genres.map(genre => (
                            <option key={genre} value={genre}>{genre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Books Table */}
            <div className="books-table-container">
                <table className="books-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Barcode</th>
                            <th>Number Code</th>
                            <th>Status</th>
                            <th>Genre</th>
                            <th>Added By</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.map(book => (
                            <tr key={book.id}>
                                <td>
                                    <div className="book-title">
                                        <strong>{book.title}</strong>
                                        {book.isbn && <small>ISBN: {book.isbn}</small>}
                                    </div>
                                </td>
                                <td>{book.author}</td>
                                <td>
                                    <code className="barcode">{book.barcode}</code>
                                </td>
                                <td>
                                    <code className="number-code">{book.number_code}</code>
                                </td>
                                <td>
                                    <span 
                                        className={`status-badge status-${getStatusColor(book.status)}`}
                                    >
                                        {book.status}
                                    </span>
                                </td>
                                <td>{book.genre || '-'}</td>
                                <td>{book.added_by_name || 'Unknown'}</td>
                                <td>
                                    <div className="actions">
                                        <button 
                                            className="edit-btn"
                                            onClick={() => openEditForm(book)}
                                        >
                                            <FiEdit />
                                            Edit
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDeleteBook(book.id)}
                                        >
                                            <FiTrash2 />
                                            Delete
                                        </button>
                                    </div>
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
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Add Book Modal */}
            {showAddForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Add New Book</h3>
                            <button onClick={() => setShowAddForm(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleAddBook}>
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Author *</label>
                                <input
                                    type="text"
                                    value={formData.author}
                                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>ISBN</label>
                                    <input
                                        type="text"
                                        value={formData.isbn}
                                        onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                                        placeholder="Leave empty for auto-generation"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Publication Year</label>
                                    <input
                                        type="number"
                                        value={formData.publication_year}
                                        onChange={(e) => setFormData({...formData, publication_year: e.target.value})}
                                        min="1800"
                                        max={new Date().getFullYear()}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Publisher</label>
                                    <input
                                        type="text"
                                        value={formData.publisher}
                                        onChange={(e) => setFormData({...formData, publisher: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Genre</label>
                                    <input
                                        type="text"
                                        value={formData.genre}
                                        onChange={(e) => setFormData({...formData, genre: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    >
                                        <option value="available">Available</option>
                                        <option value="borrowed">Borrowed</option>
                                        <option value="lost">Lost</option>
                                        <option value="maintenance">Maintenance</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        placeholder="e.g., Shelf A1, Row 3"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows="3"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowAddForm(false)}>
                                    <FiX />
                                    Cancel
                                </button>
                                <button type="submit" className="primary">
                                    <FiSave />
                                    Add Book
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Book Modal */}
            {showEditForm && selectedBook && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Edit Book</h3>
                            <button onClick={() => setShowEditForm(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleEditBook}>
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Author *</label>
                                <input
                                    type="text"
                                    value={formData.author}
                                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>ISBN</label>
                                    <input
                                        type="text"
                                        value={formData.isbn}
                                        onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Publication Year</label>
                                    <input
                                        type="number"
                                        value={formData.publication_year}
                                        onChange={(e) => setFormData({...formData, publication_year: e.target.value})}
                                        min="1800"
                                        max={new Date().getFullYear()}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Publisher</label>
                                    <input
                                        type="text"
                                        value={formData.publisher}
                                        onChange={(e) => setFormData({...formData, publisher: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Genre</label>
                                    <input
                                        type="text"
                                        value={formData.genre}
                                        onChange={(e) => setFormData({...formData, genre: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    >
                                        <option value="available">Available</option>
                                        <option value="borrowed">Borrowed</option>
                                        <option value="lost">Lost</option>
                                        <option value="maintenance">Maintenance</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        placeholder="e.g., Shelf A1, Row 3"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows="3"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowEditForm(false)}>
                                    <FiX />
                                    Cancel
                                </button>
                                <button type="submit" className="primary">
                                    <FiSave />
                                    Update Book
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookManagement;
