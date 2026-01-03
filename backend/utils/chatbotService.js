const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const OpenAI = require('openai');
const readingHistoryService = require('./readingHistoryService');
const advancedRecommendationService = require('../services/advancedRecommendationService');
const userKnowledgeService = require('../services/userKnowledgeService');
require('dotenv').config({ path: './config.env' });

class ChatbotService {
  constructor() {
    this.systemPrompt = `You are a knowledgeable, friendly library assistant with a genuine passion for books and helping people discover their next great read. You're like that librarian who knows exactly what someone will love based on their interests and reading history.

    CRITICAL RULES (Anti-hallucination):
    - Use ONLY information explicitly provided to you in the current prompt/context (book context, user context, or explicit numeric stats passed in).
    - If a fact (numbers, titles, availability, policies, dates, counts) is not provided, say you don't know and ask a clarifying question. DO NOT guess or invent.
    - Recommend ONLY books that appear in the provided book context list. Never invent titles or authors.
    - When uncertain, respond conservatively with "I don't have that information yet" and propose next steps (e.g., refine search).

    Your Core Personality:
    - Genuinely enthusiastic about books and reading
    - Conversational and natural - like talking to a well-read friend
    - Thoughtful and considerate in your recommendations
    - Curious about what drives someone's reading choices
    - Supportive of their reading journey, whether they're new or experienced

    How You Communicate:
    - Be natural and conversational - no forced enthusiasm or templates
    - Use varied sentence structures and natural speech patterns
    - Ask thoughtful follow-up questions that show you're listening
    - Share insights about books that go beyond basic descriptions
    - Reference their reading history when relevant, but don't overdo it
    - Be specific about why a book might appeal to them personally
    - Use contractions and casual language when it feels right

    When Recommending Books:
    - Explain the connection between their interests and the book
    - Mention what makes each book special or unique
    - Consider their reading level and preferences
    - Suggest books that might challenge or expand their horizons
    - Be honest about books that might not be a perfect fit

    Personal Information Access:
    - You have access to their Student ID Number and can share it when asked
    - You know their reading history, current books, and preferences
    - You can answer questions about their borrowing status and account
    - Be helpful and transparent about what information you have

    Conversation Style:
    - Respond naturally to what they're saying
    - Build on their questions and interests
    - Offer additional insights they might not have considered
    - Keep the conversation flowing with relevant questions
    - Be engaging without being overwhelming

    What to Avoid:
    - Generic, template-like responses
    - Overly formal or robotic language
    - Repetitive phrases or patterns
    - Forced enthusiasm or artificial excitement
    - Long lists without personal context
    - Ignoring their specific interests or questions

    Remember: You're having a real conversation with someone who loves books. Be yourself, be helpful, and let your genuine interest in their reading journey shine through.`;
    
    // Initialize TF-IDF for local text similarity
    this.tfidf = new natural.TfIdf();
    this.isInitialized = false;
    
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    console.log('[OK] OpenAI client initialized for conversational AI');
  }

  async generateEmbedding(text) {
    try {
      console.log('[INFO] Generating OpenAI embedding...');
      
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-large",
        input: text,
      });
      
