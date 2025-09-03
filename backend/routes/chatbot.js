const express = require('express');
const router = express.Router();
const chatbotService = require('../utils/chatbotService');
const vectorDBService = require('../utils/vectorDBService');
const { body, validationResult } = require('express-validator');

// Initialize vector database when route is loaded
vectorDBService.initialize().catch(error => {
  console.error('❌ Failed to initialize vector database:', error.message);
  console.error('🚨 Chatbot will not work until AI embeddings are generated successfully');
});

// Chat with chatbot and get book recommendations
router.post('/recommend', [
  body('message').notEmpty().withMessage('Message is required'),
  body('message').isLength({ min: 3, max: 500 }).withMessage('Message must be between 3 and 500 characters')
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

    const { message } = req.body;
    
    // Check if vector database is properly initialized
    if (!vectorDBService.isInitialized || !vectorDBService.useRealEmbeddings) {
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
          // Generate AI-powered recommendation
          response = await chatbotService.generateRecommendation(message, books);
        } else {
          // No books found, get general response
          response = await chatbotService.getGeneralResponse(
            `I couldn't find specific books matching "${message}". Could you please provide more details about what you're looking for?`
          );
        }
      } catch (searchError) {
        console.error('❌ Error in book search:', searchError.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to search for books. Please try again.',
          error: searchError.message
        });
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

module.exports = router;
