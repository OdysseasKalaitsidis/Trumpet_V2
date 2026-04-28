#!/usr/bin/env bash
set -e

# Trumpet Deployment Script
# ─────────────────────────────────────────────────────────

PROJECT_ROOT="/var/www/trumpet"
cd $PROJECT_ROOT

echo "==> [1/4] Pulling latest code..."
git pull

echo "==> [2/4] Installing PHP dependencies..."
cd backend
composer install --no-dev --optimize-autoloader
cd ..

echo "==> [3/4] Building frontend..."
cd Trumpet.Frontend
# Ensure the correct env is used for production
cp .env.production .env
npm install
npm run build
cd ..

echo "==> [4/4] Reloading services..."
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl restart php8.3-fpm

echo "─────────────────────────────────────────────────────────"
echo "Deployment completed successfully."
