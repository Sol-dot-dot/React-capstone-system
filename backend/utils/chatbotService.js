const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const axios = require('axios');
require('dotenv').config({ path: './config.env' });

class ChatbotService {
  constructor() {
    this.systemPrompt = `You are a helpful library assistant that recommends books to users. 
    You have access to a database of books and can provide personalized recommendations based on user preferences.
    
    When recommending books:
    1. Be friendly and conversational
    2. Explain why you're recommending specific books
    3. Mention the genre, author, and a brief description
    4. Suggest 3-5 books maximum
    5. If no relevant books are found, suggest alternative genres or ask for more details
    6. Always respond naturally and conversationally
    
    Keep responses concise but helpful.`;
    
    // Initialize TF-IDF for local text similarity
    this.tfidf = new natural.TfIdf();
    this.isInitialized = false;
    
    // LM Studio local server configuration
    this.lmStudioURL = 'http://127.0.0.1:1234/v1';
    
    console.log('🚀 LM Studio client initialized for conversational AI');
  }

  async generateEmbedding(text) {
    try {
      console.log('🚀 Generating local AI embedding using TF-IDF...');
      
      // Convert text to lowercase and tokenize
      const tokens = tokenizer.tokenize(text.toLowerCase());
      
      // Create a simple but effective vector representation
      const embedding = this.createTextVector(tokens);
      
      if (embedding && Array.isArray(embedding)) {
        console.log('✅ Local AI embedding generated successfully!');
        return embedding;
      } else {
        throw new Error('Failed to generate text vector');
      }
    } catch (error) {
      console.error('❌ Error generating embedding:', error.message);
      throw new Error('Local embedding generation failed');
    }
  }

  createTextVector(tokens) {
    // Create a 100-dimensional vector based on word frequency and importance
    const vector = new Array(100).fill(0);
    
    if (!tokens || tokens.length === 0) return vector;
    
    // Simple but effective text vectorization
    tokens.forEach((token, index) => {
      if (token && token.length > 2) { // Only meaningful tokens
        const hash = this.simpleHash(token);
        const position = hash % 100;
        vector[position] += 1;
      }
    });
    
    // Normalize the vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] = vector[i] / magnitude;
      }
    }
    
    return vector;
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  async generateRecommendation(userQuery, bookResults) {
    try {
      console.log('🚀 Generating conversational AI recommendation with LM Studio...');

      const prompt = `
${this.systemPrompt}

User Query: "${userQuery}"

Available Books:
${bookResults.map(book => 
  `- ${book.title} by ${book.author} (${book.genre}): ${book.description}`
).join('\n')}

Please provide a natural, conversational response recommending books based on the user's query.
If no books match the query well, suggest alternative genres or ask for more specific preferences.
Keep your response friendly and helpful.`;

      try {
        // Use LM Studio local server with OpenAI-compatible API
        const response = await axios.post(`${this.lmStudioURL}/chat/completions`, {
          model: 'llama-3-8b-lexi-uncensored', // Use your loaded model name
          messages: [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 300,
          stream: false
        }, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });
        
        if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
          console.log('✅ LM Studio conversational AI recommendation generated!');
          return response.data.choices[0].message.content;
        } else {
          throw new Error('Invalid response format from LM Studio');
        }
      } catch (apiError) {
        console.log('🔄 LM Studio failed, falling back to smart response...');
        console.log('Error details:', apiError.message);
        
        // Fallback to smart NLP response if LM Studio fails
        const response = this.generateSmartResponse(userQuery, bookResults);
        console.log('✅ Fallback smart response generated!');
        return response;
      }
    } catch (error) {
      console.error('❌ Error generating recommendation:', error.message);
      throw new Error('AI recommendation generation failed');
    }
  }

  generateSmartResponse(userQuery, bookResults) {
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
    
    // Add personalized suggestion
    if (isGenreRequest) {
      response += `These books are perfect for someone interested in ${this.extractGenre(queryTokens)}! `;
    } else if (isAuthorRequest) {
      response += `I've included books from authors that match your preferences. `;
    } else if (isThemeRequest) {
      response += `These selections focus on the themes you mentioned. `;
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
      console.log('🚀 Generating conversational AI response with LM Studio...');

      try {
        const response = await axios.post(`${this.lmStudioURL}/chat/completions`, {
          model: 'llama-3-8b-lexi-uncensored', // Use your loaded model name
          messages: [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: userQuery }
          ],
          temperature: 0.7,
          max_tokens: 200,
          stream: false
        }, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });
        
        if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
          console.log('✅ LM Studio conversational AI response generated!');
          return response.data.choices[0].message.content;
        } else {
          throw new Error('Invalid response format from LM Studio');
        }
      } catch (apiError) {
        console.log('🔄 LM Studio failed, falling back to smart response...');
        
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
      return "Hello! I'm your library assistant powered by local AI. I can help you find great books based on your interests. What kind of books are you looking for today?";
    }
    
    if (this.containsHelp(queryTokens)) {
      return "I can help you find books by genre, author, theme, or description using my local AI intelligence. Just tell me what you're interested in, and I'll recommend some great reads!";
    }
    
    if (this.containsThanks(queryTokens)) {
      return "You're welcome! I'm here to help you discover amazing books using my local AI capabilities. Feel free to ask for more recommendations anytime!";
    }
    
    // Default helpful response
    return "I'd be happy to help you find the perfect book using my local AI intelligence! Could you tell me more about what you're looking for? For example, you could mention a genre you enjoy, an author you like, or describe the type of story you want to read.";
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
}

module.exports = new ChatbotService();
