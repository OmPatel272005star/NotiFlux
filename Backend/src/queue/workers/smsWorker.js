import { Worker } from 'bullmq';
import Redis from 'ioredis';
import Notification from '../../model/notification.js';
import Client from '../../model/client.js';
import sendSms from '../../utils/sendSms.js';

// Redis connection for worker
const connection = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
});

// SMS Worker
export const smsWorker = new Worker(
    'notifications',
    async (job) => {
        const { notificationId, recipient, content, clientId, channel } = job.data;

        // Only process SMS jobs
        if (channel !== 'sms') {
            return { skipped: true, reason: 'Not an SMS job' };
        }

        console.log(`📱 [SMS Worker] Processing job ${job.id} for notification ${notificationId}`);

        try {
            // Send SMS using configured provider
            await sendSms({
                to: recipient.phone,
                message: content.body
            });

            // Update notification status to SENT
            await Notification.findByIdAndUpdate(notificationId, {
                status: 'SENT',
                sentAt: new Date(),
                $inc: { retryCount: 0 }
            });

            // Update client usage stats
            await Client.findByIdAndUpdate(clientId, {
                $inc: { 'usageStats.smsSent': 1 }
            });

            console.log(`✅ [SMS Worker] Successfully sent SMS for notification ${notificationId}`);
            return { success: true, notificationId };

        } catch (error) {
            console.error(`❌ [SMS Worker] Failed to send SMS:`, error.message);

            // Update notification with failure info
            await Notification.findByIdAndUpdate(notificationId, {
                status: 'FAILED',
                errorMessage: error.message,
                $inc: { retryCount: 1 }
            });

            throw error; // Let BullMQ handle retry logic
        }
    },
    {
        connection,
        concurrency: 10, // Process 10 SMS concurrently
        limiter: {
            max: 50, // Max 50 jobs
            duration: 60000 // Per 60 seconds
        }
    }
);

// Worker event listeners
smsWorker.on('completed', (job) => {
    console.log(`✅ [SMS Worker] Job ${job.id} completed successfully`);
});

smsWorker.on('failed', (job, error) => {
    console.error(`❌ [SMS Worker] Job ${job.id} failed:`, error.message);
});

smsWorker.on('error', (error) => {
    console.error('❌ [SMS Worker] Error:', error.message);
});

export default smsWorker;
