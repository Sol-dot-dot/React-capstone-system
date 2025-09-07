const pool = require('../config/database');
const natural = require('natural');

class ReadingHistoryService {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
  }

  /**
   * Analyze user's reading history and extract preferences
   * @param {string} studentIdNumber - Student ID number
   * @returns {Object} User reading preferences and patterns
   */
  async analyzeUserReadingHistory(studentIdNumber) {
    try {
      console.log(`🔍 Analyzing reading history for student: ${studentIdNumber}`);

      // Get user's complete borrowing history
      const [borrowingHistory] = await pool.execute(`
        SELECT 
          bt.id,
          bt.borrowed_at,
          bt.returned_at,
          bt.status,
          b.title,
          b.author,
          b.genre,
          b.description,
          b.publication_year,
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
      `, [studentIdNumber]);

      if (borrowingHistory.length === 0) {
        return this.getDefaultPreferences();
      }

      // Analyze reading patterns
      const analysis = {
        totalBooksBorrowed: borrowingHistory.length,
        completedBooks: borrowingHistory.filter(book => book.completed_reading).length,
        averageDaysKept: this.calculateAverageDaysKept(borrowingHistory),
        favoriteGenres: this.extractFavoriteGenres(borrowingHistory),
        favoriteAuthors: this.extractFavoriteAuthors(borrowingHistory),
        readingFrequency: this.calculateReadingFrequency(borrowingHistory),
        preferredBookLength: this.analyzeBookLengthPreferences(borrowingHistory),
        readingTrends: this.analyzeReadingTrends(borrowingHistory),
        genreDiversity: this.calculateGenreDiversity(borrowingHistory),
        authorDiversity: this.calculateAuthorDiversity(borrowingHistory),
        recentInterests: this.extractRecentInterests(borrowingHistory.slice(0, 10)),
        readingVelocity: this.calculateReadingVelocity(borrowingHistory)
      };

      console.log(`✅ Reading history analysis completed for ${studentIdNumber}`);
      return analysis;

    } catch (error) {
      console.error('❌ Error analyzing reading history:', error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Generate personalized book recommendations based on reading history
   * @param {string} studentIdNumber - Student ID number
   * @param {number} limit - Number of recommendations to generate
   * @returns {Array} Personalized book recommendations
   */
  async generatePersonalizedRecommendations(studentIdNumber, limit = 5) {
    try {
      console.log(`🎯 Generating personalized recommendations for: ${studentIdNumber}`);

      const userPreferences = await this.analyzeUserReadingHistory(studentIdNumber);
      
      // Get all available books
      const [availableBooks] = await pool.execute(`
        SELECT 
          b.id,
          b.title,
          b.author,
          b.genre,
          b.description,
          b.publication_year,
          b.publisher,
          b.status
        FROM books b
        WHERE b.status = 'available'
        ORDER BY b.title
      `);

      if (availableBooks.length === 0) {
        return [];
      }

      // Score books based on user preferences
      const scoredBooks = availableBooks.map(book => {
        const score = this.calculateBookScore(book, userPreferences);
        return { ...book, personalizationScore: score };
      });

      // Sort by personalization score and return top recommendations
      const recommendations = scoredBooks
        .sort((a, b) => b.personalizationScore - a.personalizationScore)
        .slice(0, limit)
        .map(book => ({
          ...book,
          recommendationReason: this.generateRecommendationReason(book, userPreferences)
        }));

      console.log(`✅ Generated ${recommendations.length} personalized recommendations`);
      return recommendations;

    } catch (error) {
      console.error('❌ Error generating personalized recommendations:', error);
      return [];
    }
  }

  /**
   * Calculate personalization score for a book based on user preferences
   * @param {Object} book - Book object
   * @param {Object} userPreferences - User's reading preferences
   * @returns {number} Personalization score (0-100)
   */
  calculateBookScore(book, userPreferences) {
    let score = 0;

    // Genre preference (40% weight)
    if (userPreferences.favoriteGenres.length > 0) {
      const genreMatch = userPreferences.favoriteGenres.find(
        genre => genre.name.toLowerCase() === book.genre.toLowerCase()
      );
      if (genreMatch) {
        score += (genreMatch.percentage / 100) * 40;
      }
    }

    // Author preference (25% weight)
    if (userPreferences.favoriteAuthors.length > 0) {
      const authorMatch = userPreferences.favoriteAuthors.find(
        author => author.name.toLowerCase() === book.author.toLowerCase()
      );
      if (authorMatch) {
        score += (authorMatch.percentage / 100) * 25;
      }
    }

    // Book length preference (15% weight)
    const estimatedLength = this.estimateBookLength(book.description);
    if (userPreferences.preferredBookLength) {
      const lengthDifference = Math.abs(estimatedLength - userPreferences.preferredBookLength);
      const lengthScore = Math.max(0, 15 - (lengthDifference / 50) * 15);
      score += lengthScore;
    }

    // Publication year preference (10% weight)
    if (userPreferences.readingTrends.preferredDecade) {
      const bookDecade = Math.floor(book.publication_year / 10) * 10;
      if (bookDecade === userPreferences.readingTrends.preferredDecade) {
        score += 10;
      }
    }

    // Diversity bonus (10% weight)
    if (userPreferences.genreDiversity < 0.7) {
      // User prefers diverse reading, give bonus to different genres
      const isNewGenre = !userPreferences.favoriteGenres.some(
        genre => genre.name.toLowerCase() === book.genre.toLowerCase()
      );
      if (isNewGenre) {
        score += 10;
      }
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Generate explanation for why a book was recommended
   * @param {Object} book - Book object
   * @param {Object} userPreferences - User's reading preferences
   * @returns {string} Recommendation reason
   */
  generateRecommendationReason(book, userPreferences) {
    const reasons = [];

    // Check genre match
    const genreMatch = userPreferences.favoriteGenres.find(
      genre => genre.name.toLowerCase() === book.genre.toLowerCase()
    );
    if (genreMatch) {
      reasons.push(`matches your interest in ${genreMatch.name} (${genreMatch.percentage}% of your reading)`);
    }

    // Check author match
    const authorMatch = userPreferences.favoriteAuthors.find(
      author => author.name.toLowerCase() === book.author.toLowerCase()
    );
    if (authorMatch) {
      reasons.push(`by ${authorMatch.name}, one of your favorite authors`);
    }

    // Check reading patterns
    if (userPreferences.readingTrends.preferredDecade) {
      const bookDecade = Math.floor(book.publication_year / 10) * 10;
      if (bookDecade === userPreferences.readingTrends.preferredDecade) {
        reasons.push(`from the ${bookDecade}s, matching your reading preferences`);
      }
    }

    // Default reason if no specific matches
    if (reasons.length === 0) {
      reasons.push('based on your reading patterns and interests');
    }

    return reasons.join(', ');
  }

  /**
   * Extract favorite genres from reading history
   * @param {Array} borrowingHistory - User's borrowing history
   * @returns {Array} Favorite genres with percentages
   */
  extractFavoriteGenres(borrowingHistory) {
    const genreCount = {};
    const totalBooks = borrowingHistory.length;

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
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Extract favorite authors from reading history
   * @param {Array} borrowingHistory - User's borrowing history
   * @returns {Array} Favorite authors with percentages
   */
  extractFavoriteAuthors(borrowingHistory) {
    const authorCount = {};
    const totalBooks = borrowingHistory.length;

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
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Calculate average days books are kept
   * @param {Array} borrowingHistory - User's borrowing history
   * @returns {number} Average days kept
   */
  calculateAverageDaysKept(borrowingHistory) {
    const completedBooks = borrowingHistory.filter(book => book.completed_reading);
    if (completedBooks.length === 0) return 0;

    const totalDays = completedBooks.reduce((sum, book) => sum + book.days_kept, 0);
    return Math.round(totalDays / completedBooks.length);
  }

  /**
   * Calculate reading frequency (books per month)
   * @param {Array} borrowingHistory - User's borrowing history
   * @returns {number} Books per month
   */
  calculateReadingFrequency(borrowingHistory) {
    if (borrowingHistory.length < 2) return 0;

    const firstBorrow = new Date(borrowingHistory[borrowingHistory.length - 1].borrowed_at);
    const lastBorrow = new Date(borrowingHistory[0].borrowed_at);
    const monthsDiff = (lastBorrow - firstBorrow) / (1000 * 60 * 60 * 24 * 30);

    return monthsDiff > 0 ? Math.round((borrowingHistory.length / monthsDiff) * 10) / 10 : 0;
  }

  /**
   * Analyze book length preferences based on descriptions
   * @param {Array} borrowingHistory - User's borrowing history
   * @returns {number} Preferred book length in pages
   */
  analyzeBookLengthPreferences(borrowingHistory) {
    const lengths = borrowingHistory
      .filter(book => book.description)
      .map(book => this.estimateBookLength(book.description))
      .filter(length => length > 0);

    if (lengths.length === 0) return 300; // Default

    const averageLength = lengths.reduce((sum, length) => sum + length, 0) / lengths.length;
    return Math.round(averageLength);
  }

  /**
   * Estimate book length from description
   * @param {string} description - Book description
   * @returns {number} Estimated pages
   */
  estimateBookLength(description) {
    if (!description) return 300;

    const wordCount = description.split(' ').length;
    // Rough estimation: 250 words per page
    return Math.round(wordCount / 250 * 100) * 10;
  }

  /**
   * Analyze reading trends over time
   * @param {Array} borrowingHistory - User's borrowing history
   * @returns {Object} Reading trends analysis
   */
  analyzeReadingTrends(borrowingHistory) {
    const decadeCount = {};
    const genreTrends = {};

    borrowingHistory.forEach(book => {
      // Analyze by decade
      if (book.publication_year) {
        const decade = Math.floor(book.publication_year / 10) * 10;
        decadeCount[decade] = (decadeCount[decade] || 0) + 1;
      }

      // Analyze genre trends over time
      if (book.genre) {
        if (!genreTrends[book.genre]) {
          genreTrends[book.genre] = [];
        }
        genreTrends[book.genre].push(new Date(book.borrowed_at));
      }
    });

    const preferredDecade = Object.entries(decadeCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    return {
      preferredDecade: preferredDecade ? parseInt(preferredDecade) : null,
      decadeDistribution: decadeCount,
      genreTrends
    };
  }

  /**
   * Calculate genre diversity (0-1, higher = more diverse)
   * @param {Array} borrowingHistory - User's borrowing history
   * @returns {number} Genre diversity score
   */
  calculateGenreDiversity(borrowingHistory) {
    const genres = borrowingHistory.map(book => book.genre).filter(Boolean);
    const uniqueGenres = new Set(genres).size;
    const totalBooks = genres.length;

    if (totalBooks === 0) return 0;
    return uniqueGenres / totalBooks;
  }

  /**
   * Calculate author diversity (0-1, higher = more diverse)
   * @param {Array} borrowingHistory - User's borrowing history
   * @returns {number} Author diversity score
   */
  calculateAuthorDiversity(borrowingHistory) {
    const authors = borrowingHistory.map(book => book.author).filter(Boolean);
    const uniqueAuthors = new Set(authors).size;
    const totalBooks = authors.length;

    if (totalBooks === 0) return 0;
    return uniqueAuthors / totalBooks;
  }

  /**
   * Extract recent interests from last 10 books
   * @param {Array} recentBooks - Recent borrowing history
   * @returns {Object} Recent interests analysis
   */
  extractRecentInterests(recentBooks) {
    const recentGenres = {};
    const recentAuthors = {};
    const recentThemes = {};

    recentBooks.forEach(book => {
      // Count recent genres
      if (book.genre) {
        recentGenres[book.genre] = (recentGenres[book.genre] || 0) + 1;
      }

      // Count recent authors
      if (book.author) {
        recentAuthors[book.author] = (recentAuthors[book.author] || 0) + 1;
      }

      // Extract themes from descriptions
      if (book.description) {
        const themes = this.extractThemesFromDescription(book.description);
        themes.forEach(theme => {
          recentThemes[theme] = (recentThemes[theme] || 0) + 1;
        });
      }
    });

    return {
      genres: Object.entries(recentGenres)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre, count]) => ({ genre, count })),
      authors: Object.entries(recentAuthors)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([author, count]) => ({ author, count })),
      themes: Object.entries(recentThemes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([theme, count]) => ({ theme, count }))
    };
  }

  /**
   * Extract themes from book description
   * @param {string} description - Book description
   * @returns {Array} Extracted themes
   */
  extractThemesFromDescription(description) {
    const commonThemes = [
      'love', 'adventure', 'mystery', 'friendship', 'family', 'war', 'peace',
      'technology', 'nature', 'science', 'history', 'culture', 'art', 'music',
      'travel', 'education', 'business', 'politics', 'religion', 'philosophy'
    ];

    const tokens = this.tokenizer.tokenize(description.toLowerCase());
    return commonThemes.filter(theme => tokens.includes(theme));
  }

  /**
   * Calculate reading velocity (books per month in recent period)
   * @param {Array} borrowingHistory - User's borrowing history
   * @returns {number} Recent reading velocity
   */
  calculateReadingVelocity(borrowingHistory) {
    const recentBooks = borrowingHistory.slice(0, 10);
    if (recentBooks.length < 2) return 0;

    const firstRecent = new Date(recentBooks[recentBooks.length - 1].borrowed_at);
    const lastRecent = new Date(recentBooks[0].borrowed_at);
    const monthsDiff = (lastRecent - firstRecent) / (1000 * 60 * 60 * 24 * 30);

    return monthsDiff > 0 ? Math.round((recentBooks.length / monthsDiff) * 10) / 10 : 0;
  }

  /**
   * Get default preferences for new users
   * @returns {Object} Default user preferences
   */
  getDefaultPreferences() {
    return {
      totalBooksBorrowed: 0,
      completedBooks: 0,
      averageDaysKept: 0,
      favoriteGenres: [],
      favoriteAuthors: [],
      readingFrequency: 0,
      preferredBookLength: 300,
      readingTrends: { preferredDecade: null },
      genreDiversity: 0,
      authorDiversity: 0,
      recentInterests: { genres: [], authors: [], themes: [] },
      readingVelocity: 0
    };
  }

  /**
   * Get reading statistics for admin dashboard
   * @returns {Object} System-wide reading statistics
   */
  async getSystemReadingStatistics() {
    try {
      console.log('📊 Generating system-wide reading statistics...');

      // Get overall borrowing statistics
      const [overallStats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_borrows,
          COUNT(DISTINCT student_id_number) as active_readers,
          COUNT(CASE WHEN returned_at IS NOT NULL THEN 1 END) as completed_reads,
          AVG(DATEDIFF(COALESCE(returned_at, NOW()), borrowed_at)) as avg_days_kept
        FROM borrowing_transactions
      `);

      // Get popular genres
      const [popularGenres] = await pool.execute(`
        SELECT 
          b.genre,
          COUNT(*) as borrow_count,
          COUNT(DISTINCT bt.student_id_number) as unique_readers
        FROM borrowing_transactions bt
        JOIN books b ON bt.book_id = b.id
        WHERE b.genre IS NOT NULL
        GROUP BY b.genre
        ORDER BY borrow_count DESC
        LIMIT 10
      `);

      // Get popular authors
      const [popularAuthors] = await pool.execute(`
        SELECT 
          b.author,
          COUNT(*) as borrow_count,
          COUNT(DISTINCT bt.student_id_number) as unique_readers
        FROM borrowing_transactions bt
        JOIN books b ON bt.book_id = b.id
        GROUP BY b.author
        ORDER BY borrow_count DESC
        LIMIT 10
      `);

      // Get reading trends by month
      const [monthlyTrends] = await pool.execute(`
        SELECT 
          DATE_FORMAT(borrowed_at, '%Y-%m') as month,
          COUNT(*) as borrows,
          COUNT(DISTINCT student_id_number) as unique_readers
        FROM borrowing_transactions
        WHERE borrowed_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(borrowed_at, '%Y-%m')
        ORDER BY month DESC
      `);

      console.log('✅ System reading statistics generated');
      return {
        overall: overallStats[0],
        popularGenres,
        popularAuthors,
        monthlyTrends
      };

    } catch (error) {
      console.error('❌ Error generating system reading statistics:', error);
      return null;
    }
  }
}

module.exports = new ReadingHistoryService();
