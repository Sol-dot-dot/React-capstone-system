const chatbotService = require('./chatbotService');
const vectorStorage = require('./vectorStorage');
const db = require('../config/database');

const { logger } = require('../config/logger');
class VectorDBService {
  constructor() {
    this.books = [];
    this.embeddings = [];
    this.isInitialized = false;
    this.useRealEmbeddings = false;
    this.integrityReport = null;
  }

  async initialize() {
    try {
      logger.info('Initializing OpenAI-powered similarity database...');

      // Initialize vector storage
      await vectorStorage.initialize();

      // Get ALL books from database (not just available ones)
      const [books] = await db.execute(`
        SELECT id, title, author, category, description, status
        FROM books
        WHERE status = 'available'
      `);

      if (books.length === 0) {
        logger.info('No books found in database');
        this.isInitialized = true;
        return;
      }

      logger.info(`[INFO] Found ${books.length} books in database`);

      // Store books for similarity search
      this.books = books.map(book => ({
        ...book,
        searchText: `${book.title} ${book.author} ${book.category} ${book.description}`.toLowerCase()
      }));

      // Check which books need embeddings
      const booksNeedingEmbeddings = [];
      const existingEmbeddings = [];

      for (const book of this.books) {
        const existingEmbedding = vectorStorage.getEmbedding(book.id);
        if (existingEmbedding) {
          existingEmbeddings.push(existingEmbedding);
          logger.info(`[INFO] Using cached embedding for: ${book.title}`);
        } else {
          booksNeedingEmbeddings.push(book);
        }
      }

      logger.info(`[INFO] Found ${existingEmbeddings.length} cached embeddings, need to generate ${booksNeedingEmbeddings.length} new ones`);

      // Prune any embeddings that no longer exist in DB
      const dbBookIds = new Set(this.books.map(b => b.id));
      const allStored = vectorStorage.getAllEmbeddings();
      const orphaned = allStored.filter(e => !dbBookIds.has(e.bookId));
      if (orphaned.length > 0) {
        logger.info(`[INFO] Removing ${orphaned.length} embeddings not present in DB...`);
        for (const e of orphaned) {
          await vectorStorage.removeEmbedding(e.bookId);
        }
      }

      // Generate OpenAI embeddings for new books
      if (booksNeedingEmbeddings.length > 0) {
        logger.info('[INFO] Generating OpenAI embeddings for new books...');
        try {
          for (let i = 0; i < booksNeedingEmbeddings.length; i++) {
            const book = booksNeedingEmbeddings[i];
            logger.info(`[INFO] Generating embedding for book ${i + 1}/${booksNeedingEmbeddings.length}: ${book.title} (Status: ${book.status})`);

            const text = `${book.title || ''}\n${book.author || ''}\n${book.category || ''}\n${book.description || ''}`.trim();
            const embedding = await chatbotService.generateEmbedding(text);

            // Accept any valid embedding length (model-dependent)
            if (embedding && Array.isArray(embedding) && embedding.length > 0) {
              // Save to persistent storage
              await vectorStorage.saveEmbedding(book.id, embedding, {
                title: book.title,
                author: book.author,
                category: book.category,
                status: book.status
              });

              existingEmbeddings.push(embedding);
              logger.info(`[OK] OpenAI embedding generated and saved for: ${book.title}`);
            } else {
              throw new Error(`Invalid OpenAI embedding for book: ${book.title} (got ${embedding ? embedding.length : 'null'})`);
            }
          }
        } catch (error) {
          logger.error('[ERROR] Failed to generate OpenAI embeddings:', error.message);
          throw new Error('OpenAI embedding generation failed - cannot proceed without real embeddings');
        }
      }

      // Load all embeddings into memory
      this.embeddings = [];
      for (const book of this.books) {
        const embedding = vectorStorage.getEmbedding(book.id);
        if (embedding) {
          this.embeddings.push(embedding);
        }
      }

      if (this.embeddings.length === this.books.length) {
        this.useRealEmbeddings = true;
        logger.info(`[OK] Successfully loaded OpenAI embeddings for ${this.embeddings.length} books!`);
      } else {
        throw new Error(`Only loaded ${this.embeddings.length} embeddings for ${this.books.length} books`);
      }

      // Build integrity report comparing DB books and stored metadata
      this.integrityReport = this.buildIntegrityReport();

      logger.info(`OpenAI-powered similarity database initialized with ${this.books.length} books`);
      this.isInitialized = true;
    } catch (error) {
      logger.error('Error initializing similarity database:', error);
      throw error; // Re-throw to stop the server if embeddings fail
    }
  }

  async searchSimilarBooks(query, limit = 5) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (this.books.length === 0 || !this.useRealEmbeddings) {
        throw new Error('Database not properly initialized with OpenAI embeddings');
      }

      logger.info('[INFO] Using OpenAI embeddings for similarity search!');

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
          category: this.books[result.index].category,
          description: this.books[result.index].description,
          status: this.books[result.index].status,
          similarity: result.similarity
        }));

      logger.info('[OK] OpenAI-powered similarity search completed!');
      return topResults;
    } catch (error) {
      logger.error('Error in similarity search:', error);
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

      // Clear persistent storage and regenerate all embeddings
      await vectorStorage.clearAll();

      await this.initialize();
      logger.info('OpenAI similarity database refreshed');
    } catch (error) {
      logger.error('Error refreshing similarity database:', error);
      throw error;
    }
  }

  buildIntegrityReport() {
    try {
      const dbBookIds = new Set(this.books.map(b => b.id));
      const storageEntries = vectorStorage.getAllEmbeddings();

      const storageIds = new Set(storageEntries.map(e => e.bookId));

      const orphanedInStorage = storageEntries
        .filter(e => !dbBookIds.has(e.bookId))
        .map(e => ({ bookId: e.bookId, metadata: e.metadata || null }));

      const missingEmbeddings = this.books
        .filter(b => !storageIds.has(b.id))
        .map(b => ({ id: b.id, title: b.title, author: b.author, status: b.status }));

      const metadataMismatches = [];
      for (const book of this.books) {
        const meta = vectorStorage.getMetadata(book.id);
        if (meta) {
          const titleMismatch = meta.title && meta.title !== book.title;
          const authorMismatch = meta.author && meta.author !== book.author;
          if (titleMismatch || authorMismatch) {
            metadataMismatches.push({
              id: book.id,
              db: { title: book.title, author: book.author },
              storage: { title: meta.title, author: meta.author }
            });
          }
        }
      }

      return {
        totals: {
          dbBooks: this.books.length,
          storageEmbeddings: this.embeddings.length,
          storageEntries: storageEntries.length
        },
        orphanedInStorage,
        missingEmbeddings,
        metadataMismatches,
        ok: orphanedInStorage.length === 0 && metadataMismatches.length === 0
      };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  getIntegrityReport() {
    this.integrityReport = this.buildIntegrityReport();
    return this.integrityReport;
  }


  async getBookById(bookId) {
    try {
      const [books] = await db.execute(`
        SELECT id, title, author, category, description, status
        FROM books
        WHERE id = ?
      `, [bookId]);

      return books.length > 0 ? books[0] : null;
    } catch (error) {
      logger.error('Error getting book by ID:', error);
      return null;
    }
  }
}

module.exports = new VectorDBService();
