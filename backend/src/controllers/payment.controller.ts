import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import * as paymentService from '../services/payment.service';
import * as transactionService from '../services/transaction.service';
import queueService from '../services/queue.service';
import { AppError } from '../middleware/errorHandler';

/**
 * Get Stripe publishable key
 * GET /api/payments/config
 */
export const getConfig = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const publishableKey = paymentService.getPublishableKey();

    res.status(200).json({
      success: true,
      data: {
        publishableKey,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new payment intent
 * POST /api/payments/create-payment-intent
 */
export const createPaymentIntent = [
  // Validation middleware
  body('amount')
    .isFloat({ min: 0.5, max: 999999.99 })
    .withMessage('Amount must be between $0.50 and $999,999.99'),
  body('currency')
    .optional()
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code'),
  body('customerEmail')
    .optional()
    .isEmail()
    .withMessage('Invalid email address'),

  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(
          `Validation failed: ${errors.array().map((e) => e.msg).join(', ')}`,
          400
        );
      }

      const { amount, currency, customerEmail } = req.body;

      const result = await paymentService.createPaymentIntent({
        amount,
        currency,
        customerEmail,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
];

/**
 * Get payment intent details
 * GET /api/payments/:paymentIntentId
 */
export const getPaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      throw new AppError('Payment Intent ID is required', 400);
    }

    const paymentIntent = await paymentService.getPaymentIntent(paymentIntentId);

    res.status(200).json({
      success: true,
      data: {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        metadata: paymentIntent.metadata,
        created: paymentIntent.created,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm payment intent
 * POST /api/payments/:paymentIntentId/confirm
 */
export const confirmPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      throw new AppError('Payment Intent ID is required', 400);
    }

    const paymentIntent = await paymentService.confirmPayment(paymentIntentId);

    res.status(200).json({
      success: true,
      data: {
        id: paymentIntent.id,
        status: paymentIntent.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel payment intent
 * POST /api/payments/:paymentIntentId/cancel
 */
export const cancelPaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      throw new AppError('Payment Intent ID is required', 400);
    }

    const paymentIntent = await paymentService.cancelPaymentIntent(paymentIntentId);

    res.status(200).json({
      success: true,
      data: {
        id: paymentIntent.id,
        status: paymentIntent.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Webhook handler for Stripe events
 * POST /api/webhooks/stripe
 * https://stripe.com/docs/webhooks
 */
export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      throw new AppError('Missing stripe-signature header', 400);
    }

    // Webhook payload verification is handled in the route
    const event = req.body;

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(`Payment succeeded: ${paymentIntent.id}`);
        
        // Process USDC distribution
        await paymentService.processUSDCDistribution(paymentIntent);

        // Save transaction to database
        const usdcAmount = paymentIntent.metadata?.usdc_amount 
          ? parseFloat(paymentIntent.metadata.usdc_amount) 
          : paymentIntent.amount / 100;

        try {
          await transactionService.createTransaction({
            payment_intent_id: paymentIntent.id,
            amount: paymentIntent.amount,
            usdc_amount: usdcAmount,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
            customer_email: paymentIntent.metadata?.customer_email,
            customer_name: paymentIntent.metadata?.customer_name,
            metadata: paymentIntent.metadata,
          });
          console.log('✅ Transaction saved to database');
        } catch (dbError) {
          console.warn('⚠️  Failed to save transaction to database:', dbError);
        }

        // Send invoice email via RabbitMQ
        try {
          await queueService.sendEmailJob({
            to: paymentIntent.metadata?.customer_email || 'customer@example.com',
            subject: 'Payment Invoice - USDC Purchase',
            type: 'invoice',
            data: {
              payment_intent_id: paymentIntent.id,
              amount: paymentIntent.amount,
              usdc_amount: usdcAmount,
              currency: paymentIntent.currency,
              status: paymentIntent.status,
              customer_email: paymentIntent.metadata?.customer_email,
              customer_name: paymentIntent.metadata?.customer_name,
              created_at: new Date(paymentIntent.created * 1000).toISOString(),
            },
          });
          console.log('✅ Email queued successfully');
        } catch (queueError) {
          console.warn('⚠️  Failed to queue email:', queueError);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log(`Payment failed: ${failedPayment.id}`);

        // Update transaction status if exists
        try {
          await transactionService.updateTransaction(failedPayment.id, {
            status: 'failed',
          });
        } catch (dbError) {
          console.warn('⚠️  Failed to update transaction status:', dbError);
        }
        break;

      case 'payment_intent.canceled':
        const canceledPayment = event.data.object;
        console.log(`Payment canceled: ${canceledPayment.id}`);

        // Update transaction status if exists
        try {
          await transactionService.updateTransaction(canceledPayment.id, {
            status: 'canceled',
          });
        } catch (dbError) {
          console.warn('⚠️  Failed to update transaction status:', dbError);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};
