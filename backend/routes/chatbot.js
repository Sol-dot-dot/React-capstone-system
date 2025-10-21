const express = require('express');
const router = express.Router();
const chatbotService = require('../utils/chatbotService');
const vectorDBService = require('../utils/vectorDBService');
const readingHistoryService = require('../utils/readingHistoryService');
const userKnowledgeService = require('../services/userKnowledgeService');
const db = require('../config/database');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// Initialize vector database when route is loaded
vectorDBService.initialize().catch(error => {
  console.error('❌ Failed to initialize vector database:', error.message);
  console.error('🚨 Chatbot will not work until AI embeddings are generated successfully');
});

// Add: helper to validate that candidate books exist in DB
async function filterBooksInDb(books) {
  try {
    if (!Array.isArray(books) || books.length === 0) return [];
    const ids = books
      .map(b => b?.id)
      .filter(id => typeof id === 'number' || (typeof id === 'string' && id !== ''));
    if (ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    const [rows] = await db.execute(
      `SELECT id, title, author, category, description, status FROM books WHERE id IN (${placeholders})`,
      ids
    );
    const order = new Map(ids.map((id, i) => [String(id), i]));
    return rows.sort((a, b) => (order.get(String(a.id)) ?? 0) - (order.get(String(b.id)) ?? 0));
  } catch (e) {
    console.error('❌ Error filtering books against DB:', e.message);
    return [];
  }
}

// Build a strictly DB-grounded response message from validated books
function buildSafeRecommendationsMessage(books, query = '') {
  if (!Array.isArray(books) || books.length === 0) {
    return query
      ? `I couldn't find books in our catalog that match "${query}". Can you specify an author, category, or keywords so I can search again?`
      : `I couldn't find matching books in our catalog right now. Tell me a category, author, or topic and I'll search again.`;
  }

  const lines = books.map((b, i) => `${i + 1}. "${b.title}" by ${b.author}${b.category ? ` (${b.category})` : ''}`);
  let intro = query
    ? `Here ${books.length === 1 ? 'is' : 'are'} ${books.length} book${books.length === 1 ? '' : 's'} in our catalog related to "${query}":`
    : `Here ${books.length === 1 ? 'is' : 'are'} ${books.length} book${books.length === 1 ? '' : 's'} currently in our catalog:`;
  return `${intro}

${lines.join('\n')}

Want more like these or a different topic?`;
}

// Rank and filter books strictly against the user's query to improve topical accuracy
function rankBooksAgainstQuery(books, query = '') {
  if (!Array.isArray(books) || books.length === 0) return { ranked: [], explanation: { query, tokens: [], expandedTerms: [], scored: [] } };
  const q = (query || '').toLowerCase();
  const stop = new Set(['the','a','an','about','me','some','books','book','recommend','suggest','find','on','for','to','of','and','or']);
  const rawTokens = q
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t && !stop.has(t));

  // very light stemming/normalization for plurals and common variants
  const normalizeToken = (t) => {
    if (t.endsWith('ies') && t.length > 4) return t.slice(0, -3) + 'y';
    if (t.endsWith('es') && t.length > 3) return t.slice(0, -2);
    if (t.endsWith('s') && t.length > 3) return t.slice(0, -1);
    return t;
  };
  const tokens = rawTokens.map(normalizeToken);

  const synonymPairs = [
    ['mobile', ['mobile','android','ios','react native','flutter','kotlin','swift']],
    ['web', ['web','website','websites','web development','html','css','javascript','react','node','frontend','backend']],
    ['cybersecurity', ['security','cybersecurity','hacking','ethical hacking','defense']],
  ];

  const expanded = new Set(tokens);
  tokens.forEach(t => {
    synonymPairs.forEach(([key, list]) => {
      if (t === key || key.includes(t) || t.includes(key)) {
        list.forEach(s => expanded.add(s));
      }
    });
  });
  const terms = Array.from(expanded);

  const scored = books.map(b => {
    const title = (b.title || '').toLowerCase();
    const category = (b.category || '').toLowerCase();
    const desc = (b.description || '').toLowerCase();
    let score = 0;
    let titleHits = [];
    let categoryHits = [];
    let descHits = [];
    for (const term of terms) {
      if (!term) continue;
      if (title.includes(term)) { score += 3; titleHits.push(term); }
      if (category.includes(term)) { score += 2; categoryHits.push(term); }
      if (desc.includes(term)) { score += 1; descHits.push(term); }
    }
    return { ...b, _score: score, _matches: { title: Array.from(new Set(titleHits)), category: Array.from(new Set(categoryHits)), description: Array.from(new Set(descHits)) } };
  });

  // Require at least minimal relevance if query had any meaningful tokens
  const hasTerms = terms.length > 0;
  let filtered = hasTerms ? scored.filter(b => b._score > 0) : scored;
  // If nothing matched, fall back to best title/category contains on normalized tokens
  if (filtered.length === 0 && hasTerms) {
    filtered = scored
      .map(b => {
        const title = (b.title || '').toLowerCase();
        const cat = (b.category || '').toLowerCase();
        const extra = tokens.some(t => title.includes(t) || cat.includes(t)) ? 1 : 0;
        return { ...b, _score: extra, _matches: b._matches };
      })
      .filter(b => b._score > 0);
  }
  const ranked = filtered
    .sort((a, b) => b._score - a._score || String(a.title).localeCompare(String(b.title)));

  const explanation = {
    query,
    tokens,
    expandedTerms: terms,
    scored: ranked.slice(0, 10).map(b => ({ id: b.id, title: b.title, score: b._score, matches: b._matches }))
  };

  return { ranked: ranked.map(({ _score, _matches, ...rest }) => rest), explanation };
}

