# 패션 커머스 플랫폼 플랜
> SPAO 스타일의 패션 이커머스 플랫폼 — Medusa.js + Next.js

---

## 0. 프로젝트 방향

| 항목 | 결정 사항 |
|---|---|
| **목적** | 파일럿 / PoC — 빠른 기술 검증, 과도한 기능 제외 |
| **시작 방식** | Medusa 공식 Next.js Starter 기반으로 커스터마이징 |
| **대상** | 국내 전용 — 한국어(KR), 원화(KRW) 단일 구성 |
| **결제** | 토스페이먼츠 — Medusa 커스텀 Payment Provider 직접 구현 필요 |

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 레퍼런스 | spao.com (SPA O 스타일 패션 커머스) |
| 백엔드 | Medusa.js v2 (Node.js 기반 오픈소스 커머스 엔진) |
| 프론트엔드 | Next.js 14+ (App Router) — 공식 스타터 기반 |
| 스타일링 | Tailwind CSS |
| DB | PostgreSQL |
| 결제 | 토스페이먼츠 (커스텀 Medusa Payment Provider) |
| 이미지 CDN | Cloudflare R2 / AWS S3 |
| 배포 | Vercel (프론트) + Railway / Render (백엔드) |

---

## 2. 프로젝트 구조 (Monorepo)

```
커머스 파일럿 사이트/
├── apps/
│   ├── storefront/          # Next.js 프론트엔드
│   └── backend/             # Medusa.js 백엔드
├── packages/
│   └── ui/                  # 공용 UI 컴포넌트 (선택)
├── package.json             # 루트 (pnpm workspaces)
└── plan.md
```

---

## 3. 백엔드 — Medusa.js v2

### 3-1. 기본 설정
- `create-medusa-app` 로 스캐폴딩 (공식 스타터 포함)
- PostgreSQL 연결
- Redis (캐시/세션)
- Admin 대시보드 내장 (`/app` 경로)
- Region 설정: KR, 통화 KRW, 언어 ko

### 3-2. 도메인 모델 (Medusa 기본 제공 + 커스텀)

| 모듈 | 설명 |
|---|---|
| Product | 상품, 옵션(사이즈/색상), 이미지 |
| Category | 카테고리 트리 (남성/여성/아동 등) |
| Collection | 기획전, 시즌 컬렉션 |
| Inventory | 재고 관리 |
| Cart | 장바구니 |
| Order | 주문 처리 |
| Customer | 회원 (소셜 로그인 포함) |
| Discount | 쿠폰, 프로모션 |
| Shipping | 배송 방법 및 요금 |
| Payment | 결제 수단 |

### 3-3. 커스텀 확장 (Medusa Module)
- **토스페이먼츠 Payment Provider** ← PoC 핵심 구현 과제
  - Medusa의 `AbstractPaymentProvider` 상속
  - 토스페이먼츠 SDK(`@tosspayments/payment-sdk`) 연동
  - 결제 요청 → 승인 → 취소 흐름 구현
- 찜하기(Wishlist) 모듈 (2차)
- 상품 리뷰/평점 모듈 (2차)
- 포인트/적립금 모듈 (3차)

> PoC 범위에서는 토스페이먼츠 Payment Provider 구현이 최우선 기술 검증 항목

---

## 4. 프론트엔드 — Next.js

### 4-1. 라우트 구조 (App Router)

```
app/
├── (store)/
│   ├── page.tsx                  # 메인 홈
│   ├── products/
│   │   ├── page.tsx              # 상품 목록
│   │   └── [handle]/
│   │       └── page.tsx          # 상품 상세
│   ├── categories/
│   │   └── [slug]/
│   │       └── page.tsx          # 카테고리별 목록
│   ├── collections/
│   │   └── [handle]/
│   │       └── page.tsx          # 기획전
│   ├── cart/
│   │   └── page.tsx              # 장바구니
│   ├── checkout/
│   │   └── page.tsx              # 결제
│   ├── account/
│   │   ├── page.tsx              # 마이페이지
│   │   ├── orders/               # 주문 내역
│   │   └── wishlist/             # 찜 목록
│   └── search/
│       └── page.tsx              # 검색 결과
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
└── layout.tsx
```

### 4-2. 주요 UI 컴포넌트

| 컴포넌트 | 설명 |
|---|---|
| Header | GNB (카테고리 메뉴, 검색, 장바구니, 로그인) |
| HeroBanner | 메인 풀스크린 배너 슬라이더 |
| ProductCard | 상품 카드 (이미지, 가격, 할인율, 찜) |
| ProductGrid | 상품 그리드 레이아웃 |
| FilterSidebar | 카테고리/사이즈/색상/가격 필터 |
| ProductDetail | 상품 상세 (이미지 갤러리, 옵션 선택, 장바구니 추가) |
| CartDrawer | 사이드 슬라이드 장바구니 |
| CheckoutFlow | 배송정보 → 결제수단 → 주문확인 |
| Footer | 하단 메뉴, SNS 링크 |

