import { type HttpMethod, getMethodColor } from '../../../utils/storage';
import './TabBar.css';

interface Tab {
  id: string;
  label: string;
  method: HttpMethod;
  url: string;
}

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
            onClick={(event) => {
              event.stopPropagation();
              onCloseTab(tab.id);
            }}
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
