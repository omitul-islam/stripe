import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config';
import paymentRoutes from './routes/payment.routes';
import transactionRoutes from './routes/transaction.routes';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import pool from './config/database';
import queueService from './services/queue.service';

const app: Application = express();

// Initialize database and queue connections (NOTE: Requires PostgreSQL and RabbitMQ running)
export const initializeConnections = async () => {
  // Try to connect to PostgreSQL
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.warn('⚠️  Database connection failed (optional):', error instanceof Error ? error.message : error);
    console.warn('⚠️  Payment API will work without database. Transactions won\'t be saved.');
  }

  // Try to connect to RabbitMQ
  try {
    await queueService.connect();
    console.log('✅ RabbitMQ connected successfully');
  } catch (error) {
    console.warn('⚠️  RabbitMQ connection failed (optional):', error instanceof Error ? error.message : error);
    console.warn('⚠️  Email notifications will not be sent.');
  }
};

// Security middleware
app.use(helmet());

// CORS configuration - allow both 3000 and 3001 for development
const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173', // Vite default
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || config.nodeEnv === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Webhook route - must be before express.json() to get raw body
app.use('/api/webhooks', express.raw({ type: 'application/json' }), paymentRoutes);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/payments', paymentRoutes);
app.use('/api/transactions', transactionRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