// Simple test endpoint to verify chatbot is working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Chatbot service is running',
    timestamp: new Date().toISOString(),
    vectorDBStatus: {
      isInitialized: vectorDBService.isInitialized,
      useRealEmbeddings: vectorDBService.useRealEmbeddings,
      bookCount: vectorDBService.books?.length || 0
    }
  });
});

// Chatbot status endpoint
router.get('/status', async (req, res) => {
  try {
    const status = {
      success: true,
      timestamp: new Date().toISOString(),
      services: {
        vectorDB: {
          isInitialized: vectorDBService.isInitialized,
          useRealEmbeddings: vectorDBService.useRealEmbeddings,
          bookCount: vectorDBService.books?.length || 0,
          status: vectorDBService.isInitialized ? 'Ready' : 'Not Initialized'
        },
        chatbot: {
          status: 'Running',
          aiPowered: vectorDBService.isInitialized && vectorDBService.useRealEmbeddings
        },
        openai: {
          status: 'Unknown',
          lastError: null
        }
      }
    };

    // Test OpenAI API key by making a simple request
    try {
      const testResponse = await chatbotService.testOpenAI();
      status.services.openai.status = 'Working';
      status.services.openai.lastTest = new Date().toISOString();
    } catch (openaiError) {
      status.services.openai.status = 'Error';
      status.services.openai.lastError = openaiError.message;
      status.services.openai.lastErrorTime = new Date().toISOString();
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get chatbot status',
      error: error.message
    });
  }
});

// Vector DB integrity report
router.get('/vector-integrity', async (req, res) => {
  try {
    if (!vectorDBService.isInitialized) {
      // Attempt lazy init to ensure fresh data
      await vectorDBService.initialize();
    }
    const report = vectorDBService.getIntegrityReport();
    res.json({ success: true, data: report });
  } catch (error) {
    console.error('❌ Error generating vector integrity report:', error);
    res.status(500).json({ success: false, message: 'Failed to build integrity report', error: error.message });
  }
});

