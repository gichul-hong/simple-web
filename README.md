# MeowMeow Dashboard 🐱

**MeowMeow**는 내부망 환경에서의 애플리케이션 배포 관리(ArgoCD)와 시스템 모니터링(Airflow), 그리고 개발자 유틸리티를 제공하는 **고양이 테마**의 통합 대시보드입니다.

## 🚀 주요 기능

### 1. Applications 관리
- 배포된 애플리케이션의 상태(Healthy, Progressing 등) 및 버전 정보 확인
- **서버 사이드 정렬**: 이름, 상태, 프로젝트 등으로 전체 데이터 정렬 지원
- 바로가기 링크 제공: Airflow, Grafana, FileBrowser, GitHub, ArgoCD

### 2. System Monitoring
- 각 애플리케이션별 리소스 사용량 실시간 조회
- **Metrics 시각화**:
  - S3 스토리지 사용량 (Quota 대비)
  - DB 사용량
  - Airflow DAG 실행 현황 (Success/Fail)
  - CPU/Memory 리소스 요청 및 제한(Request/Limit) 시각화

### 3. Developer Utilities (로그인 불필요)
인증 여부와 상관없이 상단 **Utils** 메뉴를 통해 접근 가능합니다.
- **JWT Parser**: JWT 토큰을 붙여넣으면 Header, Payload, Signature를 즉시 디코딩하고 포맷팅하여 보여줍니다.
- **Formatter**: JSON 또는 YAML 텍스트를 붙여넣으면 자동으로 형식을 감지하여 예쁘게 포맷팅(Pretty Print)하고 구문 강조(Highlighting)를 적용합니다.

### 4. 보안 및 인증 (Toggle 지원)
- **Keycloak 연동**: NextAuth.js를 통한 SSO 로그인 지원.
- **RBAC**: `AIP_AIRFLOW_ADMIN` 그룹 권한이 있는 사용자만 접근 허용.
- **Dev Mode**: 환경 변수 설정 한 번으로 인증 기능을 끄고 개발 모드로 전환 가능.

---

## 🛠️ 시작하기

### 1. 필수 조건
- Node.js 18 이상
- npm 또는 yarn

### 2. 설치

```bash
git clone <repository-url>
cd simple-web
npm install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 `.env.sample`의 내용을 복사하여 설정을 입력하세요.

```bash
cp .env.sample .env.local
```

**주요 설정 예시:**
```ini
# 개발 모드 (인증 끄기)
NEXT_PUBLIC_AUTH_ENABLED=false

# 인증 활성화 시
NEXT_PUBLIC_AUTH_ENABLED=true
KEYCLOAK_ID=my-client
KEYCLOAK_ISSUER=https://sso.example.com/...
```

### 4. 실행

```bash
npm run dev
# 브라우저에서 http://localhost:3000 접속
```

---

## 📂 프로젝트 구조

```
/app
├── /api           # BFF (Backend for Frontend) API Routes
│   ├── /applications  # 앱 목록 조회 (Real/Dummy Fallback)
│   ├── /monitoring    # 모니터링 메트릭 조회
│   └── /auth          # NextAuth 핸들러
├── /components    # UI 컴포넌트 (Lists, Cards, Rows, Navbar 등)
├── /utils         # 유틸리티 페이지 (JWT, Formatter)
└── page.tsx       # 메인 대시보드
```

## 🎨 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Style**: Tailwind CSS (Meow Theme)
- **Icons**: Lucide React
- **Auth**: NextAuth.js (Keycloak)