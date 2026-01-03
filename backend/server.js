const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './config.env' });

// Import the fine calculation service
const fineCalculationService = require('./services/fineCalculationService');

// Import the notification scheduler service
const notificationScheduler = require('./services/notificationScheduler');

// Import logger for production-ready logging
const { logger, requestLogger, errorLogger } = require('./config/logger');

const app = express();

// Request logging middleware (enabled for production logging)
app.use(requestLogger);

// Standard middleware
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
app.use('/api/student-records', require('./routes/studentRecords'));
app.use('/api/semesters', require('./routes/semesters'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/', require('./routes/dashboard'));
// app.use('/api/monitoring', require('./routes/monitoring'));

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

// Force notification check endpoint (admin/testing)
app.post('/api/notification-service/force-process', (req, res) => {
    notificationScheduler.runManually()
        .then(result => {
            res.json({
                success: true,
                message: 'Notification check completed',
                data: result
            });
        })
        .catch(error => {
            res.status(500).json({
                success: false,
                message: 'Failed to process notifications',
                error: error.message
            });
        });
});

// Error logging middleware (enabled for production error tracking)
app.use(errorLogger);

// Error handler
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', { error: err.message, stack: err.stack });
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    logger.info('Server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        healthCheck: `http://localhost:${PORT}/api/health`,
        networkAccess: `http://0.0.0.0:${PORT}/api/health`
    });

    // Start the fine calculation service
    fineCalculationService.start();

    // Start the notification scheduler
    notificationScheduler.initializeScheduler();

    // Graceful shutdown handling
    process.on('SIGINT', () => {
        logger.info('Received SIGINT. Gracefully shutting down...');
        fineCalculationService.stop();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        logger.info('Received SIGTERM. Gracefully shutting down...');
        fineCalculationService.stop();
        process.exit(0);
    });
});
