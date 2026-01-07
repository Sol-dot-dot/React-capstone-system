const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const { logger } = require('../config/logger');
const {
    generateBarcode,
    generateNumberCode,
    generateISBN,
    validateBookData,
    formatBookData
} = require('../utils/bookUtils');

// Get all books with pagination and search
router.get('/', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const status = req.query.status || '';
        const category = req.query.category || '';

        const offset = (page - 1) * limit;

        let whereClause = 'WHERE 1=1';
        let params = [];

        if (search) {
            whereClause += ' AND (title LIKE ? OR author LIKE ? OR isbn LIKE ? OR number_code LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam, searchParam);
        }

        if (status) {
            whereClause += ' AND status = ?';
            params.push(status);
        }

        if (category) {
            whereClause += ' AND category = ?';
            params.push(category);
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM books ${whereClause}`;
        const [countResult] = await db.execute(countQuery, params);
        const totalBooks = countResult[0].total;

        // Get books with pagination
        const query = `
            SELECT b.*, 'System' as added_by
            FROM books b
            ${whereClause}
            ORDER BY b.created_at DESC
            LIMIT ? OFFSET ?
        `;

        params.push(limit, offset);
        const [books] = await db.execute(query, params);

        // Get unique categorys for filter
        const [categorys] = await db.execute('SELECT DISTINCT category FROM books WHERE category IS NOT NULL AND category != ""');

        res.json({
            success: true,
            data: {
                books: books.map(book => formatBookData(book)),
                pagination: {
                    page,
                    limit,
                    total: totalBooks,
                    totalPages: Math.ceil(totalBooks / limit)
                },
                filters: {
                    categorys: categorys.map(g => g.category)
                }
            }
        });
    } catch (error) {
        logger.error('Error fetching books:', error);
        res.status(500).json({ success: false, message: 'Error fetching books' });
    }
});

// Get book by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT b.*, 'System' as added_by
            FROM books b
            WHERE b.id = ?
        `;

        const [books] = await db.execute(query, [id]);

        if (books.length === 0) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        res.json({
            success: true,
            data: formatBookData(books[0])
        });
    } catch (error) {
        logger.error('Error fetching book:', error);
        res.status(500).json({ success: false, message: 'Error fetching book' });
    }
});

// Add new book
router.post('/', auth, async (req, res) => {
    try {
        const bookData = req.body;

        // Validate book data
        const validationErrors = validateBookData(bookData);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        // Generate unique number code
        let numberCode;
        let attempts = 0;
        const maxAttempts = 10;

        do {
            numberCode = generateNumberCode();
            attempts++;

            // Check if number code already exists
            const [existing] = await db.execute(
                'SELECT id FROM books WHERE number_code = ?',
                [numberCode]
            );

            if (existing.length === 0) break;
        } while (attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            return res.status(500).json({
                success: false,
                message: 'Unable to generate unique codes. Please try again.'
            });
        }

        // Generate ISBN if not provided
        if (!bookData.isbn) {
            bookData.isbn = generateISBN();
        }

        // Insert book into database
        const query = `
            INSERT INTO books (
                title, author, isbn, publisher, publication_year,
                category, description, number_code,
                status, pages, book_copies
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            bookData.title.trim(),
            bookData.author.trim(),
            bookData.isbn,
            bookData.publisher || null,
            bookData.publication_year || null,
            bookData.category || null,
            bookData.description || null,
            numberCode,
            bookData.status || 'available',
            bookData.pages || null,
            bookData.book_copies || 1
        ];

        const [result] = await db.execute(query, values);

        // Get the created book
        const [newBook] = await db.execute(
            'SELECT * FROM books WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Book added successfully',
            data: formatBookData(newBook[0])
        });
    } catch (error) {
        logger.error('Error adding book:', error);
        res.status(500).json({ success: false, message: 'Error adding book' });
    }
});

// Update book
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const bookData = req.body;

        // Check if book exists
        const [existingBook] = await db.execute('SELECT * FROM books WHERE id = ?', [id]);
        if (existingBook.length === 0) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        // Validate book data
        const validationErrors = validateBookData(bookData);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        // Update book
        const query = `
            UPDATE books SET
                title = ?, author = ?, isbn = ?, publisher = ?,
                publication_year = ?, category = ?, description = ?,
                status = ?, pages = ?, book_copies = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        const values = [
            bookData.title.trim(),
            bookData.author.trim(),
            bookData.isbn || null,
            bookData.publisher || null,
            bookData.publication_year || null,
            bookData.category || null,
            bookData.description || null,
            bookData.status || existingBook[0].status,
            bookData.pages || null,
            bookData.book_copies || existingBook[0].book_copies || 1,
            id
        ];

        await db.execute(query, values);

        // Get updated book
        const [updatedBook] = await db.execute('SELECT * FROM books WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Book updated successfully',
            data: formatBookData(updatedBook[0])
        });
    } catch (error) {
        logger.error('Error updating book:', error);
        res.status(500).json({ success: false, message: 'Error updating book' });
    }
});

// Delete book
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if book exists
        const [existingBook] = await db.execute('SELECT * FROM books WHERE id = ?', [id]);
        if (existingBook.length === 0) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        // Delete book
        await db.execute('DELETE FROM books WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Book deleted successfully'
        });
    } catch (error) {
        logger.error('Error deleting book:', error);
        res.status(500).json({ success: false, message: 'Error deleting book' });
    }
});

// Get book statistics
router.get('/stats/overview', auth, async (req, res) => {
    try {
        // Total books
        const [totalBooks] = await db.execute('SELECT COUNT(*) as total FROM books');

        // Books by status
        const [statusStats] = await db.execute(`
            SELECT status, COUNT(*) as count
            FROM books
            GROUP BY status
        `);

        // Books by category
        const [categoryStats] = await db.execute(`
            SELECT category, COUNT(*) as count
            FROM books
            WHERE category IS NOT NULL AND category != ''
            GROUP BY category
            ORDER BY count DESC
            LIMIT 10
        `);

        // Books added this month
        const [monthlyStats] = await db.execute(`
            SELECT COUNT(*) as count
            FROM books
            WHERE MONTH(created_at) = MONTH(CURRENT_DATE())
            AND YEAR(created_at) = YEAR(CURRENT_DATE())
        `);

        res.json({
            success: true,
            data: {
                totalBooks: totalBooks[0].total,
                statusStats,
                categoryStats,
                monthlyAdded: monthlyStats[0].count
            }
        });
    } catch (error) {
        logger.error('Error fetching book statistics:', error);
        res.status(500).json({ success: false, message: 'Error fetching statistics' });
    }
});

module.exports = router;
