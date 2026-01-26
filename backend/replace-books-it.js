/**
 * Replace Books with IT/Computer-Related Books
 * Removes all existing books and adds IT-focused books
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

const itBooks = [
  // Programming Languages
  { title: 'Clean Code: A Handbook of Agile Software Craftsmanship', author: 'Robert C. Martin', isbn: '978-0132350884', number_code: 'IT-001', category: 'Programming', publisher: 'Prentice Hall', publication_year: 2008, pages: 464, description: 'A handbook of agile software craftsmanship with practical advice on writing clean, maintainable code.', book_copies: 5 },
  { title: 'The Pragmatic Programmer: Your Journey to Mastery', author: 'David Thomas & Andrew Hunt', isbn: '978-0135957059', number_code: 'IT-002', category: 'Programming', publisher: 'Addison-Wesley', publication_year: 2019, pages: 352, description: 'A guide to becoming a better programmer through practical advice and tips.', book_copies: 5 },
  { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', isbn: '978-0596517748', number_code: 'IT-003', category: 'Programming', publisher: 'O\'Reilly Media', publication_year: 2008, pages: 176, description: 'A deep dive into the best features of JavaScript programming language.', book_copies: 4 },
  { title: 'Python Crash Course', author: 'Eric Matthes', isbn: '978-1593279288', number_code: 'IT-004', category: 'Programming', publisher: 'No Starch Press', publication_year: 2019, pages: 544, description: 'A hands-on, project-based introduction to Python programming.', book_copies: 6 },
  { title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', isbn: '978-1593279509', number_code: 'IT-005', category: 'Programming', publisher: 'No Starch Press', publication_year: 2018, pages: 472, description: 'A modern introduction to programming with JavaScript.', book_copies: 5 },
  { title: 'Learning Python', author: 'Mark Lutz', isbn: '978-1449355739', number_code: 'IT-006', category: 'Programming', publisher: 'O\'Reilly Media', publication_year: 2013, pages: 1648, description: 'Comprehensive guide to learning Python programming from scratch.', book_copies: 4 },
  { title: 'Java: The Complete Reference', author: 'Herbert Schildt', isbn: '978-1260440232', number_code: 'IT-007', category: 'Programming', publisher: 'McGraw-Hill', publication_year: 2021, pages: 1248, description: 'The definitive guide to Java programming language.', book_copies: 5 },
  { title: 'C Programming Language', author: 'Brian W. Kernighan & Dennis M. Ritchie', isbn: '978-0131103627', number_code: 'IT-008', category: 'Programming', publisher: 'Prentice Hall', publication_year: 1988, pages: 272, description: 'The classic guide to C programming by its creators.', book_copies: 4 },
  { title: 'Effective Java', author: 'Joshua Bloch', isbn: '978-0134685991', number_code: 'IT-009', category: 'Programming', publisher: 'Addison-Wesley', publication_year: 2017, pages: 416, description: 'Best practices for the Java platform.', book_copies: 4 },
  { title: 'You Don\'t Know JS: Scope & Closures', author: 'Kyle Simpson', isbn: '978-1491904152', number_code: 'IT-010', category: 'Programming', publisher: 'O\'Reilly Media', publication_year: 2014, pages: 98, description: 'Deep dive into JavaScript scope and closures.', book_copies: 4 },

  // Web Development
  { title: 'Learning React', author: 'Alex Banks & Eve Porcello', isbn: '978-1492051725', number_code: 'IT-011', category: 'Web Development', publisher: 'O\'Reilly Media', publication_year: 2020, pages: 310, description: 'Modern patterns for developing React apps.', book_copies: 6 },
  { title: 'Node.js Design Patterns', author: 'Mario Casciaro', isbn: '978-1839214110', number_code: 'IT-012', category: 'Web Development', publisher: 'Packt Publishing', publication_year: 2020, pages: 664, description: 'Design and implement production-grade Node.js applications.', book_copies: 4 },
  { title: 'Full-Stack React, TypeScript, and Node', author: 'David Choi', isbn: '978-1839219931', number_code: 'IT-013', category: 'Web Development', publisher: 'Packt Publishing', publication_year: 2020, pages: 648, description: 'Build cloud-ready web applications using React, TypeScript, and Node.', book_copies: 5 },
  { title: 'HTML and CSS: Design and Build Websites', author: 'Jon Duckett', isbn: '978-1118008188', number_code: 'IT-014', category: 'Web Development', publisher: 'Wiley', publication_year: 2011, pages: 490, description: 'A beautifully designed introduction to HTML and CSS.', book_copies: 6 },
  { title: 'CSS: The Definitive Guide', author: 'Eric A. Meyer', isbn: '978-1449393199', number_code: 'IT-015', category: 'Web Development', publisher: 'O\'Reilly Media', publication_year: 2017, pages: 1090, description: 'Visual presentation for the web using CSS.', book_copies: 4 },
  { title: 'Vue.js: Up and Running', author: 'Callum Macrae', isbn: '978-1491997246', number_code: 'IT-016', category: 'Web Development', publisher: 'O\'Reilly Media', publication_year: 2018, pages: 174, description: 'Building accessible and performant web apps with Vue.js.', book_copies: 4 },
  { title: 'Angular: Up and Running', author: 'Shyam Seshadri', isbn: '978-1491999837', number_code: 'IT-017', category: 'Web Development', publisher: 'O\'Reilly Media', publication_year: 2018, pages: 312, description: 'Learning Angular step by step.', book_copies: 4 },
  { title: 'RESTful Web APIs', author: 'Leonard Richardson', isbn: '978-1449358068', number_code: 'IT-018', category: 'Web Development', publisher: 'O\'Reilly Media', publication_year: 2013, pages: 406, description: 'Services for a changing world using REST APIs.', book_copies: 4 },
  { title: 'Web Development with Node and Express', author: 'Ethan Brown', isbn: '978-1492053514', number_code: 'IT-019', category: 'Web Development', publisher: 'O\'Reilly Media', publication_year: 2019, pages: 347, description: 'Leveraging the JavaScript stack for web development.', book_copies: 5 },
  { title: 'PHP & MySQL: Server-side Web Development', author: 'Jon Duckett', isbn: '978-1119149224', number_code: 'IT-020', category: 'Web Development', publisher: 'Wiley', publication_year: 2022, pages: 672, description: 'Learn server-side web development with PHP and MySQL.', book_copies: 5 },

  // Algorithms & Data Structures
  { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '978-0262033848', number_code: 'IT-021', category: 'Algorithms', publisher: 'MIT Press', publication_year: 2009, pages: 1312, description: 'The comprehensive textbook covering a broad range of algorithms.', book_copies: 5 },
  { title: 'Cracking the Coding Interview', author: 'Gayle Laakmann McDowell', isbn: '978-0984782857', number_code: 'IT-022', category: 'Algorithms', publisher: 'CareerCup', publication_year: 2015, pages: 708, description: '189 programming questions and solutions for technical interviews.', book_copies: 6 },
  { title: 'The Algorithm Design Manual', author: 'Steven S. Skiena', isbn: '978-3030542559', number_code: 'IT-023', category: 'Algorithms', publisher: 'Springer', publication_year: 2020, pages: 810, description: 'Practical guide to algorithm design and analysis.', book_copies: 4 },
  { title: 'Data Structures and Algorithms in Java', author: 'Robert Lafore', isbn: '978-0672324536', number_code: 'IT-024', category: 'Algorithms', publisher: 'Sams Publishing', publication_year: 2002, pages: 800, description: 'Learn data structures and algorithms using Java.', book_copies: 5 },
  { title: 'Grokking Algorithms', author: 'Aditya Bhargava', isbn: '978-1617292231', number_code: 'IT-025', category: 'Algorithms', publisher: 'Manning', publication_year: 2016, pages: 256, description: 'An illustrated guide for programmers and curious people.', book_copies: 5 },

  // Database
  { title: 'Database System Concepts', author: 'Abraham Silberschatz', isbn: '978-0078022159', number_code: 'IT-026', category: 'Database', publisher: 'McGraw-Hill', publication_year: 2019, pages: 1376, description: 'Comprehensive guide to database management systems.', book_copies: 5 },
  { title: 'Learning SQL', author: 'Alan Beaulieu', isbn: '978-1492057611', number_code: 'IT-027', category: 'Database', publisher: 'O\'Reilly Media', publication_year: 2020, pages: 378, description: 'Generate, manipulate, and retrieve data using SQL.', book_copies: 5 },
  { title: 'MongoDB: The Definitive Guide', author: 'Shannon Bradshaw', isbn: '978-1491954461', number_code: 'IT-028', category: 'Database', publisher: 'O\'Reilly Media', publication_year: 2019, pages: 514, description: 'Powerful and scalable data storage with MongoDB.', book_copies: 4 },
  { title: 'High Performance MySQL', author: 'Baron Schwartz', isbn: '978-1492080510', number_code: 'IT-029', category: 'Database', publisher: 'O\'Reilly Media', publication_year: 2021, pages: 800, description: 'Optimization, backups, and replication for MySQL.', book_copies: 4 },
  { title: 'PostgreSQL: Up and Running', author: 'Regina O. Obe', isbn: '978-1491963418', number_code: 'IT-030', category: 'Database', publisher: 'O\'Reilly Media', publication_year: 2017, pages: 315, description: 'A practical guide to the advanced open source database.', book_copies: 4 },

  // Operating Systems & Networking
  { title: 'Operating System Concepts', author: 'Abraham Silberschatz', isbn: '978-1119800361', number_code: 'IT-031', category: 'Operating Systems', publisher: 'Wiley', publication_year: 2021, pages: 1040, description: 'Comprehensive textbook on operating systems principles.', book_copies: 5 },
  { title: 'Computer Networks', author: 'Andrew S. Tanenbaum', isbn: '978-0132126953', number_code: 'IT-032', category: 'Networking', publisher: 'Pearson', publication_year: 2010, pages: 960, description: 'Thorough introduction to computer networks and protocols.', book_copies: 5 },
  { title: 'Linux Command Line and Shell Scripting Bible', author: 'Richard Blum', isbn: '978-1119700913', number_code: 'IT-033', category: 'Operating Systems', publisher: 'Wiley', publication_year: 2021, pages: 816, description: 'Comprehensive guide to Linux command line and scripting.', book_copies: 5 },
  { title: 'The Linux Programming Interface', author: 'Michael Kerrisk', isbn: '978-1593272203', number_code: 'IT-034', category: 'Operating Systems', publisher: 'No Starch Press', publication_year: 2010, pages: 1552, description: 'A Linux and UNIX system programming handbook.', book_copies: 4 },
  { title: 'TCP/IP Illustrated, Volume 1', author: 'Kevin R. Fall', isbn: '978-0321336316', number_code: 'IT-035', category: 'Networking', publisher: 'Addison-Wesley', publication_year: 2011, pages: 1056, description: 'The protocols of TCP/IP explained.', book_copies: 4 },

  // Software Engineering & Design
  { title: 'Design Patterns: Elements of Reusable Object-Oriented Software', author: 'Erich Gamma', isbn: '978-0201633610', number_code: 'IT-036', category: 'Software Engineering', publisher: 'Addison-Wesley', publication_year: 1994, pages: 416, description: 'Classic book on software design patterns.', book_copies: 5 },
  { title: 'Software Engineering', author: 'Ian Sommerville', isbn: '978-0133943030', number_code: 'IT-037', category: 'Software Engineering', publisher: 'Pearson', publication_year: 2015, pages: 816, description: 'Comprehensive introduction to software engineering practices.', book_copies: 5 },
  { title: 'Head First Design Patterns', author: 'Eric Freeman & Elisabeth Robson', isbn: '978-1492078005', number_code: 'IT-038', category: 'Software Engineering', publisher: 'O\'Reilly Media', publication_year: 2020, pages: 672, description: 'A brain-friendly guide to design patterns.', book_copies: 5 },
  { title: 'Refactoring: Improving the Design of Existing Code', author: 'Martin Fowler', isbn: '978-0134757599', number_code: 'IT-039', category: 'Software Engineering', publisher: 'Addison-Wesley', publication_year: 2018, pages: 448, description: 'Improving code design without changing behavior.', book_copies: 4 },
  { title: 'Domain-Driven Design', author: 'Eric Evans', isbn: '978-0321125217', number_code: 'IT-040', category: 'Software Engineering', publisher: 'Addison-Wesley', publication_year: 2003, pages: 560, description: 'Tackling complexity in the heart of software.', book_copies: 4 },

  // AI & Machine Learning
  { title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell & Peter Norvig', isbn: '978-0136042594', number_code: 'IT-041', category: 'Artificial Intelligence', publisher: 'Pearson', publication_year: 2020, pages: 1136, description: 'The leading textbook on AI used worldwide.', book_copies: 5 },
  { title: 'Deep Learning', author: 'Ian Goodfellow', isbn: '978-0262035613', number_code: 'IT-042', category: 'Machine Learning', publisher: 'MIT Press', publication_year: 2016, pages: 800, description: 'Comprehensive textbook on deep learning.', book_copies: 4 },
  { title: 'Hands-On Machine Learning with Scikit-Learn and TensorFlow', author: 'Aurelien Geron', isbn: '978-1492032649', number_code: 'IT-043', category: 'Machine Learning', publisher: 'O\'Reilly Media', publication_year: 2019, pages: 856, description: 'Concepts, tools, and techniques to build intelligent systems.', book_copies: 5 },
  { title: 'Python Machine Learning', author: 'Sebastian Raschka', isbn: '978-1789955750', number_code: 'IT-044', category: 'Machine Learning', publisher: 'Packt Publishing', publication_year: 2019, pages: 772, description: 'Machine learning and deep learning with Python.', book_copies: 4 },
  { title: 'Natural Language Processing with Python', author: 'Steven Bird', isbn: '978-0596516499', number_code: 'IT-045', category: 'Machine Learning', publisher: 'O\'Reilly Media', publication_year: 2009, pages: 504, description: 'Analyzing text with the Natural Language Toolkit.', book_copies: 4 },

  // Cybersecurity
  { title: 'The Web Application Hacker\'s Handbook', author: 'Dafydd Stuttard', isbn: '978-1118026472', number_code: 'IT-046', category: 'Cybersecurity', publisher: 'Wiley', publication_year: 2011, pages: 912, description: 'Finding and exploiting security flaws in web applications.', book_copies: 4 },
  { title: 'Hacking: The Art of Exploitation', author: 'Jon Erickson', isbn: '978-1593271442', number_code: 'IT-047', category: 'Cybersecurity', publisher: 'No Starch Press', publication_year: 2008, pages: 488, description: 'Introduction to hacking and exploitation techniques.', book_copies: 4 },
  { title: 'Network Security Essentials', author: 'William Stallings', isbn: '978-0134527338', number_code: 'IT-048', category: 'Cybersecurity', publisher: 'Pearson', publication_year: 2016, pages: 448, description: 'Applications and standards for network security.', book_copies: 4 },
  { title: 'Practical Malware Analysis', author: 'Michael Sikorski', isbn: '978-1593272906', number_code: 'IT-049', category: 'Cybersecurity', publisher: 'No Starch Press', publication_year: 2012, pages: 800, description: 'The hands-on guide to dissecting malicious software.', book_copies: 3 },
  { title: 'Cryptography and Network Security', author: 'William Stallings', isbn: '978-0134444284', number_code: 'IT-050', category: 'Cybersecurity', publisher: 'Pearson', publication_year: 2016, pages: 752, description: 'Principles and practice of cryptography.', book_copies: 4 },

  // Cloud & DevOps
  { title: 'Docker Deep Dive', author: 'Nigel Poulton', isbn: '978-1521822807', number_code: 'IT-051', category: 'DevOps', publisher: 'Independently Published', publication_year: 2020, pages: 368, description: 'Comprehensive guide to Docker containers.', book_copies: 5 },
  { title: 'Kubernetes: Up and Running', author: 'Brendan Burns', isbn: '978-1492046530', number_code: 'IT-052', category: 'DevOps', publisher: 'O\'Reilly Media', publication_year: 2019, pages: 278, description: 'Dive into the future of infrastructure with Kubernetes.', book_copies: 4 },
  { title: 'The DevOps Handbook', author: 'Gene Kim', isbn: '978-1942788003', number_code: 'IT-053', category: 'DevOps', publisher: 'IT Revolution Press', publication_year: 2016, pages: 480, description: 'How to create world-class agility and reliability.', book_copies: 5 },
  { title: 'Site Reliability Engineering', author: 'Betsy Beyer', isbn: '978-1491929124', number_code: 'IT-054', category: 'DevOps', publisher: 'O\'Reilly Media', publication_year: 2016, pages: 552, description: 'How Google runs production systems.', book_copies: 4 },
  { title: 'AWS Certified Solutions Architect Study Guide', author: 'Ben Piper', isbn: '978-1119713081', number_code: 'IT-055', category: 'Cloud Computing', publisher: 'Sybex', publication_year: 2021, pages: 1056, description: 'AWS certification exam preparation guide.', book_copies: 5 },

  // Mobile Development
  { title: 'React Native in Action', author: 'Nader Dabit', isbn: '978-1617294051', number_code: 'IT-056', category: 'Mobile Development', publisher: 'Manning', publication_year: 2019, pages: 320, description: 'Developing iOS and Android apps with JavaScript.', book_copies: 5 },
  { title: 'Android Programming: The Big Nerd Ranch Guide', author: 'Bill Phillips', isbn: '978-0135245125', number_code: 'IT-057', category: 'Mobile Development', publisher: 'Big Nerd Ranch', publication_year: 2019, pages: 624, description: 'Comprehensive guide to Android development.', book_copies: 5 },
  { title: 'iOS Programming: The Big Nerd Ranch Guide', author: 'Christian Keur', isbn: '978-0135264027', number_code: 'IT-058', category: 'Mobile Development', publisher: 'Big Nerd Ranch', publication_year: 2020, pages: 416, description: 'Comprehensive guide to iOS development.', book_copies: 4 },
  { title: 'Flutter in Action', author: 'Eric Windmill', isbn: '978-1617296147', number_code: 'IT-059', category: 'Mobile Development', publisher: 'Manning', publication_year: 2020, pages: 368, description: 'Build cross-platform mobile apps with Flutter.', book_copies: 5 },
  { title: 'Kotlin in Action', author: 'Dmitry Jemerov', isbn: '978-1617293290', number_code: 'IT-060', category: 'Mobile Development', publisher: 'Manning', publication_year: 2017, pages: 360, description: 'Learn Kotlin programming for Android and beyond.', book_copies: 4 },

  // Computer Architecture & Hardware
  { title: 'Computer Organization and Design', author: 'David A. Patterson', isbn: '978-0128201091', number_code: 'IT-061', category: 'Computer Architecture', publisher: 'Morgan Kaufmann', publication_year: 2020, pages: 800, description: 'The hardware/software interface explained.', book_copies: 4 },
  { title: 'Structured Computer Organization', author: 'Andrew S. Tanenbaum', isbn: '978-0132916523', number_code: 'IT-062', category: 'Computer Architecture', publisher: 'Pearson', publication_year: 2012, pages: 800, description: 'A structured approach to computer architecture.', book_copies: 4 },
  { title: 'Computer Architecture: A Quantitative Approach', author: 'John L. Hennessy', isbn: '978-0128119051', number_code: 'IT-063', category: 'Computer Architecture', publisher: 'Morgan Kaufmann', publication_year: 2017, pages: 936, description: 'The quantitative approach to computer architecture.', book_copies: 3 },
  { title: 'Digital Design and Computer Architecture', author: 'David Harris', isbn: '978-0128000564', number_code: 'IT-064', category: 'Computer Architecture', publisher: 'Morgan Kaufmann', publication_year: 2015, pages: 586, description: 'From gates to processors with ARM edition.', book_copies: 4 },
  { title: 'Code: The Hidden Language of Computer Hardware and Software', author: 'Charles Petzold', isbn: '978-0735611313', number_code: 'IT-065', category: 'Computer Architecture', publisher: 'Microsoft Press', publication_year: 2000, pages: 400, description: 'Understanding how computers work at the fundamental level.', book_copies: 5 },

  // Version Control & Tools
  { title: 'Pro Git', author: 'Scott Chacon', isbn: '978-1484200773', number_code: 'IT-066', category: 'Tools', publisher: 'Apress', publication_year: 2014, pages: 456, description: 'Everything you need to know about Git.', book_copies: 5 },
  { title: 'Learning the vi and Vim Editors', author: 'Arnold Robbins', isbn: '978-0596529833', number_code: 'IT-067', category: 'Tools', publisher: 'O\'Reilly Media', publication_year: 2008, pages: 494, description: 'Power and agility beyond just text editing.', book_copies: 3 },
  { title: 'Practical Vim', author: 'Drew Neil', isbn: '978-1680501278', number_code: 'IT-068', category: 'Tools', publisher: 'Pragmatic Bookshelf', publication_year: 2015, pages: 354, description: 'Edit text at the speed of thought.', book_copies: 3 },
  { title: 'Visual Studio Code Distilled', author: 'Alessandro Del Sole', isbn: '978-1484242230', number_code: 'IT-069', category: 'Tools', publisher: 'Apress', publication_year: 2019, pages: 126, description: 'Evolved code editing meets IDE.', book_copies: 4 },
  { title: 'The Art of Command Line', author: 'Joshua Levy', isbn: '978-1098109974', number_code: 'IT-070', category: 'Tools', publisher: 'O\'Reilly Media', publication_year: 2022, pages: 200, description: 'Master the command line in one page.', book_copies: 4 },

  // Testing & Quality Assurance
  { title: 'Test Driven Development: By Example', author: 'Kent Beck', isbn: '978-0321146533', number_code: 'IT-071', category: 'Testing', publisher: 'Addison-Wesley', publication_year: 2002, pages: 240, description: 'The definitive guide to test-driven development.', book_copies: 4 },
  { title: 'The Art of Software Testing', author: 'Glenford J. Myers', isbn: '978-1118031964', number_code: 'IT-072', category: 'Testing', publisher: 'Wiley', publication_year: 2011, pages: 256, description: 'Fundamental testing concepts and techniques.', book_copies: 4 },
  { title: 'Continuous Delivery', author: 'Jez Humble', isbn: '978-0321601919', number_code: 'IT-073', category: 'DevOps', publisher: 'Addison-Wesley', publication_year: 2010, pages: 512, description: 'Reliable software releases through automation.', book_copies: 4 },
  { title: 'Growing Object-Oriented Software, Guided by Tests', author: 'Steve Freeman', isbn: '978-0321503626', number_code: 'IT-074', category: 'Testing', publisher: 'Addison-Wesley', publication_year: 2009, pages: 384, description: 'Using tests to guide software development.', book_copies: 3 },
  { title: 'Unit Testing Principles, Practices, and Patterns', author: 'Vladimir Khorikov', isbn: '978-1617296277', number_code: 'IT-075', category: 'Testing', publisher: 'Manning', publication_year: 2020, pages: 304, description: 'Effective testing practices for developers.', book_copies: 4 },

  // Data Science & Analytics
  { title: 'Python for Data Analysis', author: 'Wes McKinney', isbn: '978-1491957660', number_code: 'IT-076', category: 'Data Science', publisher: 'O\'Reilly Media', publication_year: 2017, pages: 550, description: 'Data wrangling with Pandas, NumPy, and IPython.', book_copies: 5 },
  { title: 'R for Data Science', author: 'Hadley Wickham', isbn: '978-1491910399', number_code: 'IT-077', category: 'Data Science', publisher: 'O\'Reilly Media', publication_year: 2017, pages: 522, description: 'Import, tidy, transform, visualize, and model data.', book_copies: 4 },
  { title: 'Data Science from Scratch', author: 'Joel Grus', isbn: '978-1492041139', number_code: 'IT-078', category: 'Data Science', publisher: 'O\'Reilly Media', publication_year: 2019, pages: 406, description: 'First principles with Python for data science.', book_copies: 4 },
  { title: 'Storytelling with Data', author: 'Cole Nussbaumer Knaflic', isbn: '978-1119002253', number_code: 'IT-079', category: 'Data Science', publisher: 'Wiley', publication_year: 2015, pages: 288, description: 'A data visualization guide for business professionals.', book_copies: 4 },
  { title: 'The Data Warehouse Toolkit', author: 'Ralph Kimball', isbn: '978-1118530801', number_code: 'IT-080', category: 'Data Science', publisher: 'Wiley', publication_year: 2013, pages: 600, description: 'The definitive guide to dimensional modeling.', book_copies: 3 },

  // Game Development
  { title: 'Game Programming Patterns', author: 'Robert Nystrom', isbn: '978-0990582908', number_code: 'IT-081', category: 'Game Development', publisher: 'Genever Benning', publication_year: 2014, pages: 354, description: 'Design patterns for game development.', book_copies: 4 },
  { title: 'Unity in Action', author: 'Joe Hocking', isbn: '978-1617299339', number_code: 'IT-082', category: 'Game Development', publisher: 'Manning', publication_year: 2022, pages: 400, description: 'Multiplatform game development with Unity.', book_copies: 4 },
  { title: 'Beginning C++ Through Game Programming', author: 'Michael Dawson', isbn: '978-1305109919', number_code: 'IT-083', category: 'Game Development', publisher: 'Cengage Learning', publication_year: 2014, pages: 432, description: 'Learn C++ through game programming concepts.', book_copies: 4 },
  { title: 'Real-Time Rendering', author: 'Tomas Akenine-Moller', isbn: '978-1138627000', number_code: 'IT-084', category: 'Game Development', publisher: 'CRC Press', publication_year: 2018, pages: 1198, description: 'Comprehensive guide to real-time 3D graphics.', book_copies: 3 },
  { title: 'Unreal Engine 4 Game Development Essentials', author: 'Satheesh PV', isbn: '978-1784391966', number_code: 'IT-085', category: 'Game Development', publisher: 'Packt Publishing', publication_year: 2016, pages: 244, description: 'Master Unreal Engine 4 game development.', book_copies: 3 },

  // Career & Soft Skills
  { title: 'The Complete Software Developer\'s Career Guide', author: 'John Sonmez', isbn: '978-0999081419', number_code: 'IT-086', category: 'Career', publisher: 'Simple Programmer', publication_year: 2017, pages: 798, description: 'Career advice for software developers.', book_copies: 4 },
  { title: 'Soft Skills: The Software Developer\'s Life Manual', author: 'John Sonmez', isbn: '978-1617292392', number_code: 'IT-087', category: 'Career', publisher: 'Manning', publication_year: 2014, pages: 504, description: 'Life advice for software developers.', book_copies: 4 },
  { title: 'The Mythical Man-Month', author: 'Frederick P. Brooks Jr.', isbn: '978-0201835953', number_code: 'IT-088', category: 'Software Engineering', publisher: 'Addison-Wesley', publication_year: 1995, pages: 336, description: 'Essays on software engineering and project management.', book_copies: 4 },
  { title: 'Peopleware: Productive Projects and Teams', author: 'Tom DeMarco', isbn: '978-0321934116', number_code: 'IT-089', category: 'Career', publisher: 'Addison-Wesley', publication_year: 2013, pages: 272, description: 'The human side of software development.', book_copies: 3 },
  { title: 'The Phoenix Project', author: 'Gene Kim', isbn: '978-1942788294', number_code: 'IT-090', category: 'DevOps', publisher: 'IT Revolution Press', publication_year: 2018, pages: 432, description: 'A novel about IT, DevOps, and helping your business win.', book_copies: 5 },

  // Blockchain & Emerging Tech
  { title: 'Mastering Bitcoin', author: 'Andreas M. Antonopoulos', isbn: '978-1491954386', number_code: 'IT-091', category: 'Blockchain', publisher: 'O\'Reilly Media', publication_year: 2017, pages: 416, description: 'Programming the open blockchain with Bitcoin.', book_copies: 3 },
  { title: 'Mastering Ethereum', author: 'Andreas M. Antonopoulos', isbn: '978-1491971949', number_code: 'IT-092', category: 'Blockchain', publisher: 'O\'Reilly Media', publication_year: 2018, pages: 424, description: 'Building smart contracts and DApps on Ethereum.', book_copies: 3 },
  { title: 'Blockchain Basics', author: 'Daniel Drescher', isbn: '978-1484226032', number_code: 'IT-093', category: 'Blockchain', publisher: 'Apress', publication_year: 2017, pages: 276, description: 'A non-technical introduction to blockchain.', book_copies: 4 },
  { title: 'The Internet of Things', author: 'Samuel Greengard', isbn: '978-0262527736', number_code: 'IT-094', category: 'IoT', publisher: 'MIT Press', publication_year: 2015, pages: 232, description: 'Understanding the connected world of IoT.', book_copies: 3 },
  { title: 'Building the Web of Things', author: 'Dominique Guinard', isbn: '978-1617292682', number_code: 'IT-095', category: 'IoT', publisher: 'Manning', publication_year: 2016, pages: 344, description: 'Connect smart things to the web.', book_copies: 3 },

  // Mathematics for CS
  { title: 'Discrete Mathematics and Its Applications', author: 'Kenneth H. Rosen', isbn: '978-0073383095', number_code: 'IT-096', category: 'Mathematics', publisher: 'McGraw-Hill', publication_year: 2018, pages: 1104, description: 'Foundations of discrete math for computer science.', book_copies: 5 },
  { title: 'Linear Algebra and Its Applications', author: 'David C. Lay', isbn: '978-0321982384', number_code: 'IT-097', category: 'Mathematics', publisher: 'Pearson', publication_year: 2015, pages: 576, description: 'Modern introduction to linear algebra.', book_copies: 4 },
  { title: 'Concrete Mathematics', author: 'Ronald L. Graham', isbn: '978-0201558029', number_code: 'IT-098', category: 'Mathematics', publisher: 'Addison-Wesley', publication_year: 1994, pages: 672, description: 'A foundation for computer science mathematics.', book_copies: 3 },
  { title: 'Statistics for Machine Learning', author: 'Pratap Dangeti', isbn: '978-1788295758', number_code: 'IT-099', category: 'Mathematics', publisher: 'Packt Publishing', publication_year: 2017, pages: 442, description: 'Statistical techniques for machine learning.', book_copies: 4 },
  { title: 'Mathematics for Computer Science', author: 'Eric Lehman', isbn: '978-1680921229', number_code: 'IT-100', category: 'Mathematics', publisher: 'Samurai Media', publication_year: 2017, pages: 988, description: 'Mathematical foundations for CS students.', book_copies: 4 }
];

async function replaceBooks() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });

    console.log('✓ Connected to database\n');

    // Disable foreign key checks temporarily
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✓ Disabled foreign key checks');

    // Delete related records first
    console.log('\nClearing related tables...');
    await connection.execute('DELETE FROM return_transactions');
    console.log('  - Cleared return_transactions');
    await connection.execute('DELETE FROM overdue_history');
    console.log('  - Cleared overdue_history');
    await connection.execute('DELETE FROM notification_logs');
    console.log('  - Cleared notification_logs');
    await connection.execute('DELETE FROM fines');
    console.log('  - Cleared fines');
    await connection.execute('DELETE FROM borrowing_transactions');
    console.log('  - Cleared borrowing_transactions');

    // Delete all existing books
    const [deleteResult] = await connection.execute('DELETE FROM books');
    console.log(`\n✓ Deleted ${deleteResult.affectedRows} existing books`);

    // Reset auto-increment
    await connection.execute('ALTER TABLE books AUTO_INCREMENT = 1');
    console.log('✓ Reset book ID counter');

    // Insert new IT books
    console.log(`\nInserting ${itBooks.length} IT/Computer books...`);

    const insertQuery = `
      INSERT INTO books (title, author, isbn, number_code, category, publisher, publication_year, pages, description, status, book_copies, available_copies)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?, ?)
    `;

    let inserted = 0;
    for (const book of itBooks) {
      await connection.execute(insertQuery, [
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
        book.book_copies
      ]);
      inserted++;
      if (inserted % 10 === 0) {
        process.stdout.write(`  Inserted ${inserted}/${itBooks.length} books...\r`);
      }
    }

    console.log(`\n✓ Successfully inserted ${inserted} IT books`);

    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✓ Re-enabled foreign key checks');

    // Show summary by category
    const [categories] = await connection.execute(`
      SELECT category, COUNT(*) as count, SUM(book_copies) as total_copies
      FROM books
      GROUP BY category
      ORDER BY count DESC
    `);

    console.log('\n================================');
    console.log('BOOKS BY CATEGORY');
    console.log('================================');
    console.table(categories);

    // Total count
    const [total] = await connection.execute('SELECT COUNT(*) as total_books, SUM(book_copies) as total_copies FROM books');
    console.log(`\nTotal: ${total[0].total_books} unique titles, ${total[0].total_copies} total copies`);

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✓ Database connection closed');
    }
  }
}

replaceBooks();
