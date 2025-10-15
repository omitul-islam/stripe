import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.error?.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  customerEmail?: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  usdcAmount: number;
}

export interface StripeConfigResponse {
  publishableKey: string;
}

/**
 * Get Stripe configuration
 */
export const getStripeConfig = async (): Promise<StripeConfigResponse> => {
  const response = await api.get<{ success: boolean; data: StripeConfigResponse }>(
    '/payments/config'
  );
  return response.data.data;
};

/**
 * Create a payment intent
 */
export const createPaymentIntent = async (
  data: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> => {
  const response = await api.post<{
    success: boolean;
    data: CreatePaymentIntentResponse;
  }>('/payments/create-payment-intent', data);
  return response.data.data;
};

/**
 * Get payment intent details
 */
export const getPaymentIntent = async (paymentIntentId: string) => {
  const response = await api.get(`/payments/${paymentIntentId}`);
  return response.data.data;
};

/**
 * Get transactions from Stripe API
 */
export const getTransactions = async (params?: {
  customer_email?: string;
  limit?: number;
}) => {
  const response = await api.get('/transactions/stripe', { params });
  return response.data;
};

export default api;
