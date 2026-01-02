# ArgoDash (Simple Web) Context

## Project Overview
This is a Next.js-based dashboard for managing and deploying applications via ArgoCD (Airflow focus). It is designed to run in a closed network environment (air-gapped), requiring offline resources and strict security handling.

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Auth**: NextAuth.js v4
- **Fonts**: Local Geist Sans/Mono (No external Google Fonts calls)

## Key Architectures

### 1. Authentication (Security)
- **Provider**: Currently GitHub, migrating to Keycloak in production.
- **Token Handling**:
  - **Client-side**: Browser only holds the NextAuth encrypted session cookie.
  - **Server-side (API Routes)**: Next.js API routes decrypt the session using `getToken()`, extract the upstream `access_token`, and attach it as a `Bearer` header to backend requests.
  - **Constraint**: Access tokens are **never** exposed to the client-side JavaScript.

### 2. API Proxy Pattern (BFF)
- **Frontend**: Calls internal Next.js API `/api/applications`.
- **Next.js Server**: Proxies request to the real backend.
  - **Backend URL**: `${BACKEND_API_URL}/api/v1/airflow/applications`
  - **Query Params**: `projectName` is injected from env `ARGOCD_PROJECT_NAME` (default: `airflow-pools`). Client `search` params are currently mapped/ignored in favor of env vars for project scoping.
  - **Fallback**: If the real backend fails (or for testing), it automatically falls back to `/api/application-dummy` which generates random data.

### 3. Offline / Air-gapped Support
- **Fonts**: `next/font/google` replaced with `next/font/local`. Font files (`.woff2`) are stored in `app/fonts/` and committed to the repo.
- **Assets**: All critical assets must be local.

## Environment Variables
- `BACKEND_API_URL`: URL of the upstream Spring/Airflow backend (default: `http://localhost:8080`).
- `ARGOCD_PROJECT_NAME`: The project scope for fetching applications (default: `airflow-pools`).
- `GITHUB_ID` / `GITHUB_SECRET`: OAuth credentials.
- `NEXTAUTH_SECRET`: Session encryption key.

## Current Features
- **Dashboard**: Lists applications with status, sync state, and external links. Supports Grid/List view and local searching.
- **Monitoring**: Placeholder page for system status.
- **Navigation**: Responsive Navbar with "Applications" and "Monitoring" links (protected).