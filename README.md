# DARO Endpoint Tester

A lightweight, browser-based API client (inspired by Postman) for testing RESTful endpoints. Built with speed and simplicity in mind using **Vite** and **pnpm**.

## 🛠️ Current Status: MVP (Minimum Viable Product)

This project is currently in active development. The goal is to provide a clean interface for testing common HTTP methods and inspecting real-time responses.

### ✅ Supported Features

* **Request Methods:**
* `GET`: Fetch data from any public or local API.
* `POST`: Send new data to a server.
* `PATCH`: Test partial resource updates.
* `DELETE`: Verify resource removal.


* **Response Viewer:** Real-time display of the JSON response returned by the server.
* **Custom Headers:** (Planned/In-Progress) Ability to add Auth tokens or Content-Type headers.

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

* [ ] Add support for `GET` requests.
* [ ] Add support for `POST` requests.
* [ ] Add support for `PATCH` requests.
* [ ] Add support for `DELETE` requests.
* [ ] Add support for `PUT` requests.
* [ ] Syntax highlighting for the JSON response body.
* [ ] Request History (Local Storage) to save previous tests.
* [ ] Environment variable support (e.g., `{{baseUrl}}`).

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
