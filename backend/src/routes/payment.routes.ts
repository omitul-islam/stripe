import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';

const router = Router();

/**
 * Payment Routes
 * Following REST API best practices
 */

// Get Stripe configuration (publishable key)
router.get('/config', paymentController.getConfig);

// Create a new payment intent
router.post('/create-payment-intent', paymentController.createPaymentIntent);

// Get payment intent details
router.get('/:paymentIntentId', paymentController.getPaymentIntent);

// Confirm payment intent
router.post('/:paymentIntentId/confirm', paymentController.confirmPayment);

// Cancel payment intent
router.post('/:paymentIntentId/cancel', paymentController.cancelPaymentIntent);

// Stripe webhook endpoint (mounted separately in app.ts with raw body)
router.post('/stripe', paymentController.handleWebhook);

export default router;