### 4-3. 상태 관리
- **서버 상태**: Medusa JS SDK (공식 클라이언트)
- **클라이언트 상태**: Zustand (장바구니, UI 상태)
- **폼**: React Hook Form + Zod

---

## 5. 주요 기능 목록

### 5-1. PoC 핵심 기능 (반드시 동작해야 함)
- [ ] 상품 목록 / 상세 페이지 (스타터 기반)
- [ ] 카테고리 네비게이션
- [ ] 사이즈 / 색상 옵션 선택
- [ ] 장바구니
- [ ] 회원가입 / 로그인
- [ ] **토스페이먼츠 결제 연동 (커스텀 Provider)**
- [ ] 주문 내역 확인

### 5-2. PoC 검증 후 추가 기능
- [ ] 상품 검색
- [ ] 찜하기 (Wishlist)
- [ ] 상품 리뷰 / 별점
- [ ] 쿠폰 / 할인 코드
- [ ] 기획전 / 컬렉션 페이지
- [ ] SNS 소셜 로그인

### 5-3. 추후 고도화 (PoC 범위 외)
- [ ] 포인트 / 적립금
- [ ] 사이즈 추천 (체형 기반)
- [ ] 코디 추천
- [ ] 실시간 재고 알림
- [ ] 앱 (React Native / PWA)

---

## 6. 개발 단계 (Phase)

### Phase 1 — 환경 세팅 (1주)
1. 모노레포 구성 (pnpm workspaces)
2. Medusa.js v2 백엔드 초기 세팅
3. Next.js 14 프론트 초기 세팅
4. PostgreSQL + Redis 연결
5. Medusa Admin 접속 확인

### Phase 2 — 상품/카테고리 (2주)
1. Medusa Admin에서 카테고리, 상품 등록
2. 상품 목록 API 연동 → Next.js 렌더링
3. 상품 상세 페이지 구현
4. 카테고리 필터링 구현

### Phase 3 — 장바구니/결제 (2주) ← PoC 핵심
1. 장바구니 기능 구현
2. 회원 인증 (로그인/회원가입)
3. Checkout Flow 구현
4. **토스페이먼츠 커스텀 Payment Provider 구현**
   - `AbstractPaymentProvider` 상속 클래스 작성
   - 토스페이먼츠 일반결제 API 연동 (결제요청 → 승인)
   - Webhook 처리 (결제 완료 이벤트)
   - 결제 취소 API 연동

### Phase 4 — 마이페이지 / 주문 (1주)
1. 주문 내역 페이지
2. 배송 현황
3. 찜 목록

### Phase 5 — 디자인 완성 + 배포 (1주)
1. UI/UX 디테일 작업
2. 반응형 모바일 최적화
3. SEO (sitemap, metadata)
4. Vercel + Railway 배포

---

## 7. 기술 스택 요약

```
백엔드
- Medusa.js v2
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- TypeScript
- @tosspayments/payment-sdk (커스텀 Provider 구현용)

프론트엔드
- Next.js 14 (App Router) — 공식 스타터 기반
- TypeScript
- Tailwind CSS
- Medusa JS SDK (@medusajs/js-sdk)
- Zustand
- React Hook Form + Zod

국내화 설정
- 통화: KRW (₩)
- 언어: 한국어(ko)
- 지역: KR Region 단일 구성

인프라/배포
- pnpm workspaces (monorepo)
- Vercel (storefront)
- Railway (medusa backend)
- Cloudflare R2 (이미지 저장소)
- 토스페이먼츠 (결제)
```

---

## 8. 토스페이먼츠 연동 핵심 메모

### 결제 흐름
```
1. 프론트: 토스페이먼츠 JS SDK로 결제창 호출
         (카드/계좌이체/간편결제 등)
2. 프론트: 결제 성공 후 orderId, paymentKey, amount 수신
3. 프론트 → Medusa API: 결제 확인 요청
4. Medusa Payment Provider → 토스페이먼츠 서버: 결제 승인 API 호출
5. 토스페이먼츠 Webhook → Medusa: 결제 상태 업데이트
```

### 구현 필요 메서드 (AbstractPaymentProvider)
| 메서드 | 용도 |
|---|---|
| `initiatePayment` | 결제 세션 생성 |
| `authorizePayment` | 결제 승인 요청 |
| `capturePayment` | 결제 캡처 |
| `cancelPayment` | 결제 취소 |
| `refundPayment` | 환불 처리 |
| `retrievePayment` | 결제 상태 조회 |

### 주의사항
- 토스페이먼츠는 Medusa 공식 플러그인 없음 → 직접 구현
- Secret Key는 `.env`로 관리 (`TOSS_SECRET_KEY`)
- 결제 금액은 KRW 정수값 (소수점 없음)

---

## 9. 참고 자료
- [Medusa.js 공식 문서](https://docs.medusajs.com)
- [Medusa Next.js Starter](https://github.com/medusajs/nextjs-starter-medusa)
- [Medusa Payment Provider 가이드](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider)
- [토스페이먼츠 개발자 문서](https://docs.tosspayments.com)
- SPAO 레퍼런스: https://spao.com/

---

> 마지막 수정: 2026-04-06
