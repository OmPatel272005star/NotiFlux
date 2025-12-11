# NotiFlux

A distributed notification system supporting Email, SMS, and WhatsApp delivery using Kafka and BullMQ.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- MongoDB, Kafka, Redis (via Docker)

### 1. Start Infrastructure

```bash
cd Backend
docker-compose up -d
```

This starts Kafka, Redis, and MongoDB.

### 2. Configure Environment

Copy and configure `.env` in `Backend/`:

```bash
cp Backend/.env.example Backend/.env
```

**Required Variables:**
- MongoDB connection string
- Email credentials (SMTP)
- SMS provider (Twilio)
- WhatsApp Cloud API (Meta)

### 3. Start Backend

```bash
cd Backend
npm install
npm start
```

Runs on `http://localhost:3000`

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`

## 📁 Project Structure

```
├── Backend/          # Node.js API server + Workers
├── frontend/         # React + Vite + Tailwind UI
└── README.md
```

## 🔑 API Authentication

Generate API keys:
```bash
cd Backend
node src/utils/generateApiKey.js
```

## 📚 Documentation

- [Backend README](Backend/README.md)
- [Quick Start Guide](Backend/QUICKSTART.md)
- [Architecture Diagram](Backend/src/architecture_diagram/)

## 🛠 Tech Stack

**Backend:** Node.js, Express, Kafka, BullMQ, MongoDB  
**Frontend:** React, Vite, Tailwind CSS  
**Infrastructure:** Docker, Redis, Kafka

---

Built with ❤️ for scalable notifications