// Debug: show what the chatbot vector DB sees from the database
router.get('/debug-books', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT COUNT(*) AS c FROM books');
    const total = rows?.[0]?.c || 0;
    const sample = (vectorDBService.books || []).slice(0, 20).map(b => ({ id: b.id, title: b.title, author: b.author, status: b.status }));
    res.json({
      success: true,
      data: {
        dbBookCount: total,
        vectorBooksCount: vectorDBService.books?.length || 0,
        sample
      }
    });
  } catch (error) {
    console.error('❌ Error in /debug-books:', error);
    res.status(500).json({ success: false, message: 'Failed to get debug books', error: error.message });
  }
});

// Simple fallback endpoint for basic chat without AI
router.post('/simple', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string' || message.length < 1) {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be at least 1 character'
      });
    }
    
    // Simple response without AI
    const response = "I'm a simple chatbot. For full AI-powered book recommendations, please use the main chatbot endpoint.";
    
    res.json({
      success: true,
      data: {
        response,
        books: [],
        isBookRequest: false,
        aiPowered: false
      }
    });
  } catch (error) {
    console.error('❌ Simple chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request',
      error: error.message
    });
  }
});

// Enhanced book request detection function
function detectBookRequest(message) {
  const query = message.toLowerCase();
  
  // Direct book-related keywords
  const bookKeywords = [
    'book', 'books', 'novel', 'novels', 'story', 'stories', 'read', 'reading',
    'author', 'authors', 'writer', 'writers', 'title', 'titles', 'genre', 'genres',
    'category', 'categories', 'fiction', 'non-fiction', 'nonfiction', 'biography',
    'autobiography', 'memoir', 'textbook', 'textbooks', 'manual', 'manuals',
    'guide', 'guides', 'tutorial', 'tutorials', 'reference', 'references'
  ];
  
  // Recommendation keywords
  const recommendationKeywords = [
    'recommend', 'recommendation', 'recommendations', 'suggest', 'suggestion',
    'suggestions', 'advise', 'advice', 'what should', 'what to read', 'what book',
    'find me', 'help me find', 'looking for', 'search for', 'searching for',
    'need a book', 'want a book', 'good book', 'best book', 'favorite book',
    'popular book', 'trending book', 'new book', 'latest book'
  ];
  
  // Subject/topic keywords that might relate to books
  const subjectKeywords = [
    'learn', 'learning', 'study', 'studying', 'education', 'academic',
    'programming', 'coding', 'development', 'web', 'mobile', 'app', 'software',
    'design', 'art', 'history', 'science', 'technology', 'business',
    'psychology', 'philosophy', 'literature', 'poetry', 'drama', 'theater',
    'music', 'film', 'cinema', 'photography', 'cooking', 'travel', 'health',
    'fitness', 'sports', 'gaming', 'comics', 'manga', 'anime'
  ];
  
  // Question patterns that might be about books
  const questionPatterns = [
    /what.*book/i,
    /which.*book/i,
    /how.*learn/i,
    /where.*find/i,
    /can.*recommend/i,
    /do.*have/i,
    /is.*available/i,
    /show.*me/i,
    /give.*me/i,
    /any.*good/i
  ];
  
  // Check for direct book keywords
  const hasBookKeywords = bookKeywords.some(keyword => query.includes(keyword));
  
  // Check for recommendation keywords
  const hasRecommendationKeywords = recommendationKeywords.some(keyword => query.includes(keyword));
  
  // Check for subject keywords (but only if combined with other indicators)
  const hasSubjectKeywords = subjectKeywords.some(keyword => query.includes(keyword));
  
  // Check for question patterns
  const hasQuestionPatterns = questionPatterns.some(pattern => pattern.test(query));
  
  // Check for specific phrases that indicate book interest
  const bookPhrases = [
    'what to read', 'what should i read', 'book about', 'books on',
    'learn about', 'study about', 'read about', 'interested in',
    'curious about', 'want to know', 'need to learn', 'help with'
  ];
  
  const hasBookPhrases = bookPhrases.some(phrase => query.includes(phrase));
  
  // Decision logic: more flexible detection
  if (hasBookKeywords || hasRecommendationKeywords || hasBookPhrases) {
    return true;
  }
  
  // If it has subject keywords AND is a question/request, likely about books
  if (hasSubjectKeywords && (hasQuestionPatterns || query.includes('?'))) {
    return true;
  }
  
  // If it's a general question about learning/studying, likely wants book recommendations
  if (query.includes('learn') || query.includes('study') || query.includes('education')) {
    return true;
  }
  
  // If it's asking for help with a specific topic, likely wants books
  if (query.includes('help') && (hasSubjectKeywords || query.includes('with'))) {
    return true;
  }
  
  return false;
}

