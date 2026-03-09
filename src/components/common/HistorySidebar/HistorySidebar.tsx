import { useState } from 'react';
import { type HistoryEntry, type SavedEndpoint, getMethodColor } from '../../../utils/storage';
import './HistorySidebar.css';

interface HistorySidebarProps {
  isOpen: boolean;
  entries: HistoryEntry[];
  savedEntries: SavedEndpoint[];
  onClear: () => void;
  onReplay: (id: string) => void;
  onReplaySaved: (endpoint: SavedEndpoint) => void;
  onDelete: (id: string) => void;
  onDeleteSaved: (id: string) => void;
  getStatusCategory: (status: number) => string;
  formatTimestamp: (timestamp: string) => string;
  onToggle: () => void;
}

export default function HistorySidebar({
  isOpen,
  entries,
  savedEntries,
  onClear,
  onReplay,
  onReplaySaved,
  onDelete,
  onDeleteSaved,
  getStatusCategory,
  formatTimestamp,
  onToggle,
}: HistorySidebarProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'saved'>('history');

  return (
    <div 
      className={`history-sidebar ${isOpen ? 'expanded' : 'shrunk'}`}
      onClick={!isOpen ? onToggle : undefined}
    >
      <div className='history-sidebar-content'>
        <div className='history-sidebar-header'>
          <div className='sidebar-tabs'>
            <button 
              className={`sidebar-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setActiveTab('history'); }}
            >
              History
            </button>
            <button 
              className={`sidebar-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setActiveTab('saved'); }}
            >
              Saved
            </button>
          </div>
          <div className='header-actions'>
            {activeTab === 'history' && (
              <button
                className='history-clear-btn'
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                title='Clear All History'
              >
                Clear
              </button>
            )}
            <button 
              className='history-toggle-collapse' 
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
            >
              {isOpen ? '◀' : '▶'}
            </button>
          </div>
        </div>

        <div className='history-list'>
          {activeTab === 'history' ? (
            entries.length === 0 ? (
              <p className='history-empty'>No history yet.</p>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className='history-entry'
                  onClick={(e) => {
                    e.stopPropagation();
                    onReplay(entry.id);
                  }}
                  title='Click to replay'
                >
                  <span
                    className='tab-method-badge'
                    style={{ color: getMethodColor(entry.method) }}
                  >
                    {entry.method}
                  </span>
                  <div className='history-entry-info'>
                    <div className='history-entry-url'>{entry.url}</div>
                    <div className='history-entry-meta'>
                      <span className={`status-badge ${getStatusCategory(entry.responseStatus)}`}>
                        {entry.responseStatus || 'ERR'}
                      </span>
                      <span>{entry.responseTime}ms</span>
                    </div>
                  </div>
                  <button
                    className='history-delete-btn'
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(entry.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )
          ) : (
            savedEntries.length === 0 ? (
              <p className='history-empty'>No saved endpoints yet.</p>
            ) : (
              savedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className='history-entry'
                  onClick={(e) => {
                    e.stopPropagation();
                    onReplaySaved(entry);
                  }}
                  title='Click to load'
                >
                  <span
                    className='tab-method-badge'
                    style={{ color: getMethodColor(entry.method) }}
                  >
                    {entry.method}
                  </span>
                  <div className='history-entry-info'>
                    <div className='history-entry-name'>{entry.name}</div>
                    <div className='history-entry-url small'>{entry.url}</div>
                  </div>
                  <button
                    className='history-delete-btn'
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteSaved(entry.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )
          )}
        </div>
      </div>
      
      {!isOpen && (
        <div className='history-shrunk-label'>
          <span>{activeTab.toUpperCase()}</span>
        </div>
      )}
    </div>
  );
}
