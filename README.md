# SharedPool - 사내 배치 수행환경 SaaS 플랫폼

SharedPool은 사내 배치 수행환경을 SaaS 형태로 제공하는 플랫폼입니다.  
Airflow, MLflow, Prometheus, ArgoCD 등 다양한 오픈소스와 연동하여 워크플로우, ML 실험, 리소스 모니터링, 배포를 통합 관리합니다.

---

## 주요 기능

- **대시보드**: 실시간 클러스터/서비스 메트릭, 리소스 사용량, 서비스 현황
- **Airflow 관리**: DAG/워크플로우 관리, 실시간 모니터링, ArgoCD 연동 배포
- **MLflow 관리**: 실험/모델 관리, 버전 관리, ArgoCD 연동 배포
- **시스템 모니터링**: Prometheus 기반 리소스/성능 지표, Kubernetes/ArgoCD 상태
- **파일 브라우저**: 파일 탐색 기능 (버튼 제공)
- **인증/권한**: GitHub.com, GitHub Enterprise, Keycloak 지원, 그룹별 UI 제어
- **에러 처리**: ErrorBoundary, ErrorMessage 컴포넌트, API 에러 핸들링
- **자동 로그아웃**: 60분 비활성 시 자동 로그아웃
- **관리자 권한**: SYSTEM_ADMIN 그룹만 접근 가능한 메뉴/버튼 제공

---

## 기술 스택

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **인증**: NextAuth.js (GitHub/Keycloak)
- **모니터링**: Prometheus
- **워크플로우/배포**: Airflow, ArgoCD
- **ML 플랫폼**: MLflow
- **Container**: Kubernetes

---

## 시작하기

### 1. 의존성 설치

```bash
npm install
# 또는
pnpm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 아래와 같이 작성하세요.  
자세한 항목은 `env.sample` 참고.

```env
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# GitHub OAuth (GitHub.com 또는 Enterprise)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
# GITHUB_ENTERPRISE_URL=https://github.company.com

# Keycloak OAuth (선택)
KEYCLOAK_CLIENT_ID=
KEYCLOAK_CLIENT_SECRET=
KEYCLOAK_ISSUER=https://keycloak.company.com/realms/yourrealm
KEYCLOAK_SCOPE=openid profile email groups

# 인증 프로바이더 선택: github 또는 keycloak
AUTH_PROVIDER=github

# Prometheus/ArgoCD 등 외부 서비스 연동 (선택)
PROMETHEUS_URL=http://prometheus:9090
ARGOCD_SERVER_URL=http://argocd-server:8080
```

### 3. GitHub/Keycloak OAuth 앱 등록

- GitHub: OAuth App 생성, 콜백 URL은 `http://localhost:3000/api/auth/callback/github`
- Keycloak: Realm/Client 등록, 콜백 URL은 `http://localhost:3000/api/auth/callback/keycloak`

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # NextAuth.js 인증 라우트
│   ├── airflow/
│   │   └── page.tsx                  # Airflow 관리 페이지
│   ├── mlflow/
│   │   └── page.tsx                  # MLflow 관리 페이지
│   ├── monitoring/
│   │   └── page.tsx                  # 시스템 모니터링 페이지
│   ├── components/
│   │   ├── Navigation.tsx            # 네비게이션
│   │   ├── CreateApplicationModal.tsx# 앱 생성 모달
│   │   ├── ErrorBoundary.tsx         # 에러 바운더리
│   │   └── ErrorMessage.tsx          # 에러 메시지
│   ├── hooks/
│   │   └── useAutoLogout.ts          # 자동 로그아웃 훅
│   ├── lib/
│   │   ├── metrics.tsx               # Prometheus 메트릭 유틸
│   │   ├── argocd.tsx                # ArgoCD 유틸
│   │   └── errorHandling.ts          # API 에러 처리
│   ├── globals.css                   # 전역 스타일
│   ├── layout.tsx                    # 루트 레이아웃
│   └── page.tsx                      # 홈 대시보드
```

---

## 인증/권한 및 그룹별 UI 제어

- GitHub.com, GitHub Enterprise, Keycloak 지원 (ENV로 선택)
- Keycloak 그룹 정보(JWT) 기반으로 SYSTEM_ADMIN만 접근 가능한 메뉴/버튼 구현 가능
- HOWTO: [HOWTO.md](./HOWTO.md) 참고

---

## 에러 처리

- 모든 페이지에 ErrorBoundary 적용
- API 에러는 ErrorMessage 컴포넌트로 사용자에게 안내
- 네트워크/권한/타임아웃 등 다양한 에러 유형 구분

---

## 자동 로그아웃

- 60분 비활성 시 자동 로그아웃 (`useAutoLogout` 훅 사용)

---

## 메트릭/모니터링

- Prometheus에서 클러스터/서비스 메트릭 수집
- Airflow/MLflow/ArgoCD 상태 실시간 표시
- 30초마다 자동 갱신

---

## 배포

### Docker

```bash
docker build -t sharedpool .
docker run -p 3000:3000 sharedpool
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sharedpool
spec:
  replicas: 2
  selector:
    matchLabels:
      app: sharedpool
  template:
    metadata:
      labels:
        app: sharedpool
    spec:
      containers:
      - name: sharedpool
        image: sharedpool:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXTAUTH_URL
          value: "https://sharedpool.example.com"
```

---

## 기여하기

1. Fork 후 브랜치 생성 (`git checkout -b feature/your-feature`)
2. 변경사항 커밋 (`git commit -m 'Add feature'`)
3. 원격 브랜치 푸시 (`git push origin feature/your-feature`)
4. Pull Request 생성

---

## 라이선스

MIT License. 자세한 내용은 [LICENSE](LICENSE) 참고.

---

## 문의/지원

문제 발생 시 [Issues](../../issues) 등록 또는 메인테이너에게 문의

---

**그룹별 UI 제어, SYSTEM_ADMIN 전용 메뉴 등은 HOWTO.md를 참고하세요!**