// Validate that books actually exist in the database
async function validateBooksInDatabase(books) {
  if (!books || books.length === 0) return [];
  
  try {
    const bookIds = books.map(book => book.id).filter(id => id);
    if (bookIds.length === 0) return [];
    
    const placeholders = bookIds.map(() => '?').join(',');
    const [existingBooks] = await db.execute(
      `SELECT id, title, author, status, available_copies FROM books WHERE id IN (${placeholders})`,
      bookIds
    );
    
    // Filter to only include books that actually exist in DB
    const validBooks = books.filter(book => 
      existingBooks.some(dbBook => dbBook.id === book.id)
    );
    
    console.log(`✅ Validated ${validBooks.length}/${books.length} books exist in database`);
    return validBooks;
    
  } catch (error) {
    console.error('❌ Error validating books in database:', error);
    return []; // Return empty array if validation fails
  }
}

// Chat with chatbot and get book recommendations
router.post('/recommend', async (req, res) => {
  try {
    const { message, studentIdNumber, conversationHistory = [], explain = false } = req.body;
    
    // Manual validation
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a string'
      });
    }
    
    if (message.length < 1 || message.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Message must be between 1 and 500 characters'
      });
    }
    
    // Validate studentIdNumber if provided
    if (studentIdNumber !== undefined && studentIdNumber !== null && studentIdNumber !== '') {
      if (typeof studentIdNumber !== 'string' || studentIdNumber.length < 1 || studentIdNumber.length > 20) {
        return res.status(400).json({
          success: false,
          message: 'Student ID must be between 1 and 20 characters'
        });
      }
    }
    
    console.log('🤖 Chatbot request received:', { 
      message: message?.substring(0, 50) + '...', 
      hasStudentId: !!studentIdNumber,
      studentIdLength: studentIdNumber?.length || 0
    });
    
    // Check if vector database is properly initialized
    if (!vectorDBService.isInitialized || !vectorDBService.useRealEmbeddings) {
      console.error('❌ Vector database not initialized');
      return res.status(503).json({
        success: false,
        message: 'AI service is not ready. Please wait for initialization to complete or check server logs.',
        error: 'Vector database not initialized with AI embeddings'
      });
    }
    
    // Enhanced book request detection - more flexible and intelligent
    const isBookRequest = this.detectBookRequest(message);
    
    let response;
    let books = [];

    if (isBookRequest) {
      try {
        // Use advanced hybrid recommendations if student ID is provided
        if (studentIdNumber) {
          console.log('🚀 Using advanced hybrid recommendations');
          const advancedResult = await chatbotService.generateAdvancedRecommendations(studentIdNumber, message, 5);
          
          // Validate returned books against DB and improve topical accuracy
          books = await filterBooksInDb(advancedResult.recommendations || []);
          const rankedAdv = rankBooksAgainstQuery(books, message);
          books = rankedAdv.ranked.slice(0, 5);
          
          // Double-check that all books exist in database
          books = await this.validateBooksInDatabase(books);
          response = buildSafeRecommendationsMessage(books, message);
          
          // Add additional metadata
          const metadata = {
            recommendationEngine: advancedResult.recommendationEngine,
            confidence: advancedResult.confidence,
            userProfile: advancedResult.userProfile,
            sources: books.map(book => book.sources || []).flat()
          };
          
          res.json({
            success: true,
            data: {
              response,
              books, // DB-validated books only
              isBookRequest,
              aiPowered: true,
              advancedRecommendations: true,
              metadata,
              reasoning: explain ? rankedAdv.explanation : undefined
            }
          });
          return;
        } else {
          // Fallback to original vector search for non-authenticated users (only available books)
          books = await vectorDBService.searchSimilarBooks(message, 10);
          books = await filterBooksInDb(books);
          const ranked = rankBooksAgainstQuery(books, message);
          books = ranked.ranked.slice(0, 5);
          
          // Validate books exist in database
          books = await validateBooksInDatabase(books);
          response = buildSafeRecommendationsMessage(books, message);
        }
      } catch (searchError) {
        console.error('❌ Error in book search:', searchError.message);
        // Graceful fallback for RAG failures
        response = "I couldn't find a match in the library records, but I can still help you. Could you tell me more about what you're looking for? For example, you could mention a specific category, author, or describe the type of story you want to read.";
        books = [];
      }
    } else {
      // General chat response with user context and conversation history
      try {
        // Add conversation context to the message
        const contextualMessage = chatbotService.addConversationContext(message, conversationHistory);
        // Intercept factual queries we can answer from DB to avoid hallucination
        const lower = message.toLowerCase();
        if (/how many books|total books|books does this library have/.test(lower)) {
          try {
            const [rows] = await db.execute(`SELECT COUNT(*) AS c FROM books`);
            const total = rows?.[0]?.c || 0;
            response = `We currently have ${total} book${total === 1 ? '' : 's'} in the catalog.`;
          } catch (e) {
            response = "I couldn't fetch the total count right now.";
          }
        } else {
          response = await chatbotService.getEnhancedGeneralResponse(contextualMessage, studentIdNumber);
        }
      } catch (chatError) {
        console.error('❌ Error generating chat response:', chatError.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to generate response. Please try again.',
          error: chatError.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        response,
        books, // DB-validated books only
        isBookRequest,
        aiPowered: true
      }
    });

  } catch (error) {
    console.error('❌ Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request',
      error: error.message
    });
  }
});

