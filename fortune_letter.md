# 🍀 SharedPool 인수인계서 (폐쇄망 개발자용 Fortune Letter)

---

## 1. 프로젝트 개요 및 전체 맥락

SharedPool은 사내 배치 수행환경을 SaaS 형태로 제공하는 플랫폼입니다. Airflow, MLflow, Prometheus, ArgoCD 등 다양한 오픈소스와 연동하여 워크플로우, ML 실험, 리소스 모니터링, 배포를 통합 관리합니다. 본 프로젝트는 외부망에서 개발된 후 폐쇄망(내부망)으로 이전되어 완성될 예정입니다.

- **주요 기능**: 대시보드, Airflow/MLflow 관리, 시스템 모니터링, 파일 브라우저, 인증/권한, 에러 처리, 자동 로그아웃, 관리자 권한 메뉴 등
- **기술 스택**: Next.js 15, React 18, TypeScript, Tailwind CSS, NextAuth.js, Prometheus, Airflow, ArgoCD, MLflow, Kubernetes

---

## 2. 프로젝트 구조 및 주요 파일

- `src/app/` : 주요 페이지, 컴포넌트, 훅, 라이브러리, 인증 API 등
- `src/app/components/` : Navigation, CreateApplicationModal, ErrorBoundary, ErrorMessage 등 UI 컴포넌트
- `src/app/hooks/useAutoLogout.ts` : 60분 비활성 시 자동 로그아웃 구현
- `src/app/lib/` : Prometheus/ArgoCD 유틸, 에러 처리 모듈
- `src/app/api/auth/[...nextauth]/route.ts` : 인증(NextAuth.js) 라우트, GitHub/Keycloak 지원
- `env.sample` : 환경 변수 샘플, 실제 환경에 맞게 `.env.local` 작성 필요
- `HOWTO.md` : 그룹별 UI 제어, SYSTEM_ADMIN 전용 메뉴 구현법 등 실전 가이드

---

## 3. 인증/권한 및 그룹별 UI 제어 (매우 중요)

- **GitHub/Keycloak 지원**: 환경변수(`AUTH_PROVIDER`)로 인증 방식 선택
- **Keycloak 그룹 기반 권한**: SYSTEM_ADMIN 그룹만 접근 가능한 메뉴/버튼 구현 가능
- **실전 적용법**: HOWTO.md 참고, `useSession` 훅으로 세션 정보 접근, `session.isAdmin`/`session.groups`로 조건부 렌더링
- **주석처리된 Keycloak 코드**: `src/app/api/auth/[...nextauth]/route.ts`에서 KeycloakProvider 및 그룹/권한 관련 콜백이 주석처리되어 있음. 폐쇄망 Keycloak 환경에 맞게 주석 해제 및 환경변수 세팅 필요

---

## 4. 환경 변수 및 배포 관련 주의사항

- **env.sample** 참고, 실제 환경에 맞게 `.env.local` 작성
- **GitHub/Keycloak/Prometheus/ArgoCD 등 외부 서비스 URL/토큰 반드시 확인**
- **AUTH_PROVIDER=github 또는 keycloak**
- **Keycloak 사용 시 그룹 정보(JWT) 포함 필수**
- **Docker/Kubernetes 배포 예시 README.md 참고**

---

## 5. 에러 처리 및 예외 상황 안내

- **ErrorBoundary**: 모든 페이지에 적용, 예기치 못한 에러 발생 시 사용자에게 안내 및 새로고침 버튼 제공
- **ErrorMessage**: API/네트워크/권한/타임아웃 등 다양한 에러 유형 구분하여 안내
- **에러 핸들링 유틸**: `src/app/lib/errorHandling.ts` 참고, 커스텀 에러코드/HTTP 상태코드별 메시지 분기
- **API/외부 연동 실패 시**: 더미 데이터/모의 에러 발생 가능 (아래 참고)

---

## 6. 더미/모의 데이터 및 주석처리 코드 (실서비스 적용 시 주의)

- **ArgoCD/Prometheus 등 외부 API 연동**: 현재 `src/app/lib/argocd.tsx`, `metrics.tsx` 등에서 더미 데이터 및 랜덤 에러/타임아웃/권한 에러를 시뮬레이션함
    - 실제 연동 시 더미 데이터/랜덤 에러/지연 코드 제거 및 실 API 연동 필요
    - 예: `fetchArgoCDApplications`, `fetchClusterMetrics`, `fetchServiceMetrics` 등
- **KeycloakProvider/그룹 권한 처리**: `src/app/api/auth/[...nextauth]/route.ts`에서 Keycloak 관련 코드가 주석처리되어 있음. 폐쇄망 Keycloak 환경에 맞게 주석 해제 및 환경변수 세팅 필요
- **Navigation 등 SYSTEM_ADMIN 메뉴**: HOWTO.md 예시 참고, 실제 그룹명/권한 정책에 맞게 수정 필요

---

## 7. 자동 로그아웃 및 세션 관리

- **useAutoLogout 훅**: 60분 비활성 시 자동 로그아웃, 이벤트 리스너/타이머 기반
- **세션 정보**: `useSession` 훅 또는 서버 컴포넌트에서 `getServerSession` 사용

---

## 8. 주요 예외/경고/인수인계 사항

- **외부망→폐쇄망 이전 시**: 모든 외부 API/인증/메트릭 연동 부분 점검 필수
- **환경변수/시크릿**: 반드시 폐쇄망 환경에 맞게 재설정, 샘플/기존 값 사용 금지
- **주석처리/더미코드**: 실서비스 적용 전 반드시 실제 연동 코드로 교체
- **그룹/권한 정책**: Keycloak 그룹명, SYSTEM_ADMIN 정책 등 실제 조직 정책에 맞게 수정
- **에러 처리**: 사용자 경험을 위해 ErrorBoundary/ErrorMessage 활용 권장, 에러 메시지/로깅 정책 점검
- **문서 참고**: HOWTO.md, README.md, env.sample, 각 주요 컴포넌트/유틸 파일 주석

---

## 9. 추가 문의/지원

- **HOWTO.md**: 그룹별 UI 제어, SYSTEM_ADMIN 전용 메뉴 등 실전 예시/코드 참고
- **README.md**: 전체 구조, 환경설정, 배포, 기여 가이드 등
- **문제 발생 시**: [Issues](../../issues) 등록 또는 메인테이너에게 문의

---

> 🍀 **행운을 빕니다! 폐쇄망 환경에서의 성공적인 완성과 안정적인 운영을 기원합니다.**
> 
> - SharedPool 개발팀 드림 