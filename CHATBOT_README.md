# 🤖 Library Chatbot with RAG Implementation

This document explains the implementation of an AI-powered chatbot with RAG (Retrieval-Augmented Generation) for book recommendations in the Capstone Library System.

## 🏗️ Architecture Overview

```
User Query → OpenAI Embeddings → FAISS Vector Search → MySQL Book Data → GPT-3.5 → Natural Response
```

## 📁 File Structure

### Backend
- `utils/chatbotService.js` - OpenAI API integration and response generation
- `utils/vectorDBService.js` - FAISS vector database for similarity search
- `routes/chatbot.js` - API endpoints for chatbot functionality
- `config.env` - Environment configuration (add your OpenAI API key)

### Mobile App
- `src/components/ChatbotWidget.js` - React Native chatbot interface
- Integrated into main App.js with floating button

### Web App
- `src/components/ChatbotWidget.js` - React.js chatbot interface
- `src/components/ChatbotWidget.css` - Styling for web chatbot
- Integrated into main App.js with floating button

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
# Run the setup script
setup-chatbot.bat

# Or manually install
cd backend
npm install openai faiss-node
```

### 2. Configure OpenAI API
1. Get your API key from [OpenAI Platform](https://platform.openai.com/)
2. Update `backend/config.env`:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Start the Backend
```bash
cd backend
npm run dev
```

### 4. Test the Chatbot
- **Mobile**: Open the app and tap the 🤖 button on dashboard
- **Web**: Login and click the floating 🤖 button

## 🔧 API Endpoints

### POST `/api/chatbot/recommend`
Send a message to get book recommendations.

**Request:**
```json
{
  "message": "I want books like Harry Potter"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Based on your interest in Harry Potter, I recommend...",
    "books": [
      {
        "id": 1,
        "title": "The Lightning Thief",
        "author": "Rick Riordan",
        "genre": "Fantasy",
        "description": "A young boy discovers he's a demigod...",
        "similarity": 0.85
      }
    ],
    "isBookRequest": true
  }
}
```

### GET `/api/chatbot/status`
Check vector database status.

### POST `/api/chatbot/refresh-index`
Refresh the book embeddings (admin only).

## 🧠 How It Works

### 1. **Preprocessing (Vector Database Initialization)**
- Fetches all books from MySQL database
- Generates embeddings using OpenAI's text-embedding-ada-002
- Stores vectors in FAISS index for fast similarity search

### 2. **User Query Processing**
- User sends a message (e.g., "I want mystery books")
- System generates embedding for the query
- Searches FAISS index for similar book vectors

### 3. **Book Retrieval**
- Gets top 5 most similar books from vector search
- Fetches complete book details from MySQL
- Ranks by similarity score

### 4. **AI Response Generation**
- Sends user query + book results to GPT-3.5
- GPT generates natural, conversational recommendation
- Returns formatted response with book details

## 💡 Features

### ✅ Implemented
- **RAG-powered book recommendations** using OpenAI embeddings
- **Vector similarity search** with FAISS
- **Natural language processing** with GPT-3.5
- **Real-time chat interface** for both mobile and web
- **Book details display** with author, genre, and description
- **Responsive design** for mobile and desktop
- **Error handling** and loading states

### 🔮 Future Enhancements
- Chat history persistence
- User preference learning
- Advanced filtering options
- Book availability checking
- Reading list management
- Multi-language support

## 🎯 Usage Examples

### Book Recommendations
- "I want fantasy books"
- "Recommend something like The Hunger Games"
- "Show me mystery novels"
- "I like science fiction"

### General Chat
- "What genres do you have?"
- "How does borrowing work?"
- "What are your most popular books?"

## 🛠️ Technical Details

### Dependencies
- **OpenAI**: GPT-3.5-turbo for responses, text-embedding-ada-002 for embeddings
- **FAISS**: Facebook AI Similarity Search for vector operations
- **MySQL**: Book database storage
- **Express.js**: Backend API framework
- **React Native**: Mobile app interface
- **React.js**: Web app interface

### Performance
- **Embedding Generation**: ~1-2 seconds per book (one-time setup)
- **Vector Search**: ~100ms for similarity queries
- **GPT Response**: ~2-5 seconds for natural language generation
- **Total Response Time**: ~3-7 seconds end-to-end

### Scalability
- FAISS handles thousands of book vectors efficiently
- OpenAI API rate limits apply (check your plan)
- Vector database can be refreshed when books are added/updated

## 🔒 Security Considerations

- OpenAI API key stored in environment variables
- Input validation and sanitization
- Rate limiting recommended for production
- User authentication required for chatbot access

## 🧪 Testing

### Test the Chatbot
1. Start backend server
2. Open mobile app or web app
3. Login and access chatbot
4. Try various queries:
   - Specific book requests
   - Genre preferences
   - General questions

### API Testing
```bash
curl -X POST http://localhost:5000/api/chatbot/recommend \
  -H "Content-Type: application/json" \
  -d '{"message": "I want adventure books"}'
```

## 🐛 Troubleshooting

### Common Issues
1. **"Failed to generate embedding"**
   - Check OpenAI API key
   - Verify API quota/credits

2. **"Vector database not initialized"**
   - Check database connection
   - Ensure books exist in database

3. **Slow responses**
   - Check OpenAI API status
   - Verify network connectivity

### Debug Endpoints
- `/api/chatbot/status` - Check system health
- `/api/chatbot/refresh-index` - Rebuild vector database

## 📱 Mobile vs Web

### Mobile App
- Slide-up chat interface
- Touch-optimized controls
- Floating action button
- Native animations

### Web App
- Fixed-position widget
- Keyboard shortcuts (Enter to send)
- Minimize/maximize functionality
- Responsive design

## 🎉 Success!

Your library system now has an intelligent AI assistant that can:
- Understand natural language book requests
- Find similar books using semantic search
- Provide personalized recommendations
- Engage users in conversational interactions

The chatbot enhances user experience by making book discovery intuitive and engaging!
