const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const OpenAI = require('openai');
const readingHistoryService = require('./readingHistoryService');
require('dotenv').config({ path: './config.env' });

class ChatbotService {
  constructor() {
    this.systemPrompt = `You are a friendly, knowledgeable library assistant. Use the retrieved book context provided to give grounded, natural recommendations. If you don't find a match in the library records, politely say so and suggest alternatives.

    Guidelines:
    1. Be conversational and engaging, like a helpful librarian
    2. Use the provided book context to make specific recommendations
    3. Explain why each book matches the user's interests
    4. Keep responses natural and human-like
    5. If no books match well, suggest alternative approaches or ask clarifying questions
    6. Always be encouraging and positive about reading
    
    Remember: You have access to our library's actual book collection through the provided context.`;
    
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
   Genre: ${book.genre}
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
- Favorite genres: ${userPreferences.favoriteGenres.slice(0, 3).map(g => `${g.name} (${g.percentage}%)`).join(', ')}
- Favorite authors: ${userPreferences.favoriteAuthors.slice(0, 3).map(a => a.name).join(', ')}
- Reading frequency: ${userPreferences.readingFrequency} books/month
- Average reading time: ${userPreferences.averageDaysKept} days per book
- Genre diversity: ${(userPreferences.genreDiversity * 100).toFixed(0)}% diverse

Use this information to make more personalized recommendations that align with their reading patterns.`;
      }

      const prompt = `User Query: "${userQuery}"

Retrieved Book Context from Library Database:
${bookContext}${personalizationContext}

Please provide a natural, conversational response that:
1. Acknowledges the user's request
2. Recommends specific books from the retrieved context
3. Explains why each recommended book matches their interests
4. Mentions the genre and key appeal of each book
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
      return `I couldn't find specific books matching "${userQuery}". Could you please provide more details about what you're looking for? For example, you could mention a specific genre, author, or theme you're interested in.`;
    }
    
    // Generate contextual response
    let response = `Based on your request for "${userQuery}", here are some great book recommendations:\n\n`;
    
    bookResults.forEach((book, index) => {
      response += `${index + 1}. **${book.title}** by ${book.author}\n`;
      response += `   Genre: ${book.genre}\n`;
      response += `   ${book.description}\n\n`;
    });
    
    // Add personalized suggestion based on user preferences
    if (userPreferences && userPreferences.totalBooksBorrowed > 0) {
      // Check if any recommended books match user's favorite genres
      const matchingGenres = bookResults.filter(book => 
        userPreferences.favoriteGenres.some(genre => 
          genre.name.toLowerCase() === book.genre.toLowerCase()
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
    const genreKeywords = ['fiction', 'mystery', 'romance', 'sci-fi', 'fantasy', 'thriller', 'biography', 'history', 'poetry'];
    return tokens.some(token => genreKeywords.includes(token));
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
    const genreKeywords = ['fiction', 'mystery', 'romance', 'sci-fi', 'fantasy', 'thriller', 'biography', 'history', 'poetry'];
    for (const token of tokens) {
      if (genreKeywords.includes(token)) {
        return token;
      }
    }
    return 'fiction'; // Default
  }

  async getGeneralResponse(userQuery) {
    try {
      console.log('🚀 Generating conversational AI response with OpenAI...');

      try {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: userQuery }
          ],
          temperature: 0.7,
          max_tokens: 200,
        });
        
        if (response.choices && response.choices[0] && response.choices[0].message) {
          console.log('✅ OpenAI conversational AI response generated!');
          return response.choices[0].message.content;
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

  generateGeneralResponse(userQuery) {
    const queryTokens = tokenizer.tokenize(userQuery.toLowerCase());
    
    // Simple but effective response generation
    if (this.containsGreeting(queryTokens)) {
      return "Hello! I'm your library assistant powered by AI. I can help you find great books based on your interests. What kind of books are you looking for today?";
    }
    
    if (this.containsHelp(queryTokens)) {
      return "I can help you find books by genre, author, theme, or description using my AI intelligence. Just tell me what you're interested in, and I'll recommend some great reads!";
    }
    
    if (this.containsThanks(queryTokens)) {
      return "You're welcome! I'm here to help you discover amazing books using my AI capabilities. Feel free to ask for more recommendations anytime!";
    }
    
    // Default helpful response
    return "I'd be happy to help you find the perfect book using my AI intelligence! Could you tell me more about what you're looking for? For example, you could mention a genre you enjoy, an author you like, or describe the type of story you want to read.";
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
   Genre: ${book.genre}
   Description: ${book.description}
   Personalization Score: ${book.personalizationScore.toFixed(1)}%
   Reason: ${book.recommendationReason}`
      ).join('\n\n');

      const prompt = `Based on this user's reading history and preferences, I've generated personalized book recommendations:

User's Reading Profile:
- Total books borrowed: ${userPreferences.totalBooksBorrowed}
- Favorite genres: ${userPreferences.favoriteGenres.slice(0, 3).map(g => `${g.name} (${g.percentage}%)`).join(', ')}
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
      response += `   Genre: ${book.genre}\n`;
      response += `   ${book.description}\n`;
      response += `   Why I recommend it: ${book.recommendationReason}\n\n`;
    });
    
    response += `These recommendations are tailored to your reading patterns and preferences. `;
    response += `Would you like me to suggest more books or help you find something specific?`;
    
    return response;
  }
}

module.exports = new ChatbotService();