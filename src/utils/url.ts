export function parseParamsFromUrl(url: string): { key: string; value: string }[] {
  try {
    const searchPart = url.split('?')[1];
    if (!searchPart) return [];

    const searchParams = new URLSearchParams(searchPart);
    const params: { key: string; value: string }[] = [];

    searchParams.forEach((value, key) => {
      params.push({ key, value });
    });

    return params;
  } catch {
    return [];
  }
}

export function parsePathParamsFromUrl(url: string, currentPathParams: { key: string; value: string }[]): { key: string; value: string }[] {
  try {
    const [baseUrl] = url.split('?');
    const segments = baseUrl.split('/');
    const detectedKeys: string[] = [];

    segments.forEach(segment => {
      if (segment.startsWith(':') && segment.length > 1) {
        // Extract the key, removing any trailing characters that aren't part of the key
        // (e.g., in /:id/posts, it should be 'id')
        const key = segment.substring(1);
        detectedKeys.push(key);
      }
    });

    // Deduplicate keys
    const uniqueKeys = Array.from(new Set(detectedKeys));

    // Preserve existing values for keys that are still present
    return uniqueKeys.map(key => {
      const existing = (currentPathParams || []).find(p => p.key === key);
      return existing ? existing : { key, value: '' };
    });
  } catch {
    return [];
  }
}

export function stringifyParamsToUrl(baseUrl: string, params: { key: string; value: string }[]): string {
  try {
    const [base] = baseUrl.split('?');
    const searchParams = new URLSearchParams();

    params.forEach(({ key, value }) => {
      if (key.trim() !== '') {
        searchParams.append(key.trim(), value.trim());
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${base}?${queryString}` : base;
  } catch {
    return baseUrl;
  }
}

/**
 * Substitutes path parameters (e.g., :id) with their values for the actual request.
 */
export function substitutePathParams(url: string, pathParams: { key: string; value: string }[]): string {
  let substitutedUrl = url;
  
  pathParams.forEach(({ key, value }) => {
    if (key.trim() !== '') {
      // Use regex to replace :key with value, ensuring it matches the whole segment
      // This matches :key when followed by /, ?, or end of string
      const regex = new RegExp(`:${key}(?=/|\\?|$)`, 'g');
      substitutedUrl = substitutedUrl.replace(regex, value.trim() || `:${key}`);
    }
  });
  
  return substitutedUrl;
}
