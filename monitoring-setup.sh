#!/bin/bash

# Monitoring and Maintenance Setup Script
echo "🔍 Setting up monitoring and maintenance..."

# Install monitoring tools
echo "📦 Installing monitoring tools..."
sudo apt install htop iotop nethogs -y

# Set up log rotation
echo "📋 Setting up log rotation..."
sudo tee /etc/logrotate.d/capstone << EOF
/var/www/capstone-backend/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Set up automated backups
echo "💾 Setting up automated backups..."
sudo mkdir -p /opt/backups
sudo tee /opt/backups/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
DB_NAME="capstone_system"

# Database backup
mysqldump -h your-oracle-mysql-endpoint -u your-username -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete

echo "Database backup completed: db_backup_$DATE.sql"
EOF

sudo chmod +x /opt/backups/backup-db.sh

# Add to crontab for daily backups
echo "⏰ Setting up daily backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backups/backup-db.sh") | crontab -

# Set up health check script
echo "🏥 Setting up health check..."
sudo tee /opt/health-check.sh << 'EOF'
#!/bin/bash

# Health check script
API_URL="http://localhost:5000/api/health"
WEB_URL="http://localhost"

# Check backend
if curl -f -s $API_URL > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is down - restarting..."
    pm2 restart capstone-backend
fi

# Check web server
if curl -f -s $WEB_URL > /dev/null; then
    echo "✅ Web server is healthy"
else
    echo "❌ Web server is down - restarting..."
    sudo systemctl restart nginx
fi
EOF

sudo chmod +x /opt/health-check.sh

# Add health check to crontab (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/health-check.sh") | crontab -

echo "✅ Monitoring and maintenance setup completed!"
echo "📊 Check system status with: htop"
echo "📋 View PM2 status with: pm2 status"
echo "🔍 Check logs with: pm2 logs capstone-backend"

