const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const OpenAI = require('openai');
const readingHistoryService = require('./readingHistoryService');
const advancedRecommendationService = require('../services/advancedRecommendationService');
const userKnowledgeService = require('../services/userKnowledgeService');
require('dotenv').config({ path: './config.env' });

class ChatbotService {
  constructor() {
    this.systemPrompt = `You are a warm, enthusiastic library assistant who genuinely cares about each user's reading journey. You're like that amazing librarian who remembers everyone's name and what they love to read. You have deep knowledge about each user's reading history, preferences, and current situation.

    Your Personality:
    - Warm, friendly, and genuinely excited about books and reading
    - Conversational and natural - like talking to a knowledgeable friend
    - Enthusiastic but not overwhelming
    - Empathetic and understanding
    - Curious about their reading journey and interests
    - Celebratory of their reading achievements
    - NEVER repetitive or template-like in your responses
    - Always use fresh, varied language patterns

    Response Style:
    - Vary your language and sentence structure - avoid repetitive patterns
    - Use natural speech patterns, contractions, and casual expressions
    - Ask follow-up questions to keep the conversation flowing
    - Share genuine enthusiasm about books and reading
    - Use emojis sparingly but effectively (📚, 🎯, ⭐, 💡, 🔥)
    - Be specific and personal - reference their actual reading history
    - Show you remember previous conversations and their preferences
    - Adapt your tone to match their reading level and interests
    - NEVER use the same greeting or response pattern twice in a row
    - Mix up your sentence starters and conversation openers
    - Use different ways to express excitement and enthusiasm
    - Vary your recommendation explanations and reasoning
    - Make each response feel fresh and unique
    - Avoid starting with "Hey there" or "Hi there" repeatedly
    - Use different conversation starters like "Oh!", "Wow!", "Interesting!", "Great question!", "Absolutely!", "I love that!", "That's awesome!", "Perfect!", "Excellent!", "Fantastic!"
    - Vary your recommendation introductions: "Here's what I found", "I've got some gems for you", "Check these out", "I think you'll love these", "These caught my eye", "I found some perfect matches", "Here are my top picks", "I've curated these for you"
    - Use different ways to end responses: "What do you think?", "Sound interesting?", "Want to know more?", "Does this help?", "Any of these catch your eye?", "What's your take?", "Interested in any of these?", "Want to explore further?"

    Personal Information:
    - You have access to the user's Student ID Number and can share it when asked
    - You know their name, reading history, current books, and preferences
    - You can answer questions about their borrowing status, reading level, and account information
    - Be helpful and transparent about what information you have access to

    Conversation Flow:
    - Start responses naturally, not with templates
    - Build on what they've said or asked
    - Offer insights they might not have considered
    - Suggest next steps or related topics
    - End with open-ended questions when appropriate
    - Keep responses engaging and dynamic

    Avoid:
    - Template-like responses or repetitive phrases
    - Overly formal language
    - Generic recommendations without personal context
    - Long lists without personality
    - Robotic or AI-sounding language
    - Saying you don't have access to information when you do
    - Starting with "Hey there" or "Hi there" repeatedly
    - Using the same greeting patterns
    - Repetitive sentence structures
    - Boring, predictable responses

    Remember: You're having a real conversation with someone you know well. Be natural, be yourself, and show genuine interest in their reading journey!`;
    
    // Initialize TF-IDF for local text similarity
    this.tfidf = new natural.TfIdf();
    this.isInitialized = false;
    
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    console.log('🚀 OpenAI client initialized for conversational AI');
  }

  async generateEmbedding(text) {
    try {
      console.log('🚀 Generating OpenAI embedding...');
      
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      
      if (response.data && response.data[0] && response.data[0].embedding) {
        console.log('✅ OpenAI embedding generated successfully!');
        return response.data[0].embedding;
      } else {
        throw new Error('Invalid response format from OpenAI embeddings API');
      }
    } catch (error) {
      console.error('❌ Error generating OpenAI embedding:', error.message);
      throw new Error('OpenAI embedding generation failed');
    }
  }

