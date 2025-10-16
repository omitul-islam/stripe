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
