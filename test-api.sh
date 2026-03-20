#!/usr/bin/env bash
# ============================================================
# miracle-order API 전체 테스트 스크립트
# 사용법: bash test-api.sh
# 전제: npm run dev 로 서버가 localhost:3000에 실행 중
# ============================================================
# [수정사항]
# 1. 로그인 경로: /api/auth/login -> /api/admin/login
# 2. Rate limit 대응: 테스트 시작 전 15분 윈도우 고려 안내
# 3. curl에 -w "\n" 추가 (응답 끝에 개행 없으면 파싱 실패 방지)
# ============================================================

set -e

BASE="http://localhost:3001"
COOKIE_FILE="cookies.txt"
PASS=0
FAIL=0
TOTAL=0

# ── 유틸 함수 ──
print_header() {
  echo ""
  echo "============================================"
  echo "  $1"
  echo "============================================"
}

assert_success() {
  local label="$1"
  local response="$2"
  TOTAL=$((TOTAL + 1))

  local ok
  ok=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success',''))" 2>/dev/null || echo "PARSE_ERROR")

  if [ "$ok" = "True" ]; then
    echo "  [PASS] $label"
    PASS=$((PASS + 1))
  else
    echo "  [FAIL] $label"
    echo "    응답: $(echo "$response" | head -c 500)"
    FAIL=$((FAIL + 1))
  fi
}

assert_fail() {
  local label="$1"
  local response="$2"
  TOTAL=$((TOTAL + 1))

  local ok
  ok=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success',''))" 2>/dev/null || echo "PARSE_ERROR")

  if [ "$ok" = "False" ]; then
    echo "  [PASS] $label (예상대로 실패)"
    PASS=$((PASS + 1))
  else
    echo "  [FAIL] $label (실패해야 하는데 성공함)"
    echo "    응답: $(echo "$response" | head -c 500)"
    FAIL=$((FAIL + 1))
  fi
}

assert_file() {
  local label="$1"
  local filepath="$2"
  TOTAL=$((TOTAL + 1))

  if [ -f "$filepath" ] && [ -s "$filepath" ]; then
    local filetype
    filetype=$(file "$filepath" 2>/dev/null || echo "unknown")
    echo "  [PASS] $label -> $filetype"
    PASS=$((PASS + 1))
  else
    echo "  [FAIL] $label (파일 없거나 비어있음)"
    FAIL=$((FAIL + 1))
  fi
}

extract() {
  echo "$1" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    keys = '$2'.strip('.').split('.')
    v = d
    for k in keys:
        if isinstance(v, list):
            v = v[int(k)]
        else:
            v = v[k]
    print(v)
except:
    print('')
" 2>/dev/null
}

# 정리
rm -f "$COOKIE_FILE" qrcode_test.png test_image.jpg

# ── 테스트 이미지 생성 (100x100 빨간 PNG) ──
python3 -c "
import struct, zlib
def create_png():
    sig = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', 100, 100, 8, 2, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff
    ihdr = struct.pack('>I', 13) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
    raw = b''
    for y in range(100):
        raw += b'\x00'
        for x in range(100):
            raw += b'\xff\x00\x00'
    compressed = zlib.compress(raw)
    idat_crc = zlib.crc32(b'IDAT' + compressed) & 0xffffffff
    idat = struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc)
    iend_crc = zlib.crc32(b'IEND') & 0xffffffff
    iend = struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
    return sig + ihdr + idat + iend
with open('test_image.jpg', 'wb') as f:
    f.write(create_png())
print('테스트 이미지 생성 완료 (100x100 red PNG)')
"

# ============================================================
print_header "STEP 0: 비밀번호 해싱 수정 + 로그인"
# ============================================================

echo "  비밀번호를 scrypt 형식으로 재설정합니다..."

