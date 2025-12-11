# 🔔 Distributed Scalable Notification Service

> **Email • SMS • WhatsApp**

A production-grade microservice notification system designed to handle millions of notifications asynchronously using Kafka event streaming, Redis + BullMQ job queues, and scalable worker architecture.

## 🚀 Why This Architecture?

| Feature | Basic System | This System |
|---------|--------------|-------------|
| Request waits for message send | ❌ | ✅ API returns instantly |
| High traffic support | ❌ | ✅ Millions/day |
| Retry / Error handling | ❌ | ✅ Auto retry with backoff |
| Fault tolerance | ❌ | ✅ Decoupled workers |
| Scale by adding servers | ❌ | ✅ Workers & Kafka consumers |

## 🏗️ System Architecture

```
Client App / Services
        ↓
REST API (Express, API Key Authentication)
        ↓
MongoDB → Save Notification (status = PENDING)
        ↓
Kafka Producer → Topic: "notifications"
        ↓
Kafka Broker (partition by channel or client)
        ↓
Kafka Consumer Service
        ↓
Redis Queue (BullMQ)
        ↓
Workers Pool
   ├ emailWorker → sendEmail()
   ├ smsWorker → sendSms()
   └ whatsappWorker → sendWhatsapp()
        ↓
MongoDB → Update (SENT / FAILED / RETRY_COUNT)
```

###  Scaling Strategy

| Component | How to Scale |
|-----------|--------------|
| API Server | Horizontal scaling via load balancer |
| Kafka Broker | Scale partitions |
| Kafka Consumers | Add more for parallel consumption |
| BullMQ Workers | Add more workers per channel |
| DB Layer | Sharding / Indexing |

## 📁 Project Structure

```
Backend/
│
├── docker-compose.yml          # Kafka, Zookeeper, Kafka UI, Redis
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies and scripts
│
└── src/
    │
    ├── controller/             # API request handlers
    │   ├── client.js           # Register client & manage API key
    │   └── notification.js     # Queue notification requests
    │
    ├── middleware/
    │   └── auth.js             # API key authentication
    │
    ├── model/
    │   ├── client.js           # Client schema (MongoDB)
    │   └── notification.js     # Notification schema (MongoDB)
    │
    ├── kafka/
    │   ├── config.js           # Kafka connection config
    │   ├── producer.js         # Publish events to Kafka topic
    │   └── consumer.js         # Consume events → push to Redis queue
    │
    ├── queue/
    │   ├── notificationQueue.js    # BullMQ queue instance
    │   └── workers/
    │       ├── emailWorker.js      # Email processing
    │       ├── smsWorker.js        # SMS processing
    │       └── whatsappWorker.js   # WhatsApp processing
    │
    ├── router/
    │   └── routes.js           # All routing declarations
    │
    ├── utils/
    │   ├── db.js               # MongoDB connection
    │   ├── generateApiKey.js   # API key generator (bcrypt)
    │   ├── sendEmail.js        # Nodemailer email sender
    │   ├── sendSms.js          # SMS service (Twilio/MSG91)
    │   └── sendWhatsapp.js     # WhatsApp service (Meta Cloud API)
    │
    ├── server.js               # Express API server
    ├── worker.js               # BullMQ workers process
    └── consumer.js             # Kafka consumer process
```

## 🔄 End-to-End Data Flow

| Step | Actor | Description |
|------|-------|-------------|
| 1 | Client | Calls `POST /api/notifications` |
| 2 | API | Validates API key |
| 3 | DB | Inserts record (PENDING) |
| 4 | Kafka Producer | Publishes event to topic |
| 5 | Kafka Broker | Distributes messages across partitions |
| 6 | Kafka Consumer | Converts event → Redis queue job |
| 7 | BullMQ Queue | Stores queued jobs + retries |
| 8 | Worker Pool | Executes `sendEmail`/`sendSms`/`sendWhatsapp` |
| 9 | DB | Updates status: SENT / FAILED |
| 10 | Client | Can view logs via GET endpoints |

## 📌 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/client/register` | Register client & generate API key |

### Protected Endpoints (Require API Key)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/client/me` | View usage stats |
| POST | `/api/notifications` | Queue new notification |
| GET | `/api/notifications` | List queued/sent notifications |
| GET | `/api/notifications/:id` | Get notification details |

### Example: Register Client

```bash
curl -X POST http://localhost:3000/api/client/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My App",
    "email": "myapp@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Client registered successfully",
  "data": {
    "clientId": "...",
    "name": "My App",
    "email": "myapp@example.com",
    "apiKey": "nk_abc123...",
    "createdAt": "2024-12-07T..."
  },
  "warning": "⚠️ Save this API key securely. It will not be shown again!"
}
```

