/**
 * Add IT Books Script
 * Adds 50 IT-related books to the database
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

const books = [
  // Programming Books (15)
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    number_code: 'IT001',
    category: 'Programming',
    publisher: 'Prentice Hall',
    publication_year: 2008,
    pages: 464,
    description: 'A guide to writing clean, maintainable code with best practices for software craftsmanship.',
    book_copies: 3,
    available_copies: 3
  },
  {
    title: 'The Pragmatic Programmer: Your Journey to Mastery',
    author: 'David Thomas, Andrew Hunt',
    isbn: '978-0135957059',
    number_code: 'IT002',
    category: 'Programming',
    publisher: 'Addison-Wesley',
    publication_year: 2019,
    pages: 352,
    description: 'Practical advice for becoming a better programmer through concrete examples.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'JavaScript: The Good Parts',
    author: 'Douglas Crockford',
    isbn: '978-0596517748',
    number_code: 'IT003',
    category: 'Web Development',
    publisher: "O'Reilly Media",
    publication_year: 2008,
    pages: 176,
    description: 'Focuses on the beautiful, elegant, and highly expressive parts of JavaScript.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Python Crash Course',
    author: 'Eric Matthes',
    isbn: '978-1593279288',
    number_code: 'IT004',
    category: 'Programming',
    publisher: 'No Starch Press',
    publication_year: 2019,
    pages: 544,
    description: 'A hands-on, project-based introduction to programming in Python.',
    book_copies: 4,
    available_copies: 4
  },
  {
    title: 'Eloquent JavaScript',
    author: 'Marijn Haverbeke',
    isbn: '978-1593279509',
    number_code: 'IT005',
    category: 'Web Development',
    publisher: 'No Starch Press',
    publication_year: 2018,
    pages: 472,
    description: 'A modern introduction to programming with JavaScript.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Java: A Beginner\'s Guide',
    author: 'Herbert Schildt',
    isbn: '978-1260440218',
    number_code: 'IT006',
    category: 'Programming',
    publisher: 'McGraw-Hill',
    publication_year: 2018,
    pages: 728,
    description: 'Comprehensive guide for learning Java programming from scratch.',
    book_copies: 3,
    available_copies: 3
  },
  {
    title: 'C++ Primer',
    author: 'Stanley Lippman',
    isbn: '978-0321714114',
    number_code: 'IT007',
    category: 'Programming',
    publisher: 'Addison-Wesley',
    publication_year: 2012,
    pages: 976,
    description: 'Comprehensive introduction to C++ programming language.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Head First Design Patterns',
    author: 'Eric Freeman, Elisabeth Robson',
    isbn: '978-0596007126',
    number_code: 'IT008',
    category: 'Software Engineering',
    publisher: "O'Reilly Media",
    publication_year: 2004,
    pages: 694,
    description: 'A brain-friendly guide to design patterns in object-oriented programming.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    isbn: '978-0262033848',
    number_code: 'IT009',
    category: 'Computer Science',
    publisher: 'MIT Press',
    publication_year: 2009,
    pages: 1312,
    description: 'Comprehensive introduction to algorithms and data structures.',
    book_copies: 3,
    available_copies: 3
  },
  {
    title: 'Code Complete',
    author: 'Steve McConnell',
    isbn: '978-0735619678',
    number_code: 'IT010',
    category: 'Software Engineering',
    publisher: 'Microsoft Press',
    publication_year: 2004,
    pages: 960,
    description: 'A practical handbook of software construction.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Structure and Interpretation of Computer Programs',
    author: 'Harold Abelson',
    isbn: '978-0262510871',
    number_code: 'IT011',
    category: 'Computer Science',
    publisher: 'MIT Press',
    publication_year: 1996,
    pages: 657,
    description: 'Classic text on computer programming and its underlying principles.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Cracking the Coding Interview',
    author: 'Gayle Laakmann McDowell',
    isbn: '978-0984782857',
    number_code: 'IT012',
    category: 'Programming',
    publisher: 'CareerCup',
    publication_year: 2015,
    pages: 687,
    description: '189 programming questions and solutions for technical interviews.',
    book_copies: 3,
    available_copies: 3
  },
  {
    title: 'Automate the Boring Stuff with Python',
    author: 'Al Sweigart',
    isbn: '978-1593279929',
    number_code: 'IT013',
    category: 'Programming',
    publisher: 'No Starch Press',
    publication_year: 2019,
    pages: 592,
    description: 'Practical programming for total beginners with Python automation.',
    book_copies: 3,
    available_copies: 3
  },
  {
    title: 'Effective Java',
    author: 'Joshua Bloch',
    isbn: '978-0134685991',
    number_code: 'IT014',
    category: 'Programming',
    publisher: 'Addison-Wesley',
    publication_year: 2017,
    pages: 416,
    description: 'Best practices for the Java platform with 90 rules.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Learning Python',
    author: 'Mark Lutz',
    isbn: '978-1449355739',
    number_code: 'IT015',
    category: 'Programming',
    publisher: "O'Reilly Media",
    publication_year: 2013,
    pages: 1648,
    description: 'Comprehensive guide to the Python programming language.',
    book_copies: 2,
    available_copies: 2
  },

  // Web Development (10)
  {
    title: 'You Don\'t Know JS: Scope & Closures',
    author: 'Kyle Simpson',
    isbn: '978-1449335588',
    number_code: 'IT016',
    category: 'Web Development',
    publisher: "O'Reilly Media",
    publication_year: 2014,
    pages: 98,
    description: 'Deep dive into JavaScript scope and closures.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'React: Up & Running',
    author: 'Stoyan Stefanov',
    isbn: '978-1492051459',
    number_code: 'IT017',
    category: 'Web Development',
    publisher: "O'Reilly Media",
    publication_year: 2021,
    pages: 280,
    description: 'Build web applications with React quickly.',
    book_copies: 3,
    available_copies: 3
  },
  {
    title: 'Node.js Design Patterns',
    author: 'Mario Casciaro',
    isbn: '978-1839214110',
    number_code: 'IT018',
    category: 'Web Development',
    publisher: 'Packt Publishing',
    publication_year: 2020,
    pages: 660,
    description: 'Design and implement production-grade Node.js applications.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'CSS: The Definitive Guide',
    author: 'Eric Meyer',
    isbn: '978-1449393199',
    number_code: 'IT019',
    category: 'Web Development',
    publisher: "O'Reilly Media",
    publication_year: 2017,
    pages: 1090,
    description: 'Visual presentation for the web with comprehensive CSS guide.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Full Stack JavaScript Development',
    author: 'Azat Mardan',
    isbn: '978-1484237182',
    number_code: 'IT020',
    category: 'Web Development',
    publisher: 'Apress',
    publication_year: 2018,
    pages: 315,
    description: 'Build complete web applications using MongoDB, Express, React, and Node.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Learning Web Design',
    author: 'Jennifer Robbins',
    isbn: '978-1491960202',
    number_code: 'IT021',
    category: 'Web Development',
    publisher: "O'Reilly Media",
    publication_year: 2018,
    pages: 808,
    description: 'A beginner\'s guide to HTML, CSS, JavaScript, and web graphics.',
    book_copies: 3,
    available_copies: 3
  },
  {
    title: 'Vue.js in Action',
    author: 'Erik Hanchett',
    isbn: '978-1617294624',
    number_code: 'IT022',
    category: 'Web Development',
    publisher: 'Manning Publications',
    publication_year: 2018,
    pages: 304,
    description: 'Build fast, flowing web UI with the progressive Vue.js framework.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'RESTful Web APIs',
    author: 'Leonard Richardson',
    isbn: '978-1449358068',
    number_code: 'IT023',
    category: 'Web Development',
    publisher: "O'Reilly Media",
    publication_year: 2013,
    pages: 408,
    description: 'Services for a changing world - designing RESTful APIs.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'TypeScript Quickly',
    author: 'Yakov Fain, Anton Moiseev',
    isbn: '978-1617295942',
    number_code: 'IT024',
    category: 'Web Development',
    publisher: 'Manning Publications',
    publication_year: 2020,
    pages: 488,
    description: 'Modern JavaScript with TypeScript for safer, scalable web applications.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'GraphQL in Action',
    author: 'Samer Buna',
    isbn: '978-1617295683',
    number_code: 'IT025',
    category: 'Web Development',
    publisher: 'Manning Publications',
    publication_year: 2021,
    pages: 384,
    description: 'Learn to build modern APIs with GraphQL.',
    book_copies: 2,
    available_copies: 2
  },

  // Database (8)
  {
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    isbn: '978-1449373320',
    number_code: 'IT026',
    category: 'Database',
    publisher: "O'Reilly Media",
    publication_year: 2017,
    pages: 616,
    description: 'The big ideas behind reliable, scalable, and maintainable systems.',
    book_copies: 3,
    available_copies: 3
  },
  {
    title: 'SQL Performance Explained',
    author: 'Markus Winand',
    isbn: '978-3950307825',
    number_code: 'IT027',
    category: 'Database',
    publisher: 'Self-Published',
    publication_year: 2012,
    pages: 204,
    description: 'Everything developers need to know about SQL performance.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'MongoDB: The Definitive Guide',
    author: 'Shannon Bradshaw',
    isbn: '978-1491954461',
    number_code: 'IT028',
    category: 'Database',
    publisher: "O'Reilly Media",
    publication_year: 2019,
    pages: 514,
    description: 'Powerful and scalable data storage with MongoDB.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Database System Concepts',
    author: 'Abraham Silberschatz',
    isbn: '978-0078022159',
    number_code: 'IT029',
    category: 'Database',
    publisher: 'McGraw-Hill',
    publication_year: 2019,
    pages: 1376,
    description: 'Comprehensive database management systems textbook.',
    book_copies: 3,
    available_copies: 3
  },
  {
    title: 'Redis in Action',
    author: 'Josiah Carlson',
    isbn: '978-1617290855',
    number_code: 'IT030',
    category: 'Database',
    publisher: 'Manning Publications',
    publication_year: 2013,
    pages: 320,
    description: 'Build fast, efficient data systems with Redis.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'PostgreSQL: Up and Running',
    author: 'Regina Obe, Leo Hsu',
    isbn: '978-1491963418',
    number_code: 'IT031',
    category: 'Database',
    publisher: "O'Reilly Media",
    publication_year: 2017,
    pages: 310,
    description: 'Practical guide to PostgreSQL database.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'High Performance MySQL',
    author: 'Baron Schwartz',
    isbn: '978-1449314286',
    number_code: 'IT032',
    category: 'Database',
    publisher: "O'Reilly Media",
    publication_year: 2012,
    pages: 826,
    description: 'Optimization, backups, and replication for MySQL.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Seven Databases in Seven Weeks',
    author: 'Luc Perkins',
    isbn: '978-1680502534',
    number_code: 'IT033',
    category: 'Database',
    publisher: 'Pragmatic Bookshelf',
    publication_year: 2018,
    pages: 358,
    description: 'A guide to modern databases and the NoSQL movement.',
    book_copies: 2,
    available_copies: 2
  },

  // Cybersecurity (7)
  {
    title: 'The Web Application Hacker\'s Handbook',
    author: 'Dafydd Stuttard',
    isbn: '978-1118026472',
    number_code: 'IT034',
    category: 'Cybersecurity',
    publisher: 'Wiley',
    publication_year: 2011,
    pages: 912,
    description: 'Finding and exploiting security flaws in web applications.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Metasploit: The Penetration Tester\'s Guide',
    author: 'David Kennedy',
    isbn: '978-1593272883',
    number_code: 'IT035',
    category: 'Cybersecurity',
    publisher: 'No Starch Press',
    publication_year: 2011,
    pages: 328,
    description: 'Complete guide to penetration testing with Metasploit.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Practical Malware Analysis',
    author: 'Michael Sikorski',
    isbn: '978-1593272906',
    number_code: 'IT036',
    category: 'Cybersecurity',
    publisher: 'No Starch Press',
    publication_year: 2012,
    pages: 800,
    description: 'The hands-on guide to dissecting malicious software.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Applied Cryptography',
    author: 'Bruce Schneier',
    isbn: '978-1119096726',
    number_code: 'IT037',
    category: 'Cybersecurity',
    publisher: 'Wiley',
    publication_year: 2015,
    pages: 784,
    description: 'Protocols, algorithms, and source code in C.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Hacking: The Art of Exploitation',
    author: 'Jon Erickson',
    isbn: '978-1593271442',
    number_code: 'IT038',
    category: 'Cybersecurity',
    publisher: 'No Starch Press',
    publication_year: 2008,
    pages: 488,
    description: 'Learn to think like a hacker with hands-on exploitation.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Network Security Essentials',
    author: 'William Stallings',
    isbn: '978-0134527338',
    number_code: 'IT039',
    category: 'Cybersecurity',
    publisher: 'Pearson',
    publication_year: 2016,
    pages: 464,
    description: 'Applications and standards in network security.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'The Basics of Hacking and Penetration Testing',
    author: 'Patrick Engebretson',
    isbn: '978-0124116443',
    number_code: 'IT040',
    category: 'Cybersecurity',
    publisher: 'Syngress',
    publication_year: 2013,
    pages: 216,
    description: 'Ethical hacking and penetration testing made easy.',
    book_copies: 2,
    available_copies: 2
  },

  // Cloud Computing & DevOps (5)
  {
    title: 'Docker Deep Dive',
    author: 'Nigel Poulton',
    isbn: '978-1521822807',
    number_code: 'IT041',
    category: 'Cloud Computing',
    publisher: 'Self-Published',
    publication_year: 2017,
    pages: 260,
    description: 'Zero to Docker in a single book with hands-on examples.',
    book_copies: 3,
    available_copies: 3
  },
  {
    title: 'Kubernetes in Action',
    author: 'Marko Luksa',
    isbn: '978-1617293726',
    number_code: 'IT042',
    category: 'Cloud Computing',
    publisher: 'Manning Publications',
    publication_year: 2017,
    pages: 624,
    description: 'Deploy and manage applications with Kubernetes.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'The DevOps Handbook',
    author: 'Gene Kim',
    isbn: '978-1942788003',
    number_code: 'IT043',
    category: 'DevOps',
    publisher: 'IT Revolution Press',
    publication_year: 2016,
    pages: 480,
    description: 'How to create world-class agility, reliability, and security.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'AWS Certified Solutions Architect Study Guide',
    author: 'Ben Piper',
    isbn: '978-1119713081',
    number_code: 'IT044',
    category: 'Cloud Computing',
    publisher: 'Sybex',
    publication_year: 2020,
    pages: 912,
    description: 'Associate SAA-C02 exam preparation guide.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Site Reliability Engineering',
    author: 'Betsy Beyer',
    isbn: '978-1491929124',
    number_code: 'IT045',
    category: 'DevOps',
    publisher: "O'Reilly Media",
    publication_year: 2016,
    pages: 552,
    description: 'How Google runs production systems with SRE principles.',
    book_copies: 2,
    available_copies: 2
  },

  // AI & Machine Learning (5)
  {
    title: 'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow',
    author: 'Aurélien Géron',
    isbn: '978-1492032649',
    number_code: 'IT046',
    category: 'Machine Learning',
    publisher: "O'Reilly Media",
    publication_year: 2019,
    pages: 856,
    description: 'Concepts, tools, and techniques to build intelligent systems.',
    book_copies: 3,
    available_copies: 3
  },
  {
    title: 'Deep Learning',
    author: 'Ian Goodfellow',
    isbn: '978-0262035613',
    number_code: 'IT047',
    category: 'Artificial Intelligence',
    publisher: 'MIT Press',
    publication_year: 2016,
    pages: 800,
    description: 'Comprehensive textbook on deep learning by leading experts.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Python Machine Learning',
    author: 'Sebastian Raschka',
    isbn: '978-1789955750',
    number_code: 'IT048',
    category: 'Machine Learning',
    publisher: 'Packt Publishing',
    publication_year: 2019,
    pages: 772,
    description: 'Machine learning and deep learning with Python and scikit-learn.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell, Peter Norvig',
    isbn: '978-0134610993',
    number_code: 'IT049',
    category: 'Artificial Intelligence',
    publisher: 'Pearson',
    publication_year: 2020,
    pages: 1136,
    description: 'The most comprehensive AI textbook available.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Natural Language Processing with Python',
    author: 'Steven Bird',
    isbn: '978-0596516499',
    number_code: 'IT050',
    category: 'Machine Learning',
    publisher: "O'Reilly Media",
    publication_year: 2009,
    pages: 504,
    description: 'Analyzing text with the Natural Language Toolkit.',
    book_copies: 2,
    available_copies: 2
  }
];

async function addBooks() {
  let connection;

  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });

    console.log('✓ Connected to database\n');

    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    console.log('Adding books to database...\n');

    for (const book of books) {
      try {
        // Check if book already exists
        const [existing] = await connection.execute(
          'SELECT id FROM books WHERE number_code = ? OR isbn = ?',
          [book.number_code, book.isbn]
        );

        if (existing.length > 0) {
          console.log(`⚠ Skipped: ${book.title} (already exists)`);
          skippedCount++;
          continue;
        }

        // Insert book
        await connection.execute(
          `INSERT INTO books
          (title, author, isbn, number_code, category, publisher, publication_year,
           pages, description, book_copies, available_copies, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')`,
          [
            book.title,
            book.author,
            book.isbn,
            book.number_code,
            book.category,
            book.publisher,
            book.publication_year,
            book.pages,
            book.description,
            book.book_copies,
            book.available_copies
          ]
        );

        console.log(`✓ Added: ${book.title} (${book.number_code})`);
        insertedCount++;
      } catch (error) {
        console.error(`✗ Error adding ${book.title}: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n================================');
    console.log('IMPORT SUMMARY');
    console.log('================================');
    console.log(`✓ Inserted: ${insertedCount} books`);
    console.log(`⚠ Skipped:  ${skippedCount} books`);
    console.log(`✗ Errors:   ${errorCount} books`);
    console.log('================================\n');

    // Show statistics by category
    const [stats] = await connection.execute(`
      SELECT category, COUNT(*) as count, SUM(book_copies) as total_copies
      FROM books
      GROUP BY category
      ORDER BY count DESC
    `);

    console.log('Books by Category:');
    console.table(stats);

    // Show total books
    const [total] = await connection.execute('SELECT COUNT(*) as total FROM books');
    console.log(`\nTotal books in library: ${total[0].total}`);

  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✓ Database connection closed');
    }
  }
}

// Run the script
addBooks();
