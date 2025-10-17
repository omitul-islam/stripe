# Production Deployment Guide

## Prerequisites

- Ubuntu 20.04+ or similar Linux server
- Domain name pointed to your server
- Root or sudo access

## 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Install PM2 for process management
sudo npm install -g pm2
```

## 2. Setup PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE stripe_payments;
CREATE USER stripe_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE stripe_payments TO stripe_user;
\q
```

## 3. Deploy Application

```bash
# Create application directory
sudo mkdir -p /var/www/stripe
sudo chown $USER:$USER /var/www/stripe

# Clone or copy your application
cd /var/www/stripe
# (upload your code here)

# Install dependencies
cd /var/www/stripe
npm run install:all

# Configure environment
cd backend
cp .env.example .env
nano .env  # Edit with production values

# Build frontend
cd ../frontend
npm run build

# Run database migrations
cd ../backend
psql -U stripe_user -d stripe_payments -f src/database/schema.sql
```

## 4. Configure Nginx

```bash
# Copy nginx configuration
sudo cp /var/www/stripe/deploy/nginx.conf /etc/nginx/sites-available/stripe
sudo ln -s /etc/nginx/sites-available/stripe /etc/nginx/sites-enabled/

# Update server_name in nginx.conf
sudo nano /etc/nginx/sites-available/stripe
# Change 'your-domain.com' to your actual domain

# Update root path to match your deployment
# Change: root /var/www/stripe/frontend/dist;

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## 5. Setup SSL Certificate

```bash
# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## 6. Start Backend with PM2

```bash
cd /var/www/stripe/backend

# Build TypeScript (if not already built)
npm run build

# Start application
pm2 start npm --name "stripe-backend" -- start

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command it outputs

# Monitor processes
pm2 monit
```

## 7. Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 8. Setup Monitoring & Logging

```bash
# View backend logs
pm2 logs stripe-backend

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Setup log rotation
sudo nano /etc/logrotate.d/stripe
```

Add to logrotate config:
```
/var/www/stripe/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

## 9. Stripe Webhook Configuration

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`
4. Copy webhook secret to `.env` as `STRIPE_WEBHOOK_SECRET`
5. Restart backend: `pm2 restart stripe-backend`

## 10. Health Checks

```bash
# Test health endpoint
curl https://your-domain.com/health

# Test API
curl https://your-domain.com/api/payments/config

# Check SSL
curl -I https://your-domain.com
```

## Environment Variables (Production)

Update `backend/.env` with production values:

```bash
NODE_ENV=production
PORT=5000

# Stripe (use live keys for production)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL=postgresql://stripe_user:your_secure_password@localhost:5432/stripe_payments
DATABASE_SSL=false

# Frontend URL
FRONTEND_URL=https://your-domain.com

# RabbitMQ (optional)
RABBITMQ_URL=amqp://localhost

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@your-domain.com
```

## Maintenance Commands

```bash
# Restart backend
pm2 restart stripe-backend

# Reload Nginx
sudo systemctl reload nginx

# View backend logs
pm2 logs stripe-backend --lines 100

# Update application
cd /var/www/stripe
git pull
npm run install:all
cd frontend && npm run build
cd ../backend && npm run build
pm2 restart stripe-backend

# Database backup
pg_dump -U stripe_user stripe_payments > backup_$(date +%Y%m%d).sql

# Restore database
psql -U stripe_user stripe_payments < backup_20250117.sql
```

## Security Checklist

- [ ] Environment variables secured (no .env in git)
- [ ] Database password is strong
- [ ] SSL certificate installed and auto-renewal working
- [ ] Firewall configured (ufw enabled)
- [ ] Regular backups setup (database + files)
- [ ] Stripe webhook secret configured
- [ ] Rate limiting enabled in Nginx
- [ ] Security headers configured in Nginx
- [ ] PM2 running as non-root user
- [ ] PostgreSQL only accessible locally
- [ ] Using Stripe live keys (not test keys)
- [ ] CORS configured for production domain only
- [ ] Server tokens disabled in Nginx
- [ ] Log rotation configured

## Performance Optimization

```bash
# Enable PostgreSQL performance tuning
sudo nano /etc/postgresql/14/main/postgresql.conf

# Recommended settings for 2GB RAM server:
shared_buffers = 512MB
effective_cache_size = 1536MB
maintenance_work_mem = 128MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## Monitoring Setup

```bash
# Install monitoring tools
npm install -g pm2-logrotate

# Configure PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Setup automated backups (cron)
crontab -e

# Add daily backup at 2 AM
0 2 * * * pg_dump -U stripe_user stripe_payments > /var/backups/stripe_$(date +\%Y\%m\%d).sql

# Add weekly cleanup (keep last 30 days)
0 3 * * 0 find /var/backups -name "stripe_*.sql" -mtime +30 -delete
```

## Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs stripe-backend --err

# Check if port 5000 is in use
sudo netstat -tulpn | grep 5000

# Check environment variables
cd /var/www/stripe/backend
cat .env
```

### Nginx errors
```bash
# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t

# Check if port 80/443 is in use
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### Database connection issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U stripe_user -d stripe_payments -h localhost

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### SSL certificate issues
```bash
# Renew certificate manually
sudo certbot renew

# Check certificate expiration
sudo certbot certificates

# Test SSL configuration
curl -vI https://your-domain.com
```

## Rollback Procedure

If deployment fails:

```bash
# Stop PM2 processes
pm2 stop stripe-backend

# Restore previous code
cd /var/www/stripe
git checkout previous-version-tag

# Restore database
psql -U stripe_user stripe_payments < backup_YYYYMMDD.sql

# Reinstall dependencies
npm run install:all
cd frontend && npm run build
cd ../backend && npm run build

# Start services
pm2 start stripe-backend
```

## Support

For issues:
1. Check logs: `pm2 logs stripe-backend`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check database: `psql -U stripe_user stripe_payments`
4. Review environment variables
5. Verify Stripe webhook configuration
