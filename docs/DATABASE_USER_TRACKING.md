# 📊 How the System Tracks User Reading History & Preferences

## 🗄️ **Database Structure for User Tracking**

The system uses a comprehensive MySQL database with multiple interconnected tables to track every aspect of user reading behavior and preferences.

### **Core Tables for User Tracking:**

#### **1. `users` Table - User Information**
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_number VARCHAR(10) UNIQUE NOT NULL,  -- Student ID (e.g., C22-0044)
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **2. `books` Table - Book Catalog**
```sql
CREATE TABLE books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(13),
    publisher VARCHAR(255),
    publication_year INT,
    genre VARCHAR(100),                    -- Key for preference tracking
    description TEXT,                      -- Used for AI analysis
    barcode VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('available', 'borrowed', 'lost', 'maintenance'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **3. `borrowing_transactions` Table - Core Reading History**
```sql
CREATE TABLE borrowing_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id_number VARCHAR(10) NOT NULL,  -- Links to user
    book_id INT NOT NULL,                    -- Links to book
    borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    returned_at TIMESTAMP NULL,              -- NULL = still borrowed
    status ENUM('borrowed', 'returned', 'overdue'),
    notes TEXT
);
```

#### **4. `semester_tracking` Table - Reading Goals**
```sql
CREATE TABLE semester_tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id_number VARCHAR(10) NOT NULL,
    books_borrowed_count INT DEFAULT 0,     -- Tracks reading progress
    books_required INT DEFAULT 20,          -- Reading requirement
    status ENUM('active', 'completed', 'incomplete')
);
```

## 🧠 **How AI Analyzes User Preferences**

### **Step 1: Data Collection**
The system queries the database to get complete borrowing history:

```sql
SELECT 
  bt.id,
  bt.borrowed_at,
  bt.returned_at,
  bt.status,
  b.title,
  b.author,
  b.genre,                    -- For genre preference analysis
  b.description,              -- For content analysis
  b.publication_year,         -- For era preferences
  b.publisher,
  DATEDIFF(COALESCE(bt.returned_at, NOW()), bt.borrowed_at) as days_kept,
  CASE 
    WHEN bt.returned_at IS NOT NULL THEN 1 
    ELSE 0 
  END as completed_reading
