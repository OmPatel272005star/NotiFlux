import kafka from './config.js';

class KafkaProducer {
    constructor() {
        this.producer = kafka.producer({
            allowAutoTopicCreation: true,
            transactionTimeout: 30000
        });
        this.isConnected = false;
    }

    async connect() {
        try {
            await this.producer.connect();
            this.isConnected = true;
            console.log('✅ Kafka Producer connected successfully');
        } catch (error) {
            console.error('❌ Kafka Producer connection error:', error.message);
            throw error;
        }
    }

    async sendNotificationEvent(notificationData) {
        if (!this.isConnected) {
            throw new Error('Kafka Producer is not connected');
        }

        const topic = process.env.KAFKA_TOPIC || 'notifications';

        try {
            await this.producer.send({
                topic,
                messages: [
                    {
                        key: notificationData._id.toString(),
                        value: JSON.stringify(notificationData),
                        headers: {
                            'event-type': 'notification.created',
                            'timestamp': Date.now().toString()
                        }
                    }
                ]
            });

            console.log(`📤 Published notification event to Kafka: ${notificationData._id}`);
            return true;
        } catch (error) {
            console.error('❌ Error publishing to Kafka:', error.message);
            throw error;
        }
    }

    async disconnect() {
        if (this.isConnected) {
            await this.producer.disconnect();
            this.isConnected = false;
            console.log('🔌 Kafka Producer disconnected');
        }
    }
}

// Singleton instance
const kafkaProducer = new KafkaProducer();

export default kafkaProducer;
