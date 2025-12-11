import kafka from './config.js';
import { notificationQueue } from '../queue/notificationQueue.js';
import Notification from '../model/notification.js';

class KafkaConsumer {
    constructor() {
        this.consumer = kafka.consumer({
            groupId: process.env.KAFKA_GROUP_ID || 'notification-consumer-group',
            sessionTimeout: 30000,
            heartbeatInterval: 3000
        });
        this.isConnected = false;
    }

    async connect() {
        try {
            await this.consumer.connect();
            this.isConnected = true;
            console.log('✅ Kafka Consumer connected successfully');
        } catch (error) {
            console.error('❌ Kafka Consumer connection error:', error.message);
            throw error;
        }
    }

    async subscribe() {
        const topic = process.env.KAFKA_TOPIC || 'notifications';

        try {
            await this.consumer.subscribe({
                topic,
                fromBeginning: false
            });
            console.log(`📥 Subscribed to Kafka topic: ${topic}`);
        } catch (error) {
            console.error('❌ Error subscribing to Kafka topic:', error.message);
            throw error;
        }
    }

    async run() {
        try {
            await this.consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    try {
                        const notificationData = JSON.parse(message.value.toString());

                        console.log(`📨 [Kafka] Received message from ${topic} [${partition}]:`, notificationData._id);

                        // Update notification status to PROCESSING
                        await Notification.findByIdAndUpdate(notificationData._id, {
                            status: 'PROCESSING'
                        });

                        // Add job to BullMQ based on channel type
                        const queueName = `${notificationData.channel}Queue`;

                        await notificationQueue.add(
                            queueName,
                            {
                                notificationId: notificationData._id,
                                channel: notificationData.channel,
                                recipient: notificationData.recipient,
                                content: notificationData.content,
                                clientId: notificationData.clientId
                            },
                            {
                                attempts: 3,
                                backoff: {
                                    type: 'exponential',
                                    delay: 2000
                                },
                                removeOnComplete: true,
                                removeOnFail: false
                            }
                        );

                        console.log(`✅ [Queue] Added ${notificationData.channel} job to BullMQ: ${notificationData._id}`);

                    } catch (error) {
                        console.error('❌ Error processing Kafka message:', error.message);
                        // Don't throw - let Kafka continue processing other messages
                    }
                }
            });

            console.log('🚀 Kafka Consumer is running and processing messages...');
        } catch (error) {
            console.error('❌ Error running Kafka consumer:', error.message);
            throw error;
        }
    }

    async disconnect() {
        if (this.isConnected) {
            await this.consumer.disconnect();
            this.isConnected = false;
            console.log('🔌 Kafka Consumer disconnected');
        }
    }
}

// Singleton instance
const kafkaConsumer = new KafkaConsumer();

export default kafkaConsumer;