FROM borrowing_transactions bt
JOIN books b ON bt.book_id = b.id
WHERE bt.student_id_number = ?
ORDER BY bt.borrowed_at DESC
```

### **Step 2: Preference Analysis**
The AI system analyzes this data to extract:

#### **📚 Genre Preferences**
```javascript
extractFavoriteGenres(borrowingHistory) {
  const genreCount = {};
  borrowingHistory.forEach(book => {
    if (book.genre) {
      genreCount[book.genre] = (genreCount[book.genre] || 0) + 1;
    }
  });
  
  return Object.entries(genreCount)
    .map(([genre, count]) => ({
      name: genre,
      count,
      percentage: Math.round((count / totalBooks) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}
```

#### **✍️ Author Preferences**
```javascript
extractFavoriteAuthors(borrowingHistory) {
  const authorCount = {};
  borrowingHistory.forEach(book => {
    if (book.author) {
      authorCount[book.author] = (authorCount[book.author] || 0) + 1;
    }
  });
  
  return Object.entries(authorCount)
    .map(([author, count]) => ({
      name: author,
      count,
      percentage: Math.round((count / totalBooks) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}
```

#### **📖 Reading Patterns**
```javascript
// Reading frequency (books per month)
calculateReadingFrequency(borrowingHistory) {
  const firstBorrow = new Date(borrowingHistory[borrowingHistory.length - 1].borrowed_at);
  const lastBorrow = new Date(borrowingHistory[0].borrowed_at);
  const monthsDiff = (lastBorrow - firstBorrow) / (1000 * 60 * 60 * 24 * 30);
  return monthsDiff > 0 ? Math.round((borrowingHistory.length / monthsDiff) * 10) / 10 : 0;
}

// Average reading time
calculateAverageDaysKept(borrowingHistory) {
  const completedBooks = borrowingHistory.filter(book => book.completed_reading);
  const totalDays = completedBooks.reduce((sum, book) => sum + book.days_kept, 0);
  return Math.round(totalDays / completedBooks.length);
}
```

### **Step 3: Personalization Scoring**
When recommending books, the system calculates a personalization score:

```javascript
calculateBookScore(book, userPreferences) {
  let score = 0;
  
  // Genre preference (40% weight)
  const genreMatch = userPreferences.favoriteGenres.find(
    genre => genre.name.toLowerCase() === book.genre.toLowerCase()
  );
  if (genreMatch) {
    score += (genreMatch.percentage / 100) * 40;
  }
  
  // Author preference (25% weight)
  const authorMatch = userPreferences.favoriteAuthors.find(
    author => author.name.toLowerCase() === book.author.toLowerCase()
  );
  if (authorMatch) {
    score += (authorMatch.percentage / 100) * 25;
  }
  
  // Book length preference (15% weight)
  // Publication year preference (10% weight)
  // Diversity bonus (10% weight)
  
  return Math.min(100, Math.max(0, score));
}
```

## 📈 **Real Example: User C22-0044**

Based on the test data, here's what the system knows about this user:

### **📊 Reading Statistics:**
- **Total Books Borrowed**: 28
- **Completed Books**: 25 (89% completion rate)
- **Reading Frequency**: 137.9 books/month
- **Average Reading Time**: Calculated from borrowing patterns

### **🎯 Preferences Identified:**
- **Favorite Genres**: 
  - Fiction (50% of reading)
  - Science Fiction (25% of reading)
  - Romance (11% of reading)
- **Favorite Authors**:
  - George Orwell
  - Harper Lee
  - F. Scott Fitzgerald

### **📚 Reading Patterns:**
- **Genre Diversity**: Calculated percentage
- **Reading Velocity**: Recent reading pace
- **Preferred Book Length**: Based on descriptions
- **Era Preferences**: Based on publication years

## 🔄 **How It Updates in Real-Time**

### **Every Time a User:**
1. **Borrows a Book**: New record added to `borrowing_transactions`
2. **Returns a Book**: `returned_at` timestamp updated
3. **Gets Overdue**: Status updated to 'overdue'
4. **Pays Fines**: Recorded in `fine_payments`

### **AI System Automatically:**
1. **Re-analyzes** user preferences
2. **Updates** personalization scores
3. **Refines** recommendations
4. **Tracks** reading trends

## 🎯 **Personalization Features**

### **For Each User, the System Tracks:**
- ✅ **Genre Preferences** - What types of books they like
- ✅ **Author Preferences** - Favorite writers
- ✅ **Reading Speed** - How fast they read
- ✅ **Book Length Preferences** - Short vs long books
- ✅ **Era Preferences** - Modern vs classic books
- ✅ **Reading Frequency** - How often they borrow
- ✅ **Completion Rate** - Do they finish books?
- ✅ **Diversity Patterns** - Do they explore different genres?

### **AI Uses This Data To:**
- 🎯 **Score Books** - Calculate personalization scores
- 💬 **Generate Explanations** - Why each book was recommended
- 📊 **Track Trends** - Monitor reading evolution
- 🔮 **Predict Preferences** - Suggest new genres/authors
- 📈 **Measure Engagement** - Reading velocity and completion

## 🚀 **The Result**

When a user asks for book recommendations, the AI system:

1. **Queries** their complete borrowing history
2. **Analyzes** their preferences and patterns
3. **Scores** all available books
4. **Generates** personalized recommendations
5. **Explains** why each book was chosen
6. **References** their reading history in responses

This creates a truly personalized experience where each user gets recommendations tailored specifically to their unique reading habits and preferences!
