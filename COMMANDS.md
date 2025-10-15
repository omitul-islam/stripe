# Quick Command Reference

Quick reference for all commands needed to run the USDC Payment System.

## 🚀 Quick Start (3 Terminals Required)

### Terminal 1: Backend Server
```bash
cd backend
npm run dev
```

### Terminal 2: Email Worker
```bash
cd backend
npm run worker
```

### Terminal 3: Frontend
```bash
cd frontend
npm run dev
```

---

## 📦 Installation

### Initial Setup
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Or use the automated script (Windows)
```bash
setup.bat
```

---

## 🗄️ Database Commands

### PostgreSQL (Local)

**Create Database:**
```bash
psql -U postgres
CREATE DATABASE stripe_payments;
\q
```

**Run Schema:**
```bash
psql -U postgres -d stripe_payments -f backend/src/database/schema.sql
```

**Check Tables:**
```bash
psql -U postgres -d stripe_payments
\dt
SELECT * FROM transactions;
\q
```

### PostgreSQL (Docker)

**Run Container:**
```bash
docker run --name stripe-postgres ^
  -e POSTGRES_PASSWORD=your_password ^
  -e POSTGRES_DB=stripe_payments ^
  -p 5432:5432 ^
  -d postgres:14
```

**Run Schema:**
```bash
docker exec -i stripe-postgres psql -U postgres -d stripe_payments < backend/src/database/schema.sql
```

**Access Database:**
```bash
docker exec -it stripe-postgres psql -U postgres -d stripe_payments
```

**Stop/Start:**
```bash
docker stop stripe-postgres
docker start stripe-postgres
```

---

## 🐰 RabbitMQ Commands

### RabbitMQ (Local)

**Start Service:**
```bash
net start RabbitMQ
```

**Stop Service:**
```bash
net stop RabbitMQ
```

**Enable Management:**
```bash
rabbitmq-plugins enable rabbitmq_management
```

**Access Management Console:**
```
http://localhost:15672
Username: guest
Password: guest
```

### RabbitMQ (Docker)

**Run Container:**
```bash
docker run -d --name stripe-rabbitmq ^
  -p 5672:5672 ^
  -p 15672:15672 ^
  rabbitmq:3-management
```

**Stop/Start:**
```bash
docker stop stripe-rabbitmq
docker start stripe-rabbitmq
```

---

## 🔨 Development Commands

### Backend

```bash
cd backend

# Development mode (auto-reload)
npm run dev

# Run email worker
npm run worker

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint
```

### Frontend

```bash
cd frontend

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🧪 Testing Commands

### Test Database Connection
```bash
cd backend
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: 'postgresql://postgres:password@localhost:5432/stripe_payments' }); pool.query('SELECT NOW()').then(() => { console.log('✅ Connected'); process.exit(0); }).catch(err => { console.error('❌ Error:', err); process.exit(1); });"
```

### Test RabbitMQ Connection
```bash
# Access management console
start http://localhost:15672
```

### Test Email Configuration
```bash
cd backend
node -e "const nodemailer = require('nodemailer'); const t = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 587, auth: { user: 'your@email.com', pass: 'your-app-password' } }); t.verify().then(() => console.log('✅ SMTP OK')).catch(e => console.error('❌ SMTP Error:', e));"
```

### Make Test Payment
```bash
# 1. Open frontend: http://localhost:3000
# 2. Enter amount: $10.00
# 3. Enter email: test@example.com
# 4. Use test card: 4242 4242 4242 4242
# 5. Any future expiry, any CVC
```

---

## 📊 Monitoring Commands

### Check Backend Logs
```bash
cd backend
npm run dev
# Watch for:
# ✅ Database connected successfully
# ✅ RabbitMQ connected successfully
# 🚀 Server is running on port 5000
```

### Check Worker Logs
```bash
cd backend
npm run worker
# Watch for:
# ✅ Connected to RabbitMQ
# 👂 Listening for email jobs...
# 📧 Processing email job for: customer@example.com
# ✅ Email sent: <message-id>
```

### Check Database Transactions
```bash
psql -U postgres -d stripe_payments -c "SELECT id, payment_intent_id, amount/100 as amount_usd, usdc_amount, status, customer_email, created_at FROM transactions ORDER BY created_at DESC LIMIT 10;"
```

### Check RabbitMQ Queue Status
```bash
# Open management console
start http://localhost:15672
# Navigate to Queues → email_queue
# Check: Messages, Message rates
```

---

## 🔧 Troubleshooting Commands

### Backend Not Starting

**Check Port 5000:**
```bash
netstat -ano | findstr :5000
```

**Kill Process on Port 5000:**
```bash
# Find PID from above command, then:
taskkill /PID <PID> /F
```

### Database Connection Issues

**Test Connection:**
```bash
psql -U postgres -d stripe_payments -c "SELECT 1;"
```

**Check PostgreSQL Service:**
```bash
# Windows Services
services.msc
# Look for postgresql-x64-14 or similar
```

### RabbitMQ Connection Issues

**Check RabbitMQ Service:**
```bash
net start | findstr RabbitMQ
```

**Restart RabbitMQ:**
```bash
net stop RabbitMQ
net start RabbitMQ
```

### Frontend Not Loading

**Clear Vite Cache:**
```bash
cd frontend
rmdir /s /q node_modules\.vite
npm run dev
```

**Check Backend Running:**
```bash
curl http://localhost:5000/health
```

---

## 🧹 Cleanup Commands

### Stop All Services
```bash
# Stop backend (Ctrl+C in terminal)
# Stop worker (Ctrl+C in terminal)
# Stop frontend (Ctrl+C in terminal)

