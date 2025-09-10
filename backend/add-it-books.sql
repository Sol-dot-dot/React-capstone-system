-- Add IT Course Books to the Optimized Database
USE capstone_system_optimized;

-- Insert IT-related books
INSERT INTO books (title, author, isbn, number_code, category, publisher, publication_year, pages, description, status) VALUES

-- Programming Fundamentals
('Introduction to Programming with Python', 'John Smith', '978-0134444321', 'IT001', 'Programming', 'Pearson Education', 2023, 450, 'Comprehensive guide to Python programming for beginners. Covers variables, loops, functions, and object-oriented programming.', 'available'),

('Java: The Complete Reference', 'Herbert Schildt', '978-1260440249', 'IT002', 'Programming', 'McGraw-Hill', 2022, 1200, 'Complete guide to Java programming language. Includes Java 17 features, collections, multithreading, and GUI development.', 'available'),

('C++ Programming: From Problem Analysis to Program Design', 'D.S. Malik', '978-1337102087', 'IT003', 'Programming', 'Cengage Learning', 2023, 1400, 'Comprehensive C++ programming textbook covering data structures, algorithms, and object-oriented design principles.', 'available'),

('JavaScript: The Definitive Guide', 'David Flanagan', '978-1491952023', 'IT004', 'Web Development', 'O\'Reilly Media', 2022, 1096, 'Complete reference for JavaScript programming. Covers ES6+, DOM manipulation, and modern web development practices.', 'available'),

-- Web Development
('HTML and CSS: Design and Build Websites', 'Jon Duckett', '978-1118008188', 'IT005', 'Web Development', 'Wiley', 2021, 490, 'Beautifully designed guide to HTML5 and CSS3. Perfect for beginners learning web design and development.', 'available'),

('React: Up & Running', 'Stoyan Stefanov', '978-1491931820', 'IT006', 'Web Development', 'O\'Reilly Media', 2022, 300, 'Learn React.js from the ground up. Covers components, hooks, state management, and modern React patterns.', 'available'),

('Node.js in Action', 'Mike Cantelon', '978-1617290572', 'IT007', 'Web Development', 'Manning Publications', 2021, 400, 'Complete guide to server-side JavaScript with Node.js. Covers Express.js, databases, and deployment.', 'available'),

('Full-Stack Web Development with Vue.js and Node.js', 'Aneeta Sharma', '978-1788831147', 'IT008', 'Web Development', 'Packt Publishing', 2022, 350, 'Build complete web applications using Vue.js frontend and Node.js backend with MongoDB database.', 'available'),

-- Database Management
('Database System Concepts', 'Abraham Silberschatz', '978-0078022159', 'IT009', 'Database', 'McGraw-Hill', 2023, 1344, 'Comprehensive textbook on database systems. Covers relational databases, SQL, normalization, and transaction management.', 'available'),

('MySQL Cookbook', 'Paul DuBois', '978-1449374020', 'IT010', 'Database', 'O\'Reilly Media', 2022, 800, 'Practical solutions for MySQL database administration and development. Includes performance tuning and optimization.', 'available'),

('MongoDB: The Definitive Guide', 'Kristina Chodorow', '978-1491954461', 'IT011', 'Database', 'O\'Reilly Media', 2021, 400, 'Complete guide to MongoDB NoSQL database. Covers document design, indexing, and aggregation pipelines.', 'available'),

('SQL for Data Analysis', 'Cathy Tanimura', '978-1492088776', 'IT012', 'Database', 'O\'Reilly Media', 2022, 350, 'Advanced SQL techniques for data analysis and business intelligence. Includes window functions and complex queries.', 'available'),

-- Mobile Development
('Android Programming: The Big Nerd Ranch Guide', 'Bill Phillips', '978-0135245125', 'IT013', 'Mobile Development', 'Big Nerd Ranch', 2023, 600, 'Comprehensive guide to Android app development using Kotlin. Covers UI design, networking, and data persistence.', 'available'),

('iOS Programming: The Big Nerd Ranch Guide', 'Christian Keur', '978-0135264027', 'IT014', 'Mobile Development', 'Big Nerd Ranch', 2023, 700, 'Complete iOS app development guide using Swift and SwiftUI. Covers UIKit, Core Data, and app store deployment.', 'available'),

('React Native: Building Mobile Apps', 'Nader Dabit', '978-1492049043', 'IT015', 'Mobile Development', 'O\'Reilly Media', 2022, 400, 'Cross-platform mobile app development with React Native. Build iOS and Android apps with JavaScript.', 'available'),

('Flutter in Action', 'Eric Windmill', '978-1617296147', 'IT016', 'Mobile Development', 'Manning Publications', 2021, 350, 'Learn Flutter framework for building beautiful mobile apps. Covers Dart language and widget development.', 'available'),

