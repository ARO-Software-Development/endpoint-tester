import { useEffect, useState } from "react";
import { type RequestResponse } from "../../../utils/storage";
import Editor from "../Editor/Editor";
import "./ResponsePanel.css";
import { toast } from "sonner";

interface ResponsePanelProps {
  response: RequestResponse | null;
  isLoading: boolean;
  getStatusCategory: (status: number) => string;
}

export default function ResponsePanel({
  response,
  isLoading,
  getStatusCategory,
}: ResponsePanelProps) {
  const [prettyPrint, setPrettyPrint] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [responseTab, setResponseTab] = useState<"body" | "headers">("body");

  useEffect(() => {
    setPrettyPrint(true);
    setResponseTab("body");
  }, [response]);

  async function handleCopyResponse(): Promise<void> {
    if (!response?.data) {
      toast.error("No response data to copy!");
      return;
    }
    const text =
      typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data, null, 2);

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Response copied to clipboard!");
  }

  function formatSize(bytes?: number): string {
    if (bytes === undefined || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  const responseBody = response?.data
    ? typeof response.data === "string"
      ? response.data
      : prettyPrint
        ? JSON.stringify(response.data, null, 2)
        : JSON.stringify(response.data)
    : "";

  return (
    <div className="response-panel">
      {!response && !isLoading && (
        <div className="response-empty">
          Send a request to see the response.
        </div>
      )}

      {isLoading && <div className="response-empty">Sending request...</div>}

      {response && !isLoading && (
        <>
          <div className="response-meta">
            <span
              className={`status-badge ${getStatusCategory(response.status)}`}
            >
              {response.status === 0
                ? "Network Error"
                : `${response.status} ${response.statusText}`}
            </span>
            <span className="response-time">{Math.round(response.responseTime)} ms</span>
            <span className="response-size">{formatSize(response.size)}</span>
            
            <div className="response-tabs-mini">
              <button 
                className={`mini-tab ${responseTab === 'body' ? 'active' : ''}`}
                onClick={() => setResponseTab('body')}
              >
                Body
              </button>
              <button 
                className={`mini-tab ${responseTab === 'headers' ? 'active' : ''}`}
                onClick={() => setResponseTab('headers')}
              >
                Headers
              </button>
            </div>

            {!response.isError && responseTab === 'body' && (
              <>
                {typeof response.data !== "string" && (
              <button
                className="pretty-toggle"
                onClick={() => setPrettyPrint((prev) => !prev)}
              >
                {prettyPrint ? "Raw" : "Pretty"}
              </button>
            )}
            <button
              className="pretty-toggle"
              onClick={handleCopyResponse}
              style={{
                marginLeft: typeof response.data === "string" ? "auto" : "0",
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
              </>
            )}
          </div>

          {response.isError ? (
            <div className="response-body">
              <span className="response-error">{response.errorMessage}</span>
            </div>
          ) : responseTab === 'body' ? (
            <div className="response-body-editor">
              <Editor
                value={responseBody}
                readOnly={true}
              />
            </div>
          ) : (
            <div className="response-headers-list">
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} className="response-header-item">
                  <span className="header-key">{key}:</span>
                  <span className="header-value">{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
