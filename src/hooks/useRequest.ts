import { useState } from 'react';
import {
  type HistoryEntry,
  type HttpMethod,
  generateId,
} from '../utils/storage';

export type RequestResponse = {
  status: number;
  statusText: string;
  responseTime: number;
  data: unknown;
  headers: Record<string, string>;
  isError: boolean;
  errorMessage?: string;
};

export function useRequest() {
  const [response, setResponse] = useState<RequestResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  function parseResponseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  async function parseResponseBody(res: Response): Promise<unknown> {
    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      try {
        return await res.json();
      } catch {
        return await res.text();
      }
    }
    return await res.text();
  }

  function buildHeaders(
    headers: { key: string; value: string }[],
  ): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach(({ key, value }) => {
      if (key.trim() !== '') {
        result[key.trim()] = value.trim();
      }
    });
    return result;
  }

  function logToHistory(
    addEntry: (entry: HistoryEntry) => void,
    tabId: string,
    method: HttpMethod,
    url: string,
    headers: { key: string; value: string }[],
    body: string,
    responseStatus: number,
    responseTime: number,
  ): void {
    const newEntry: HistoryEntry = {
      id: generateId(),
      tabId,
      timestamp: new Date().toISOString(),
      method,
      url,
      headers,
      body,
      responseStatus,
      responseTime,
    };
    addEntry(newEntry);
  }

  async function executeRequest(
    tabId: string,
    method: HttpMethod,
    url: string,
    headers: { key: string; value: string }[],
    body: string,
    addEntry: (entry: HistoryEntry) => void,
  ): Promise<void> {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    const startTime = performance.now();

    try {
      const header = buildHeaders(headers);
      const options: RequestInit = {
        method,
        headers: header,
      };
      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim() !== '') {
        options.body = body;
      }

      const res = await fetch(url, options);
      const responseTime = performance.now() - startTime;
      const responseData = await parseResponseBody(res);
      const parseHeaders = parseResponseHeaders(res.headers);

      setResponse({
        status: res.status,
        statusText: res.statusText,
        responseTime,
        data: responseData,
        headers: parseHeaders,
        isError: false,
      });

      logToHistory(
        addEntry,
        tabId,
        method,
        url,
        headers,
        body,
        res.status,
        responseTime,
      );
    } catch (error) {
      const responseTime = performance.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unkown error occurred';

      setError(errorMessage);
      setResponse({
        status: 0,
        statusText: 'Network Error',
        responseTime,
        data: null,
        headers: {},
        isError: true,
        errorMessage,
      });

      logToHistory(addEntry, tabId, method, url, headers, body, 0, responseTime);
    } finally {
      setIsLoading(false);
    }
  }

  function clearResponse(): void {
    setResponse(null);
    setError(null);
  }

  return {
    response,
    isLoading,
    error,
    executeRequest,
    clearResponse,
  };
}
