# API Routes Documentation

This directory contains all the API route handlers for the Capstone Library Management System.

## 📁 Route Files

### Core Routes
- **`auth.js`** - Authentication and user management
- **`profile.js`** - User profile management
- **`books.js`** - Book catalog management
- **`borrowing.js`** - Book borrowing and returning
- **`penalty.js`** - Fine and penalty management

### Advanced Routes
- **`chatbot.js`** - AI chatbot integration
- **`notifications.js`** - Notification system
- **`search.js`** - Advanced search functionality
- **`dashboard.js`** - Dashboard data aggregation
- **`admin.js`** - Administrative functions

### Monitoring Routes
- **`monitoring.js`** - System monitoring (currently disabled)

## 🔗 Route Structure

### Authentication Routes (`/api/auth`)
```javascript
POST   /login              // User login
POST   /register           // User registration
POST   /forgot-password    // Password reset request
POST   /reset-password     // Password reset confirmation
POST   /verify-code        // Email verification
```

### Book Management (`/api/books`)
```javascript
GET    /                   // Get all books
GET    /:id                // Get specific book
POST   /                   // Add new book
PUT    /:id                // Update book
DELETE /:id                // Delete book
GET    /search             // Search books
GET    /categories         // Get book categories
```

### Borrowing System (`/api/borrowing`)
```javascript
GET    /user/:id           // Get user's borrowed books
POST   /borrow             // Borrow a book
POST   /return             // Return a book
GET    /history/:id        // Get borrowing history
GET    /overdue/:id        // Get overdue books
```

### Penalty Management (`/api/penalty`)
```javascript
GET    /user/:id           // Get user penalties
GET    /summary            // Get penalty summary
POST   /pay                // Pay penalty
GET    /history/:id        // Get payment history
```

### AI Chatbot (`/api/chatbot`)
```javascript
POST   /chat               // Send message to AI
GET    /history/:id        // Get chat history
POST   /feedback           // Submit feedback
```

### Notifications (`/api/notifications`)
```javascript
GET    /user/:id           // Get user notifications
POST   /send               // Send notification
PUT    /:id/read           // Mark as read
DELETE /:id                // Delete notification
```

### Search (`/api/search`)
```javascript
GET    /books              // Search books
GET    /users              // Search users
GET    /suggestions         // Get search suggestions
```

### Dashboard (`/api/dashboard`)
```javascript
GET    /stats              // Get system statistics
GET    /recent-activity    // Get recent activity
GET    /analytics          // Get analytics data
```

## 🛡️ Security Features

### Authentication Middleware
All protected routes use JWT authentication:
```javascript
const auth = require('../middleware/auth');
router.get('/protected', auth, handler);
```

### Input Validation
Routes use express-validator for input validation:
```javascript
const { body, validationResult } = require('express-validator');
```

### Error Handling
Consistent error handling across all routes:
```javascript
if (!validationResult(req).isEmpty()) {
    return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult(req).array()
    });
}
```

## 📊 Response Format

### Success Response
```javascript
{
    "success": true,
    "message": "Operation completed successfully",
    "data": { ... }
}
```

### Error Response
```javascript
{
    "success": false,
    "message": "Error description",
    "errors": [ ... ]
}
```

## 🔧 Route Dependencies

### Database
- All routes use the database connection from `../config/database`
- Connection pooling for optimal performance

### Services
- Routes integrate with services in `../services/`
- Business logic separated from route handlers

### Utilities
- Common utilities from `../utils/`
- Shared functionality across routes

## 📝 Best Practices

### Route Organization
1. **Single Responsibility**: Each route file handles one domain
2. **Consistent Naming**: RESTful naming conventions
3. **Error Handling**: Comprehensive error responses
4. **Validation**: Input validation on all endpoints
5. **Documentation**: Clear endpoint documentation

### Security
1. **Authentication**: JWT-based authentication
2. **Authorization**: Role-based access control
3. **Input Validation**: Sanitize all inputs
4. **Rate Limiting**: Prevent abuse
5. **CORS**: Configured for security

### Performance
1. **Database Optimization**: Efficient queries
2. **Caching**: Strategic caching implementation
3. **Pagination**: Large dataset handling
4. **Async Operations**: Non-blocking operations

## 🚀 Usage Examples

### Creating a New Route
```javascript
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// GET endpoint
router.get('/example', auth, async (req, res) => {
    try {
        // Route logic here
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
```

### Adding to Server
```javascript
// In server.js
app.use('/api/example', require('./routes/example'));
```

## 🔍 Testing Routes

### Manual Testing
Use tools like Postman or curl to test endpoints:
```bash
curl -X GET http://localhost:3000/api/books
```

### Automated Testing
Consider adding unit tests for critical routes:
```javascript
// Example test structure
describe('Books API', () => {
    test('GET /api/books returns books', async () => {
        // Test implementation
    });
});
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [JWT Authentication](https://jwt.io/)
- [Express Validator](https://express-validator.github.io/)
- [MySQL2 Documentation](https://github.com/sidorares/node-mysql2)
