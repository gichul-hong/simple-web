# 폐쇄망 환경 전환 및 Keycloak 연동 가이드

이 문서는 외부 인터넷이 차단된 폐쇄망(Closed Network) 환경에서 이 Next.js 애플리케이션을 배포하고, 기존 GitHub 인증을 사내 Keycloak SSO로 전환하기 위한 절차를 기술합니다.

## 1. 전제 조건 (Prerequisites)

*   **Keycloak 서버**: 사내망에서 접근 가능한 Keycloak 인스턴스 (v17+ 권장).
*   **사내 Docker Registry**: (선택 사항) 이미지를 빌드하여 내부로 전송할 경우 필요.
*   **사내 CA 인증서**: HTTPS 통신을 위한 사내 Root CA 인증서 파일 (`.pem` 또는 `.crt`).

---

## 2. 코드 변경 사항 (NextAuth 설정)

`app/api/auth/[...nextauth]/route.ts` 파일을 열어 인증 공급자(Provider)를 변경해야 합니다.

### 수정 전 (GitHub)
```typescript
providers: [
  GithubProvider({
    clientId: process.env.GITHUB_ID || 'dummy-github-id',
    clientSecret: process.env.GITHUB_SECRET || 'dummy-github-secret',
  }),
  // KeycloakProvider(...) // 주석 처리됨
]
```

### 수정 후 (Keycloak)
```typescript
import KeycloakProvider from 'next-auth/providers/keycloak';

// ...

providers: [
  // GithubProvider 제거 또는 주석 처리
  KeycloakProvider({
    clientId: process.env.KEYCLOAK_ID!,
    clientSecret: process.env.KEYCLOAK_SECRET!,
    issuer: process.env.KEYCLOAK_ISSUER!,
    // 사내 인증서 신뢰 문제 발생 시 아래 옵션 필요할 수 있음 (보안상 주의)
    // allowDangerousEmailAccountLinking: true, 
  }),
]
```

---

## 3. 환경 변수 설정 (.env)

배포 환경의 서버 또는 K8s Secret에 다음 환경 변수를 설정해야 합니다.

```bash
# NextAuth 기본 설정
NEXTAUTH_URL=http://<내부-서비스-도메인-또는-IP>:3000
NEXTAUTH_SECRET=<임의의-긴-문자열> # 생성 명령: openssl rand -base64 32

# Keycloak 설정
KEYCLOAK_ID=my-nextjs-app                   # Keycloak Client ID
KEYCLOAK_SECRET=xxxxxxxx-xxxx-xxxx-xxxx     # Keycloak Client Credentials Secret
KEYCLOAK_ISSUER=https://<keycloak-url>/realms/<my-realm>
```

---

## 4. Keycloak 관리자 콘솔 설정

Keycloak 관리자 화면에서 해당 Client에 대해 다음 설정이 필요합니다.

1.  **Client ID**: `my-nextjs-app` (위의 KEYCLOAK_ID와 일치)
2.  **Access Type**: `confidential` (Client Secret 사용을 위해 필수)
3.  **Valid Redirect URIs**:
    *   `http://<내부-서비스-도메인>:3000/api/auth/callback/keycloak`
    *   **주의**: 끝부분이 반드시 `/callback/keycloak`이어야 합니다.

---

## 5. 폐쇄망 SSL/TLS 인증서 문제 해결 (중요)

폐쇄망에서는 보통 사설 인증서(Private CA)를 사용합니다. Next.js 백엔드(Node.js)가 Keycloak과 통신할 때 "Self signed certificate" 오류가 발생할 수 있습니다.

### 해결 방법 A: 시스템에 CA 인증서 등록 (권장)
Node.js 프로세스 실행 시 `NODE_EXTRA_CA_CERTS` 환경 변수를 사용합니다.

1.  사내 Root CA 인증서 파일을 컨테이너 내부로 복사 (예: `/app/certs/root-ca.pem`).
2.  실행 시 환경 변수 주입:
    ```bash
    export NODE_EXTRA_CA_CERTS="/app/certs/root-ca.pem"
    npm start
    ```

### 해결 방법 B: TLS 검증 비활성화 (테스트 용도만 사용)
보안상 좋지 않으나, 급한 연결 테스트 시 사용 가능합니다.
```bash
export NODE_TLS_REJECT_UNAUTHORIZED="0"
```

---

## 6. 빌드 및 배포 (Docker Standalone)

폐쇄망에는 `npm install`이 불가능하므로, **Standalone 빌드**를 사용하여 외부에서 빌드 후 아티팩트만 가져가는 것을 권장합니다.

### 6.1. next.config.ts 수정
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // 이 줄을 추가
  // ...
};

export default nextConfig;
```

### 6.2. Dockerfile 예시
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Standalone 빌드 결과물 복사
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

이 Dockerfile로 빌드된 이미지는 `node_modules` 설치 없이 실행 가능하므로 폐쇄망 배포에 최적화되어 있습니다.