### Example: Send Email Notification

```bash
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -H "x-api-key: nk_abc123..." \
  -d '{
    "channel": "email",
    "recipient": {
      "email": "user@example.com"
    },
    "content": {
      "subject": "Welcome!",
      "body": "<h1>Hello World</h1><p>Welcome to our service!</p>"
    }
  }'
```

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| Application | Node.js + Express |
| Database | MongoDB |
| Authentication | API Key (bcrypt hashed) |
| Event Streaming | Kafka |
| Queue + Retry | BullMQ + Redis |
| Workers | Node.js |
| Email | Nodemailer + SMTP |
| SMS | MSG91 / Twilio |
| WhatsApp | Meta Cloud API |

## ⚙️ Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/notifications

# API Security
API_SECRET=your-super-secret-random-string

# Redis
REDIS_URL=redis://127.0.0.1:6379

# Kafka
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC=notifications

# SMTP (Email)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_verified_sender@example.com
SMTP_PASS=your_smtp_key
SMTP_FROM_NAME=Notification Service
SMTP_FROM_EMAIL=noreply@yourcompany.com

# SMS (Twilio or MSG91)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# WhatsApp (Meta Cloud API)
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ installed
- **Docker Desktop** installed and running
- **MongoDB** running (local or Atlas)

### Installation

1. **Clone & Install Dependencies**

```bash
cd Backend
npm install
```

2. **Start Infrastructure (Docker)**

```bash
npm run docker:up
```

This starts:
- Kafka (port 9092)
- Zookeeper (port 2181)
- Kafka UI (port 8080) - http://localhost:8080
- Redis (port 6379)

3. **Configure Environment**

```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Start All Services** (3 separate terminals)

**Terminal 1: API Server**
```bash
npm run dev:api
```

**Terminal 2: Kafka Consumer**
```bash
npm run dev:consumer
```

**Terminal 3: Workers**
```bash
npm run dev:worker
```

### Verify Setup

1. **API Health Check**
```bash
curl http://localhost:3000/health
```

2. **Kafka UI**
- Open http://localhost:8080
- Check `notifications` topic is created

3. **Test Flow**
```bash
# 1. Register client
curl -X POST http://localhost:3000/api/client/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com"}'

# 2. Send notification (use the API key from step 1)
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "channel": "email",
    "recipient": {"email": "user@test.com"},
    "content": {"subject": "Test", "body": "<p>Hello!</p>"}
  }'
```

## 📊 Monitoring

### Kafka UI
- URL: http://localhost:8080
- View topics, partitions, and messages

### Logs
Each service logs to console:
- **API**: Request/response logs
- **Consumer**: Kafka message consumption
- **Workers**: Job processing and status

## 🚀 Production Deployment

### Recommended Infrastructure

| Component | Platform |
|-----------|----------|
| API Server | Render / Railway / AWS ECS |
| Workers | Render / EC2 / Docker Swarm |
| MongoDB | MongoDB Atlas |
| Redis | Redis Cloud / AWS ElastiCache |
| Kafka | Confluent Cloud / AWS MSK |

### Deployment Steps

1. **Set environment variables** on your platform
2. **Deploy API**: `npm run start:api`
3. **Deploy Consumer**: `npm run start:consumer`
4. **Deploy Workers**: `npm run start:worker`

## 🗺️ Roadmap

- [ ] Bulk CSV campaigns
- [ ] Multi-template management
- [ ] Webhook callback for delivery reports
- [ ] Dashboard UI (React + Tailwind)
- [ ] Client billing & quotas
- [ ] Prometheus / Grafana monitoring
- [ ] Dead Letter Queue UI
- [ ] Rate limiting per client

## 📝 Notes

- **SMS & WhatsApp** utilities contain placeholder implementations. Uncomment and add your credentials to enable.
- **Email** is fully functional with SMTP configuration.
- **API Keys** are hashed with bcrypt for security.
- **Retry Logic**: Failed jobs retry 3 times with exponential backoff.

## ⭐ Summary

This repository implements a **real production-grade distributed notification architecture**, same pattern used by:

- Swiggy, Zomato, Shopify, Flipkart, Uber

**Features:**
- ✅ Event-driven communication (Kafka)
- ✅ Asynchronous background processing (Redis + BullMQ)
- ✅ Scalable parallel workers
- ✅ Complete delivery logs & retries
- ✅ Fault-tolerant & high-throughput

This system is **scalable**, **fault-tolerant**, **high-throughput**, and **cloud-deployable**.

---

Made with ❤️ for scalable microservices
