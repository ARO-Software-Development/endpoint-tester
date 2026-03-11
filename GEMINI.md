# DARO Endpoint Tester - Project Context

This document provides foundational context and development guidelines for the DARO Endpoint Tester project.

## Project Overview

**DARO Endpoint Tester** is a lightweight, browser-based API client (inspired by Postman) built with modern web technologies. It allows developers to test RESTful endpoints, manage multiple request tabs, track history, and save frequently used endpoints.

### Main Technologies
- **Frontend Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Routing:** React Router v7
- **Styling:** Vanilla CSS (modular per component)
- **Package Manager:** `pnpm` (required)
- **State Management:** Custom hooks with `localStorage` persistence.
- **Notifications:** `sonner` for toast notifications.

## Project Structure

```text
src/
├── components/
│   ├── common/         # Reusable UI components (TabBar, RequestPanel, etc.)
│   └── layout/         # High-level layout components (Header, Footer)
├── hooks/              # Core business logic separated into custom hooks
├── utils/              # Helper functions and data layer (storage, URL parsing)
└── views/              # Main page components (Home, Tester, Docs, Error)
```

## Building and Running

| Action | Command |
| :--- | :--- |
| **Install Dependencies** | `pnpm install` |
| **Start Dev Server** | `pnpm dev` |
| **Production Build** | `pnpm build` |
| **Lint Code** | `pnpm lint` |
| **Preview Build** | `pnpm preview` |

> **Note:** Do not use `npm` or `yarn`. This project strictly uses `pnpm`.

## Architecture & Development Conventions

### 1. State Persistence
All application state (Tabs, History, Saved Endpoints) is persisted to `localStorage`.
- **Source of Truth:** `src/utils/storage.ts` defines the types and keys used.
- **History Limit:** Currently limited to 5 entries (defined as `MAX_HISTORY` in `storage.ts`) for testing/performance; target for production is 100+.

### 2. Logic Separation (Hooks)
Business logic is decoupled from the UI and resides in custom hooks located in `src/hooks/`:
- `useTabs`: Manages multi-tab state and active tab.
- `useHistory`: Manages request history and provides replay functionality.
- `useRequest`: Handles the actual `fetch` execution and response parsing.
- `useSavedEndpoints`: Manages the collection of saved endpoints.

### 3. URL Synchronization
The project uses `src/utils/url.ts` to sync the URL bar with the parameters table bidirectionally. Always ensure any changes to the URL bar are reflected in the params list and vice-versa.

### 4. UI/UX Standards
- **Icons:** Custom SVG assets in `src/assets/`.
- **Toasts:** Use `sonner`. Prefer `toast.success`, `toast.error`, `toast.warning`, or `toast.info`. Do not introduce other notification libraries.
- **Methods:** HTTP methods have specific colors assigned in `src/utils/storage.ts` (`getMethodColor`). Use these colors for visual consistency.

### 5. Validation
URL validation is performed in the `Tester` view before executing requests. It requires a valid protocol (`http:` or `https:`).

## Data Models

### Tab
```typescript
{
  id: string;
  label: string;
  method: HttpMethod;
  url: string;
  params: { key: string; value: string }[];
  headers: { key: string; value: string }[];
  body: string;
}
```

### HistoryEntry
```typescript
{
  id: string;
  tabId: string;
  timestamp: string;
  method: HttpMethod;
  url: string;
  headers: { key: string; value: string }[];
  body: string;
  responseStatus: number;
  responseTime: number;
}
```

## TODOs / Roadmap
- Support for `PUT` requests.
- Syntax highlighting for JSON response body.
- Environment variable support (e.g., `{{baseUrl}}`).
- Tests (currently no test suite is configured).
