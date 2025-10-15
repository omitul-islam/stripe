import Stripe from 'stripe';
import config from '../config';

if (!config.stripe.secretKey) {
  throw new Error('Stripe secret key is not configured');
}

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export default stripe;
