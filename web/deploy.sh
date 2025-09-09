#!/bin/bash

# React App Deployment Script for Oracle Cloud
echo "🚀 Starting React app deployment..."

# Install Node.js (if not already installed)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt update
sudo apt install nginx -y

# Create web directory
echo "📁 Setting up web directory..."
sudo mkdir -p /var/www/capstone-web
sudo chown -R $USER:$USER /var/www/capstone-web

# Copy React app files (upload your web folder first)
echo "📁 Copying React app files..."
# Upload your web folder to the server first

# Install dependencies and build
echo "📦 Installing dependencies and building..."
cd /var/www/capstone-web
npm install
cp env.production .env.production
npm run build

# Configure Nginx
echo "⚙️ Configuring Nginx..."
sudo tee /etc/nginx/sites-available/capstone-web << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/capstone-web/build;
    index index.html;

    # Handle React Router
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API proxy to backend
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
}
EOF

# Enable the site
echo "🔗 Enabling Nginx site..."
sudo ln -s /etc/nginx/sites-available/capstone-web /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Start and enable Nginx
echo "🚀 Starting Nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl reload nginx

echo "✅ React app deployment completed!"
echo "🌐 Your app should be accessible at: http://your-domain.com"

