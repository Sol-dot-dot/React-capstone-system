const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const OpenAI = require('openai');
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

  async generateRecommendation(userQuery, bookResults) {
    try {
      console.log('🚀 Generating conversational AI recommendation with OpenAI...');

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
        const response = await this.openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 300,
        });
        
        if (response.choices && response.choices[0] && response.choices[0].message) {
          console.log('✅ OpenAI conversational AI recommendation generated!');
          return response.choices[0].message.content;
        } else {
          throw new Error('Invalid response format from OpenAI');
        }
      } catch (apiError) {
        console.log('🔄 OpenAI failed, falling back to smart response...');
        console.log('Error details:', apiError.message);
        
        // Fallback to smart NLP response if OpenAI fails
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
}

module.exports = new ChatbotService();