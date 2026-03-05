export type HttpMethod = "GET" | "POST";
//    | 'PUT'
//    | 'DELETE'
//    | 'PATCH'

export type StatusCategories =
  | "success"
  | "redirect"
  | "client-error"
  | "server-error"
  | "network-error";

export const STATUS_LABELS: Record<number, string> = {
  200: "OK",
  201: "CREATED",
  202: "ACCEPTED",
  204: "NO CONTENT",
  301: "MOVED PERMANENTLY",
  302: "FOUND",
  304: "NOT MODIFIED",
  400: "BAD REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT FOUND",
  405: "METHOD NOT ALLOWED",
  409: "CONFLICT",
  422: "UNPROCESSABLE ENTITY",
  429: "TOO MANY REQUESTS",
  500: "INTERNAL SERVER ERROR",
  502: "BAD GATEWAY",
  503: "SERVICE UNAVAILABLE",
  504: "GATEWAY TIMEOUT",
};

export type Tab = {
  id: string;
  label: string;
  method: HttpMethod;
  url: string;
  headers: { key: string; value: string }[];
  body: string;
};

export type HistoryEntry = {
  id: string;
  tabId: string;
  timestamp: string;
  method: HttpMethod;
  url: string;
  headers: { key: string; value: string }[];
  body: string;
  responseStatus: number;
  responseTime: number;
};

const TABS_KEY = "daro_tabs";
const HISTORY_KEY = "daro_history";
const MAX_HISTORY = 5; // Limited for testing, real value set to 100-200

export function generateId(): string {
  return crypto.randomUUID();
}

export function getTabs(): Tab[] {
  const tab = localStorage.getItem(TABS_KEY);
  if (!tab) return [];
  return JSON.parse(tab) as Tab[];
}

export function saveTabs(tabs: Tab[]): void {
  localStorage.setItem(TABS_KEY, JSON.stringify(tabs));
}

export function getHistory(): HistoryEntry[] {
  const history = localStorage.getItem(HISTORY_KEY);
  if (!history) return [];
  return JSON.parse(history) as HistoryEntry[];
}

function pruneHistory(entries: HistoryEntry[]): HistoryEntry[] {
  if (entries.length <= MAX_HISTORY) return entries;
  return entries.slice(0, MAX_HISTORY);
}

export function saveHistory(entries: HistoryEntry[]): void {
  try {
    const pruned = pruneHistory(entries);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(pruned));
  } catch (error) {
    console.warn(
      "localStorage is full, clearing history to free up space",
      error,
    );
    const trimmed = entries.slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  }
}

export function getStatusLabel(status: number): string {
  return STATUS_LABELS[status] || status.toString();
}
