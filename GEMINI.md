# ArgoDash (Simple Web) Context

## Project Overview
This is a Next.js-based dashboard for managing and deploying applications via ArgoCD (Airflow focus). It is designed to run in a closed network environment (air-gapped), requiring offline resources and strict security handling.

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Auth**: NextAuth.js v4 (GitHub Provider configured, migrating to Keycloak)
- **Fonts**: Local Geist Sans/Mono (No external Google Fonts calls)

## Key Architectures

### 1. Authentication (Security)
- **Provider**: Currently GitHub.
- **Token Handling**:
  - **Client-side**: Browser only holds the NextAuth encrypted session cookie.
  - **Server-side (API Routes)**: Next.js API routes decrypt the session using `getToken()`, extract the upstream `access_token`, and attach it as a `Bearer` header to backend requests.
  - **Constraint**: Access tokens are **never** exposed to the client-side JavaScript.

### 2. API Proxy Pattern (BFF)
- **Frontend**: Calls internal Next.js API `/api/applications` or `/api/applications/create`.
- **Next.js Server**: Proxies request to the real backend.
- **Backend URL**: `${BACKEND_API_URL}/api/v1/argocd/applications` (GET) or `${BACKEND_API_URL}/api/v1/airflow/applications` (POST).
- **Response Handling Rule**: 
  - **Success (200)**: Often returns an **empty body**. APIs must read `text()` first and only parse JSON if content exists.
  - **Error (4xx/5xx)**: Returns JSON with `{ Code, Error, Message }`.
- **Project Scope**: `projectName` is injected from env `ARGOCD_PROJECT_NAME` (default: `airflow-pools`).
- **Fallback**: If the real backend fails (GET only), it automatically falls back to `/api/application-dummy` for testing.

### 3. Application Links
The dashboard provides 4 distinct external links for each application:
1.  **Airflow**: `app.externalURL` (Icon: Wind, Blue)
2.  **Grafana**: `${NEXT_PUBLIC_GRAFANA_BASE_URL}?project_name=${namespace}` (Icon: Activity, Orange)
3.  **FileBrowser**: `app.fileBrowserUrl` (Icon: FolderOpen, Amber)
4.  **GitHub**: `${NEXT_PUBLIC_GITHUB_BASE_URL}/${namespace}/airflow-dags` (Icon: Github, Gray)

### 4. Offline / Air-gapped Support
- **Fonts**: `next/font/google` replaced with `next/font/local`. Font files (`.woff2`) are stored in `app/fonts/`.
- **Assets**: All critical assets must be local.

## Features & UI
- **Dashboard**:
  - Grid/List view toggle.
  - Action buttons in List view are always visible (no hover required).
  - Search simulates filtering on the client side (when using raw array response).
- **New Application**:
  - Modal with `ProjectId` (must start with `aip-`) and `NAS Volume Size` (default: 20GB).
  - `MembershipLevel` fixed to `l1`.
  - Rich error display with Badge/Title/Message layout.
- **Navigation**:
  - Links: Applications, Monitoring, ArgoCD (External).
  - ArgoCD Link: Uses `NEXT_PUBLIC_ARGOCD_BASE_URL`.

## Environment Variables
- `BACKEND_API_URL`: Upstream API URL (default: `http://localhost:8080`).
- `ARGOCD_PROJECT_NAME`: Project scope for fetching apps (default: `airflow-pools`).
- `NEXT_PUBLIC_ARGOCD_BASE_URL`: Base URL for ArgoCD UI.
- `NEXT_PUBLIC_GITHUB_BASE_URL`: Base URL for GitHub links.
- `NEXT_PUBLIC_GRAFANA_BASE_URL`: Base URL for Grafana links.
- `GITHUB_ID` / `GITHUB_SECRET`: OAuth credentials.
- `NEXTAUTH_SECRET`: Session encryption key.
