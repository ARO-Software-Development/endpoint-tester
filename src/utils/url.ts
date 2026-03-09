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
