const express = require('express');
const router = express.Router();
const chatbotService = require('../utils/chatbotService');
const vectorDBService = require('../utils/vectorDBService');
const readingHistoryService = require('../utils/readingHistoryService');
const userKnowledgeService = require('../services/userKnowledgeService');
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
    const { message, studentIdNumber, conversationHistory = [] } = req.body;
    
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
    const isBookRequest = /book|recommend|suggest|find|search|read|novel|story|author|category/i.test(message);
    
    let response;
    let books = [];

    if (isBookRequest) {
      try {
        // Use advanced hybrid recommendations if student ID is provided
        if (studentIdNumber) {
          console.log('🚀 Using advanced hybrid recommendations');
          const advancedResult = await chatbotService.generateAdvancedRecommendations(studentIdNumber, message, 5);
          
          response = advancedResult.aiExplanation || advancedResult.explanation;
          books = advancedResult.recommendations || [];
          
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
              books: books.slice(0, 3), // Return top 3 books
              isBookRequest,
              aiPowered: true,
              advancedRecommendations: true,
              metadata
            }
          });
          return;
        } else {
          // Fallback to original vector search for non-authenticated users
          books = await vectorDBService.searchSimilarBooks(message, 5);
          
          if (books.length > 0) {
            response = await chatbotService.generateRecommendation(message, books, studentIdNumber);
          } else {
            response = "I couldn't find a match in the library records, but I can still help you. Could you tell me more about what you're looking for? For example, you could mention a specific category, author, or describe the type of story you want to read.";
          }
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
        response = await chatbotService.getGeneralResponse(contextualMessage, studentIdNumber);
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