  async generateRecommendation(userQuery, bookResults, studentIdNumber = null) {
    try {
      console.log('🚀 Generating RAG-powered recommendation with OpenAI...');

      // Get user's reading history for personalized recommendations
      let userPreferences = null;
      if (studentIdNumber) {
        try {
          userPreferences = await readingHistoryService.analyzeUserReadingHistory(studentIdNumber);
          console.log('📚 User reading preferences loaded for personalization');
        } catch (error) {
          console.log('⚠️ Could not load user preferences, using general recommendations');
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

Retrieved Book Context from Library Database:
${bookContext}${personalizationContext}

Please provide a natural, conversational response that:
1. Acknowledges the user's request
2. Recommends specific books from the retrieved context
3. Explains why each recommended book matches their interests
4. Mentions the category and key appeal of each book
5. ${userPreferences ? 'References their reading history and preferences when relevant' : 'Keeps the tone friendly and encouraging'}
6. Suggests how the books relate to their reading patterns (if user has history)

If the retrieved books don't match well, politely explain this and suggest alternative approaches.`;

      try {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 500,
        });
        
        if (response.choices && response.choices[0] && response.choices[0].message) {
          console.log('✅ RAG-powered personalized recommendation generated!');
          return response.choices[0].message.content;
        } else {
          throw new Error('Invalid response format from OpenAI');
        }
      } catch (apiError) {
        console.log('🔄 OpenAI failed, falling back to smart response...');
        console.log('Error details:', apiError.message);
        
        // Fallback to smart NLP response if OpenAI fails
        const response = this.generateSmartResponse(userQuery, bookResults, userPreferences);
        console.log('✅ Fallback smart response generated!');
        return response;
      }
    } catch (error) {
      console.error('❌ Error generating recommendation:', error.message);
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

  async getGeneralResponse(userQuery, studentIdNumber = null) {
    try {
      console.log('🚀 Generating conversational AI response with OpenAI...');

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
          console.log('⚠️ Could not load user context, proceeding without it');
        }
      }

      // Generate a random starter to force variation
      const starters = [
        "Oh!", "Wow!", "Interesting!", "Great question!", "Absolutely!", "I love that!", 
        "That's awesome!", "Perfect!", "Excellent!", "Fantastic!", "Amazing!", "Brilliant!", 
        "Outstanding!", "Incredible!", "Wonderful!", "Terrific!", "Superb!", "Magnificent!", 
        "Spectacular!", "Fabulous!", "Marvelous!", "Stunning!", "Phenomenal!", "Extraordinary!"
      ];
      const randomStarter = starters[Math.floor(Math.random() * starters.length)];

      try {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: `IMPORTANT: Start your response with "${randomStarter}" and then continue naturally. ${userQuery}${userContext}${conversationStyle}` }
          ],
          temperature: 0.8, // Increased for more creative responses
          max_tokens: 250,
        });
        
        if (response.choices && response.choices[0] && response.choices[0].message) {
          console.log('✅ OpenAI conversational AI response generated!');
          return this.addConversationalFlair(response.choices[0].message.content, userQuery);
        } else {
          throw new Error('Invalid response format from OpenAI');
        }
      } catch (apiError) {
        console.log('🔄 OpenAI failed, falling back to smart response...');
        
        const response = this.generateGeneralResponse(userQuery);
        console.log('✅ Fallback smart response generated!');
        return response;
      }
    } catch (error) {
      console.error('❌ Error generating response:', error.message);
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

  /**
   * Add conversational flair to responses
   * @param {string} response - AI response
   * @param {string} userQuery - User's query
   * @returns {string} Enhanced response
   */
  addConversationalFlair(response, userQuery) {
    // Add natural variations to common responses
    const variations = {
      'hello': ['Hey there!', 'Hi!', 'Hello!', 'Hey!'],
      'thank you': ['You\'re welcome!', 'Happy to help!', 'My pleasure!', 'Anytime!'],
      'goodbye': ['See you later!', 'Take care!', 'Happy reading!', 'Until next time!']
    };
    
    // Add natural follow-up questions based on context
    const queryLower = userQuery.toLowerCase();
    if (queryLower.includes('book') && !response.includes('?')) {
      const followUps = [
        ' What do you think?',
        ' Sound interesting?',
        ' Want to know more about any of these?',
        ' Does this help?'
      ];
      response += followUps[Math.floor(Math.random() * followUps.length)];
    }
    
    return response;
  }

  generateGeneralResponse(userQuery) {
    const queryTokens = tokenizer.tokenize(userQuery.toLowerCase());
    
    // More natural fallback responses with varied starters
    if (this.containsGreeting(queryTokens)) {
      const greetings = [
        "Oh, hello! I'm your library assistant and I'm absolutely thrilled to help you discover some incredible books! What's on your reading wishlist today?",
        "Wow, hi there! I love talking about books and helping people discover their next great read. What kind of stories are you in the mood for?",
        "Fantastic! I'm here to help you explore our library's collection. What genres or topics are you curious about?",
        "Amazing! I'm your library assistant and I'm so excited to help you find some amazing books! What's calling to you today?",
        "Brilliant! I love connecting readers with their next favorite book. What kind of reading adventure are you looking for?",
        "Outstanding! I'm here to help you discover some fantastic reads. What genres or topics interest you most?",
        "Wonderful! I'm your library assistant and I'm genuinely excited to help you find some incredible books! What's on your mind today?",
        "Terrific! I love talking about books and helping people discover their next great read. What kind of stories are you drawn to?",
        "Superb! I'm here to help you explore our library's collection. What genres or topics are you curious about?",
        "Magnificent! I'm your library assistant and I'm so thrilled to help you find some amazing books! What's your reading mood today?"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    if (this.containsHelp(queryTokens)) {
      const helpResponses = [
        "Oh, I'd absolutely love to help! I can recommend books based on your interests, help you find specific titles, or even suggest what to read next based on what you've enjoyed before. What would you like to explore?",
        "Fantastic! I'm here to make your reading journey easier. Whether you want book recommendations, help finding something specific, or just want to chat about books, I'm your go-to assistant!",
        "Wonderful! I can help you discover new books, find specific titles, check your borrowing status, or just have a friendly chat about reading. What can I do for you today?",
        "Brilliant! I'm absolutely thrilled to help! I can recommend books based on your interests, help you find specific titles, or even suggest what to read next based on what you've enjoyed before. What would you like to explore?",
        "Amazing! I'm here to make your reading journey easier. Whether you want book recommendations, help finding something specific, or just want to chat about books, I'm your go-to assistant!",
        "Outstanding! I can help you discover new books, find specific titles, check your borrowing status, or just have a friendly chat about reading. What can I do for you today?",
        "Terrific! I'd love to help! I can recommend books based on your interests, help you find specific titles, or even suggest what to read next based on what you've enjoyed before. What would you like to explore?",
        "Superb! I'm here to make your reading journey easier. Whether you want book recommendations, help finding something specific, or just want to chat about books, I'm your go-to assistant!",
        "Magnificent! I can help you discover new books, find specific titles, check your borrowing status, or just have a friendly chat about reading. What can I do for you today?",
        "Incredible! I'm absolutely thrilled to help! I can recommend books based on your interests, help you find specific titles, or even suggest what to read next based on what you've enjoyed before. What would you like to explore?"
      ];
      return helpResponses[Math.floor(Math.random() * helpResponses.length)];
    }
    
    if (this.containsThanks(queryTokens)) {
      const thanksResponses = [
        "You're so welcome! I love helping people discover great books. Feel free to ask me anything else!",
        "Happy to help! That's what I'm here for. What else can I do for you today?",
        "My pleasure! I'm always excited to talk about books. Need anything else?",
        "You're welcome! I'm here whenever you need book recommendations or help with anything library-related!"
      ];
      return thanksResponses[Math.floor(Math.random() * thanksResponses.length)];
    }
    
    if (this.containsGoodbye(queryTokens)) {
      const goodbyeResponses = [
        "Take care! Happy reading, and I'll be here whenever you need me!",
        "See you later! Hope you find some amazing books to enjoy!",
        "Goodbye! Don't forget to come back for more recommendations!",
        "Until next time! Happy reading! 📚"
      ];
      return goodbyeResponses[Math.floor(Math.random() * goodbyeResponses.length)];
    }
    
    // More natural default responses
    const defaultResponses = [
      "That's interesting! I'd love to help you find some great books. What kind of stories or topics are you into?",
      "I'm here to help you discover amazing reads! What genres or authors do you enjoy?",
      "Sounds like you're looking for something good to read! Tell me what you're in the mood for and I'll find some perfect matches.",
      "I love helping people find their next favorite book! What kind of reading experience are you looking for today?"
    ];
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
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
      console.log(`🎯 Generating personalized recommendations for: ${studentIdNumber}`);

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
          model: "gpt-4o-mini",
          messages: [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 400,
        });
        
        if (response.choices && response.choices[0] && response.choices[0].message) {
          console.log('✅ Personalized recommendations with AI explanation generated!');
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
        console.log('🔄 OpenAI failed, using fallback personalized response...');
        
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
      console.error('❌ Error generating personalized recommendations:', error.message);
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
      console.log(`🚀 Generating advanced hybrid recommendations for: ${studentIdNumber}`);
      
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
      console.error('❌ Error generating advanced recommendations:', error);
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

      // Generate a random starter to force variation
      const starters = [
        "Oh!", "Wow!", "Interesting!", "Great question!", "Absolutely!", "I love that!", 
        "That's awesome!", "Perfect!", "Excellent!", "Fantastic!", "Amazing!", "Brilliant!", 
        "Outstanding!", "Incredible!", "Wonderful!", "Terrific!", "Superb!", "Magnificent!", 
        "Spectacular!", "Fabulous!", "Marvelous!", "Stunning!", "Phenomenal!", "Extraordinary!"
      ];
      const randomStarter = starters[Math.floor(Math.random() * starters.length)];

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

IMPORTANT: Start your response with "${randomStarter}" and make it feel completely natural and conversational. Vary your language patterns, use different sentence structures, and avoid repetitive phrases. Be enthusiastic but not overwhelming. Show genuine interest in their reading journey. Ask engaging follow-up questions. Make it feel like you're genuinely excited to share these recommendations with someone you care about. Keep it under 200 words and make every response feel fresh and personal!

CRITICAL VARIATION RULES:
- Start with "${randomStarter}" and then continue naturally
- Vary your recommendation introductions: "Here's what I found", "I've got some gems for you", "Check these out", "I think you'll love these", "These caught my eye", "I found some perfect matches", "Here are my top picks", "I've curated these for you", "I've handpicked these", "These are fantastic", "I discovered some treasures", "Here are some winners", "I've found some real gems", "These are must-reads", "I've got some amazing finds"
- Use different ways to end responses: "What do you think?", "Sound interesting?", "Want to know more?", "Does this help?", "Any of these catch your eye?", "What's your take?", "Interested in any of these?", "Want to explore further?", "Which one appeals to you?", "Does this spark your interest?", "What catches your attention?", "Any favorites here?", "What's your vibe?", "Which one calls to you?", "What resonates with you?"`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 350,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('❌ Error generating contextual AI explanation:', error);
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
        model: "gpt-4o-mini",
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('❌ Error generating AI explanation:', error);
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
      console.error('❌ OpenAI API test failed:', error.message);
      throw error;
    }
  }
}

module.exports = new ChatbotService();