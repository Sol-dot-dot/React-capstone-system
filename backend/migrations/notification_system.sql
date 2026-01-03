-- Notification System Migration
-- Run this SQL to create tables for notification preferences and logs

-- Store notification preferences per user
CREATE TABLE IF NOT EXISTS notification_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  days_before_due INT DEFAULT 3,
  notify_overdue BOOLEAN DEFAULT TRUE,
  notify_due_today BOOLEAN DEFAULT TRUE,
  notify_due_soon BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_prefs (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Log sent notifications to prevent duplicates
CREATE TABLE IF NOT EXISTS notification_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  transaction_id INT NOT NULL,
  notification_type ENUM('due_soon', 'due_today', 'overdue') NOT NULL,
  sent_via ENUM('push', 'email', 'both', 'in_app') NOT NULL,
  book_title VARCHAR(255),
  days_until_due INT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_date DATE GENERATED ALWAYS AS (DATE(sent_at)) STORED,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES borrowing_transactions(id) ON DELETE CASCADE,
  -- Prevent duplicate notifications for same transaction on same day
  UNIQUE KEY unique_daily_notification (user_id, transaction_id, notification_type, sent_date)
);

-- Index for faster queries
CREATE INDEX idx_notif_log_user ON notification_logs(user_id, sent_at);
CREATE INDEX idx_notif_log_type ON notification_logs(notification_type, sent_at);

-- View to easily query books needing notifications
CREATE OR REPLACE VIEW v_books_needing_notifications AS
SELECT
  bt.id AS transaction_id,
  u.id AS user_id,
  u.id_number,
  u.email,
  u.first_name,
  u.last_name,
  b.id AS book_id,
  b.title AS book_title,
  b.author,
  bt.due_date,
  DATEDIFF(bt.due_date, CURDATE()) AS days_until_due,
  CASE
    WHEN DATEDIFF(bt.due_date, CURDATE()) < 0 THEN 'overdue'
    WHEN DATEDIFF(bt.due_date, CURDATE()) = 0 THEN 'due_today'
    ELSE 'due_soon'
  END AS notification_type,
  COALESCE(np.days_before_due, 3) AS reminder_days,
  COALESCE(np.push_enabled, 1) AS push_enabled,
  COALESCE(np.email_enabled, 1) AS email_enabled,
  COALESCE(np.notify_overdue, 1) AS notify_overdue,
  COALESCE(np.notify_due_today, 1) AS notify_due_today,
  COALESCE(np.notify_due_soon, 1) AS notify_due_soon
FROM borrowing_transactions bt
JOIN users u ON bt.student_id_number = u.id_number
JOIN books b ON bt.book_id = b.id
LEFT JOIN notification_preferences np ON u.id = np.user_id
WHERE bt.status IN ('borrowed', 'overdue')
  AND bt.returned_date IS NULL
  AND u.is_verified = 1;
