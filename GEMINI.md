# MeowMeow Dashboard Context

## Project Overview
MeowMeow(구 Nexus Ops, ArgoDash)는 ArgoCD 기반의 애플리케이션 배포 관리 및 Airflow 모니터링을 위한, 고양이 테마의 귀여운 Next.js 웹 대시보드입니다. 폐쇄망 환경을 고려하여 설계되었으며, 유틸리티 도구(JWT Parser, Formatter)를 내장하고 있습니다.

## Development Guidelines
**[IMPORTANT]**
- **Documentation Sync**: 프로젝트의 구조, 설정, 주요 코드가 변경될 때마다 반드시 `README.md` 파일을 최신 상태로 갱신해야 합니다.
- **Context Log**: 이 파일(`GEMINI.md`)은 AI 에이전트의 컨텍스트 유지를 위해 중요합니다. 주요 변경 사항이나 아키텍처 결정 사항을 기록해 주세요.

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS (Cat Theme: Orange/Amber)
- **Icons**: Lucide React
- **Auth**: NextAuth.js v4 (Keycloak Provider)
- **State/Data**: React Hooks + Fetch API (BFF Pattern)

## Key Features & Architectures

### 1. Authentication (RBAC & Toggle)
- **Env Toggle**: `NEXT_PUBLIC_AUTH_ENABLED` 변수로 인증 활성화 여부 제어 가능. `false`일 경우 'Dev Mode'로 동작하여 로그인 없이 접근 가능.
- **RBAC**: 인증 활성화 시, Keycloak 로그인 사용자의 `groups` 클레임에 `AIP_AIRFLOW_ADMIN` 그룹이 있어야 로그인 성공. (없을 시 Access Denied)
- **Session**: Access Token은 서버 사이드(API Route)에서만 복호화되어 백엔드 요청 헤더에 사용됨.

### 2. Dashboard Views (Applications & Monitoring)
- **ListView Default**: 그리드 뷰 대신 리스트 뷰를 기본으로 사용.
- **Server-side Sorting**: API 레벨에서 정렬 파라미터(`sortBy`, `sortOrder`)를 처리.
    - 백엔드 데이터와 더미 데이터 모두 공통 정렬/페이징 로직 적용.
    - **Applications**: 이름, 상태, 프로젝트, 생성일 기준 정렬.
    - **Monitoring**: Metrics(S3, DB, DAG Runs) 기준 정렬.
- **External Links**: 각 앱별 ArgoCD, Grafana, FileBrowser, GitHub 링크 제공.

### 3. Utilities (No Auth Required)
인증 여부와 관계없이 항상 접근 가능한 도구 모음 (`/utils`).
- **JWT Parser**: JWT 토큰 디코딩, Header/Payload/Signature 시각화, JSON Pretty Print.
- **Formatter**: JSON/YAML 자동 감지 및 포맷팅, 구문 강조(Syntax Highlighting).

### 4. API Proxy (BFF)
- **Path**: `/api/applications`, `/api/monitoring`
- **Logic**: Next.js 서버가 실제 백엔드 API를 호출.
- **Fallback**: 백엔드 연결 실패 시 자동으로 내장된 Dummy Data를 반환하여 UI 개발/테스트 용이성 확보.

## Directory Structure (Refactored)
- `/app/components/applications`: Application domain components
- `/app/components/monitoring`: Monitoring domain components
- `/app/components/layout`: Layout components (Navbar)
- `/app/components/ui`: Shared UI components (Modal)
- `/app/components/providers`: Context providers

## Environment Variables
`.env.sample` 파일 참조.
- `BACKEND_API_URL`: 백엔드 주소
- `NEXT_PUBLIC_AUTH_ENABLED`: 인증 토글
- `KEYCLOAK_*`: SSO 설정
- `NEXT_PUBLIC_*_BASE_URL`: 외부 링크 베이스 URL
