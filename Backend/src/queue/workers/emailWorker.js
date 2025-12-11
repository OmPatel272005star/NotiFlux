import { Worker } from 'bullmq';
import Redis from 'ioredis';
import Notification from '../../model/notification.js';
import Client from '../../model/client.js';
import sendEmail from '../../utils/sendEmail.js';

// Redis connection for worker
const connection = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
});

// Email Worker
export const emailWorker = new Worker(
    'notifications',
    async (job) => {
        const { notificationId, recipient, content, clientId } = job.data;

        console.log(`📧 [Email Worker] Processing job ${job.id} for notification ${notificationId}`);

        try {
            // Send email using nodemailer
            await sendEmail({
                to: recipient.email,
                subject: content.subject || 'Notification',
                html: content.body,
                text: content.text || content.body.replace(/<[^>]*>/g, '') // Strip HTML for plain text
            });

            // Update notification status to SENT
            await Notification.findByIdAndUpdate(notificationId, {
                status: 'SENT',
                sentAt: new Date(),
                $inc: { retryCount: 0 }
            });

            // Update client usage stats
            await Client.findByIdAndUpdate(clientId, {
                $inc: { 'usageStats.emailsSent': 1 }
            });

            console.log(`✅ [Email Worker] Successfully sent email for notification ${notificationId}`);
            return { success: true, notificationId };

        } catch (error) {
            console.error(`❌ [Email Worker] Failed to send email:`, error.message);

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
        concurrency: 5, // Process 5 emails concurrently
        limiter: {
            max: 100, // Max 100 jobs
            duration: 60000 // Per 60 seconds (1 minute)
        }
    }
);

// Worker event listeners
emailWorker.on('completed', (job) => {
    console.log(`✅ [Email Worker] Job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job, error) => {
    console.error(`❌ [Email Worker] Job ${job.id} failed:`, error.message);
});

emailWorker.on('error', (error) => {
    console.error('❌ [Email Worker] Error:', error.message);
});

export default emailWorker;
