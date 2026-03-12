import { useEffect, useState } from 'react';
import { type HttpMethod, getMethodColor, type Tab } from '../../../utils/storage';
import { parseParamsFromUrl, stringifyParamsToUrl, parsePathParamsFromUrl } from '../../../utils/url';
import Editor from '../Editor/Editor';
import './RequestPanel.css';
import { toast } from 'sonner';

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
  const [requestTab, setRequestTab] = useState<'params' | 'headers' | 'body'>('params');
  const BODY_METHODS = ['POST', 'PUT', 'PATCH'] as HttpMethod[];

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        onSend()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab, isLoading, onSend, onSave]);

  // Sync Params -> URL
  function handleParamChange(index: number, field: 'key' | 'value', value: string): void {
    if (!activeTab) return;
    const updatedParams = [...(activeTab.params || [])];
    updatedParams[index] = { ...updatedParams[index], [field]: value };
    
    const newUrl = stringifyParamsToUrl(activeTab.url, updatedParams);
    onUpdateTab(activeTab.id, { 
      params: updatedParams,
      url: newUrl 
    });
  }

  function handleAddParam(): void {
    if (!activeTab) return;
    onUpdateTab(activeTab.id, {
      params: [...(activeTab.params || []), { key: '', value: '' }],
    });
  }

  function handleRemoveParam(index: number): void {
    if (!activeTab) return;
    const updatedParams = (activeTab.params || []).filter((_, i) => i !== index);
    const newUrl = stringifyParamsToUrl(activeTab.url, updatedParams);
    onUpdateTab(activeTab.id, { 
      params: updatedParams,
      url: newUrl 
    });
  }

  // Sync Path Params -> URL
  function handlePathParamChange(index: number, field: 'key' | 'value', value: string): void {
    if (!activeTab) return;
    const oldParams = activeTab.pathParams || [];
    const oldKey = oldParams[index].key;
    const updatedParams = [...oldParams];
    updatedParams[index] = { ...updatedParams[index], [field]: value };
    
    let newUrl = activeTab.url;
    if (field === 'key' && oldKey !== value) {
        // Update the URL to reflect the new key name: replace :oldKey with :value
        const regex = new RegExp(`:${oldKey}(?=/|\\?|$)`, 'g');
        newUrl = activeTab.url.replace(regex, `:${value}`);
    }

    onUpdateTab(activeTab.id, { 
      pathParams: updatedParams,
      url: newUrl 
    });
  }

  function handleAddPathParam(): void {
    if (!activeTab) return;
    const [baseUrl, queryString] = activeTab.url.split('?');
    const newBaseUrl = baseUrl.endsWith('/') ? `${baseUrl}:key` : `${baseUrl}/:key`;
    const newUrl = queryString ? `${newBaseUrl}?${queryString}` : newBaseUrl;
    
    onUpdateTab(activeTab.id, {
      url: newUrl,
      pathParams: [...(activeTab.pathParams || []), { key: 'key', value: '' }],
    });
  }

  function handleRemovePathParam(index: number): void {
    if (!activeTab) return;
    const oldKey = (activeTab.pathParams || [])[index].key;
    const updatedParams = (activeTab.pathParams || []).filter((_, i) => i !== index);
    
    // Remove :key from URL (and the preceding slash if possible)
    const regex = new RegExp(`/:${oldKey}(?=/|\\?|$)`, 'g');
    let newUrl = activeTab.url.replace(regex, '');
    
    onUpdateTab(activeTab.id, { 
      pathParams: updatedParams,
      url: newUrl 
    });
  }

  // Sync Headers
  function handleHeaderChange(index: number, field: 'key' | 'value', value: string): void {
    if (!activeTab) return;
    const updated = activeTab.headers.map((header, i) =>
      i === index ? { ...header, [field]: value } : header,
    );
    onUpdateTab(activeTab.id, { headers: updated });
  }

  function handleAddHeader(): void {
    if (!activeTab) return;
    onUpdateTab(activeTab.id, {
      headers: [...activeTab.headers, { key: '', value: '' }],
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
      toast.error('Invalid JSON in body');
    }
  }

  return (
    <div className='request-panel'>
      {/* URL Row */}
      <div className='request-top-row'>
        <button
          className='history-toggle-btn'
          onClick={onToggleHistory}
          title='Toggle history'
        >
          {historyOpen ? '◀ History' : '▶ History'}
        </button>
        <select
          className='method-select'
          value={activeTab?.method ?? 'GET'}
          style={{ color: getMethodColor(activeTab?.method ?? 'GET') }}
          onChange={(e) => {
            if (!activeTab) return;
            const method = e.target.value as HttpMethod;
            onUpdateTab(activeTab.id, { method });
            if (!BODY_METHODS.includes(method)) {
              if (requestTab === 'body') setRequestTab('params');
            }
          }}
        >
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
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
          type='text'
          className='url-input'
          placeholder='https://api.example.com/:resource/:id'
          value={activeTab?.url ?? ''}
          onChange={(e) => {
            if (!activeTab) return;
            const newUrl = e.target.value;
            const newParams = parseParamsFromUrl(newUrl);
            const newPathParams = parsePathParamsFromUrl(newUrl, activeTab.pathParams || []);
            
            onUpdateTab(activeTab.id, { 
              url: newUrl,
              params: newParams,
              pathParams: newPathParams,
              label: (activeTab.label === 'New Tab' || activeTab.label === activeTab.url) ? newUrl : activeTab.label
            });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSend();
          }}
        />
        <div className="action-buttons">
          <button
            className={`save-endpoint-btn ${isDirty ? 'dirty' : ''}`}
            onClick={onSave}
            disabled={!activeTab?.url.trim()}
            title="Save this endpoint (Ctrl+S)"
          >
            {isDirty ? 'Save*' : 'Saved'}
          </button>
          <button
            className={`send-btn ${isLoading ? 'loading' : ''}`}
            onClick={onSend}
            disabled={isLoading || !activeTab?.url.trim()}
            title='Send Request (Ctrl+Enter)'
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>

      {/* Request Tabs */}
      <div className='request-tabs'>
        <button
          className={`request-tab-btn ${requestTab === 'params' ? 'active' : ''}`}
          onClick={() => setRequestTab('params')}
        >
          Params
          {((activeTab?.params?.length ?? 0) + (activeTab?.pathParams?.length ?? 0)) > 0 && (
            <span style={{ marginLeft: '0.3em', color: '#2F86D8' }}>
              ({(activeTab?.params?.length ?? 0) + (activeTab?.pathParams?.length ?? 0)})
            </span>
          )}
        </button>
        <button
          className={`request-tab-btn ${requestTab === 'headers' ? 'active' : ''}`}
          onClick={() => setRequestTab('headers')}
        >
          Headers
          {(activeTab?.headers.length ?? 0) > 0 && (
            <span style={{ marginLeft: '0.3em', color: '#2F86D8' }}>
              ({activeTab?.headers.length})
            </span>
          )}
        </button>
        {BODY_METHODS.includes(activeTab?.method ?? 'ERROR') && (
          <button
            className={`request-tab-btn ${requestTab === 'body' ? 'active' : ''}`}
            onClick={() => setRequestTab('body')}
          >
            Body
          </button>
        )}
      </div>

      {/* Params Editor */}
      {requestTab === 'params' && (
        <div className='headers-editor'>
          {/* Query Params Section */}
          <div className="params-section-label">Query Params</div>
          {(activeTab?.params ?? []).map((param, index) => (
            <div key={index} className='header-row'>
              <input
                type='text'
                className='header-input'
                placeholder='Key'
                value={param.key}
                onChange={(e) => handleParamChange(index, 'key', e.target.value)}
              />
              <input
                type='text'
                className='header-input'
                placeholder='Value'
                value={param.value}
                onChange={(e) => handleParamChange(index, 'value', e.target.value)}
              />
              <button
                className='header-remove-btn'
                onClick={() => handleRemoveParam(index)}
                title='Remove param'
              >
                ×
              </button>
            </div>
          ))}
          <button className='add-header-btn' onClick={handleAddParam}>
            + Add Query Param
          </button>

          {/* Path Variables Section */}
          <div className="params-section-label" style={{ marginTop: '1.5em' }}>Path Variables</div>
          {(activeTab?.pathParams ?? []).map((param, index) => (
            <div key={`path-${index}`} className='header-row'>
              <input
                type='text'
                className='header-input'
                placeholder='Key (e.g. id)'
                value={param.key}
                onChange={(e) => handlePathParamChange(index, 'key', e.target.value)}
              />
              <input
                type='text'
                className='header-input'
                placeholder='Value'
                value={param.value}
                onChange={(e) => handlePathParamChange(index, 'value', e.target.value)}
              />
              <button
                className='header-remove-btn'
                onClick={() => handleRemovePathParam(index)}
                title='Remove path variable'
              >
                ×
              </button>
            </div>
          ))}
          <button className='add-header-btn' onClick={handleAddPathParam}>
            + Add Path Variable
          </button>
        </div>
      )}

      {/* Headers Editor */}
      {requestTab === 'headers' && (
        <div className='headers-editor'>
          {(activeTab?.headers ?? []).map((header, index) => (
            <div key={index} className='header-row'>
              <input
                type='text'
                className='header-input'
                placeholder='Key'
                value={header.key}
                onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
              />
              <input
                type='text'
                className='header-input'
                placeholder='Value'
                value={header.value}
                onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
              />
              <button
                className='header-remove-btn'
                onClick={() => handleRemoveHeader(index)}
                title='Remove header'
              >
                ×
              </button>
            </div>
          ))}
          <button className='add-header-btn' onClick={handleAddHeader}>
            + Add Header
          </button>
        </div>
      )}

      {/* Body Editor */}
      {requestTab === 'body' && BODY_METHODS.includes(activeTab?.method ?? 'ERROR') && (
        <div className="body-editor-container">
          <div className="body-editor-toolbar">
            <button className="toolbar-btn" onClick={handlePrettify}>Prettify JSON</button>
          </div>
          <Editor
            placeholder='{"key": "value"}'
            value={activeTab?.body ?? ''}
            onChange={(val) => {
              if (!activeTab) return;
              onUpdateTab(activeTab.id, { body: val });
            }}
          />
        </div>
      )}
    </div>
  );
}
