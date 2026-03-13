import { useEffect, useState } from "react";
import {
  type HttpMethod,
  getMethodColor,
  type Tab,
  type AuthMethod,
  type AuthConfig,
} from "../../../utils/storage";
import {
  parseParamsFromUrl,
  stringifyParamsToUrl,
  parsePathParamsFromUrl,
} from "../../../utils/url";
import Editor from "../Editor/Editor";
import "./RequestPanel.css";
import { toast } from "sonner";

interface RequestPanelProps {
  activeTab: Tab | undefined;
  onUpdateTab: (id: string, changes: Partial<Tab>) => void;
  onSend: () => void;
  onSave: () => void;
  isLoading: boolean;
  onToggleHistory: () => void;
  historyOpen: boolean;
  isDirty?: boolean;
}

export default function RequestPanel({
  activeTab,
  onUpdateTab,
  onSend,
  onSave,
  isLoading,
  onToggleHistory,
  historyOpen,
  isDirty = true,
}: RequestPanelProps) {
  const [requestTab, setRequestTab] = useState<
    "params" | "headers" | "body" | "auth"
  >("params");
  const [showToken, setShowToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOAuth, setShowOAuth] = useState(false);
  const [showJWT, setShowJWT] = useState(false);

  const BODY_METHODS = ["POST", "PUT", "PATCH"] as HttpMethod[];

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        onSend();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        onSave();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, isLoading, onSend, onSave]);

  // Sync Params -> URL
  function handleParamChange(
    index: number,
    field: "key" | "value",
    value: string,
  ): void {
    if (!activeTab) return;
    const updatedParams = [...(activeTab.params || [])];
    updatedParams[index] = { ...updatedParams[index], [field]: value };

    const newUrl = stringifyParamsToUrl(activeTab.url, updatedParams);
    onUpdateTab(activeTab.id, {
      params: updatedParams,
      url: newUrl,
    });
  }

  function handleAddParam(): void {
    if (!activeTab) return;
    onUpdateTab(activeTab.id, {
      params: [...(activeTab.params || []), { key: "", value: "" }],
    });
  }

  function handleRemoveParam(index: number): void {
    if (!activeTab) return;
    const updatedParams = (activeTab.params || []).filter(
      (_, i) => i !== index,
    );
    const newUrl = stringifyParamsToUrl(activeTab.url, updatedParams);
    onUpdateTab(activeTab.id, {
      params: updatedParams,
      url: newUrl,
    });
  }

  // Sync Path Params -> URL
  function handlePathParamChange(
    index: number,
    field: "key" | "value",
    value: string,
  ): void {
    if (!activeTab) return;
    const oldParams = activeTab.pathParams || [];
    const oldKey = oldParams[index].key;
    const updatedParams = [...oldParams];
    updatedParams[index] = { ...updatedParams[index], [field]: value };

    let newUrl = activeTab.url;
    if (field === "key" && oldKey !== value) {
      // Update the URL to reflect the new key name: replace :oldKey with :value
      const regex = new RegExp(`:${oldKey}(?=/|\\?|$)`, "g");
      newUrl = activeTab.url.replace(regex, `:${value}`);
    }

    onUpdateTab(activeTab.id, {
      pathParams: updatedParams,
      url: newUrl,
    });
  }

  function handleAddPathParam(): void {
    if (!activeTab) return;
    const [baseUrl, queryString] = activeTab.url.split("?");
    const newBaseUrl = baseUrl.endsWith("/")
      ? `${baseUrl}:key`
      : `${baseUrl}/:key`;
    const newUrl = queryString ? `${newBaseUrl}?${queryString}` : newBaseUrl;

    onUpdateTab(activeTab.id, {
      url: newUrl,
      pathParams: [...(activeTab.pathParams || []), { key: "key", value: "" }],
    });
  }

  function handleRemovePathParam(index: number): void {
    if (!activeTab) return;
    const oldKey = (activeTab.pathParams || [])[index].key;
    const updatedParams = (activeTab.pathParams || []).filter(
      (_, i) => i !== index,
    );

    // Remove :key from URL (and the preceding slash if possible)
    const regex = new RegExp(`/:${oldKey}(?=/|\\?|$)`, "g");
    const newUrl = activeTab.url.replace(regex, "");

    onUpdateTab(activeTab.id, {
      pathParams: updatedParams,
      url: newUrl,
    });
  }

  // Sync Headers
  function handleHeaderChange(
    index: number,
    field: "key" | "value",
    value: string,
  ): void {
    if (!activeTab) return;
    const updated = activeTab.headers.map((header, i) =>
      i === index ? { ...header, [field]: value } : header,
    );
    onUpdateTab(activeTab.id, { headers: updated });
  }

  function handleAddHeader(): void {
    if (!activeTab) return;
    onUpdateTab(activeTab.id, {
      headers: [...activeTab.headers, { key: "", value: "" }],
    });
  }

  function handleRemoveHeader(index: number): void {
    if (!activeTab) return;
    const update = activeTab.headers.filter((_, i) => i !== index);
    onUpdateTab(activeTab.id, { headers: update });
  }

  function handlePrettify(): void {
    if (!activeTab || !activeTab.body) return;
    try {
      const obj = JSON.parse(activeTab.body);
      onUpdateTab(activeTab.id, { body: JSON.stringify(obj, null, 2) });
    } catch {
      toast.error("Invalid JSON in body");
    }
  }

  // Auth Handlers
  function handleAuthTypeChange(type: AuthMethod): void {
    if (!activeTab) return;
    const newAuth: AuthConfig = {
      type,
      apiKey:
        type === "api-key"
          ? { key: "", value: "", addTo: "headers" }
          : undefined,
      bearer: type === "bearer" ? { token: "" } : undefined,
      basic: type === "basic" ? { username: "", password: "" } : undefined,
      oauth2: type === "oauth2" ? { accessToken: "" } : undefined,
      jwt: type === "jwt" ? { token: "" } : undefined,
    };
    onUpdateTab(activeTab.id, { auth: newAuth });
  }

  function handleAuthFieldChange(
    field: string,
    value: string | "headers" | "params",
  ): void {
    if (!activeTab || !activeTab.auth) return;

    const updatedAuth = { ...activeTab.auth };

    if (updatedAuth.type === "bearer" && updatedAuth.bearer) {
      updatedAuth.bearer = { ...updatedAuth.bearer, token: value as string };
    } else if (updatedAuth.type === "basic" && updatedAuth.basic) {
      updatedAuth.basic = { ...updatedAuth.basic, [field]: value };
    } else if (updatedAuth.type === "api-key" && updatedAuth.apiKey) {
      updatedAuth.apiKey = { ...updatedAuth.apiKey, [field]: value };
    } else if (updatedAuth.type === "oauth2" && updatedAuth.oauth2) {
      updatedAuth.oauth2 = {
        ...updatedAuth.oauth2,
        accessToken: value as string,
      };
    } else if (updatedAuth.type === "jwt" && updatedAuth.jwt) {
      updatedAuth.jwt = { ...updatedAuth.jwt, token: value as string };
    }

    onUpdateTab(activeTab.id, { auth: updatedAuth });
  }

  const VisibilityToggle = ({
    visible,
    onToggle,
  }: {
    visible: boolean;
    onToggle: () => void;
  }) => (
    <button
      type="button"
      className="password-toggle-btn"
      onClick={onToggle}
      title={visible ? "Hide" : "Show"}
    >
      {visible ? (
        <svg viewBox="0 0 24 24">
          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.82l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.74-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="request-panel">
      {/* URL Row */}
      <div className="request-top-row">
        <button
          className="history-toggle-btn"
          onClick={onToggleHistory}
          title="Toggle history"
        >
          {historyOpen ? "◀ History" : "▶ History"}
        </button>
        <select
          className="method-select"
          value={activeTab?.method ?? "GET"}
          style={{ color: getMethodColor(activeTab?.method ?? "GET") }}
          onChange={(e) => {
            if (!activeTab) return;
            const method = e.target.value as HttpMethod;
            onUpdateTab(activeTab.id, { method });
            if (!BODY_METHODS.includes(method)) {
              if (requestTab === "body") setRequestTab("params");
            }
          }}
        >
          {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
            <option
              key={m}
              value={m}
              style={{ color: getMethodColor(m as HttpMethod) }}
            >
              {m}
            </option>
          ))}
        </select>
        <input
          type="text"
          className="url-input"
          placeholder="https://api.example.com/:resource/:id"
          value={activeTab?.url ?? ""}
          onChange={(e) => {
            if (!activeTab) return;
            const newUrl = e.target.value;
            const newParams = parseParamsFromUrl(newUrl);
            const newPathParams = parsePathParamsFromUrl(
              newUrl,
              activeTab.pathParams || [],
            );

            onUpdateTab(activeTab.id, {
              url: newUrl,
              params: newParams,
              pathParams: newPathParams,
              label:
                activeTab.label === "New Tab" ||
                activeTab.label === activeTab.url
                  ? newUrl
                  : activeTab.label,
            });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSend();
          }}
        />
        <div className="action-buttons">
          <button
            className={`save-endpoint-btn ${isDirty ? "dirty" : ""}`}
            onClick={onSave}
            disabled={!activeTab?.url.trim()}
            title="Save this endpoint (Ctrl+S)"
          >
            {isDirty ? "Save*" : "Saved"}
          </button>
          <button
            className={`send-btn ${isLoading ? "loading" : ""}`}
            onClick={onSend}
            disabled={isLoading || !activeTab?.url.trim()}
            title="Send Request (Ctrl+Enter)"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>

      {/* Request Tabs */}
      <div className="request-tabs">
        <button
          className={`request-tab-btn ${requestTab === "params" ? "active" : ""}`}
          onClick={() => setRequestTab("params")}
        >
          Params
          {(activeTab?.params?.length ?? 0) +
            (activeTab?.pathParams?.length ?? 0) >
            0 && (
            <span style={{ marginLeft: "0.3em", color: "#2F86D8" }}>
              (
              {(activeTab?.params?.length ?? 0) +
                (activeTab?.pathParams?.length ?? 0)}
              )
            </span>
          )}
        </button>
        <button
          className={`request-tab-btn ${requestTab === "auth" ? "active" : ""}`}
          onClick={() => setRequestTab("auth")}
        >
          Auth
        </button>
        <button
          className={`request-tab-btn ${requestTab === "headers" ? "active" : ""}`}
          onClick={() => setRequestTab("headers")}
        >
          Headers
          {(activeTab?.headers.length ?? 0) > 0 && (
            <span style={{ marginLeft: "0.3em", color: "#2F86D8" }}>
              ({activeTab?.headers.length})
            </span>
          )}
        </button>
        {BODY_METHODS.includes(activeTab?.method ?? "ERROR") && (
          <button
            className={`request-tab-btn ${requestTab === "body" ? "active" : ""}`}
            onClick={() => setRequestTab("body")}
          >
            Body
          </button>
        )}
      </div>

      {/* Params Editor */}
      {requestTab === "params" && (
        <div className="headers-editor">
          {/* Query Params Section */}
          <div className="params-section-label">Query Params</div>
          {(activeTab?.params ?? []).map((param, index) => (
            <div key={index} className="header-row">
              <input
                type="text"
                className="header-input"
                placeholder="Key"
                value={param.key}
                onChange={(e) =>
                  handleParamChange(index, "key", e.target.value)
                }
              />
              <input
                type="text"
                className="header-input"
                placeholder="Value"
                value={param.value}
                onChange={(e) =>
                  handleParamChange(index, "value", e.target.value)
                }
              />
              <button
                className="header-remove-btn"
                onClick={() => handleRemoveParam(index)}
                title="Remove param"
              >
                ×
              </button>
            </div>
          ))}
          <button className="add-header-btn" onClick={handleAddParam}>
            + Add Query Param
          </button>

          {/* Path Variables Section */}
          <div className="params-section-label" style={{ marginTop: "1.5em" }}>
            Path Variables
          </div>
          {(activeTab?.pathParams ?? []).map((param, index) => (
            <div key={`path-${index}`} className="header-row">
              <input
                type="text"
                className="header-input"
                placeholder="Key (e.g. id)"
                value={param.key}
                onChange={(e) =>
                  handlePathParamChange(index, "key", e.target.value)
                }
              />
              <input
                type="text"
                className="header-input"
                placeholder="Value"
                value={param.value}
                onChange={(e) =>
                  handlePathParamChange(index, "value", e.target.value)
                }
              />
              <button
                className="header-remove-btn"
                onClick={() => handleRemovePathParam(index)}
                title="Remove path variable"
              >
                ×
              </button>
            </div>
          ))}
          <button className="add-header-btn" onClick={handleAddPathParam}>
            + Add Path Variable
          </button>
        </div>
      )}

      {/* Headers Editor */}
      {requestTab === "headers" && (
        <div className="headers-editor">
          {(activeTab?.headers ?? []).map((header, index) => (
            <div key={index} className="header-row">
              <input
                type="text"
                className="header-input"
                placeholder="Key"
                value={header.key}
                onChange={(e) =>
                  handleHeaderChange(index, "key", e.target.value)
                }
              />
              <input
                type="text"
                className="header-input"
                placeholder="Value"
                value={header.value}
                onChange={(e) =>
                  handleHeaderChange(index, "value", e.target.value)
                }
              />
              <button
                className="header-remove-btn"
                onClick={() => handleRemoveHeader(index)}
                title="Remove header"
              >
                ×
              </button>
            </div>
          ))}
          <button className="add-header-btn" onClick={handleAddHeader}>
            + Add Header
          </button>
        </div>
      )}

      {/* Body Editor */}
      {requestTab === "body" &&
        BODY_METHODS.includes(activeTab?.method ?? "ERROR") && (
          <div className="body-editor-container">
            <div className="body-editor-toolbar">
              <button className="toolbar-btn" onClick={handlePrettify}>
                Prettify JSON
              </button>
            </div>
            <Editor
              placeholder='{"key": "value"}'
              value={activeTab?.body ?? ""}
              onChange={(val) => {
                if (!activeTab) return;
                onUpdateTab(activeTab.id, { body: val });
              }}
            />
          </div>
        )}

      {/* Auth Editor */}
      {requestTab === "auth" && (
        <div className="auth-editor">
          <div className="auth-type-selector">
            <label>Auth Type:</label>
            <select
              value={activeTab?.auth?.type || "no-auth"}
              onChange={(e) =>
                handleAuthTypeChange(e.target.value as AuthMethod)
              }
            >
              <option value="no-auth">No Auth</option>
              <option value="bearer">Bearer Token</option>
              <option value="jwt">JWT Bearer</option>
              <option value="oauth2">OAuth 2.0</option>
              <option value="basic">Basic Auth</option>
              <option value="api-key">API Key</option>
            </select>
          </div>

          <div className="auth-fields">
            {activeTab?.auth?.type === "bearer" && (
              <div className="auth-row">
                <div className="password-input-container">
                  <input
                    type={showToken ? "text" : "password"}
                    className="header-input"
                    placeholder="Token"
                    value={activeTab.auth.bearer?.token || ""}
                    onChange={(e) =>
                      handleAuthFieldChange("token", e.target.value)
                    }
                  />
                  <VisibilityToggle
                    visible={showToken}
                    onToggle={() => setShowToken(!showToken)}
                  />
                </div>
              </div>
            )}

            {activeTab?.auth?.type === "jwt" && (
              <div className="auth-row">
                <div className="password-input-container">
                  <input
                    type={showJWT ? "text" : "password"}
                    className="header-input"
                    placeholder="JWT Token"
                    value={activeTab.auth.jwt?.token || ""}
                    onChange={(e) =>
                      handleAuthFieldChange("token", e.target.value)
                    }
                  />
                  <VisibilityToggle
                    visible={showJWT}
                    onToggle={() => setShowJWT(!showJWT)}
                  />
                </div>
              </div>
            )}

            {activeTab?.auth?.type === "oauth2" && (
              <div className="auth-row">
                <div className="password-input-container">
                  <input
                    type={showOAuth ? "text" : "password"}
                    className="header-input"
                    placeholder="Access Token"
                    value={activeTab.auth.oauth2?.accessToken || ""}
                    onChange={(e) =>
                      handleAuthFieldChange("accessToken", e.target.value)
                    }
                  />
                  <VisibilityToggle
                    visible={showOAuth}
                    onToggle={() => setShowOAuth(!showOAuth)}
                  />
                </div>
              </div>
            )}

            {activeTab?.auth?.type === "basic" && (
              <div className="auth-row">
                <input
                  type="text"
                  className="header-input"
                  placeholder="Username"
                  value={activeTab.auth.basic?.username || ""}
                  onChange={(e) =>
                    handleAuthFieldChange("username", e.target.value)
                  }
                />
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="header-input"
                    placeholder="Password"
                    value={activeTab.auth.basic?.password || ""}
                    onChange={(e) =>
                      handleAuthFieldChange("password", e.target.value)
                    }
                  />
                  <VisibilityToggle
                    visible={showPassword}
                    onToggle={() => setShowPassword(!showPassword)}
                  />
                </div>
              </div>
            )}

            {activeTab?.auth?.type === "api-key" && (
              <div className="auth-row">
                <input
                  type="text"
                  className="header-input"
                  placeholder="Key"
                  value={activeTab.auth.apiKey?.key || ""}
                  onChange={(e) => handleAuthFieldChange("key", e.target.value)}
                />
                <input
                  type="text"
                  className="header-input"
                  placeholder="Value"
                  value={activeTab.auth.apiKey?.value || ""}
                  onChange={(e) =>
                    handleAuthFieldChange("value", e.target.value)
                  }
                />
                <select
                  className="header-input"
                  value={activeTab.auth.apiKey?.addTo || "headers"}
                  onChange={(e) =>
                    handleAuthFieldChange(
                      "addTo",
                      e.target.value as "headers" | "params",
                    )
                  }
                >
                  <option value="headers">Header</option>
                  <option value="params">Query Param</option>
                </select>
              </div>
            )}

            {activeTab?.auth?.type === "no-auth" && (
              <p className="auth-empty-msg">
                This request does not use any authentication.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
