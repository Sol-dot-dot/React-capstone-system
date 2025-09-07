const express = require('express');
const router = express.Router();
const chatbotService = require('../utils/chatbotService');
const vectorDBService = require('../utils/vectorDBService');
const readingHistoryService = require('../utils/readingHistoryService');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// Initialize vector database when route is loaded
vectorDBService.initialize().catch(error => {
  console.error('❌ Failed to initialize vector database:', error.message);
  console.error('🚨 Chatbot will not work until AI embeddings are generated successfully');
});

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

// Simple fallback endpoint for basic chat without AI
router.post('/simple', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string' || message.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be at least 3 characters'
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

// Chat with chatbot and get book recommendations
router.post('/recommend', async (req, res) => {
  try {
    const { message, studentIdNumber } = req.body;
    
    // Manual validation
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a string'
      });
    }
    
    if (message.length < 3 || message.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Message must be between 3 and 500 characters'
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
    
    // Check if message is asking for book recommendations
    const isBookRequest = /book|recommend|suggest|find|search|read|novel|story|author|genre/i.test(message);
    
    let response;
    let books = [];

    if (isBookRequest) {
      try {
        // Search for similar books using AI vector database
        books = await vectorDBService.searchSimilarBooks(message, 5);
        
        if (books.length > 0) {
          // Generate AI-powered recommendation with personalization if student ID provided
          response = await chatbotService.generateRecommendation(message, books, studentIdNumber);
        } else {
          // No books found, get general response
          response = "I couldn't find a match in the library records, but I can still help you. Could you tell me more about what you're looking for? For example, you could mention a specific genre, author, or describe the type of story you want to read.";
        }
      } catch (searchError) {
        console.error('❌ Error in book search:', searchError.message);
        // Graceful fallback for RAG failures
        response = "I couldn't find a match in the library records, but I can still help you. Could you tell me more about what you're looking for? For example, you could mention a specific genre, author, or describe the type of story you want to read.";
        books = [];
      }
    } else {
      // General chat response
      try {
        response = await chatbotService.getGeneralResponse(message);
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
        books: books.slice(0, 3), // Return top 3 books
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
