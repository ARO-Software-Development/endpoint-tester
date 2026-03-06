import { useState } from 'react';
import { type HttpMethod, getMethodColor } from '../../utils/storage';
import { useTabs, useHistory, useRequest } from '../../hooks';
import './Tester.css';

export default function Tester() {
  const {
    tabs,
    activeTabId,
    setActiveTabId,
    createTab,
    closeTab,
    updateTab,
    getActiveTab,
  } = useTabs();
  const {
    history,
    addEntry,
    clearHistory,
    deleteEntry,
    replayRequest,
    getHistoryByTab,
    formatTimestamp,
    getStatusCategory,
  } = useHistory();
  const { response, isLoading, executeRequest, clearResponse } = useRequest();
  const [requestTab, setRequestTab] = useState<'headers' | 'body'>('headers');
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const activeTab = getActiveTab();
  const tabHistory = activeTab ? getHistoryByTab(activeTab.id) : [];
  const BODY_METHODS = ['POST', 'PUT', 'PATCH'] as HttpMethod[];

  function handleSend(): void {
    if (!activeTab || !activeTab.url.trim()) return;
    executeRequest(
      activeTab.id,
      activeTab.method,
      activeTab.url,
      activeTab.headers,
      activeTab.body,
      addEntry,
    );
  }

  function handleTabSwitch(id: string): void {
    setActiveTabId(id);
    clearResponse();
  }

  function handleReplay(tabId: string): void {
    const entry = history.find((tab) => tab.id === tabId);
    if (!entry) return;

    const targetTab = tabs.find((t) => t.id === entry.tabId);
    if (targetTab) {
      replayRequest(entry, updateTab);
      setActiveTabId(entry.tabId);
      clearResponse();
    } else {
      createTab();
      replayRequest({ ...entry, tabId: activeTabId }, updateTab);
      clearResponse();
    }
  }

  function handleAddHeader(): void {
    if (!activeTab) return;
    updateTab(activeTab.id, {
      headers: [...activeTab.headers, { key: '', value: '' }],
    });
  }

  function handleRemoveHeader(index: number): void {
    if (!activeTab) return;
    const update = activeTab.headers.filter((_, i) => i !== index);
    updateTab(activeTab.id, { headers: update });
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
    updateTab(activeTab.id, { headers: updated });
  }

  function handleClearHistory(): void {
    if (window.confirm('Clear all history? This cannot be undone.')) {
      clearHistory();
    }
  }

  return (
    <div className='tester-container'>
      {/* Tab Bar */}
      <div className='tab-bar'>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab-item ${tab.id === activeTabId ? 'active' : ''}`}
            onClick={() => handleTabSwitch(tab.id)}
          >
            <span
              className='tab-method-badge'
              style={{ color: getMethodColor(tab.method) }}
            >
              {tab.method}
            </span>
            <span className='tab-label' title={tab.url || tab.label}>
              {tab.url.trim() !== '' ? tab.url : tab.label}
            </span>
            <button
              className='tab-close'
              onClick={(event) => {
                event.stopPropagation();
                closeTab(tab.id);
              }}
              title='Close Tab'
            >
              ×
            </button>
          </div>
        ))}
        <button className='tab-add' onClick={createTab} title='New Tab'>
          +
        </button>
      </div>
      {/* WorkSpace */}
      <div className='tester-workspace'>
        {/* History Sidebar */}
        <div className={`history-sidebar ${historyOpen ? '' : 'collapsed'}`}>
          <div className='history-sidebar-header'>
            <h3>History</h3>
            <button
              className='history-clear-btn'
              onClick={handleClearHistory}
              title='Clear All History'
            >
              Clear All
            </button>
          </div>
          <div className='history-list'>
            {tabHistory.length === 0 ? (
              <p className='history-empty'>No history for this tab yet.</p>
            ) : (
              tabHistory.map((entry) => (
                <div
                  key={entry.id}
                  className='history-entry'
                  onClick={() => handleReplay(entry.id)}
                  title='Click to replay this request'
                >
                  <span
                    className='tab-method-badge'
                    style={{
                      color: getMethodColor(entry.method),
                      fontSize: '0.7rem',
                    }}
                  >
                    {entry.method}
                  </span>
                  <div className='history-entry-info'>
                    <div className='history-entry-url'>{entry.url}</div>
                    <div className='history-entry-meta'>
                      <span
                        className={`status-badge ${getStatusCategory(entry.responseStatus)}`}
                        style={{ fontSize: '0.65rem', padding: '0.05em 0.3em' }}
                      >
                        {entry.responseStatus === 0
                          ? 'ERROR'
                          : entry.responseStatus}
                      </span>
                      {' · '}
                      {entry.responseTime}ms
                      {' · '}
                      {formatTimestamp(entry.timestamp)}
                    </div>
                  </div>
                  <button
                    className='history-delete-btn'
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteEntry(entry.id);
                    }}
                    title='Remove Entry'
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Main Panel */}
        <div className='tester-main'>
          {/* Request Panel */}
          <div className='request-panel'>
            {/* URL Row */}
            <div className='request-top-row'>
              <button
                className='history-toggle-button'
                onClick={() => setHistoryOpen((prev) => !prev)}
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
                  updateTab(activeTab.id, { method: e.target.value as HttpMethod });
                  if (!BODY_METHODS.includes(e.target.value as HttpMethod)) {
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
                placeholder='https://api.example.com/endpoint'
                value={activeTab?.url ?? ''}
                onChange={e => {
                  if (!activeTab) return
                  updateTab(activeTab.id, { url: e.target.value })
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSend()
                }}
              />
              <button
                className={`send-btn ${isLoading ? 'loading' : ''}`}
                onClick={handleSend}
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
                      onChange={e => handleHeaderChange(index, 'key', e.target.value)}
                    />
                    <input
                      type='text'
                      className='header-input'
                      placeholder='Value'
                      value={header.value}
                      onChange={e => handleHeaderChange(index, 'value', e.target.value)}
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
                onChange={e => {
                  if (!activeTab) return
                  updateTab(activeTab.id, { body: e.target.value })
                }}
              />
            )}
          </div>

          {/* ── Response panel ──────────────────────────── */}
          <div className='response-panel'>
            {!response && !isLoading && (
              <div className='response-empty'>
                Send a request to see the response.
              </div>
            )}

            {isLoading && (
              <div className='response-empty'>Sending request...</div>
            )}

            {response && !isLoading && (
              <>
                <div className='response-meta'>
                  <span className={`status-badge ${getStatusCategory(response.status)}`}>
                    {response.status === 0 ? 'Network Error' : `${response.status} ${response.statusText}`}
                  </span>
                  <span className='response-time'>
                    {response.responseTime}ms
                  </span>
                </div>

                {response.isError ? (
                  <div className='response-body'>
                    <span className='response-error'>
                      {response.errorMessage}
                    </span>
                  </div>
                ) : (
                  <div className='response-body'>
                    {typeof response.data === 'string'
                      ? response.data
                      : JSON.stringify(response.data, null, 2)
                    }
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
