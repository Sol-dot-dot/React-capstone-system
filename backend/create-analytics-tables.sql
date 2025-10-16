-- Create analytics-related tables if they don't exist

-- Activity logs table for tracking user actions
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    response_time INT DEFAULT 0,
    status ENUM('success', 'error') DEFAULT 'success',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Search logs table for tracking search analytics
CREATE TABLE IF NOT EXISTS search_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    search_term VARCHAR(255) NOT NULL,
    result_count INT DEFAULT 0,
    clicked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Book ratings table for tracking book ratings
CREATE TABLE IF NOT EXISTS book_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_book_rating (user_id, book_id)
);

-- User sessions table for tracking user engagement
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP NULL,
    session_duration INT DEFAULT 0, -- in seconds
    page_views INT DEFAULT 0,
    actions_count INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- System metrics table for tracking system performance
CREATE TABLE IF NOT EXISTS system_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    metric_unit VARCHAR(20),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

CREATE INDEX IF NOT EXISTS idx_search_logs_user_id ON search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_search_logs_search_term ON search_logs(search_term);

CREATE INDEX IF NOT EXISTS idx_book_ratings_book_id ON book_ratings(book_id);
CREATE INDEX IF NOT EXISTS idx_book_ratings_user_id ON book_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_book_ratings_rating ON book_ratings(rating);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_start ON user_sessions(session_start);

CREATE INDEX IF NOT EXISTS idx_system_metrics_metric_name ON system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded_at ON system_metrics(recorded_at);

-- Insert some sample data for testing
INSERT IGNORE INTO activity_logs (user_id, action, description, ip_address, user_agent, response_time, status) VALUES
(1, 'login', 'User logged in successfully', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 150, 'success'),
(1, 'search', 'Searched for "programming books"', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 200, 'success'),
(1, 'borrow', 'Borrowed book "Introduction to Algorithms"', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 300, 'success'),
(2, 'login', 'User logged in successfully', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 120, 'success'),
(2, 'search', 'Searched for "database systems"', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 180, 'success');

INSERT IGNORE INTO search_logs (user_id, search_term, result_count, clicked) VALUES
(1, 'programming', 15, TRUE),
(1, 'algorithms', 8, TRUE),
(1, 'database', 12, FALSE),
(2, 'database systems', 5, TRUE),
(2, 'computer science', 20, TRUE);

INSERT IGNORE INTO book_ratings (book_id, user_id, rating, review) VALUES
(1, 1, 5, 'Excellent book for learning algorithms'),
(2, 1, 4, 'Good introduction to programming'),
(1, 2, 5, 'Must-read for computer science students'),
(3, 2, 3, 'Average book, could be better');

INSERT IGNORE INTO user_sessions (user_id, session_duration, page_views, actions_count) VALUES
(1, 1800, 15, 8),
(1, 2400, 20, 12),
(2, 1200, 10, 5),
(2, 3600, 25, 18);

INSERT IGNORE INTO system_metrics (metric_name, metric_value, metric_unit) VALUES
('avg_response_time', 250.5, 'ms'),
('active_users', 45, 'count'),
('books_borrowed_today', 12, 'count'),
('search_queries_today', 156, 'count');
