/**
 * Add More IT Books Script
 * Adds another 50 IT-related books to the database (IT051-IT100)
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

const books = [
  // Mobile Development (8)
  {
    title: 'iOS Programming: The Big Nerd Ranch Guide',
    author: 'Christian Keur, Aaron Hillegass',
    isbn: '978-0135264027',
    number_code: 'IT051',
    category: 'Mobile Development',
    publisher: 'Big Nerd Ranch',
    publication_year: 2020,
    pages: 800,
    description: 'Complete guide to iOS app development using Swift.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Android Programming: The Big Nerd Ranch Guide',
    author: 'Bill Phillips, Chris Stewart',
    isbn: '978-0135245125',
    number_code: 'IT052',
    category: 'Mobile Development',
    publisher: 'Big Nerd Ranch',
    publication_year: 2019,
    pages: 720,
    description: 'Learn Android development with Kotlin programming.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'React Native in Action',
    author: 'Nader Dabit',
    isbn: '978-1617294051',
    number_code: 'IT053',
    category: 'Mobile Development',
    publisher: 'Manning Publications',
    publication_year: 2019,
    pages: 320,
    description: 'Build cross-platform mobile apps with JavaScript and React.',
    book_copies: 3,
    available_copies: 3
  },
  {
    title: 'Flutter in Action',
    author: 'Eric Windmill',
    isbn: '978-1617296147',
    number_code: 'IT054',
    category: 'Mobile Development',
    publisher: 'Manning Publications',
    publication_year: 2020,
    pages: 368,
    description: 'Build beautiful mobile apps with Flutter and Dart.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'SwiftUI by Tutorials',
    author: 'raywenderlich.com Team',
    isbn: '978-1950325245',
    number_code: 'IT055',
    category: 'Mobile Development',
    publisher: 'Razeware LLC',
    publication_year: 2020,
    pages: 620,
    description: 'Build iOS apps with SwiftUI and Swift.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Kotlin in Action',
    author: 'Dmitry Jemerov, Svetlana Isakova',
    isbn: '978-1617293290',
    number_code: 'IT056',
    category: 'Mobile Development',
    publisher: 'Manning Publications',
    publication_year: 2017,
    pages: 360,
    description: 'Modern programming language for Android development.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Building Mobile Apps at Scale',
    author: 'Gergely Orosz',
    isbn: '978-1638778226',
    number_code: 'IT057',
    category: 'Mobile Development',
    publisher: 'Self-Published',
    publication_year: 2021,
    pages: 328,
    description: '39 engineering challenges in mobile app development.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Progressive Web Apps',
    author: 'Dean Hume',
    isbn: '978-1617294587',
    number_code: 'IT058',
    category: 'Mobile Development',
    publisher: 'Manning Publications',
    publication_year: 2018,
    pages: 272,
    description: 'Build fast, offline-capable web applications.',
    book_copies: 2,
    available_copies: 2
  },

  // Networking (7)
  {
    title: 'Computer Networking: A Top-Down Approach',
    author: 'James Kurose, Keith Ross',
    isbn: '978-0133594140',
    number_code: 'IT059',
    category: 'Networking',
    publisher: 'Pearson',
    publication_year: 2016,
    pages: 864,
    description: 'Comprehensive networking textbook with practical approach.',
    book_copies: 3,
    available_copies: 3
  },
  {
    title: 'TCP/IP Illustrated, Volume 1',
    author: 'W. Richard Stevens',
    isbn: '978-0201633467',
    number_code: 'IT060',
    category: 'Networking',
    publisher: 'Addison-Wesley',
    publication_year: 2011,
    pages: 1056,
    description: 'The protocols that run the internet explained in detail.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Network+ Guide to Networks',
    author: 'Jill West, Tamara Dean',
    isbn: '978-1337569330',
    number_code: 'IT061',
    category: 'Networking',
    publisher: 'Cengage Learning',
    publication_year: 2019,
    pages: 832,
    description: 'CompTIA Network+ certification preparation guide.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Computer Networks',
    author: 'Andrew Tanenbaum',
    isbn: '978-0132126953',
    number_code: 'IT062',
    category: 'Networking',
    publisher: 'Pearson',
    publication_year: 2010,
    pages: 960,
    description: 'Classic textbook on computer networking principles.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Wireshark Network Analysis',
    author: 'Laura Chappell',
    isbn: '978-1893939943',
    number_code: 'IT063',
    category: 'Networking',
    publisher: 'Protocol Analysis Institute',
    publication_year: 2012,
    pages: 680,
    description: 'Official study guide for Wireshark certification.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'CCNA 200-301 Official Cert Guide',
    author: 'Wendell Odom',
    isbn: '978-1587147142',
    number_code: 'IT064',
    category: 'Networking',
    publisher: 'Cisco Press',
    publication_year: 2020,
    pages: 1632,
    description: 'Complete guide for Cisco CCNA certification.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Network Programmability and Automation',
    author: 'Jason Edelman, Scott S. Lowe',
    isbn: '978-1491931257',
    number_code: 'IT065',
    category: 'Networking',
    publisher: "O'Reilly Media",
    publication_year: 2018,
    pages: 576,
    description: 'Skills for the next-generation network engineer.',
    book_copies: 2,
    available_copies: 2
  },

  // Operating Systems (6)
  {
    title: 'Operating System Concepts',
    author: 'Abraham Silberschatz',
    isbn: '978-1118063330',
    number_code: 'IT066',
    category: 'Operating Systems',
    publisher: 'Wiley',
    publication_year: 2018,
    pages: 1040,
    description: 'The dinosaur book - comprehensive OS textbook.',
    book_copies: 3,
    available_copies: 3
  },
  {
    title: 'Modern Operating Systems',
    author: 'Andrew Tanenbaum',
    isbn: '978-0133591620',
    number_code: 'IT067',
    category: 'Operating Systems',
    publisher: 'Pearson',
    publication_year: 2014,
    pages: 1136,
    description: 'Principles and implementation of modern operating systems.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'The Linux Programming Interface',
    author: 'Michael Kerrisk',
    isbn: '978-1593272203',
    number_code: 'IT068',
    category: 'Operating Systems',
    publisher: 'No Starch Press',
    publication_year: 2010,
    pages: 1552,
    description: 'The definitive guide to Linux system programming.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Windows Internals, Part 1',
    author: 'Pavel Yosifovich',
    isbn: '978-0735684188',
    number_code: 'IT069',
    category: 'Operating Systems',
    publisher: 'Microsoft Press',
    publication_year: 2017,
    pages: 800,
    description: 'Core mechanisms of the Windows operating system.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Understanding the Linux Kernel',
    author: 'Daniel Bovet, Marco Cesati',
    isbn: '978-0596005658',
    number_code: 'IT070',
    category: 'Operating Systems',
    publisher: "O'Reilly Media",
    publication_year: 2005,
    pages: 944,
    description: 'Deep dive into Linux kernel architecture and implementation.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Linux System Administration',
    author: 'Tom Adelstein, Bill Lubanovic',
    isbn: '978-0596009526',
    number_code: 'IT071',
    category: 'Operating Systems',
    publisher: "O'Reilly Media",
    publication_year: 2007,
    pages: 308,
    description: 'Practical guide to Linux system administration.',
    book_copies: 2,
    available_copies: 2
  },

  // Software Architecture (6)
  {
    title: 'Software Architecture in Practice',
    author: 'Len Bass, Paul Clements',
    isbn: '978-0321815736',
    number_code: 'IT072',
    category: 'Software Architecture',
    publisher: 'Addison-Wesley',
    publication_year: 2012,
    pages: 624,
    description: 'Comprehensive guide to software architecture principles.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Building Microservices',
    author: 'Sam Newman',
    isbn: '978-1491950357',
    number_code: 'IT073',
    category: 'Software Architecture',
    publisher: "O'Reilly Media",
    publication_year: 2015,
    pages: 280,
    description: 'Designing fine-grained systems with microservices.',
    book_copies: 3,
    available_copies: 3
  },
  {
    title: 'Domain-Driven Design',
    author: 'Eric Evans',
    isbn: '978-0321125215',
    number_code: 'IT074',
    category: 'Software Architecture',
    publisher: 'Addison-Wesley',
    publication_year: 2003,
    pages: 560,
    description: 'Tackling complexity in the heart of software.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Clean Architecture',
    author: 'Robert C. Martin',
    isbn: '978-0134494166',
    number_code: 'IT075',
    category: 'Software Architecture',
    publisher: 'Prentice Hall',
    publication_year: 2017,
    pages: 432,
    description: 'A craftsman\'s guide to software structure and design.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Patterns of Enterprise Application Architecture',
    author: 'Martin Fowler',
    isbn: '978-0321127420',
    number_code: 'IT076',
    category: 'Software Architecture',
    publisher: 'Addison-Wesley',
    publication_year: 2002,
    pages: 560,
    description: 'Essential patterns for enterprise software development.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Fundamentals of Software Architecture',
    author: 'Mark Richards, Neal Ford',
    isbn: '978-1492043454',
    number_code: 'IT077',
    category: 'Software Architecture',
    publisher: "O'Reilly Media",
    publication_year: 2020,
    pages: 432,
    description: 'Engineering approach to software architecture.',
    book_copies: 2,
    available_copies: 2
  },

  // Game Development (5)
  {
    title: 'Unity in Action',
    author: 'Joe Hocking',
    isbn: '978-1617294969',
    number_code: 'IT078',
    category: 'Game Development',
    publisher: 'Manning Publications',
    publication_year: 2018,
    pages: 352,
    description: 'Multiplatform game development with Unity.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Game Programming Patterns',
    author: 'Robert Nystrom',
    isbn: '978-0990582908',
    number_code: 'IT079',
    category: 'Game Development',
    publisher: 'Genever Benning',
    publication_year: 2014,
    pages: 354,
    description: 'Collection of patterns found in games that make code cleaner.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Unreal Engine 4 Game Development',
    author: 'Aram Cookson',
    isbn: '978-1784391966',
    number_code: 'IT080',
    category: 'Game Development',
    publisher: 'Packt Publishing',
    publication_year: 2016,
    pages: 318,
    description: 'Quick start guide to Unreal Engine 4.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Beginning C++ Through Game Programming',
    author: 'Michael Dawson',
    isbn: '978-1435457423',
    number_code: 'IT081',
    category: 'Game Development',
    publisher: 'Course Technology',
    publication_year: 2014,
    pages: 410,
    description: 'Learn C++ programming through game development.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'The Art of Game Design',
    author: 'Jesse Schell',
    isbn: '978-1138632059',
    number_code: 'IT082',
    category: 'Game Development',
    publisher: 'CRC Press',
    publication_year: 2019,
    pages: 600,
    description: 'A book of lenses for game design theory.',
    book_copies: 2,
    available_copies: 2
  },

  // Data Science (6)
  {
    title: 'Python for Data Analysis',
    author: 'Wes McKinney',
    isbn: '978-1491957660',
    number_code: 'IT083',
    category: 'Data Science',
    publisher: "O'Reilly Media",
    publication_year: 2017,
    pages: 544,
    description: 'Data wrangling with Pandas, NumPy, and IPython.',
    book_copies: 3,
    available_copies: 3
  },
  {
    title: 'Data Science from Scratch',
    author: 'Joel Grus',
    isbn: '978-1492041139',
    number_code: 'IT084',
    category: 'Data Science',
    publisher: "O'Reilly Media",
    publication_year: 2019,
    pages: 406,
    description: 'First principles with Python for data science.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'R for Data Science',
    author: 'Hadley Wickham, Garrett Grolemund',
    isbn: '978-1491910399',
    number_code: 'IT085',
    category: 'Data Science',
    publisher: "O'Reilly Media",
    publication_year: 2016,
    pages: 520,
    description: 'Import, tidy, transform, visualize, and model data with R.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'The Data Warehouse Toolkit',
    author: 'Ralph Kimball, Margy Ross',
    isbn: '978-1118530801',
    number_code: 'IT086',
    category: 'Data Science',
    publisher: 'Wiley',
    publication_year: 2013,
    pages: 600,
    description: 'The definitive guide to dimensional modeling.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Storytelling with Data',
    author: 'Cole Nussbaumer Knaflic',
    isbn: '978-1119002253',
    number_code: 'IT087',
    category: 'Data Science',
    publisher: 'Wiley',
    publication_year: 2015,
    pages: 288,
    description: 'Data visualization guide for business professionals.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Mining of Massive Datasets',
    author: 'Jure Leskovec, Anand Rajaraman',
    isbn: '978-1107077232',
    number_code: 'IT088',
    category: 'Data Science',
    publisher: 'Cambridge University Press',
    publication_year: 2014,
    pages: 511,
    description: 'Big data mining algorithms and techniques.',
    book_copies: 2,
    available_copies: 2
  },

  // Blockchain & Cryptocurrency (4)
  {
    title: 'Mastering Bitcoin',
    author: 'Andreas M. Antonopoulos',
    isbn: '978-1491954386',
    number_code: 'IT089',
    category: 'Blockchain',
    publisher: "O'Reilly Media",
    publication_year: 2017,
    pages: 416,
    description: 'Programming the open blockchain with Bitcoin.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Mastering Ethereum',
    author: 'Andreas M. Antonopoulos',
    isbn: '978-1491971949',
    number_code: 'IT090',
    category: 'Blockchain',
    publisher: "O'Reilly Media",
    publication_year: 2018,
    pages: 416,
    description: 'Building smart contracts and DApps.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Blockchain Basics',
    author: 'Daniel Drescher',
    isbn: '978-1484226032',
    number_code: 'IT091',
    category: 'Blockchain',
    publisher: 'Apress',
    publication_year: 2017,
    pages: 276,
    description: 'A non-technical introduction to blockchain technology.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'The Bitcoin Standard',
    author: 'Saifedean Ammous',
    isbn: '978-1119473862',
    number_code: 'IT092',
    category: 'Blockchain',
    publisher: 'Wiley',
    publication_year: 2018,
    pages: 304,
    description: 'The decentralized alternative to central banking.',
    book_copies: 2,
    available_copies: 2
  },

  // IoT & Embedded Systems (4)
  {
    title: 'Internet of Things for Architects',
    author: 'Perry Lea',
    isbn: '978-1788470599',
    number_code: 'IT093',
    category: 'IoT',
    publisher: 'Packt Publishing',
    publication_year: 2018,
    pages: 524,
    description: 'Architecting IoT solutions by implementing sensors and devices.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Building the Internet of Things',
    author: 'Maciej Kranz',
    isbn: '978-1118440674',
    number_code: 'IT094',
    category: 'IoT',
    publisher: 'Wiley',
    publication_year: 2016,
    pages: 336,
    description: 'Implement new business models, disrupt competitors, and transform industries.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Raspberry Pi User Guide',
    author: 'Eben Upton, Gareth Halfacree',
    isbn: '978-1119264361',
    number_code: 'IT095',
    category: 'IoT',
    publisher: 'Wiley',
    publication_year: 2016,
    pages: 312,
    description: 'Getting started with Raspberry Pi computing.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'Arduino Project Handbook',
    author: 'Mark Geddes',
    isbn: '978-1593276904',
    number_code: 'IT096',
    category: 'IoT',
    publisher: 'No Starch Press',
    publication_year: 2016,
    pages: 272,
    description: '25 practical projects to get you started with Arduino.',
    book_copies: 2,
    available_copies: 2
  },

  // Agile & Project Management (4)
  {
    title: 'Scrum: The Art of Doing Twice the Work in Half the Time',
    author: 'Jeff Sutherland',
    isbn: '978-0385346450',
    number_code: 'IT097',
    category: 'Agile',
    publisher: 'Crown Business',
    publication_year: 2014,
    pages: 256,
    description: 'The revolutionary method transforming project management.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'The Lean Startup',
    author: 'Eric Ries',
    isbn: '978-0307887894',
    number_code: 'IT098',
    category: 'Agile',
    publisher: 'Crown Business',
    publication_year: 2011,
    pages: 336,
    description: 'How today\'s entrepreneurs use continuous innovation.',
    book_copies: 3,
    available_copies: 3
  },
  {
    title: 'Agile Estimating and Planning',
    author: 'Mike Cohn',
    isbn: '978-0131479418',
    number_code: 'IT099',
    category: 'Agile',
    publisher: 'Prentice Hall',
    publication_year: 2005,
    pages: 368,
    description: 'Practical guide to agile planning and estimation.',
    book_copies: 2,
    available_copies: 2
  },
  {
    title: 'User Story Mapping',
    author: 'Jeff Patton',
    isbn: '978-1491904909',
    number_code: 'IT100',
    category: 'Agile',
    publisher: "O'Reilly Media",
    publication_year: 2014,
    pages: 324,
    description: 'Discover the whole story, build the right product.',
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

    console.log('Adding more books to database...\n');

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
    console.log(`\n📚 Total books in library: ${total[0].total}`);

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