// Get chat history (optional - for future enhancement)
router.get('/history', async (req, res) => {
  try {
    // For now, return empty history
    // In the future, you could store chat history in database
    res.json({
      success: true,
      data: {
        history: []
      }
    });
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while getting chat history'
    });
  }
});

// Refresh vector database (admin endpoint)
router.post('/refresh-index', async (req, res) => {
  try {
    await vectorDBService.refreshIndex();
    res.json({
      success: true,
      message: 'AI vector database refreshed successfully'
    });
  } catch (error) {
    console.error('❌ Error refreshing vector database:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh AI vector database',
      error: error.message
    });
  }
});

// Get vector database status
router.get('/status', async (req, res) => {
  try {
    const status = {
      isInitialized: vectorDBService.isInitialized,
      useRealEmbeddings: vectorDBService.useRealEmbeddings,
      bookCount: vectorDBService.books.length,
      embeddingCount: vectorDBService.embeddings.length,
      hasEmbeddings: vectorDBService.embeddings.length > 0
    };

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('❌ Error getting vector database status:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while getting status',
      error: error.message
    });
  }
});

// Get personalized recommendations based on reading history
router.post('/personalized', [
  body('studentIdNumber').notEmpty().withMessage('Student ID number is required'),
  body('limit').optional().isInt({ min: 1, max: 10 }).withMessage('Limit must be between 1 and 10')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { studentIdNumber, limit = 5 } = req.body;

    // Generate personalized recommendations
    const result = await chatbotService.generatePersonalizedRecommendations(studentIdNumber, limit);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Error generating personalized recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while generating personalized recommendations',
      error: error.message
    });
  }
});

