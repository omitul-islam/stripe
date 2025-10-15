import amqp from 'amqplib';
import config from '../config';

class QueueService {
  private connection: any = null;
  private channel: any = null;
  private readonly queueName = 'email_queue';

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queueName, { durable: true });
      
      console.log('✅ Connected to RabbitMQ');

      this.connection.on('error', (err: any) => {
        console.error('RabbitMQ connection error:', err);
      });

      this.connection.on('close', () => {
        console.log('RabbitMQ connection closed. Reconnecting...');
        setTimeout(() => this.connect(), 5000);
      });
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  async sendEmailJob(emailData: EmailJob): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const message = JSON.stringify(emailData);
    this.channel.sendToQueue(this.queueName, Buffer.from(message), {
      persistent: true,
    });

    console.log('📧 Email job sent to queue:', emailData.to);
  }

  async consumeEmailJobs(callback: (job: EmailJob) => Promise<void>): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    await this.channel.prefetch(1);
    
    this.channel.consume(
      this.queueName,
      async (msg: any) => {
        if (msg) {
          try {
            const emailJob: EmailJob = JSON.parse(msg.content.toString());
            await callback(emailJob);
            this.channel!.ack(msg);
            console.log('✅ Email job processed successfully');
          } catch (error) {
            console.error('Error processing email job:', error);
            this.channel!.nack(msg, false, false);
          }
        }
      },
      { noAck: false }
    );

    console.log('👂 Listening for email jobs...');
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log('RabbitMQ connection closed');
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
    }
  }
}

export interface EmailJob {
  to: string;
  subject: string;
  type: 'invoice' | 'confirmation' | 'notification';
  data: {
    payment_intent_id: string;
    amount: number;
    usdc_amount: number;
    currency: string;
    status: string;
    customer_name?: string;
    customer_email?: string;
    created_at: string;
  };
}

export default new QueueService();
