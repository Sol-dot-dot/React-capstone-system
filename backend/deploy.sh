#!/bin/bash

# Deployment script for Oracle Cloud Infrastructure
echo "[INFO] Starting deployment process..."

# Update system packages
echo "[INFO] Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
echo "[INFO] Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
echo "[INFO] Installing PM2..."
sudo npm install -g pm2

# Install MySQL client
echo "[INFO] Installing MySQL client..."
sudo apt install mysql-client -y

# Create application directory
echo "[INFO] Setting up application directory..."
sudo mkdir -p /var/www/capstone-backend
sudo chown -R $USER:$USER /var/www/capstone-backend

# Copy application files (you'll need to upload your files here)
echo "[INFO] Copying application files..."
# This assumes you've uploaded your backend files to the server
# You can use SCP, SFTP, or Git to transfer files

# Install dependencies
echo "[INFO] Installing dependencies..."
cd /var/www/capstone-backend
npm install --production

# Set up environment variables
echo "[INFO] Setting up environment variables..."
cp config.env.production config.env

# Create logs directory
echo "[INFO] Creating logs directory..."
mkdir -p logs

# Set up PM2 startup script
echo "[INFO] Setting up PM2 startup..."
pm2 startup
pm2 save

# Start the application
echo "[INFO] Starting application..."
pm2 start ecosystem.config.js --env production

echo "[OK] Deployment completed!"
echo "[INFO] Check status with: pm2 status"
echo "[INFO] View logs with: pm2 logs capstone-backend"

