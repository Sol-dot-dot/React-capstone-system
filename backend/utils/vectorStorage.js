const fs = require('fs').promises;
const path = require('path');

class VectorStorage {
  constructor() {
    this.storagePath = path.join(__dirname, '../data/vector_storage.json');
    this.embeddings = new Map();
    this.metadata = new Map();
  }

  async initialize() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.storagePath);
      await fs.mkdir(dataDir, { recursive: true });

      // Try to load existing embeddings
      try {
        const data = await fs.readFile(this.storagePath, 'utf8');
        const parsed = JSON.parse(data);
        
        if (parsed.embeddings) {
          this.embeddings = new Map(parsed.embeddings);
        }
        if (parsed.metadata) {
          this.metadata = new Map(parsed.metadata);
        }
        
        console.log(`📚 Loaded ${this.embeddings.size} embeddings from storage`);
      } catch (error) {
        console.log('📚 No existing vector storage found, starting fresh');
      }
    } catch (error) {
      console.error('❌ Error initializing vector storage:', error);
      throw error;
    }
  }

  async saveEmbedding(bookId, embedding, metadata = {}) {
    try {
      this.embeddings.set(bookId, embedding);
      this.metadata.set(bookId, {
        ...metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      await this.persist();
      console.log(`✅ Saved embedding for book ${bookId}`);
    } catch (error) {
      console.error('❌ Error saving embedding:', error);
      throw error;
    }
  }

  getEmbedding(bookId) {
    return this.embeddings.get(bookId);
  }

  getMetadata(bookId) {
    return this.metadata.get(bookId);
  }

  getAllEmbeddings() {
    return Array.from(this.embeddings.entries()).map(([bookId, embedding]) => ({
      bookId,
      embedding,
      metadata: this.metadata.get(bookId)
    }));
  }

  async removeEmbedding(bookId) {
    try {
      this.embeddings.delete(bookId);
      this.metadata.delete(bookId);
      await this.persist();
      console.log(`🗑️ Removed embedding for book ${bookId}`);
    } catch (error) {
      console.error('❌ Error removing embedding:', error);
      throw error;
    }
  }

  async clearAll() {
    try {
      this.embeddings.clear();
      this.metadata.clear();
      await this.persist();
      console.log('🗑️ Cleared all embeddings');
    } catch (error) {
      console.error('❌ Error clearing embeddings:', error);
      throw error;
    }
  }

  async persist() {
    try {
      const data = {
        embeddings: Array.from(this.embeddings.entries()),
        metadata: Array.from(this.metadata.entries()),
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };
      
      await fs.writeFile(this.storagePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('❌ Error persisting vector storage:', error);
      throw error;
    }
  }

  getStats() {
    return {
      totalEmbeddings: this.embeddings.size,
      totalMetadata: this.metadata.size,
      storagePath: this.storagePath,
      lastUpdated: this.metadata.size > 0 ? 
        Math.max(...Array.from(this.metadata.values()).map(m => new Date(m.updatedAt).getTime())) : null
    };
  }
}

module.exports = new VectorStorage();
