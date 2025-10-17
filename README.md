# 🚀 Stripe Payment System

A modern, production-ready full-stack payment processing system with React frontend, Node.js backend, PostgreSQL database, and Stripe integration.

## ⚡ Quick Start

```bash
# Install all dependencies
npm install

# Start both backend and frontend (recommended)
npm run dev
```

That's it! The app will be running at:
- **Frontend:** http://localhost:5173 (or http://localhost:3000)
- **Backend:** http://localhost:5000
- **API:** http://localhost:5000/api

## 📋 Prerequisites

- **Node.js 18+** and npm
- **PostgreSQL** (optional - for transaction persistence)
- **Stripe Account** - Get your test API keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)

## 🛠️ Technology Stack

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Stripe SDK** - Payment processing
- **PostgreSQL** + **pg** - Database (optional)
- **RabbitMQ** + **amqplib** - Message queue (optional)
- **Nodemailer** - Email notifications (optional)
- **Helmet** - Security headers
- **CORS** - Cross-origin support

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Stripe React** - Official Stripe components
- **TailwindCSS** - Styling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### DevOps
- **Concurrently** - Run multiple processes
- **PM2** - Production process manager
- **Nginx** - Reverse proxy (production)

## 📁 Project Structure

```
stripe/
├── backend/                  # Node.js/Express API
│   ├── src/
│   │   ├── config/          # Database & environment config
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic (Stripe, email, queue)
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Error handling, validation
│   │   ├── workers/         # Background email worker
│   │   └── database/        # SQL schema
│   └── .env                 # Backend environment variables
│
├── frontend/                 # React application
│   ├── src/
│   │   ├── pages/           # HomePage, CheckoutPage, TransactionsPage
│   │   ├── services/        # API client
│   │   └── App.tsx          # Main app component
│   └── .env                 # Frontend environment variables
│
├── scripts/                  # Development scripts
│   ├── start-dev.sh         # Bash startup script
│   └── start-dev.ps1        # PowerShell startup script
│
├── deploy/                   # Production deployment
│   ├── nginx.conf           # Nginx reverse proxy config
│   └── DEPLOYMENT.md        # Deployment guide
│
└── package.json             # Root scripts (npm run dev)
```

## 🔧 Setup

### 1. Install Dependencies

```bash
# Install root dependencies (concurrently)
npm install

# Or install everything at once
npm run install:all
```

### 2. Configure Environment Variables

**Backend** (`backend/.env`):
```env
# Stripe Keys (REQUIRED)
STRIPE_SECRET_KEY=sk_test_51SI51E...your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_51SI51E...your_key_here

# Server Config
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database (Optional - PostgreSQL)
DATABASE_URL=postgresql://postgres:password@localhost:5432/stripe_payments
DATABASE_SSL=false

# Email (Optional - for invoice emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# RabbitMQ (Optional - for email queue)
RABBITMQ_URL=amqp://localhost:5672
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SI51E...your_key_here
```

### 3. Database Setup (Optional)

If using PostgreSQL for transaction persistence:

```bash
# Create database
createdb stripe_payments

# Import schema
psql -d stripe_payments -f backend/src/database/schema.sql
```

For detailed pgAdmin setup, see [PGADMIN_SETUP.md](PGADMIN_SETUP.md)

## 🚀 Development

### Option 1: Single Command (Recommended)

```bash
npm run dev
```

This starts both backend and frontend concurrently using `concurrently`.

### Option 2: Separate Terminals

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

### Option 3: Platform-Specific Scripts

**Windows (PowerShell):**
```powershell
.\scripts\start-dev.ps1
```

**Linux/Mac (Bash):**
```bash
./scripts/start-dev.sh
```

## 🎨 Features

✅ **Secure Stripe Payment Processing** - Payment Intents API  
✅ **Customer Name Collection** - Captured during checkout  
✅ **Transaction History** - View all payments with filters  
✅ **Email Search** - Search transactions by customer email (Enter to search)  
✅ **Stripe Sync** - Sync transactions from Stripe to database  
✅ **Real-time Updates** - Instant payment confirmations  
✅ **Responsive Design** - Works on all devices  
✅ **Type-Safe** - Full TypeScript coverage  
✅ **Production Ready** - Nginx config, PM2 support, SSL/TLS  

## 🔑 API Endpoints

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-payment-intent` | Create new payment |
| POST | `/api/webhooks/stripe` | Stripe webhook handler |

### Transaction Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | Get all transactions (with filters) |
| POST | `/api/transactions/sync` | Sync transactions from Stripe |

### Example Request

```javascript
POST /api/payments/create-payment-intent
Content-Type: application/json

{
  "amount": 100.00,
  "customerEmail": "user@example.com",
  "customerName": "John Doe"
}
```

## 🧪 Testing

Use Stripe test cards:
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0027 6000 3184`

Use any future expiry date, any 3-digit CVC, and any ZIP code.

More test cards: [Stripe Testing Docs](https://stripe.com/docs/testing)

## 📦 Production Deployment

For comprehensive deployment instructions, see [deploy/DEPLOYMENT.md](deploy/DEPLOYMENT.md)

### Quick Production Build

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build
```

### Production Start

```bash
# Backend (with PM2)
cd backend
pm2 start npm --name "stripe-backend" -- start

# Frontend (serve static files with Nginx)
# See deploy/nginx.conf for configuration
```

### Nginx Setup

Copy `deploy/nginx.conf` to `/etc/nginx/sites-available/` and configure SSL with Let's Encrypt. See [deploy/DEPLOYMENT.md](deploy/DEPLOYMENT.md) for details.

## 🐛 Troubleshooting

### Backend won't start
- Check Stripe API keys are set in `backend/.env`
- Ensure port 5000 is not in use
- Verify PostgreSQL is running (if using database)

### Frontend can't connect
- Verify `VITE_API_URL` in `frontend/.env`
- Check backend is running on port 5000
- Review CORS errors in browser console

### Database connection fails
- Check PostgreSQL is running: `pg_isready`
- Verify `DATABASE_URL` credentials
- See [PGADMIN_SETUP.md](PGADMIN_SETUP.md) for troubleshooting

### Payments not working
- Verify Stripe publishable key in frontend `.env`
- Check Stripe secret key in backend `.env`
- Use test cards from Stripe docs
- Check browser console for Stripe errors

## 📚 Additional Documentation

- [PGADMIN_SETUP.md](PGADMIN_SETUP.md) - PostgreSQL & pgAdmin setup guide
- [deploy/DEPLOYMENT.md](deploy/DEPLOYMENT.md) - Production deployment guide
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development workflow details

## 🎯 Roadmap

- [x] Customer name collection
- [x] Transaction sync from Stripe
- [x] Email search with Enter key
- [x] Production Nginx configuration
- [x] Development startup scripts
- [ ] User authentication
- [ ] Invoice PDF generation
- [ ] Subscription payments
- [ ] Multi-currency support
- [ ] Admin dashboard

## 📄 License

MIT License

---

Built with ❤️ using Stripe, React, Node.js, and TypeScript
