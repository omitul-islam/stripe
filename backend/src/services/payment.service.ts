import Stripe from 'stripe';
import stripe from './stripe.service';
import config from '../config';
import { AppError } from '../middleware/errorHandler';

export interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  customerEmail?: string;
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  usdcAmount: number;
}

/**
 * Create a Stripe Payment Intent for USDC purchase
 * Following Stripe's official documentation for Payment Intents API
 * https://stripe.com/docs/payments/payment-intents
 */
export const createPaymentIntent = async (
  params: CreatePaymentIntentParams
): Promise<PaymentIntentResult> => {
  const { amount, currency = 'usd', customerEmail } = params;

  // Validate amount
  if (amount < 0.50) {
    throw new AppError('Minimum purchase amount is $0.50', 400);
  }

  if (amount > 999999.99) {
    throw new AppError('Maximum purchase amount is $999,999.99', 400);
  }

  // Calculate USDC amount (1:1 exchange rate with minor adjustments)
  const usdcAmount = amount * config.usdc.exchangeRate;

  // Convert to cents for Stripe (amount in smallest currency unit)
  const amountInCents = Math.round(amount * 100);

  try {
    // Create Payment Intent using Stripe's official API
    const paymentIntent: Stripe.PaymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        usdcAmount: usdcAmount.toString(),
        walletAddress: config.usdc.walletAddress || 'pending',
        purchaseType: 'usdc',
      },
      description: `USDC Purchase - ${usdcAmount.toFixed(2)} USDC`,
      receipt_email: customerEmail,
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      usdcAmount: usdcAmount,
    };
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new AppError(`Stripe Error: ${error.message}`, 400);
    }
    throw new AppError('Failed to create payment intent', 500);
  }
};

/**
 * Retrieve payment intent details
 * https://stripe.com/docs/api/payment_intents/retrieve
 */
export const getPaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new AppError(`Stripe Error: ${error.message}`, 400);
    }
    throw new AppError('Failed to retrieve payment intent', 500);
  }
};

/**
 * Confirm a payment intent (for manual confirmation flow)
 * https://stripe.com/docs/api/payment_intents/confirm
 */
export const confirmPayment = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new AppError(`Stripe Error: ${error.message}`, 400);
    }
    throw new AppError('Failed to confirm payment', 500);
  }
};

/**
 * Cancel a payment intent
 * https://stripe.com/docs/api/payment_intents/cancel
 */
export const cancelPaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new AppError(`Stripe Error: ${error.message}`, 400);
    }
    throw new AppError('Failed to cancel payment intent', 500);
  }
};

/**
 * Get Stripe publishable key for frontend
 */
export const getPublishableKey = (): string => {
  return config.stripe.publishableKey;
};

/**
 * Process USDC distribution after successful payment
 * In a production environment, this would interact with a blockchain service
 */
export const processUSDCDistribution = async (
  paymentIntent: Stripe.PaymentIntent
): Promise<{ success: boolean; transactionHash?: string }> => {
  const usdcAmount = paymentIntent.metadata.usdcAmount;
  const walletAddress = paymentIntent.metadata.walletAddress;

  // Simulate USDC distribution
  // In production, integrate with Web3 provider to send USDC to user's wallet
  console.log(`Processing USDC distribution:`);
  console.log(`- Amount: ${usdcAmount} USDC`);
  console.log(`- Wallet: ${walletAddress}`);
  console.log(`- Payment ID: ${paymentIntent.id}`);

  // This is where you would call your blockchain service
  // Example: await web3Service.transferUSDC(walletAddress, usdcAmount);

  return {
    success: true,
    transactionHash: 'simulated_tx_hash_' + Date.now(),
  };
};
