import { useState } from 'react';
import {
  type HistoryEntry,
  type HttpMethod,
  type RequestResponse,
  generateId,
} from '../utils/storage';
import { substitutePathParams } from '../utils/url';

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

  function calculateSize(headers: Headers, data: unknown): number {
    const contentLength = headers.get('content-length');
    if (contentLength) {
      return parseInt(contentLength, 10);
    }
    
    // Fallback calculation
    if (!data) return 0;
    if (typeof data === 'string') return new Blob([data]).size;
    if (typeof data === 'object') return new Blob([JSON.stringify(data)]).size;
    return 0;
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
    params: { key: string; value: string }[],
    pathParams: { key: string; value: string }[],
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
      params,
      pathParams,
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
    params: { key: string; value: string }[],
    pathParams: { key: string; value: string }[],
    headers: { key: string; value: string }[],
    body: string,
    addEntry: (entry: HistoryEntry) => void,
  ): Promise<RequestResponse | null> {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    const startTime = performance.now();
    const substitutedUrl = substitutePathParams(url, pathParams);
    let finalResponse: RequestResponse | null = null;

    try {
      const header = buildHeaders(headers);
      const options: RequestInit = {
        method,
        headers: header,
      };
      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim() !== '') {
        options.body = body;
      }

      const res = await fetch(substitutedUrl, options);
      const responseTime = performance.now() - startTime;
      const responseData = await parseResponseBody(res);
      const parseHeaders = parseResponseHeaders(res.headers);
      const size = calculateSize(res.headers, responseData);

      finalResponse = {
        status: res.status,
        statusText: res.statusText,
        responseTime,
        data: responseData,
        headers: parseHeaders,
        isError: false,
        size,
      };

      setResponse(finalResponse);

      logToHistory(
        addEntry,
        tabId,
        method,
        url,
        params,
        pathParams,
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
      finalResponse = {
        status: 0,
        statusText: 'Network Error',
        responseTime,
        data: null,
        headers: {},
        isError: true,
        errorMessage,
        size: 0,
      };
      
      setResponse(finalResponse);

      logToHistory(addEntry, tabId, method, url, params, pathParams, headers, body, 0, responseTime);
    } finally {
      setIsLoading(false);
    }
    return finalResponse;
  }

    function clearResponse(): void {
    setResponse(null);
    setError(null);
  }

  return {
    response,
    setResponse,
    isLoading,
    error,
    executeRequest,
    clearResponse,
  };
}
