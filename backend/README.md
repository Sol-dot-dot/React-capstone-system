# Backend API Documentation

This directory contains the backend API for the Capstone Library Management System.

## 📁 Directory Structure

```
backend/
├── config/                 # Configuration files
│   ├── database.js         # Database connection configuration
│   └── logger.js          # Logging configuration
├── middleware/             # Express middleware
│   ├── auth.js            # Authentication middleware
│   └── monitoring.js      # Performance monitoring middleware
├── routes/                # API route handlers
│   ├── admin.js           # Admin management routes
│   ├── auth.js            # Authentication routes
│   ├── books.js           # Book management routes
│   ├── borrowing.js       # Book borrowing routes
│   ├── chatbot.js         # AI chatbot routes
│   ├── dashboard.js       # Dashboard data routes
│   ├── monitoring.js      # System monitoring routes (disabled)
│   ├── notifications.js   # Notification routes
│   ├── penalty.js         # Penalty management routes
│   ├── profile.js         # User profile routes
│   └── search.js          # Search functionality routes
├── services/              # Business logic services
│   ├── advancedRecommendationService.js  # AI recommendation engine
│   ├── auditService.js                   # Audit logging service
│   ├── fineCalculationService.js         # Fine calculation logic
│   ├── performanceService.js            # Performance monitoring
│   └── userKnowledgeService.js          # User behavior analysis
├── utils/                 # Utility functions
│   ├── bookUtils.js       # Book-related utilities
│   ├── borrowingUtils.js  # Borrowing process utilities
│   ├── chatbotService.js  # Chatbot AI service
│   ├── emailService.js    # Email notification service
│   ├── penaltyUtils.js    # Penalty calculation utilities
│   ├── readingHistoryService.js  # Reading history tracking
│   ├── vectorDBService.js # Vector database operations
│   └── vectorStorage.js   # Vector data storage
├── logs/                  # Application logs (auto-generated)
├── data/                  # Data storage
│   └── vector_storage.json # Vector embeddings storage
├── server.js              # Main application entry point
├── package.json           # Dependencies and scripts
├── ecosystem.config.js    # PM2 process management
├── deploy.sh              # Deployment script
└── capstone_system_optimized.sql # Database schema
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- npm or yarn

### Installation
```bash
cd backend
npm install
```

### Configuration
1. Copy `config.env` to your environment
2. Update database credentials in `config.env`
3. Configure other environment variables as needed

### Running the Server
```bash
# Development
npm run dev

# Production
npm start
```

## 📋 API Endpoints

### Authentication (`/api/auth`)
- `POST /login` - User login
- `POST /register` - User registration
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Password reset confirmation

### Books (`/api/books`)
- `GET /` - Get all books
- `POST /` - Add new book
- `PUT /:id` - Update book
- `DELETE /:id` - Delete book
- `GET /search` - Search books

### Borrowing (`/api/borrowing`)
- `GET /user/:id` - Get user's borrowed books
- `POST /borrow` - Borrow a book
- `POST /return` - Return a book
- `GET /history/:id` - Get borrowing history

### Penalties (`/api/penalty`)
- `GET /user/:id` - Get user penalties
- `POST /pay` - Pay penalty
- `GET /summary` - Get penalty summary

### Chatbot (`/api/chatbot`)
- `POST /chat` - Send message to AI chatbot
- `GET /history/:id` - Get chat history

### Notifications (`/api/notifications`)
- `GET /user/:id` - Get user notifications
- `POST /send` - Send notification
- `PUT /:id/read` - Mark notification as read

## 🔧 Services

### Fine Calculation Service
Handles automatic fine calculation for overdue books with configurable rates and policies.

### Advanced Recommendation Service
AI-powered book recommendations based on user behavior and preferences.

### User Knowledge Service
Tracks and analyzes user reading patterns and preferences.

### Audit Service
Comprehensive logging and audit trail for all system activities.

## 🛠️ Utilities

### Database Utils
- Connection pooling and management
- Query optimization helpers
- Transaction management

### Email Service
- Notification delivery
- Template management
- Delivery tracking

### Vector Database Service
- AI embeddings storage
- Similarity search
- Knowledge base management

## 📊 Monitoring

The system includes comprehensive monitoring:
- Performance metrics
- Error tracking
- Audit logging
- Health checks

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting (configurable)

## 📝 Logging

- Winston-based logging
- Daily log rotation
- Error tracking
- Performance monitoring
- Audit trails

## 🚀 Deployment

### Using PM2
```bash
pm2 start ecosystem.config.js
```

### Manual Deployment
```bash
npm start
```

### Docker (if configured)
```bash
docker build -t capstone-backend .
docker run -p 3000:3000 capstone-backend
```

## 🔧 Environment Variables

- `DB_HOST` - Database host
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `JWT_SECRET` - JWT signing secret
- `EMAIL_HOST` - SMTP host
- `EMAIL_USER` - SMTP username
- `EMAIL_PASS` - SMTP password
- `OPENAI_API_KEY` - OpenAI API key
- `GOOGLE_AI_API_KEY` - Google AI API key

## 📚 Dependencies

### Core
- Express.js - Web framework
- MySQL2 - Database driver
- JWT - Authentication
- Bcryptjs - Password hashing

### AI & ML
- OpenAI - GPT integration
- Google Generative AI - Alternative AI
- Natural - Text processing

### Utilities
- Axios - HTTP client
- Nodemailer - Email service
- Winston - Logging
- Morgan - HTTP logging

## 🐛 Troubleshooting

### Common Issues
1. **Database Connection**: Check credentials and network
2. **JWT Errors**: Verify secret key configuration
3. **Email Issues**: Check SMTP settings
4. **AI Service**: Verify API keys

### Logs
Check the `logs/` directory for detailed error information.

## 📞 Support

For technical support or questions about the backend API, please refer to the main project documentation or contact the development team.








