/**
 * Add 100 More IT/Computer-Related Books
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

const moreItBooks = [
  // Advanced Programming
  { title: 'Structure and Interpretation of Computer Programs', author: 'Harold Abelson', isbn: '978-0262510875', number_code: 'IT-101', category: 'Programming', publisher: 'MIT Press', publication_year: 1996, pages: 657, description: 'Classic text on computer science fundamentals using Scheme.', book_copies: 4 },
  { title: 'Programming Pearls', author: 'Jon Bentley', isbn: '978-0201657883', number_code: 'IT-102', category: 'Programming', publisher: 'Addison-Wesley', publication_year: 1999, pages: 256, description: 'A collection of essays on programming problems and solutions.', book_copies: 4 },
  { title: 'The C++ Programming Language', author: 'Bjarne Stroustrup', isbn: '978-0321958327', number_code: 'IT-103', category: 'Programming', publisher: 'Addison-Wesley', publication_year: 2013, pages: 1376, description: 'The definitive guide to C++ by its creator.', book_copies: 4 },
  { title: 'Effective Modern C++', author: 'Scott Meyers', isbn: '978-1491903995', number_code: 'IT-104', category: 'Programming', publisher: 'O\'Reilly Media', publication_year: 2014, pages: 334, description: '42 specific ways to improve your use of C++11 and C++14.', book_copies: 4 },
  { title: 'Go Programming Language', author: 'Alan A. A. Donovan', isbn: '978-0134190440', number_code: 'IT-105', category: 'Programming', publisher: 'Addison-Wesley', publication_year: 2015, pages: 400, description: 'Authoritative guide to the Go programming language.', book_copies: 5 },
  { title: 'Rust Programming Language', author: 'Steve Klabnik', isbn: '978-1718500440', number_code: 'IT-106', category: 'Programming', publisher: 'No Starch Press', publication_year: 2019, pages: 560, description: 'The official book on Rust programming.', book_copies: 5 },
  { title: 'Programming in Scala', author: 'Martin Odersky', isbn: '978-0981531687', number_code: 'IT-107', category: 'Programming', publisher: 'Artima', publication_year: 2021, pages: 892, description: 'Comprehensive guide to Scala programming.', book_copies: 3 },
  { title: 'Functional Programming in Scala', author: 'Paul Chiusano', isbn: '978-1617290657', number_code: 'IT-108', category: 'Programming', publisher: 'Manning', publication_year: 2014, pages: 320, description: 'Learn functional programming with Scala.', book_copies: 3 },
  { title: 'TypeScript Quickly', author: 'Yakov Fain', isbn: '978-1617295942', number_code: 'IT-109', category: 'Programming', publisher: 'Manning', publication_year: 2020, pages: 488, description: 'Practical guide to TypeScript development.', book_copies: 5 },
  { title: 'Fluent Python', author: 'Luciano Ramalho', isbn: '978-1492056355', number_code: 'IT-110', category: 'Programming', publisher: 'O\'Reilly Media', publication_year: 2022, pages: 1014, description: 'Clear, concise, and effective programming in Python.', book_copies: 5 },

  // More Web Development
  { title: 'Fullstack React', author: 'Anthony Accomazzo', isbn: '978-0991344628', number_code: 'IT-111', category: 'Web Development', publisher: 'Fullstack.io', publication_year: 2019, pages: 836, description: 'The complete guide to ReactJS and friends.', book_copies: 5 },
  { title: 'Next.js in Action', author: 'Adam Boduch', isbn: '978-1617299193', number_code: 'IT-112', category: 'Web Development', publisher: 'Manning', publication_year: 2023, pages: 352, description: 'Build server-rendered React applications with Next.js.', book_copies: 5 },
  { title: 'Svelte and Sapper in Action', author: 'Mark Volkmann', isbn: '978-1617297946', number_code: 'IT-113', category: 'Web Development', publisher: 'Manning', publication_year: 2020, pages: 456, description: 'Build fast web applications with Svelte.', book_copies: 4 },
  { title: 'GraphQL in Action', author: 'Samer Buna', isbn: '978-1617295683', number_code: 'IT-114', category: 'Web Development', publisher: 'Manning', publication_year: 2021, pages: 384, description: 'Build data-driven applications with GraphQL.', book_copies: 4 },
  { title: 'Django for Professionals', author: 'William S. Vincent', isbn: '978-1735467238', number_code: 'IT-115', category: 'Web Development', publisher: 'WelcomeToCode', publication_year: 2022, pages: 380, description: 'Production websites with Python and Django.', book_copies: 4 },
  { title: 'Flask Web Development', author: 'Miguel Grinberg', isbn: '978-1491991732', number_code: 'IT-116', category: 'Web Development', publisher: 'O\'Reilly Media', publication_year: 2018, pages: 316, description: 'Developing web applications with Python and Flask.', book_copies: 4 },
  { title: 'Spring Boot in Action', author: 'Craig Walls', isbn: '978-1617292545', number_code: 'IT-117', category: 'Web Development', publisher: 'Manning', publication_year: 2015, pages: 264, description: 'Build Spring applications faster with Spring Boot.', book_copies: 4 },
  { title: 'ASP.NET Core in Action', author: 'Andrew Lock', isbn: '978-1617298301', number_code: 'IT-118', category: 'Web Development', publisher: 'Manning', publication_year: 2021, pages: 832, description: 'Build web applications with ASP.NET Core.', book_copies: 4 },
  { title: 'Ruby on Rails Tutorial', author: 'Michael Hartl', isbn: '978-0134598628', number_code: 'IT-119', category: 'Web Development', publisher: 'Addison-Wesley', publication_year: 2020, pages: 816, description: 'Learn web development with Rails.', book_copies: 4 },
  { title: 'Laravel: Up & Running', author: 'Matt Stauffer', isbn: '978-1492041214', number_code: 'IT-120', category: 'Web Development', publisher: 'O\'Reilly Media', publication_year: 2019, pages: 558, description: 'A framework for building modern PHP apps.', book_copies: 4 },

  // More AI/ML
  { title: 'Pattern Recognition and Machine Learning', author: 'Christopher M. Bishop', isbn: '978-0387310732', number_code: 'IT-121', category: 'Machine Learning', publisher: 'Springer', publication_year: 2006, pages: 738, description: 'Comprehensive introduction to pattern recognition and ML.', book_copies: 4 },
  { title: 'Machine Learning: A Probabilistic Perspective', author: 'Kevin P. Murphy', isbn: '978-0262018029', number_code: 'IT-122', category: 'Machine Learning', publisher: 'MIT Press', publication_year: 2012, pages: 1104, description: 'Unified, probabilistic approach to machine learning.', book_copies: 3 },
  { title: 'Reinforcement Learning: An Introduction', author: 'Richard S. Sutton', isbn: '978-0262039246', number_code: 'IT-123', category: 'Machine Learning', publisher: 'MIT Press', publication_year: 2018, pages: 552, description: 'The definitive introduction to reinforcement learning.', book_copies: 4 },
  { title: 'Deep Learning with Python', author: 'Francois Chollet', isbn: '978-1617296864', number_code: 'IT-124', category: 'Machine Learning', publisher: 'Manning', publication_year: 2021, pages: 504, description: 'Deep learning with Keras by its creator.', book_copies: 5 },
  { title: 'Generative Deep Learning', author: 'David Foster', isbn: '978-1492041948', number_code: 'IT-125', category: 'Machine Learning', publisher: 'O\'Reilly Media', publication_year: 2019, pages: 330, description: 'Teaching machines to paint, write, compose, and play.', book_copies: 4 },
  { title: 'Building Machine Learning Powered Applications', author: 'Emmanuel Ameisen', isbn: '978-1492045113', number_code: 'IT-126', category: 'Machine Learning', publisher: 'O\'Reilly Media', publication_year: 2020, pages: 260, description: 'Going from idea to product with ML applications.', book_copies: 4 },
  { title: 'Practical Deep Learning for Cloud, Mobile, and Edge', author: 'Anirudh Koul', isbn: '978-1492034865', number_code: 'IT-127', category: 'Machine Learning', publisher: 'O\'Reilly Media', publication_year: 2019, pages: 620, description: 'Real-world AI and computer vision projects.', book_copies: 4 },
  { title: 'TinyML', author: 'Pete Warden', isbn: '978-1492052043', number_code: 'IT-128', category: 'Machine Learning', publisher: 'O\'Reilly Media', publication_year: 2019, pages: 504, description: 'Machine learning with TensorFlow Lite on microcontrollers.', book_copies: 3 },
  { title: 'Transformers for Natural Language Processing', author: 'Denis Rothman', isbn: '978-1803247335', number_code: 'IT-129', category: 'Machine Learning', publisher: 'Packt Publishing', publication_year: 2022, pages: 564, description: 'Build and deploy transformer models for NLP.', book_copies: 4 },
  { title: 'Computer Vision: Algorithms and Applications', author: 'Richard Szeliski', isbn: '978-3030343712', number_code: 'IT-130', category: 'Artificial Intelligence', publisher: 'Springer', publication_year: 2022, pages: 925, description: 'Comprehensive guide to computer vision algorithms.', book_copies: 3 },

  // More Cloud & Infrastructure
  { title: 'Cloud Native Patterns', author: 'Cornelia Davis', isbn: '978-1617294297', number_code: 'IT-131', category: 'Cloud Computing', publisher: 'Manning', publication_year: 2019, pages: 400, description: 'Designing change-tolerant software for cloud applications.', book_copies: 4 },
  { title: 'Terraform: Up & Running', author: 'Yevgeniy Brikman', isbn: '978-1492046905', number_code: 'IT-132', category: 'DevOps', publisher: 'O\'Reilly Media', publication_year: 2022, pages: 458, description: 'Writing infrastructure as code with Terraform.', book_copies: 5 },
  { title: 'Ansible: Up and Running', author: 'Bas Meijer', isbn: '978-1098109158', number_code: 'IT-133', category: 'DevOps', publisher: 'O\'Reilly Media', publication_year: 2022, pages: 524, description: 'Automating configuration management with Ansible.', book_copies: 4 },
  { title: 'Google Cloud Platform in Action', author: 'JJ Geewax', isbn: '978-1617293528', number_code: 'IT-134', category: 'Cloud Computing', publisher: 'Manning', publication_year: 2018, pages: 632, description: 'Build applications on Google Cloud Platform.', book_copies: 4 },
  { title: 'Azure in Action', author: 'Chris Hay', isbn: '978-1617295997', number_code: 'IT-135', category: 'Cloud Computing', publisher: 'Manning', publication_year: 2021, pages: 472, description: 'Build and manage cloud applications on Azure.', book_copies: 4 },
  { title: 'Prometheus: Up & Running', author: 'Brian Brazil', isbn: '978-1492034148', number_code: 'IT-136', category: 'DevOps', publisher: 'O\'Reilly Media', publication_year: 2018, pages: 372, description: 'Infrastructure and application performance monitoring.', book_copies: 3 },
  { title: 'Istio in Action', author: 'Christian E. Posta', isbn: '978-1617295829', number_code: 'IT-137', category: 'DevOps', publisher: 'Manning', publication_year: 2022, pages: 480, description: 'Service mesh for microservices with Istio.', book_copies: 3 },
  { title: 'Cloud Native DevOps with Kubernetes', author: 'John Arundel', isbn: '978-1492040767', number_code: 'IT-138', category: 'DevOps', publisher: 'O\'Reilly Media', publication_year: 2019, pages: 346, description: 'Building, deploying, and scaling modern applications.', book_copies: 4 },
  { title: 'Learning Helm', author: 'Matt Butcher', isbn: '978-1492083658', number_code: 'IT-139', category: 'DevOps', publisher: 'O\'Reilly Media', publication_year: 2021, pages: 262, description: 'Managing apps on Kubernetes with Helm.', book_copies: 4 },
  { title: 'GitOps and Kubernetes', author: 'Billy Yuen', isbn: '978-1617297274', number_code: 'IT-140', category: 'DevOps', publisher: 'Manning', publication_year: 2021, pages: 280, description: 'Continuous deployment with Argo CD, Jenkins X, and Flux.', book_copies: 4 },

  // More Security
  { title: 'Serious Cryptography', author: 'Jean-Philippe Aumasson', isbn: '978-1593278267', number_code: 'IT-141', category: 'Cybersecurity', publisher: 'No Starch Press', publication_year: 2017, pages: 312, description: 'A practical introduction to modern encryption.', book_copies: 4 },
  { title: 'Black Hat Python', author: 'Justin Seitz', isbn: '978-1718501126', number_code: 'IT-142', category: 'Cybersecurity', publisher: 'No Starch Press', publication_year: 2021, pages: 216, description: 'Python programming for hackers and pentesters.', book_copies: 4 },
  { title: 'Bug Bounty Bootcamp', author: 'Vickie Li', isbn: '978-1718501546', number_code: 'IT-143', category: 'Cybersecurity', publisher: 'No Starch Press', publication_year: 2021, pages: 416, description: 'The guide to finding and reporting web vulnerabilities.', book_copies: 4 },
  { title: 'Penetration Testing', author: 'Georgia Weidman', isbn: '978-1593275648', number_code: 'IT-144', category: 'Cybersecurity', publisher: 'No Starch Press', publication_year: 2014, pages: 528, description: 'A hands-on introduction to hacking.', book_copies: 4 },
  { title: 'The Tangled Web', author: 'Michal Zalewski', isbn: '978-1593273880', number_code: 'IT-145', category: 'Cybersecurity', publisher: 'No Starch Press', publication_year: 2011, pages: 320, description: 'A guide to securing modern web applications.', book_copies: 3 },
  { title: 'Real-World Cryptography', author: 'David Wong', isbn: '978-1617296710', number_code: 'IT-146', category: 'Cybersecurity', publisher: 'Manning', publication_year: 2021, pages: 400, description: 'Applied cryptography for developers.', book_copies: 4 },
  { title: 'Designing Secure Software', author: 'Loren Kohnfelder', isbn: '978-1718501928', number_code: 'IT-147', category: 'Cybersecurity', publisher: 'No Starch Press', publication_year: 2021, pages: 312, description: 'A guide for developers to build secure software.', book_copies: 4 },
  { title: 'Threat Modeling', author: 'Adam Shostack', isbn: '978-1118809990', number_code: 'IT-148', category: 'Cybersecurity', publisher: 'Wiley', publication_year: 2014, pages: 624, description: 'Designing for security in software systems.', book_copies: 3 },
  { title: 'Blue Team Handbook', author: 'Don Murdoch', isbn: '978-1726273985', number_code: 'IT-149', category: 'Cybersecurity', publisher: 'Independently Published', publication_year: 2018, pages: 254, description: 'Incident response edition for security defenders.', book_copies: 3 },
  { title: 'Attacking Network Protocols', author: 'James Forshaw', isbn: '978-1593277505', number_code: 'IT-150', category: 'Cybersecurity', publisher: 'No Starch Press', publication_year: 2017, pages: 408, description: 'A hacker\'s guide to capture, analysis, and exploitation.', book_copies: 3 },

  // System Design & Architecture
  { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', isbn: '978-1449373320', number_code: 'IT-151', category: 'Software Engineering', publisher: 'O\'Reilly Media', publication_year: 2017, pages: 616, description: 'The big ideas behind reliable, scalable systems.', book_copies: 6 },
  { title: 'System Design Interview', author: 'Alex Xu', isbn: '978-1736049112', number_code: 'IT-152', category: 'Software Engineering', publisher: 'Byte Code LLC', publication_year: 2020, pages: 320, description: 'An insider\'s guide to system design interviews.', book_copies: 6 },
  { title: 'System Design Interview Volume 2', author: 'Alex Xu', isbn: '978-1736049129', number_code: 'IT-153', category: 'Software Engineering', publisher: 'Byte Code LLC', publication_year: 2022, pages: 424, description: 'Advanced system design interview questions.', book_copies: 5 },
  { title: 'Building Microservices', author: 'Sam Newman', isbn: '978-1492034025', number_code: 'IT-154', category: 'Software Engineering', publisher: 'O\'Reilly Media', publication_year: 2021, pages: 616, description: 'Designing fine-grained systems.', book_copies: 5 },
  { title: 'Microservices Patterns', author: 'Chris Richardson', isbn: '978-1617294549', number_code: 'IT-155', category: 'Software Engineering', publisher: 'Manning', publication_year: 2018, pages: 520, description: 'With examples in Java for microservices architecture.', book_copies: 4 },
  { title: 'Release It!', author: 'Michael T. Nygard', isbn: '978-1680502398', number_code: 'IT-156', category: 'Software Engineering', publisher: 'Pragmatic Bookshelf', publication_year: 2018, pages: 376, description: 'Design and deploy production-ready software.', book_copies: 4 },
  { title: 'Software Architecture: The Hard Parts', author: 'Neal Ford', isbn: '978-1492086895', number_code: 'IT-157', category: 'Software Engineering', publisher: 'O\'Reilly Media', publication_year: 2021, pages: 459, description: 'Modern trade-off analyses for distributed architectures.', book_copies: 4 },
  { title: 'Fundamentals of Software Architecture', author: 'Mark Richards', isbn: '978-1492043454', number_code: 'IT-158', category: 'Software Engineering', publisher: 'O\'Reilly Media', publication_year: 2020, pages: 422, description: 'An engineering approach to software architecture.', book_copies: 5 },
  { title: 'Clean Architecture', author: 'Robert C. Martin', isbn: '978-0134494166', number_code: 'IT-159', category: 'Software Engineering', publisher: 'Prentice Hall', publication_year: 2017, pages: 432, description: 'A craftsman\'s guide to software structure and design.', book_copies: 5 },
  { title: 'Patterns of Enterprise Application Architecture', author: 'Martin Fowler', isbn: '978-0321127426', number_code: 'IT-160', category: 'Software Engineering', publisher: 'Addison-Wesley', publication_year: 2002, pages: 560, description: 'Classic patterns for enterprise applications.', book_copies: 4 },

  // More Mobile
  { title: 'SwiftUI by Tutorials', author: 'raywenderlich Team', isbn: '978-1950325542', number_code: 'IT-161', category: 'Mobile Development', publisher: 'Razeware LLC', publication_year: 2022, pages: 450, description: 'Declarative app development for iOS with SwiftUI.', book_copies: 4 },
  { title: 'Jetpack Compose by Tutorials', author: 'raywenderlich Team', isbn: '978-1950325603', number_code: 'IT-162', category: 'Mobile Development', publisher: 'Razeware LLC', publication_year: 2022, pages: 424, description: 'Building Android UI with Jetpack Compose.', book_copies: 4 },
  { title: 'Flutter Complete Reference', author: 'Alberto Miola', isbn: '978-8894601817', number_code: 'IT-163', category: 'Mobile Development', publisher: 'Independently Published', publication_year: 2021, pages: 782, description: 'Complete guide to Flutter development.', book_copies: 4 },
  { title: 'React Native for Mobile Development', author: 'Akshat Paul', isbn: '978-1484244531', number_code: 'IT-164', category: 'Mobile Development', publisher: 'Apress', publication_year: 2019, pages: 274, description: 'Harness the power of React Native.', book_copies: 4 },
  { title: 'iOS Programming Fundamentals with Swift', author: 'Matt Neuburg', isbn: '978-1492092094', number_code: 'IT-165', category: 'Mobile Development', publisher: 'O\'Reilly Media', publication_year: 2021, pages: 648, description: 'Swift, Xcode, and Cocoa basics.', book_copies: 4 },

  // More Database & Data Engineering
  { title: 'Redis in Action', author: 'Josiah L. Carlson', isbn: '978-1617290855', number_code: 'IT-166', category: 'Database', publisher: 'Manning', publication_year: 2013, pages: 320, description: 'Build scalable applications with Redis.', book_copies: 4 },
  { title: 'Elasticsearch in Action', author: 'Radu Gheorghe', isbn: '978-1617299858', number_code: 'IT-167', category: 'Database', publisher: 'Manning', publication_year: 2023, pages: 480, description: 'Build search and analytics applications with Elasticsearch.', book_copies: 4 },
  { title: 'Cassandra: The Definitive Guide', author: 'Jeff Carpenter', isbn: '978-1492097143', number_code: 'IT-168', category: 'Database', publisher: 'O\'Reilly Media', publication_year: 2022, pages: 410, description: 'Distributed data at web scale with Cassandra.', book_copies: 3 },
  { title: 'Streaming Systems', author: 'Tyler Akidau', isbn: '978-1491983874', number_code: 'IT-169', category: 'Data Engineering', publisher: 'O\'Reilly Media', publication_year: 2018, pages: 378, description: 'The what, where, when, and how of large-scale data processing.', book_copies: 4 },
  { title: 'Kafka: The Definitive Guide', author: 'Neha Narkhede', isbn: '978-1492043089', number_code: 'IT-170', category: 'Data Engineering', publisher: 'O\'Reilly Media', publication_year: 2021, pages: 488, description: 'Real-time data and stream processing at scale.', book_copies: 5 },
  { title: 'Spark: The Definitive Guide', author: 'Bill Chambers', isbn: '978-1491912218', number_code: 'IT-171', category: 'Data Engineering', publisher: 'O\'Reilly Media', publication_year: 2018, pages: 602, description: 'Big data processing made simple with Spark.', book_copies: 4 },
  { title: 'Designing Event-Driven Systems', author: 'Ben Stopford', isbn: '978-1492038221', number_code: 'IT-172', category: 'Data Engineering', publisher: 'O\'Reilly Media', publication_year: 2018, pages: 172, description: 'Concepts and patterns for streaming services with Kafka.', book_copies: 4 },
  { title: 'Fundamentals of Data Engineering', author: 'Joe Reis', isbn: '978-1098108304', number_code: 'IT-173', category: 'Data Engineering', publisher: 'O\'Reilly Media', publication_year: 2022, pages: 452, description: 'Plan and build robust data systems.', book_copies: 5 },
  { title: 'Data Pipelines Pocket Reference', author: 'James Densmore', isbn: '978-1492087830', number_code: 'IT-174', category: 'Data Engineering', publisher: 'O\'Reilly Media', publication_year: 2021, pages: 276, description: 'Moving and processing data for analytics.', book_copies: 4 },
  { title: 'Graph Databases', author: 'Ian Robinson', isbn: '978-1491930892', number_code: 'IT-175', category: 'Database', publisher: 'O\'Reilly Media', publication_year: 2015, pages: 238, description: 'New opportunities for connected data.', book_copies: 3 },

  // More Testing & QA
  { title: 'Software Testing: A Craftsman\'s Approach', author: 'Paul C. Jorgensen', isbn: '978-0367358495', number_code: 'IT-176', category: 'Testing', publisher: 'CRC Press', publication_year: 2021, pages: 494, description: 'Comprehensive guide to software testing.', book_copies: 4 },
  { title: 'Exploratory Software Testing', author: 'James A. Whittaker', isbn: '978-0321636416', number_code: 'IT-177', category: 'Testing', publisher: 'Addison-Wesley', publication_year: 2009, pages: 256, description: 'Tips, tricks, tours, and techniques.', book_copies: 3 },
  { title: 'BDD in Action', author: 'John Ferguson Smart', isbn: '978-1617291654', number_code: 'IT-178', category: 'Testing', publisher: 'Manning', publication_year: 2014, pages: 384, description: 'Behavior-driven development for the whole team.', book_copies: 4 },
  { title: 'Agile Testing', author: 'Lisa Crispin', isbn: '978-0321534460', number_code: 'IT-179', category: 'Testing', publisher: 'Addison-Wesley', publication_year: 2008, pages: 576, description: 'A practical guide for testers and agile teams.', book_copies: 4 },
  { title: 'Testing JavaScript Applications', author: 'Lucas da Costa', isbn: '978-1617297915', number_code: 'IT-180', category: 'Testing', publisher: 'Manning', publication_year: 2021, pages: 512, description: 'Building reliable JavaScript applications with testing.', book_copies: 4 },

  // Compilers & Languages
  { title: 'Compilers: Principles, Techniques, and Tools', author: 'Alfred V. Aho', isbn: '978-0321486813', number_code: 'IT-181', category: 'Computer Science', publisher: 'Pearson', publication_year: 2006, pages: 1000, description: 'The dragon book on compiler construction.', book_copies: 3 },
  { title: 'Crafting Interpreters', author: 'Robert Nystrom', isbn: '978-0990582939', number_code: 'IT-182', category: 'Computer Science', publisher: 'Genever Benning', publication_year: 2021, pages: 640, description: 'A handbook for making programming languages.', book_copies: 4 },
  { title: 'Writing An Interpreter In Go', author: 'Thorsten Ball', isbn: '978-3982016115', number_code: 'IT-183', category: 'Computer Science', publisher: 'Independently Published', publication_year: 2018, pages: 286, description: 'Build your own interpreter in Go.', book_copies: 3 },
  { title: 'Engineering a Compiler', author: 'Keith D. Cooper', isbn: '978-0128154120', number_code: 'IT-184', category: 'Computer Science', publisher: 'Morgan Kaufmann', publication_year: 2022, pages: 824, description: 'Modern compiler construction techniques.', book_copies: 3 },
  { title: 'Types and Programming Languages', author: 'Benjamin C. Pierce', isbn: '978-0262162098', number_code: 'IT-185', category: 'Computer Science', publisher: 'MIT Press', publication_year: 2002, pages: 648, description: 'Foundation of type systems in programming.', book_copies: 3 },

  // Networking & Protocols
  { title: 'Network Warrior', author: 'Gary A. Donahue', isbn: '978-1449387860', number_code: 'IT-186', category: 'Networking', publisher: 'O\'Reilly Media', publication_year: 2011, pages: 788, description: 'Everything you need to know about network infrastructure.', book_copies: 4 },
  { title: 'HTTP: The Definitive Guide', author: 'David Gourley', isbn: '978-1565925090', number_code: 'IT-187', category: 'Networking', publisher: 'O\'Reilly Media', publication_year: 2002, pages: 658, description: 'Complete reference for HTTP protocol.', book_copies: 3 },
  { title: 'High Performance Browser Networking', author: 'Ilya Grigorik', isbn: '978-1449344764', number_code: 'IT-188', category: 'Networking', publisher: 'O\'Reilly Media', publication_year: 2013, pages: 400, description: 'What every web developer should know about networking.', book_copies: 4 },
  { title: 'DNS and BIND', author: 'Cricket Liu', isbn: '978-0596100575', number_code: 'IT-189', category: 'Networking', publisher: 'O\'Reilly Media', publication_year: 2006, pages: 642, description: 'The comprehensive guide to DNS systems.', book_copies: 3 },
  { title: 'BGP: Building Reliable Networks with BGP', author: 'Iljitsch van Beijnum', isbn: '978-1491983416', number_code: 'IT-190', category: 'Networking', publisher: 'O\'Reilly Media', publication_year: 2018, pages: 334, description: 'The Border Gateway Protocol explained.', book_copies: 3 },

  // Emerging Technologies
  { title: 'Quantum Computing: An Applied Approach', author: 'Jack D. Hidary', isbn: '978-3030832735', number_code: 'IT-191', category: 'Emerging Tech', publisher: 'Springer', publication_year: 2021, pages: 422, description: 'Practical introduction to quantum computing.', book_copies: 3 },
  { title: 'Programming Quantum Computers', author: 'Eric R. Johnston', isbn: '978-1492039686', number_code: 'IT-192', category: 'Emerging Tech', publisher: 'O\'Reilly Media', publication_year: 2019, pages: 336, description: 'Essential algorithms and code samples for quantum computing.', book_copies: 3 },
  { title: 'Augmented Reality: Principles and Practice', author: 'Dieter Schmalstieg', isbn: '978-0321883575', number_code: 'IT-193', category: 'Emerging Tech', publisher: 'Addison-Wesley', publication_year: 2016, pages: 528, description: 'Foundations of augmented reality development.', book_copies: 3 },
  { title: 'Edge Computing', author: 'Jie Cao', isbn: '978-1108493499', number_code: 'IT-194', category: 'Emerging Tech', publisher: 'Cambridge Press', publication_year: 2021, pages: 350, description: 'A primer on edge computing concepts.', book_copies: 3 },
  { title: '5G NR: The Next Generation Wireless Access', author: 'Erik Dahlman', isbn: '978-0128223208', number_code: 'IT-195', category: 'Emerging Tech', publisher: 'Academic Press', publication_year: 2020, pages: 494, description: 'Technology and specifications for 5G networks.', book_copies: 3 },

  // More Career & Leadership
  { title: 'Staff Engineer: Leadership Beyond Management', author: 'Will Larson', isbn: '978-1736417911', number_code: 'IT-196', category: 'Career', publisher: 'Independently Published', publication_year: 2021, pages: 400, description: 'Guide to the staff engineer role.', book_copies: 4 },
  { title: 'An Elegant Puzzle: Systems of Engineering Management', author: 'Will Larson', isbn: '978-1732265189', number_code: 'IT-197', category: 'Career', publisher: 'Stripe Press', publication_year: 2019, pages: 288, description: 'Engineering management wisdom and frameworks.', book_copies: 4 },
  { title: 'The Manager\'s Path', author: 'Camille Fournier', isbn: '978-1491973899', number_code: 'IT-198', category: 'Career', publisher: 'O\'Reilly Media', publication_year: 2017, pages: 244, description: 'A guide for tech leaders navigating growth.', book_copies: 5 },
  { title: 'Team Topologies', author: 'Matthew Skelton', isbn: '978-1942788812', number_code: 'IT-199', category: 'Career', publisher: 'IT Revolution Press', publication_year: 2019, pages: 240, description: 'Organizing business and technology teams.', book_copies: 4 },
  { title: 'Accelerate', author: 'Nicole Forsgren', isbn: '978-1942788331', number_code: 'IT-200', category: 'DevOps', publisher: 'IT Revolution Press', publication_year: 2018, pages: 288, description: 'The science of lean software and DevOps.', book_copies: 5 }
];

async function addMoreBooks() {
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

    // Get current count
    const [before] = await connection.execute('SELECT COUNT(*) as count FROM books');
    console.log(`Current books in database: ${before[0].count}`);

    // Insert new IT books
    console.log(`\nInserting ${moreItBooks.length} additional IT books...`);

    const insertQuery = `
      INSERT INTO books (title, author, isbn, number_code, category, publisher, publication_year, pages, description, status, book_copies, available_copies)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?, ?)
    `;

    let inserted = 0;
    for (const book of moreItBooks) {
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
        process.stdout.write(`  Inserted ${inserted}/${moreItBooks.length} books...\r`);
      }
    }

    console.log(`\n✓ Successfully inserted ${inserted} additional IT books`);

    // Get new count
    const [after] = await connection.execute('SELECT COUNT(*) as count FROM books');
    console.log(`\nTotal books in database now: ${after[0].count}`);

    // Show summary by category
    const [categories] = await connection.execute(`
      SELECT category, COUNT(*) as count, SUM(book_copies) as total_copies
      FROM books
      GROUP BY category
      ORDER BY count DESC
    `);

    console.log('\n================================');
    console.log('ALL BOOKS BY CATEGORY');
    console.log('================================');
    console.table(categories);

    // Total count
    const [total] = await connection.execute('SELECT COUNT(*) as total_books, SUM(book_copies) as total_copies FROM books');
    console.log(`\nGrand Total: ${total[0].total_books} unique titles, ${total[0].total_copies} total copies`);

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

addMoreBooks();
