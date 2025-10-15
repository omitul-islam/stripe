-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  usdc_amount DECIMAL(10, 6) NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255),
  customer_name VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on payment_intent_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_intent_id ON transactions(payment_intent_id);

-- Create index on customer_email for filtering by customer
CREATE INDEX IF NOT EXISTS idx_customer_email ON transactions(customer_email);

-- Create index on status for filtering by status
CREATE INDEX IF NOT EXISTS idx_status ON transactions(status);

-- Create index on created_at for sorting by date
CREATE INDEX IF NOT EXISTS idx_created_at ON transactions(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_transactions_updated_at 
  BEFORE UPDATE ON transactions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
