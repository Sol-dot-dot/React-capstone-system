const pool = require('../config/database');
const natural = require('natural');

/**
 * Advanced Recommendation Service
 * Implements collaborative filtering and content-based filtering for personalized book recommendations
 */
class AdvancedRecommendationService {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    this.tfidf = new natural.TfIdf();
    this.userSimilarityCache = new Map();
    this.bookSimilarityCache = new Map();
  }

  /**
   * Generate hybrid recommendations combining collaborative and content-based filtering
   * @param {string} studentIdNumber - Student ID number
   * @param {string} query - User query for context
   * @param {number} limit - Number of recommendations
   * @returns {Object} Hybrid recommendations with explanations
   */
  async generateHybridRecommendations(studentIdNumber, query = '', limit = 5) {
    try {
      console.log(`[INFO] Generating hybrid recommendations for: ${studentIdNumber}`);

      // Get user's reading history
      const userHistory = await this.getUserReadingHistory(studentIdNumber);
      
      // Generate collaborative filtering recommendations
      const collaborativeRecs = await this.generateCollaborativeRecommendations(studentIdNumber, limit * 2);
      
      // Generate content-based filtering recommendations
      const contentBasedRecs = await this.generateContentBasedRecommendations(studentIdNumber, query, limit * 2);
      
      // Generate query-based recommendations if query provided
      const queryBasedRecs = query ? await this.generateQueryBasedRecommendations(query, limit * 2) : [];
      
      // Combine and rank recommendations
      const hybridRecs = this.combineRecommendations(
        collaborativeRecs,
        contentBasedRecs,
        queryBasedRecs,
        userHistory,
        limit
      );

      return {
        recommendations: hybridRecs,
        explanation: this.generateExplanation(hybridRecs, userHistory, query),
        userProfile: await this.generateUserProfile(studentIdNumber),
        confidence: this.calculateConfidence(hybridRecs, userHistory)
      };

    } catch (error) {
      console.error('[ERROR] Error generating hybrid recommendations:', error);
      throw error;
    }
  }

  /**
   * Collaborative Filtering: Find users with similar reading patterns
   * @param {string} studentIdNumber - Student ID number
   * @param {number} limit - Number of recommendations
   * @returns {Array} Collaborative filtering recommendations
   */
  async generateCollaborativeRecommendations(studentIdNumber, limit = 10) {
    try {
      console.log(`[INFO] Generating collaborative recommendations for: ${studentIdNumber}`);

      // Get user's reading history
      const userHistory = await this.getUserReadingHistory(studentIdNumber);
      
      if (userHistory.length === 0) {
        return [];
      }

      // Find similar users based on reading patterns
      const similarUsers = await this.findSimilarUsers(studentIdNumber, userHistory);
      
      if (similarUsers.length === 0) {
        return [];
      }

      // Get books liked by similar users that current user hasn't read
      const recommendations = await this.getBooksFromSimilarUsers(
        studentIdNumber,
        similarUsers,
        limit
      );

      return recommendations.map(rec => ({
        ...rec,
        recommendationType: 'collaborative',
        reason: this.generateDynamicCollaborativeReason(rec),
        confidence: rec.similarityScore
      }));

    } catch (error) {
      console.error('[ERROR] Error in collaborative filtering:', error);
      return [];
    }
  }

  /**
   * Content-Based Filtering: Recommend books similar to user's reading history
   * @param {string} studentIdNumber - Student ID number
   * @param {string} query - User query for context
   * @param {number} limit - Number of recommendations
   * @returns {Array} Content-based filtering recommendations
   */
  async generateContentBasedRecommendations(studentIdNumber, query = '', limit = 10) {
    try {
      console.log(`[INFO] Generating content-based recommendations for: ${studentIdNumber}`);

      const userHistory = await this.getUserReadingHistory(studentIdNumber);
      
      if (userHistory.length === 0) {
        return [];
      }

      // Create user profile from reading history
      const userProfile = this.createUserProfile(userHistory);
      
      // Get all available books
      const [availableBooks] = await pool.execute(`
        SELECT 
          b.id,
          b.title,
          b.author,
          b.category,
          b.description,
          b.publication_year,
          b.publisher,
          b.status,
          b.isbn,
          b.available_copies,
          b.book_copies,
          b.number_code
        FROM books b
        WHERE b.status = 'available'
        AND b.id NOT IN (
          SELECT DISTINCT book_id 
          FROM borrowing_transactions 
          WHERE student_id_number = ?
        )
        ORDER BY b.title
      `, [studentIdNumber]);

      // Calculate similarity scores
      const recommendations = availableBooks.map(book => {
        const similarity = this.calculateContentSimilarity(book, userProfile, query);
        return {
          ...book,
          similarityScore: similarity,
          recommendationType: 'content-based',
          reason: this.generateDynamicContentBasedReason(book, userProfile)
        };
      });

      // Sort by similarity and return top recommendations
      return recommendations
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, limit);

    } catch (error) {
      console.error('[ERROR] Error in content-based filtering:', error);
      return [];
    }
  }

  /**
   * Query-Based Recommendations: Find books matching user's current query
   * @param {string} query - User query
   * @param {number} limit - Number of recommendations
   * @returns {Array} Query-based recommendations
   */
  async generateQueryBasedRecommendations(query, limit = 10) {
    try {
      console.log(`[INFO] Generating query-based recommendations for: "${query}"`);

      // Tokenize and process query
      const queryTokens = this.tokenizer.tokenize(query.toLowerCase());
      const queryStems = queryTokens.map(token => this.stemmer.stem(token));

      // Get all available books
      const [availableBooks] = await pool.execute(`
        SELECT 
          b.id,
          b.title,
          b.author,
          b.category,
          b.description,
          b.publication_year,
          b.publisher,
          b.status,
          b.isbn,
          b.available_copies,
          b.book_copies,
          b.number_code
        FROM books b
        WHERE b.status = 'available'
        ORDER BY b.title
      `);

      // Calculate query similarity for each book
      const recommendations = availableBooks.map(book => {
        const similarity = this.calculateQuerySimilarity(book, queryTokens, queryStems);
        return {
          ...book,
          similarityScore: similarity,
          recommendationType: 'query-based',
          reason: this.generateDynamicQueryBasedReason(book, query)
        };
      });

      // Sort by similarity and return top recommendations
      return recommendations
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, limit);

    } catch (error) {
      console.error('[ERROR] Error in query-based recommendations:', error);
      return [];
    }
  }

  /**
   * Find users with similar reading patterns
   * @param {string} studentIdNumber - Current user's ID
   * @param {Array} userHistory - Current user's reading history
   * @returns {Array} Similar users with similarity scores
   */
  async findSimilarUsers(studentIdNumber, userHistory) {
    try {
      // Get all other users' reading histories
      const [allUsers] = await pool.execute(`
        SELECT 
          bt.student_id_number,
          b.id as book_id,
          b.title,
          b.author,
          b.category,
          bt.borrowed_date,
          bt.returned_date,
          CASE 
            WHEN bt.returned_date IS NOT NULL THEN 1 
            ELSE 0 
          END as completed_reading
        FROM borrowing_transactions bt
        JOIN books b ON bt.book_id = b.id
        WHERE bt.student_id_number != ?
        ORDER BY bt.student_id_number, bt.borrowed_date DESC
      `, [studentIdNumber]);

      // Group by user
      const userGroups = {};
      allUsers.forEach(record => {
        if (!userGroups[record.student_id_number]) {
          userGroups[record.student_id_number] = [];
        }
        userGroups[record.student_id_number].push(record);
      });

      // Calculate similarity with each user
      const similarUsers = [];
      for (const [userId, history] of Object.entries(userGroups)) {
        const similarity = this.calculateUserSimilarity(userHistory, history);
        if (similarity > 0.1) { // Only include users with meaningful similarity
          similarUsers.push({
            userId,
            similarity,
            history
          });
        }
      }

      // Sort by similarity and return top users
      return similarUsers
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 10);

    } catch (error) {
      console.error('[ERROR] Error finding similar users:', error);
      return [];
    }
  }

  /**
   * Get books from similar users that current user hasn't read
   * @param {string} studentIdNumber - Current user's ID
   * @param {Array} similarUsers - Similar users
   * @param {number} limit - Number of recommendations
   * @returns {Array} Book recommendations
   */
  async getBooksFromSimilarUsers(studentIdNumber, similarUsers, limit) {
    try {
      // Get books that similar users liked (completed reading)
      const likedBooks = [];
      similarUsers.forEach(user => {
        user.history
          .filter(book => book.completed_reading)
          .forEach(book => {
            likedBooks.push({
              ...book,
              userSimilarity: user.similarity
            });
          });
      });

      // Group by book and calculate weighted scores
      const bookScores = {};
      likedBooks.forEach(book => {
        const key = book.book_id;
        if (!bookScores[key]) {
          bookScores[key] = {
            book: book,
            totalScore: 0,
            userCount: 0
          };
        }
        bookScores[key].totalScore += book.userSimilarity;
        bookScores[key].userCount += 1;
      });

      // Get user's already read books
      const [userBooks] = await pool.execute(`
        SELECT DISTINCT book_id 
        FROM borrowing_transactions 
        WHERE student_id_number = ?
      `, [studentIdNumber]);

      const userBookIds = new Set(userBooks.map(b => b.book_id));

      // Filter out already read books and calculate final scores
      const recommendations = Object.values(bookScores)
        .filter(item => !userBookIds.has(item.book.book_id))
        .map(item => ({
          id: item.book.book_id,
          title: item.book.title,
          author: item.book.author,
          category: item.book.category,
          similarityScore: item.totalScore / item.userCount,
          userCount: item.userCount
        }));

      return recommendations
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, limit);

    } catch (error) {
      console.error('[ERROR] Error getting books from similar users:', error);
      return [];
    }
  }

  /**
   * Create user profile from reading history
   * @param {Array} userHistory - User's reading history
   * @returns {Object} User profile
   */
  createUserProfile(userHistory) {
    const profile = {
      favoriteGenres: {},
      favoriteAuthors: {},
      preferredYears: {},
      keywords: [],
      totalBooks: userHistory.length,
      completedBooks: userHistory.filter(book => book.completed_reading).length
    };

    // Analyze genres
    userHistory.forEach(book => {
      if (book.category) {
        profile.favoriteGenres[book.category] = (profile.favoriteGenres[book.category] || 0) + 1;
      }
      if (book.author) {
        profile.favoriteAuthors[book.author] = (profile.favoriteAuthors[book.author] || 0) + 1;
      }
      if (book.publication_year) {
        const decade = Math.floor(book.publication_year / 10) * 10;
        profile.preferredYears[decade] = (profile.preferredYears[decade] || 0) + 1;
      }
    });

    // Extract keywords from titles and descriptions
    userHistory.forEach(book => {
      if (book.title) {
        const tokens = this.tokenizer.tokenize(book.title.toLowerCase());
        profile.keywords.push(...tokens);
      }
    });

    // Normalize scores
    const totalBooks = profile.totalBooks;
    Object.keys(profile.favoriteGenres).forEach(genre => {
      profile.favoriteGenres[genre] /= totalBooks;
    });
    Object.keys(profile.favoriteAuthors).forEach(author => {
      profile.favoriteAuthors[author] /= totalBooks;
    });

    return profile;
  }

  /**
   * Calculate content similarity between book and user profile
   * @param {Object} book - Book object
   * @param {Object} userProfile - User profile
   * @param {string} query - User query for additional context
   * @returns {number} Similarity score (0-1)
   */
  calculateContentSimilarity(book, userProfile, query = '') {
    let similarity = 0;
    let factors = 0;

    // Genre similarity
    if (book.category && userProfile.favoriteGenres[book.category]) {
      similarity += userProfile.favoriteGenres[book.category] * 0.4;
      factors += 0.4;
    }

    // Author similarity
    if (book.author && userProfile.favoriteAuthors[book.author]) {
      similarity += userProfile.favoriteAuthors[book.author] * 0.3;
      factors += 0.3;
    }

    // Publication year similarity
    if (book.publication_year) {
      const decade = Math.floor(book.publication_year / 10) * 10;
      if (userProfile.preferredYears[decade]) {
        similarity += userProfile.preferredYears[decade] * 0.2;
        factors += 0.2;
      }
    }

    // Query similarity (if query provided)
    if (query) {
      const querySimilarity = this.calculateQuerySimilarity(book, 
        this.tokenizer.tokenize(query.toLowerCase()), 
        this.tokenizer.tokenize(query.toLowerCase()).map(t => this.stemmer.stem(t))
      );
      similarity += querySimilarity * 0.3;
      factors += 0.3;
    }

    // Keyword similarity
    if (book.title) {
      const bookTokens = this.tokenizer.tokenize(book.title.toLowerCase());
      const commonKeywords = bookTokens.filter(token => 
        userProfile.keywords.includes(token)
      );
      if (bookTokens.length > 0) {
        similarity += (commonKeywords.length / bookTokens.length) * 0.1;
        factors += 0.1;
      }
    }

    return factors > 0 ? similarity / factors : 0;
  }

  /**
   * Calculate query similarity between book and user query
   * @param {Object} book - Book object
   * @param {Array} queryTokens - Tokenized query
   * @param {Array} queryStems - Stemmed query tokens
   * @returns {number} Similarity score (0-1)
   */
  calculateQuerySimilarity(book, queryTokens, queryStems) {
    let similarity = 0;
    let totalTokens = queryTokens.length;

    if (totalTokens === 0) return 0;

    // Check title similarity
    if (book.title) {
      const titleTokens = this.tokenizer.tokenize(book.title.toLowerCase());
      const titleStems = titleTokens.map(token => this.stemmer.stem(token));
      
      const titleMatches = queryTokens.filter(token => 
        titleTokens.some(titleToken => titleToken.includes(token) || token.includes(titleToken))
      );
      similarity += (titleMatches.length / totalTokens) * 0.5;
    }

    // Check author similarity
    if (book.author) {
      const authorTokens = this.tokenizer.tokenize(book.author.toLowerCase());
      const authorMatches = queryTokens.filter(token => 
        authorTokens.some(authorToken => authorToken.includes(token) || token.includes(authorToken))
      );
      similarity += (authorMatches.length / totalTokens) * 0.3;
    }

    // Check category similarity
    if (book.category) {
      const categoryTokens = this.tokenizer.tokenize(book.category.toLowerCase());
      const categoryMatches = queryTokens.filter(token => 
        categoryTokens.some(catToken => catToken.includes(token) || token.includes(catToken))
      );
      similarity += (categoryMatches.length / totalTokens) * 0.2;
    }

    return Math.min(similarity, 1);
  }

  /**
   * Calculate similarity between two users based on reading history
   * @param {Array} user1History - First user's history
   * @param {Array} user2History - Second user's history
   * @returns {number} Similarity score (0-1)
   */
  calculateUserSimilarity(user1History, user2History) {
    const user1Books = new Set(user1History.map(book => book.book_id));
    const user2Books = new Set(user2History.map(book => book.book_id));
    
    const intersection = new Set([...user1Books].filter(id => user2Books.has(id)));
    const union = new Set([...user1Books, ...user2Books]);
    
    // Jaccard similarity
    const jaccardSimilarity = intersection.size / union.size;
    
    // Weight by reading completion rate
    const user1Completed = user1History.filter(book => book.completed_reading).length;
    const user2Completed = user2History.filter(book => book.completed_reading).length;
    const completionRate = (user1Completed + user2Completed) / (user1History.length + user2History.length);
    
    return jaccardSimilarity * (0.7 + 0.3 * completionRate);
  }

  /**
   * Combine different types of recommendations
   * @param {Array} collaborativeRecs - Collaborative filtering recommendations
   * @param {Array} contentBasedRecs - Content-based filtering recommendations
   * @param {Array} queryBasedRecs - Query-based recommendations
   * @param {Array} userHistory - User's reading history
   * @param {number} limit - Final number of recommendations
   * @returns {Array} Combined and ranked recommendations
   */
  combineRecommendations(collaborativeRecs, contentBasedRecs, queryBasedRecs, userHistory, limit) {
    const combined = new Map();
    
    // Weight different recommendation types
    const weights = {
      collaborative: 0.3,
      'content-based': 0.4,
      'query-based': 0.3
    };

    // Add collaborative recommendations
    collaborativeRecs.forEach(rec => {
      const key = rec.id;
      if (!combined.has(key)) {
        combined.set(key, { ...rec, finalScore: 0, sources: [] });
      }
      const item = combined.get(key);
      item.finalScore += rec.similarityScore * weights.collaborative;
      item.sources.push('collaborative');
    });

    // Add content-based recommendations
    contentBasedRecs.forEach(rec => {
      const key = rec.id;
      if (!combined.has(key)) {
        combined.set(key, { ...rec, finalScore: 0, sources: [] });
      }
      const item = combined.get(key);
      item.finalScore += rec.similarityScore * weights['content-based'];
      item.sources.push('content-based');
    });

    // Add query-based recommendations
    queryBasedRecs.forEach(rec => {
      const key = rec.id;
      if (!combined.has(key)) {
        combined.set(key, { ...rec, finalScore: 0, sources: [] });
      }
      const item = combined.get(key);
      item.finalScore += rec.similarityScore * weights['query-based'];
      item.sources.push('query-based');
    });

    // Convert to array and sort by final score
    const recommendations = Array.from(combined.values())
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, limit);

    // Add diversity bonus for different sources
    return this.addDiversityBonus(recommendations);
  }

  /**
   * Add diversity bonus to recommendations
   * @param {Array} recommendations - Recommendations array
   * @returns {Array} Recommendations with diversity bonus
   */
  addDiversityBonus(recommendations) {
    const seenGenres = new Set();
    const seenAuthors = new Set();
    
    return recommendations.map((rec, index) => {
      let diversityBonus = 0;
      
      // Genre diversity bonus
      if (rec.category && !seenGenres.has(rec.category)) {
        diversityBonus += 0.1;
        seenGenres.add(rec.category);
      }
      
      // Author diversity bonus
      if (rec.author && !seenAuthors.has(rec.author)) {
        diversityBonus += 0.05;
        seenAuthors.add(rec.author);
      }
      
      // Position bonus (prefer earlier recommendations)
      const positionBonus = (recommendations.length - index) / recommendations.length * 0.05;
      
      return {
        ...rec,
        finalScore: rec.finalScore + diversityBonus + positionBonus,
        diversityBonus,
        positionBonus
      };
    });
  }

  /**
   * Generate explanation for recommendations
   * @param {Array} recommendations - Final recommendations
   * @param {Array} userHistory - User's reading history
   * @param {string} query - User query
   * @returns {string} Explanation text
   */
  generateExplanation(recommendations, userHistory, query) {
    const totalBooks = userHistory.length;
    const collaborativeCount = recommendations.filter(r => r.sources.includes('collaborative')).length;
    const contentBasedCount = recommendations.filter(r => r.sources.includes('content-based')).length;
    const queryBasedCount = recommendations.filter(r => r.sources.includes('query-based')).length;
    
    let explanation = `Based on your reading history of ${totalBooks} books`;
    
    if (query) {
      explanation += ` and your search for "${query}"`;
    }
    
    explanation += `, I've found ${recommendations.length} personalized recommendations using:`;
    
    const methods = [];
    if (collaborativeCount > 0) methods.push(`${collaborativeCount} from similar readers`);
    if (contentBasedCount > 0) methods.push(`${contentBasedCount} from your reading preferences`);
    if (queryBasedCount > 0) methods.push(`${queryBasedCount} from your search terms`);
    
    explanation += ` ${methods.join(', ')}.`;
    
    return explanation;
  }

  /**
   * Generate user profile summary
   * @param {string} studentIdNumber - Student ID number
   * @returns {Object} User profile summary
   */
  async generateUserProfile(studentIdNumber) {
    try {
      const userHistory = await this.getUserReadingHistory(studentIdNumber);
      const profile = this.createUserProfile(userHistory);
      
      return {
        totalBooksRead: profile.totalBooks,
        completedBooks: profile.completedBooks,
        favoriteGenres: Object.entries(profile.favoriteGenres)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([genre, score]) => ({ genre, score: Math.round(score * 100) })),
        favoriteAuthors: Object.entries(profile.favoriteAuthors)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([author, score]) => ({ author, score: Math.round(score * 100) })),
        readingDiversity: this.calculateReadingDiversity(profile)
      };
    } catch (error) {
      console.error('[ERROR] Error generating user profile:', error);
      return null;
    }
  }

  /**
   * Calculate reading diversity score
   * @param {Object} profile - User profile
   * @returns {number} Diversity score (0-1)
   */
  calculateReadingDiversity(profile) {
    const genreCount = Object.keys(profile.favoriteGenres).length;
    const authorCount = Object.keys(profile.favoriteAuthors).length;
    const maxPossible = Math.min(profile.totalBooks, 10); // Assume max 10 different genres/authors
    
    const genreDiversity = Math.min(genreCount / maxPossible, 1);
    const authorDiversity = Math.min(authorCount / maxPossible, 1);
    
    return (genreDiversity + authorDiversity) / 2;
  }

  /**
   * Calculate confidence score for recommendations
   * @param {Array} recommendations - Recommendations array
   * @param {Array} userHistory - User's reading history
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidence(recommendations, userHistory) {
    if (recommendations.length === 0) return 0;
    
    const avgScore = recommendations.reduce((sum, rec) => sum + rec.finalScore, 0) / recommendations.length;
    const historyWeight = Math.min(userHistory.length / 10, 1); // More history = higher confidence
    const diversityWeight = this.calculateDiversityScore(recommendations);
    
    return Math.min(avgScore * 0.5 + historyWeight * 0.3 + diversityWeight * 0.2, 1);
  }

  /**
   * Calculate diversity score for recommendations
   * @param {Array} recommendations - Recommendations array
   * @returns {number} Diversity score (0-1)
   */
  calculateDiversityScore(recommendations) {
    const genres = new Set(recommendations.map(r => r.category).filter(Boolean));
    const authors = new Set(recommendations.map(r => r.author).filter(Boolean));
    
    const genreDiversity = genres.size / Math.min(recommendations.length, 5);
    const authorDiversity = authors.size / Math.min(recommendations.length, 5);
    
    return (genreDiversity + authorDiversity) / 2;
  }

  /**
   * Generate dynamic collaborative reason for recommendation
   * @param {Object} rec - Recommendation object
   * @returns {string} Dynamic reason text
   */
  generateDynamicCollaborativeReason(rec) {
    const reasons = [
      `Readers with similar tastes loved this one!`,
      `This book is popular among readers like you`,
      `Similar readers found this absolutely captivating`,
      `A favorite among readers with your preferences`,
      `This gem was highly rated by readers like you`,
      `Readers with similar interests couldn't put this down`,
      `A must-read according to readers with your taste`,
      `This book resonated with readers who share your interests`
    ];
    
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  /**
   * Generate dynamic content-based reason for recommendation
   * @param {Object} book - Book object
   * @param {Object} userProfile - User profile
   * @returns {string} Dynamic reason text
   */
  generateDynamicContentBasedReason(book, userProfile) {
    const reasons = [];
    
    if (book.category && userProfile.favoriteGenres[book.category]) {
      const score = Math.round(userProfile.favoriteGenres[book.category] * 100);
      const categoryReasons = [
        `Perfect for your love of ${book.category} books`,
        `This ${book.category} book is right up your alley`,
        `A great addition to your ${book.category} collection`,
        `This ${book.category} title matches your reading style`,
        `You'll love this ${book.category} book based on your preferences`
      ];
      reasons.push(categoryReasons[Math.floor(Math.random() * categoryReasons.length)]);
    }
    
    if (book.author && userProfile.favoriteAuthors[book.author]) {
      const score = Math.round(userProfile.favoriteAuthors[book.author] * 100);
      const authorReasons = [
        `By ${book.author}, an author you've enjoyed before`,
        `Another great read from ${book.author}`,
        `This ${book.author} book is perfect for you`,
        `You'll love this latest from ${book.author}`,
        `A must-read from your favorite author ${book.author}`
      ];
      reasons.push(authorReasons[Math.floor(Math.random() * authorReasons.length)]);
    }
    
    if (reasons.length === 0) {
      const genericReasons = [
        `This book aligns perfectly with your reading taste`,
        `A great match for your reading preferences`,
        `This title fits your reading style beautifully`,
        `You'll find this book right up your alley`,
        `A perfect addition to your reading list`,
        `This book matches your literary interests`
      ];
      return genericReasons[Math.floor(Math.random() * genericReasons.length)];
    }
    
    return reasons.join(' and ');
  }

  /**
   * Generate dynamic query-based reason for recommendation
   * @param {Object} book - Book object
   * @param {string} query - User query
   * @returns {string} Dynamic reason text
   */
  generateDynamicQueryBasedReason(book, query) {
    const queryReasons = [
      `Perfect match for your search about "${query}"`,
      `This book is exactly what you're looking for`,
      `A great find based on your "${query}" search`,
      `This title fits your "${query}" interests perfectly`,
      `You'll love this book based on your search`,
      `This is exactly what you asked for!`,
      `A perfect match for your query`,
      `This book delivers on your "${query}" search`
    ];
    
    return queryReasons[Math.floor(Math.random() * queryReasons.length)];
  }

  /**
   * Generate content-based reason for recommendation (legacy method)
   * @param {Object} book - Book object
   * @param {Object} userProfile - User profile
   * @returns {string} Reason text
   */
  generateContentBasedReason(book, userProfile) {
    const reasons = [];
    
    if (book.category && userProfile.favoriteGenres[book.category]) {
      const score = Math.round(userProfile.favoriteGenres[book.category] * 100);
      reasons.push(`matches your interest in ${book.category} (${score}% match)`);
    }
    
    if (book.author && userProfile.favoriteAuthors[book.author]) {
      const score = Math.round(userProfile.favoriteAuthors[book.author] * 100);
      reasons.push(`by ${book.author} who you've enjoyed before (${score}% match)`);
    }
    
    if (reasons.length === 0) {
      return 'similar to books you might enjoy';
    }
    
    return reasons.join(' and ');
  }

  /**
   * Get user's reading history
   * @param {string} studentIdNumber - Student ID number
   * @returns {Array} User's reading history
   */
  async getUserReadingHistory(studentIdNumber) {
    try {
      const [history] = await pool.execute(`
        SELECT 
          bt.id,
          bt.borrowed_date,
          bt.returned_date,
          bt.status,
          b.id as book_id,
          b.title,
          b.author,
          b.category,
          b.description,
          b.publication_year,
          b.publisher,
          DATEDIFF(COALESCE(bt.returned_date, NOW()), bt.borrowed_date) as days_kept,
          CASE 
            WHEN bt.returned_date IS NOT NULL THEN 1 
            ELSE 0 
          END as completed_reading
        FROM borrowing_transactions bt
        JOIN books b ON bt.book_id = b.id
        WHERE bt.student_id_number = ?
        ORDER BY bt.borrowed_date DESC
      `, [studentIdNumber]);

      return history;
    } catch (error) {
      console.error('[ERROR] Error getting user reading history:', error);
      return [];
    }
  }
}

module.exports = new AdvancedRecommendationService();
