#!/bin/bash
# scripts/init-letsencrypt.sh
# 첫 배포 시 1회만 실행. Let's Encrypt 인증서 최초 발급.

set -e

DOMAIN="YOUR_DOMAIN.com"
EMAIL="YOUR_EMAIL@example.com"
STAGING=0  # 테스트 시 1로 변경 (rate limit 방지)

echo "=== Let's Encrypt 초기 설정 ==="

# 1) 임시 자체서명 인증서 생성 (nginx 시작용)
echo "[1/4] 임시 인증서 생성"
docker compose run --rm --entrypoint "" certbot sh -c "
  mkdir -p /etc/letsencrypt/live/${DOMAIN}
  openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
    -keyout /etc/letsencrypt/live/${DOMAIN}/privkey.pem \
    -out /etc/letsencrypt/live/${DOMAIN}/fullchain.pem \
    -subj '/CN=localhost'
"

# 2) nginx 시작
echo "[2/4] Nginx 시작"
docker compose up -d nginx

# 3) 임시 인증서 삭제
echo "[3/4] 임시 인증서 삭제"
docker compose run --rm --entrypoint "" certbot sh -c "
  rm -rf /etc/letsencrypt/live/${DOMAIN}
  rm -rf /etc/letsencrypt/archive/${DOMAIN}
  rm -rf /etc/letsencrypt/renewal/${DOMAIN}.conf
"

# 4) 실제 인증서 발급
echo "[4/4] 인증서 발급"
STAGING_ARG=""
if [ $STAGING -eq 1 ]; then
  STAGING_ARG="--staging"
fi

docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email ${EMAIL} \
  --agree-tos \
  --no-eff-email \
  -d ${DOMAIN} \
  ${STAGING_ARG}

# nginx 재시작 (실제 인증서 적용)
echo "=== Nginx 재시작 ==="
docker compose restart nginx

echo "=== 완료! https://${DOMAIN} 접속 확인하세요 ==="
