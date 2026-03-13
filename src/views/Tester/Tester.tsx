import { useState, useEffect, useMemo } from 'react';
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
    updateSavedEndpoint,
  } = useSavedEndpoints();
  
  const { response, setResponse, isLoading, executeRequest } = useRequest();
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  
  const activeTab = getActiveTab();
  const tabHistory = activeTab ? getHistoryByTab(activeTab.id) : [];

  // Sync response with active tab
  useEffect(() => {
    if (activeTab) {
      setResponse(activeTab.response || null);
    } else {
      setResponse(null);
    }
  }, [activeTabId, activeTab?.id, setResponse, activeTab]); // Only when tab changes

  // Dirty state detection
  const isDirty = useMemo(() => {
    if (!activeTab || !activeTab.savedId) return true;
    const saved = savedEndpoints.find(e => e.id === activeTab.savedId);
    if (!saved) return true;

    return (
      activeTab.method !== saved.method ||
      activeTab.url !== saved.url ||
      activeTab.body !== saved.body ||
      JSON.stringify(activeTab.params) !== JSON.stringify(saved.params) ||
      JSON.stringify(activeTab.pathParams) !== JSON.stringify(saved.pathParams) ||
      JSON.stringify(activeTab.headers) !== JSON.stringify(saved.headers) ||
      JSON.stringify(activeTab?.auth) !== JSON.stringify(saved.auth)
    );
  }, [activeTab, savedEndpoints]);

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

  async function handleSend(): Promise<void> {
    if (!activeTab || !activeTab.url.trim()) return;
    
    if (!validateUrl(activeTab.url.trim())) {
      toast.error('Invalid URL', {
        description: 'Please enter a valid URL (must start with http:// or https://)',
      });
      return;
    }

    const res = await executeRequest(
      activeTab.id,
      activeTab.method,
      activeTab.url,
      activeTab.params || [],
      activeTab.pathParams || [],
      activeTab.headers,
      activeTab.body,
      addEntry,
      activeTab.auth,
    );

    if (res) {
      updateTab(activeTab.id, { response: res });
    }
  }

  function handleSaveEndpoint(): void {
    if (!activeTab || !activeTab.url.trim()) return;

    if (activeTab.savedId) {
      const existing = savedEndpoints.find(e => e.id === activeTab.savedId);
      if (existing) {
        updateSavedEndpoint(activeTab.savedId, {
          method: activeTab.method,
          url: activeTab.url,
          params: activeTab.params || [],
          pathParams: activeTab.pathParams || [],
          headers: activeTab.headers,
          body: activeTab.body,
          name: activeTab.label || existing.name,
          auth: activeTab.auth,
        });
        toast.success('Endpoint updated successfully');
        return;
      }
    }

    const newId = generateId();
    const newSaved: SavedEndpoint = {
      id: newId,
      name: activeTab.label || 'Saved Endpoint',
      method: activeTab.method,
      url: activeTab.url,
      params: activeTab.params || [],
      pathParams: activeTab.pathParams || [],
      headers: activeTab.headers,
      body: activeTab.body,
    };

    saveEndpoint(newSaved);
    updateTab(activeTab.id, { savedId: newId });
    toast.success('Endpoint saved successfully');
  }

  function handleTabSwitch(id: string): void {
    setActiveTabId(id);
    // Response sync handled by useEffect
  }

  function handleReplay(tabId: string): void {
    const entry = history.find((tab) => tab.id === tabId);
    if (!entry) return;

    const targetTab = tabs.find((t) => t.id === entry.tabId);
    if (targetTab) {
      replayRequest(entry, updateTab);
      setActiveTabId(entry.tabId);
    } else {
      createTab();
      // Note: createTab sets activeTabId, but we might need to wait for it 
      // or handle it in useTabs. For now, this is existing logic.
      replayRequest({ ...entry, tabId: activeTabId }, updateTab);
    }
  }

  function handleReplaySaved(endpoint: SavedEndpoint): void {
    if (activeTab) {
      updateTab(activeTab.id, {
        method: endpoint.method,
        url: endpoint.url,
        params: endpoint.params || [],
        pathParams: endpoint.pathParams || [],
        headers: endpoint.headers,
        body: endpoint.body,
        label: endpoint.name,
        savedId: endpoint.id,
        response: null, // Clear response when loading a saved one
      });
    } else {
      createTab();
      // Future: implement logic to load into the newly created tab
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
        allEntries={history}
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
            isDirty={isDirty}
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

