# USDC Payment Frontend

React frontend for purchasing USDC via Stripe.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```bash
   copy .env.example .env
   ```

3. Add your Stripe publishable key to `.env`

4. Run development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

See `.env.example` for required configuration.

## Pages

- `/` - Home page with purchase form
- `/checkout` - Stripe checkout page
- `/success` - Payment success confirmation
- `/cancel` - Payment cancellation page
