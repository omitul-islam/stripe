import { query } from '../config/database';

export interface Transaction {
  id: number;
  payment_intent_id: string;
  amount: number;
  usdc_amount: number;
  currency: string;
  status: string;
  customer_email?: string;
  customer_name?: string;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTransactionData {
  payment_intent_id: string;
  amount: number;
  usdc_amount: number;
  currency?: string;
  status: string;
  customer_email?: string;
  customer_name?: string;
  metadata?: any;
}

export interface TransactionFilters {
  customer_email?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export const createTransaction = async (data: CreateTransactionData): Promise<Transaction> => {
  const text = `
    INSERT INTO transactions 
    (payment_intent_id, amount, usdc_amount, currency, status, customer_email, customer_name, metadata)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  
  const values = [
    data.payment_intent_id,
    data.amount,
    data.usdc_amount,
    data.currency || 'usd',
    data.status,
    data.customer_email,
    data.customer_name,
    data.metadata ? JSON.stringify(data.metadata) : null,
  ];

  const result = await query(text, values);
  return result.rows[0];
};

export const updateTransaction = async (
  payment_intent_id: string,
  updates: Partial<CreateTransactionData>
): Promise<Transaction | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.status !== undefined) {
    fields.push(`status = $${paramCount++}`);
    values.push(updates.status);
  }

  if (updates.customer_email !== undefined) {
    fields.push(`customer_email = $${paramCount++}`);
    values.push(updates.customer_email);
  }

  if (updates.customer_name !== undefined) {
    fields.push(`customer_name = $${paramCount++}`);
    values.push(updates.customer_name);
  }

  if (updates.metadata !== undefined) {
    fields.push(`metadata = $${paramCount++}`);
    values.push(JSON.stringify(updates.metadata));
  }

  if (fields.length === 0) {
    return null;
  }

  values.push(payment_intent_id);

  const text = `
    UPDATE transactions 
    SET ${fields.join(', ')}
    WHERE payment_intent_id = $${paramCount}
    RETURNING *
  `;

  const result = await query(text, values);
  return result.rows[0] || null;
};

export const getTransaction = async (payment_intent_id: string): Promise<Transaction | null> => {
  const text = 'SELECT * FROM transactions WHERE payment_intent_id = $1';
  const result = await query(text, [payment_intent_id]);
  return result.rows[0] || null;
};

export const getTransactions = async (filters: TransactionFilters = {}): Promise<Transaction[]> => {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (filters.customer_email) {
    conditions.push(`customer_email = $${paramCount++}`);
    values.push(filters.customer_email);
  }

  if (filters.status) {
    conditions.push(`status = $${paramCount++}`);
    values.push(filters.status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;

  const text = `
    SELECT * FROM transactions 
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramCount++} OFFSET $${paramCount++}
  `;

  values.push(limit, offset);

  const result = await query(text, values);
  return result.rows;
};

export const getTransactionCount = async (filters: TransactionFilters = {}): Promise<number> => {
  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (filters.customer_email) {
    conditions.push(`customer_email = $${paramCount++}`);
    values.push(filters.customer_email);
  }

  if (filters.status) {
    conditions.push(`status = $${paramCount++}`);
    values.push(filters.status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const text = `SELECT COUNT(*) FROM transactions ${whereClause}`;
  const result = await query(text, values);
  return parseInt(result.rows[0].count, 10);
};
