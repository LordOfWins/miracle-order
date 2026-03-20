# 미라클복지용구 주문서 PWA

장기요양 복지용구 B2B 주문서 앱. 거래처(요양기관)에서 QR코드로 접속하여 제품을 주문하면 관리자와 작성자에게 SMS로 주문 내역이 자동 전송됩니다.

## 기술 스택

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MariaDB + Prisma ORM
- **SMS**: SOLAPI LMS API
- **주소검색**: 카카오 주소 API (다음 우편번호)
- **상태관리**: Zustand
- **폼관리**: React Hook Form
- **PWA**: next-pwa
- **배포**: Docker + Nginx + SSL

## 주요 기능

### 주문서 (거래처용)
- 복지용구 카테고리 선택 (약 18개 대분류)
- 제품 선택 (이미지/모델명/가격 / 복수 선택 가능)
- 수급자 및 기관 정보 입력
- 서류 사진 첨부 (최대 5장 / jpg, jpeg, png / 장당 5MB)
- 주문 완료 시 SMS 자동 발송

### 관리자
- 로그인 (ID/PW)
- 카테고리 관리 (추가/수정/삭제/순서변경)
- 제품 관리 (이미지 업로드/모델명/가격/수정/삭제/순서변경)
- SMS 수신 연락처 설정

### SMS 발송 규칙
- **관리자 수신**: 5항(기관명) → 6항(작성자연락처) → 7항(수급자성함) → 8항(성별) → 9항(연락처) → 10항(주소) → 3항(선택제품) → 4항(요청사항) → 11항(서류 다운로드링크)
- **작성자 수신**: 7항(수급자성함) → 3항(선택제품) → 4항(요청사항) → "주문이 완료 되었습니다."

### PWA
- QR코드 접근
- 홈화면 추가 시 네이티브 앱처럼 동작
- Android / iOS / PC 반응형 대응

## UX 설계 기준

- **타겟 사용자**: 50~60대
- 본문 폰트: 최소 18px (권장 20px)
- 버튼 높이: 최소 52px
- 색상 대비: WCAG AA 이상 (4.5:1)
- 모바일 퍼스트 반응형

## 프로젝트 구조

```
miracle-order/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   ├── manifest.json
│   ├── icons/
│   └── uploads/          # 임시 이미지 저장
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx      # 주문서 메인
│   │   ├── admin/
│   │   │   ├── login/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   └── products/page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   └── login/route.ts
│   │       ├── categories/
│   │       │   └── route.ts
│   │       ├── products/
│   │       │   └── route.ts
│   │       ├── upload/
│   │       │   └── route.ts
│   │       ├── order/
│   │       │   └── route.ts
│   │       └── settings/
│   │           └── route.ts
│   ├── components/
│   │   ├── order/
│   │   │   ├── CategorySelector.tsx   # 1항
│   │   │   ├── ProductList.tsx        # 2항
│   │   │   ├── SelectedProducts.tsx   # 3항
│   │   │   ├── DetailRequest.tsx      # 4항
│   │   │   ├── BasicInfoForm.tsx      # 5~8항
│   │   │   ├── ContactForm.tsx        # 9항
│   │   │   ├── AddressForm.tsx        # 10항
│   │   │   ├── DocumentUpload.tsx     # 11항
│   │   │   └── OrderActions.tsx       # 12항
│   │   └── admin/
│   │       ├── CategoryManager.tsx
│   │       └── ProductManager.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── solapi.ts
│   │   ├── auth.ts
│   │   └── upload.ts
│   ├── store/
│   │   └── orderStore.ts
│   └── types/
│       └── index.ts
├── docker-compose.yml
├── Dockerfile
├── .env
└── README.md
```

## 환경변수

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/miracle_order"

# SOLAPI
SOLAPI_API_KEY="your_api_key"
SOLAPI_API_SECRET="your_api_secret"
SOLAPI_SENDER_PHONE="발신번호"

# Auth
JWT_SECRET="your_jwt_secret"

# App
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
NEXT_PUBLIC_KAKAO_POSTCODE_KEY=""
```

## 설치 및 실행

```bash
# 의존성 설치
npm install

# DB 마이그레이션
npx prisma migrate dev

# 시드 데이터
npx prisma db seed

# 개발 서버
npm run dev

# 빌드
npm run build

# 프로덕션
npm start
```

## Docker 배포

```bash
docker-compose up -d --build
```

## DB 스키마

- **admin**: 관리자 계정
- **category**: 대분류 카테고리 (admin_id로 멀티테넌트 대비)
- **product**: 제품 (category_id, admin_id)
- **admin_setting**: 관리자별 설정 (수신번호, 주문서URL, QR코드)

주문 데이터는 DB에 저장하지 않습니다. SMS 발송 후 이미지는 24시간 뒤 자동 삭제됩니다.

## 구현 단계

| 단계 | 내용 | 예상 소요 |
|------|------|-----------|
| 1 | 프로젝트 셋업 + 환경 구성 | 1.5h |
| 2 | DB 스키마 + Prisma 마이그레이션 | 1h |
| 3 | 관리자 기능 (로그인/카테고리/제품 CRUD) | 5h |
| 4 | 주문서 UI 1~4항 (제품 선택 영역) | 4h |
| 5 | 주문서 UI 5~12항 (정보입력 + 첨부 + 완료) | 4h |
| 6 | SOLAPI SMS 연동 + 이미지 처리 | 4h |
| 7 | 반응형 + PWA + UX 최적화 | 3h |
| 8 | 테스트 + 배포 + 초기 데이터 세팅 | 3h |
| **합계** | | **25.5h** |

## 멀티테넌트 (2단계 예정)

모든 테이블에 admin_id 기반 데이터 격리 설계 완료. 2단계에서 독립 주문서 URL/QR 생성 + 관리자 추가 기능 구현 예정.

## 라이선스

Private - All Rights Reserved
