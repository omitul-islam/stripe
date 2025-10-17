# pgAdmin Setup Guide

This guide will help you connect to your PostgreSQL database using pgAdmin and view transaction data.

## Prerequisites

1. PostgreSQL installed and running on your Windows machine
2. pgAdmin 4 installed
3. Backend `.env` file configured with correct DATABASE_URL

## Step 1: Verify PostgreSQL is Running

Open PowerShell and run:
```powershell
# Check if PostgreSQL service is running
Get-Service -Name 'postgresql*'

# If not running, start it
Start-Service -Name 'postgresql-x64-<version>'
```

Or open Services.msc and ensure the PostgreSQL service is started.

## Step 2: Create Database and User

The current DATABASE_URL in your `.env` file is:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/stripe_payments
```

This means:
- **Username**: postgres
- **Password**: password (you need to set/know the actual postgres password)
- **Host**: localhost
- **Port**: 5432
- **Database**: stripe_payments

### Option A: Create database using existing postgres superuser

Open Command Prompt or PowerShell and run:
```powershell
# Connect to postgres (you'll be prompted for password)
psql -U postgres

# Once connected, create the database
CREATE DATABASE stripe_payments;

# Exit psql
\q
```

### Option B: Create database using psql command line
```powershell
psql -U postgres -c "CREATE DATABASE stripe_payments;"
```

## Step 3: Load Database Schema

After creating the database, load the schema:
```powershell
# Navigate to your project directory
cd "c:\Users\BS00735\Pictures\Screenshots\Projects\stripe"

# Load the schema
psql -U postgres -d stripe_payments -f backend\src\database\schema.sql
```

This will create the `transactions` table with all necessary indexes and triggers.

## Step 4: Connect with pgAdmin

1. **Open pgAdmin 4**

2. **Create a New Server Connection**:
   - Right-click on "Servers" in the left panel
   - Select "Create" → "Server..."

3. **General Tab**:
   - **Name**: Stripe Payments (or any friendly name)
   - **Server Group**: Servers (default)

4. **Connection Tab**:
   - **Host name/address**: localhost
   - **Port**: 5432
   - **Maintenance database**: postgres
   - **Username**: postgres
   - **Password**: [your postgres password]
   - **Save password**: ✓ (check this to save password)

5. **SSL Tab**:
   - **SSL mode**: Disable (since DATABASE_SSL=false in .env)

6. **Click "Save"**

## Step 5: Browse the Database

After connecting:
1. Expand "Servers" → "Stripe Payments" (or your server name)
2. Expand "Databases" → "stripe_payments"
3. Expand "Schemas" → "public"
4. Expand "Tables" → right-click "transactions" → "View/Edit Data" → "All Rows"

## Step 6: Test the Setup

### Method 1: Using the Application

1. **Start the backend server**:
   ```powershell
   cd backend
   npm run dev
   ```
   Look for: `✅ Database connected successfully`

2. **Start the frontend**:
   ```powershell
   cd frontend
   npm run dev
   ```

3. **Make a test payment**:
   - Go to http://localhost:3000
   - Complete a payment with test card: 4242 4242 4242 4242

4. **Sync to Database**:
   - Go to Transactions page
   - Click "🔄 Sync to Database" button
   - Check pgAdmin to see the synced transactions

### Method 2: Direct SQL Query

In pgAdmin, right-click on "stripe_payments" database and select "Query Tool", then run:

```sql
-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'transactions';

-- Count transactions
SELECT COUNT(*) FROM transactions;

-- View all transactions
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;

-- View transactions by status
SELECT status, COUNT(*) as count 
FROM transactions 
GROUP BY status;
```

## Troubleshooting

### Error: "password authentication failed for user postgres"

**Solution**: Reset the postgres password

1. Find `pg_hba.conf` (typically at: `C:\Program Files\PostgreSQL\<version>\data\pg_hba.conf`)
2. Open as Administrator in Notepad
3. Find lines like:
   ```
   host    all             all             127.0.0.1/32            md5
   ```
4. Change `md5` to `trust` temporarily
5. Restart PostgreSQL service
6. Run: `psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'newpassword';"`
7. Change `trust` back to `md5` in pg_hba.conf
8. Restart PostgreSQL service
9. Update DATABASE_URL in .env with the new password

### Error: "database stripe_payments does not exist"

**Solution**: Create the database
```powershell
psql -U postgres -c "CREATE DATABASE stripe_payments;"
```

### Error: "connection refused" or "could not connect"

**Solutions**:
1. Ensure PostgreSQL service is running (Services.msc)
2. Check if port 5432 is listening:
   ```powershell
   Test-NetConnection -ComputerName localhost -Port 5432
   ```
3. Check firewall settings (allow port 5432)

### Error: "relation transactions does not exist"

**Solution**: Load the schema
```powershell
psql -U postgres -d stripe_payments -f backend\src\database\schema.sql
```

## Syncing Stripe Transactions to Database

The application now has a sync feature that fetches transactions from Stripe API and saves them to your local database:

### Backend Endpoint
```
POST http://localhost:5000/api/transactions/sync?limit=100
```

### Frontend Button
On the Transactions page, click "🔄 Sync to Database" to:
1. Fetch up to 100 recent payment intents from Stripe
2. Save new transactions to the database
3. Update existing transactions if status changed
4. Display sync results

### Manual Sync via API
```powershell
# Using curl
curl -X POST "http://localhost:5000/api/transactions/sync?limit=100"

# Using PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/transactions/sync?limit=100" -Method POST
```

## Viewing Data in pgAdmin

After syncing, you can run queries like:

```sql
-- Recent transactions
SELECT 
  payment_intent_id,
  amount / 100 as amount_usd,
  usdc_amount,
  status,
  customer_email,
  created_at
FROM transactions
ORDER BY created_at DESC
LIMIT 20;

-- Succeeded payments only
SELECT * FROM transactions 
WHERE status = 'succeeded' 
ORDER BY created_at DESC;

-- Total revenue
SELECT 
  COUNT(*) as total_transactions,
  SUM(amount) / 100 as total_usd,
  SUM(usdc_amount) as total_usdc
FROM transactions
WHERE status = 'succeeded';

-- Transactions by customer
SELECT 
  customer_email,
  COUNT(*) as transaction_count,
  SUM(amount) / 100 as total_spent
FROM transactions
WHERE customer_email IS NOT NULL
GROUP BY customer_email
ORDER BY total_spent DESC;
```

## Notes

- The DATABASE_URL in .env must match your actual postgres credentials
- For sandbox/testing, webhooks are optional - use the sync button instead
- The sync feature pulls data from Stripe API, so you need a valid STRIPE_SECRET_KEY
- Transactions are stored with amounts in cents (Stripe format)
- USDC amounts are stored with 6 decimal precision

## Summary

1. ✅ PostgreSQL installed and running
2. ✅ Database `stripe_payments` created
3. ✅ Schema loaded (transactions table exists)
4. ✅ pgAdmin connected to database
5. ✅ Backend can connect to database (check logs for "✅ Database connected successfully")
6. ✅ Sync button in frontend works
7. ✅ View data in pgAdmin Query Tool or Tables view
