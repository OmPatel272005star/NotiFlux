import dotenv from 'dotenv';
import connectDB from './utils/db.js';
import kafkaConsumer from './kafka/consumer.js';

dotenv.config();

/**
 * Kafka Consumer Service
 * Consumes events from Kafka and pushes jobs to BullMQ
 */
async function startConsumer() {
    try {
        console.log('='.repeat(50));
        console.log('🔄 Starting Kafka Consumer Service...');
        console.log('='.repeat(50));

        // Connect to MongoDB
        await connectDB();

        // Connect and subscribe to Kafka
        await kafkaConsumer.connect();
        await kafkaConsumer.subscribe();

        // Start consuming messages
        await kafkaConsumer.run();

        console.log('✅ Kafka Consumer is running');
        console.log('💡 Listening for notification events...');

    } catch (error) {
        console.error('❌ Failed to start Kafka Consumer:', error.message);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\n🛑 SIGTERM received, shutting down Kafka Consumer...');
    await kafkaConsumer.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\n🛑 SIGINT received, shutting down Kafka Consumer...');
    await kafkaConsumer.disconnect();
    process.exit(0);
});

// Error handlers
process.on('uncaughtException', async (error) => {
    console.error('❌ Uncaught Exception:', error);
    await kafkaConsumer.disconnect();
    process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    await kafkaConsumer.disconnect();
    process.exit(1);
});

// Start the consumer
startConsumer();
