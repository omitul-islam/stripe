import queueService from '../services/queue.service';
import emailService from '../services/email.service';

async function startEmailWorker() {
  console.log('🚀 Starting email worker...');

  try {
    await queueService.connect();

    await queueService.consumeEmailJobs(async (job) => {
      console.log(`📧 Processing email job for: ${job.to}`);
      
      if (job.type === 'invoice') {
        await emailService.sendInvoiceEmail(job);
      } else {
        console.warn(`Unknown email job type: ${job.type}`);
      }
    });

    console.log('✅ Email worker started successfully');
  } catch (error) {
    console.error('Failed to start email worker:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing email worker...');
  await queueService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing email worker...');
  await queueService.close();
  process.exit(0);
});

// Start the worker
startEmailWorker();
