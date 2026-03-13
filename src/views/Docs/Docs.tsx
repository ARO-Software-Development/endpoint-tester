import './Docs.css';

const Documentation = () => {
  return (
    <div className="doc-container">
      <div className="doc-content">
        <h1 className="doc-header">
          <span className="accent-blue">DARO</span> Endpoint Tester
        </h1>
        
        <div className="doc-separator"></div>
        
        <p className="doc-intro">
          A lightweight, browser-based API client (inspired by Postman) for testing RESTful endpoints. Built with speed and simplicity in mind using <strong>Vite</strong> and <strong>pnpm</strong>.
        </p>

        <section className="doc-section">
          <h2>🛠️ Current Status: Beta</h2>
          <p>This project provides a robust interface for testing RESTful APIs with real-time feedback and persistent state.</p>
          
          <h3>✅ Supported Features</h3>
          <ul className="doc-list">
            <li><strong>Full REST Support:</strong> 
              <code>GET</code>, <code>POST</code>, <code>PUT</code>, <code>PATCH</code>, and <code>DELETE</code>.
            </li>
            <li><strong>Advanced JSON Editor:</strong> 
              Built-in syntax highlighting, line numbers, and tab support for both request and response bodies.
            </li>
            <li><strong>Authentication Schemes:</strong>
              <ul className="sub-list">
                <li>Bearer Token / JWT / OAuth 2.0</li>
                <li>Basic Auth (Username/Password)</li>
                <li>API Key (Header or Query Param)</li>
              </ul>
            </li>
            <li><strong>Dynamic URLs:</strong> 
              Full support for Query Parameters and Path Variables (e.g., <code>:id</code>) with bidirectional synchronization.
            </li>
            <li><strong>Persistence & History:</strong>
              Automatically tracks previous requests and saves multi-tab state using <code>localStorage</code>.
            </li>
          </ul>
        </section>

        <section className="doc-section">
          <h2>📁 Project Structure</h2>
          <p>The project follows a modular architecture to keep logic decoupled from the UI:</p>
          <ul className="doc-list">
            <li><code>/src/views</code>: Main application pages (Tester, Home, Docs).</li>
            <li><code>/src/hooks</code>: Core business logic (Tabs, History, Request, Saved Endpoints).</li>
            <li><code>/src/components/common</code>: Reusable UI components (Editor, Panels, Sidebars).</li>
            <li><code>/src/utils</code>: Storage helpers, URL parsing, and data layer logic.</li>
          </ul>
        </section>

        <section className="doc-section">
          <h2>⚙️ Development Setup</h2>
          <p>This project uses <strong>pnpm</strong> for package management. To get started locally:</p>
          
          <div className="code-block">
            <p>1. Clone the repository:</p>
            <code>git clone &lt;your-repo-link&gt;<br/>cd &lt;project-folder&gt;</code>
          </div>
          
          <div className="code-block">
            <p>2. Install dependencies:</p>
            <code>pnpm install</code>
          </div>
          
          <div className="code-block">
            <p>3. Run the development server:</p>
            <code>pnpm dev</code>
          </div>
          
          <div className="code-block">
            <p>4. Build for production:</p>
            <code>pnpm build</code>
          </div>
        </section>

        <section className="doc-section">
          <h2>🗺️ Roadmap</h2>
          <ul className="checklist">
            <li><input type="checkbox" checked disabled /> Support for all REST methods (GET, POST, PUT, PATCH, DELETE).</li>
            <li><input type="checkbox" checked disabled /> JSON Syntax Highlighting for both request and response.</li>
            <li><input type="checkbox" checked disabled /> Path Variables and Query Param synchronization.</li>
            <li><input type="checkbox" checked disabled /> LocalStorage persistence for Tabs and History.</li>
            <li><input type="checkbox" disabled /> Environment variable support (e.g., <code>{`{{baseUrl}}`}</code>).</li>
            <li><input type="checkbox" disabled /> Export/Import collections (JSON).</li>
            <li><input type="checkbox" disabled /> Automated Unit/Integration tests.</li>
          </ul>
        </section>

        <section className="doc-section">
          <h2>👥 Contributors</h2>
          <p>A huge thanks to the people who have helped build this tool:</p>
          <ul className="doc-list contributors">
            <li><strong>@K4</strong> - UI/UX Designer</li>
            <li><strong>@SerevrGG</strong> - Front-End Developer</li>
            <li><strong>@DazeChr</strong> - Full-Stack Developer</li>
          </ul>
        </section>

        <div className="doc-separator bottom-separator"></div>
        <p className="license-text">📄 Distributed under the MIT License.</p>
      </div>
    </div>
  );
};

export default Documentation;
