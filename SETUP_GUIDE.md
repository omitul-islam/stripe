# 🚀 Complete Setup Guide

## Step-by-Step Installation

### Prerequisites Check
✅ Node.js 18+ installed  
✅ npm or yarn package manager  
✅ Stripe account (sign up at https://stripe.com)  
✅ Git (optional)

---

## 1️⃣ Backend Setup (5 minutes)

### Install Dependencies

Open Command Prompt or PowerShell and navigate to the backend directory:

```cmd
cd c:\Users\BS00735\Pictures\Screenshots\Projects\fastApi_Stripe\backend
npm install
```

This will install all required packages:
- express - Web framework
- stripe - Official Stripe SDK
- typescript - Type safety
- And all other dependencies

### Configure Environment

The `.env` file has been created with placeholder Stripe keys. You need to replace them with your real keys:

1. **Get your Stripe API keys:**
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy your **Secret key** (starts with `sk_test_`)
   - Copy your **Publishable key** (starts with `pk_test_`)

2. **Update backend\.env file:**
   ```env
   STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY
   STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY
   ```

### Start the Backend Server

```cmd
npm run dev
```

You should see:
```
🚀 Server is running on port 5000
📦 Environment: development
💳 Stripe integration: Active
🌐 Frontend URL: http://localhost:3000
```

✅ **Backend is ready!** Keep this terminal open.

---

## 2️⃣ Frontend Setup (5 minutes)

### Install Dependencies

Open a **NEW** Command Prompt/PowerShell window and navigate to frontend:

```cmd
cd c:\Users\BS00735\Pictures\Screenshots\Projects\fastApi_Stripe\frontend
npm install
```

This will install:
- react - UI library
- @stripe/react-stripe-js - Stripe React components
- tailwindcss - CSS framework
- And other dependencies

### Configure Environment

Update the `frontend\.env` file with your Stripe publishable key:

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY
```

### Start the Frontend Server

```cmd
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

✅ **Frontend is ready!** Keep this terminal open too.

---

## 3️⃣ Test the Application

### Open Your Browser

Navigate to: **http://localhost:3000**

You should see a beautiful landing page with:
- "Buy USDC with Stripe" hero section
- Purchase amount input form
- Feature highlights

### Make a Test Purchase

1. **Enter Amount:** Try $10.00 or any amount between $0.50 and $999,999.99
2. **Enter Email (optional):** your@email.com
3. **Click "Continue to Payment"**

You'll be redirected to the checkout page with Stripe's payment form.

### Use Stripe Test Cards

**For successful payment:**
- Card number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

**For declined payment:**
- Card number: `4000 0000 0000 0002`
- Same expiry, CVC, ZIP as above

More test cards: https://stripe.com/docs/testing

### Complete the Payment

1. Fill in the test card details
2. Click "Pay $X.XX"
3. You'll be redirected to the success page
4. Check your backend terminal - you should see payment processing logs

---

## 4️⃣ Verify Everything Works

### Backend Health Check

Open a new terminal and run:
```cmd
curl http://localhost:5000/health
```

Should return:
```json
{"status":"ok","timestamp":"2025-10-15T..."}
```

### Frontend-Backend Connection

The frontend automatically connects to the backend API. Check the browser's Developer Tools (F12) → Console for any errors.

---

## 🎯 What You've Built

### Backend Features ✅
- RESTful API with Express.js
- Stripe Payment Intent integration
- Input validation
- Error handling
- Security middleware (Helmet, CORS)
- TypeScript type safety
- Environment configuration

### Frontend Features ✅
- Modern React with TypeScript
- Responsive Tailwind CSS design
- Stripe Elements integration
- Multi-page routing
- Form validation
- Loading states & animations
- Toast notifications
- Success/Cancel pages

### API Endpoints Available:
- `GET /api/payments/config` - Get Stripe config
- `POST /api/payments/create-payment-intent` - Create payment
- `GET /api/payments/:id` - Get payment details
- `POST /api/webhooks/stripe` - Webhook handler

---

## 🔧 Common Issues & Solutions

### Backend won't start

**Problem:** Port 5000 already in use  
**Solution:** 
```cmd
# Change PORT in backend\.env to 5001
PORT=5001
```

**Problem:** Missing dependencies  
**Solution:**
```cmd
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend won't start

**Problem:** Vite errors  
**Solution:**
```cmd
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Problem:** Can't connect to backend  
**Solution:** Verify backend is running on port 5000

### Stripe payments failing

**Problem:** Invalid API keys  
**Solution:** 
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy fresh keys
3. Update both `.env` files
4. Restart both servers

**Problem:** CORS errors  
**Solution:** Verify `FRONTEND_URL=http://localhost:3000` in backend `.env`

---

## 📚 Next Steps

### 1. Explore the Code
- **Backend:** Check `backend/src/controllers/payment.controller.ts` for payment logic
- **Frontend:** Check `frontend/src/pages/CheckoutPage.tsx` for Stripe integration

### 2. Customize the UI
- Edit `frontend/src/index.css` for styling
- Modify `frontend/tailwind.config.js` for colors/themes

### 3. Add Features
- Implement real USDC blockchain transfer
- Add user authentication
- Create transaction history
- Add email notifications

### 4. Production Deployment
See README.md for deployment instructions

---

## 🆘 Getting Help

### Documentation Links
- **Stripe Docs:** https://stripe.com/docs
- **Payment Intents:** https://stripe.com/docs/payments/payment-intents
- **Test Cards:** https://stripe.com/docs/testing
- **React Docs:** https://react.dev
- **Express Docs:** https://expressjs.com

### Stripe Dashboard
- **Payments:** https://dashboard.stripe.com/test/payments
- **Logs:** https://dashboard.stripe.com/test/logs
- **API Keys:** https://dashboard.stripe.com/test/apikeys

### Debug Tips
- Check browser console (F12) for frontend errors
- Check terminal output for backend errors
- Review network tab (F12) for API calls
- Check Stripe Dashboard for payment status

---

## ✨ You're All Set!

Your production-ready Stripe payment system is now running! 

**Both servers should be running:**
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

Go ahead and make some test purchases! 🎉

---

Need help? Review the main README.md or check the inline code comments.
