# DARO Endpoint Tester

A lightweight, browser-based API client (inspired by Postman) for testing RESTful endpoints. Built with speed and simplicity in mind using **Vite** and **pnpm**.

## 🛠️ Current Status: Beta

This project provides a robust interface for testing RESTful APIs with real-time feedback and persistent state.

### ✅ Supported Features

*   **Request Methods:** Full support for `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`.
*   **Advanced JSON Editor:** High-performance editor with **syntax highlighting**, line numbers, and tab indentation for both request and response bodies.
*   **Authentication:** Support for multiple auth schemes:
    *   Bearer Token
    *   Basic Auth (Username/Password)
    *   API Key (Header or Query Param)
    *   JWT & OAuth 2.0 tokens
*   **Dynamic URLs:** Bidirectional synchronization between URL string, **Query Parameters**, and **Path Variables** (e.g., `:id`).
*   **Response Viewer:** Detailed inspection of status codes, headers, response time, and payload size.
*   **Multi-Tab Interface:** Manage multiple independent requests simultaneously.
*   **Persistence:** All tabs, history, and saved endpoints are persisted via `localStorage`.
*   **Deployment Ready:** Pre-configured for **Netlify** with SPA routing support (`_redirects`).

---

## 📁 Project Structure

The project follows a modular architecture:

*   `/src/views`: Main page components (Tester, Home, Docs).
*   `/src/hooks`: Decoupled business logic (Tabs, History, Request, Saved Endpoints).
*   `/src/components/common`: Reusable UI components (Editor, Panels, Sidebars).
*   `/src/utils`: Data layer, storage helpers, and URL parsing logic.

---

## ⚙️ Development Setup

This project uses **pnpm** for package management.

1. **Clone the repository:**
```bash
git clone <your-repo-link>
cd <project-folder>
```

2. **Install dependencies:**
```bash
pnpm install
```

3. **Run the development server:**
```bash
pnpm dev
```

4. **Build for production:**
```bash
pnpm build
```

---

## 🗺️ Roadmap

*   [x] Advanced Syntax highlighting for JSON.
*   [x] Path variable support and URL sync.
*   [x] Comprehensive Authentication methods.
*   [x] Persistence and History management.
*   [ ] Environment variable support (e.g., `{{baseUrl}}`).
*   [ ] Collections export/import (JSON).
*   [ ] Unit/Integration tests.
*   [ ] Schema validation for JSON bodies.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👥 Contributors

- **@K4** - UI/UX Designer
- **@SerevrGG** - Front-End Developer
- **@DazeChr** - Full-Stack Developer
