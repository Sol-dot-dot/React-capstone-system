const mysql = require('mysql2/promise');
const { generateBarcode, generateNumberCode, generateISBN } = require('./utils/bookUtils');
require('dotenv').config({ path: './config.env' });

async function addSampleBooks() {
    let connection;
    
    try {
        // Create connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'capstone_system',
            port: process.env.DB_PORT || 3306
        });

        console.log('Connected to database successfully!');

        // Sample books data
        const sampleBooks = [
            {
                title: 'The Great Gatsby',
                author: 'F. Scott Fitzgerald',
                isbn: '978-0743273565',
                publisher: 'Scribner',
                publication_year: 1925,
                genre: 'Fiction',
                description: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
                status: 'available',
                location: 'Shelf A1, Row 1'
            },
            {
                title: 'To Kill a Mockingbird',
                author: 'Harper Lee',
                isbn: '978-0446310789',
                publisher: 'Grand Central Publishing',
                publication_year: 1960,
                genre: 'Fiction',
                description: 'The story of young Scout Finch and her father Atticus in a racially divided Alabama town.',
                status: 'available',
                location: 'Shelf A1, Row 2'
            },
            {
                title: '1984',
                author: 'George Orwell',
                isbn: '978-0451524935',
                publisher: 'Signet Classic',
                publication_year: 1949,
                genre: 'Science Fiction',
                description: 'A dystopian novel about totalitarianism and surveillance society.',
                status: 'borrowed',
                location: 'Shelf A2, Row 1'
            },
            {
                title: 'Pride and Prejudice',
                author: 'Jane Austen',
                isbn: '978-0141439518',
                publisher: 'Penguin Classics',
                publication_year: 1813,
                genre: 'Romance',
                description: 'The story of Elizabeth Bennet and Mr. Darcy in Georgian-era England.',
                status: 'available',
                location: 'Shelf A2, Row 2'
            },
            {
                title: 'The Hobbit',
                author: 'J.R.R. Tolkien',
                isbn: '978-0547928241',
                publisher: 'Houghton Mifflin Harcourt',
                publication_year: 1937,
                genre: 'Fantasy',
                description: 'The adventure of Bilbo Baggins, a hobbit who embarks on a quest with thirteen dwarves.',
                status: 'available',
                location: 'Shelf B1, Row 1'
            }
        ];

        // Get admin ID (assuming admin exists)
        const [admins] = await connection.execute('SELECT id FROM admins LIMIT 1');
        const adminId = admins[0]?.id || 1;

        console.log(`Using admin ID: ${adminId}`);

        // Insert sample books
        for (const bookData of sampleBooks) {
            // Generate unique codes
            let barcode, numberCode;
            let attempts = 0;
            const maxAttempts = 10;
            
            do {
                barcode = generateBarcode();
                numberCode = generateNumberCode();
                attempts++;
                
                // Check if codes already exist
                const [existing] = await connection.execute(
                    'SELECT id FROM books WHERE barcode = ? OR number_code = ?',
                    [barcode, numberCode]
                );
                
                if (existing.length === 0) break;
            } while (attempts < maxAttempts);

            // Generate ISBN if not provided
            if (!bookData.isbn) {
                bookData.isbn = generateISBN();
            }

            // Insert book
            const insertQuery = `
                INSERT INTO books (
                    title, author, isbn, publisher, publication_year, 
                    genre, description, barcode, number_code, 
                    status, location, added_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                bookData.title,
                bookData.author,
                bookData.isbn,
                bookData.publisher,
                bookData.publication_year,
                bookData.genre,
                bookData.description,
                barcode,
                numberCode,
                bookData.status,
                bookData.location,
                adminId
            ];

            await connection.execute(insertQuery, values);
            console.log(`✅ Added: ${bookData.title} (Barcode: ${barcode}, Number: ${numberCode})`);
        }

        console.log('🎉 Sample books added successfully!');

        // Show statistics
        const [totalBooks] = await connection.execute('SELECT COUNT(*) as total FROM books');
        const [statusStats] = await connection.execute(`
            SELECT status, COUNT(*) as count 
            FROM books 
            GROUP BY status
        `);

        console.log('\n📊 Current Library Statistics:');
        console.log(`Total Books: ${totalBooks[0].total}`);
        statusStats.forEach(stat => {
            console.log(`${stat.status}: ${stat.count}`);
        });

    } catch (error) {
        console.error('❌ Error adding sample books:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the script
addSampleBooks();
