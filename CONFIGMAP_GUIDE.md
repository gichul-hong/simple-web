# ConfigMap & envFrom 설정 가이드 (환경 변수 적용 안 될 때)

`envFrom`을 사용했는데도 `process.env` 값이 비어있다면, 대부분 **ConfigMap의 포맷 문제**이거나 **Deployment의 들여쓰기/위치 문제**입니다.

## 1. ConfigMap 작성 (정석)

가장 중요한 점: **Key에는 점(`.`)이나 특수문자가 들어가면 안 될 수도 있습니다.** (대문자 + 언더바 `_` 권장)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: simple-web-config  # 이 이름을 기억하세요
  namespace: default       # 배포할 네임스페이스와 일치해야 함
data:
  # 모든 값은 반드시 "따옴표"로 감싸는 것이 안전합니다.
  AUTH_ENABLED: "true"
  BACKEND_API_URL: "http://my-backend-service:8080"
  ARGOCD_PROJECT_NAME: "airflow-pools"
  
  # Keycloak 관련
  KEYCLOAK_ISSUER: "http://my-keycloak:8080/realms/master"
  KEYCLOAK_ID: "simple-web-client"
  # (비밀번호는 Secret 권장)
  KEYCLOAK_SECRET: "my-secret-value"
  
  # 클라이언트용 (NEXT_PUBLIC_ 필요 없음! layout.tsx가 내려줌)
  ARGOCD_BASE_URL: "https://argocd.mycompany.com"
  GITHUB_BASE_URL: "https://gitlab.mycompany.com"
  GRAFANA_BASE_URL: "https://grafana.mycompany.com"
```

---

## 2. Deployment 작성 (envFrom 위치 주의)

`envFrom`은 반드시 `containers` 목록의 항목(`- name: ...`) 바로 아래 레벨에 있어야 합니다. `spec` 바로 아래가 아닙니다.

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
          image: my-image:latest
          ports:
            - containerPort: 3000
          
          # [핵심] envFrom 위치 확인! (image, ports와 같은 레벨)
          envFrom:
            - configMapRef:
                name: simple-web-config  # ConfigMap 이름과 정확히 일치해야 함
```

---

## 3. 적용 확인 (디버깅)

설정을 적용(`kubectl apply`)하고 Pod를 재시작(`kubectl rollout restart`)한 뒤, 반드시 직접 확인해야 합니다.

**명령어:**
```bash
# 1. Pod 이름 찾기
kubectl get pods

# 2. 실제 환경 변수 찍어보기 (여기서 안 나오면 ConfigMap 연결 실패)
kubectl exec -it <POD_NAME> -- env | grep BACKEND
```

### 🚨 자주 하는 실수 체크리스트

1.  **네임스페이스 불일치**: ConfigMap은 `default`에 만들고, Pod는 `dev` 네임스페이스에 띄우면 못 찾습니다.
2.  **ConfigMap 이름 오타**: `simple-web-config` vs `simple-web-conf` 등.
3.  **Pod 재시작 안 함**: ConfigMap 내용만 `kubectl edit`으로 고치고 Pod를 그대로 두면, **죽었다 깨어나도 반영 안 됩니다.** 반드시 Pod를 삭제하거나 재시작해야 합니다.
4.  **YAML 들여쓰기**: `envFrom`이 `containers` 배열의 요소가 아니라 엉뚱한 곳에 가 있으면 무시됩니다.
