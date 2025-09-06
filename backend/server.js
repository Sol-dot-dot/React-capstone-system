const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './config.env' });

// Import the fine calculation service
const fineCalculationService = require('./services/fineCalculationService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/profile'));
app.use('/api/books', require('./routes/books'));
app.use('/api/borrowing', require('./routes/borrowing'));
app.use('/api/penalty', require('./routes/penalty'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        fineService: fineCalculationService.getStatus()
    });
});

// Fine calculation service status endpoint
app.get('/api/fine-service/status', (req, res) => {
    res.json({
        success: true,
        data: fineCalculationService.getStatus()
    });
});

// Force fine calculation endpoint (admin only)
app.post('/api/fine-service/force-process', (req, res) => {
    fineCalculationService.forceProcess()
        .then(() => {
            res.json({
                success: true,
                message: 'Fine calculation completed'
            });
        })
        .catch(error => {
            res.status(500).json({
                success: false,
                message: 'Failed to process fines',
                error: error.message
            });
        });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    
    // Start the fine calculation service
    fineCalculationService.start();
    
    // Graceful shutdown handling
    process.on('SIGINT', () => {
        console.log('\n🛑 Received SIGINT. Gracefully shutting down...');
        fineCalculationService.stop();
        process.exit(0);
    });
    
    process.on('SIGTERM', () => {
        console.log('\n🛑 Received SIGTERM. Gracefully shutting down...');
        fineCalculationService.stop();
        process.exit(0);
    });
});