# Stop Docker containers
docker stop stripe-postgres stripe-rabbitmq

# Stop local services
net stop RabbitMQ
net stop postgresql-x64-14
```

### Remove Docker Containers
```bash
docker rm stripe-postgres stripe-rabbitmq
```

### Clean Install
```bash
# Backend
cd backend
rmdir /s /q node_modules
del package-lock.json
npm install

# Frontend
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
```

---

## 🌐 Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| Backend API | http://localhost:5000 | - |
| Backend Health | http://localhost:5000/health | - |
| RabbitMQ Management | http://localhost:15672 | guest / guest |
| Stripe Dashboard | https://dashboard.stripe.com/test/payments | Your Stripe account |

---

## 📝 API Endpoints Quick Reference

### Payment Endpoints
```
GET    /api/payments/config
POST   /api/payments/create-payment-intent
GET    /api/payments/:paymentIntentId
POST   /api/payments/:paymentIntentId/confirm
POST   /api/payments/:paymentIntentId/cancel
POST   /api/webhooks/stripe
```

### Transaction Endpoints
```
GET    /api/transactions
GET    /api/transactions/:id
GET    /api/transactions/stripe
```

### Test with cURL

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Get Config:**
```bash
curl http://localhost:5000/api/payments/config
```

**Get Transactions:**
```bash
curl http://localhost:5000/api/transactions
```

**Filter Transactions:**
```bash
curl "http://localhost:5000/api/transactions?customer_email=test@example.com&status=succeeded"
```

---

## 🔑 Environment Variables Quick Reference

### Backend (.env)
```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/stripe_payments
RABBITMQ_URL=amqp://localhost
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Frontend (.env)
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
VITE_API_BASE_URL=http://localhost:5000
```

---

## 💡 Useful Tips

### Run Everything in One Command (PowerShell)
```powershell
# Start all services
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run worker"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
```

### Watch Database Changes (Live)
```bash
# In psql
\watch 1
SELECT COUNT(*) as total, status, SUM(amount)/100 as total_usd FROM transactions GROUP BY status;
```

### Monitor RabbitMQ Messages (Live)
```bash
# Every 2 seconds
watch -n 2 'curl -s -u guest:guest http://localhost:15672/api/queues/%2F/email_queue | jq ".messages"'
```

---

## 📚 Documentation Files

| File | Description |
|------|-------------|
| [README.md](README.md) | Main project documentation |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Step-by-step setup instructions |
| [DATABASE_RABBITMQ_SETUP.md](DATABASE_RABBITMQ_SETUP.md) | Database and RabbitMQ setup |
| [NEW_FEATURES.md](NEW_FEATURES.md) | New features documentation |
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | Architecture overview |

---

## 🆘 Quick Help

**Something not working?**

1. Check all 3 terminals are running (backend, worker, frontend)
2. Verify PostgreSQL is running: `psql -U postgres -l`
3. Verify RabbitMQ is running: `http://localhost:15672`
4. Check `.env` files are configured
5. Look for errors in terminal logs
6. Check firewall/antivirus not blocking ports

**Still stuck?**
- Review error messages in terminal
- Check [DATABASE_RABBITMQ_SETUP.md](DATABASE_RABBITMQ_SETUP.md) troubleshooting section
- Verify Stripe test keys are correct
- Try restarting all services
