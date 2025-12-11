# 🚀 Quick Start Guide

## ✅ Setup Complete!

Your distributed notification system is ready. Here's what's been set up:

### 📦 Running Services (Docker)

✓ **Kafka** - Running on port 9092
✓ **Zookeeper** - Running on port 2181  
✓ **Kafka UI** - http://localhost:8080
✓ **Redis** - Running on port 6379

### 📝 Next Steps

#### 1. Start the Application Services

You need to run **3 separate processes** in 3 different terminals:

**Terminal 1 - API Server:**
```bash
cd Backend
npm run dev:api
```

**Terminal 2 - Kafka Consumer:**
```bash
cd Backend
npm run dev:consumer
```

**Terminal 3 - BullMQ Workers:**
```bash
cd Backend
npm run dev:worker
```

#### 2. Configure Email (Optional but Recommended)

Edit `.env` file and add your SMTP credentials:

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_smtp_password
SMTP_FROM_NAME=Your App Name
SMTP_FROM_EMAIL=noreply@yourapp.com
```

**Recommended Free SMTP Providers:**
- [Brevo (Sendinblue)](https://www.brevo.com/) - 300 emails/day free
- [SendGrid](https://sendgrid.com/) - 100 emails/day free
- [Gmail](https://support.google.com/mail/answer/185833) - Use app password

#### 3. Test the System

**Step 1: Register a Client**
```bash
curl -X POST http://localhost:3000/api/client/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"MyApp\",\"email\":\"myapp@example.com\"}"
```

**Response:** Save the `apiKey` from the response!

**Step 2: Send a Test Notification**
```bash
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -d "{
    \"channel\": \"email\",
    \"recipient\": {\"email\": \"test@example.com\"},
    \"content\": {
      \"subject\": \"Test Notification\",
      \"body\": \"<h1>Hello!</h1><p>This is a test email from your notification system.</p>\"
    }
  }"
```

**Step 3: Check the Logs**

Watch the logs in all 3 terminals:
- API will show: Notification created & published to Kafka
- Consumer will show: Event received & job queued to Redis
- Worker will show: Email sent successfully

**Step 4: View in Kafka UI**

Open http://localhost:8080 and explore:
- Topics → `notifications`
- Messages
- Consumer groups

#### 4. View Your Notifications

**Get all notifications:**
```bash
curl http://localhost:3000/api/notifications \
  -H "x-api-key: YOUR_API_KEY"
```

**Get client stats:**
```bash
curl http://localhost:3000/api/client/me \
  -H "x-api-key: YOUR_API_KEY"
```

## 🎯 Understanding the Flow

```
1. POST /api/notifications
   ↓
2. MongoDB saves notification (PENDING)
   ↓
3. Kafka Producer publishes event
   ↓
4. Kafka Consumer receives event
   ↓
5. BullMQ adds job to queue
   ↓
6. Worker processes job
   ↓
7. Email sent via SMTP
   ↓
8. MongoDB updated (SENT/FAILED)
```

## 🔧 Troubleshooting

### Kafka Connection Issues
- Ensure Docker containers are running: `docker ps`
- Restart: `npm run docker:down && npm run docker:up`

### MongoDB Connection Issues
- Check MongoDB is running
- Verify `MONGO_URI` in `.env`

### Email Not Sending
- Check SMTP credentials in `.env`
- Look at worker logs for errors
- Email will work with placeholders for now (logs "would send")

## 🛑 Stopping Services

**Stop application services:** `Ctrl+C` in each terminal

**Stop Docker containers:**
```bash
npm run docker:down
```

## 📚 Learn More

Read the complete [README.md](./README.md) for:
- Full API documentation
- Architecture details
- Production deployment guide
- Advanced configuration

---

**🎉 You're all set! Start building scalable notification workflows!**
