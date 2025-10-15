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

    const parsedLimit = parseInt(limit as string, 10);

    // If customer_email OR status provided, use Stripe Search API
    if (customer_email || status) {
      const queryParts: string[] = [];
      
      if (status) {
        queryParts.push(`status:'${status}'`);
      }
      
      if (customer_email) {
        queryParts.push(`metadata['customer_email']:'${customer_email}'`);
      }

      const searchQuery = queryParts.join(' AND ');

      const paymentIntents = await stripeService.paymentIntents.search({
        query: searchQuery,
        limit: parsedLimit,
      });

      return res.json({
        success: true,
        data: paymentIntents.data,
        has_more: paymentIntents.has_more,
      });
    } else {
      // List all payment intents (no filters)
      const paymentIntents = await stripeService.paymentIntents.list({
        limit: parsedLimit,
      });

      return res.json({
        success: true,
        data: paymentIntents.data,
        has_more: paymentIntents.has_more,
      });
    }
  } catch (error: any) {
    console.error('Error fetching Stripe transactions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch Stripe transactions',
    });
  }
};
