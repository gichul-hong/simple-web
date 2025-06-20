# SharedPool - 사내 배치 수행환경 SaaS 플랫폼

SharedPool은 사내 배치 수행환경을 SaaS 형태로 제공하는 플랫폼입니다. Airflow와 MLflow를 통합하여 워크플로우 관리와 ML 모델 실험/배포를 지원하며, Prometheus를 통한 실시간 모니터링을 제공합니다.

## 주요 기능

### 🏠 대시보드
- **실시간 메트릭**: Prometheus를 통한 클러스터 리소스 모니터링
- **서비스 현황**: Airflow/MLflow 인스턴스 및 활용도 현황
- **리소스 사용량**: CPU, Memory, GPU 일간/주간 사용량 추이

### 🔄 Airflow 관리
- DAG 배포 및 워크플로우 관리
- ArgoCD를 통한 애플리케이션 배포
- 실시간 워크플로우 모니터링

### 🧪 MLflow 관리
- ML 모델 실험 및 배포 관리
- 실험 추적 및 모델 버전 관리
- ArgoCD를 통한 모델 서비스 배포

### 📊 시스템 모니터링
- Kubernetes 클러스터 상태 모니터링
- ArgoCD 애플리케이션 현황
- 리소스 사용량 및 성능 지표

## 기술 스택

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js (GitHub OAuth)
- **Monitoring**: Prometheus
- **Orchestration**: ArgoCD
- **Workflow**: Apache Airflow
- **ML Platform**: MLflow
- **Container**: Kubernetes

## 시작하기

### 1. 환경 설정

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.sample .env.local
```

### 2. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```env
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# GitHub OAuth
GITHUB_ID=your-github-oauth-app-id
GITHUB_SECRET=your-github-oauth-app-secret

# Prometheus (선택사항)
PROMETHEUS_URL=http://prometheus:9090

# ArgoCD (선택사항)
ARGOCD_SERVER_URL=http://argocd-server:8080
ARGOCD_TOKEN=your-argocd-token
```

### 3. GitHub OAuth 앱 설정

1. GitHub에서 새로운 OAuth App 생성
2. Authorization callback URL을 `http://localhost:3000/api/auth/callback/github`로 설정
3. Client ID와 Client Secret을 환경 변수에 설정

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 SharedPool 대시보드를 확인하세요.

## 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # NextAuth.js API 라우트
│   ├── airflow/
│   │   └── page.tsx                  # Airflow 관리 페이지
│   ├── mlflow/
│   │   └── page.tsx                  # MLflow 관리 페이지
│   ├── monitoring/
│   │   └── page.tsx                  # 시스템 모니터링 페이지
│   ├── components/
│   │   └── Navigation.tsx            # 네비게이션 컴포넌트
│   ├── lib/
│   │   ├── metrics.tsx               # Prometheus 메트릭 유틸리티
│   │   └── argocd.ts                 # ArgoCD API 유틸리티
│   ├── globals.css                   # 전역 스타일
│   ├── layout.tsx                    # 루트 레이아웃
│   └── page.tsx                      # 홈 대시보드
```

## 메트릭 수집

### Prometheus 연동

SharedPool은 Prometheus를 통해 다음 메트릭을 수집합니다:

- **클러스터 리소스**: CPU, Memory, GPU 사용량
- **Airflow 메트릭**: DAG 실행 상태, 워크플로우 성능
- **MLflow 메트릭**: 실험 수, 모델 배포 상태
- **Kubernetes 메트릭**: 노드 상태, 파드 리소스 사용량

### 커스텀 메트릭 추가

`src/app/lib/metrics.tsx`에서 새로운 메트릭을 추가할 수 있습니다:

```typescript
export async function fetchCustomMetrics() {
  // Prometheus 쿼리 추가
  const response = await fetch('http://prometheus:9090/api/v1/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ query: 'your_metric_query' }),
  });
  
  return response.json();
}
```

## 배포

### Docker 배포

```bash
# Docker 이미지 빌드
docker build -t sharedpool .

# 컨테이너 실행
docker run -p 3000:3000 sharedpool
```

### Kubernetes 배포

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

## 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 지원

문제가 발생하거나 질문이 있으시면 [Issues](../../issues)를 통해 문의해 주세요.