-- Cybersecurity
('Cybersecurity Essentials', 'Charles J. Brooks', '978-1119362395', 'IT017', 'Cybersecurity', 'Wiley', 2022, 500, 'Fundamental concepts of cybersecurity including threats, vulnerabilities, and defense strategies.', 'available'),

('Network Security Essentials', 'William Stallings', '978-0134527336', 'IT018', 'Cybersecurity', 'Pearson', 2023, 600, 'Comprehensive guide to network security protocols, encryption, and secure communication.', 'available'),

('Ethical Hacking: A Hands-On Introduction', 'Daniel G. Graham', '978-1718501874', 'IT019', 'Cybersecurity', 'No Starch Press', 2022, 400, 'Learn ethical hacking techniques and penetration testing methodologies in a legal and ethical framework.', 'available'),

('Applied Cryptography', 'Bruce Schneier', '978-1119096726', 'IT020', 'Cybersecurity', 'Wiley', 2021, 800, 'Classic text on cryptographic algorithms and their practical applications in computer security.', 'available'),

-- Cloud Computing
('AWS Certified Solutions Architect Study Guide', 'Ben Piper', '978-1119504645', 'IT021', 'Cloud Computing', 'Wiley', 2023, 600, 'Complete study guide for AWS Solutions Architect certification. Covers EC2, S3, RDS, and cloud architecture patterns.', 'available'),

('Microsoft Azure Fundamentals', 'Timothy L. Warner', '978-1119689809', 'IT022', 'Cloud Computing', 'Wiley', 2022, 400, 'Introduction to Microsoft Azure cloud platform. Covers virtual machines, storage, and cloud services.', 'available'),

('Google Cloud Platform in Action', 'JJ Geewax', '978-1617293528', 'IT023', 'Cloud Computing', 'Manning Publications', 2021, 500, 'Comprehensive guide to Google Cloud Platform services and deployment strategies.', 'available'),

('Docker in Action', 'Jeff Nickoloff', '978-1617294761', 'IT024', 'Cloud Computing', 'Manning Publications', 2022, 350, 'Learn containerization with Docker. Covers container orchestration and microservices architecture.', 'available'),

-- Data Science & AI
('Python for Data Analysis', 'Wes McKinney', '978-1098104030', 'IT025', 'Data Science', 'O\'Reilly Media', 2023, 550, 'Data manipulation and analysis with Python using pandas, NumPy, and matplotlib libraries.', 'available'),

('Hands-On Machine Learning', 'Aurélien Géron', '978-1492032649', 'IT026', 'Machine Learning', 'O\'Reilly Media', 2022, 800, 'Practical machine learning with Scikit-Learn, Keras, and TensorFlow. Covers supervised and unsupervised learning.', 'available'),

('Deep Learning', 'Ian Goodfellow', '978-0262035613', 'IT027', 'Machine Learning', 'MIT Press', 2021, 800, 'Comprehensive textbook on deep learning algorithms and neural network architectures.', 'available'),

('Artificial Intelligence: A Modern Approach', 'Stuart Russell', '978-0134610993', 'IT028', 'Artificial Intelligence', 'Pearson', 2023, 1100, 'Classic AI textbook covering search algorithms, knowledge representation, and machine learning.', 'available'),

