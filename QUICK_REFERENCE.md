# ⚡ Quick Reference Guide

## 🚀 Getting Started (30 seconds)

### Backend
```bash
cd backend
npm install
# Add your Stripe keys to .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Add your Stripe publishable key to .env
npm run dev
```

Visit: **http://localhost:3000**

---

## 🔑 Get Stripe Keys

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy **Secret key** (sk_test_...) → `backend/.env`
3. Copy **Publishable key** (pk_test_...) → `frontend/.env`
4. Restart both servers

---

## 🧪 Test Cards

| Purpose | Card Number | Result |
|---------|-------------|--------|
| Success | 4242 4242 4242 4242 | Payment succeeds |
| Decline | 4000 0000 0000 0002 | Payment fails |
| 3D Secure | 4000 0027 6000 3184 | Requires authentication |

**Expiry:** Any future date (12/25)  
**CVC:** Any 3 digits (123)  
**ZIP:** Any 5 digits (12345)

More: https://stripe.com/docs/testing

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments/config` | Get Stripe config |
| POST | `/api/payments/create-payment-intent` | Create payment |
| GET | `/api/payments/:id` | Get payment details |
| POST | `/api/payments/:id/confirm` | Confirm payment |
| POST | `/api/payments/:id/cancel` | Cancel payment |
| POST | `/api/webhooks/stripe` | Webhook handler |

---

## 🛠️ Common Commands

### Backend
```bash
npm run dev      # Start development server
npm run build    # Build TypeScript
npm start        # Start production server
npm run lint     # Run ESLint
```

### Frontend
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 📁 Key Files

### Backend
- `src/app.ts` - Express app setup
- `src/server.ts` - Server entry point
- `src/controllers/payment.controller.ts` - Payment handlers
- `src/services/payment.service.ts` - Payment logic
- `src/routes/payment.routes.ts` - API routes
- `.env` - Environment variables

### Frontend
- `src/App.tsx` - Main app component
- `src/main.tsx` - React entry point
- `src/pages/HomePage.tsx` - Landing page
- `src/pages/CheckoutPage.tsx` - Payment page
- `src/services/api.ts` - API integration
- `.env` - Environment variables

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill the process if needed (replace PID)
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

### Frontend can't connect
1. Check backend is running: http://localhost:5000/health
2. Verify `.env` files have correct values
3. Check browser console (F12) for errors

### Stripe errors
1. Verify API keys are correct
2. Check Stripe Dashboard for errors: https://dashboard.stripe.com/test/logs
3. Ensure you're using test mode keys (sk_test_, pk_test_)

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:5000 |
| API Health | http://localhost:5000/health |
| Stripe Dashboard | https://dashboard.stripe.com |
| Stripe API Keys | https://dashboard.stripe.com/test/apikeys |
| Stripe Payments | https://dashboard.stripe.com/test/payments |
| Stripe Logs | https://dashboard.stripe.com/test/logs |

---

## 📊 Project Structure

```
fastApi_Stripe/
├── backend/           # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── config/
│   └── .env
│
├── frontend/          # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── pages/
│   │   └── services/
│   └── .env
│
├── README.md          # Main documentation
├── SETUP_GUIDE.md     # Step-by-step setup
└── PROJECT_OVERVIEW.md # Architecture details
```

---

## 💻 Development Workflow

1. **Start both servers** (backend + frontend)
2. **Make changes** in your code editor
3. **Auto-reload** - Both servers watch for changes
4. **Test** in browser at localhost:3000
5. **Check logs** in both terminals
6. **Debug** using browser DevTools (F12)

---

## 🐛 Debug Checklist

- [ ] Both servers are running
- [ ] `.env` files are configured
- [ ] Stripe API keys are valid (test mode)
- [ ] Browser console has no errors (F12)
- [ ] Backend logs show no errors
- [ ] Network tab shows successful API calls
- [ ] Stripe Dashboard shows test mode

---

## 📚 Documentation Files

1. **README.md** - Complete project documentation
2. **SETUP_GUIDE.md** - Step-by-step installation
3. **PROJECT_OVERVIEW.md** - Architecture & design decisions
4. **QUICK_REFERENCE.md** - This file!

---

## 🎯 Success Checklist

After setup, you should see:

✅ Backend running on port 5000  
✅ Frontend running on port 3000  
✅ Homepage loads with purchase form  
✅ Can navigate to checkout page  
✅ Stripe payment form displays  
✅ Test payment succeeds  
✅ Success page shows transaction details  
✅ Stripe Dashboard shows payment  

---

## 🆘 Need Help?

### Quick Fixes
1. **Restart both servers** - Solves 80% of issues
2. **Clear browser cache** - F12 → Application → Clear storage
3. **Reinstall dependencies** - `npm install` in both directories
4. **Check .env files** - Ensure all values are set

### Resources
- Stripe Docs: https://stripe.com/docs
- React Docs: https://react.dev
- Express Docs: https://expressjs.com
- TypeScript Docs: https://www.typescriptlang.org

### Logs to Check
1. **Backend terminal** - API errors
2. **Frontend terminal** - Build errors
3. **Browser console** - Runtime errors
4. **Network tab** - API responses
5. **Stripe Dashboard** - Payment errors

---

## 🚀 Production Deployment

### Quick Deploy Checklist
- [ ] Update environment variables for production
- [ ] Use production Stripe keys (sk_live_, pk_live_)
- [ ] Build both projects (`npm run build`)
- [ ] Configure Stripe webhooks with production URL
- [ ] Set up HTTPS
- [ ] Configure CORS for production domain
- [ ] Set NODE_ENV=production

See README.md for detailed deployment instructions.

---

**You're all set! Start coding! 🎉**
