# Utilities Documentation

This directory contains utility functions and helper modules for the Capstone Library Management System.

## 📁 Utility Files

### Core Utilities
- **`bookUtils.js`** - Book-related utility functions
- **`borrowingUtils.js`** - Borrowing process utilities
- **`penaltyUtils.js`** - Penalty calculation utilities
- **`emailService.js`** - Email notification service

### AI & Data Utilities
- **`chatbotService.js`** - AI chatbot service integration
- **`vectorDBService.js`** - Vector database operations
- **`vectorStorage.js`** - Vector data storage management
- **`readingHistoryService.js`** - Reading history tracking

## 🔧 Utility Descriptions

### Book Utilities (`bookUtils.js`)
**Purpose**: Book-related helper functions
**Features**:
- Book validation
- ISBN processing
- Book metadata extraction
- Search optimization

**Usage**:
```javascript
const { validateBook, processISBN } = require('./bookUtils');
const isValid = validateBook(bookData);
```

### Borrowing Utilities (`borrowingUtils.js`)
**Purpose**: Borrowing process management
**Features**:
- Borrowing validation
- Return processing
- Transaction management
- Status tracking

**Usage**:
```javascript
const { createBorrowTransaction, processReturn } = require('./borrowingUtils');
const transaction = await createBorrowTransaction(userId, bookId);
```

### Penalty Utilities (`penaltyUtils.js`)
**Purpose**: Penalty calculation and management
**Features**:
- Fine calculation
- Payment processing
- Penalty status tracking
- Overdue management

**Usage**:
```javascript
const { calculatePenalty, processPayment } = require('./penaltyUtils');
const penalty = calculatePenalty(overdueDays, fineRate);
```

### Email Service (`emailService.js`)
**Purpose**: Email notification system
**Features**:
- SMTP configuration
- Template management
- Delivery tracking
- Error handling

**Usage**:
```javascript
const emailService = require('./emailService');
await emailService.sendNotification(userEmail, template, data);
```

### Chatbot Service (`chatbotService.js`)
**Purpose**: AI chatbot integration
**Features**:
- OpenAI integration
- Google AI integration
- Context management
- Response processing

**Usage**:
```javascript
const chatbotService = require('./chatbotService');
const response = await chatbotService.processMessage(message, context);
```

### Vector Database Service (`vectorDBService.js`)
**Purpose**: Vector database operations
**Features**:
- Embedding generation
- Similarity search
- Vector storage
- Index management

**Usage**:
```javascript
const vectorDB = require('./vectorDBService');
const results = await vectorDB.searchSimilar(query, limit);
```

### Vector Storage (`vectorStorage.js`)
**Purpose**: Vector data storage management
**Features**:
- JSON-based storage
- Data persistence
- Backup management
- Data validation

**Usage**:
```javascript
const vectorStorage = require('./vectorStorage');
await vectorStorage.saveEmbedding(id, vector);
```

### Reading History Service (`readingHistoryService.js`)
**Purpose**: Reading history tracking
**Features**:
- History recording
- Pattern analysis
- Preference tracking
- Recommendation data

**Usage**:
```javascript
const readingHistory = require('./readingHistoryService');
await readingHistory.recordReading(userId, bookId, duration);
```

## 🏗️ Utility Architecture

### Utility Pattern
All utilities follow a consistent pattern:
```javascript
// Utility functions
const utilityFunction = (params) => {
    try {
        // Utility logic
        return result;
    } catch (error) {
        console.error('Utility error:', error);
        throw error;
    }
};

// Export utilities
module.exports = {
    utilityFunction,
    // ... other functions
};
```

### Error Handling
Utilities implement comprehensive error handling:
```javascript
try {
    // Utility operation
} catch (error) {
    console.error('Utility operation failed:', error);
    throw new Error('Utility operation failed');
}
```

### Logging
Utilities include detailed logging:
```javascript
console.log('Utility operation started:', { params });
console.log('Utility operation completed:', { result });
```

## 🔄 Utility Integration

### Database Integration
Utilities connect to the database:
```javascript
const db = require('../config/database');
```

### Service Integration
Utilities are used by services:
```javascript
// In services/fineCalculationService.js
const { calculatePenalty } = require('../utils/penaltyUtils');
```

### Route Integration
Utilities are used by route handlers:
```javascript
// In routes/books.js
const { validateBook } = require('../utils/bookUtils');
```

## 📊 Utility Functions

### Validation Functions
```javascript
// Book validation
const validateBook = (bookData) => {
    // Validation logic
    return isValid;
};

// User validation
const validateUser = (userData) => {
    // Validation logic
    return isValid;
};
```

### Processing Functions
```javascript
// Data processing
const processData = (rawData) => {
    // Processing logic
    return processedData;
};

// Format conversion
const formatData = (data, format) => {
    // Format logic
    return formattedData;
};
```

### Calculation Functions
```javascript
// Fine calculation
const calculateFine = (overdueDays, rate) => {
    // Calculation logic
    return fineAmount;
};

// Date calculations
const calculateDaysOverdue = (returnDate, dueDate) => {
    // Calculation logic
    return days;
};
```

## 🛠️ Utility Development

### Adding New Utilities
1. Create utility file in `utils/` directory
2. Follow the utility pattern
3. Add error handling and logging
4. Export utility functions
5. Add to services/routes as needed

### Utility Testing
Utilities should be tested independently:
```javascript
// Example test structure
describe('BookUtils', () => {
    test('validates book correctly', () => {
        // Test implementation
    });
});
```

### Utility Documentation
Each utility should include:
- Function documentation
- Usage examples
- Error handling
- Performance considerations

## 🔧 Configuration

### Utility Configuration
Utilities can be configured through environment variables:
```javascript
const config = {
    emailHost: process.env.EMAIL_HOST,
    emailPort: process.env.EMAIL_PORT,
    emailUser: process.env.EMAIL_USER,
    emailPass: process.env.EMAIL_PASS
};
```

### Utility Dependencies
Utilities declare their dependencies:
```javascript
const dependencies = {
    database: require('../config/database'),
    logger: require('../config/logger')
};
```

## 📈 Performance Optimization

### Caching
Utilities implement caching where appropriate:
```javascript
const cache = new Map();
const getCachedResult = (key) => cache.get(key);
const setCachedResult = (key, value) => cache.set(key, value);
```

### Async Operations
Utilities use async/await for non-blocking operations:
```javascript
async function processAsyncData(data) {
    const result = await someAsyncOperation(data);
    return result;
}
```

### Error Recovery
Utilities implement error recovery mechanisms:
```javascript
async function resilientOperation() {
    let retries = 3;
    while (retries > 0) {
        try {
            return await operation();
        } catch (error) {
            retries--;
            if (retries === 0) throw error;
            await delay(1000);
        }
    }
}
```

## 🚀 Deployment Considerations

### Utility Initialization
Utilities initialize on server startup:
```javascript
// In server.js
const emailService = require('./utils/emailService');
```

### Utility Monitoring
Utilities are monitored in production:
- Function performance
- Error rates
- Resource usage
- Success rates

### Utility Scaling
Utilities are designed to scale:
- Stateless design
- Efficient algorithms
- Caching strategies
- Resource optimization

## 📚 Additional Resources

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Utility Function Patterns](https://javascript.info/function-expressions)
- [Error Handling](https://nodejs.org/en/docs/guides/error-handling/)
- [Performance Optimization](https://nodejs.org/en/docs/guides/simple-profiling/)








