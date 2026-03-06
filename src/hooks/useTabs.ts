import { useState, useEffect } from 'react';
import { type Tab, getTabs, saveTabs, generateId } from '../utils/storage';

function createDefaultTab(): Tab {
  return {
    id: generateId(),
    label: 'New Tab',
    method: 'GET',
    url: '',
    headers: [],
    body: '',
  };
}

export function useTabs() {
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const saved = getTabs();
    return saved.length > 0 ? saved : [createDefaultTab()];
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => {
    const saved = getTabs();
    return saved.length > 0 ? saved[0].id : '';
  });

  useEffect(() => {
    saveTabs(tabs);
  }, [tabs]);

  function createTab(): void {
    const newTab = createDefaultTab();
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }

  function closeTab(id: string): void {
    setTabs((prev) => {
      if (prev.length === 1) {
        const replacement = createDefaultTab();
        setActiveTabId(replacement.id);
        return [replacement];
      }

      const index = prev.findIndex((t) => t.id === id);
      const next = prev.filter((t) => t.id !== id);

      if (id === activeTabId) {
        const newActive = next[Math.max(0, index - 1)];
        setActiveTabId(newActive.id);
      }

      return next;
    });
  }

  function updateTab(id: string, changes: Partial<Tab>): void {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === id ? { ...tab, ...changes } : tab)),
    );
  }

  function getActiveTab(): Tab | undefined {
    return tabs.find((t) => t.id === activeTabId);
  }

  return {
    tabs,
    activeTabId,
    setActiveTabId,
    createTab,
    closeTab,
    updateTab,
    getActiveTab,
  };
}
