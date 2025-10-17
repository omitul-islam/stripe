import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller';

const router = Router();

/**
 * GET /api/transactions
 * Get transaction history from database
 * Query params: customer_email, status, page, limit
 */
router.get('/', transactionController.getTransactions);

/**
 * POST /api/transactions/sync
 * Sync Stripe transactions to database
 * Query params: limit (default 100, max 100)
 */
router.post('/sync', transactionController.syncStripeTransactions);

/**
 * GET /api/transactions/stripe
 * Get transaction history from Stripe API
 * Query params: customer_email, limit
 */
router.get('/stripe', transactionController.getStripeTransactions);

/**
 * GET /api/transactions/:id
 * Get single transaction by payment intent ID
 */
router.get('/:id', transactionController.getTransaction);

export default router;
