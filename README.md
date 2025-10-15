# VeloxPay - USDC Payment System (Stripe Integration)

A production-ready, full-stack application (VeloxPay) for purchasing USDC (USD Coin) cryptocurrency using Stripe payments. Features include transaction history, PostgreSQL database persistence, and automated email invoicing via RabbitMQ.

## 🚀 Features

- **Secure Stripe Payment Integration** - Official Stripe Payment Intents API
- **Modern React Frontend** - Built with TypeScript, Tailwind CSS, and React Router
- **RESTful API Backend** - Express.js with TypeScript
- **Real-time Payment Processing** - Instant USDC purchases
- **Transaction History** - View all payment transactions with filtering and pagination
- **PostgreSQL Database** - Persistent transaction storage
- **Email Notifications** - Automated invoice emails via RabbitMQ
- **Responsive Design** - Beautiful UI that works on all devices
- **Webhook Support** - Automated payment confirmations and database updates
- **Type-Safe** - Full TypeScript support across the stack

## 📁 Project Structure

```
VeloxPay/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   │   ├── index.ts    # Main config
│   │   │   └── database.ts # Database connection
│   │   ├── controllers/    # Request handlers
│   │   │   ├── payment.controller.ts
│   │   │   └── transaction.controller.ts
│   │   ├── database/       # Database schemas
│   │   │   └── schema.sql  # PostgreSQL schema
│   │   ├── middleware/     # Custom middleware
│   │   ├── routes/         # API routes
│   │   │   ├── payment.routes.ts
│   │   │   └── transaction.routes.ts
│   │   ├── services/       # Business logic
│   │   │   ├── stripe.service.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── transaction.service.ts
│   │   │   ├── queue.service.ts
│   │   │   └── email.service.ts
│   │   ├── workers/        # Background workers
│   │   │   └── email.worker.ts
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   ├── .env                # Environment variables
│   ├── package.json        # Dependencies
│   └── tsconfig.json       # TypeScript configuration
│
└── frontend/               # React frontend
    ├── src/
    │   ├── pages/          # Page components
    │   │   ├── HomePage.tsx
    │   │   ├── CheckoutPage.tsx
    │   │   ├── SuccessPage.tsx
    │   │   ├── CancelPage.tsx
    │   │   └── TransactionsPage.tsx
    │   ├── services/       # API integration
    │   ├── App.tsx         # Main app component
    │   ├── main.tsx        # Entry point
    │   └── index.css       # Global styles
    ├── .env                # Environment variables
    ├── package.json        # Dependencies
    ├── tailwind.config.js  # Tailwind CSS config
    └── vite.config.ts      # Vite configuration
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Stripe SDK** - Payment processing
- **PostgreSQL** - Database
- **pg** - PostgreSQL client
- **RabbitMQ** - Message queue
- **amqplib** - RabbitMQ client
- **Nodemailer** - Email service
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger
- **Stripe SDK** - Payment processing
- **Express Validator** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Stripe React** - Official Stripe components
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Stripe account (get your API keys from https://dashboard.stripe.com/apikeys)
- Git

## 🚦 Getting Started

### 1. Clone the Repository

```bash
   cd c:\Users\BS00735\Pictures\Screenshots\Projects\VeloxPay
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment variables
copy .env.example .env

# Edit .env and add your Stripe keys
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Backend Environment Variables:**
```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
PORT=5000
NODE_ENV=development
USDC_EXCHANGE_RATE=1.00
USDC_WALLET_ADDRESS=your_usdc_wallet_address_here
FRONTEND_URL=http://localhost:3000
```

**Start the backend:**
```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm start
```

The backend will start on http://localhost:5000

### 3. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment variables
copy .env.example .env

# Edit .env and add your Stripe publishable key
# VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Frontend Environment Variables:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

**Start the frontend:**
```bash
# Development mode
npm run dev

# Production build
npm run build
npm run preview
```

The frontend will start on http://localhost:3000

### 4. Configure Stripe Webhooks (Optional for local development)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:5000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret and add it to your `.env` file

## 🔑 API Endpoints

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments/config` | Get Stripe publishable key |
| POST | `/api/payments/create-payment-intent` | Create new payment intent |
| GET | `/api/payments/:paymentIntentId` | Get payment intent details |
| POST | `/api/payments/:paymentIntentId/confirm` | Confirm payment intent |
| POST | `/api/payments/:paymentIntentId/cancel` | Cancel payment intent |
| POST | `/api/webhooks/stripe` | Stripe webhook handler |

### Example API Request

```javascript
// Create Payment Intent
POST /api/payments/create-payment-intent
Content-Type: application/json

{
  "amount": 100.00,
  "currency": "usd",
  "customerEmail": "user@example.com"
}

// Response
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx",
    "amount": 100.00,
    "usdcAmount": 100.00
  }
}
```

## 🎨 Frontend Pages

- **Home Page** (`/`) - Purchase form and feature showcase
- **Checkout Page** (`/checkout`) - Stripe payment form
- **Success Page** (`/success`) - Payment confirmation
- **Cancel Page** (`/cancel`) - Payment cancellation

## 🔒 Security Features

- HTTPS required in production
- Helmet.js security headers
- CORS configuration
- Input validation with express-validator
- Stripe webhook signature verification
- Environment variable protection
- TypeScript type safety

## 🧪 Testing Stripe Payments

Use Stripe test cards:
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **3D Secure:** 4000 0027 6000 3184

Use any future expiry date, any 3-digit CVC, and any postal code.

More test cards: https://stripe.com/docs/testing

## 📦 Production Deployment

### Backend Deployment (Heroku, Railway, etc.)

1. Set environment variables in your hosting platform
2. Build the TypeScript code:
   ```bash
   npm run build
   ```
3. Start the server:
   ```bash
   npm start
   ```

### Frontend Deployment (Vercel, Netlify, etc.)

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder
3. Set environment variables:
   - `VITE_API_URL` - Your backend API URL
   - `VITE_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key

### Important: Update Stripe Webhook URL

In production, update your Stripe webhook endpoint in the Stripe Dashboard to point to your production URL:
```
https://your-backend-url.com/api/webhooks/stripe
```

## 🐛 Troubleshooting

### Backend won't start
- Check that all environment variables are set
- Ensure port 5000 is not in use
- Verify Stripe API keys are correct

### Frontend can't connect to backend
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is running

### Stripe payments failing
- Verify Stripe publishable key in frontend
- Check Stripe secret key in backend
- Use test cards from Stripe documentation
- Check browser console for errors

## 📚 Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Payment Intents API](https://stripe.com/docs/payments/payment-intents)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)

## 📄 License

MIT License - feel free to use this project for your own purposes

## 🤝 Support

For questions or issues:
- Open an issue on GitHub
- Check Stripe documentation
- Review the code comments

## 🎯 Next Steps / Enhancements

- [ ] Add user authentication
- [ ] Implement actual USDC blockchain transfer
- [ ] Add transaction history
- [ ] Support multiple cryptocurrencies
- [ ] Add email notifications
- [ ] Implement rate limiting
- [ ] Add comprehensive testing
- [ ] Set up CI/CD pipeline

---

Built with ❤️ using Stripe, React, and Node.js
