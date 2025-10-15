import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  stripe: {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
  };
  usdc: {
    exchangeRate: number;
    walletAddress: string;
  };
  frontendUrl: string;
  database: {
    url: string;
    ssl: boolean;
  };
  rabbitmq: {
    url: string;
  };
  email: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    from: string;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  usdc: {
    exchangeRate: parseFloat(process.env.USDC_EXCHANGE_RATE || '1.00'),
    walletAddress: process.env.USDC_WALLET_ADDRESS || '',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/stripe_payments',
    ssl: process.env.DATABASE_SSL === 'true',
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost',
  },
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@example.com',
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.warn(`Warning: ${varName} is not set in environment variables`);
  }
});

export default config;
