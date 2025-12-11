import { Queue } from 'bullmq';
import Redis from 'ioredis';

// Redis connection
const connection = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
});

// Single notification queue for all channels
export const notificationQueue = new Queue('notifications', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000 // Start with 2 seconds, exponentially increase
        },
        removeOnComplete: {
            age: 3600, // Keep completed jobs for 1 hour
            count: 1000 // Keep last 1000 completed jobs
        },
        removeOnFail: {
            age: 86400 // Keep failed jobs for 24 hours
        }
    }
});

// Event listeners for queue
notificationQueue.on('error', (error) => {
    console.error('❌ [Queue Error]:', error.message);
});

notificationQueue.on('waiting', ({ id }) => {
    console.log(`⏳ [Queue] Job ${id} is waiting`);
});

notificationQueue.on('active', ({ id }) => {
    console.log(`⚙️  [Queue] Job ${id} is now active`);
});

notificationQueue.on('completed', ({ id }) => {
    console.log(`✅ [Queue] Job ${id} completed`);
});

notificationQueue.on('failed', ({ id, failedReason }) => {
    console.error(`❌ [Queue] Job ${id} failed: ${failedReason}`);
});

export default notificationQueue;
