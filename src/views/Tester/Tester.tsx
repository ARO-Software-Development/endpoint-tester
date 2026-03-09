import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTabs, useHistory, useRequest, useSavedEndpoints } from '../../hooks';
import TabBar from '../../components/common/TabBar/TabBar';
import HistorySidebar from '../../components/common/HistorySidebar/HistorySidebar';
import RequestPanel from '../../components/common/RequestPanel/RequestPanel';
import ResponsePanel from '../../components/common/ResponsePanel/ResponsePanel';
import './Tester.css';
import { isStorageAvailable, generateId, type SavedEndpoint } from '../../utils/storage';

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

  const {
    savedEndpoints,
    saveEndpoint,
    deleteSavedEndpoint,
  } = useSavedEndpoints();
  
  const { response, isLoading, executeRequest, clearResponse } = useRequest();
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  
  const activeTab = getActiveTab();
  const tabHistory = activeTab ? getHistoryByTab(activeTab.id) : [];

  function validateUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  useEffect(() => {
    if (!isStorageAvailable()) {
      toast.error('Storage is unavailable in this browser. History and tabs will not persist across reloads');
    }
  }, []);

  function handleSend(): void {
    if (!activeTab || !activeTab.url.trim()) return;
    
    if (!validateUrl(activeTab.url.trim())) {
      toast.error('Invalid URL', {
        description: 'Please enter a valid URL (must start with http:// or https://)',
      });
      return;
    }

    executeRequest(
      activeTab.id,
      activeTab.method,
      activeTab.url,
      activeTab.headers,
      activeTab.body,
      addEntry,
    );
  }

  function handleSaveEndpoint(): void {
    if (!activeTab || !activeTab.url.trim()) return;

    const newSaved: SavedEndpoint = {
      id: generateId(),
      name: activeTab.label || 'Saved Endpoint',
      method: activeTab.method,
      url: activeTab.url,
      params: activeTab.params || [],
      headers: activeTab.headers,
      body: activeTab.body,
    };

    saveEndpoint(newSaved);
    toast.success('Endpoint saved successfully');
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

  function handleReplaySaved(endpoint: SavedEndpoint): void {
    if (activeTab) {
      updateTab(activeTab.id, {
        method: endpoint.method,
        url: endpoint.url,
        params: endpoint.params || [],
        headers: endpoint.headers,
        body: endpoint.body,
        label: endpoint.name,
      });
    } else {
      createTab();
      // After creating a tab, the activeTabId changes but we don't have the new ID immediately in this scope easily.
      // useTabs handles setting activeTabId.
    }
    toast.info(`Loaded: ${endpoint.name}`);
  }

  function handleClearHistory(): void {
    toast.warning('Are you sure you want to clear all history?', {
      description: 'This action cannot be undone.',
      action: {
        label: 'Clear',
        onClick: () => {
          clearHistory();
          toast.success('History cleared successfully');
        },
      },
    });
  }

  return (
    <div className='tester-container'>
      <HistorySidebar
        isOpen={historyOpen}
        entries={tabHistory}
        savedEntries={savedEndpoints}
        onClear={handleClearHistory}
        onReplay={handleReplay}
        onReplaySaved={handleReplaySaved}
        onDelete={deleteEntry}
        onDeleteSaved={deleteSavedEndpoint}
        getStatusCategory={getStatusCategory}
        formatTimestamp={formatTimestamp}
        onToggle={() => setHistoryOpen(prev => !prev)}
      />
      
      <div className='tester-content'>
        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onTabSwitch={handleTabSwitch}
          onCloseTab={closeTab}
          onCreateTab={createTab}
          onUpdateTab={updateTab}
        />
        
        <div className='tester-workspace'>
          <RequestPanel
            activeTab={activeTab}
            onUpdateTab={updateTab}
            onSend={handleSend}
            onSave={handleSaveEndpoint}
            isLoading={isLoading}
            onToggleHistory={() => setHistoryOpen(prev => !prev)}
            historyOpen={historyOpen}
          />
          
          <ResponsePanel
            response={response}
            isLoading={isLoading}
            getStatusCategory={getStatusCategory}
          />
        </div>
      </div>
    </div>
  );
}
