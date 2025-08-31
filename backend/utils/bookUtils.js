const crypto = require('crypto');

/**
 * Generate a unique barcode for a book
 * Format: LIB-YYYYMMDD-XXXXX (where XXXXX is a random 5-digit number)
 */
function generateBarcode() {
    const date = new Date();
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `LIB-${dateStr}-${randomNum}`;
}

/**
 * Generate a unique number code for a book
 * Format: BK-XXXXX (where XXXXX is a sequential number)
 */
function generateNumberCode() {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BK-${randomNum}`;
}

/**
 * Generate a unique ISBN-like code for books without ISBN
 * Format: ISBN-XXXXXXXXX (9 digits + check digit)
 */
function generateISBN() {
    // Generate 9 random digits
    let isbn = '';
    for (let i = 0; i < 9; i++) {
        isbn += Math.floor(Math.random() * 10);
    }
    
    // Calculate check digit (simplified algorithm)
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(isbn[i]) * (10 - i);
    }
    const checkDigit = (11 - (sum % 11)) % 11;
    
    return `ISBN-${isbn}${checkDigit === 10 ? 'X' : checkDigit}`;
}

/**
 * Validate book data before saving
 */
function validateBookData(bookData) {
    const errors = [];
    
    if (!bookData.title || bookData.title.trim().length === 0) {
        errors.push('Title is required');
    }
    
    if (!bookData.author || bookData.author.trim().length === 0) {
        errors.push('Author is required');
    }
    
    if (bookData.publication_year) {
        const currentYear = new Date().getFullYear();
        if (bookData.publication_year < 1800 || bookData.publication_year > currentYear) {
            errors.push('Publication year must be between 1800 and current year');
        }
    }
    
    return errors;
}

/**
 * Format book data for display
 */
function formatBookData(book) {
    return {
        ...book,
        title: book.title.trim(),
        author: book.author.trim(),
        publisher: book.publisher ? book.publisher.trim() : null,
        genre: book.genre ? book.genre.trim() : null,
        description: book.description ? book.description.trim() : null,
        location: book.location ? book.location.trim() : null
    };
}

module.exports = {
    generateBarcode,
    generateNumberCode,
    generateISBN,
    validateBookData,
    formatBookData
};
