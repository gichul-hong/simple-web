# Kubernetes Deployment & Environment Variables Guide

Next.js 애플리케이션을 Kubernetes에 배포할 때, ConfigMap을 통해 환경 변수를 주입하는 방법과 주의사항입니다.

## 1. ConfigMap 생성 (예시)

`configmap.yaml` 파일을 생성하여 필요한 환경 변수를 정의합니다.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: simple-web-config
  namespace: default # 배포할 네임스페이스
data:
  # Next.js Server-side Config (Runtime)
  AUTH_ENABLED: "true"
  BACKEND_API_URL: "http://backend-service:8080"
  ARGOCD_PROJECT_NAME: "airflow-pools"
  
  # NextAuth Config
  KEYCLOAK_ID: "my-client-id"
  KEYCLOAK_ISSUER: "http://keycloak-service:8080/realms/my-realm"
  # 주의: Secret 정보는 가급적 k8s Secret 리소스를 사용하세요.
  # KEYCLOAK_SECRET: "..." 

  # Client-side Config (Public)
  # 주의: Next.js는 빌드 시점에 NEXT_PUBLIC_ 변수를 코드에 박아버립니다.
  # 런타임에 ConfigMap으로 덮어쓰려면 아래 "런타임 환경 변수 설정" 섹션을 참고하세요.
  NEXT_PUBLIC_ARGOCD_BASE_URL: "https://argocd.example.com"
  NEXT_PUBLIC_GITHUB_BASE_URL: "https://github.com"
  NEXT_PUBLIC_GRAFANA_BASE_URL: "https://grafana.example.com"
```

## 2. Deployment에 적용

`deployment.yaml`에서 `envFrom` 또는 `env`를 사용하여 ConfigMap을 컨테이너에 주입합니다.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: simple-web
spec:
  replicas: 1
  selector:
    matchLabels:
      app: simple-web
  template:
    metadata:
      labels:
        app: simple-web
    spec:
      containers:
        - name: simple-web
          image: my-registry/simple-web:latest
          ports:
            - containerPort: 3000
          # 방법 A: ConfigMap 전체를 환경 변수로 주입 (권장)
          envFrom:
            - configMapRef:
                name: simple-web-config
          # Secret은 별도로 주입
          env:
            - name: KEYCLOAK_SECRET
              valueFrom:
                secretKeyRef:
                  name: simple-web-secret
                  key: KEYCLOAK_SECRET
```

## 3. [중요] Next.js와 환경 변수 (Build Time vs Runtime)

Next.js에는 두 가지 종류의 환경 변수가 있습니다.

### A. Server-side Variables (접두어 없음)
- 예: `BACKEND_API_URL`, `KEYCLOAK_ISSUER`
- **동작**: **Runtime(서버 실행 시)**에 `process.env`에서 값을 읽어옵니다.
- **ConfigMap 적용**: **잘 됩니다.** Pod가 시작될 때 주입된 ConfigMap 값을 정상적으로 읽습니다.

### B. Client-side Variables (`NEXT_PUBLIC_` 접두어)
- 예: `NEXT_PUBLIC_ARGOCD_BASE_URL`
- **동작**: **Build Time(빌드 시점)**에 코드 내의 변수 값이 문자열로 치환(Inlined)됩니다.
- **ConfigMap 적용**: **안 됩니다.** 이미지 빌드 시점의 `.env` 파일 값이 박제되어 버리므로, Pod 실행 시점에 ConfigMap으로 덮어씌워도 브라우저에서는 빌드 시점의 값이 보입니다.

### 해결 방법: Runtime Configuration (현재 프로젝트에 이미 적용됨!)

이 프로젝트는 `app/layout.tsx`와 `ConfigProvider`를 통해 **Server-side 환경 변수를 Client로 전달하는 구조**를 채택하고 있습니다.

1.  **Root Layout (`app/layout.tsx`)**: 서버 컴포넌트이므로 Runtime에 `process.env`에 접근 가능합니다.
2.  **Config Extraction**: `layout.tsx`에서 `BACKEND_API_URL` 등 환경 변수를 읽어 `config` 객체를 만듭니다.
    - *참고: `NEXT_PUBLIC_` 접두어가 없어도 서버에서 읽어서 클라이언트로 내려줄 수 있습니다.*
3.  **Provider**: 이 `config`를 `<Providers config={config}>`를 통해 React Context에 주입합니다.
4.  **Client Usage**: 클라이언트 컴포넌트(`Navbar.tsx` 등)는 `useConfig()` 훅을 통해 이 값을 사용합니다.

**결론**:
- `deployment.yaml`에 ConfigMap만 잘 연결하면, **재빌드 없이** 환경 변수 변경만으로 설정을 바꿀 수 있습니다.
- `NEXT_PUBLIC_` 변수 대신 `BACKEND_API_URL` 처럼 접두어 없는 변수명을 ConfigMap에 정의하고, 코드에서는 `layout.tsx`를 통해 주입받으세요.

## 4. 디버깅

Pod에 접속하여 환경 변수가 제대로 주입되었는지 확인합니다.

```bash
# 1. Pod 이름 확인
kubectl get pods

# 2. 환경 변수 확인
kubectl exec -it <pod-name> -- env | grep BACKEND

# 3. 로그 확인 (app/api/applications/route.ts에 추가한 로그 확인)
kubectl logs -f <pod-name>
```
