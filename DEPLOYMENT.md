# Production Deployment Guide

## Quick Start Deployment

### Option 1: Docker Deployment (Recommended)

1. Install Docker and Docker Compose on your server
2. Clone this repository
3. Create `.env` file with production settings
4. Run: `docker-compose up -d`

### Option 2: Manual Deployment

#### Prerequisites
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+
- PostgreSQL 15+
- Python 3.8+
- Nginx (for reverse proxy)

#### Step-by-Step Guide

**1. System Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Python and dependencies
sudo apt install -y python3 python3-pip
sudo pip3 install mediapipe opencv-python-headless numpy pillow
```

**2. Database Setup**
```bash
# Create database user
sudo -u postgres psql
CREATE USER tailoring_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE tailoring_app OWNER tailoring_user;
GRANT ALL PRIVILEGES ON DATABASE tailoring_app TO tailoring_user;
\q
```

**3. Application Setup**
```bash
# Create application directory
sudo mkdir -p /var/www/tailoring-backend
sudo chown $USER:$USER /var/www/tailoring-backend
cd /var/www/tailoring-backend

# Clone repository
git clone <your-repo-url> .

# Install dependencies
npm ci --only=production

# Create environment file
cp .env.example .env
nano .env  # Edit with production values

# Build application
npm run build

# Create uploads directory
mkdir -p uploads
```

**4. Environment Configuration**
```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tailoring_user
DB_PASSWORD=your_secure_password
DB_DATABASE=tailoring_app
CORS_ORIGIN=https://yourdomain.com
```

**5. Process Manager (PM2)**
```bash
# Install PM2
sudo npm install -g pm2

# Start application
pm2 start dist/main.js --name tailoring-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
```

**6. Nginx Reverse Proxy**
```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/tailoring-api
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/tailoring-api /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

**7. SSL Certificate (Let's Encrypt)**
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

**8. Firewall Configuration**
```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

## Monitoring and Maintenance

### PM2 Monitoring
```bash
# View logs
pm2 logs tailoring-api

# Monitor resources
pm2 monit

# Restart application
pm2 restart tailoring-api

# View application status
pm2 status
```

### Database Backups
```bash
# Create backup script
cat > /home/$USER/backup-db.sh << 'SCRIPT'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U tailoring_user tailoring_app > /backups/tailoring_app_$DATE.sql
# Keep only last 30 days
find /backups -name "tailoring_app_*.sql" -mtime +30 -delete
SCRIPT

chmod +x /home/$USER/backup-db.sh

# Schedule daily backups
(crontab -l ; echo "0 2 * * * /home/$USER/backup-db.sh") | crontab -
```

### Log Rotation
```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/tailoring-api
```

Add:
```
/home/$USER/.pm2/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    sharedscripts
}
```

## Security Best Practices

1. **Environment Variables**: Never commit `.env` to version control
2. **Database**: Use strong passwords, limit connections
3. **Firewall**: Only open necessary ports
4. **Updates**: Regularly update system and dependencies
5. **SSL**: Always use HTTPS in production
6. **Rate Limiting**: Add rate limiting middleware
7. **Authentication**: Implement JWT authentication

## Troubleshooting

**Check application status:**
```bash
pm2 status
pm2 logs tailoring-api --lines 100
```

**Check Nginx:**
```bash
sudo systemctl status nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

**Check PostgreSQL:**
```bash
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT version();"
```

**Test API:**
```bash
curl http://localhost:3000/api/v1/health
```

## Scaling

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Multiple app instances with PM2 cluster mode:
  ```bash
  pm2 start dist/main.js -i max --name tailoring-api
  ```

### Database Scaling
- Configure PostgreSQL connection pooling
- Consider read replicas for heavy read workloads
- Use managed database services (AWS RDS, Google Cloud SQL)

## Cloud Deployment

### AWS EC2
1. Launch Ubuntu instance
2. Configure security groups (ports 80, 443, 22)
3. Follow manual deployment steps above
4. Use RDS for managed PostgreSQL

### Google Cloud Platform
```bash
# Deploy to Cloud Run
gcloud run deploy tailoring-api \
  --image gcr.io/PROJECT_ID/tailoring-backend \
  --platform managed \
  --region us-central1
```

### Heroku
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