-- Software Engineering
('Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '978-0132350884', 'IT029', 'Software Engineering', 'Prentice Hall', 2021, 400, 'Best practices for writing clean, maintainable code. Essential reading for professional developers.', 'available'),

('Design Patterns: Elements of Reusable Object-Oriented Software', 'Gang of Four', '978-0201633610', 'IT030', 'Software Engineering', 'Addison-Wesley', 2022, 400, 'Classic book on software design patterns. Covers creational, structural, and behavioral patterns.', 'available'),

('The Pragmatic Programmer', 'David Thomas', '978-0135957059', 'IT031', 'Software Engineering', 'Addison-Wesley', 2020, 350, 'Practical advice for becoming a more effective programmer. Covers career development and best practices.', 'available'),

('Refactoring: Improving the Design of Existing Code', 'Martin Fowler', '978-0134757599', 'IT032', 'Software Engineering', 'Addison-Wesley', 2021, 450, 'Techniques for improving code quality through systematic refactoring methods.', 'available'),

-- Networking
('Computer Networks', 'Andrew S. Tanenbaum', '978-0132126953', 'IT033', 'Networking', 'Pearson', 2023, 1000, 'Comprehensive textbook on computer networking principles, protocols, and technologies.', 'available'),

('TCP/IP Illustrated', 'W. Richard Stevens', '978-0321336315', 'IT034', 'Networking', 'Addison-Wesley', 2022, 800, 'Detailed explanation of TCP/IP protocol suite with practical examples and implementations.', 'available'),

('Network+ Guide to Networks', 'Jill West', '978-0357123382', 'IT035', 'Networking', 'Cengage Learning', 2023, 700, 'CompTIA Network+ certification study guide covering network fundamentals and troubleshooting.', 'available'),

-- System Administration
('Linux Administration Handbook', 'Evi Nemeth', '978-0134277554', 'IT036', 'System Administration', 'Addison-Wesley', 2022, 1200, 'Complete guide to Linux system administration. Covers Red Hat, Ubuntu, and other distributions.', 'available'),

('Windows Server 2022 Administration', 'William Panek', '978-1119789850', 'IT037', 'System Administration', 'Wiley', 2023, 600, 'Comprehensive guide to Windows Server 2022 administration and configuration.', 'available'),

('Docker and Kubernetes for System Administrators', 'Bret Fisher', '978-1492040760', 'IT038', 'System Administration', 'O\'Reilly Media', 2022, 400, 'Container orchestration and management for system administrators using Docker and Kubernetes.', 'available'),

-- DevOps
('The DevOps Handbook', 'Gene Kim', '978-1942788003', 'IT039', 'DevOps', 'IT Revolution Press', 2021, 500, 'How to create world-class agility, reliability, and security in technology organizations.', 'available'),

('Continuous Delivery', 'Jez Humble', '978-0321601919', 'IT040', 'DevOps', 'Addison-Wesley', 2022, 400, 'Reliable software releases through build, test, and deployment automation.', 'available'),

('Infrastructure as Code', 'Kief Morris', '978-1491924358', 'IT041', 'DevOps', 'O\'Reilly Media', 2021, 350, 'Managing and provisioning infrastructure through code and automation tools.', 'available'),

-- Game Development
('Unity in Action', 'Joe Hocking', '978-1617294969', 'IT042', 'Game Development', 'Manning Publications', 2022, 400, 'Learn Unity game development with C#. Covers 2D and 3D game creation.', 'available'),

('Game Programming Patterns', 'Robert Nystrom', '978-0990582908', 'IT043', 'Game Development', 'Genever Benning', 2021, 300, 'Programming patterns specific to game development. Covers architecture and performance optimization.', 'available'),

-- Blockchain
('Mastering Bitcoin', 'Andreas M. Antonopoulos', '978-1491954386', 'IT044', 'Blockchain', 'O\'Reilly Media', 2022, 400, 'Technical guide to Bitcoin and cryptocurrency technologies.', 'available'),

('Blockchain Basics', 'Daniel Drescher', '978-1484226032', 'IT045', 'Blockchain', 'Apress', 2021, 250, 'Non-technical introduction to blockchain technology and its applications.', 'available'),

-- IT Project Management
('IT Project Management', 'Kathy Schwalbe', '978-1337406521', 'IT046', 'Project Management', 'Cengage Learning', 2023, 600, 'Comprehensive guide to managing IT projects using PMI standards and best practices.', 'available'),

('Agile Project Management', 'Jim Highsmith', '978-0321658395', 'IT047', 'Project Management', 'Addison-Wesley', 2022, 400, 'Agile methodologies for software development projects and team management.', 'available'),

-- IT Ethics and Law
('Ethics in Information Technology', 'George Reynolds', '978-1337405876', 'IT048', 'IT Ethics', 'Cengage Learning', 2023, 400, 'Ethical issues in information technology including privacy, security, and intellectual property.', 'available'),

('Cyber Law and Ethics', 'Mark Grabowski', '978-1138334663', 'IT049', 'IT Law', 'Routledge', 2022, 350, 'Legal and ethical aspects of cyberspace, digital rights, and online behavior.', 'available'),

-- Emerging Technologies
('Internet of Things (IoT) Fundamentals', 'David Hanes', '978-1587144561', 'IT050', 'IoT', 'Cisco Press', 2022, 500, 'Introduction to IoT technologies, protocols, and implementation strategies.', 'available'),

('Augmented Reality Development', 'Jonathan Linowes', '978-1484238844', 'IT051', 'AR/VR', 'Apress', 2021, 300, 'Building augmented reality applications using Unity and AR Foundation.', 'available');

-- Show the inserted books
SELECT 
    number_code,
    title,
    author,
    category,
    status
FROM books 
WHERE category IN ('Programming', 'Web Development', 'Database', 'Mobile Development', 'Cybersecurity', 'Cloud Computing', 'Data Science', 'Machine Learning', 'Artificial Intelligence', 'Software Engineering', 'Networking', 'System Administration', 'DevOps', 'Game Development', 'Blockchain', 'Project Management', 'IT Ethics', 'IT Law', 'IoT', 'AR/VR')
ORDER BY category, number_code;
