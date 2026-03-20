#!/bin/bash
# scripts/init-ssl.sh
# 최초 SSL 인증서 발급 스크립트

set -e

DOMAIN=${1:?"Usage: ./init-ssl.sh YOUR_DOMAIN.com EMAIL@example.com"}
EMAIL=${2:?"Usage: ./init-ssl.sh YOUR_DOMAIN.com EMAIL@example.com"}

echo "===== 1단계: HTTP 전용 Nginx 시작 ====="

# 임시 nginx conf (HTTP only, certbot 인증용)
mkdir -p nginx/conf.d
cat > nginx/conf.d/default.conf << NGINXEOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'Waiting for SSL setup...';
        add_header Content-Type text/plain;
    }
}
NGINXEOF

# MariaDB + Nginx만 먼저 시작
docker compose up -d mariadb nginx

echo "===== 2단계: SSL 인증서 발급 ====="
sleep 5

docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email ${EMAIL} \
  --agree-tos \
  --no-eff-email \
  -d ${DOMAIN}

echo "===== 3단계: HTTPS Nginx 설정 적용 ====="

# HTTPS 포함 nginx conf 복원
cat > nginx/conf.d/default.conf << NGINXEOF
# HTTP -> HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\\\$host\\\$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name ${DOMAIN};

    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location = /sw.js {
        proxy_pass http://miracle-app:3000;
        proxy_set_header Host \\\$host;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Service-Worker-Allowed "/";
    }

    location /_next/static/ {
        proxy_pass http://miracle-app:3000;
        proxy_set_header Host \\\$host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /icons/ {
        proxy_pass http://miracle-app:3000;
        proxy_set_header Host \\\$host;
        add_header Cache-Control "public, max-age=86400";
    }

    location = /manifest.json {
        proxy_pass http://miracle-app:3000;
        proxy_set_header Host \\\$host;
        add_header Cache-Control "public, max-age=86400";
    }

    location / {
        proxy_pass http://miracle-app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_cache_bypass \\\$http_upgrade;
    }
}
NGINXEOF

echo "===== 4단계: 전체 서비스 재시작 ====="
docker compose up -d --build

echo "===== 완료! https://${DOMAIN} 에서 확인하세요 ====="
