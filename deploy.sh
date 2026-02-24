#!/bin/bash
# Lebanese Lessons — DigitalOcean VPS Deploy Script
# Run this ON your VPS after initial setup

set -e

APP_DIR="/var/www/lebanese-lessons"
REPO_URL="YOUR_GIT_REPO_URL_HERE"  # Change this

echo "=== Lebanese Lessons Deploy ==="

# First-time setup (run once)
if [ ! -d "$APP_DIR" ]; then
  echo ">> First-time setup..."
  sudo mkdir -p /var/www
  sudo chown $USER:$USER /var/www
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"

  # Create .env.local from template
  cat > .env.local << 'EOF'
DATABASE_PATH=./lebanese-lessons.db
AUTH_SECRET=CHANGE_ME_TO_RANDOM_STRING
GOOGLE_TTS_API_KEY=YOUR_GOOGLE_TTS_KEY
NEXTAUTH_URL=https://YOUR_DOMAIN_HERE
EOF

  echo ">> Edit .env.local with your actual values!"
  echo ">> Generate AUTH_SECRET with: openssl rand -base64 32"

  npm install
  npm run build

  # Create audio directories
  mkdir -p public/audio/cache public/audio/vocab public/audio/dialogues

  # Start with PM2
  pm2 start ecosystem.config.js
  pm2 save
  pm2 startup

  echo ">> First deploy complete! Edit .env.local then run: pm2 restart lebanese-lessons"
  exit 0
fi

# Subsequent deploys
echo ">> Pulling latest changes..."
cd "$APP_DIR"
git pull origin main

echo ">> Installing dependencies..."
npm install

echo ">> Building..."
npm run build

echo ">> Restarting app..."
pm2 restart lebanese-lessons

echo ">> Deploy complete!"
pm2 status
