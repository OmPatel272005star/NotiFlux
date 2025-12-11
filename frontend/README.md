# Frontend - Notification System Dashboard

A modern, responsive React dashboard for managing notifications through Email, SMS, and WhatsApp channels.

## Tech Stack

- ⚡ **Vite** - Fast build tool
- ⚛️ **React 18** - UI library
- 🎨 **Tailwind CSS** - Styling
- 🛣️ **React Router v6** - Navigation
- 📡 **Axios** - HTTP client
- 📝 **React Hook Form** - Form validation
- ✅ **Zod** - Schema validation
- 🔔 **React Hot Toast** - Notifications
- 🎯 **Lucide React** - Icons

## Features

✨ **User Authentication** - Register and login with API key  
📊 **Dashboard** - Overview with stats and recent notifications  
📤 **Send Notifications** - Multi-channel notification sending  
📋 **Notifications List** - View all notifications with filters  
🔍 **Notification Details** - Detailed view of each notification  
📱 **Responsive Design** - Works on all devices  
🎨 **Modern UI** - Clean and attractive interface

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Update the `.env` file with your backend API URL:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── pages/              # Page components
│   │   ├── Register.jsx
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── SendNotification.jsx
│   │   ├── NotificationsList.jsx
│   │   └── NotificationDetails.jsx
│   ├── components/         # Reusable components
│   │   └── Navbar.jsx
│   ├── services/          # API services
│   │   └── api.js
│   ├── context/           # React context
│   │   └── AuthContext.jsx
│   ├── utils/             # Utility functions
│   │   └── helpers.js
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── .env                   # Environment variables
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Endpoints

The frontend integrates with the following backend endpoints:

- `POST /client/register` - Register new client
- `GET /client/me` - Get client info
- `POST /notifications` - Send notification
- `GET /notifications` - Get all notifications
- `GET /notifications/:id` - Get notification by ID

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL (default: `http://localhost:3000`)

## Usage

### 1. Register

- Navigate to `/register`
- Enter your name and email
- Copy and save the API key shown after registration

### 2. Login

- Navigate to `/login`
- Enter your email and API key
- You'll be redirected to the dashboard

### 3. Send Notification

- Click "Send Notification" from dashboard
- Select channel (Email, SMS, or WhatsApp)
- Enter recipient details
- Write your message
- Click "Send Notification"

### 4. View Notifications

- Click "View All Notifications" from dashboard
- Use filters to search by channel or status
- Click on any notification to view details

## Security

- API keys are stored in `localStorage`
- All protected routes require authentication
- API key is sent in `x-api-key` header for all authenticated requests
- Automatic logout on 401 unauthorized responses

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Make sure backend is running
2. Update `.env` with correct backend URL
3. Run `npm run dev` to start development
4. Make your changes
5. Test thoroughly
6. Build for production with `npm run build`

## License

MIT
