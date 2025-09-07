# 🤖 RAG-Powered Library Chatbot System

## Overview

This system implements a sophisticated Retrieval-Augmented Generation (RAG) chatbot for the library management system, powered by OpenAI's GPT-4o-mini and text-embedding-3-small models.

## 🏗️ Architecture

### Backend Components

1. **ChatbotService** (`backend/utils/chatbotService.js`)
   - Handles OpenAI API interactions
   - Generates embeddings using `text-embedding-3-small`
   - Creates conversational responses using `gpt-4o-mini`
   - Implements RAG pipeline with book context

2. **VectorDBService** (`backend/utils/vectorDBService.js`)
   - Manages book embeddings and similarity search
   - Implements cosine similarity for book matching
   - Caches embeddings for performance
   - Handles real-time book recommendations

3. **VectorStorage** (`backend/utils/vectorStorage.js`)
   - Persistent storage for embeddings
   - JSON-based local storage system
   - Automatic caching and retrieval
   - Metadata management for books

4. **Chatbot Routes** (`backend/routes/chatbot.js`)
   - RESTful API endpoints for chatbot interaction
   - Error handling and graceful fallbacks
   - Book recommendation endpoints

### Mobile Components

1. **ModernChatbotWidget** (`mobile/src/components/ModernChatbotWidget.js`)
   - Modern, animated chat interface
   - Typing indicators and smooth animations
   - Professional vector icons (Feather)
   - Book recommendation cards with "Borrow Now" buttons

## 🚀 Features

### RAG Pipeline
- **Embedding Generation**: All books are embedded using OpenAI's `text-embedding-3-small`
- **Similarity Search**: Cosine similarity matching for user queries
- **Context-Aware Responses**: AI responses are grounded in retrieved book data
- **Persistent Storage**: Embeddings are cached locally for performance

### Smart Recommendations
- **Semantic Understanding**: Understands user intent beyond keyword matching
- **Contextual Responses**: Explains why specific books are recommended
- **Availability Awareness**: Considers book availability status
- **Relevance Scoring**: Shows similarity scores for transparency

### Modern UI/UX
- **Typing Indicators**: Animated dots while AI is thinking
- **Smooth Animations**: Slide-in animations and bubble effects
- **Professional Icons**: Vector icons instead of emojis
- **Responsive Design**: Adapts to different screen sizes
- **Book Cards**: Modern recommendation cards with borrow buttons

## 🔧 Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create `backend/config.env`:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Initialize Vector Database

```bash
cd backend
node test-rag-system.js
```

### 4. Start Backend Server

```bash
npm start
```

### 5. Mobile App Setup

```bash
cd mobile
npm install
npx react-native run-android
```

## 📱 Usage

### For Users

1. **Open Chatbot**: Tap the chat icon in the mobile app
2. **Ask Questions**: Type natural language queries like:
   - "I want to read a mystery novel"
   - "Show me science fiction books"
   - "What books do you recommend for beginners?"
3. **Get Recommendations**: Receive AI-powered book suggestions with explanations
4. **Borrow Books**: Tap "Borrow Now" on recommendation cards

### For Administrators

1. **Refresh Index**: Use `/api/chatbot/refresh-index` to regenerate embeddings
2. **Check Status**: Use `/api/chatbot/status` to monitor system health
3. **View Logs**: Monitor embedding generation and search performance

## 🎯 API Endpoints

### POST `/api/chatbot/recommend`
- **Purpose**: Get book recommendations from chatbot
- **Body**: `{ "message": "user query" }`
- **Response**: 
```json
{
  "success": true,
  "data": {
    "response": "AI-generated recommendation text",
    "books": [
      {
        "id": 1,
        "title": "Book Title",
        "author": "Author Name",
        "genre": "Genre",
        "description": "Book description",
        "similarity": 0.85
      }
    ]
  }
}
```

### GET `/api/chatbot/status`
- **Purpose**: Check system status and statistics
- **Response**: System health and embedding counts

### POST `/api/chatbot/refresh-index`
- **Purpose**: Regenerate all book embeddings
- **Response**: Success confirmation

## 🧠 AI System Prompt

The chatbot uses this system prompt for consistent, helpful responses:

```
You are a friendly, knowledgeable library assistant. Use the retrieved book context provided to give grounded, natural recommendations. If you don't find a match in the library records, politely say so and suggest alternatives.

Guidelines:
1. Be conversational and engaging, like a helpful librarian
2. Use the provided book context to make specific recommendations
3. Explain why each book matches the user's interests
4. Keep responses natural and human-like
5. If no books match well, suggest alternative approaches or ask clarifying questions
6. Always be encouraging and positive about reading

Remember: You have access to our library's actual book collection through the provided context.
```

## 🔍 How RAG Works

1. **User Query**: User asks for book recommendations
2. **Query Embedding**: User query is embedded using OpenAI
3. **Similarity Search**: Query embedding is compared with all book embeddings
4. **Book Retrieval**: Top 3-5 most similar books are retrieved
5. **Context Building**: Retrieved books are formatted as context
6. **AI Generation**: GPT-4o-mini generates response using book context
7. **Response Delivery**: Natural, grounded recommendation is returned

## 🛡️ Error Handling

- **Graceful Fallbacks**: If RAG fails, chatbot provides helpful fallback responses
- **API Error Handling**: Comprehensive error handling for OpenAI API failures
- **User-Friendly Messages**: Clear error messages for users
- **Logging**: Detailed logging for debugging and monitoring

## 📊 Performance Optimizations

- **Embedding Caching**: Embeddings are stored locally to avoid regeneration
- **Incremental Updates**: Only new books get embeddings generated
- **Memory Management**: Efficient storage and retrieval of vector data
- **Response Caching**: Common queries can be cached for faster responses

## 🔮 Future Enhancements

- **Conversation Memory**: Remember previous interactions
- **User Preferences**: Learn from user borrowing history
- **Advanced Filtering**: Filter by availability, genre, author preferences
- **Multi-language Support**: Support for multiple languages
- **Voice Interface**: Voice-to-text and text-to-speech capabilities

## 🧪 Testing

Run the test suite:
```bash
cd backend
node test-rag-system.js
```

This will test:
- Vector database initialization
- Similarity search functionality
- RAG-powered recommendations
- General conversation capabilities

## 📈 Monitoring

Monitor system performance through:
- Console logs for embedding generation
- API response times
- User interaction patterns
- Error rates and fallback usage

## 🤝 Contributing

When adding new features:
1. Update embeddings for new books
2. Test RAG pipeline thoroughly
3. Ensure graceful error handling
4. Update documentation
5. Test mobile UI components

---

**Built with ❤️ using OpenAI GPT-4o-mini and React Native**
