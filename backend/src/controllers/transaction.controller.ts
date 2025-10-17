import { Request, Response } from 'express';
import * as transactionService from '../services/transaction.service';
import stripeService from '../services/stripe.service';

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { customer_email, status, page = '1', limit = '50' } = req.query;

    const filters: transactionService.TransactionFilters = {
      customer_email: customer_email as string,
      status: status as string,
      limit: parseInt(limit as string, 10),
      offset: (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10),
    };

    const [transactions, total] = await Promise.all([
      transactionService.getTransactions(filters),
      transactionService.getTransactionCount(filters),
    ]);

    return res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string, 10)),
      },
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
    });
  }
};

export const getTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const transaction = await transactionService.getTransaction(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
    }

    return res.json({
      success: true,
      data: transaction,
    });
  } catch (error: any) {
    console.error('Error fetching transaction:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction',
    });
  }
};

export const getStripeTransactions = async (req: Request, res: Response) => {
  try {
    const { customer_email, status, limit = '50' } = req.query;

    const parsedLimit = Math.min(parseInt(limit as string, 10) || 50, 100);

    console.log('Fetching transactions with filters:', { customer_email, status, limit: parsedLimit });

    // Stripe PaymentIntents list API - no status filter available, we'll filter client-side
    const listParams: any = { 
      limit: parsedLimit,
      expand: ['data.charges'] // Get more payment details
    };

    console.log('Stripe list params:', listParams);

    const paymentIntents = await stripeService.paymentIntents.list(listParams);

    console.log(`Found ${paymentIntents.data.length} payment intents from Stripe`);

    let filteredData = paymentIntents.data;

    // Apply status filter client-side if provided
    if (status && status !== '') {
      const statusToSearch = (status as string).toLowerCase().trim();
      filteredData = filteredData.filter((pi: any) => 
        pi.status.toLowerCase() === statusToSearch
      );
      console.log(`After status filter: ${filteredData.length} transactions`);
    }

    // Apply email filter client-side if provided
    if (customer_email && customer_email !== '') {
      const emailToSearch = (customer_email as string).toLowerCase().trim();
      filteredData = filteredData.filter((pi: any) => {
        const receiptEmail = pi.receipt_email?.toLowerCase();
        const metadataEmail = pi.metadata?.customer_email?.toLowerCase();
        return receiptEmail === emailToSearch || metadataEmail === emailToSearch;
      });
      console.log(`After email filter: ${filteredData.length} transactions`);
    }

    return res.json({
      success: true,
      data: filteredData,
      has_more: paymentIntents.has_more,
    });
  } catch (error: any) {
    console.error('Error fetching Stripe transactions:', error.message, error.stack);
    return res.status(500).json({
      success: false,
      error: `Failed to fetch Stripe transactions: ${error.message}`,
    });
  }
};

export const syncStripeTransactions = async (req: Request, res: Response) => {
  try {
    const { limit = '100' } = req.query;
    const parsedLimit = Math.min(parseInt(limit as string, 10) || 100, 100);

    console.log('Syncing Stripe transactions to database...');

    // Fetch all payment intents from Stripe
    const paymentIntents = await stripeService.paymentIntents.list({
      limit: parsedLimit,
      expand: ['data.charges']
    });

    console.log(`Found ${paymentIntents.data.length} payment intents from Stripe`);

    let synced = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Save each payment intent to database
    for (const pi of paymentIntents.data) {
      try {
        // Check if transaction already exists
        const existing = await transactionService.getTransaction(pi.id);

        const usdcAmount = pi.metadata?.usdc_amount 
          ? parseFloat(pi.metadata.usdc_amount) 
          : pi.amount / 100;

        const transactionData = {
          payment_intent_id: pi.id,
          amount: pi.amount,
          usdc_amount: usdcAmount,
          currency: pi.currency,
          status: pi.status,
          customer_email: pi.receipt_email || pi.metadata?.customer_email,
          customer_name: pi.metadata?.customer_name,
          metadata: pi.metadata,
        };

        if (existing) {
          // Update existing transaction
          await transactionService.updateTransaction(pi.id, {
            status: pi.status,
            customer_email: transactionData.customer_email,
            customer_name: transactionData.customer_name,
            metadata: pi.metadata,
          });
          updated++;
          console.log(`Updated transaction: ${pi.id}`);
        } else {
          // Create new transaction
          await transactionService.createTransaction(transactionData);
          synced++;
          console.log(`Synced new transaction: ${pi.id}`);
        }
      } catch (error: any) {
        console.error(`Error syncing transaction ${pi.id}:`, error.message);
        errors.push(`${pi.id}: ${error.message}`);
        skipped++;
      }
    }

    return res.json({
      success: true,
      message: 'Stripe transactions synced to database',
      data: {
        total: paymentIntents.data.length,
        synced,
        updated,
        skipped,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error: any) {
    console.error('Error syncing Stripe transactions:', error.message, error.stack);
    return res.status(500).json({
      success: false,
      error: `Failed to sync Stripe transactions: ${error.message}`,
    });
  }
};