// Get advanced hybrid recommendations
router.post('/advanced-recommendations', [
  body('studentIdNumber').notEmpty().withMessage('Student ID number is required'),
  body('query').optional().isString().withMessage('Query must be a string'),
  body('limit').optional().isInt({ min: 1, max: 10 }).withMessage('Limit must be between 1 and 10')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { studentIdNumber, query = '', limit = 5 } = req.body;

    // Generate advanced hybrid recommendations
    const result = await chatbotService.generateAdvancedRecommendations(studentIdNumber, query, limit);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Error generating advanced recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while generating advanced recommendations',
      error: error.message
    });
  }
});

// Submit user feedback for recommendations
router.post('/feedback', [
  body('messageId').notEmpty().withMessage('Message ID is required'),
  body('feedback').isIn(['helpful', 'not-helpful']).withMessage('Feedback must be helpful or not-helpful'),
  body('studentIdNumber').optional().isString().withMessage('Student ID must be a string')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { messageId, feedback, studentIdNumber } = req.body;

    // Log feedback for analytics
    console.log(`📝 User feedback received:`, {
      messageId,
      feedback,
      studentIdNumber,
      timestamp: new Date().toISOString()
    });

    // Store feedback in database (optional)
    // You can add a feedback table to store this data for analytics

    res.json({
      success: true,
      message: 'Feedback received successfully',
      data: {
        messageId,
        feedback,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error processing feedback:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing feedback',
      error: error.message
    });
  }
});

// Get comprehensive user knowledge
router.get('/user-knowledge/:studentIdNumber', async (req, res) => {
  try {
    const { studentIdNumber } = req.params;

    if (!studentIdNumber) {
      return res.status(400).json({
        success: false,
        message: 'Student ID number is required'
      });
    }

    // Get comprehensive user knowledge
    const userKnowledge = await userKnowledgeService.getUserKnowledge(studentIdNumber);

    res.json({
      success: true,
      data: userKnowledge
    });

  } catch (error) {
    console.error('❌ Error getting user knowledge:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while getting user knowledge',
      error: error.message
    });
  }
});

// Get dynamic conversation starter
router.get('/conversation-starter/:studentIdNumber', async (req, res) => {
  try {
    const { studentIdNumber } = req.params;

    if (!studentIdNumber) {
      return res.status(400).json({
        success: false,
        message: 'Student ID number is required'
      });
    }

    // Get user knowledge and generate dynamic starter
    const userKnowledge = await userKnowledgeService.getUserKnowledge(studentIdNumber);
    const dynamicStarter = chatbotService.generateDynamicStarter(userKnowledge);

    res.json({
      success: true,
      data: {
        message: dynamicStarter,
        userKnowledge: userKnowledge.summary
      }
    });

  } catch (error) {
    console.error('❌ Error getting conversation starter:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while getting conversation starter',
      error: error.message
    });
  }
});

// Get user's reading history analysis
router.get('/reading-history/:studentIdNumber', async (req, res) => {
  try {
    const { studentIdNumber } = req.params;

    if (!studentIdNumber) {
      return res.status(400).json({
        success: false,
        message: 'Student ID number is required'
      });
    }

    // Analyze user's reading history
    const analysis = await readingHistoryService.analyzeUserReadingHistory(studentIdNumber);

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('❌ Error analyzing reading history:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while analyzing reading history',
      error: error.message
    });
  }
});

// Get system-wide reading statistics (admin only)
router.get('/analytics', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Get system-wide reading statistics
    const statistics = await readingHistoryService.getSystemReadingStatistics();

    res.json({
      success: true,
      data: statistics
    });

  } catch (error) {
    console.error('❌ Error getting reading analytics:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while getting reading analytics',
      error: error.message
    });
  }
});

module.exports = router;
