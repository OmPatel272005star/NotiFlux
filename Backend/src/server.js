import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './utils/db.js';
import router from "./router/routes.js";
import kafkaProducer from './kafka/producer.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'notification-api',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use("/api", router);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ [Server Error]:', err);
    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Initialize server
async function startServer() {
    try {
        // Connect to MongoDB
        await connectDB();

        // Connect Kafka Producer
        await kafkaProducer.connect();

        // Start Express server
        app.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log(`🚀 API Server running on port ${PORT}`);
            console.log(`📡 Health check: http://localhost:${PORT}/health`);
            console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
            console.log('='.repeat(50));
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\n🛑 SIGTERM received, shutting down gracefully...');
    await kafkaProducer.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\n🛑 SIGINT received, shutting down gracefully...');
    await kafkaProducer.disconnect();
    process.exit(0);
});

// Start the server
startServer();
