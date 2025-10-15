import app, { initializeConnections } from './app';
import config from './config';
import pool from './config/database';
import queueService from './services/queue.service';

const PORT = config.port;

async function startServer() {
  try {
    // Initialize database and queue connections
    await initializeConnections();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📦 Environment: ${config.nodeEnv}`);
      console.log(`💳 Stripe integration: Active`);
      console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
      console.log(`🗄️  Database: Connected`);
      console.log(`🐰 RabbitMQ: Connected`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('Shutdown signal received: closing connections...');
      
      server.close(async () => {
        console.log('HTTP server closed');
        
        try {
          await pool.end();
          console.log('Database connection closed');
          
          await queueService.close();
          console.log('RabbitMQ connection closed');
          
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
