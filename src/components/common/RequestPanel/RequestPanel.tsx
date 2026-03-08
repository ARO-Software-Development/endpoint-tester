import { useState } from 'react';
import { type HttpMethod, getMethodColor, type Tab } from '../../../utils/storage';
import './RequestPanel.css';

interface RequestPanelProps {
  activeTab: Tab | undefined;
  onUpdateTab: (id: string, changes: Partial<Tab>) => void;
  onSend: () => void;
  isLoading: boolean;
  onToggleHistory: () => void;
  historyOpen: boolean;
}

export default function RequestPanel({
  activeTab,
  onUpdateTab,
  onSend,
  isLoading,
  onToggleHistory,
  historyOpen,
}: RequestPanelProps) {
  const [requestTab, setRequestTab] = useState<'headers' | 'body'>('headers');
  const BODY_METHODS = ['POST', 'PUT', 'PATCH'] as HttpMethod[];

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

  function handleHeaderChange(
    index: number,
    field: 'key' | 'value',
    value: string,
  ): void {
    if (!activeTab) return;
    const updated = activeTab.headers.map((header, i) =>
      i === index ? { ...header, [field]: value } : header,
    );
    onUpdateTab(activeTab.id, { headers: updated });
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
              setRequestTab('headers');
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
          placeholder='https://api.example.com/prefix/endpoint'
          value={activeTab?.url ?? ''}
          onChange={(e) => {
            if (!activeTab) return;
            onUpdateTab(activeTab.id, { url: e.target.value });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSend();
          }}
        />
        <button
          className={`send-btn ${isLoading ? 'loading' : ''}`}
          onClick={onSend}
          disabled={isLoading || !activeTab?.url.trim()}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
      {/* Headers / Body inner tabs */}
      <div className='request-tabs'>
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

      {/* Headers editor */}
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

      {/* Body editor */}
      {requestTab === 'body' && BODY_METHODS.includes(activeTab?.method ?? 'ERROR') && (
        <textarea
          className='body-editor'
          placeholder='{"key": "value"}'
          value={activeTab?.body ?? ''}
          onChange={(e) => {
            if (!activeTab) return;
            onUpdateTab(activeTab.id, { body: e.target.value });
          }}
        />
      )}
    </div>
  );
}
