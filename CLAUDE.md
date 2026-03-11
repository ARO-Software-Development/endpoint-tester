# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start development server (Vite)
pnpm build      # Type-check with tsc then build for production
pnpm lint       # Run ESLint on all TS/TSX files
pnpm preview    # Preview the production build
```

Package manager is **pnpm** — do not use npm or yarn.

There are no tests configured in this project.

## Architecture

**DARO Endpoint Tester** is a browser-based API client (Postman-like) built with React 19, TypeScript, Vite, and React Router v7. All state is persisted to `localStorage`.

### Routing (`src/App.tsx`)
- `/` → Home
- `/tester` → main Tester view
- `/docs` → Documentation
- `*` → Error page

### Tester view (`src/views/Tester/`)
The core of the app. Orchestrates four custom hooks and renders four main sub-components:
- **`TabBar`** — multi-tab management (create/close/rename tabs)
- **`HistorySidebar`** — slide-in panel with request history and saved endpoints
- **`RequestPanel`** — URL bar, method selector, params/headers/body editors, send/save buttons
- **`ResponsePanel`** — displays status, timing, response headers and body

### Custom hooks (`src/hooks/`)
- **`useTabs`** — manages the `Tab[]` array and active tab; persists to `localStorage` via `saveTabs`
- **`useHistory`** — manages `HistoryEntry[]`; persists via `saveHistory`; provides `replayRequest`, `formatTimestamp`, `getStatusCategory`
- **`useRequest`** — executes `fetch` calls, parses response body/headers, tracks loading/error state, logs to history
- **`useSavedEndpoints`** — manages `SavedEndpoint[]`; persists via `saveEndpoints`

All hooks are re-exported from `src/hooks/index.ts`.

### Data layer (`src/utils/storage.ts`)
Single source of truth for:
- **Types**: `HttpMethod`, `Tab`, `HistoryEntry`, `SavedEndpoint`, `StatusCategories`
- **localStorage keys**: `daro_tabs`, `daro_history`, `daro_saved_endpoints`
- **Helper functions**: `getMethodColor`, `getStatusLabel`, `generateId` (`crypto.randomUUID`), `isStorageAvailable`
- `MAX_HISTORY` is set low (5) for testing; production target is 100–200

`src/utils/url.ts` provides `parseParamsFromUrl` / `stringifyParamsToUrl` to sync the URL bar and the params table bidirectionally.

### Notifications
`sonner` is used for toasts (configured globally in `App.tsx`). Use `toast.success`, `toast.error`, `toast.warning`, `toast.info` — do not introduce another toast library.
