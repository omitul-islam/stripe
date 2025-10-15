# Database & RabbitMQ Setup Guide

This guide covers the setup of PostgreSQL database and RabbitMQ for the USDC payment system.

## Table of Contents

1. [PostgreSQL Setup](#postgresql-setup)
2. [RabbitMQ Setup](#rabbitmq-setup)
3. [Environment Configuration](#environment-configuration)
4. [Running the Application](#running-the-application)
5. [Testing](#testing)

---

## PostgreSQL Setup

### Option 1: Local Installation (Windows)

#### 1. Download and Install PostgreSQL

1. Visit [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)
2. Download the installer (version 14 or higher recommended)
3. Run the installer and follow the wizard
4. Set a password for the `postgres` user (remember this!)
5. Default port is `5432` (keep it unless you have conflicts)

#### 2. Create Database

Open **pgAdmin** or use **psql** command line:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE stripe_payments;

# Connect to the database
\c stripe_payments

# Exit
\q
```

#### 3. Run Database Schema

Navigate to the backend directory and run the schema:

```bash
cd backend

# Using psql
psql -U postgres -d stripe_payments -f src/database/schema.sql

# Or using pgAdmin
# 1. Open pgAdmin
# 2. Right-click on stripe_payments database
# 3. Select "Query Tool"
# 4. Open src/database/schema.sql
# 5. Execute the SQL
```

#### 4. Verify Database

```bash
psql -U postgres -d stripe_payments

# Check if tables exist
\dt

# You should see:
# - transactions

# Check table structure
\d transactions
```

### Option 2: Docker (Recommended for Development)

```bash
# Run PostgreSQL in Docker
docker run --name stripe-postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=stripe_payments \
  -p 5432:5432 \
  -d postgres:14

# Run schema
docker exec -i stripe-postgres psql -U postgres -d stripe_payments < backend/src/database/schema.sql
```

### Option 3: Cloud Database (Production)

Popular options:
- **Heroku Postgres**: https://www.heroku.com/postgres
- **ElephantSQL**: https://www.elephantsql.com/
- **Supabase**: https://supabase.com/
- **AWS RDS**: https://aws.amazon.com/rds/postgresql/

---

## RabbitMQ Setup

### Option 1: Local Installation (Windows)

#### 1. Install Erlang (Required)

1. Visit [Erlang Downloads](https://www.erlang.org/downloads)
2. Download Windows installer (OTP 25 or higher)
3. Run installer and follow the wizard

#### 2. Install RabbitMQ

1. Visit [RabbitMQ Downloads](https://www.rabbitmq.com/download.html)
2. Download Windows installer
3. Run installer (it will detect Erlang automatically)
4. RabbitMQ will start as a Windows service

#### 3. Enable Management Plugin

Open Command Prompt as Administrator:

```bash
# Enable management plugin
"C:\Program Files\RabbitMQ Server\rabbitmq_server-3.x.x\sbin\rabbitmq-plugins.exe" enable rabbitmq_management

# Restart RabbitMQ service
net stop RabbitMQ && net start RabbitMQ
```

#### 4. Access Management Console

Open browser: http://localhost:15672
- **Username**: guest
- **Password**: guest

### Option 2: Docker (Recommended)

```bash
# Run RabbitMQ with management console
docker run -d --name stripe-rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management

# Access management console
# http://localhost:15672 (guest/guest)
```

### Option 3: Cloud Service (Production)

Popular options:
- **CloudAMQP**: https://www.cloudamqp.com/ (Free tier available)
- **Amazon MQ**: https://aws.amazon.com/amazon-mq/
- **Azure Service Bus**: https://azure.microsoft.com/en-us/services/service-bus/

---

## Environment Configuration

### 1. Update Backend .env

Edit `backend/.env`:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/stripe_payments
DATABASE_SSL=false

# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost

# Email Configuration (Gmail Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@yourdomain.com
```

### 2. Gmail App Password (for Email)

If using Gmail:

1. Go to Google Account: https://myaccount.google.com/
2. Security → 2-Step Verification (enable if not already)
3. Security → App passwords
4. Generate app password for "Mail"
5. Copy the 16-character password to `SMTP_PASSWORD`

### 3. Database URL Formats

**Local PostgreSQL**:
```
postgresql://postgres:password@localhost:5432/stripe_payments
```

**Docker PostgreSQL**:
```
postgresql://postgres:password@localhost:5432/stripe_payments
```

**Cloud (Example: Heroku)**:
```
postgresql://user:password@host:5432/database?sslmode=require
```

---

## Running the Application

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Start Backend Server

```bash
npm run dev
```

You should see:
```
✅ Database connected successfully
✅ RabbitMQ connected successfully
🚀 Server is running on port 5000
💳 Stripe integration: Active
🗄️  Database: Connected
🐰 RabbitMQ: Connected
```

### 3. Start Email Worker

Open a **new terminal**:

```bash
cd backend
npm run worker
```

You should see:
```
🚀 Starting email worker...
✅ Connected to RabbitMQ
👂 Listening for email jobs...
✅ Email worker started successfully
```

### 4. Start Frontend

Open a **new terminal**:

```bash
cd frontend
npm run dev
```

---

## Testing

### 1. Test Database Connection

```bash
cd backend
npm run dev
```

Check console for:
```
✅ Database connected successfully
```

### 2. Test Transaction Creation

Make a payment through the frontend, then check database:

```bash
psql -U postgres -d stripe_payments

# View transactions
SELECT * FROM transactions;
```

### 3. Test RabbitMQ Email Queue

After successful payment:

1. Check backend console for:
   ```
   📧 Email job sent to queue: customer@example.com
   ```

2. Check worker console for:
   ```
   📧 Processing email job for: customer@example.com
   ✅ Email sent: <message-id>
   ```

3. Check RabbitMQ Management Console:
   - Go to http://localhost:15672
   - Click "Queues" tab
   - You should see `email_queue` with messages processed

### 4. Test Email Delivery

Check the email inbox for the invoice email.

---

## Troubleshooting

### PostgreSQL Issues

**Connection refused**:
```bash
# Check if PostgreSQL is running
# Windows: Check Services (services.msc)
# Look for "postgresql-x64-14" or similar

# Or check with psql
psql -U postgres
```

**Authentication failed**:
- Verify password in `.env` matches PostgreSQL password
- Check `pg_hba.conf` for connection permissions

### RabbitMQ Issues

**Connection refused**:
```bash
# Windows: Check if RabbitMQ service is running
net start RabbitMQ

# Or check services.msc
```

**Management console not accessible**:
```bash
# Enable management plugin
rabbitmq-plugins enable rabbitmq_management

# Restart service
net stop RabbitMQ && net start RabbitMQ
```

### Email Issues

**Email not sending**:
1. Verify SMTP credentials in `.env`
2. For Gmail, use App Password (not regular password)
3. Check worker logs for errors
4. Test SMTP connection:

```bash
# Install telnet if not available
telnet smtp.gmail.com 587
```

**Emails going to spam**:
- Configure SPF/DKIM records (production)
- Use a reputable email service (SendGrid, Mailgun)
- Test with different email providers

---

## Production Considerations

### Database

1. **Enable SSL**: Set `DATABASE_SSL=true` in `.env`
2. **Connection Pooling**: Already configured (max 20 connections)
3. **Backups**: Set up automated backups
4. **Migrations**: Use migration tool like `node-pg-migrate` or `knex`

### RabbitMQ

1. **Authentication**: Set up user credentials (not guest)
2. **Monitoring**: Enable monitoring plugins
3. **Clustering**: Set up cluster for high availability
4. **Disk Space**: Configure disk limits and alarms

### Email

1. **Use Transactional Email Service**: SendGrid, Mailgun, AWS SES
2. **Implement Rate Limiting**: Prevent spam
3. **Email Templates**: Use proper HTML templates
4. **Bounce Handling**: Set up bounce and complaint handling
5. **Unsubscribe**: Add unsubscribe functionality

---

## Next Steps

1. ✅ Set up PostgreSQL database
2. ✅ Run database schema
3. ✅ Install RabbitMQ
4. ✅ Configure email service
5. ✅ Update `.env` file
6. ✅ Test the complete flow
7. 🔄 Deploy to production

For more help, check the main README.md file.
