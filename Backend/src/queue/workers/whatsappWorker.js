import { Worker } from 'bullmq';
import Redis from 'ioredis';
import Notification from '../../model/notification.js';
import Client from '../../model/client.js';
import sendWhatsapp from '../../utils/sendWhatsapp.js';

// Redis connection for worker
const connection = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
});

// WhatsApp Worker
export const whatsappWorker = new Worker(
    'notifications',
    async (job) => {
        const { notificationId, recipient, content, clientId, channel } = job.data;

        // Only process WhatsApp jobs
        if (channel !== 'whatsapp') {
            return { skipped: true, reason: 'Not a WhatsApp job' };
        }

        console.log(`💬 [WhatsApp Worker] Processing job ${job.id} for notification ${notificationId}`);

        try {
            // Send WhatsApp message using Meta Cloud API
            await sendWhatsapp({
                to: recipient.phone,
                message: content.body,
                templateName: content.templateName // Optional: for template messages
            });

            // Update notification status to SENT
            await Notification.findByIdAndUpdate(notificationId, {
                status: 'SENT',
                sentAt: new Date(),
                $inc: { retryCount: 0 }
            });

            // Update client usage stats
            await Client.findByIdAndUpdate(clientId, {
                $inc: { 'usageStats.whatsappSent': 1 }
            });

            console.log(`✅ [WhatsApp Worker] Successfully sent WhatsApp for notification ${notificationId}`);
            return { success: true, notificationId };

        } catch (error) {
            console.error(`❌ [WhatsApp Worker] Failed to send WhatsApp:`, error.message);

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
        concurrency: 10, // Process 10 WhatsApp messages concurrently
        limiter: {
            max: 80, // Max 80 jobs
            duration: 60000 // Per 60 seconds
        }
    }
);

// Worker event listeners
whatsappWorker.on('completed', (job) => {
    console.log(`✅ [WhatsApp Worker] Job ${job.id} completed successfully`);
});

whatsappWorker.on('failed', (job, error) => {
    console.error(`❌ [WhatsApp Worker] Job ${job.id} failed:`, error.message);
});

whatsappWorker.on('error', (error) => {
    console.error('❌ [WhatsApp Worker] Error:', error.message);
});

export default whatsappWorker;
