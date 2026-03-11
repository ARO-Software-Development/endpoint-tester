import { useState, useEffect } from 'react';
import {
  type HistoryEntry,
  type StatusCategories,
  type Tab,
  getHistory,
  saveHistory,
} from '../utils/storage';

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    return getHistory();
  });

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  function addEntry(entry: HistoryEntry): void {
    setHistory((prev) => [entry, ...prev]);
  }

  function clearHistory(): void {
    setHistory([]);
  }

  function clearHistoryByTab(tabId: string): void {
    setHistory((prev) => prev.filter((entry) => entry.tabId !== tabId));
  }

  function getHistoryByTab(tabId: string): HistoryEntry[] {
    return history.filter((entry) => entry.tabId === tabId);
  }

  function deleteEntry(id: string): void {
    setHistory((prev) => prev.filter((entry) => entry.id !== id));
  }

  function replayRequest(
    entry: HistoryEntry,
    updateTab: (id: string, changes: Partial<Tab>) => void,
  ): void {
    updateTab(entry.tabId, {
      method: entry.method,
      url: entry.url,
      params: entry.params || [],
      pathParams: entry.pathParams || [],
      headers: entry.headers,
      body: entry.body,
    });
  }

  function getRecentHistory(limit: number = 10): HistoryEntry[] {
    return history.slice(0, limit);
  }

  function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute(s) ago`;
    if (diffHours < 24) return `${diffHours} hour(s) ago`;
    if (diffDays < 7) return `${diffDays} day(s) ago`;

    return date.toLocaleString();
  }

  function getStatusCategory(status: number): StatusCategories {
    if (status === 0) return 'network-error';
    if (status < 300) return 'success';
    if (status < 400) return 'redirect';
    if (status < 500) return 'client-error';
    return 'server-error';
  }

  return {
    history,
    addEntry,
    clearHistory,
    clearHistoryByTab,
    getHistoryByTab,
    deleteEntry,
    replayRequest,
    getRecentHistory,
    formatTimestamp,
    getStatusCategory,
  };
}
