import { toast } from 'sonner';
import { getMethodColor } from '../../../utils/storage';
import './TabBar.css';
import { type Tab } from '../../../utils/storage';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onTabSwitch: (id: string) => void;
  onCloseTab: (id: string) => void;
  onCreateTab: () => void;
}

export default function TabBar({
  tabs,
  activeTabId,
  onTabSwitch,
  onCloseTab,
  onCreateTab,
}: TabBarProps) {
  
  function tabHasContent(tab: Tab): boolean {
    return (
      tab.url.trim() !== '' ||
      tab.body.trim() !== '' ||
      tab.headers.some(h => h.key.trim() !== '')
    );
  }

  function handleCloseTab(id: string, e: React.MouseEvent<HTMLButtonElement>): void {
    e.stopPropagation();
    const tab = tabs.find(t => t.id === id);
    if (!tab) return;

    if (tabHasContent(tab)) {
      toast.warning('Discard unsaved changes?', {
        description: 'This tab has unsaved content. Are you sure you want to close it?',
        action: {
          label: 'Close Tab',
          onClick: () => onCloseTab(id),
        },
      });
    } else {
      onCloseTab(id);
    }
  }

  return (
    <div className='tab-bar'>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab-item ${tab.id === activeTabId ? 'active' : ''}`}
          onClick={() => onTabSwitch(tab.id)}
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
            onClick={(event) => handleCloseTab(tab.id, event)}
            title='Close Tab'
          >
            ×
          </button>
        </div>
      ))}
      <button className='tab-add' onClick={onCreateTab} title='New Tab'>
        +
      </button>
    </div>
  );
}