SCRYPT_HASH=$(node -e "
const { randomBytes, scryptSync } = require('crypto');
const salt = randomBytes(16).toString('hex');
const hash = scryptSync('miracle1234!', salt, 64).toString('hex');
console.log(salt + ':' + hash);
")

# .env에서 DB 정보 읽기
if [ -f .env ]; then
  export $(grep -E '^(DB_HOST|DB_PORT|DB_USER|DB_PASSWORD|DB_NAME|DATABASE_URL)=' .env | xargs)
fi

DB_HOST_VAL="${DB_HOST:-localhost}"
DB_PORT_VAL="${DB_PORT:-3306}"
DB_USER_VAL="${DB_USER:-miracle}"
DB_PASSWORD_VAL="${DB_PASSWORD:-miracle1234}"
DB_NAME_VAL="${DB_NAME:-miracle_order}"

if [ -n "$DATABASE_URL" ]; then
  DB_USER_VAL=$(echo "$DATABASE_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
  DB_PASSWORD_VAL=$(echo "$DATABASE_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
  DB_HOST_VAL=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p')
  DB_PORT_VAL=$(echo "$DATABASE_URL" | sed -n 's|.*@[^:]*:\([0-9]*\)/.*|\1|p')
  DB_NAME_VAL=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')
fi

echo "  DB 접속: $DB_USER_VAL@$DB_HOST_VAL:$DB_PORT_VAL/$DB_NAME_VAL"

DB_UPDATED=false

if command -v docker &>/dev/null && docker ps --format '{{.Names}}' 2>/dev/null | grep -q mariadb; then
  CONTAINER=$(docker ps --format '{{.Names}}' | grep mariadb | head -1)
  echo "  Docker 컨테이너 감지: $CONTAINER"
  docker exec "$CONTAINER" mariadb -u"$DB_USER_VAL" -p"$DB_PASSWORD_VAL" "$DB_NAME_VAL" \
    -e "UPDATE admin SET password='$SCRYPT_HASH' WHERE login_id='miracle';" 2>/dev/null && DB_UPDATED=true
elif command -v mariadb &>/dev/null; then
  mariadb -h"$DB_HOST_VAL" -P"$DB_PORT_VAL" -u"$DB_USER_VAL" -p"$DB_PASSWORD_VAL" "$DB_NAME_VAL" \
    -e "UPDATE admin SET password='$SCRYPT_HASH' WHERE login_id='miracle';" 2>/dev/null && DB_UPDATED=true
elif command -v mysql &>/dev/null; then
  mysql -h"$DB_HOST_VAL" -P"$DB_PORT_VAL" -u"$DB_USER_VAL" -p"$DB_PASSWORD_VAL" "$DB_NAME_VAL" \
    -e "UPDATE admin SET password='$SCRYPT_HASH' WHERE login_id='miracle';" 2>/dev/null && DB_UPDATED=true
fi

if [ "$DB_UPDATED" = true ]; then
  echo "  비밀번호 업데이트 완료"
else
  echo "  [경고] DB 자동 업데이트 실패"
  echo "  아래 SQL을 직접 실행해주세요:"
  echo "  UPDATE admin SET password='$SCRYPT_HASH' WHERE login_id='miracle';"
  echo ""
  read -p "  SQL 실행 완료 후 Enter를 누르세요..."
fi

# ── T-00: 로그인 ──
print_header "T-00: 로그인"

RESP=$(curl -s -X POST "$BASE/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"loginId":"miracle","password":"miracle1234!"}' \
  -c "$COOKIE_FILE" -w "\n")

assert_success "로그인 POST /api/admin/login" "$RESP"

if ! grep -q "miracle_token" "$COOKIE_FILE" 2>/dev/null; then
  echo "  [치명적] miracle_token 쿠키가 없습니다"
  echo "  응답 전문: $RESP"
  echo ""
  echo "  가능한 원인:"
  echo "  1) Rate limit (15분 내 5회 초과) -> 15분 후 재시도"
  echo "  2) 비밀번호 해시 업데이트 실패 -> 위 SQL을 DB에서 직접 실행"
  echo "  3) 서버 미실행 -> npm run dev 확인"
  echo ""
  echo "결과: PASS=$PASS / FAIL=$FAIL / TOTAL=$TOTAL"
  exit 1
fi

echo "  쿠키 저장 확인됨"

# ============================================================
print_header "T-01: 관리자 설정 조회 (GET /api/admin/settings)"
# ============================================================

RESP=$(curl -s "$BASE/api/admin/settings" -b "$COOKIE_FILE" -w "\n")
assert_success "GET /api/admin/settings" "$RESP"

# adminId 추출 (이후 테스트에서 사용)
ADMIN_ID=$(extract "$RESP" "data.adminId")
if [ -z "$ADMIN_ID" ] || [ "$ADMIN_ID" = "" ] || [ "$ADMIN_ID" = "None" ]; then
  ADMIN_ID=1
fi
echo "  adminId: $ADMIN_ID"

# ============================================================
print_header "T-02: 관리자 설정 수정 — noticeText 포함 (PATCH /api/admin/settings)"
# ============================================================

RESP=$(curl -s -X PATCH "$BASE/api/admin/settings" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d "{
    \"receivePhone\": \"010-1234-5678\",
    \"orderUrl\": \"https://example.com/order?adminId=$ADMIN_ID\",
    \"noticeText\": \"테스트 공지사항입니다\n두번째 줄입니다\"
  }" -w "\n")
assert_success "PATCH /api/admin/settings (noticeText)" "$RESP"

NOTICE=$(extract "$RESP" "data.noticeText")
if [ -n "$NOTICE" ] && [ "$NOTICE" != "None" ]; then
  echo "  noticeText 저장 확인: ${NOTICE:0:40}..."
fi

# ============================================================
print_header "T-03: 공개용 설정 조회 — 비인증 (GET /api/settings)"
# ============================================================

RESP=$(curl -s "$BASE/api/settings?adminId=$ADMIN_ID" -w "\n")
assert_success "GET /api/settings?adminId=$ADMIN_ID (공개)" "$RESP"

NOTICE=$(extract "$RESP" "data.noticeText")
if [ -n "$NOTICE" ] && [ "$NOTICE" != "None" ]; then
  echo "  공개 noticeText 확인됨"
fi

# ============================================================
print_header "T-04: QR코드 생성 (GET /api/admin/settings/qrcode)"
# ============================================================

HTTP_CODE=$(curl -s -o qrcode_test.png -w "%{http_code}" "$BASE/api/admin/settings/qrcode" -b "$COOKIE_FILE")
TOTAL=$((TOTAL + 1))
if [ "$HTTP_CODE" = "200" ]; then
  assert_file "QR코드 PNG 파일" "qrcode_test.png"
  TOTAL=$((TOTAL - 1))
else
  echo "  [FAIL] QR코드 생성 HTTP $HTTP_CODE"
  FAIL=$((FAIL + 1))
fi

# ============================================================
print_header "T-05: 카테고리 생성 (POST /api/admin/categories)"
# ============================================================

RESP=$(curl -s -X POST "$BASE/api/admin/categories" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d '{"name":"API테스트카테고리A"}' -w "\n")
assert_success "POST 카테고리A" "$RESP"

CAT_A_ID=$(extract "$RESP" "data.id")
echo "  카테고리A ID: $CAT_A_ID"

# ============================================================
print_header "T-06: 카테고리 추가 생성 (sortOrder 자동 증가)"
# ============================================================

RESP=$(curl -s -X POST "$BASE/api/admin/categories" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d '{"name":"API테스트카테고리B"}' -w "\n")
assert_success "POST 카테고리B" "$RESP"

CAT_B_ID=$(extract "$RESP" "data.id")
CAT_B_SORT=$(extract "$RESP" "data.sortOrder")
echo "  카테고리B ID: $CAT_B_ID / sortOrder: $CAT_B_SORT"

# ============================================================
print_header "T-07: 카테고리 목록 조회 (GET /api/admin/categories)"
# ============================================================

RESP=$(curl -s "$BASE/api/admin/categories" -b "$COOKIE_FILE" -w "\n")
assert_success "GET /api/admin/categories" "$RESP"

CAT_COUNT=$(echo "$RESP" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('data',[])))" 2>/dev/null || echo "?")
echo "  카테고리 총 개수: $CAT_COUNT (seed 17 + 테스트 2)"

# ============================================================
print_header "T-08: 카테고리 수정 (PATCH /api/admin/categories/$CAT_A_ID)"
# ============================================================

RESP=$(curl -s -X PATCH "$BASE/api/admin/categories/$CAT_A_ID" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d '{"name":"수정된카테고리A"}' -w "\n")
assert_success "PATCH 카테고리A 이름 수정" "$RESP"

UPDATED_NAME=$(extract "$RESP" "data.name")
echo "  수정된 이름: $UPDATED_NAME"

# ============================================================
print_header "T-09: 카테고리 순서 변경 (PATCH /api/admin/categories/reorder)"
# ============================================================

RESP=$(curl -s -X PATCH "$BASE/api/admin/categories/reorder" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d "{\"items\":[{\"id\":$CAT_A_ID,\"sortOrder\":99},{\"id\":$CAT_B_ID,\"sortOrder\":98}]}" -w "\n")
assert_success "PATCH 카테고리 reorder" "$RESP"

# ============================================================
print_header "T-10: 제품 생성 — JSON (POST /api/admin/products)"
# ============================================================

RESP=$(curl -s -X POST "$BASE/api/admin/products" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d "{
    \"categoryId\": $CAT_A_ID,
    \"name\": \"테스트제품-JSON\",
    \"price\": 50000,
    \"description\": \"JSON으로 생성한 제품\",
    \"note\": \"참고사항 테스트\"
  }" -w "\n")
assert_success "POST 제품 (JSON)" "$RESP"

PROD_1_ID=$(extract "$RESP" "data.id")
echo "  제품1 ID: $PROD_1_ID"

# ============================================================
print_header "T-11: 제품 생성 — FormData + 이미지 (POST /api/admin/products)"
# ============================================================

RESP=$(curl -s -X POST "$BASE/api/admin/products" \
  -b "$COOKIE_FILE" \
  -F "categoryId=$CAT_A_ID" \
  -F "name=테스트제품-이미지" \
  -F "price=30000" \
  -F "description=이미지 포함 제품" \
  -F "image=@test_image.jpg;type=image/png" -w "\n")
assert_success "POST 제품 (FormData+이미지)" "$RESP"

PROD_2_ID=$(extract "$RESP" "data.id")
PROD_2_IMG=$(extract "$RESP" "data.imageUrl")
echo "  제품2 ID: $PROD_2_ID / imageUrl: $PROD_2_IMG"

# ============================================================
print_header "T-12: 제품 목록 조회 — 카테고리 필터 (GET /api/admin/products)"
# ============================================================

RESP=$(curl -s "$BASE/api/admin/products?categoryId=$CAT_A_ID" -b "$COOKIE_FILE" -w "\n")
assert_success "GET 제품 목록 (categoryId=$CAT_A_ID)" "$RESP"

PROD_COUNT=$(echo "$RESP" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('data',[])))" 2>/dev/null || echo "?")
echo "  제품 수: $PROD_COUNT"

# ============================================================
print_header "T-13: 제품 수정 — 이미지 교체 (PATCH /api/admin/products/$PROD_2_ID)"
# ============================================================

RESP=$(curl -s -X PATCH "$BASE/api/admin/products/$PROD_2_ID" \
  -b "$COOKIE_FILE" \
  -F "name=수정된이미지제품" \
  -F "price=35000" \
  -F "image=@test_image.jpg;type=image/png" -w "\n")
assert_success "PATCH 제품 이미지 교체" "$RESP"

NEW_IMG=$(extract "$RESP" "data.imageUrl")
echo "  이전: $PROD_2_IMG -> 이후: $NEW_IMG"

# ============================================================
print_header "T-14: 제품 수정 — 이미지 삭제 (PATCH /api/admin/products/$PROD_2_ID)"
# ============================================================

RESP=$(curl -s -X PATCH "$BASE/api/admin/products/$PROD_2_ID" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d '{"removeImage": true}' -w "\n")
assert_success "PATCH 제품 이미지 삭제" "$RESP"

REMOVED_IMG=$(extract "$RESP" "data.imageUrl")
echo "  imageUrl: $REMOVED_IMG (None이면 정상)"

# ============================================================
print_header "T-15: 제품 순서 변경 (PATCH /api/admin/products/reorder)"
# ============================================================

RESP=$(curl -s -X PATCH "$BASE/api/admin/products/reorder" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d "{\"items\":[{\"id\":$PROD_1_ID,\"sortOrder\":1},{\"id\":$PROD_2_ID,\"sortOrder\":0}]}" -w "\n")
assert_success "PATCH 제품 reorder" "$RESP"

# ============================================================
print_header "T-16: 주문 생성 — copayType 있음 (POST /api/order)"
# ============================================================

RESP=$(curl -s -X POST "$BASE/api/order" \
  -H "Content-Type: application/json" \
  -d "{
    \"adminId\": $ADMIN_ID,
    \"productIds\": [$PROD_1_ID],
    \"requestNote\": \"테스트 주문\",
    \"centerName\": \"테스트센터\",
    \"writerPhone\": \"010-0000-0000\",
    \"recipientName\": \"홍길동\",
    \"gender\": \"남\",
    \"copayType\": \"본부유\",
    \"contactPhone1\": \"010-1111-1111\",
    \"roadAddress\": \"서울시 강남구 테스트로 123\",
    \"detailAddress\": \"101호\",
    \"zipCode\": \"06000\",
    \"tempImageIds\": []
  }" -w "\n")
assert_success "POST 주문 (copayType=본부유)" "$RESP"

SMS_STATUS=$(extract "$RESP" "data.smsStatus")
echo "  smsStatus: $SMS_STATUS (SOLAPI 키 없으면 FAILED 정상)"

# ============================================================
print_header "T-17: 주문 생성 — copayType 없음 (POST /api/order)"
# ============================================================

RESP=$(curl -s -X POST "$BASE/api/order" \
  -H "Content-Type: application/json" \
  -d "{
    \"adminId\": $ADMIN_ID,
    \"productIds\": [$PROD_1_ID],
    \"centerName\": \"테스트센터2\",
    \"writerPhone\": \"010-0000-0000\",
    \"recipientName\": \"김철수\",
    \"gender\": \"여\",
    \"contactPhone1\": \"010-2222-2222\",
    \"roadAddress\": \"서울시 서초구 테스트로 456\",
    \"detailAddress\": \"202호\",
    \"zipCode\": \"06500\",
    \"tempImageIds\": []
  }" -w "\n")
assert_success "POST 주문 (copayType 없음)" "$RESP"

# ============================================================
print_header "T-18: 유효성 검증 실패 — 잘못된 copayType"
# ============================================================

RESP=$(curl -s -X POST "$BASE/api/order" \
  -H "Content-Type: application/json" \
  -d "{
    \"adminId\": $ADMIN_ID,
    \"productIds\": [$PROD_1_ID],
    \"centerName\": \"테스트\",
    \"writerPhone\": \"010-0000-0000\",
    \"recipientName\": \"테스트\",
    \"gender\": \"남\",
    \"copayType\": \"잘못된값\",
    \"tempImageIds\": []
  }" -w "\n")
assert_fail "POST 주문 (잘못된 copayType -> 400)" "$RESP"

# ============================================================
print_header "T-19: 비인증 접근 (401 확인)"
# ============================================================

RESP=$(curl -s "$BASE/api/admin/categories" -w "\n")
assert_fail "GET /api/admin/categories (쿠키 없음 -> 401)" "$RESP"

RESP=$(curl -s "$BASE/api/admin/settings" -w "\n")
assert_fail "GET /api/admin/settings (쿠키 없음 -> 401)" "$RESP"

RESP=$(curl -s -X POST "$BASE/api/admin/categories" \
  -H "Content-Type: application/json" \
  -d '{"name":"무단생성"}' -w "\n")
assert_fail "POST /api/admin/categories (쿠키 없음 -> 401)" "$RESP"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/admin/settings/qrcode")
TOTAL=$((TOTAL + 1))
if [ "$HTTP_CODE" = "401" ]; then
  echo "  [PASS] GET /api/admin/settings/qrcode (쿠키 없음 -> 401)"
  PASS=$((PASS + 1))
else
  echo "  [FAIL] GET /api/admin/settings/qrcode -> HTTP $HTTP_CODE (401이어야 함)"
  FAIL=$((FAIL + 1))
fi
# ============================================================
print_header "T-19.5: 테스트 주문 정리 (제품 삭제 전 OrderItem/Order 제거)"
# ============================================================

if [ "$DB_UPDATED" != false ]; then
  # T-16/T-17에서 생성된 주문의 OrderItem이 제품을 참조하므로 먼저 삭제
  SQL="DELETE oi FROM order_item oi INNER JOIN order_sheet o ON oi.order_id = o.id WHERE o.admin_id = $ADMIN_ID AND o.center_name LIKE '테스트센터%'; DELETE FROM order_sheet WHERE admin_id = $ADMIN_ID AND center_name LIKE '테스트센터%';"

  if command -v docker &>/dev/null && docker ps --format '{{.Names}}' 2>/dev/null | grep -q mariadb; then
    CONTAINER=$(docker ps --format '{{.Names}}' | grep mariadb | head -1)
    docker exec "$CONTAINER" mariadb -u"$DB_USER_VAL" -p"$DB_PASSWORD_VAL" "$DB_NAME_VAL" \
      -e "$SQL" 2>/dev/null && echo "  테스트 주문 정리 완료 (Docker)"
  elif command -v mariadb &>/dev/null; then
    mariadb -h"$DB_HOST_VAL" -P"$DB_PORT_VAL" -u"$DB_USER_VAL" -p"$DB_PASSWORD_VAL" "$DB_NAME_VAL" \
      -e "$SQL" 2>/dev/null && echo "  테스트 주문 정리 완료 (mariadb)"
  elif command -v mysql &>/dev/null; then
    mysql -h"$DB_HOST_VAL" -P"$DB_PORT_VAL" -u"$DB_USER_VAL" -p"$DB_PASSWORD_VAL" "$DB_NAME_VAL" \
      -e "$SQL" 2>/dev/null && echo "  테스트 주문 정리 완료 (mysql)"
  fi
fi
# ============================================================
print_header "T-20: 제품 삭제 (DELETE /api/admin/products)"
# ============================================================

RESP=$(curl -s -X DELETE "$BASE/api/admin/products/$PROD_1_ID" -b "$COOKIE_FILE" -w "\n")
assert_success "DELETE 제품 $PROD_1_ID" "$RESP"

RESP=$(curl -s -X DELETE "$BASE/api/admin/products/$PROD_2_ID" -b "$COOKIE_FILE" -w "\n")
assert_success "DELETE 제품 $PROD_2_ID" "$RESP"

# ============================================================
print_header "T-21: 카테고리 삭제 (CASCADE 확인)"
# ============================================================

RESP=$(curl -s -X DELETE "$BASE/api/admin/categories/$CAT_A_ID" -b "$COOKIE_FILE" -w "\n")
assert_success "DELETE 카테고리A ($CAT_A_ID)" "$RESP"

RESP=$(curl -s -X DELETE "$BASE/api/admin/categories/$CAT_B_ID" -b "$COOKIE_FILE" -w "\n")
assert_success "DELETE 카테고리B ($CAT_B_ID)" "$RESP"

# ============================================================
print_header "T-22: noticeText 비우기 (빈 문자열 -> null)"
# ============================================================

RESP=$(curl -s -X PATCH "$BASE/api/admin/settings" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d '{"receivePhone": "010-1234-5678", "noticeText": ""}' -w "\n")
assert_success "PATCH noticeText 비우기" "$RESP"

CLEARED=$(extract "$RESP" "data.noticeText")
TOTAL=$((TOTAL + 1))
if [ "$CLEARED" = "None" ] || [ -z "$CLEARED" ]; then
  echo "  [PASS] noticeText -> null 확인"
  PASS=$((PASS + 1))
else
  echo "  [FAIL] noticeText가 null이 아님: $CLEARED"
  FAIL=$((FAIL + 1))
fi

# ============================================================
# 정리
# ============================================================
rm -f "$COOKIE_FILE" qrcode_test.png test_image.jpg

echo ""
echo "============================================"
echo "  테스트 완료"
echo "============================================"
echo "  PASS: $PASS"
echo "  FAIL: $FAIL"
echo "  TOTAL: $TOTAL"
echo "============================================"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
