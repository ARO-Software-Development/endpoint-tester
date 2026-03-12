# DARO Endpoint Tester

A lightweight, browser-based API client (inspired by Postman) for testing RESTful endpoints. Built with speed and simplicity in mind using **Vite** and **pnpm**.

## 🛠️ Current Status: MVP (Minimum Viable Product)

This project is currently in active development. The goal is to provide a clean interface for testing common HTTP methods and inspecting real-time responses.

### ✅ Supported Features

* **Request Methods:**
* `GET`: Fetch data from any public or local API.
* `POST`: Send new data to a server.
* `PUT`: Update existing resources.
* `PATCH`: Test partial resource updates.
* `DELETE`: Verify resource removal.

* **Response Viewer:** Real-time display of the JSON response, including **status codes, response time, and response size**.
* **Multi-Tab Interface:** Manage multiple requests simultaneously with persistent state.
* **Request History:** Automatically track and replay previous requests.
* **Saved Endpoints:** Save and update frequently used API calls.
* **Editor with Line Numbers:** Improved body editing experience.

---

## 📁 Project Structure

The project follows a modular architecture to keep components reusable:

* `/src/views`: Contains the main Tester dashboard.
* `/src/components/layout`: Houses the `Header`, `Navbar`, and `Footer`.
* `/src/components/common`: Contains the `RequestForm`, `MethodSelector`, and `ResponseDisplay`.

---

## ⚙️ Development Setup

This project uses **pnpm** for package management. To get started locally:

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

* [x] Support for all common HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
* [x] Multi-tab interface with persistent state.
* [x] Request History (Local Storage) to save and replay previous tests.
* [x] Saved Endpoints with update/edit capabilities.
* [x] Response size calculation and display.
* [x] Editor with line numbers.
* [ ] Advanced Syntax highlighting for JSON (currently uses line numbers only).
* [ ] Environment variable support (e.g., `{{baseUrl}}`).
* [ ] Collections export/import (JSON).
* [ ] Unit/Integration tests.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👥 Contributors

A huge thanks to the people who have helped build this tool:

- **@K4** - UI/UX Designer
- **@SerevrGG** - Front-End Developer
- **@DazeChr** - Full-Stack Developer

---
