const chatbotService = require('./chatbotService');
const db = require('../config/database');

class VectorDBService {
  constructor() {
    this.books = [];
    this.embeddings = [];
    this.isInitialized = false;
    this.useRealEmbeddings = false;
  }

  async initialize() {
    try {
      console.log('Initializing AI-powered similarity database...');
      
      // Get ALL books from database (not just available ones)
      const [books] = await db.execute(`
        SELECT id, title, author, genre, description, status
        FROM books
      `);

      if (books.length === 0) {
        console.log('No books found in database');
        this.isInitialized = true;
        return;
      }

      console.log(`📚 Found ${books.length} books in database`);

      // Store books for similarity search
      this.books = books.map(book => ({
        ...book,
        searchText: `${book.title} ${book.author} ${book.genre} ${book.description}`.toLowerCase()
      }));

      // Generate real AI embeddings
      console.log('🚀 Generating real AI embeddings for all books...');
      try {
        this.embeddings = [];
        for (let i = 0; i < this.books.length; i++) {
          const book = this.books[i];
          console.log(`📚 Generating embedding for book ${i + 1}/${this.books.length}: ${book.title} (Status: ${book.status})`);
          
          const text = `${book.title} ${book.author} ${book.genre} ${book.description}`;
          const embedding = await chatbotService.generateEmbedding(text);
          
          if (embedding && Array.isArray(embedding) && embedding.length === 100) {
            this.embeddings.push(embedding);
            console.log(`✅ Embedding generated for: ${book.title}`);
          } else {
            throw new Error(`Invalid embedding for book: ${book.title}`);
          }
        }
        
        if (this.embeddings.length === this.books.length) {
          this.useRealEmbeddings = true;
          console.log(`🎉 Successfully generated real AI embeddings for ${this.embeddings.length} books!`);
        } else {
          throw new Error(`Only generated ${this.embeddings.length} embeddings for ${this.books.length} books`);
        }
      } catch (error) {
        console.error('❌ Failed to generate AI embeddings:', error.message);
        throw new Error('AI embedding generation failed - cannot proceed without real embeddings');
      }

      console.log(`AI-powered similarity database initialized with ${this.books.length} books`);
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing similarity database:', error);
      throw error; // Re-throw to stop the server if embeddings fail
    }
  }

  async searchSimilarBooks(query, limit = 5) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (this.books.length === 0 || !this.useRealEmbeddings) {
        throw new Error('Database not properly initialized with AI embeddings');
      }

      console.log('🔍 Using REAL AI embeddings for similarity search!');
      
      // Generate embedding for query
      const queryEmbedding = await chatbotService.generateEmbedding(query);
      
      if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
        throw new Error('Failed to generate query embedding');
      }
      
      // Calculate cosine similarity with all books
      const similarities = this.embeddings.map((embedding, index) => {
        const similarity = this.cosineSimilarity(queryEmbedding, embedding);
        return { index, similarity };
      });
      
      // Sort by similarity and get top results
      const topResults = similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(result => ({
          id: this.books[result.index].id,
          title: this.books[result.index].title,
          author: this.books[result.index].author,
          genre: this.books[result.index].genre,
          description: this.books[result.index].description,
          status: this.books[result.index].status,
          similarity: result.similarity
        }));
      
      console.log('✅ AI-powered similarity search completed!');
      return topResults;
    } catch (error) {
      console.error('Error in similarity search:', error);
      throw error; // Re-throw to handle in the chatbot route
    }
  }

  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || !Array.isArray(vecA) || !Array.isArray(vecB)) {
      return 0;
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < Math.min(vecA.length, vecB.length); i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async refreshIndex() {
    try {
      this.isInitialized = false;
      this.books = [];
      this.embeddings = [];
      this.useRealEmbeddings = false;
      await this.initialize();
      console.log('AI similarity database refreshed');
    } catch (error) {
      console.error('Error refreshing similarity database:', error);
      throw error;
    }
  }

  async getBookById(bookId) {
    try {
      const [books] = await db.execute(`
        SELECT id, title, author, genre, description, status
        FROM books 
        WHERE id = ?
      `, [bookId]);

      return books.length > 0 ? books[0] : null;
    } catch (error) {
      console.error('Error getting book by ID:', error);
      return null;
    }
  }
}

module.exports = new VectorDBService();