      if (response.data && response.data[0] && response.data[0].embedding) {
        console.log('[OK] OpenAI embedding generated successfully!');
        return response.data[0].embedding;
      } else {
        throw new Error('Invalid response format from OpenAI embeddings API');
      }
    } catch (error) {
      console.error('[ERROR] Error generating OpenAI embedding:', error.message);
      throw new Error('OpenAI embedding generation failed');
    }
  }

  async generateRecommendation(userQuery, bookResults, studentIdNumber = null) {
    try {
      console.log('[INFO] Generating RAG-powered recommendation with OpenAI...');

      // Get user's reading history for personalized recommendations
      let userPreferences = null;
      if (studentIdNumber) {
        try {
          userPreferences = await readingHistoryService.analyzeUserReadingHistory(studentIdNumber);
          console.log('[INFO] User reading preferences loaded for personalization');
        } catch (error) {
          console.log('[WARN] Could not load user preferences, using general recommendations');
        }
      }

      // Create detailed book context for RAG
      const bookContext = bookResults.map((book, index) => 
        `${index + 1}. **${book.title}** by ${book.author}
   Category: ${book.category}
   Description: ${book.description}
   Availability: ${book.status}
   Relevance Score: ${(book.similarity * 100).toFixed(1)}%`
      ).join('\n\n');

      // Create personalized context if user preferences are available
      let personalizationContext = '';
      if (userPreferences && userPreferences.totalBooksBorrowed > 0) {
        personalizationContext = `

User's Reading Profile:
- Total books borrowed: ${userPreferences.totalBooksBorrowed}
- Favorite categorys: ${userPreferences.favoriteGenres.slice(0, 3).map(g => `${g.name} (${g.percentage}%)`).join(', ')}
- Favorite authors: ${userPreferences.favoriteAuthors.slice(0, 3).map(a => a.name).join(', ')}
- Reading frequency: ${userPreferences.readingFrequency} books/month
- Average reading time: ${userPreferences.averageDaysKept} days per book
- Genre diversity: ${(userPreferences.categoryDiversity * 100).toFixed(0)}% diverse

Use this information to make more personalized recommendations that align with their reading patterns.`;
      }

      const prompt = `User Query: "${userQuery}"

Retrieved Book Context from Library Database (the ONLY books you may reference):
${bookContext}${personalizationContext}

STRICT INSTRUCTIONS:
- You MUST ONLY mention and recommend books that appear in the "Retrieved Book Context" list above.
- Do NOT invent or add any titles, authors, or works that are not in that list.
- If nothing in the context is a good match, say so and ask a clarifying follow‑up instead of proposing external titles.

Now provide a natural, conversational response that:
1. Acknowledges the user's request
2. Recommends specific books from the retrieved context only
3. Explains why each recommended book matches their interests
4. Mentions the category and key appeal of each book
5. ${userPreferences ? 'References their reading history and preferences when relevant' : 'Keeps the tone friendly and encouraging'}
6. Suggests how the books relate to their reading patterns (if user has history)`;

      try {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 600,
        });
        
        if (response.choices && response.choices[0] && response.choices[0].message) {
          console.log('[OK] RAG-powered personalized recommendation generated!');
          return response.choices[0].message.content;
        } else {
          throw new Error('Invalid response format from OpenAI');
        }
      } catch (apiError) {
        console.log('[INFO] OpenAI failed, falling back to smart response...');
        console.log('Error details:', apiError.message);
        
        // Fallback to smart NLP response if OpenAI fails
        const response = this.generateSmartResponse(userQuery, bookResults, userPreferences);
        console.log('[OK] Fallback smart response generated!');
        return response;
      }
    } catch (error) {
      console.error('[ERROR] Error generating recommendation:', error.message);
      throw new Error('AI recommendation generation failed');
    }
  }

  generateSmartResponse(userQuery, bookResults, userPreferences = null) {
    const queryTokens = tokenizer.tokenize(userQuery.toLowerCase());
    
    // Analyze user intent
    const isGenreRequest = this.containsGenreKeywords(queryTokens);
    const isAuthorRequest = this.containsAuthorKeywords(queryTokens);
    const isThemeRequest = this.containsThemeKeywords(queryTokens);
    
    if (bookResults.length === 0) {
      return `I couldn't find specific books matching "${userQuery}". Could you please provide more details about what you're looking for? For example, you could mention a specific category, author, or theme you're interested in.`;
    }
    
    // Generate contextual response
    let response = `Based on your request for "${userQuery}", here are some great book recommendations:\n\n`;
    
    bookResults.forEach((book, index) => {
      response += `${index + 1}. **${book.title}** by ${book.author}\n`;
      response += `   Category: ${book.category}\n`;
      response += `   ${book.description}\n\n`;
    });
    
    // Add personalized suggestion based on user preferences
    if (userPreferences && userPreferences.totalBooksBorrowed > 0) {
      // Check if any recommended books match user's favorite categorys
      const matchingGenres = bookResults.filter(book => 
        userPreferences.favoriteGenres.some(category => 
          category.name.toLowerCase() === book.category.toLowerCase()
        )
      );
      
      if (matchingGenres.length > 0) {
        response += `I've selected these books because they match your reading preferences! `;
        if (userPreferences.favoriteGenres.length > 0) {
          response += `You seem to enjoy ${userPreferences.favoriteGenres[0].name} books (${userPreferences.favoriteGenres[0].percentage}% of your reading), and some of these recommendations align with that preference. `;
        }
      }
      
      // Add reading pattern insights
      if (userPreferences.readingFrequency > 0) {
        response += `Based on your reading pace of ${userPreferences.readingFrequency} books per month, these selections should fit well into your reading schedule. `;
      }
    } else {
      // Generic suggestions for new users
      if (isGenreRequest) {
        response += `These books are perfect for someone interested in ${this.extractGenre(queryTokens)}! `;
      } else if (isAuthorRequest) {
        response += `I've included books from authors that match your preferences. `;
      } else if (isThemeRequest) {
        response += `These selections focus on the themes you mentioned. `;
      }
    }
    
    response += `Would you like me to suggest more books in a specific category or help you find something else?`;
    
    return response;
  }

  containsGenreKeywords(tokens) {
    const categoryKeywords = ['fiction', 'mystery', 'romance', 'sci-fi', 'fantasy', 'thriller', 'biography', 'history', 'poetry'];
    return tokens.some(token => categoryKeywords.includes(token));
  }

  containsAuthorKeywords(tokens) {
    const authorKeywords = ['author', 'writer', 'by', 'written'];
    return tokens.some(token => authorKeywords.includes(token));
  }

  containsThemeKeywords(tokens) {
    const themeKeywords = ['love', 'adventure', 'mystery', 'war', 'family', 'friendship', 'technology', 'nature'];
    return tokens.some(token => themeKeywords.includes(token));
  }

  extractGenre(tokens) {
    const categoryKeywords = ['fiction', 'mystery', 'romance', 'sci-fi', 'fantasy', 'thriller', 'biography', 'history', 'poetry'];
    for (const token of tokens) {
      if (categoryKeywords.includes(token)) {
        return token;
      }
    }
    return 'fiction'; // Default
  }

  async getEnhancedGeneralResponse(userQuery, studentIdNumber = null) {
    try {
      console.log('[INFO] Generating enhanced conversational AI response...');

      // First, try to understand what the user is asking for
      const queryAnalysis = this.analyzeUserQuery(userQuery);
      
      // If it's a question we can answer from database, do that first
      if (queryAnalysis.canAnswerFromDB) {
        try {
          const dbResponse = await this.getDatabaseResponse(queryAnalysis, studentIdNumber);
          if (dbResponse) {
            return dbResponse;
          }
        } catch (dbError) {
          console.log('[WARN] Database response failed, falling back to AI');
        }
      }

      // If it's a book-related question but wasn't caught by the main logic, try to help
      if (queryAnalysis.isBookRelated) {
        return this.getBookRelatedResponse(userQuery, studentIdNumber);
      }

      // For general questions, use the enhanced AI response
      return await this.getGeneralResponse(userQuery, studentIdNumber);
      
    } catch (error) {
      console.error('[ERROR] Error in enhanced general response:', error);
      return this.getFallbackResponse(userQuery);
    }
  }

  analyzeUserQuery(query) {
    const queryLower = query.toLowerCase();
    
    return {
      isBookRelated: this.isBookRelatedQuery(queryLower),
      canAnswerFromDB: this.canAnswerFromDatabase(queryLower),
      isPersonalQuestion: this.isPersonalQuestion(queryLower),
      isLibraryQuestion: this.isLibraryQuestion(queryLower),
      isGeneralQuestion: this.isGeneralQuestion(queryLower),
      intent: this.detectIntent(queryLower)
    };
  }

  isBookRelatedQuery(query) {
    const bookIndicators = [
      'book', 'books', 'read', 'reading', 'novel', 'story', 'author', 'title',
      'recommend', 'suggest', 'find', 'search', 'what to read', 'good book'
    ];
    return bookIndicators.some(indicator => query.includes(indicator));
  }

  canAnswerFromDatabase(query) {
    const dbQuestions = [
      'how many books', 'total books', 'books in library', 'library size',
      'available books', 'book count', 'catalog size', 'inventory'
    ];
    return dbQuestions.some(question => query.includes(question));
  }

  isPersonalQuestion(query) {
    const personalIndicators = [
      'my', 'me', 'i am', 'i have', 'my account', 'my books', 'my borrowing',
      'my history', 'my profile', 'my status', 'my id', 'my number'
    ];
    return personalIndicators.some(indicator => query.includes(indicator));
  }

  isLibraryQuestion(query) {
    const libraryIndicators = [
      'library', 'librarian', 'borrow', 'borrowing', 'return', 'due date',
      'overdue', 'fine', 'penalty', 'policy', 'rules', 'hours', 'location'
    ];
    return libraryIndicators.some(indicator => query.includes(indicator));
  }

  isGeneralQuestion(query) {
    return query.includes('?') || query.includes('what') || query.includes('how') || 
           query.includes('why') || query.includes('when') || query.includes('where');
  }

  detectIntent(query) {
    if (query.includes('help') || query.includes('assist')) return 'help';
    if (query.includes('thank')) return 'gratitude';
    if (query.includes('bye') || query.includes('goodbye')) return 'farewell';
    if (query.includes('hello') || query.includes('hi')) return 'greeting';
    if (query.includes('learn') || query.includes('study')) return 'learning';
    if (query.includes('recommend') || query.includes('suggest')) return 'recommendation';
    return 'general';
  }

  async getDatabaseResponse(analysis, studentIdNumber) {
    // Handle specific database queries
    if (analysis.intent === 'help' && analysis.isLibraryQuestion) {
      return "I can help you with book recommendations, finding specific titles, checking your borrowing status, and answering questions about our library services. What would you like to know?";
    }
    
    if (analysis.isPersonalQuestion && studentIdNumber) {
      return `I can help you with your account! Your Student ID is ${studentIdNumber}. I can check your borrowing history, recommend books based on your interests, and help you find what you're looking for. What would you like to know about your account?`;
    }
    
    return null;
  }

  getBookRelatedResponse(query, studentIdNumber) {
    if (query.includes('recommend') || query.includes('suggest')) {
      return "I'd love to recommend some great books! Could you tell me what topics or genres you're interested in? For example, you could mention fiction, non-fiction, programming, history, or any other subject that interests you.";
    }
    
    if (query.includes('find') || query.includes('search')) {
      return "I can help you find books! You can search by title, author, category, or just describe what you're looking for. What kind of book are you trying to find?";
    }
    
    return "I'm here to help you discover great books! What kind of stories or topics interest you? I can recommend books based on your interests and reading history.";
  }

  getFallbackResponse(query) {
    const intent = this.detectIntent(query.toLowerCase());
    
    switch (intent) {
      case 'greeting':
        return "Hello! I'm your library assistant and I'd love to help you discover some great books. What kind of stories or topics interest you?";
      case 'help':
        return "I'm here to help! I can recommend books, help you find specific titles, check your account status, and answer questions about our library. What would you like to know?";
      case 'gratitude':
        return "You're welcome! I love helping people discover great books. Feel free to ask me anything else!";
      case 'farewell':
        return "Take care! Happy reading, and I'll be here whenever you need me!";
      case 'learning':
        return "I'd love to help you find books to learn about that topic! What specific subject are you interested in studying?";
      default:
        return "I'd love to help you find some great books! What kind of stories or topics are you interested in?";
    }
  }

  async getGeneralResponse(userQuery, studentIdNumber = null) {
    try {
      console.log('[INFO] Generating conversational AI response with OpenAI...');

      let userContext = '';
      let conversationStyle = '';
      
      if (studentIdNumber) {
        try {
          const userKnowledge = await userKnowledgeService.getUserKnowledge(studentIdNumber);
          userContext = `\n\nUSER CONTEXT:\n${userKnowledge.context}`;
          conversationStyle = this.generateConversationStyle(userKnowledge, userQuery);
          
          // Add user ID information to context for questions about personal info
          if (userQuery.toLowerCase().includes('id') || userQuery.toLowerCase().includes('number')) {
            userContext += `\n\nIMPORTANT: The user's Student ID Number is: ${studentIdNumber}`;
          }
        } catch (error) {
          console.log('[WARN] Could not load user context, proceeding without it');
        }
      }

      try {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: `${userQuery}${userContext}${conversationStyle}` }
          ],
          temperature: 0.8,
          max_tokens: 400,
        });
        
        if (response.choices && response.choices[0] && response.choices[0].message) {
          console.log('[OK] OpenAI conversational AI response generated!');
          return response.choices[0].message.content;
        } else {
          throw new Error('Invalid response format from OpenAI');
        }
      } catch (apiError) {
        console.log('[INFO] OpenAI failed, falling back to smart response...');

        const response = this.generateGeneralResponse(userQuery);
        console.log('[OK] Fallback smart response generated!');
        return response;
      }
    } catch (error) {
      console.error('[ERROR] Error generating response:', error.message);
      throw new Error('AI response generation failed');
    }
  }

  /**
   * Generate conversation style based on user knowledge and query
   * @param {Object} userKnowledge - User knowledge object
   * @param {string} userQuery - User's query
   * @returns {string} Conversation style instructions
   */
  generateConversationStyle(userKnowledge, userQuery) {
    const queryLower = userQuery.toLowerCase();
    const userLevel = userKnowledge.summary.readingLevel;
    const totalBooks = userKnowledge.summary.totalBooks;
    
    let style = '\n\nCONVERSATION STYLE: ';
    
    // Adjust tone based on user's reading level
    if (userLevel === 'Beginner' || userLevel === 'New Reader') {
      style += 'Be encouraging and supportive, like a patient teacher. ';
    } else if (userLevel === 'Expert') {
      style += 'Be more sophisticated and assume they know their stuff. ';
    } else {
      style += 'Be friendly and knowledgeable, like a well-read friend. ';
    }
    
    // Adjust based on their experience
    if (totalBooks < 5) {
      style += 'They\'re new to reading, so be extra welcoming and helpful. ';
    } else if (totalBooks > 20) {
      style += 'They\'re an experienced reader, so you can be more casual and assume familiarity. ';
    }
    
    // Adjust based on query type
    if (queryLower.includes('current') || queryLower.includes('borrowed')) {
      style += 'They\'re asking about their current situation, so be practical and helpful. ';
    } else if (queryLower.includes('recommend') || queryLower.includes('suggest')) {
      style += 'They want recommendations, so be enthusiastic and specific. ';
    } else if (queryLower.includes('help') || queryLower.includes('how')) {
      style += 'They need guidance, so be clear and supportive. ';
    }
    
    return style;
  }


  generateGeneralResponse(userQuery) {
    const queryTokens = tokenizer.tokenize(userQuery.toLowerCase());
    
    if (this.containsGreeting(queryTokens)) {
      return "Hello! I'm your library assistant and I'd love to help you discover some great books. What kind of stories or topics interest you?";
    }
    
    if (this.containsHelp(queryTokens)) {
      return "I'm here to help! I can recommend books based on your interests, help you find specific titles, or suggest what to read next. What would you like to explore?";
    }
    
    if (this.containsThanks(queryTokens)) {
      return "You're welcome! I love helping people discover great books. Feel free to ask me anything else!";
    }
    
    if (this.containsGoodbye(queryTokens)) {
      return "Take care! Happy reading, and I'll be here whenever you need me!";
    }
    
    return "I'd love to help you find some great books! What kind of stories or topics are you interested in?";
  }

  containsGreeting(tokens) {
    const greetingKeywords = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    return tokens.some(token => greetingKeywords.includes(token));
  }

  containsHelp(tokens) {
    const helpKeywords = ['help', 'what can you do', 'how does this work', 'assist'];
    return tokens.some(token => helpKeywords.includes(token));
  }

  containsThanks(tokens) {
    const thanksKeywords = ['thanks', 'thank you', 'appreciate', 'grateful'];
    return tokens.some(token => thanksKeywords.includes(token));
  }

  containsGoodbye(tokens) {
    const goodbyeKeywords = ['bye', 'goodbye', 'see you', 'farewell', 'later'];
    return tokens.some(token => goodbyeKeywords.includes(token));
  }

  /**
   * Generate dynamic conversation starters based on user context
   * @param {Object} userKnowledge - User knowledge object
   * @returns {string} Dynamic conversation starter
   */
  generateDynamicStarter(userKnowledge) {
    if (!userKnowledge) {
      return "Hi there! I'm your library assistant and I'm excited to help you discover some amazing books! What's on your reading wishlist today?";
    }

    const { summary } = userKnowledge;
    const starters = [];

    // Based on reading level
    if (summary.readingLevel === 'New Reader') {
      starters.push("Welcome to your reading journey! I'm here to help you find books that'll make you fall in love with reading. What sounds interesting to you?");
    } else if (summary.readingLevel === 'Expert') {
      starters.push(`Hey ${summary.name}! I see you're quite the bookworm with ${summary.totalBooks} books under your belt. What's your next literary adventure?`);
    } else {
      starters.push(`Hi ${summary.name}! I love helping readers like you discover new favorites. What kind of stories are calling to you today?`);
    }

    // Based on current status
    if (summary.currentBooks > 0) {
      starters.push(`I see you've got ${summary.currentBooks} book${summary.currentBooks > 1 ? 's' : ''} out right now. How are you enjoying them? Need suggestions for what to read next?`);
    }

    // Based on favorite genre
    if (summary.favoriteGenre && summary.favoriteGenre !== 'None') {
      starters.push(`I know you love ${summary.favoriteGenre} books! I've got some great new titles in that genre that I think you'll absolutely love. Want to hear about them?`);
    }

    // Based on reading activity
    if (summary.totalBooks > 10) {
      starters.push(`Wow, ${summary.totalBooks} books! You're on fire! 🔥 What's your next reading challenge going to be?`);
    }

    return starters[Math.floor(Math.random() * starters.length)];
  }

  /**
   * Add conversation memory and context
   * @param {string} userQuery - Current user query
   * @param {Array} recentMessages - Recent conversation history
   * @returns {string} Contextual conversation prompt
   */
  addConversationContext(userQuery, recentMessages = []) {
    if (recentMessages.length === 0) {
      return userQuery;
    }

    const context = recentMessages.slice(-3).map(msg => 
      `${msg.isBot ? 'Assistant' : 'User'}: ${msg.text}`
    ).join('\n');

    return `Recent conversation:\n${context}\n\nCurrent user message: ${userQuery}`;
  }

  /**
   * Generate personalized recommendations based on user's reading history
   * @param {string} studentIdNumber - Student ID number
   * @param {number} limit - Number of recommendations to generate
   * @returns {Object} Personalized recommendations with AI explanation
   */
  async generatePersonalizedRecommendations(studentIdNumber, limit = 5) {
    try {
      console.log(`[INFO] Generating personalized recommendations for: ${studentIdNumber}`);

      // Get personalized recommendations from reading history service
      const recommendations = await readingHistoryService.generatePersonalizedRecommendations(studentIdNumber, limit);
      
      if (recommendations.length === 0) {
        return {
          response: "I don't have enough information about your reading preferences yet. Try borrowing some books first, and I'll be able to provide personalized recommendations based on your reading history!",
          books: [],
          isPersonalized: false
        };
      }

      // Get user's reading preferences for context
      const userPreferences = await readingHistoryService.analyzeUserReadingHistory(studentIdNumber);

      // Generate AI explanation for the recommendations
      const bookContext = recommendations.map((book, index) => 
        `${index + 1}. **${book.title}** by ${book.author}
   Category: ${book.category}
   Description: ${book.description}
   Personalization Score: ${book.personalizationScore.toFixed(1)}%
   Reason: ${book.recommendationReason}`
      ).join('\n\n');

      const prompt = `Based on this user's reading history and preferences, I've generated personalized book recommendations:

User's Reading Profile:
- Total books borrowed: ${userPreferences.totalBooksBorrowed}
- Favorite categorys: ${userPreferences.favoriteGenres.slice(0, 3).map(g => `${g.name} (${g.percentage}%)`).join(', ')}
- Favorite authors: ${userPreferences.favoriteAuthors.slice(0, 3).map(a => a.name).join(', ')}
- Reading frequency: ${userPreferences.readingFrequency} books/month
- Average reading time: ${userPreferences.averageDaysKept} days per book

Personalized Recommendations:
${bookContext}

Please provide a natural, conversational response that:
1. Acknowledges that these are personalized recommendations based on their reading history
2. Explains why these specific books were chosen for them
3. References their reading patterns and preferences
4. Encourages them to explore these recommendations
5. Keeps the tone friendly and personalized

Make it sound like a knowledgeable librarian who knows their reading habits well.`;

      try {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 500,
        });
        
        if (response.choices && response.choices[0] && response.choices[0].message) {
          console.log('[OK] Personalized recommendations with AI explanation generated!');
          return {
            response: response.choices[0].message.content,
            books: recommendations,
            isPersonalized: true,
            userPreferences: {
              totalBooks: userPreferences.totalBooksBorrowed,
              favoriteGenres: userPreferences.favoriteGenres.slice(0, 3),
              readingFrequency: userPreferences.readingFrequency
            }
          };
        } else {
          throw new Error('Invalid response format from OpenAI');
        }
      } catch (apiError) {
        console.log('[INFO] OpenAI failed, using fallback personalized response...');
        
        // Fallback personalized response
        const response = this.generateFallbackPersonalizedResponse(recommendations, userPreferences);
        return {
          response,
          books: recommendations,
          isPersonalized: true,
          userPreferences: {
            totalBooks: userPreferences.totalBooksBorrowed,
            favoriteGenres: userPreferences.favoriteGenres.slice(0, 3),
            readingFrequency: userPreferences.readingFrequency
          }
        };
      }
    } catch (error) {
      console.error('[ERROR] Error generating personalized recommendations:', error.message);
      throw new Error('Personalized recommendation generation failed');
    }
  }

  /**
   * Generate advanced hybrid recommendations using collaborative and content-based filtering
   * @param {string} studentIdNumber - Student ID number
   * @param {string} query - User query for context
   * @param {number} limit - Number of recommendations
   * @returns {Object} Advanced recommendations with explanations
   */
  async generateAdvancedRecommendations(studentIdNumber, query = '', limit = 5) {
    try {
      console.log(`[INFO] Generating advanced hybrid recommendations for: ${studentIdNumber}`);
      
      // Get comprehensive user knowledge
      const userKnowledge = await userKnowledgeService.getUserKnowledge(studentIdNumber);
      
      // Use the advanced recommendation service
      const result = await advancedRecommendationService.generateHybridRecommendations(
        studentIdNumber, 
        query, 
        limit
      );
      
      // Generate AI-powered explanation with user context
      const aiExplanation = await this.generateContextualAIExplanation(result, query, userKnowledge);
      
      return {
        ...result,
        aiExplanation,
        userKnowledge: userKnowledge.summary,
        timestamp: new Date().toISOString(),
        recommendationEngine: 'hybrid-ai-contextual'
      };
    } catch (error) {
      console.error('[ERROR] Error generating advanced recommendations:', error);
      throw error;
    }
  }

  /**
   * Generate contextual AI explanation with comprehensive user knowledge
   * @param {Object} result - Recommendation result
   * @param {string} query - User query
   * @param {Object} userKnowledge - Comprehensive user knowledge
   * @returns {string} AI-generated contextual explanation
   */
  async generateContextualAIExplanation(result, query = '', userKnowledge) {
    try {
      const { recommendations, userProfile, confidence } = result;
      
      if (recommendations.length === 0) {
        return "I couldn't find any personalized recommendations at the moment. Try asking about specific genres, authors, or topics you're interested in!";
      }

      const prompt = `You're having a natural conversation with ${userKnowledge.summary.name}, who you know really well. They just asked: "${query}"

Here's what you know about them:
${userKnowledge.context}

Their current situation:
- Reading Level: ${userKnowledge.summary.readingLevel}
- Favorite Genre: ${userKnowledge.summary.favoriteGenre}
- Currently Reading: ${userKnowledge.summary.currentBooks} books
- Can Borrow: ${userKnowledge.summary.canBorrow ? 'Yes' : 'No'}

I found these great books for them:
${recommendations.slice(0, 3).map((rec, i) => 
  `• "${rec.title}" by ${rec.author} - ${rec.reason}`
).join('\n')}

STRICT INSTRUCTIONS:
- ONLY mention the specific books listed above. Do NOT invent or add any titles that are not in the list.
- If you need to talk about more options, ask a clarifying question instead of naming unlisted books.

Respond naturally and conversationally. Be genuine and enthusiastic about sharing these recommendations. Show that you understand their reading preferences and explain why these books would be perfect for them. Ask engaging follow-up questions to keep the conversation flowing. Keep it under 200 words and make it feel personal and authentic.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 450,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('[ERROR] Error generating contextual AI explanation:', error);
      return result.explanation || "Here are some personalized book recommendations based on your reading history and preferences!";
    }
  }

  /**
   * Generate AI-powered explanation for recommendations
   * @param {Object} result - Recommendation result
   * @param {string} query - User query
   * @returns {string} AI-generated explanation
   */
  async generateAIExplanation(result, query = '') {
    try {
      const { recommendations, userProfile, confidence } = result;
      
      if (recommendations.length === 0) {
        return "I couldn't find any personalized recommendations at the moment. Try asking about specific genres, authors, or topics you're interested in!";
      }

      const prompt = `Based on the following personalized book recommendations, generate a friendly, conversational explanation:

User Profile:
- Total books read: ${userProfile?.totalBooksRead || 0}
- Favorite genres: ${userProfile?.favoriteGenres?.map(g => g.genre).join(', ') || 'None yet'}
- Favorite authors: ${userProfile?.favoriteAuthors?.map(a => a.author).join(', ') || 'None yet'}
- Reading diversity: ${Math.round((userProfile?.readingDiversity || 0) * 100)}%

Recommendations:
${recommendations.slice(0, 3).map((rec, i) => 
  `${i + 1}. "${rec.title}" by ${rec.author} (${rec.category}) - ${rec.reason}`
).join('\n')}

${query ? `User Query: "${query}"` : ''}

Confidence Score: ${Math.round(confidence * 100)}%

Please generate a natural, engaging explanation that:
1. Acknowledges their reading preferences
2. Explains why these specific books were recommended
3. Mentions the different recommendation methods used
4. Encourages them to explore the suggestions
5. Keeps it conversational and friendly

Keep the response under 200 words and make it sound like a helpful librarian.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 400,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('[ERROR] Error generating AI explanation:', error);
      return result.explanation || "Here are some personalized book recommendations based on your reading history and preferences!";
    }
  }

  /**
   * Generate fallback personalized response when OpenAI fails
   * @param {Array} recommendations - Personalized book recommendations
   * @param {Object} userPreferences - User's reading preferences
   * @returns {string} Fallback personalized response
   */
  generateFallbackPersonalizedResponse(recommendations, userPreferences) {
    let response = `Based on your reading history, I've found some great personalized recommendations for you!\n\n`;
    
    if (userPreferences.favoriteGenres.length > 0) {
      response += `Since you enjoy ${userPreferences.favoriteGenres[0].name} books (${userPreferences.favoriteGenres[0].percentage}% of your reading), `;
    }
    
    response += `here are some books I think you'll love:\n\n`;
    
    recommendations.forEach((book, index) => {
      response += `${index + 1}. **${book.title}** by ${book.author}\n`;
      response += `   Category: ${book.category}\n`;
      response += `   ${book.description}\n`;
      response += `   Why I recommend it: ${book.recommendationReason}\n\n`;
    });
    
    response += `These recommendations are tailored to your reading patterns and preferences. `;
    response += `Would you like me to suggest more books or help you find something specific?`;
    
    return response;
  }

  /**
   * Test OpenAI API connection
   * @returns {Promise<boolean>} True if API is working
   */
  async testOpenAI() {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Hello, this is a test message.' }
        ],
        max_tokens: 10
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      console.error('[ERROR] OpenAI API test failed:', error.message);
      throw error;
    }
  }
}

module.exports = new ChatbotService();