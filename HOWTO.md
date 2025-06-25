# HOWTO: 그룹별 UI 제어 및 SYSTEM_ADMIN 전용 버튼 노출 방법

이 문서는 NextAuth JWT의 그룹 정보에 따라 화면을 다르게 처리하는 방법과, 특정 버튼을 SYSTEM_ADMIN 그룹에만 노출하는 방법을 안내합니다.

---

## 1. JWT 그룹 정보 클라이언트로 전달하기

Keycloak 등에서 로그인 시, JWT에 그룹 정보가 포함되어 있다면
`src/app/api/auth/[...nextauth]/route.ts`의 `jwt` 및 `session` 콜백에서 그룹 정보를 세션에 추가해야 합니다.

```ts
// ... existing code ...
callbacks: {
  async jwt({ token, user, account, profile }) {
    // Keycloak: persist access token, group info, admin role
    if (account && user && AUTH_PROVIDER === "keycloak") {
      token.accessToken = account.access_token;
      if (profile && profile.groups && Array.isArray(profile.groups)) {
        token.groups = profile.groups;
        token.isAdmin = profile.groups.includes("SYSTEM_ADMIN");
      } else {
        token.isAdmin = false;
      }
    }
    return token;
  },
  async session({ session, token }) {
    // expose isAdmin and groups to client for Keycloak
    if (AUTH_PROVIDER === "keycloak") {
      session.isAdmin = token.isAdmin;
      session.groups = token.groups;
    }
    return session;
  },
},
// ... existing code ...
```

> **설명:**
> - `token.groups`에 그룹 배열을 저장
> - `token.isAdmin`에 SYSTEM_ADMIN 포함 여부를 저장
> - `session` 콜백에서 이 값을 클라이언트로 전달

---

## 2. 클라이언트에서 세션 정보 사용하기

`useSession` 훅을 사용해 세션 정보를 가져올 수 있습니다.

```tsx
import { useSession } from "next-auth/react";

export default function MyComponent() {
  const { data: session } = useSession();

  // 예시: SYSTEM_ADMIN만 볼 수 있는 버튼
  if (!session) return null;

  return (
    <div>
      {/* SYSTEM_ADMIN 그룹에만 보이는 버튼 */}
      {session.isAdmin && (
        <button className="btn btn-primary">관리자 전용 버튼</button>
      )}

      {/* 그룹별로 다른 UI */}
      {session.groups?.includes("DEV_TEAM") && (
        <div>개발팀 전용 안내문구</div>
      )}
    </div>
  );
}
```

---

## 3. 실전 적용 예시: Navigation에서 SYSTEM_ADMIN만 메뉴 노출

```tsx
import { useSession } from "next-auth/react";

export function Navigation() {
  const { data: session } = useSession();

  return (
    <nav>
      {/* ...기존 메뉴... */}
      {session?.isAdmin && (
        <a href="/admin" className="text-red-500 font-bold">관리자 설정</a>
      )}
    </nav>
  );
}
```

---

## 4. 주의사항

- **Keycloak 등 그룹 정보가 없는 경우**: `session.groups`가 undefined일 수 있으니 null 체크 필요
- **SSR 환경**: 서버 컴포넌트에서는 `getServerSession`을 사용해 동일하게 접근 가능

---

## 요약

- JWT 콜백에서 그룹/권한 정보를 세션에 추가
- 클라이언트에서 `useSession`으로 세션 정보 접근
- `session.isAdmin` 또는 `session.groups`로 조건부 렌더링 