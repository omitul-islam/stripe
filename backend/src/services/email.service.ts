import nodemailer, { Transporter } from 'nodemailer';
import config from '../config';
import { EmailJob } from './queue.service';

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject,
        html,
      });

      console.log('✅ Email sent:', info.messageId);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendInvoiceEmail(job: EmailJob): Promise<void> {
    const { data } = job;
    const html = this.generateInvoiceHTML(data);
    await this.sendEmail(job.to, job.subject, html);
  }

  private generateInvoiceHTML(data: EmailJob['data']): string {
    const formattedDate = new Date(data.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
          }
          .invoice-details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: bold;
            color: #6b7280;
          }
          .value {
            color: #111827;
          }
          .total {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            font-size: 18px;
            font-weight: bold;
          }
          .status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
          }
          .status-succeeded {
            background: #d1fae5;
            color: #065f46;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Payment Invoice</h1>
          <p>Thank you for your purchase!</p>
        </div>
        
        <div class="content">
          <div class="invoice-details">
            <h2>Transaction Details</h2>
            
            <div class="detail-row">
              <span class="label">Transaction ID:</span>
              <span class="value">${data.payment_intent_id}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${formattedDate}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Customer:</span>
              <span class="value">${data.customer_name || data.customer_email || 'N/A'}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">${data.customer_email || 'N/A'}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Status:</span>
              <span class="value">
                <span class="status status-${data.status}">${data.status.toUpperCase()}</span>
              </span>
            </div>
          </div>

          <div class="invoice-details">
            <h2>Payment Summary</h2>
            
            <div class="detail-row">
              <span class="label">Amount Paid:</span>
              <span class="value">$${(data.amount / 100).toFixed(2)} ${data.currency.toUpperCase()}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">USDC Received:</span>
              <span class="value">${data.usdc_amount.toFixed(6)} USDC</span>
            </div>
            
            <div class="total">
              <div class="detail-row">
                <span class="label">Total:</span>
                <span class="value">$${(data.amount / 100).toFixed(2)} ${data.currency.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div style="margin-top: 30px; padding: 20px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
            <p style="margin: 0; color: #1e40af;">
              <strong>💰 Your USDC Purchase</strong><br>
              You have successfully purchased ${data.usdc_amount.toFixed(6)} USDC for $${(data.amount / 100).toFixed(2)} USD.
            </p>
          </div>
        </div>

        <div class="footer">
          <p>If you have any questions about this invoice, please contact our support team.</p>
          <p style="margin-top: 10px;">
            © ${new Date().getFullYear()} Stripe Payment System. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();
