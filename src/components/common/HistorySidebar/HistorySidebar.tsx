import { type HistoryEntry, getMethodColor } from '../../../utils/storage';
import './HistorySidebar.css';

interface HistorySidebarProps {
  isOpen: boolean;
  entries: HistoryEntry[];
  onClear: () => void;
  onReplay: (id: string) => void;
  onDelete: (id: string) => void;
  getStatusCategory: (status: number) => string;
  formatTimestamp: (timestamp: string) => string;
  onToggle: () => void;
}

export default function HistorySidebar({
  isOpen,
  entries,
  onClear,
  onReplay,
  onDelete,
  getStatusCategory,
  formatTimestamp,
  onToggle,
}: HistorySidebarProps) {
  return (
    <div 
      className={`history-sidebar ${isOpen ? 'expanded' : 'shrunk'}`}
      onClick={!isOpen ? onToggle : undefined}
    >
      <div className='history-sidebar-content'>
        <div className='history-sidebar-header'>
          <h3>History</h3>
          <div className='header-actions'>
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
          {entries.length === 0 ? (
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
          )}
        </div>
      </div>
      
      {!isOpen && (
        <div className='history-shrunk-label'>
          <span>HISTORY</span>
        </div>
      )}
    </div>
  );
}
