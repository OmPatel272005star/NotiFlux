import dotenv from 'dotenv';
import connectDB from './utils/db.js';
import emailWorker from './queue/workers/emailWorker.js';
import smsWorker from './queue/workers/smsWorker.js';
import whatsappWorker from './queue/workers/whatsappWorker.js';

dotenv.config();

/**
 * BullMQ Workers Service
 * Processes jobs from Redis queue
 */
async function startWorkers() {
    try {
        console.log('='.repeat(50));
        console.log('⚙️  Starting BullMQ Workers...');
        console.log('='.repeat(50));

        // Connect to MongoDB
        await connectDB();

        console.log('✅ Email Worker started (concurrency: 5)');
        console.log('✅ SMS Worker started (concurrency: 10)');
        console.log('✅ WhatsApp Worker started (concurrency: 10)');
        console.log('💡 Workers are processing jobs from queue...');
        console.log('='.repeat(50));

    } catch (error) {
        console.error('❌ Failed to start workers:', error.message);
        process.exit(1);
    }
}

// Graceful shutdown
async function shutdown() {
    console.log('\n🛑 Shutting down workers gracefully...');

    try {
        await Promise.all([
            emailWorker.close(),
            smsWorker.close(),
            whatsappWorker.close()
        ]);
        console.log('✅ All workers closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error.message);
        process.exit(1);
    }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Error handlers
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown();
});

// Start the workers
startWorkers();
